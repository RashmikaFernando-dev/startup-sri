import { Box, Typography, Button } from '@mui/material'
import { useRouter } from 'next/router'
import DashboardIcon from '@mui/icons-material/Dashboard'
import PeopleIcon from '@mui/icons-material/People'
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch'
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser'

export type AdminActiveKey = 'overview' | 'projects' | 'users' | 'kyc'

const sidebarItems = [
  { key: 'overview' as AdminActiveKey, label: 'Overview', icon: <DashboardIcon fontSize="small" />, href: '/admin/dashboard' },
  { key: 'projects' as AdminActiveKey, label: 'Projects', icon: <RocketLaunchIcon fontSize="small" />, href: '/admin/projects' },
  { key: 'users' as AdminActiveKey, label: 'Users', icon: <PeopleIcon fontSize="small" />, href: '/admin/users' },
  { key: 'kyc' as AdminActiveKey, label: 'KYC Review', icon: <VerifiedUserIcon fontSize="small" />, href: '/admin/verifications' },
]

interface AdminSidebarProps {
  activeKey: AdminActiveKey
}

export default function AdminSidebar({ activeKey }: AdminSidebarProps) {
  const router = useRouter()

  return (
    <>
      {/* Desktop sidebar */}
      <Box sx={{
        width: 230, flexShrink: 0,
        bgcolor: '#0d1329', borderRadius: 0,
        p: 2.2,
        display: { xs: 'none', md: 'block' },
      }}>
        <Typography variant="body2" sx={{ color: '#ffffff', fontWeight: 700, px: 1, mb: 0.2 }}>
          Admin Console
        </Typography>
        <Typography variant="caption" sx={{ color: '#7e889a', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.9, px: 1 }}>
          Navigation
        </Typography>
        <Box sx={{ mt: 1.5, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          {sidebarItems.map(item => (
            <Box
              key={item.key}
              onClick={() => router.push(item.href)}
              sx={{
                display: 'flex', alignItems: 'center', gap: 1.5,
                px: 2, py: 1.2, borderRadius: 2, cursor: 'pointer',
                bgcolor: item.key === activeKey ? 'rgba(255,255,255,0.14)' : 'transparent',
                color: item.key === activeKey ? '#ffffff' : '#9ca3af',
                fontWeight: item.key === activeKey ? 700 : 400,
                fontSize: '0.875rem',
                transition: 'all 0.15s',
                '&:hover': { bgcolor: item.key === activeKey ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.08)' },
              }}
            >
              {item.icon}{item.label}
            </Box>
          ))}
        </Box>
      </Box>

      {/* Mobile tab strip */}
      <Box sx={{ display: { xs: 'flex', md: 'none' }, gap: 1, mb: 2 }}>
        {sidebarItems.map(item => (
          <Button
            key={item.key}
            size="small"
            variant={item.key === activeKey ? 'contained' : 'outlined'}
            onClick={() => router.push(item.href)}
            sx={{
              borderRadius: 2, textTransform: 'none',
              bgcolor: item.key === activeKey ? '#111111' : undefined,
              color: item.key === activeKey ? '#ffffff' : '#111111',
              borderColor: '#111111',
              '&:hover': {
                bgcolor: item.key === activeKey ? '#000000' : 'rgba(0,0,0,0.04)',
                borderColor: '#000000',
              },
            }}
            startIcon={item.icon}
          >
            {item.label}
          </Button>
        ))}
      </Box>
    </>
  )
}
