import { Box, Typography, Button } from '@mui/material'
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch'
import ListAltIcon from '@mui/icons-material/ListAlt'
import PersonIcon from '@mui/icons-material/Person'
import SettingsIcon from '@mui/icons-material/Settings'

const NAV = [
  { key: 'apply',    label: 'Apply to raise', icon: <RocketLaunchIcon fontSize="small" /> },
  { key: 'listings', label: 'My Listings',    icon: <ListAltIcon fontSize="small" />      },
  { key: 'profile',  label: 'Profile',        icon: <PersonIcon fontSize="small" />       },
  { key: 'settings', label: 'Settings',       icon: <SettingsIcon fontSize="small" />     },
]

interface Props {
  active: string
  onItemClick: (key: string) => void
}

export default function EntrepreneurSidebar({ active, onItemClick }: Props) {
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
          Entrepreneur
        </Typography>
        <Box sx={{ mt: 1.5, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          {NAV.map(item => {
            const isActive = active === item.key
            return (
              <Box
                key={item.key}
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
                {item.icon}
                {item.label}
              </Box>
            )
          })}
        </Box>
      </Box>

      {/* Mobile tab strip */}
      <Box sx={{ display: { xs: 'flex', md: 'none' }, gap: 1, mb: 2, flexWrap: 'nowrap', overflowX: 'auto', pb: 0.5 }}>
        {NAV.map(item => {
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
