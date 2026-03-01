import { useState } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useAppDispatch, useAppSelector } from '@/hooks/useTypedSelector'
import { loginStart, loginSuccess, loginFailure } from '@/redux/slices/authSlice'
import {
  Box,
  Typography,
  TextField,
  Button,
  Link,
  Paper,
  Alert,
  Divider,
  IconButton,
  InputAdornment,
  Snackbar,
} from '@mui/material'
import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import { useFormik } from 'formik'
import * as Yup from 'yup'

const validationSchema = Yup.object({
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .required('Password is required'),
})

export default function Login() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { loading, error } = useAppSelector((s) => s.auth)
  const [success, setSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      dispatch(loginStart())

      try {
        const res = await fetch('http://localhost:5000/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: values.email, password: values.password }),
        })

        const data = await res.json()

        if (!res.ok) {
          throw new Error(data.message || 'Login failed')
        }

        // Persist to localStorage and update Redux store
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        dispatch(loginSuccess({ user: data.user, token: data.token }))

        setSuccess(true)
        // Redirect to dashboard after 1.5 seconds
        setTimeout(() => router.push('/user/dashboard'), 1500)
      } catch (err: any) {
        dispatch(loginFailure(err.message || 'Login failed. Please check your credentials.'))
      }
    },
  })

  return (
    <>
      <Head>
        <title>Sign In – StartupSri</title>
        <meta name="description" content="Sign in to your StartupSri account" />
      </Head>

      {/* Page wrapper */}
      <Box
        sx={{
          minHeight: '100vh',
          bgcolor: '#f0f2f5',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Minimal top bar */}
        <Box
          sx={{
            px: { xs: 3, md: 6 },
            py: 2.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box
            sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer' }}
            onClick={() => router.push('/')}
          >
            <Box
              component="img"
              src="/StartupSri.svg"
              alt="StartupSri Logo"
              sx={{ width: 36, height: 36, objectFit: 'contain' }}
            />
            <Typography
              variant="h6"
              sx={{ fontWeight: 800, color: '#0a1940', letterSpacing: '-0.02em' }}
            >
              StartupSri
            </Typography>
          </Box>
          <Link
            component="button"
            variant="body2"
            onClick={() => router.push('/register')}
            sx={{ fontWeight: 600, color: 'text.secondary', textDecoration: 'none', '&:hover': { color: 'primary.main' } }}
          >
            Don't have an account? <Box component="span" sx={{ color: 'primary.main' }}>Sign Up</Box>
          </Link>
        </Box>

        {/* Centered card area */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            px: 2,
            py: 4,
          }}
        >
          <Paper
            elevation={0}
            sx={{
              width: '100%',
              maxWidth: 420,
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
              <Typography
                variant="h4"
                component="h1"
                sx={{ fontWeight: 800, mb: 0.75, letterSpacing: '-0.02em', color: '#0a1940' }}
              >
                Sign In
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Welcome back to StartupSri
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                {error}
              </Alert>
            )}

            <form onSubmit={formik.handleSubmit}>
              {/* Email */}
              <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', mb: 0.75, display: 'block', textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.7rem' }}>
                Email
              </Typography>
              <TextField
                fullWidth
                id="email"
                name="email"
                placeholder="john@example.com"
                type="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
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
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.75 }}>
                <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.7rem' }}>
                  Password
                </Typography>
                <Link
                  component="button"
                  type="button"
                  variant="caption"
                  onClick={() => router.push('/forgot-password')}
                  sx={{ fontWeight: 600, color: 'primary.main', textDecoration: 'none', fontSize: '0.75rem', '&:hover': { textDecoration: 'underline' } }}
                >
                  Forgot password?
                </Link>
              </Box>
              <TextField
                fullWidth
                id="password"
                name="password"
                placeholder="••••••••"
                type={showPassword ? 'text' : 'password'}
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.password && Boolean(formik.errors.password)}
                helperText={formik.touched.password && formik.errors.password}
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
                      <IconButton size="small" onClick={() => setShowPassword(!showPassword)} edge="end">
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
                  bgcolor: '#0a1940',
                  boxShadow: 'none',
                  '&:hover': { bgcolor: '#1565c0', boxShadow: '0 4px 16px rgba(21,101,192,0.35)' },
                  transition: 'all 0.2s',
                }}
              >
                {loading ? 'Signing in…' : 'Sign In'}
              </Button>
            </form>

            <Divider sx={{ my: 3, '& .MuiDivider-wrapper': { px: 2 } }}>
              <Typography variant="caption" color="text.disabled" sx={{ fontWeight: 500 }}>OR</Typography>
            </Divider>

            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Do not have an account?{' '}
                <Link
                  component="button"
                  variant="body2"
                  onClick={() => router.push('/register')}
                  sx={{ fontWeight: 700, color: 'primary.main', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                >
                  Sign Up
                </Link>
              </Typography>
            </Box>
          </Paper>
        </Box>

        {/* Minimal footer */}
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
      >
        <Alert severity="success" variant="filled" sx={{ width: '100%', fontSize: '1rem' }}>
          Login successful! Redirecting...
        </Alert>
      </Snackbar>
    </>
  )
}
