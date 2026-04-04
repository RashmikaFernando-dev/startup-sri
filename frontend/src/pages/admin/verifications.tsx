import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import {
  Box,
  Typography,
  Chip,
  CircularProgress,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Divider,
  Stack,
  Avatar,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material'
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CancelIcon from '@mui/icons-material/Cancel'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import AdminNavbar from '@/components/admin/AdminNavbar'
import AdminSidebar from '@/components/admin/AdminSidebar'

interface KycRecord {
  _id: string
  user: { _id: string; firstName: string; lastName: string; email: string }
  nic: string
  dateOfBirth: string
  address: string
  nicFrontImage: string
  nicBackImage: string
  proofOfAddressImage: string
  businessRegImage?: string
  status: 'pending' | 'approved' | 'rejected'
  rejectionReason?: string
  submissionCount: number
  createdAt: string
  reviewedAt?: string
  reviewedBy?: { firstName: string; lastName: string }
}

const STATUS_COLOR: Record<string, 'default' | 'warning' | 'success' | 'error'> = {
  pending: 'warning',
  approved: 'success',
  rejected: 'error',
}

function DocumentThumb({ src, label }: { src: string; label: string }) {
  if (!src) return null
  const isImage = src.startsWith('data:image')
  return (
    <Box>
      <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>{label}</Typography>
      {isImage ? (
        <Box
          component="img"
          src={src}
          alt={label}
          sx={{
            width: 160, height: 120, objectFit: 'cover',
            borderRadius: 2, border: '1px solid #e0e0e0',
            cursor: 'pointer',
          }}
          onClick={() => window.open(src, '_blank')}
        />
      ) : (
        <Button size="small" variant="outlined" startIcon={<OpenInNewIcon />} onClick={() => window.open(src, '_blank')}>
          View {label}
        </Button>
      )}
    </Box>
  )
}

export default function AdminKycReview() {
  const router = useRouter()
  const [admin, setAdmin] = useState<any>(null)
  const [records, setRecords] = useState<KycRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>('pending')
  const [selected, setSelected] = useState<KycRecord | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [reviewAction, setReviewAction] = useState<'approved' | 'rejected' | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [reviewError, setReviewError] = useState<string | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem('adminUser')
    const tok = localStorage.getItem('adminToken')
    if (!stored || !tok) { router.push('/admin/login'); return }
    const u = JSON.parse(stored)
    if (u.role !== 'admin') { router.push('/admin/login'); return }
    setAdmin(u)
  }, [])

  useEffect(() => {
    if (!admin) return
    fetchRecords()
  }, [admin, statusFilter])

  const token = () => localStorage.getItem('adminToken')

  const fetchRecords = async () => {
    setLoading(true)
    try {
      const url = `http://localhost:5000/api/kyc/admin/list${statusFilter ? `?status=${statusFilter}` : ''}`
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token()}` } })
      const data = await res.json()
      if (data.success) setRecords(data.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenReview = (record: KycRecord) => {
    setSelected(record)
    setReviewAction(null)
    setRejectionReason('')
    setReviewError(null)
    setDialogOpen(true)
  }

  const handleSubmitReview = async () => {
    if (!reviewAction) { setReviewError('Please select Approve or Reject.'); return }
    if (reviewAction === 'rejected' && !rejectionReason.trim()) {
      setReviewError('Please provide a rejection reason.'); return
    }
    setReviewError(null)
    setSubmitting(true)
    try {
      const res = await fetch(`http://localhost:5000/api/kyc/admin/${selected!._id}/review`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token()}`,
        },
        body: JSON.stringify({ status: reviewAction, rejectionReason: rejectionReason.trim() || undefined }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.message)
      setDialogOpen(false)
      fetchRecords()
    } catch (err: any) {
      setReviewError(err.message || 'Review failed')
    } finally {
      setSubmitting(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminUser')
    router.push('/admin/login')
  }

  return (
    <>
      <Head><title>KYC Review – Admin | StartupSri</title></Head>
      <Box sx={{
        minHeight: '100vh',
        background: 'linear-gradient(95deg, #101224 0%, #22274a 100%)',
        display: 'flex',
        flexDirection: 'column',
      }}>
        <AdminNavbar admin={admin} onLogout={handleLogout} />

        <Box sx={{
          flex: 1,
          display: 'flex',
          maxWidth: '100%',
          mx: 0,
          width: '100%',
          px: 0,
          py: { xs: 3, md: 4 },
          gap: 2,
          bgcolor: { xs: 'transparent', md: '#0d1329' },
          borderRadius: 0,
          boxShadow: { xs: 'none', md: '0 20px 40px rgba(7, 12, 22, 0.22)' },
        }}>
          <AdminSidebar activeKey="kyc" />

          <Box sx={{
            flex: 1,
            minWidth: 0,
            bgcolor: '#d5dae3',
            borderRadius: 0,
            p: { xs: 0, md: 3 },
          }}>
            <Stack direction="row" alignItems="center" spacing={1.5} mb={1}>
              <VerifiedUserIcon sx={{ color: '#0a1940' }} />
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#0a1940' }}>KYC Review</Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary" mb={3}>
              Review entrepreneur identity verification submissions
            </Typography>

            {/* Filter */}
            <ToggleButtonGroup
              value={statusFilter}
              exclusive
              onChange={(_, val) => { if (val !== null) setStatusFilter(val) }}
              size="small"
              sx={{ mb: 3 }}
            >
              <ToggleButton value="pending">Pending</ToggleButton>
              <ToggleButton value="approved">Approved</ToggleButton>
              <ToggleButton value="rejected">Rejected</ToggleButton>
              <ToggleButton value="">All</ToggleButton>
            </ToggleButtonGroup>

            {loading ? (
              <Box display="flex" justifyContent="center" py={6}><CircularProgress /></Box>
            ) : records.length === 0 ? (
              <Alert severity="info">No {statusFilter} KYC submissions found.</Alert>
            ) : (
              <Stack spacing={2}>
                {records.map(rec => (
                  <Box
                    key={rec._id}
                    sx={{
                      bgcolor: '#fff', borderRadius: 3, border: '1px solid #e5e7eb',
                      p: 2.5, display: 'flex', alignItems: 'center', gap: 2,
                    }}
                  >
                    <Avatar sx={{ bgcolor: '#0a1940', width: 44, height: 44 }}>
                      {rec.user?.firstName?.[0]}{rec.user?.lastName?.[0]}
                    </Avatar>
                    <Box flex={1} minWidth={0}>
                      <Typography fontWeight={600}>
                        {rec.user?.firstName} {rec.user?.lastName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">{rec.user?.email}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        NIC: {rec.nic} · Submitted {new Date(rec.createdAt).toLocaleDateString()}
                        {rec.submissionCount > 1 && ` · Resubmission #${rec.submissionCount}`}
                      </Typography>
                      {rec.status === 'rejected' && rec.rejectionReason && (
                        <Typography variant="caption" color="error.main" display="block">
                          Reason: {rec.rejectionReason}
                        </Typography>
                      )}
                    </Box>
                    <Chip
                      label={rec.status.charAt(0).toUpperCase() + rec.status.slice(1)}
                      color={STATUS_COLOR[rec.status]}
                      size="small"
                      sx={{ mr: 1 }}
                    />
                    {rec.status === 'pending' && (
                      <Button
                        variant="contained"
                        size="small"
                        sx={{ bgcolor: '#111111', '&:hover': { bgcolor: '#000000' }, whiteSpace: 'nowrap' }}
                        onClick={() => handleOpenReview(rec)}
                      >
                        Review
                      </Button>
                    )}
                    {rec.status !== 'pending' && (
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleOpenReview(rec)}
                        sx={{ whiteSpace: 'nowrap' }}
                      >
                        View
                      </Button>
                    )}
                  </Box>
                ))}
              </Stack>
            )}
          </Box>
        </Box>
      </Box>

      {/* Review Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          KYC Review — {selected?.user?.firstName} {selected?.user?.lastName}
          <Chip
            label={selected?.status}
            color={selected ? STATUS_COLOR[selected.status] : 'default'}
            size="small"
            sx={{ ml: 1.5 }}
          />
        </DialogTitle>
        <DialogContent dividers>
          {selected && (
            <Stack spacing={2}>
              {/* Personal info */}
              <Box>
                <Typography variant="subtitle2" fontWeight={700} mb={1}>Personal Information</Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <Box flex={1}>
                    <Typography variant="caption" color="text.secondary">NIC</Typography>
                    <Typography>{selected.nic}</Typography>
                  </Box>
                  <Box flex={1}>
                    <Typography variant="caption" color="text.secondary">Date of Birth</Typography>
                    <Typography>{selected.dateOfBirth ? new Date(selected.dateOfBirth).toLocaleDateString() : '—'}</Typography>
                  </Box>
                </Stack>
                <Box mt={1}>
                  <Typography variant="caption" color="text.secondary">Address</Typography>
                  <Typography>{selected.address}</Typography>
                </Box>
              </Box>

              <Divider />

              {/* Documents */}
              <Box>
                <Typography variant="subtitle2" fontWeight={700} mb={2}>Documents</Typography>
                <Stack direction="row" flexWrap="wrap" gap={2}>
                  <DocumentThumb src={selected.nicFrontImage} label="NIC Front" />
                  <DocumentThumb src={selected.nicBackImage} label="NIC Back" />
                  <DocumentThumb src={selected.proofOfAddressImage} label="Proof of Address" />
                  {selected.businessRegImage && <DocumentThumb src={selected.businessRegImage} label="Business Reg." />}
                </Stack>
              </Box>

              {/* Only show review controls if still pending */}
              {selected.status === 'pending' && (
                <>
                  <Divider />
                  <Box>
                    <Typography variant="subtitle2" fontWeight={700} mb={1.5}>Decision</Typography>
                    {reviewError && <Alert severity="error" sx={{ mb: 1.5 }}>{reviewError}</Alert>}
                    <Stack direction="row" spacing={2} mb={2}>
                      <Button
                        variant={reviewAction === 'approved' ? 'contained' : 'outlined'}
                        color="success"
                        startIcon={<CheckCircleIcon />}
                        onClick={() => setReviewAction('approved')}
                      >
                        Approve
                      </Button>
                      <Button
                        variant={reviewAction === 'rejected' ? 'contained' : 'outlined'}
                        color="error"
                        startIcon={<CancelIcon />}
                        onClick={() => setReviewAction('rejected')}
                      >
                        Reject
                      </Button>
                    </Stack>
                    {reviewAction === 'rejected' && (
                      <TextField
                        label="Rejection Reason"
                        multiline
                        rows={3}
                        fullWidth
                        value={rejectionReason}
                        onChange={e => setRejectionReason(e.target.value)}
                        placeholder="Explain why the KYC was rejected…"
                      />
                    )}
                  </Box>
                </>
              )}

              {/* Show review result for already reviewed */}
              {selected.status !== 'pending' && selected.reviewedAt && (
                <>
                  <Divider />
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Reviewed by {selected.reviewedBy?.firstName} {selected.reviewedBy?.lastName} on {new Date(selected.reviewedAt).toLocaleString()}
                    </Typography>
                    {selected.status === 'rejected' && selected.rejectionReason && (
                      <Alert severity="error" sx={{ mt: 1 }}>Reason: {selected.rejectionReason}</Alert>
                    )}
                  </Box>
                </>
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Close</Button>
          {selected?.status === 'pending' && (
            <Button
              variant="contained"
              onClick={handleSubmitReview}
              disabled={submitting}
              startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : null}
              sx={{ bgcolor: '#111111', '&:hover': { bgcolor: '#000000' } }}
            >
              {submitting ? 'Saving…' : 'Submit Decision'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  )
}
