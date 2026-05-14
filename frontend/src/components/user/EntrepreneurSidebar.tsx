import { Box, Typography, Button } from '@mui/material'
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch'
import ListAltIcon from '@mui/icons-material/ListAlt'
import PersonIcon from '@mui/icons-material/Person'
import SettingsIcon from '@mui/icons-material/Settings'
import AccountBalanceIcon from '@mui/icons-material/AccountBalance'
import RateReviewIcon from '@mui/icons-material/RateReview'
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone'

const MAIN_NAV = [
  { key: 'apply',         label: 'Apply to raise', icon: <RocketLaunchIcon fontSize="small" />      },
  { key: 'listings',      label: 'My Listings',    icon: <ListAltIcon fontSize="small" />           },
  { key: 'repayments',    label: 'Repayments',     icon: <AccountBalanceIcon fontSize="small" />    },
  { key: 'notifications', label: 'Notifications',  icon: <NotificationsNoneIcon fontSize="small" /> },
  { key: 'feedback',      label: 'Feedback',       icon: <RateReviewIcon fontSize="small" />        },
  { key: 'profile',       label: 'Profile',        icon: <PersonIcon fontSize="small" />            },
]

const BOTTOM_NAV = [
  { key: 'settings', label: 'Settings', icon: <SettingsIcon fontSize="small" /> },
]

const ALL_NAV = [...MAIN_NAV, ...BOTTOM_NAV]

interface Props {
  active: string
  onItemClick: (key: string) => void
}

function NavItem({ item, active, onItemClick }: { item: typeof MAIN_NAV[0]; active: string; onItemClick: (k: string) => void }) {
  const isActive = active === item.key
  return (
    <Box
      onClick={() => onItemClick(item.key)}
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
}

export default function EntrepreneurSidebar({ active, onItemClick }: Props) {
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
            Entrepreneur
          </Typography>
        </Box>

        {/* Main nav items */}
        <Box sx={{ flex: 1, px: 1.5, py: 1.5, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          {MAIN_NAV.map(item => (
            <NavItem key={item.key} item={item} active={active} onItemClick={onItemClick} />
          ))}
        </Box>

        {/* Settings pinned to bottom */}
        <Box sx={{ px: 1.5, pb: 2, borderTop: '1px solid #f3f4f6', pt: 1.5 }}>
          {BOTTOM_NAV.map(item => (
            <NavItem key={item.key} item={item} active={active} onItemClick={onItemClick} />
          ))}
        </Box>
      </Box>

      {/* Mobile tab strip */}
      <Box sx={{ display: { xs: 'flex', md: 'none' }, gap: 1, mb: 2, flexWrap: 'nowrap', overflowX: 'auto', pb: 0.5 }}>
        {ALL_NAV.map(item => {
          const isActive = active === item.key
          return (
            <Button
              key={item.key}
              size="small"
              variant={isActive ? 'contained' : 'outlined'}
              startIcon={item.icon}
              onClick={() => onItemClick(item.key)}
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
