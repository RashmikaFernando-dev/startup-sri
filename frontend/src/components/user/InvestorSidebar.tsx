import { Box, Typography, Button } from '@mui/material'
import { useRouter } from 'next/router'
import ExploreIcon from '@mui/icons-material/Explore'
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet'
import PersonIcon from '@mui/icons-material/Person'
import SettingsIcon from '@mui/icons-material/Settings'

const NAV = [
  { key: 'projects',  label: 'Explore Projects', icon: <ExploreIcon fontSize="small" />,              href: '/user/projects'  },
  { key: 'portfolio', label: 'My Portfolio',      icon: <AccountBalanceWalletIcon fontSize="small" />, href: '/user/portfolio' },
  { key: 'profile',   label: 'Profile',           icon: <PersonIcon fontSize="small" />,               href: '/user/profile'   },
  { key: 'settings',  label: 'Settings',          icon: <SettingsIcon fontSize="small" />,             href: '/user/profile'   },
]

export default function InvestorSidebar({ active }: { active: 'projects' | 'portfolio' | 'profile' | 'settings' }) {
  const router = useRouter()

  return (
    <>
      {/* Desktop sidebar */}
      <Box sx={{
        width: 200, flexShrink: 0,
        bgcolor: '#fff', borderRadius: 3, border: '1px solid #e5e7eb',
        p: 2, height: 'fit-content',
        display: { xs: 'none', md: 'block' },
      }}>
        <Typography variant="caption" sx={{ color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, px: 1 }}>
          Investor
        </Typography>
        <Box sx={{ mt: 1.5, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          {NAV.map(item => {
            const isActive = item.key === active
            return (
              <Box
                key={item.key}
                onClick={() => router.push(item.href)}
                sx={{
                  display: 'flex', alignItems: 'center', gap: 1.5,
                  px: 2, py: 1.2, borderRadius: 2, cursor: 'pointer',
                  bgcolor: isActive ? '#111111' : 'transparent',
                  color: isActive ? '#fff' : '#374151',
                  fontWeight: isActive ? 700 : 400,
                  fontSize: '0.875rem',
                  transition: 'all 0.15s',
                  '&:hover': { bgcolor: isActive ? '#000' : '#f3f4f6' },
                }}
              >
                {item.icon}
                {item.label}
              </Box>
            )
          })}
        </Box>
      </Box>

      {/* Mobile tab strip */}
      <Box sx={{ display: { xs: 'flex', md: 'none' }, gap: 1, mb: 2 }}>
        {NAV.map(item => {
          const isActive = item.key === active
          return (
            <Button
              key={item.key}
              size="small"
              variant={isActive ? 'contained' : 'outlined'}
              startIcon={item.icon}
              onClick={() => router.push(item.href)}
              sx={{
                borderRadius: 2, textTransform: 'none', fontWeight: 700,
                bgcolor: isActive ? '#111111' : undefined,
                color: isActive ? '#fff' : '#111111',
                borderColor: '#111111',
                '&:hover': { bgcolor: isActive ? '#000' : 'rgba(0,0,0,0.04)', borderColor: '#000' },
              }}
            >
              {item.label}
            </Button>
          )
        })}
      </Box>
    </>
  )
}
