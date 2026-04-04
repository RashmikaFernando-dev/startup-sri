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
  InputAdornment,
  IconButton,
} from '@mui/material'
import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'
import Footer from '@/components/layout/Footer'

export default function AdminLogin() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!email || !password) {
      setError('Please enter both email and password.'); return
    }

    setLoading(true)
    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.message || 'Login failed')

      // Only allow admin role
      if (data.user.role !== 'admin') {
        throw new Error('Access denied. Admin accounts only.')
      }

      localStorage.setItem('adminToken', data.token)
      localStorage.setItem('adminUser', JSON.stringify(data.user))

      router.push('/admin/dashboard')
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

      <Box sx={{
        minHeight: '100vh',
        background: 'linear-gradient(95deg, #101224 0%, #22274a 100%)',
        display: 'flex',
        flexDirection: 'column',
      }}>

        {/* Top bar */}
        <Box sx={{
          background: 'linear-gradient(95deg, #101224 0%, #22274a 100%)',
          borderBottom: '1px solid rgba(255,255,255,0.12)',
          px: { xs: 3, md: 6 }, py: 1.8,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <Box
            sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer' }}
            onClick={() => router.push('/')}
          >
            <Box
              component="img" src="/StartupSri.svg" alt="logo"
              sx={{ width: 30, height: 30, objectFit: 'contain' }}
              onError={(e: any) => { e.target.style.display = 'none' }}
            />
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
              StartupSri
            </Typography>
          </Box>
        </Box>

        {/* Login card */}
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', px: 2, py: 6 }}>
          <Paper elevation={0} sx={{
            width: '100%', maxWidth: 420,
            bgcolor: '#eef1f7',
            border: '1px solid rgba(255,255,255,0.22)', borderRadius: 3, p: { xs: 3, sm: 4 },
          }}>
            {/* Icon + Title */}
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Box sx={{
                width: 56, height: 56, borderRadius: '50%',
                bgcolor: '#0a1940', display: 'flex', alignItems: 'center', justifyContent: 'center',
                mx: 'auto', mb: 2,
              }}>
                <AdminPanelSettingsIcon sx={{ color: '#fff', fontSize: 28 }} />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#0a1940' }}>
                Admin Portal
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Sign in to access the StartupSri admin dashboard
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Email
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="admin@startupsri.lk"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    sx={{ mt: 0.5 }}
                    autoComplete="email"
                  />
                </Box>

                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Password
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    sx={{ mt: 0.5 }}
                    autoComplete="current-password"
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
                </Box>

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={loading}
                  sx={{
                      mt: 1, py: 1.3, bgcolor: '#111111', borderRadius: 2,
                    fontWeight: 700, fontSize: '0.95rem', textTransform: 'none',
                      '&:hover': { bgcolor: '#000000' },
                  }}
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </Button>
              </Box>
            </form>
          </Paper>
        </Box>

        <Footer />
      </Box>
    </>
  )
}
