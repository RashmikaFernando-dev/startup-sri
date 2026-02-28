import { AppBar, Toolbar, Typography, Button, Box, Container, IconButton, useMediaQuery, useTheme } from '@mui/material'
import { useRouter } from 'next/router'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '@/redux/store'
import { logout } from '@/redux/slices/authSlice'

export default function Navbar() {
  const router = useRouter()
  const dispatch = useDispatch()

  const scrollTo = (id: string) => {
    if (router.pathname === '/') {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    } else {
      router.push(`/#${id}`)
    }
  }
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth)

  const handleLogout = () => {
    dispatch(logout())
    router.push('/')
  }

  return (
    <AppBar 
      position="sticky" 
      sx={{ 
        bgcolor: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        borderBottom: '1px solid rgba(25, 118, 210, 0.2)',
      }}
    >
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ py: 0.5 }}>
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1.5,
              cursor: 'pointer',
              flexGrow: 1 
            }}
            onClick={() => router.push('/')}
          >
            <Box
              component="img"
              src="/StartupSri.svg"
              alt="StartupSri Logo"
              sx={{
                width: 80,
                height: 80,
                objectFit: 'contain',
              }}
            />
            <Typography
              variant="h6"
              component="div"
              sx={{ 
                fontWeight: 700,
                color: 'grey.900',
                fontSize: '1.25rem',
              }}
            >
              StartupSri
            </Typography>
          </Box>

          {!isMobile && (
            <Box sx={{ display: 'flex', gap: 4, mr: 4 }}>
              <Button 
                sx={{ 
                  color: 'grey.700',
                  textTransform: 'none',
                  fontWeight: 500,
                  fontSize: '0.9rem',
                  '&:hover': {
                    color: 'primary.main',
                    bgcolor: 'transparent',
                  }
                }}
                onClick={() => scrollTo('features')}
              >
                About
              </Button>
              <Button 
                sx={{ 
                  color: 'grey.700',
                  textTransform: 'none',
                  fontWeight: 500,
                  fontSize: '0.9rem',
                  '&:hover': {
                    color: 'primary.main',
                    bgcolor: 'transparent',
                  }
                }}
                onClick={() => scrollTo('opportunities')}
              >
                Projects
              </Button>
              <Button 
                sx={{ 
                  color: 'grey.700',
                  textTransform: 'none',
                  fontWeight: 500,
                  fontSize: '0.9rem',
                  '&:hover': {
                    color: 'primary.main',
                    bgcolor: 'transparent',
                  }
                }}
                onClick={() => scrollTo('how-it-works')}
              >
                How it Works
              </Button>
            </Box>
          )}

          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
            {isAuthenticated ? (
              <>
                <Button 
                  variant="outlined"
                  onClick={() => router.push('/dashboard')}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 600,
                    borderRadius: 1.5,
                    px: 2.5,
                  }}
                >
                  Dashboard
                </Button>
                <Button 
                  variant="outlined"
                  color="error"
                  onClick={handleLogout}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 600,
                    borderRadius: 1.5,
                    px: 2.5,
                  }}
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button 
                  onClick={() => router.push('/login')}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 600,
                    borderRadius: 1.5,
                    px: 2.5,
                    bgcolor: 'rgba(25, 118, 210, 0.1)',
                    color: 'primary.main',
                    '&:hover': {
                      bgcolor: 'rgba(25, 118, 210, 0.2)',
                    }
                  }}
                >
                  Login
                </Button>
                <Button
                  variant="contained"
                  onClick={() => router.push('/register')}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 600,
                    borderRadius: 1.5,
                    px: 2.5,
                    boxShadow: 'none',
                    '&:hover': {
                      boxShadow: 'none',
                      opacity: 0.9,
                    }
                  }}
                >
                  Get Started
                </Button>
              </>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  )
}
