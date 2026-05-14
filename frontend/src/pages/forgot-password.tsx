import { useState } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  Link,
  IconButton,
} from '@mui/material'
import HomeIcon from '@mui/icons-material/Home'
import Tooltip from '@mui/material/Tooltip'
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

export default function ForgotPassword() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email.trim()) {
      setError('Please enter your email address')
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`${API}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Something went wrong')
      setSent(true)
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>Forgot Password – StartupSri</title>
      </Head>

      <Box sx={{ minHeight: '100vh', bgcolor: '#f0f2f5', display: 'flex', flexDirection: 'column' }}>

        {/* Top bar */}
        <Box sx={{ px: { xs: 3, md: 6 }, py: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer' }} onClick={() => router.push('/')}>
            <Box component="img" src="/StartupSri.svg" alt="StartupSri Logo" sx={{ width: 36, height: 36, objectFit: 'contain' }} />
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0a1940', letterSpacing: '-0.02em' }}>
              StartupSri
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title="Back to Home">
              <IconButton onClick={() => router.push('/')} sx={{ color: '#0a1940', '&:hover': { bgcolor: 'rgba(10,25,64,0.08)' } }}>
                <HomeIcon />
              </IconButton>
            </Tooltip>
            <Link
              component="button"
              variant="body2"
              onClick={() => router.push('/auth/login')}
              sx={{ fontWeight: 600, color: 'text.secondary', textDecoration: 'none', '&:hover': { color: 'primary.main' } }}
            >
              Back to <Box component="span" sx={{ color: 'primary.main' }}>Sign In</Box>
            </Link>
          </Box>
        </Box>

        {/* Card */}
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', px: 2, py: 4 }}>
          <Paper
            elevation={0}
            sx={{
              width: '100%', maxWidth: 420,
              p: { xs: 3.5, sm: 5 },
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'grey.200',
              bgcolor: '#ffffff',
              boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
            }}
          >
            {sent ? (
              /* ── Success state ── */
              <Box sx={{ textAlign: 'center' }}>
                <Box sx={{
                  width: 64, height: 64, borderRadius: '50%',
                  bgcolor: '#d1fae5', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', mx: 'auto', mb: 3,
                }}>
                  <MarkEmailReadIcon sx={{ fontSize: 32, color: '#065f46' }} />
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#0a1940', mb: 1 }}>
                  Check your inbox
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3, lineHeight: 1.7 }}>
                  If <strong>{email}</strong> is registered, a password reset link has been sent.
                  The link expires in <strong>15 minutes</strong>.
                </Typography>
                <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mb: 3 }}>
                  Didn't receive it? Check your spam folder, or try again.
                </Typography>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<ArrowBackIcon />}
                  onClick={() => { setSent(false); setEmail('') }}
                  sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700, borderColor: '#111', color: '#111', '&:hover': { borderColor: '#000', bgcolor: 'rgba(0,0,0,0.04)' } }}
                >
                  Try a different email
                </Button>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => router.push('/auth/login')}
                  sx={{ mt: 1.5, borderRadius: 2, textTransform: 'none', fontWeight: 700, bgcolor: '#111111', '&:hover': { bgcolor: '#000' }, boxShadow: 'none' }}
                >
                  Back to Sign In
                </Button>
              </Box>
            ) : (
              /* ── Form state ── */
              <>
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                  <Typography variant="h4" component="h1" sx={{ fontWeight: 800, mb: 0.75, letterSpacing: '-0.02em', color: '#0a1940' }}>
                    Forgot password?
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Enter your email and we'll send you a reset link.
                  </Typography>
                </Box>

                {error && (
                  <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>
                )}

                <form onSubmit={handleSubmit}>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', mb: 0.75, display: 'block', textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.7rem' }}>
                    Email address
                  </Typography>
                  <TextField
                    fullWidth
                    type="email"
                    placeholder="john@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    sx={{
                      mb: 3.5,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2, bgcolor: '#fafafa',
                        '&:hover fieldset': { borderColor: 'primary.main' },
                        '&.Mui-focused fieldset': { borderWidth: 1.5 },
                      },
                    }}
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    size="large"
                    disabled={loading}
                    sx={{
                      py: 1.5, fontWeight: 700, textTransform: 'none', fontSize: '1rem',
                      borderRadius: 2, bgcolor: '#111111', boxShadow: 'none',
                      '&:hover': { bgcolor: '#000000', boxShadow: '0 4px 16px rgba(0,0,0,0.35)' },
                    }}
                  >
                    {loading ? 'Sending…' : 'Send Reset Link'}
                  </Button>
                </form>

                <Box sx={{ textAlign: 'center', mt: 3 }}>
                  <Link
                    component="button"
                    variant="body2"
                    onClick={() => router.push('/auth/login')}
                    sx={{ fontWeight: 600, color: 'text.secondary', textDecoration: 'none', '&:hover': { color: 'primary.main' } }}
                  >
                    ← Back to Sign In
                  </Link>
                </Box>
              </>
            )}
          </Paper>
        </Box>
      </Box>
    </>
  )
}
