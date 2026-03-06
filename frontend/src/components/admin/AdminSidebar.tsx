import { Box, Typography, Button } from '@mui/material'
import { useRouter } from 'next/router'
import DashboardIcon from '@mui/icons-material/Dashboard'
import PeopleIcon from '@mui/icons-material/People'
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch'

export type AdminActiveKey = 'overview' | 'projects' | 'users'

const sidebarItems = [
  { key: 'overview' as AdminActiveKey, label: 'Overview', icon: <DashboardIcon fontSize="small" />, href: '/admin/dashboard' },
  { key: 'projects' as AdminActiveKey, label: 'Projects', icon: <RocketLaunchIcon fontSize="small" />, href: '/admin/projects' },
  { key: 'users' as AdminActiveKey, label: 'Users', icon: <PeopleIcon fontSize="small" />, href: '/admin/users' },
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
        width: 200, flexShrink: 0,
        bgcolor: '#fff', borderRadius: 3, border: '1px solid #e5e7eb',
        p: 2, height: 'fit-content',
        display: { xs: 'none', md: 'block' },
      }}>
        <Typography variant="caption" sx={{ color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, px: 1 }}>
          Admin Menu
        </Typography>
        <Box sx={{ mt: 1.5, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          {sidebarItems.map(item => (
            <Box
              key={item.key}
              onClick={() => router.push(item.href)}
              sx={{
                display: 'flex', alignItems: 'center', gap: 1.5,
                px: 2, py: 1.2, borderRadius: 2, cursor: 'pointer',
                bgcolor: item.key === activeKey ? '#0a1940' : 'transparent',
                color: item.key === activeKey ? '#fff' : '#374151',
                fontWeight: item.key === activeKey ? 700 : 400,
                fontSize: '0.875rem',
                transition: 'all 0.15s',
                '&:hover': { bgcolor: item.key === activeKey ? '#0a1940' : '#f3f4f6' },
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
              bgcolor: item.key === activeKey ? '#0a1940' : undefined,
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
