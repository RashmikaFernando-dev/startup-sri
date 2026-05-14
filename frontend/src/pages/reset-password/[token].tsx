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
  IconButton,
  InputAdornment,
  Link,
} from '@mui/material'
import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import HomeIcon from '@mui/icons-material/Home'
import Tooltip from '@mui/material/Tooltip'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

export default function ResetPassword() {
  const router = useRouter()
  const { token } = router.query

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }
    if (!token) {
      setError('Invalid reset link')
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`${API}/auth/reset-password/${token}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Reset failed')
      setSuccess(true)
      setTimeout(() => router.push('/auth/login'), 2500)
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>Reset Password – StartupSri</title>
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
          <Tooltip title="Back to Home">
            <IconButton onClick={() => router.push('/')} sx={{ color: '#0a1940', '&:hover': { bgcolor: 'rgba(10,25,64,0.08)' } }}>
              <HomeIcon />
            </IconButton>
          </Tooltip>
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
            {success ? (
              /* ── Success state ── */
              <Box sx={{ textAlign: 'center' }}>
                <Box sx={{
                  width: 64, height: 64, borderRadius: '50%',
                  bgcolor: '#d1fae5', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', mx: 'auto', mb: 3,
                }}>
                  <CheckCircleOutlineIcon sx={{ fontSize: 32, color: '#065f46' }} />
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#0a1940', mb: 1 }}>
                  Password updated!
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Your password has been reset successfully. Redirecting you to Sign In…
                </Typography>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => router.push('/auth/login')}
                  sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700, bgcolor: '#111111', '&:hover': { bgcolor: '#000' }, boxShadow: 'none' }}
                >
                  Go to Sign In
                </Button>
              </Box>
            ) : (
              /* ── Form state ── */
              <>
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                  <Typography variant="h4" component="h1" sx={{ fontWeight: 800, mb: 0.75, letterSpacing: '-0.02em', color: '#0a1940' }}>
                    Set new password
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Must be at least 8 characters.
                  </Typography>
                </Box>

                {error && (
                  <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>
                )}

                <form onSubmit={handleSubmit}>
                  {/* New password */}
                  <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', mb: 0.75, display: 'block', textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.7rem' }}>
                    New Password
                  </Typography>
                  <TextField
                    fullWidth
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton size="small" onClick={() => setShowPassword(!showPassword)} edge="end">
                            {showPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      mb: 2.5,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2, bgcolor: '#fafafa',
                        '&:hover fieldset': { borderColor: 'primary.main' },
                        '&.Mui-focused fieldset': { borderWidth: 1.5 },
                      },
                    }}
                  />

                  {/* Confirm password */}
                  <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', mb: 0.75, display: 'block', textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.7rem' }}>
                    Confirm Password
                  </Typography>
                  <TextField
                    fullWidth
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton size="small" onClick={() => setShowConfirm(!showConfirm)} edge="end">
                            {showConfirm ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
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
                    {loading ? 'Resetting…' : 'Reset Password'}
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
