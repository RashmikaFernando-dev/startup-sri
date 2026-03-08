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
  Divider,
  Chip,
  Paper,
  Stack,
} from '@mui/material'
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser'
import UploadFileIcon from '@mui/icons-material/UploadFile'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'
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

interface FileField {
  label: string
  key: string
  required: boolean
  hint?: string
}

const FILE_FIELDS: FileField[] = [
  { label: 'NIC Front Image', key: 'nicFrontImage', required: true, hint: 'Clear photo of the front of your NIC' },
  { label: 'NIC Back Image', key: 'nicBackImage', required: true, hint: 'Clear photo of the back of your NIC' },
  { label: 'Proof of Address', key: 'proofOfAddressImage', required: true, hint: 'Utility bill, bank statement or similar (max 3 months old)' },
  { label: 'Business Registration (Optional)', key: 'businessRegImage', required: false, hint: 'Business registration certificate if applicable' },
]

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function StatusBanner({ kyc }: { kyc: KycRecord }) {
  if (kyc.status === 'approved') {
    return (
      <Alert icon={<CheckCircleIcon />} severity="success" sx={{ mb: 3 }}>
        <Typography fontWeight={600}>KYC Approved</Typography>
        <Typography variant="body2">
          Your identity has been verified. You can now submit projects for funding.
        </Typography>
      </Alert>
    )
  }
  if (kyc.status === 'pending') {
    return (
      <Alert icon={<HourglassEmptyIcon />} severity="info" sx={{ mb: 3 }}>
        <Typography fontWeight={600}>Under Review</Typography>
        <Typography variant="body2">
          Your documents have been submitted and are awaiting admin review. This usually takes 1–2 business days.
        </Typography>
      </Alert>
    )
  }
  return (
    <Alert icon={<ErrorOutlineIcon />} severity="error" sx={{ mb: 3 }}>
      <Typography fontWeight={600}>KYC Rejected</Typography>
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
    businessRegImage: null,
  })
  const [previews, setPreviews] = useState<Record<string, string | null>>({
    nicFrontImage: null,
    nicBackImage: null,
    proofOfAddressImage: null,
    businessRegImage: null,
  })
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({})

  useEffect(() => {
    const stored = localStorage.getItem('user')
    const token = localStorage.getItem('token')
    if (!stored || !token) { router.push('/auth/login'); return }
    const parsed = JSON.parse(stored)
    if (parsed.role !== 'entrepreneur') { router.push('/user/dashboard'); return }
    setUser(parsed)
    const img = localStorage.getItem(`profileImage_${parsed.id}`)
    if (img) setProfileImage(img)

    api.get('/kyc/my')
      .then(r => setExistingKyc(r.data.data))
      .catch(err => {
        if (err.response?.status !== 404) console.error(err)
      })
      .finally(() => setLoadingStatus(false))
  }, [])

  const handleFileChange = async (key: string, file: File | null) => {
    if (!file) return
    const b64 = await fileToBase64(file)
    setFiles(f => ({ ...f, [key]: b64 }))
    setPreviews(p => ({ ...p, [key]: b64 }))
  }

  const handleSubmit = async () => {
    if (!nic.trim()) { setError('NIC number is required.'); return }
    if (!dob) { setError('Date of birth is required.'); return }
    if (!address.trim()) { setError('Address is required.'); return }
    if (!files.nicFrontImage) { setError('NIC front image is required.'); return }
    if (!files.nicBackImage) { setError('NIC back image is required.'); return }
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
        businessRegImage: files.businessRegImage,
      })
      setSuccess(true)
      // Refresh status
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
      <Head><title>KYC Verification | StartupSri</title></Head>
      <UserNavbar user={user} profileImage={profileImage} onLogout={() => { localStorage.removeItem('token'); localStorage.removeItem('user'); router.push('/') }} onBack={() => router.back()} backLabel="KYC Verification" />

      <Box maxWidth={680} mx="auto" px={3} py={6}>
        {/* Header */}
        <Stack direction="row" alignItems="center" spacing={1.5} mb={1}>
          <VerifiedUserIcon sx={{ fontSize: 36, color: '#0a1940' }} />
          <Typography variant="h4" fontWeight={700}>Identity Verification</Typography>
        </Stack>
        <Typography color="text.secondary" mb={4}>
          Complete KYC verification to unlock project submission on StartupSri.
        </Typography>

        {/* Current status banner */}
        {existingKyc && <StatusBanner kyc={existingKyc} />}

        {/* Success state after submission */}
        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            <Typography fontWeight={600}>Documents submitted successfully!</Typography>
            <Typography variant="body2">
              Your KYC is now pending admin review. You will be notified once approved.
            </Typography>
          </Alert>
        )}

        {/* Submission form */}
        {showForm && (
          <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, p: 3 }}>
            <Typography variant="h6" fontWeight={600} mb={3}>Personal Information</Typography>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Stack spacing={2.5}>
              <TextField
                label="NIC Number"
                value={nic}
                onChange={e => setNic(e.target.value)}
                required
                fullWidth
                placeholder="e.g. 901234567V or 199012345678"
              />
              <TextField
                label="Date of Birth"
                type="date"
                value={dob}
                onChange={e => setDob(e.target.value)}
                required
                fullWidth
                InputLabelProps={{ shrink: true }}
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
              />

              <Divider sx={{ my: 1 }} />
              <Typography variant="h6" fontWeight={600}>Document Upload</Typography>
              <Typography variant="body2" color="text.secondary" mt={-1}>
                Accepted formats: JPG, PNG, PDF. Each file must be under 5 MB.
              </Typography>

              {FILE_FIELDS.map(field => (
                <Box key={field.key}>
                  <Typography variant="body2" fontWeight={500} mb={0.5}>
                    {field.label}
                    {field.required && <Box component="span" sx={{ color: 'error.main' }}> *</Box>}
                  </Typography>
                  {field.hint && (
                    <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                      {field.hint}
                    </Typography>
                  )}

                  {previews[field.key] && previews[field.key]!.startsWith('data:image') && (
                    <Box
                      component="img"
                      src={previews[field.key]!}
                      alt={field.label}
                      sx={{ width: '100%', maxHeight: 180, objectFit: 'cover', borderRadius: 2, mb: 1, border: '1px solid #e0e0e0' }}
                    />
                  )}
                  {previews[field.key] && !previews[field.key]!.startsWith('data:image') && (
                    <Chip label="File selected" color="success" size="small" sx={{ mb: 1 }} />
                  )}

                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    style={{ display: 'none' }}
                    ref={el => { fileRefs.current[field.key] = el }}
                    onChange={e => handleFileChange(field.key, e.target.files?.[0] || null)}
                  />
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<UploadFileIcon />}
                    onClick={() => fileRefs.current[field.key]?.click()}
                  >
                    {previews[field.key] ? 'Change File' : 'Upload File'}
                  </Button>
                </Box>
              ))}
            </Stack>

            <Box mt={4}>
              <Button
                variant="contained"
                size="large"
                fullWidth
                onClick={handleSubmit}
                disabled={submitting}
                startIcon={submitting ? <CircularProgress size={18} color="inherit" /> : <VerifiedUserIcon />}
                sx={{ py: 1.5, fontWeight: 600, bgcolor: '#0a1940', '&:hover': { bgcolor: '#1a2f6a' } }}
              >
                {submitting ? 'Submitting…' : existingKyc?.status === 'rejected' ? 'Resubmit KYC' : 'Submit for Verification'}
              </Button>
            </Box>
          </Paper>
        )}

        {/* Navigate away if approved */}
        {existingKyc?.status === 'approved' && (
          <Button variant="contained" sx={{ mt: 2 }} onClick={() => router.push('/user/submit-project')}>
            Go to Submit Project
          </Button>
        )}
      </Box>
    </>
  )
}
