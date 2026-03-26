import { Box, Typography, Button, IconButton, Tooltip } from '@mui/material'
import { useRouter } from 'next/router'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '@/redux/store'
import { logout } from '@/redux/slices/authSlice'

export default function Navbar() {
  const router = useRouter()
  const dispatch = useDispatch()
  const { isAuthenticated } = useSelector((state: RootState) => state.auth)

  const scrollTo = (id: string) => {
    if (router.pathname === '/') {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    } else {
      router.push(`/#${id}`)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    dispatch(logout())
    router.push('/')
  }

  return (
    <Box sx={{
      bgcolor: '#fff',
      borderBottom: '1px solid #e5e7eb',
      px: { xs: 2, md: 4 },
      py: 1.5,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      {/* Logo */}
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

      {/* Nav links */}
      <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 0.5 }}>
        {[
          { label: 'About', id: 'features' },
          { label: 'Projects', id: 'opportunities' },
          { label: 'How it Works', id: 'how-it-works' },
        ].map(item => (
          <Button
            key={item.id}
            onClick={() => scrollTo(item.id)}
            sx={{
              color: '#374151',
              textTransform: 'none',
              fontWeight: 500,
              fontSize: '0.9rem',
              borderRadius: 2,
              px: 2,
              '&:hover': { bgcolor: '#f3f4f6', color: '#0a1940' },
            }}
          >
            {item.label}
          </Button>
        ))}
      </Box>

      {/* Auth buttons */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {isAuthenticated ? (
          <>
            <Button
              onClick={() => router.push('/user/dashboard')}
              sx={{
                color: '#111111', textTransform: 'none', fontWeight: 600,
                fontSize: '0.875rem', borderRadius: 2, px: 2,
                '&:hover': { bgcolor: '#f3f4f6', color: '#000000' },
              }}
            >
              Dashboard
            </Button>
            <Button
              variant="outlined"
              onClick={handleLogout}
              sx={{
                textTransform: 'none', fontWeight: 600, fontSize: '0.875rem',
                borderRadius: 2, px: 2.5, borderColor: '#111111', color: '#111111',
                '&:hover': { borderColor: '#000000', color: '#000000', bgcolor: 'rgba(0,0,0,0.04)' },
              }}
            >
              Logout
            </Button>
          </>
        ) : (
          <>
            <Button
              onClick={() => router.push('/auth/login')}
              sx={{
                color: '#111111', textTransform: 'none', fontWeight: 600,
                fontSize: '0.875rem', borderRadius: 2, px: 2,
                '&:hover': { bgcolor: '#f3f4f6', color: '#000000' },
              }}
            >
              Login
            </Button>
            <Button
              variant="contained"
              onClick={() => router.push('/auth/register')}
              sx={{
                textTransform: 'none', fontWeight: 700, fontSize: '0.875rem',
                borderRadius: 2, px: 2.5, bgcolor: '#111111', boxShadow: 'none',
                '&:hover': { bgcolor: '#000000', boxShadow: 'none' },
              }}
            >
              Get Started
            </Button>
          </>
        )}
      </Box>
    </Box>
  )
}

