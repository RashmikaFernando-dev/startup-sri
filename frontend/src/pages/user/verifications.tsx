import { useState, useEffect, useRef } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import {
  Box,
  Typography,
  Button,
  TextField,
  Alert,
  CircularProgress,
  Paper,
  Stack,
  Divider,
} from '@mui/material'
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser'
import UploadFileIcon from '@mui/icons-material/UploadFile'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'
import BadgeIcon from '@mui/icons-material/Badge'
import FlipIcon from '@mui/icons-material/Flip'
import HomeWorkIcon from '@mui/icons-material/HomeWork'
import UserNavbar from '@/components/user/UserNavbar'
import api from '@/utils/api'

interface KycRecord {
  _id: string
  status: 'pending' | 'approved' | 'rejected'
  rejectionReason?: string
  submissionCount: number
  createdAt: string
  reviewedAt?: string
}

// Only the 3 fields required from both roles
const FILE_FIELDS = [
  {
    key: 'nicFrontImage',
    label: 'NIC Front',
    hint: 'Clear photo of the front side of your National Identity Card',
    icon: <BadgeIcon sx={{ fontSize: 28, color: '#6366f1' }} />,
    iconBg: '#ede9fe',
  },
  {
    key: 'nicBackImage',
    label: 'NIC Back',
    hint: 'Clear photo of the back side of your National Identity Card',
    icon: <FlipIcon sx={{ fontSize: 28, color: '#3b82f6' }} />,
    iconBg: '#dbeafe',
  },
  {
    key: 'proofOfAddressImage',
    label: 'Proof of Address',
    hint: 'Utility bill, bank statement or similar document (max 3 months old)',
    icon: <HomeWorkIcon sx={{ fontSize: 28, color: '#10b981' }} />,
    iconBg: '#d1fae5',
  },
]

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function StatusBanner({ kyc, role }: { kyc: KycRecord; role: string }) {
  if (kyc.status === 'approved') {
    return (
      <Alert icon={<CheckCircleIcon />} severity="success" sx={{ mb: 3, borderRadius: 2 }}>
        <Typography fontWeight={700}>KYC Approved</Typography>
        <Typography variant="body2">
          {role === 'investor'
            ? 'Your identity has been verified. You can now invest in projects.'
            : 'Your identity has been verified. You can now submit projects for funding.'}
        </Typography>
      </Alert>
    )
  }
  if (kyc.status === 'pending') {
    return (
      <Alert icon={<HourglassEmptyIcon />} severity="info" sx={{ mb: 3, borderRadius: 2 }}>
        <Typography fontWeight={700}>Under Review</Typography>
        <Typography variant="body2">
          Your documents have been submitted and are awaiting admin review. This usually takes 1–2 business days.
        </Typography>
      </Alert>
    )
  }
  return (
    <Alert icon={<ErrorOutlineIcon />} severity="error" sx={{ mb: 3, borderRadius: 2 }}>
      <Typography fontWeight={700}>KYC Rejected</Typography>
      {kyc.rejectionReason && (
        <Typography variant="body2">Reason: {kyc.rejectionReason}</Typography>
      )}
      <Typography variant="body2" mt={0.5}>
        Please correct the issues and resubmit your documents below.
      </Typography>
    </Alert>
  )
}

export default function KycVerificationPage() {
  const router = useRouter()
  const [user, setUser] = useState<{ id: string; firstName: string; lastName: string; email: string; role: string } | null>(null)
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [existingKyc, setExistingKyc] = useState<KycRecord | null>(null)
  const [loadingStatus, setLoadingStatus] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [nic, setNic] = useState('')
  const [dob, setDob] = useState('')
  const [address, setAddress] = useState('')
  const [files, setFiles] = useState<Record<string, string | null>>({
    nicFrontImage: null,
    nicBackImage: null,
    proofOfAddressImage: null,
  })
  const [previews, setPreviews] = useState<Record<string, string | null>>({
    nicFrontImage: null,
    nicBackImage: null,
    proofOfAddressImage: null,
  })
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({})

  useEffect(() => {
    const stored = localStorage.getItem('user')
    const token = localStorage.getItem('token')
    if (!stored || !token) { router.push('/auth/login'); return }
    const parsed = JSON.parse(stored)
    if (!['entrepreneur', 'investor'].includes(parsed.role)) { router.push('/user/dashboard'); return }
    setUser(parsed)
    const img = localStorage.getItem(`profileImage_${parsed.id}`)
    if (img) setProfileImage(img)

    api.get('/kyc/my')
      .then(r => setExistingKyc(r.data.data))
      .catch(err => { if (err.response?.status !== 404) console.error(err) })
      .finally(() => setLoadingStatus(false))
  }, [])

  const handleFileChange = async (key: string, file: File | null) => {
    if (!file) return
    const b64 = await fileToBase64(file)
    setFiles(f => ({ ...f, [key]: b64 }))
    setPreviews(p => ({ ...p, [key]: b64 }))
  }

  const handleSubmit = async () => {
    if (!nic.trim())              { setError('NIC number is required.'); return }
    if (!dob)                     { setError('Date of birth is required.'); return }
    if (!address.trim())          { setError('Residential address is required.'); return }
    if (!files.nicFrontImage)     { setError('NIC front image is required.'); return }
    if (!files.nicBackImage)      { setError('NIC back image is required.'); return }
    if (!files.proofOfAddressImage) { setError('Proof of address is required.'); return }

    setError(null)
    setSubmitting(true)
    try {
      await api.post('/kyc/submit', {
        nic: nic.trim(),
        dateOfBirth: dob,
        address: address.trim(),
        nicFrontImage: files.nicFrontImage,
        nicBackImage: files.nicBackImage,
        proofOfAddressImage: files.proofOfAddressImage,
        businessRegImage: null,
      })
      setSuccess(true)
      const r = await api.get('/kyc/my')
      setExistingKyc(r.data.data)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Submission failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const canResubmit = !existingKyc || existingKyc.status === 'rejected'
  const showForm = canResubmit && !success

  if (loadingStatus) {
    return (
      <Box minHeight="100vh" display="flex" alignItems="center" justifyContent="center">
        <CircularProgress />
      </Box>
    )
  }

  return (
    <>
      <Head><title>Identity Verification | StartupSri</title></Head>
      <UserNavbar
        user={user}
        profileImage={profileImage}
        onLogout={() => { localStorage.removeItem('token'); localStorage.removeItem('user'); router.push('/') }}
        onBack={() => router.back()}
        backLabel="KYC Verification"
      />

      <Box sx={{ minHeight: '100vh', bgcolor: '#f7f8fa', py: 6, px: 2 }}>
        <Box sx={{ maxWidth: 620, mx: 'auto' }}>

          {/* Page header */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box sx={{
              width: 64, height: 64, borderRadius: '50%',
              bgcolor: '#0a1940', display: 'flex', alignItems: 'center',
              justifyContent: 'center', mx: 'auto', mb: 2,
            }}>
              <VerifiedUserIcon sx={{ fontSize: 30, color: '#fff' }} />
            </Box>
            <Typography variant="h4" fontWeight={800} color="#0a1940" sx={{ letterSpacing: '-0.02em' }}>
              Identity Verification
            </Typography>
            <Typography color="text.secondary" mt={1}>
              {user?.role === 'investor'
                ? 'Verify your identity to start investing in projects on StartupSri.'
                : 'Verify your identity to submit projects for funding on StartupSri.'}
            </Typography>
          </Box>

          {/* Status banner */}
          {existingKyc && <StatusBanner kyc={existingKyc} role={user?.role ?? ''} />}

          {/* Success state */}
          {success && (
            <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
              <Typography fontWeight={700}>Documents submitted successfully!</Typography>
              <Typography variant="body2">
                Your KYC is now pending admin review. You will be notified once approved.
              </Typography>
            </Alert>
          )}

          {/* Form */}
          {showForm && (
            <Paper elevation={0} sx={{ border: '1px solid #e5e7eb', borderRadius: 3, overflow: 'hidden' }}>

              {/* Section: Personal Information */}
              <Box sx={{ px: 3, pt: 3, pb: 2 }}>
                <Typography variant="h6" fontWeight={700} color="#0a1940" mb={2.5}>
                  Personal Information
                </Typography>

                {error && (
                  <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>{error}</Alert>
                )}

                <Stack spacing={2.5}>
                  <TextField
                    label="NIC Number"
                    value={nic}
                    onChange={e => setNic(e.target.value)}
                    required
                    fullWidth
                    placeholder="e.g. 901234567V or 199012345678"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: '#fafafa' } }}
                  />
                  <TextField
                    label="Date of Birth"
                    type="date"
                    value={dob}
                    onChange={e => setDob(e.target.value)}
                    required
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: '#fafafa' } }}
                  />
                  <TextField
                    label="Residential Address"
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    required
                    fullWidth
                    multiline
                    rows={2}
                    placeholder="Full residential address"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: '#fafafa' } }}
                  />
                </Stack>
              </Box>

              <Divider />

              {/* Section: Document Upload */}
              <Box sx={{ px: 3, pt: 3, pb: 3 }}>
                <Typography variant="h6" fontWeight={700} color="#0a1940" mb={0.5}>
                  Document Upload
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={3}>
                  Accepted formats: JPG, PNG, PDF · Max 5 MB per file · All 3 documents required
                </Typography>

                <Stack spacing={2}>
                  {FILE_FIELDS.map(field => {
                    const hasFile = !!previews[field.key]
                    const isImage = previews[field.key]?.startsWith('data:image')

                    return (
                      <Box
                        key={field.key}
                        sx={{
                          border: `2px solid ${hasFile ? '#10b981' : '#e5e7eb'}`,
                          borderRadius: 2.5,
                          p: 2,
                          bgcolor: hasFile ? '#f0fdf4' : '#fafafa',
                          transition: 'all 0.2s',
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                          {/* Icon */}
                          <Box sx={{
                            width: 48, height: 48, borderRadius: 2,
                            bgcolor: hasFile ? '#d1fae5' : field.iconBg,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0,
                          }}>
                            {hasFile
                              ? <CheckCircleIcon sx={{ fontSize: 24, color: '#10b981' }} />
                              : field.icon}
                          </Box>

                          {/* Text + button */}
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.3 }}>
                              <Typography fontWeight={700} fontSize={14} color="#0a1940">
                                {field.label}
                              </Typography>
                              <Box component="span" sx={{ fontSize: 11, color: '#ef4444', fontWeight: 700 }}>*</Box>
                              {hasFile && (
                                <Box component="span" sx={{ fontSize: 11, color: '#10b981', fontWeight: 700 }}>✓ Uploaded</Box>
                              )}
                            </Box>
                            <Typography variant="caption" color="text.secondary" display="block" mb={1.5}>
                              {field.hint}
                            </Typography>

                            {/* Image preview */}
                            {hasFile && isImage && (
                              <Box
                                component="img"
                                src={previews[field.key]!}
                                alt={field.label}
                                sx={{ width: '100%', maxHeight: 150, objectFit: 'cover', borderRadius: 1.5, mb: 1.5, border: '1px solid #e5e7eb' }}
                              />
                            )}

                            <input
                              type="file"
                              accept="image/*,application/pdf"
                              style={{ display: 'none' }}
                              ref={el => { fileRefs.current[field.key] = el }}
                              onChange={e => handleFileChange(field.key, e.target.files?.[0] || null)}
                            />
                            <Button
                              size="small"
                              variant={hasFile ? 'outlined' : 'contained'}
                              startIcon={<UploadFileIcon sx={{ fontSize: 16 }} />}
                              onClick={() => fileRefs.current[field.key]?.click()}
                              sx={{
                                textTransform: 'none',
                                fontWeight: 700,
                                borderRadius: 2,
                                fontSize: 12,
                                ...(hasFile
                                  ? { borderColor: '#10b981', color: '#065f46', '&:hover': { borderColor: '#059669', bgcolor: '#ecfdf5' } }
                                  : { bgcolor: '#0a1940', '&:hover': { bgcolor: '#000' }, boxShadow: 'none' }
                                ),
                              }}
                            >
                              {hasFile ? 'Replace File' : 'Upload File'}
                            </Button>
                          </Box>
                        </Box>
                      </Box>
                    )
                  })}
                </Stack>
              </Box>

              <Divider />

              {/* Submit button */}
              <Box sx={{ px: 3, py: 3 }}>
                <Button
                  variant="contained"
                  size="large"
                  fullWidth
                  onClick={handleSubmit}
                  disabled={submitting}
                  startIcon={submitting ? <CircularProgress size={18} color="inherit" /> : <VerifiedUserIcon />}
                  sx={{
                    py: 1.6, fontWeight: 700, fontSize: '1rem',
                    textTransform: 'none', borderRadius: 2,
                    bgcolor: '#0a1940', boxShadow: 'none',
                    '&:hover': { bgcolor: '#000', boxShadow: '0 4px 16px rgba(0,0,0,0.25)' },
                  }}
                >
                  {submitting ? 'Submitting…' : existingKyc?.status === 'rejected' ? 'Resubmit for Verification' : 'Submit for Verification'}
                </Button>
                <Typography variant="caption" color="text.secondary" display="block" textAlign="center" mt={1.5}>
                  Your documents are encrypted and reviewed only by verified StartupSri administrators.
                </Typography>
              </Box>
            </Paper>
          )}

          {/* Post-approval CTA */}
          {existingKyc?.status === 'approved' && (
            <Box sx={{ mt: 2 }}>
              <Button
                variant="contained"
                fullWidth
                size="large"
                onClick={() => router.push(user?.role === 'investor' ? '/user/projects' : '/user/submit-project')}
                sx={{
                  py: 1.6, fontWeight: 700, fontSize: '1rem',
                  textTransform: 'none', borderRadius: 2,
                  bgcolor: '#0a1940', boxShadow: 'none',
                  '&:hover': { bgcolor: '#000' },
                }}
              >
                {user?.role === 'investor' ? 'Explore Projects →' : 'Submit a Project →'}
              </Button>
            </Box>
          )}

        </Box>
      </Box>
    </>
  )
}
