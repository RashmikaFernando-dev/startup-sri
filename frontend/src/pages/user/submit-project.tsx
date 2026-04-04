import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import {
  Box,
  Typography,
  Button,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Divider,
  Alert,
  Snackbar,
  LinearProgress,
  CircularProgress,
} from '@mui/material'
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser'
import UserNavbar from '@/components/user/UserNavbar'

const CATEGORIES = ['Software', 'Hardware', 'SaaS', 'Mobile App', 'Web Platform', 'AI/ML', 'Other']

const STEPS = ['Basic Info', 'Funding Details', 'Documents', 'Review & Submit']

interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  role: string
}

export default function SubmitProject() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [toast, setToast] = useState<{ open: boolean; msg: string; type: 'success' | 'error' }>({ open: false, msg: '', type: 'success' })
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [kycStatus, setKycStatus] = useState<'loading' | 'approved' | 'pending' | 'rejected' | 'not_submitted'>('loading')

  const [form, setForm] = useState({
    title: '',
    description: '',
    longDescription: '',
    category: '',
    fundingType: 'microloan',
    fundingGoal: '',
    interestRate: '',
    equityOffered: '',
    duration: '',
    businessPlan: '',
  })

  useEffect(() => {
    const stored = localStorage.getItem('user')
    const token = localStorage.getItem('token')
    if (!stored || !token) { router.push('/auth/login'); return }
    const parsed = JSON.parse(stored)
    setUser(parsed)
    const img = localStorage.getItem(`profileImage_${parsed.id}`)
    if (img) setProfileImage(img)

    // Check KYC status
    fetch('http://localhost:5000/api/kyc/my', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => {
        if (data.success) setKycStatus(data.data.status)
        else setKycStatus('not_submitted')
      })
      .catch(() => setKycStatus('not_submitted'))
  }, [])

  const set = (key: string, value: string) => setForm(f => ({ ...f, [key]: value }))

  const validateStep = () => {
    if (step === 0) {
      if (!form.title.trim()) { setToast({ open: true, msg: 'Project title is required.', type: 'error' }); return false }
      if (!form.description.trim()) { setToast({ open: true, msg: 'Description is required.', type: 'error' }); return false }
      if (!form.category) { setToast({ open: true, msg: 'Please select a category.', type: 'error' }); return false }
    }
    if (step === 1) {
      const goal = Number(form.fundingGoal)
      if (!form.fundingGoal || goal < 100000 || goal > 5000000) {
        setToast({ open: true, msg: 'Funding goal must be between LKR 100,000 and LKR 5,000,000.', type: 'error' }); return false
      }
      if (form.fundingType === 'microloan') {
        if (!form.interestRate || Number(form.interestRate) <= 0) {
          setToast({ open: true, msg: 'Interest rate is required for microloans.', type: 'error' }); return false
        }
        if (!form.duration || Number(form.duration) <= 0) {
          setToast({ open: true, msg: 'Duration is required for microloans.', type: 'error' }); return false
        }
      } else {
        if (!form.equityOffered || Number(form.equityOffered) <= 0 || Number(form.equityOffered) > 100) {
          setToast({ open: true, msg: 'Equity offered must be between 1 and 100%.', type: 'error' }); return false
        }
      }
    }
    return true
  }

  const handleNext = () => {
    if (!validateStep()) return
    setStep(s => s + 1)
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const body: any = {
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category,
        fundingType: form.fundingType,
        fundingGoal: Number(form.fundingGoal),
      }
      if (form.longDescription.trim()) body.longDescription = form.longDescription.trim()
      if (form.fundingType === 'microloan') {
        body.interestRate = Number(form.interestRate)
        body.duration = Number(form.duration)
      } else {
        body.equityOffered = Number(form.equityOffered)
      }
      if (form.businessPlan.trim()) body.documents = { businessPlan: form.businessPlan.trim() }
      const res = await fetch('http://localhost:5000/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      setSubmitted(true)
    } catch (e: any) {
      setToast({ open: true, msg: e.message || 'Submission failed. Please try again.', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/')
  }

  const fmt = (v: string) => v ? `LKR ${Number(v).toLocaleString()}` : '—'

  // ── Success screen ──────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <>
        <Head><title>Project Submitted – StartupSri</title></Head>
        <Box sx={{ minHeight: '100vh', bgcolor: '#f7f8fa', display: 'flex', flexDirection: 'column' }}>
          <UserNavbar user={user} profileImage={profileImage} onLogout={handleLogout} onBack={() => router.push('/user/dashboard')} backLabel="Submit Project" />
          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', px: 2, py: 8 }}>
            <Box sx={{ textAlign: 'center', maxWidth: 480 }}>
              <Box sx={{ width: 72, height: 72, borderRadius: '50%', bgcolor: '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 3 }}>
                <CheckCircleIcon sx={{ fontSize: 40, color: '#059669' }} />
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#0a1940', mb: 1 }}>Submitted!</Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                Your project <strong>"{form.title}"</strong> has been submitted for admin review. You'll be notified once it's approved.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                <Button variant="contained"
                  onClick={() => router.push('/user/dashboard')}
                  sx={{ bgcolor: '#111111', '&:hover': { bgcolor: '#000000' }, borderRadius: 2, textTransform: 'none', fontWeight: 700, px: 4 }}>
                  Go to Dashboard
                </Button>
                <Button variant="outlined"
                  onClick={() => { setSubmitted(false); setStep(0); setForm({ title: '', description: '', longDescription: '', category: '', fundingType: 'microloan', fundingGoal: '', interestRate: '', equityOffered: '', duration: '', businessPlan: '' }) }}
                  sx={{ borderRadius: 2, textTransform: 'none', borderColor: '#d1d5db', color: '#374151' }}>
                  Submit Another
                </Button>
              </Box>
            </Box>
          </Box>
        </Box>
      </>
    )
  }

  return (
    <>
      <Head><title>Submit Project – StartupSri</title></Head>
      <Box sx={{ minHeight: '100vh', bgcolor: '#f7f8fa', display: 'flex', flexDirection: 'column' }}>
        <UserNavbar user={user} profileImage={profileImage} onLogout={handleLogout} onBack={() => router.push('/user/dashboard')} backLabel="Submit Project" />

        <Box sx={{ flex: 1, maxWidth: 720, mx: 'auto', width: '100%', px: { xs: 2, md: 4 }, py: 5 }}>

          {/* KYC gate */}
          {kycStatus === 'loading' && (
            <Box display="flex" justifyContent="center" py={8}><CircularProgress /></Box>
          )}
          {kycStatus === 'not_submitted' && (
            <Box sx={{ bgcolor: '#fff', border: '1px solid #e5e7eb', borderRadius: 3, p: 4, display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
              <Box sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <VerifiedUserIcon sx={{ fontSize: 26, color: '#9ca3af' }} />
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontWeight: 700, fontSize: 16, color: '#111827', mb: 0.4 }}>KYC Verification Required</Typography>
                <Typography variant="body2" color="text.secondary">
                  Complete identity verification before submitting a project.
                </Typography>
              </Box>
              <Button variant="contained" onClick={() => router.push('/user/verifications')}
                sx={{ bgcolor: '#0a1940', '&:hover': { bgcolor: '#000' }, borderRadius: 2, textTransform: 'none', fontWeight: 700, flexShrink: 0 }}>
                Start KYC
              </Button>
            </Box>
          )}
          {kycStatus === 'pending' && (
            <Box sx={{ bgcolor: '#fffbeb', border: '1px solid #fde68a', borderRadius: 3, p: 4, display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
              <Box sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <VerifiedUserIcon sx={{ fontSize: 26, color: '#f59e0b' }} />
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontWeight: 700, fontSize: 16, color: '#92400e', mb: 0.4 }}>KYC Under Review</Typography>
                <Typography variant="body2" sx={{ color: '#92400e', opacity: 0.8 }}>
                  Your documents are pending admin review. You can submit projects once approved.
                </Typography>
              </Box>
              <Button variant="outlined" onClick={() => router.push('/user/verifications')}
                sx={{ borderRadius: 2, textTransform: 'none', borderColor: '#f59e0b', color: '#92400e', '&:hover': { bgcolor: '#fef3c7' }, flexShrink: 0 }}>
                View Status
              </Button>
            </Box>
          )}
          {kycStatus === 'rejected' && (
            <Box sx={{ bgcolor: '#fff5f5', border: '1px solid #fecaca', borderRadius: 3, p: 4, display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
              <Box sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <VerifiedUserIcon sx={{ fontSize: 26, color: '#ef4444' }} />
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontWeight: 700, fontSize: 16, color: '#991b1b', mb: 0.4 }}>KYC Rejected</Typography>
                <Typography variant="body2" sx={{ color: '#991b1b', opacity: 0.8 }}>
                  Your KYC was not approved. Please resubmit your documents to continue.
                </Typography>
              </Box>
              <Button variant="contained" onClick={() => router.push('/user/verifications')}
                sx={{ bgcolor: '#ef4444', '&:hover': { bgcolor: '#dc2626' }, borderRadius: 2, textTransform: 'none', fontWeight: 700, flexShrink: 0 }}>
                Resubmit KYC
              </Button>
            </Box>
          )}

          {/* How it works — shown when KYC not yet approved */}
          {kycStatus !== 'approved' && kycStatus !== 'loading' && (
            <Box sx={{ mt: 3, bgcolor: '#fff', border: '1px solid #e5e7eb', borderRadius: 3, p: 3 }}>
              <Typography sx={{ fontWeight: 700, fontSize: 14, color: '#111827', mb: 2 }}>
                How the process works
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {[
                  { step: '01', title: 'Complete KYC Verification', desc: 'Upload your NIC, proof of address and any business documents for identity verification.' },
                  { step: '02', title: 'Admin Reviews Your Documents', desc: 'Our team reviews your submission and approves or requests corrections within 1–2 business days.' },
                  { step: '03', title: 'Submit Your Project', desc: 'Once approved, you can create your startup listing and start raising funds from investors.' },
                ].map(item => (
                  <Box key={item.step} sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                    <Box sx={{ width: 32, height: 32, borderRadius: 2, bgcolor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Typography sx={{ fontSize: 11, fontWeight: 800, color: '#6b7280' }}>{item.step}</Typography>
                    </Box>
                    <Box>
                      <Typography sx={{ fontWeight: 700, fontSize: 13, color: '#111827' }}>{item.title}</Typography>
                      <Typography sx={{ fontSize: 13, color: '#6b7280', mt: 0.2 }}>{item.desc}</Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          )}

          {/* Only show form if KYC approved */}
          {kycStatus === 'approved' && (
          <>
          {/* Page header */}
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
              <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <RocketLaunchIcon sx={{ color: '#1d4ed8', fontSize: 22 }} />
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#0a1940' }}>Apply to Raise</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              Fill in your project details to apply for funding on StartupSri.
            </Typography>
          </Box>

          {/* Stepper */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, gap: 0 }}>
            {STEPS.map((label, i) => (
              <Box key={label} sx={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : 'none' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{
                    width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    bgcolor: i < step ? '#059669' : i === step ? '#0a1940' : '#e5e7eb',
                    color: i <= step ? '#fff' : '#6b7280',
                    fontSize: 12, fontWeight: 700,
                  }}>
                    {i < step ? <CheckCircleIcon sx={{ fontSize: 16 }} /> : i + 1}
                  </Box>
                  <Typography variant="body2" sx={{ fontWeight: i === step ? 700 : 400, color: i === step ? '#0a1940' : '#6b7280', display: { xs: i === step ? 'block' : 'none', sm: 'block' } }}>
                    {label}
                  </Typography>
                </Box>
                {i < STEPS.length - 1 && (
                  <Box sx={{ flex: 1, height: 2, bgcolor: i < step ? '#059669' : '#e5e7eb', mx: 1.5, borderRadius: 1 }} />
                )}
              </Box>
            ))}
          </Box>

          {/* Form card */}
          <Box sx={{ bgcolor: '#fff', border: '1px solid #e5e7eb', borderRadius: 3, p: { xs: 3, md: 4 } }}>

            {/* ── Step 0: Basic Info ── */}
            {step === 0 && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#0a1940' }}>Basic Information</Typography>
                <Divider />
                <TextField
                  label="Project Title *" fullWidth value={form.title}
                  onChange={e => set('title', e.target.value)}
                  helperText="Give your startup a clear, memorable name"
                />
                <TextField
                  label="Short Description *" fullWidth multiline rows={3} value={form.description}
                  onChange={e => set('description', e.target.value)}
                  helperText="A brief summary shown on the project card (1–2 sentences)"
                />
                <TextField
                  label="Long Description" fullWidth multiline rows={5} value={form.longDescription}
                  onChange={e => set('longDescription', e.target.value)}
                  helperText="Detailed explanation of your startup, problem, solution and traction (optional)"
                />
                <FormControl fullWidth>
                  <InputLabel>Category *</InputLabel>
                  <Select value={form.category} label="Category *" onChange={e => set('category', e.target.value)}>
                    {CATEGORIES.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                  </Select>
                </FormControl>
              </Box>
            )}

            {/* ── Step 1: Funding Details ── */}
            {step === 1 && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#0a1940' }}>Funding Details</Typography>
                <Divider />
                <FormControl fullWidth>
                  <InputLabel>Funding Type *</InputLabel>
                  <Select value={form.fundingType} label="Funding Type *" onChange={e => set('fundingType', e.target.value)}>
                    <MenuItem value="microloan">Microloan — Borrow and repay with interest</MenuItem>
                    <MenuItem value="equity">Equity — Exchange stake in your company</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  label="Funding Goal (LKR) *" fullWidth type="number"
                  value={form.fundingGoal} onChange={e => set('fundingGoal', e.target.value)}
                  helperText="Min: LKR 100,000 · Max: LKR 5,000,000"
                  InputProps={{ inputProps: { min: 100000, max: 5000000 } }}
                />
                {form.fundingType === 'microloan' ? (
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                    <TextField
                      label="Annual Interest Rate (%)" type="number"
                      value={form.interestRate} onChange={e => set('interestRate', e.target.value)}
                      InputProps={{ inputProps: { min: 0, max: 100 } }}
                    />
                    <TextField
                      label="Repayment Duration (months)" type="number"
                      value={form.duration} onChange={e => set('duration', e.target.value)}
                      InputProps={{ inputProps: { min: 1 } }}
                    />
                  </Box>
                ) : (
                  <TextField
                    label="Equity Offered (%)" fullWidth type="number"
                    value={form.equityOffered} onChange={e => set('equityOffered', e.target.value)}
                    helperText="Percentage of company equity you are offering to investors"
                    InputProps={{ inputProps: { min: 1, max: 100 } }}
                  />
                )}
              </Box>
            )}

            {/* ── Step 2: Documents ── */}
            {step === 2 && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#0a1940' }}>Documents</Typography>
                <Divider />
                <Typography variant="body2" color="text.secondary">
                  Paste a publicly accessible URL to your business plan (optional).
                </Typography>
                <TextField
                  label="Business Plan URL"
                  fullWidth
                  value={form.businessPlan}
                  onChange={e => set('businessPlan', e.target.value)}
                  placeholder="https://..."
                  helperText="e.g. a Google Docs or PDF link visible to anyone with the link"
                />
              </Box>
            )}

            {/* ── Step 3: Review ── */}
            {step === 3 && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#0a1940' }}>Review Your Listing</Typography>
                <Divider />
                <ReviewRow label="Project Title" value={form.title} />
                <ReviewRow label="Category" value={form.category} />
                <ReviewRow label="Funding Type" value={form.fundingType === 'microloan' ? 'Microloan' : 'Equity'} />
                <ReviewRow label="Funding Goal" value={fmt(form.fundingGoal)} />
                {form.fundingType === 'microloan' ? (
                  <>
                    <ReviewRow label="Interest Rate" value={form.interestRate ? `${form.interestRate}% p.a.` : '—'} />
                    <ReviewRow label="Duration" value={form.duration ? `${form.duration} months` : '—'} />
                  </>
                ) : (
                  <ReviewRow label="Equity Offered" value={form.equityOffered ? `${form.equityOffered}%` : '—'} />
                )}
                <Divider />
                <Box sx={{ bgcolor: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 2, p: 2 }}>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#0369a1', mb: 0.5 }}>Description</Typography>
                  <Typography variant="body2" color="text.secondary">{form.description}</Typography>
                </Box>
                {form.businessPlan && (
                  <>
                    <Divider />
                    <ReviewRow label="Business Plan" value="Attached" />
                  </>
                )}
                <Alert severity="info" sx={{ mt: 1 }}>
                  Your project will be reviewed by our admin team before going live. This usually takes 1–2 business days.
                </Alert>
              </Box>
            )}

            {/* Navigation buttons */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              <Button
                variant="outlined" onClick={() => step === 0 ? router.push('/user/dashboard') : setStep(s => s - 1)}
                sx={{ borderRadius: 2, textTransform: 'none', borderColor: '#d1d5db', color: '#374151' }}
                startIcon={step === 0 ? <ArrowBackIcon /> : undefined}
              >
                {step === 0 ? 'Back to Dashboard' : 'Previous'}
              </Button>

              {step < STEPS.length - 1 ? (
                <Button variant="contained" onClick={handleNext}
                  sx={{ bgcolor: '#111111', '&:hover': { bgcolor: '#000000' }, borderRadius: 2, textTransform: 'none', fontWeight: 700, px: 4 }}>
                  Next Step
                </Button>
              ) : (
                <Button variant="contained" onClick={handleSubmit} disabled={loading}
                  sx={{ bgcolor: '#111111', '&:hover': { bgcolor: '#000000' }, borderRadius: 2, textTransform: 'none', fontWeight: 700, px: 4 }}>
                  {loading ? 'Submitting...' : 'Submit Listing'}
                </Button>
              )}
            </Box>
          </Box>

          {loading && <LinearProgress sx={{ mt: 2, borderRadius: 1 }} />}
          </>
          )}
        </Box>
      </Box>

      <Snackbar open={toast.open} autoHideDuration={4000} onClose={() => setToast(t => ({ ...t, open: false }))} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert severity={toast.type} variant="filled" sx={{ width: '100%' }}>{toast.msg}</Alert>
      </Snackbar>
    </>
  )
}

// ── Mini components ────────────────────────────────────────────────────────────

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1, borderBottom: '1px solid #f3f4f6' }}>
      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>{label}</Typography>
      <Typography variant="body2" sx={{ fontWeight: 700, color: '#0a1940' }}>{value}</Typography>
    </Box>
  )
}
