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

      <Box sx={{ minHeight: '100vh', bgcolor: '#f3f4f6', display: 'flex', flexDirection: 'column' }}>

        {/* Top bar */}
        <Box sx={{
          bgcolor: '#fff', borderBottom: '1px solid #e5e7eb',
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
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0a1940', letterSpacing: '-0.02em' }}>
              StartupSri
            </Typography>
          </Box>
        </Box>

        {/* Login card */}
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', px: 2, py: 6 }}>
          <Paper elevation={0} sx={{
            width: '100%', maxWidth: 420,
            border: '1px solid #e5e7eb', borderRadius: 3, p: { xs: 3, sm: 4 },
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
                    mt: 1, py: 1.3, bgcolor: '#0a1940', borderRadius: 2,
                    fontWeight: 700, fontSize: '0.95rem', textTransform: 'none',
                    '&:hover': { bgcolor: '#162d6e' },
                  }}
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </Button>
              </Box>
            </form>
          </Paper>
        </Box>

        {/* Footer */}
        <Box sx={{ bgcolor: '#fff', borderTop: '1px solid #e5e7eb' }}>
          <Box sx={{ maxWidth: 1100, mx: 'auto', px: { xs: 2, md: 4 }, py: 6, display: 'flex', flexWrap: 'wrap', gap: 4, justifyContent: 'space-between' }}>
            <Box sx={{ maxWidth: 240 }}>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#0a1940', mb: 1 }}>StartupSri</Typography>
              <Typography variant="body2" color="text.secondary">
                Connecting visionary startups with strategic investors to build the future together.
              </Typography>
            </Box>
            {[
              { title: 'Platform', links: ['How It Works', 'Features', 'Pricing', 'Success Stories'] },
              { title: 'Company', links: ['About Us', 'Careers', 'Blog', 'Press'] },
              { title: 'Resources', links: ['Help Center', 'Community', 'Investor Guide', 'Startup Guide'] },
            ].map(col => (
              <Box key={col.title}>
                <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, color: '#374151' }}>
                  {col.title}
                </Typography>
                <Box sx={{ mt: 1.5, display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {col.links.map(link => (
                    <Typography key={link} variant="body2" color="text.secondary" sx={{ cursor: 'pointer', '&:hover': { color: '#0a1940' } }}>
                      {link}
                    </Typography>
                  ))}
                </Box>
              </Box>
            ))}
          </Box>
          <Box sx={{ borderTop: '1px solid #e5e7eb', py: 2, px: { xs: 2, md: 4 }, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
            <Typography variant="caption" color="text.disabled">© 2026 StartupSri. All rights reserved.</Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              {['Terms', 'Privacy', 'Cookies', 'Security', 'Accessibility'].map(item => (
                <Typography key={item} variant="caption" color="text.disabled" sx={{ cursor: 'pointer', '&:hover': { color: '#0a1940' } }}>
                  {item}
                </Typography>
              ))}
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  )
}
