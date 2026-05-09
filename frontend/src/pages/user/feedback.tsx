import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useAppDispatch, useAppSelector } from '@/hooks/useTypedSelector'
import { logout } from '@/redux/slices/authSlice'
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  Snackbar,
  Avatar,
  Divider,
} from '@mui/material'
import RateReviewIcon from '@mui/icons-material/RateReview'
import UserNavbar from '@/components/user/UserNavbar'
import InvestorSidebar from '@/components/user/InvestorSidebar'
import EntrepreneurSidebar from '@/components/user/EntrepreneurSidebar'
import Footer from '@/components/layout/Footer'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

const AVATAR_COLORS = ['#4f46e5', '#2563eb', '#0ea5e9', '#7c3aed', '#0891b2', '#1d4ed8']

export default function FeedbackPage() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const user = useAppSelector((s) => s.auth.user)
  const token = useAppSelector((s) => s.auth.token)

  const [feedbackText, setFeedbackText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [myFeedback, setMyFeedback] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [toast, setToast] = useState<{ open: boolean; msg: string; type: 'success' | 'error' }>({
    open: false,
    msg: '',
    type: 'success',
  })

  useEffect(() => {
    const storedToken = localStorage.getItem('token')
    if (!storedToken) {
      router.push('/auth/login')
      return
    }
    try {
      const parsed = JSON.parse(localStorage.getItem('user') || '{}')
      const img = localStorage.getItem(`profileImage_${parsed.id}`)
      if (img) setProfileImage(img)
    } catch {}
    fetchMyFeedback()
  }, [])

  const fetchMyFeedback = async () => {
    setLoading(true)
    try {
      const authToken = token || localStorage.getItem('token')
      const res = await fetch(`${API_BASE_URL}/feedback/my`, {
        headers: { Authorization: `Bearer ${authToken}` },
      })
      const data = await res.json()
      if (data.success) setMyFeedback(data.data)
    } catch {
      setToast({ open: true, msg: 'Could not load feedback.', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    const trimmed = feedbackText.trim()
    if (!trimmed) {
      setToast({ open: true, msg: 'Feedback cannot be empty.', type: 'error' })
      return
    }

    setSubmitting(true)
    try {
      const authToken = token || localStorage.getItem('token')
      const res = await fetch(`${API_BASE_URL}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ text: trimmed }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to submit feedback')
      }

      setFeedbackText('')
      setToast({ open: true, msg: 'Feedback submitted! Thank you.', type: 'success' })
      fetchMyFeedback()
    } catch (err: any) {
      setToast({ open: true, msg: err.message || 'Failed to submit feedback.', type: 'error' })
    } finally {
      setSubmitting(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    dispatch(logout())
    router.push('/')
  }

  const isEntrepreneur = user?.role === 'entrepreneur'

  const handleEntrepreneurSidebar = (key: string) => {
    if (key === 'apply') router.push('/user/submit-project')
    else if (key === 'listings') router.push('/user/dashboard')
    else if (key === 'repayments') router.push('/user/dashboard')
    else if (key === 'notifications') router.push('/user/notifications')
    else if (key === 'profile' || key === 'settings') router.push('/user/profile')
    else if (key === 'feedback') return
  }

  return (
    <>
      <Head>
        <title>Feedback – StartupSri</title>
      </Head>
      <Box sx={{ minHeight: '100vh', bgcolor: '#f7f8fa', display: 'flex', flexDirection: 'column' }}>
        <UserNavbar user={user} profileImage={profileImage} onLogout={handleLogout} />

        <Box
          sx={{
            flex: 1,
            maxWidth: 1100,
            mx: 'auto',
            width: '100%',
            px: { xs: 2, md: 4 },
            py: 4,
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: 3,
          }}
        >
          {isEntrepreneur ? (
            <EntrepreneurSidebar active="feedback" onItemClick={handleEntrepreneurSidebar} />
          ) : (
            <InvestorSidebar active="feedback" />
          )}

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ mb: 4 }}>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#0a1940', mb: 0.5 }}>
                Feedback
              </Typography>
              <Typography color="text.secondary">
                Share your experience with StartupSri. Your feedback helps us improve the platform for everyone.
              </Typography>
            </Box>

            {/* Submit feedback */}
            <Box
              sx={{
                bgcolor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: 3,
                p: 3,
                mb: 3,
              }}
            >
              <Typography sx={{ fontWeight: 700, fontSize: 15, color: '#0a1940', mb: 2 }}>
                Write your feedback
              </Typography>
              <TextField
                fullWidth
                multiline
                minRows={4}
                placeholder="Tell us about your experience using StartupSri..."
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                sx={{
                  mb: 1.5,
                  '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: '#fafafa' },
                }}
              />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="caption" color="text.secondary">
                  {feedbackText.trim().length} / 1000 characters
                </Typography>
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={submitting || feedbackText.trim().length === 0}
                  sx={{
                    bgcolor: '#111111',
                    textTransform: 'none',
                    fontWeight: 700,
                    borderRadius: 2,
                    px: 3,
                    '&:hover': { bgcolor: '#000000' },
                  }}
                >
                  {submitting ? 'Submitting...' : 'Submit Feedback'}
                </Button>
              </Box>
            </Box>

            {/* My feedback history */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography sx={{ fontWeight: 700, fontSize: 16, color: '#0a1940' }}>
                Your Feedback History
              </Typography>
              <Typography sx={{ fontSize: 13, color: '#9ca3af' }}>
                {myFeedback.length} feedback{myFeedback.length !== 1 ? 's' : ''}
              </Typography>
            </Box>

            {loading ? (
              <Box sx={{ py: 8, textAlign: 'center', color: '#9ca3af' }}>
                <Typography>Loading...</Typography>
              </Box>
            ) : myFeedback.length === 0 ? (
              <Box
                sx={{
                  bgcolor: '#fff',
                  border: '2px dashed #e5e7eb',
                  borderRadius: 3,
                  textAlign: 'center',
                  py: 8,
                }}
              >
                <RateReviewIcon sx={{ fontSize: 48, color: '#d1d5db', mb: 2, display: 'block', mx: 'auto' }} />
                <Typography sx={{ fontWeight: 700, color: '#374151', fontSize: 16, mb: 1 }}>
                  No feedback yet
                </Typography>
                <Typography color="text.secondary" sx={{ fontSize: 14 }}>
                  Share your experience to help us improve.
                </Typography>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {myFeedback.map((fb, index) => (
                  <Box
                    key={fb._id}
                    sx={{
                      bgcolor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: 3,
                      p: 2.5,
                      '&:hover': { boxShadow: '0 4px 20px rgba(0,0,0,0.05)' },
                      transition: 'box-shadow 0.2s',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                      <Avatar
                        sx={{
                          bgcolor: AVATAR_COLORS[index % AVATAR_COLORS.length],
                          width: 34,
                          height: 34,
                          fontSize: 14,
                          fontWeight: 700,
                        }}
                      >
                        {(fb.userName || 'A')[0].toUpperCase()}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography sx={{ fontWeight: 700, fontSize: 13, color: '#0a1940' }}>
                          {fb.userName}
                        </Typography>
                        <Typography sx={{ fontSize: 11, color: '#9ca3af' }}>
                          {new Date(fb.createdAt).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}{' '}
                          at{' '}
                          {new Date(fb.createdAt).toLocaleTimeString('en-GB', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          px: 1.5,
                          py: 0.3,
                          borderRadius: 10,
                          bgcolor: fb.role === 'entrepreneur' ? '#ede9fe' : '#dbeafe',
                          color: fb.role === 'entrepreneur' ? '#7c3aed' : '#1d4ed8',
                          fontSize: 11,
                          fontWeight: 700,
                        }}
                      >
                        {fb.role === 'entrepreneur' ? 'Entrepreneur' : 'Investor'}
                      </Box>
                    </Box>
                    <Typography sx={{ fontSize: 14, color: '#374151', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                      {fb.text}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        </Box>

        <Footer />
      </Box>

      <Snackbar
        open={toast.open}
        autoHideDuration={3500}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity={toast.type} variant="filled" sx={{ width: '100%' }}>
          {toast.msg}
        </Alert>
      </Snackbar>
    </>
  )
}
