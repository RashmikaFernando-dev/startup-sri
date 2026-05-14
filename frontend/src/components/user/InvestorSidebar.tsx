import { Box, Typography, Button } from '@mui/material'
import { useRouter } from 'next/router'
import ExploreIcon from '@mui/icons-material/Explore'
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet'
import PersonIcon from '@mui/icons-material/Person'
import SettingsIcon from '@mui/icons-material/Settings'
import RateReviewIcon from '@mui/icons-material/RateReview'
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone'
const MAIN_NAV = [
  { key: 'projects',      label: 'Explore Projects', icon: <ExploreIcon fontSize="small" />,              href: '/user/projects'      },
  { key: 'portfolio',     label: 'My Portfolio',      icon: <AccountBalanceWalletIcon fontSize="small" />, href: '/user/portfolio'     },
  { key: 'notifications', label: 'Notifications',     icon: <NotificationsNoneIcon fontSize="small" />,    href: '/user/notifications' },
  { key: 'feedback',      label: 'Feedback',          icon: <RateReviewIcon fontSize="small" />,           href: '/user/feedback'      },
  { key: 'profile',       label: 'Profile',           icon: <PersonIcon fontSize="small" />,               href: '/user/profile'       },
]

const BOTTOM_NAV = [
  { key: 'settings', label: 'Settings', icon: <SettingsIcon fontSize="small" />, href: '/user/profile' },
]

const ALL_NAV = [...MAIN_NAV, ...BOTTOM_NAV]

export default function InvestorSidebar({ active }: { active: string }) {
  const router = useRouter()

  return (
    <>
      {/* Desktop sidebar — full height, sticky */}
      <Box sx={{
        width: 210,
        flexShrink: 0,
        display: { xs: 'none', md: 'flex' },
        flexDirection: 'column',
        bgcolor: '#fff',
        borderRadius: 3,
        border: '1px solid #e5e7eb',
        position: 'sticky',
        top: 16,
        alignSelf: 'flex-start',
        minHeight: 'calc(100vh - 96px)',
        overflow: 'hidden',
      }}>
        {/* Label */}
        <Box sx={{ px: 3, pt: 2.5, pb: 1.5, borderBottom: '1px solid #f3f4f6' }}>
          <Typography variant="caption" sx={{
            color: '#9ca3af', fontWeight: 700,
            textTransform: 'uppercase', letterSpacing: '0.07em', fontSize: 11,
          }}>
            Investor
          </Typography>
        </Box>

        {/* Main nav items */}
        <Box sx={{ flex: 1, px: 1.5, py: 1.5, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          {MAIN_NAV.map(item => {
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
                <Box sx={{ display: 'flex', alignItems: 'center', color: isActive ? '#fff' : '#6b7280' }}>
                  {item.icon}
                </Box>
                {item.label}
              </Box>
            )
          })}
        </Box>

        {/* Settings pinned to bottom */}
        <Box sx={{ px: 1.5, pb: 2, borderTop: '1px solid #f3f4f6', pt: 1.5 }}>
          {BOTTOM_NAV.map(item => {
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
                <Box sx={{ display: 'flex', alignItems: 'center', color: isActive ? '#fff' : '#6b7280' }}>
                  {item.icon}
                </Box>
                {item.label}
              </Box>
            )
          })}
        </Box>
      </Box>

      {/* Mobile tab strip */}
      <Box sx={{ display: { xs: 'flex', md: 'none' }, gap: 1, mb: 2, flexWrap: 'nowrap', overflowX: 'auto', pb: 0.5 }}>
        {ALL_NAV.map(item => {
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
                whiteSpace: 'nowrap', flexShrink: 0,
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
