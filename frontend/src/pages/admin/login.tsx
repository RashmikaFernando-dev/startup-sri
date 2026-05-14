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
  Snackbar,
  Fade,
  Tooltip,
} from '@mui/material'
import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import HomeIcon from '@mui/icons-material/Home'
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'


export default function AdminLogin() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!email || !password) {
      setError('Please enter both email and password.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Login failed')

      if (data.user.role !== 'admin') {
        throw new Error('Access denied. Admin accounts only.')
      }

      localStorage.setItem('adminToken', data.token)
      localStorage.setItem('adminUser', JSON.stringify(data.user))

      setSuccess(true)
      setTimeout(() => router.push('/admin/dashboard'), 1500)
    } catch (err: any) {
      setError(err.message || 'Login failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>Admin Portal – StartupSri</title>
      </Head>

      <Box sx={{ minHeight: '100vh', bgcolor: '#f0f2f5', display: 'flex', flexDirection: 'column' }}>

        {/* Top bar */}
        <Box sx={{ px: { xs: 3, md: 6 }, py: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box
            sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer' }}
            onClick={() => router.push('/')}
          >
            <Box
              component="img"
              src="/StartupSri.svg"
              alt="StartupSri Logo"
              sx={{ width: 36, height: 36, objectFit: 'contain' }}
              onError={(e: any) => { e.target.style.display = 'none' }}
            />
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0a1940', letterSpacing: '-0.02em' }}>
              StartupSri
            </Typography>
          </Box>

          <Tooltip title="Back to Home">
            <IconButton
              onClick={() => router.push('/')}
              sx={{ color: '#0a1940', '&:hover': { bgcolor: 'rgba(10,25,64,0.08)' } }}
            >
              <HomeIcon />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Centered card */}
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
            {/* Header */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Box sx={{
                width: 56, height: 56, borderRadius: '50%',
                bgcolor: '#0a1940',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                mx: 'auto', mb: 2,
              }}>
                <AdminPanelSettingsIcon sx={{ color: '#fff', fontSize: 28 }} />
              </Box>
              <Typography
                variant="h4"
                component="h1"
                sx={{ fontWeight: 800, mb: 0.75, letterSpacing: '-0.02em', color: '#0a1940' }}
              >
                Admin Portal
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Sign in to access the StartupSri admin dashboard
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              {/* Email */}
              <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', mb: 0.75, display: 'block', textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.7rem' }}>
                Email
              </Typography>
              <TextField
                fullWidth
                placeholder="admin@startupsri.lk"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
                sx={{
                  mb: 2.5,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    bgcolor: '#fafafa',
                    '&:hover fieldset': { borderColor: 'primary.main' },
                    '&.Mui-focused fieldset': { borderWidth: 1.5 },
                  },
                }}
              />

              {/* Password */}
              <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', mb: 0.75, display: 'block', textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.7rem' }}>
                Password
              </Typography>
              <TextField
                fullWidth
                placeholder="••••••••"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
                sx={{
                  mb: 3.5,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    bgcolor: '#fafafa',
                    '&:hover fieldset': { borderColor: 'primary.main' },
                    '&.Mui-focused fieldset': { borderWidth: 1.5 },
                  },
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setShowPassword(v => !v)} edge="end">
                        {showPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                disabled={loading}
                sx={{
                  py: 1.5,
                  fontWeight: 700,
                  textTransform: 'none',
                  fontSize: '1rem',
                  borderRadius: 2,
                  bgcolor: '#111111',
                  boxShadow: 'none',
                  '&:hover': { bgcolor: '#000000', boxShadow: '0 4px 16px rgba(0,0,0,0.35)' },
                  transition: 'all 0.2s',
                }}
              >
                {loading ? 'Signing in…' : 'Sign In'}
              </Button>
            </form>
          </Paper>
        </Box>

        {/* Footer */}
        <Box sx={{ py: 3, textAlign: 'center' }}>
          <Typography variant="caption" color="text.disabled">
            © 2026 StartupSri. All rights reserved.
          </Typography>
        </Box>
      </Box>

      {/* Success Snackbar */}
      <Snackbar
        open={success}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        autoHideDuration={3000}
        TransitionComponent={Fade}
        sx={{ top: { xs: 16, sm: 24 } }}
      >
        <Box sx={{
          display: 'flex', alignItems: 'center', gap: 1.5,
          px: 2.8, py: 1.6, borderRadius: '16px', minWidth: 300,
          background: 'rgba(220, 255, 235, 0.25)',
          backdropFilter: 'blur(18px)',
          WebkitBackdropFilter: 'blur(18px)',
          border: '1px solid rgba(16, 185, 129, 0.35)',
        }}>
          <Box sx={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'rgba(16, 185, 129, 0.2)',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <CheckCircleOutlineIcon sx={{ color: '#059669', fontSize: 18 }} />
          </Box>
          <Typography sx={{ fontWeight: 700, fontSize: '0.88rem', color: '#064e3b', letterSpacing: '0.01em' }}>
            Login successful! Redirecting…
          </Typography>
        </Box>
      </Snackbar>
    </>
  )
}
