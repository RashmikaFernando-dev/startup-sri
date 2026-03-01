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
  Avatar,
  Chip,
  IconButton,
  Tooltip,
  LinearProgress,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch'
import LogoutIcon from '@mui/icons-material/Logout'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'

const CATEGORIES = ['Software', 'Hardware', 'SaaS', 'Mobile App', 'Web Platform', 'AI/ML', 'Other']

const STEPS = ['Basic Info', 'Funding Details', 'Review & Submit']

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

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    fundingType: 'microloan',
    fundingGoal: '',
    interestRate: '',
    equityOffered: '',
    duration: '',
  })

  useEffect(() => {
    const stored = localStorage.getItem('user')
    const token = localStorage.getItem('token')
    if (!stored || !token) { router.push('/login'); return }
    const parsed = JSON.parse(stored)
    setUser(parsed)
    const img = localStorage.getItem(`profileImage_${parsed.id}`)
    if (img) setProfileImage(img)
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
      if (form.fundingType === 'microloan') {
        body.interestRate = Number(form.interestRate)
        body.duration = Number(form.duration)
      } else {
        body.equityOffered = Number(form.equityOffered)
      }
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
          <NavBar user={user} profileImage={profileImage} onLogout={handleLogout} onBack={() => router.push('/user/dashboard')} />
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
                  sx={{ bgcolor: '#0a1940', borderRadius: 2, textTransform: 'none', fontWeight: 700, px: 4 }}>
                  Go to Dashboard
                </Button>
                <Button variant="outlined"
                  onClick={() => { setSubmitted(false); setStep(0); setForm({ title: '', description: '', category: '', fundingType: 'microloan', fundingGoal: '', interestRate: '', equityOffered: '', duration: '' }) }}
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
        <NavBar user={user} profileImage={profileImage} onLogout={handleLogout} onBack={() => router.push('/user/dashboard')} />

        <Box sx={{ flex: 1, maxWidth: 720, mx: 'auto', width: '100%', px: { xs: 2, md: 4 }, py: 5 }}>

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
                  label="Description *" fullWidth multiline rows={4} value={form.description}
                  onChange={e => set('description', e.target.value)}
                  helperText="Explain what your startup does and why investors should care"
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

            {/* ── Step 2: Review ── */}
            {step === 2 && (
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
                  sx={{ bgcolor: '#0a1940', borderRadius: 2, textTransform: 'none', fontWeight: 700, px: 4 }}>
                  Next Step
                </Button>
              ) : (
                <Button variant="contained" onClick={handleSubmit} disabled={loading}
                  sx={{ bgcolor: '#0a1940', borderRadius: 2, textTransform: 'none', fontWeight: 700, px: 4 }}>
                  {loading ? 'Submitting...' : 'Submit Listing'}
                </Button>
              )}
            </Box>
          </Box>

          {loading && <LinearProgress sx={{ mt: 2, borderRadius: 1 }} />}
        </Box>
      </Box>

      <Snackbar open={toast.open} autoHideDuration={4000} onClose={() => setToast(t => ({ ...t, open: false }))} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert severity={toast.type} variant="filled" sx={{ width: '100%' }}>{toast.msg}</Alert>
      </Snackbar>
    </>
  )
}

// ── Mini components ────────────────────────────────────────────────────────────

function NavBar({ user, profileImage, onLogout, onBack }: { user: User | null; profileImage: string | null; onLogout: () => void; onBack: () => void }) {
  return (
    <Box sx={{ bgcolor: '#fff', borderBottom: '1px solid #e5e7eb', px: { xs: 2, md: 4 }, py: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Tooltip title="Back to Dashboard">
          <IconButton size="small" onClick={onBack} sx={{ color: '#6b7280', border: '1px solid #e5e7eb', borderRadius: 1.5 }}>
            <ArrowBackIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Typography variant="h6" sx={{ fontWeight: 800, color: '#0a1940', letterSpacing: '-0.02em', cursor: 'pointer' }} onClick={onBack}>
          StartupSri
        </Typography>
        <Chip label="Submit Project" size="small" sx={{ bgcolor: '#dbeafe', color: '#1d4ed8', fontWeight: 700 }} />
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Avatar src={profileImage || undefined} sx={{ bgcolor: '#0a1940', width: 34, height: 34, fontSize: 13, fontWeight: 700 }}>
          {!profileImage && `${user?.firstName?.[0]}${user?.lastName?.[0]}`}
        </Avatar>
        <Typography variant="body2" sx={{ fontWeight: 600, color: '#0a1940', display: { xs: 'none', sm: 'block' } }}>
          {user?.firstName} {user?.lastName}
        </Typography>
        <Tooltip title="Logout">
          <IconButton size="small" onClick={onLogout} sx={{ color: '#6b7280' }}>
            <LogoutIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  )
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1, borderBottom: '1px solid #f3f4f6' }}>
      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>{label}</Typography>
      <Typography variant="body2" sx={{ fontWeight: 700, color: '#0a1940' }}>{value}</Typography>
    </Box>
  )
}
