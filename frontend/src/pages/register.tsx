import { useState } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import {
  Box,
  Typography,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  Link,
  InputAdornment,
  IconButton,
  Paper,
  Alert,
  Grid,
  Snackbar,
} from '@mui/material'
import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch'
import PeopleIcon from '@mui/icons-material/People'
import { useFormik } from 'formik'
import * as Yup from 'yup'

const validationSchema = Yup.object({
  firstName: Yup.string()
    .min(2, 'First name must be at least 2 characters')
    .required('First name is required'),
  lastName: Yup.string()
    .min(2, 'Last name must be at least 2 characters')
    .required('Last name is required'),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
    .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .matches(/[0-9]/, 'Password must contain at least one number')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Confirm password is required'),
  userType: Yup.string()
    .oneOf(['entrepreneur', 'investor'], 'Please select a user type')
    .required('User type is required'),
  phoneNumber: Yup.string()
    .matches(/^[0-9]{10}$/, 'Phone number must be 10 digits'),
  agreeToTerms: Yup.boolean()
    .oneOf([true], 'You must agree to the terms of service')
    .required('You must agree to the terms of service'),
})

export default function Register() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const formik = useFormik({
    initialValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      userType: '',
      phoneNumber: '',
      agreeToTerms: false,
    },
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true)
      setError(null)
      
      try {
        const res = await fetch('http://localhost:5000/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            firstName: values.firstName,
            lastName: values.lastName,
            email: values.email,
            password: values.password,
            role: values.userType,
            phoneNumber: values.phoneNumber,
          }),
        })

        const data = await res.json()

        if (!res.ok) {
          throw new Error(data.message || 'Registration failed')
        }

        // Save token to localStorage
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))

        setSuccess(true)
        // Redirect to login after 2 seconds
        setTimeout(() => router.push('/login'), 2000)
      } catch (err: any) {
        setError(err.message || 'Registration failed. Please try again.')
      } finally {
        setLoading(false)
      }
    },
  })

  return (
    <>
      <Head>
        <title>Create Account – StartupSri</title>
        <meta name="description" content="Create your StartupSri account" />
      </Head>

      <Box sx={{ minHeight: '100vh', bgcolor: '#f0f2f5', display: 'flex', flexDirection: 'column' }}>
        {/* Minimal top bar */}
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
            onClick={() => router.push('/login')}
            sx={{ fontWeight: 600, color: 'text.secondary', textDecoration: 'none', '&:hover': { color: 'primary.main' } }}
          >
            Already have an account? <Box component="span" sx={{ color: 'primary.main' }}>Sign In</Box>
          </Link>
        </Box>

        {/* Centered card */}
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', px: 2, py: 4 }}>
          <Paper
            elevation={0}
            sx={{
              width: '100%', maxWidth: 520,
              p: { xs: 3.5, sm: 5 },
              borderRadius: 3,
              border: '1px solid', borderColor: 'grey.200',
              bgcolor: '#ffffff',
              boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
            }}
          >
            {/* Header */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Typography variant="h4" component="h1" sx={{ fontWeight: 800, mb: 0.75, letterSpacing: '-0.02em', color: '#0a1940' }}>
                Create Account
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Join StartupSri — connect, fund, and grow.
              </Typography>
            </Box>

            {/* Role selector pills */}
            <Box sx={{ display: 'flex', gap: 1.5, mb: 4 }}>
              {[
                { val: 'entrepreneur', label: 'Entrepreneur', icon: <RocketLaunchIcon sx={{ fontSize: 16 }} /> },
                { val: 'investor', label: 'Investor / Lender', icon: <PeopleIcon sx={{ fontSize: 16 }} /> },
              ].map((opt) => (
                <Box
                  key={opt.val}
                  onClick={() => formik.setFieldValue('userType', opt.val)}
                  sx={{
                    flex: 1, py: 1.5, borderRadius: 2, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1,
                    border: '1.5px solid',
                    borderColor: formik.values.userType === opt.val ? 'primary.main' : 'grey.300',
                    bgcolor: formik.values.userType === opt.val ? 'primary.50' : 'transparent',
                    background: formik.values.userType === opt.val ? 'linear-gradient(135deg,#e3f2fd,#bbdefb)' : 'transparent',
                    transition: 'all 0.15s',
                  }}
                >
                  <Box sx={{ color: formik.values.userType === opt.val ? 'primary.main' : 'text.secondary' }}>{opt.icon}</Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: formik.values.userType === opt.val ? 'primary.main' : 'text.secondary' }}>
                    {opt.label}
                  </Typography>
                </Box>
              ))}
            </Box>
            {formik.touched.userType && formik.errors.userType && (
              <Typography variant="caption" color="error" sx={{ display: 'block', mt: -3, mb: 2, ml: 0.5 }}>{formik.errors.userType}</Typography>
            )}

            {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

            <form onSubmit={formik.handleSubmit}>
              {/* Name row */}
              <Grid container spacing={2} sx={{ mb: 2.5 }}>
                <Grid item xs={6}>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', mb: 0.75, display: 'block', textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.7rem' }}>First Name</Typography>
                  <TextField
                    fullWidth id="firstName" name="firstName" placeholder="Amara"
                    value={formik.values.firstName} onChange={formik.handleChange} onBlur={formik.handleBlur}
                    error={formik.touched.firstName && Boolean(formik.errors.firstName)}
                    helperText={formik.touched.firstName && formik.errors.firstName}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: '#fafafa', '&:hover fieldset': { borderColor: 'primary.main' } } }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', mb: 0.75, display: 'block', textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.7rem' }}>Last Name</Typography>
                  <TextField
                    fullWidth id="lastName" name="lastName" placeholder="Silva"
                    value={formik.values.lastName} onChange={formik.handleChange} onBlur={formik.handleBlur}
                    error={formik.touched.lastName && Boolean(formik.errors.lastName)}
                    helperText={formik.touched.lastName && formik.errors.lastName}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: '#fafafa', '&:hover fieldset': { borderColor: 'primary.main' } } }}
                  />
                </Grid>
              </Grid>

              {/* Email */}
              <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', mb: 0.75, display: 'block', textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.7rem' }}>Email</Typography>
              <TextField
                fullWidth id="email" name="email" type="email" placeholder="you@example.com"
                value={formik.values.email} onChange={formik.handleChange} onBlur={formik.handleBlur}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
                sx={{ mb: 2.5, '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: '#fafafa', '&:hover fieldset': { borderColor: 'primary.main' } } }}
              />

              {/* Phone */}
              <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', mb: 0.75, display: 'block', textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.7rem' }}>Phone <Box component="span" sx={{ textTransform: 'none', fontWeight: 400 }}>(optional)</Box></Typography>
              <TextField
                fullWidth id="phoneNumber" name="phoneNumber" placeholder="0771234567"
                value={formik.values.phoneNumber} onChange={formik.handleChange} onBlur={formik.handleBlur}
                error={formik.touched.phoneNumber && Boolean(formik.errors.phoneNumber)}
                helperText={formik.touched.phoneNumber && formik.errors.phoneNumber}
                sx={{ mb: 2.5, '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: '#fafafa', '&:hover fieldset': { borderColor: 'primary.main' } } }}
              />

              {/* Password */}
              <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', mb: 0.75, display: 'block', textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.7rem' }}>Password</Typography>
              <TextField
                fullWidth id="password" name="password" placeholder="Min 8 chars, upper, lower, number"
                type={showPassword ? 'text' : 'password'}
                value={formik.values.password} onChange={formik.handleChange} onBlur={formik.handleBlur}
                error={formik.touched.password && Boolean(formik.errors.password)}
                helperText={formik.touched.password && formik.errors.password}
                sx={{ mb: 2.5, '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: '#fafafa', '&:hover fieldset': { borderColor: 'primary.main' } } }}
                InputProps={{ endAdornment: (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setShowPassword(!showPassword)} edge="end">
                      {showPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                )}}
              />

              {/* Confirm Password */}
              <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', mb: 0.75, display: 'block', textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.7rem' }}>Confirm Password</Typography>
              <TextField
                fullWidth id="confirmPassword" name="confirmPassword" placeholder="Repeat your password"
                type={showConfirmPassword ? 'text' : 'password'}
                value={formik.values.confirmPassword} onChange={formik.handleChange} onBlur={formik.handleBlur}
                error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
                helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
                sx={{ mb: 3, '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: '#fafafa', '&:hover fieldset': { borderColor: 'primary.main' } } }}
                InputProps={{ endAdornment: (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end">
                      {showConfirmPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                )}}
              />

              {/* Terms */}
              <FormControlLabel
                control={
                  <Checkbox id="agreeToTerms" name="agreeToTerms" checked={formik.values.agreeToTerms}
                    onChange={formik.handleChange} color="primary" size="small" />
                }
                label={
                  <Typography variant="body2" color="text.secondary">
                    I agree to the{' '}
                    <Link href="/terms" sx={{ fontWeight: 600, color: 'primary.main', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>Terms of Service</Link>
                    {' '}and{' '}
                    <Link href="/privacy" sx={{ fontWeight: 600, color: 'primary.main', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>Privacy Policy</Link>
                  </Typography>
                }
                sx={{ mb: 1, alignItems: 'flex-start', '& .MuiCheckbox-root': { pt: 0.5 } }}
              />
              {formik.touched.agreeToTerms && formik.errors.agreeToTerms && (
                <Typography variant="caption" color="error" display="block" sx={{ mb: 2, ml: 4 }}>{formik.errors.agreeToTerms}</Typography>
              )}

              <Button
                type="submit" variant="contained" fullWidth size="large"
                disabled={loading}
                sx={{
                  mt: 1, py: 1.5, fontWeight: 700, textTransform: 'none', fontSize: '1rem', borderRadius: 2,
                  bgcolor: '#0a1940', boxShadow: 'none',
                  '&:hover': { bgcolor: '#1565c0', boxShadow: '0 4px 16px rgba(21,101,192,0.35)' },
                  transition: 'all 0.2s',
                }}
              >
                {loading ? 'Creating Account…' : 'Create Account'}
              </Button>
            </form>

            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Already have an account?{' '}
                <Link
                  component="button" variant="body2"
                  onClick={() => router.push('/login')}
                  sx={{ fontWeight: 700, color: 'primary.main', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                >
                  Sign In
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
          Account created successfully! Redirecting to login...
        </Alert>
      </Snackbar>
    </>
  )
}
