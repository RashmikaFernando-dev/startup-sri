import { useState } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Link,
  InputAdornment,
  Paper,
  Alert,
} from '@mui/material'
import PersonIcon from '@mui/icons-material/Person'
import EmailIcon from '@mui/icons-material/Email'
import LockIcon from '@mui/icons-material/Lock'
import GroupIcon from '@mui/icons-material/Group'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import Layout from '@/components/layout/Layout'

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
  const [loading, setLoading] = useState(false)

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
        // TODO: API call to register user
        console.log('Form values:', values)
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500))
        
        // Redirect to login or dashboard
        router.push('/login')
      } catch (err: any) {
        setError(err.message || 'Registration failed. Please try again.')
      } finally {
        setLoading(false)
      }
    },
  })

  return (
    <Layout>
      <Head>
        <title>Register - StartupSri</title>
        <meta name="description" content="Create your StartupSri account" />
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
              Create your account
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Join our community of entrepreneurs and investors.
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
              <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <TextField
                  fullWidth
                  id="firstName"
                  name="firstName"
                  label="First Name"
                  value={formik.values.firstName}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.firstName && Boolean(formik.errors.firstName)}
                  helperText={formik.touched.firstName && formik.errors.firstName}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  fullWidth
                  id="lastName"
                  name="lastName"
                  label="Last Name"
                  value={formik.values.lastName}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.lastName && Boolean(formik.errors.lastName)}
                  helperText={formik.touched.lastName && formik.errors.lastName}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>

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
                id="phoneNumber"
                name="phoneNumber"
                label="Phone Number (Optional)"
                value={formik.values.phoneNumber}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.phoneNumber && Boolean(formik.errors.phoneNumber)}
                helperText={formik.touched.phoneNumber && formik.errors.phoneNumber}
                sx={{ mb: 3 }}
                placeholder="0771234567"
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
                sx={{ mb: 3 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth
                id="confirmPassword"
                name="confirmPassword"
                label="Confirm Password"
                type="password"
                value={formik.values.confirmPassword}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
                helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
                sx={{ mb: 3 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />

              <FormControl
                fullWidth
                error={formik.touched.userType && Boolean(formik.errors.userType)}
                sx={{ mb: 3 }}
              >
                <InputLabel id="userType-label">Select User Type</InputLabel>
                <Select
                  labelId="userType-label"
                  id="userType"
                  name="userType"
                  value={formik.values.userType}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  label="Select User Type"
                  startAdornment={
                    <InputAdornment position="start">
                      <GroupIcon color="action" />
                    </InputAdornment>
                  }
                >
                  <MenuItem value="entrepreneur">Entrepreneur</MenuItem>
                  <MenuItem value="investor">Investor / Lender</MenuItem>
                </Select>
                {formik.touched.userType && formik.errors.userType && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 2 }}>
                    {formik.errors.userType}
                  </Typography>
                )}
              </FormControl>

              <FormControlLabel
                control={
                  <Checkbox
                    id="agreeToTerms"
                    name="agreeToTerms"
                    checked={formik.values.agreeToTerms}
                    onChange={formik.handleChange}
                    color="primary"
                  />
                }
                label={
                  <Typography variant="body2">
                    I agree to the{' '}
                    <Link href="/terms" color="primary" sx={{ fontWeight: 600 }}>
                      Terms of Service
                    </Link>
                  </Typography>
                }
                sx={{ mb: 3 }}
              />
              {formik.touched.agreeToTerms && formik.errors.agreeToTerms && (
                <Typography variant="caption" color="error" display="block" sx={{ mt: -2, mb: 2, ml: 4 }}>
                  {formik.errors.agreeToTerms}
                </Typography>
              )}

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
                {loading ? 'Creating Account...' : 'Sign Up'}
              </Button>
            </form>

            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Already have an account?{' '}
                <Link
                  href="/login"
                  color="primary"
                  sx={{ fontWeight: 600, cursor: 'pointer' }}
                  onClick={(e) => {
                    e.preventDefault()
                    router.push('/login')
                  }}
                >
                  Log in
                </Link>
              </Typography>
            </Box>
          </Paper>
        </Container>
      </Box>
    </Layout>
  )
}
