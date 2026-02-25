import { useState } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Link,
  InputAdornment,
  Paper,
  Alert,
  Divider,
} from '@mui/material'
import EmailIcon from '@mui/icons-material/Email'
import LockIcon from '@mui/icons-material/Lock'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import Layout from '@/components/layout/Layout'

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
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true)
      setError(null)
      
      try {
        // TODO: API call to login user
        console.log('Login values:', values)
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500))
        
        // Redirect to dashboard
        router.push('/dashboard')
      } catch (err: any) {
        setError(err.message || 'Login failed. Please check your credentials.')
      } finally {
        setLoading(false)
      }
    },
  })

  return (
    <Layout>
      <Head>
        <title>Login - StartupSri</title>
        <meta name="description" content="Login to your StartupSri account" />
      </Head>

      <Box
        sx={{
          minHeight: 'calc(100vh - 200px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 8,
          px: 2,
        }}
      >
        <Container maxWidth="sm">
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography
              variant="h3"
              component="h1"
              sx={{
                fontWeight: 800,
                mb: 1,
                fontSize: { xs: '2rem', sm: '2.5rem' },
              }}
            >
              Welcome back
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Sign in to your account to continue
            </Typography>
          </Box>

          <Paper
            elevation={0}
            sx={{
              p: 4,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
            }}
          >
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <form onSubmit={formik.handleSubmit}>
              <TextField
                fullWidth
                id="email"
                name="email"
                label="Email Address"
                type="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
                sx={{ mb: 3 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth
                id="password"
                name="password"
                label="Password"
                type="password"
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.password && Boolean(formik.errors.password)}
                helperText={formik.touched.password && formik.errors.password}
                sx={{ mb: 2 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />

              <Box sx={{ textAlign: 'right', mb: 3 }}>
                <Link
                  href="/forgot-password"
                  color="primary"
                  variant="body2"
                  sx={{ fontWeight: 600, cursor: 'pointer' }}
                  onClick={(e) => {
                    e.preventDefault()
                    router.push('/forgot-password')
                  }}
                >
                  Forgot password?
                </Link>
              </Box>

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
                }}
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </Button>
            </form>

            <Divider sx={{ my: 3 }}>
              <Typography variant="body2" color="text.secondary">
                OR
              </Typography>
            </Divider>

            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Don't have an account?{' '}
                <Link
                  href="/register"
                  color="primary"
                  sx={{ fontWeight: 600, cursor: 'pointer' }}
                  onClick={(e) => {
                    e.preventDefault()
                    router.push('/register')
                  }}
                >
                  Sign up
                </Link>
              </Typography>
            </Box>
          </Paper>
        </Container>
      </Box>
    </Layout>
  )
}
