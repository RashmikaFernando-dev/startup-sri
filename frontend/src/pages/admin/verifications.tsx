import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import {
  Box, Typography, Button, Avatar, Alert,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Divider, Stack, CircularProgress,
} from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CancelIcon from '@mui/icons-material/Cancel'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import AdminNavbar from '@/components/admin/AdminNavbar'
import AdminSidebar from '@/components/admin/AdminSidebar'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'


const CONTENT_LEFT = 240

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

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  pending:  { bg: '#fef3c7', text: '#92400e' },
  approved: { bg: '#d1fae5', text: '#065f46' },
  rejected: { bg: '#fee2e2', text: '#991b1b' },
}

const FILTER_TABS = ['pending', 'approved', 'rejected', 'all']

function DocumentThumb({ src, label }: { src: string; label: string }) {
  if (!src) return null
  const isImage = src.startsWith('data:image') || /\.(jpg|jpeg|png|gif|webp)$/i.test(src)
  return (
    <Box>
      <Typography sx={{ fontSize: 12, color: '#9ca3af', mb: 0.5 }}>{label}</Typography>
      {isImage ? (
        <Box
          component="img"
          src={src}
          alt={label}
          sx={{ width: 160, height: 110, objectFit: 'cover', borderRadius: 2, border: '1px solid #e5e7eb', cursor: 'pointer' }}
          onClick={() => window.open(src, '_blank')}
        />
      ) : (
        <Button size="small" variant="outlined" startIcon={<OpenInNewIcon />} onClick={() => window.open(src, '_blank')}
          sx={{ textTransform: 'none', borderRadius: 1.5 }}>
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
      const url = `${API_BASE}/kyc/admin/list${statusFilter && statusFilter !== 'all' ? `?status=${statusFilter}` : ''}`
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token()}` } })
      const data = await res.json()
      if (data.success) setRecords(data.data)
    } catch {} finally { setLoading(false) }
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
      const res = await fetch(`${API_BASE}/kyc/admin/${selected!._id}/review`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
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

      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f9fafb' }}>
        <AdminSidebar activeKey="kyc" />

        <Box sx={{ flex: 1, ml: { xs: 0, md: `${CONTENT_LEFT}px` }, display: 'flex', flexDirection: 'column' }}>
          <AdminNavbar
            admin={admin}
            onLogout={handleLogout}
            pageTitle="KYC Review"
            pageSubtitle="Review entrepreneur identity verification submissions"
          />

          <Box sx={{ flex: 1, px: { xs: 2, md: 4 }, pt: '80px', pb: 6 }}>

            {/* Filter tabs */}
            <Box sx={{ display: 'flex', gap: 1, mt: 3, mb: 3 }}>
              {FILTER_TABS.map(tab => (
                <Box
                  key={tab}
                  onClick={() => setStatusFilter(tab)}
                  sx={{
                    px: 2.5, py: 1, borderRadius: 2, cursor: 'pointer', fontSize: 13, fontWeight: 600,
                    bgcolor: statusFilter === tab ? '#111827' : '#fff',
                    color: statusFilter === tab ? '#fff' : '#6b7280',
                    border: '1px solid',
                    borderColor: statusFilter === tab ? '#111827' : '#e5e7eb',
                    textTransform: 'capitalize',
                    transition: 'all 0.15s',
                    '&:hover': { borderColor: '#111827', color: statusFilter === tab ? '#fff' : '#111827' },
                  }}
                >
                  {tab === 'all' ? 'All' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                </Box>
              ))}
            </Box>

            {/* Records table */}
            <Box sx={{ bgcolor: '#fff', borderRadius: 2.5, border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse' }}>
                <Box component="thead">
                  <Box component="tr" sx={{ bgcolor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                    {['Applicant', 'NIC', 'Submitted', 'Submissions', 'Status', 'Actions'].map(h => (
                      <Box component="th" key={h} sx={{ px: 3, py: 1.8, textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {h}
                      </Box>
                    ))}
                  </Box>
                </Box>

                <Box component="tbody">
                  {loading ? (
                    <Box component="tr">
                      <Box component="td" colSpan={6} sx={{ px: 3, py: 6, textAlign: 'center' }}>
                        <CircularProgress size={28} sx={{ color: '#9ca3af' }} />
                      </Box>
                    </Box>
                  ) : records.length === 0 ? (
                    <Box component="tr">
                      <Box component="td" colSpan={6} sx={{ px: 3, py: 6, textAlign: 'center', color: '#9ca3af', fontSize: 14 }}>
                        No {statusFilter !== 'all' ? statusFilter : ''} KYC submissions found.
                      </Box>
                    </Box>
                  ) : records.map((rec, idx, arr) => {
                    const sc = STATUS_COLORS[rec.status] ?? { bg: '#f3f4f6', text: '#374151' }
                    return (
                      <Box component="tr" key={rec._id} sx={{
                        borderBottom: idx < arr.length - 1 ? '1px solid #f3f4f6' : 'none',
                        '&:hover': { bgcolor: '#fafafa' },
                        transition: 'background 0.12s',
                      }}>
                        <Box component="td" sx={{ px: 3, py: 2.5 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Avatar sx={{ bgcolor: '#111827', width: 34, height: 34, fontSize: 13, fontWeight: 700 }}>
                              {rec.user?.firstName?.[0]}{rec.user?.lastName?.[0]}
                            </Avatar>
                            <Box>
                              <Typography sx={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>
                                {rec.user?.firstName} {rec.user?.lastName}
                              </Typography>
                              <Typography sx={{ fontSize: 12, color: '#9ca3af' }}>{rec.user?.email}</Typography>
                            </Box>
                          </Box>
                        </Box>
                        <Box component="td" sx={{ px: 3, py: 2.5, fontSize: 13, color: '#374151' }}>{rec.nic}</Box>
                        <Box component="td" sx={{ px: 3, py: 2.5, fontSize: 13, color: '#9ca3af', whiteSpace: 'nowrap' }}>
                          {new Date(rec.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </Box>
                        <Box component="td" sx={{ px: 3, py: 2.5, fontSize: 13, color: '#374151' }}>
                          {rec.submissionCount > 1 ? (
                            <Box sx={{ display: 'inline-flex', bgcolor: '#fef3c7', color: '#92400e', fontSize: 12, fontWeight: 700, px: 1.5, py: 0.4, borderRadius: 10 }}>
                              #{rec.submissionCount}
                            </Box>
                          ) : '1'}
                        </Box>
                        <Box component="td" sx={{ px: 3, py: 2.5 }}>
                          <Box sx={{ display: 'inline-flex', bgcolor: sc.bg, color: sc.text, fontSize: 12, fontWeight: 700, px: 1.5, py: 0.4, borderRadius: 10, textTransform: 'capitalize' }}>
                            {rec.status}
                          </Box>
                        </Box>
                        <Box component="td" sx={{ px: 3, py: 2.5 }}>
                          {rec.status === 'pending' ? (
                            <Button
                              size="small"
                              variant="contained"
                              onClick={() => handleOpenReview(rec)}
                              sx={{ bgcolor: '#111827', borderRadius: 1.5, textTransform: 'none', fontWeight: 700, fontSize: 12, '&:hover': { bgcolor: '#1f2937' } }}
                            >
                              Review
                            </Button>
                          ) : (
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => handleOpenReview(rec)}
                              sx={{ borderRadius: 1.5, textTransform: 'none', fontSize: 12, borderColor: '#e5e7eb', color: '#6b7280', '&:hover': { borderColor: '#9ca3af', color: '#111827' } }}
                            >
                              View
                            </Button>
                          )}
                        </Box>
                      </Box>
                    )
                  })}
                </Box>
              </Box>
            </Box>

            {!loading && records.length > 0 && (
              <Typography sx={{ mt: 2, fontSize: 13, color: '#9ca3af' }}>
                {records.length} record{records.length !== 1 ? 's' : ''} found
              </Typography>
            )}
          </Box>
        </Box>
      </Box>

      {/* Review Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 800, color: '#111827', display: 'flex', alignItems: 'center', gap: 1.5 }}>
          KYC Review — {selected?.user?.firstName} {selected?.user?.lastName}
          {selected && (
            <Box sx={{ display: 'inline-flex', bgcolor: STATUS_COLORS[selected.status]?.bg, color: STATUS_COLORS[selected.status]?.text, fontSize: 12, fontWeight: 700, px: 1.5, py: 0.4, borderRadius: 10, textTransform: 'capitalize' }}>
              {selected.status}
            </Box>
          )}
        </DialogTitle>

        <DialogContent dividers>
          {selected && (
            <Stack spacing={2.5}>
              {/* Personal info */}
              <Box>
                <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#111827', mb: 1.5 }}>Personal Information</Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                  <Box sx={{ bgcolor: '#f9fafb', borderRadius: 1.5, p: 2 }}>
                    <Typography sx={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, mb: 0.3 }}>NIC</Typography>
                    <Typography sx={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>{selected.nic}</Typography>
                  </Box>
                  <Box sx={{ bgcolor: '#f9fafb', borderRadius: 1.5, p: 2 }}>
                    <Typography sx={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, mb: 0.3 }}>Date of Birth</Typography>
                    <Typography sx={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>
                      {selected.dateOfBirth ? new Date(selected.dateOfBirth).toLocaleDateString() : '—'}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ bgcolor: '#f9fafb', borderRadius: 1.5, p: 2, mt: 1.5 }}>
                  <Typography sx={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, mb: 0.3 }}>Address</Typography>
                  <Typography sx={{ fontSize: 14, color: '#111827' }}>{selected.address}</Typography>
                </Box>
              </Box>

              <Divider />

              {/* Documents */}
              <Box>
                <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#111827', mb: 1.5 }}>Documents</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  <DocumentThumb src={selected.nicFrontImage} label="NIC Front" />
                  <DocumentThumb src={selected.nicBackImage} label="NIC Back" />
                  <DocumentThumb src={selected.proofOfAddressImage} label="Proof of Address" />
                  {selected.businessRegImage && <DocumentThumb src={selected.businessRegImage} label="Business Reg." />}
                </Box>
              </Box>

              {/* Decision controls (only if pending) */}
              {selected.status === 'pending' && (
                <>
                  <Divider />
                  <Box>
                    <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#111827', mb: 1.5 }}>Decision</Typography>
                    {reviewError && <Alert severity="error" sx={{ mb: 1.5, borderRadius: 1.5 }}>{reviewError}</Alert>}
                    <Box sx={{ display: 'flex', gap: 1.5, mb: 2 }}>
                      <Button
                        variant={reviewAction === 'approved' ? 'contained' : 'outlined'}
                        startIcon={<CheckCircleIcon />}
                        onClick={() => setReviewAction('approved')}
                        sx={{
                          borderRadius: 1.5, textTransform: 'none', fontWeight: 700,
                          ...(reviewAction === 'approved'
                            ? { bgcolor: '#059669', '&:hover': { bgcolor: '#047857' } }
                            : { borderColor: '#e5e7eb', color: '#374151' }),
                        }}
                      >
                        Approve
                      </Button>
                      <Button
                        variant={reviewAction === 'rejected' ? 'contained' : 'outlined'}
                        startIcon={<CancelIcon />}
                        onClick={() => setReviewAction('rejected')}
                        sx={{
                          borderRadius: 1.5, textTransform: 'none', fontWeight: 700,
                          ...(reviewAction === 'rejected'
                            ? { bgcolor: '#ef4444', '&:hover': { bgcolor: '#dc2626' } }
                            : { borderColor: '#e5e7eb', color: '#374151' }),
                        }}
                      >
                        Reject
                      </Button>
                    </Box>
                    {reviewAction === 'rejected' && (
                      <TextField
                        label="Rejection Reason"
                        multiline
                        rows={3}
                        fullWidth
                        value={rejectionReason}
                        onChange={e => setRejectionReason(e.target.value)}
                        placeholder="Explain why the KYC was rejected…"
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
                      />
                    )}
                  </Box>
                </>
              )}

              {/* Already reviewed */}
              {selected.status !== 'pending' && selected.reviewedAt && (
                <>
                  <Divider />
                  <Box>
                    <Typography sx={{ fontSize: 12, color: '#9ca3af' }}>
                      Reviewed by {selected.reviewedBy?.firstName} {selected.reviewedBy?.lastName} on {new Date(selected.reviewedAt).toLocaleString()}
                    </Typography>
                    {selected.status === 'rejected' && selected.rejectionReason && (
                      <Alert severity="error" sx={{ mt: 1, borderRadius: 1.5 }}>Reason: {selected.rejectionReason}</Alert>
                    )}
                  </Box>
                </>
              )}
            </Stack>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setDialogOpen(false)} sx={{ textTransform: 'none', color: '#6b7280' }}>Close</Button>
          {selected?.status === 'pending' && (
            <Button
              variant="contained"
              onClick={handleSubmitReview}
              disabled={submitting}
              startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : null}
              sx={{ bgcolor: '#111827', borderRadius: 1.5, textTransform: 'none', fontWeight: 700, '&:hover': { bgcolor: '#1f2937' } }}
            >
              {submitting ? 'Saving…' : 'Submit Decision'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  )
}
