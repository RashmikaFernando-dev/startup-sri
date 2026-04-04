import { Box, Typography } from '@mui/material'
import { useRouter } from 'next/router'
import DashboardIcon from '@mui/icons-material/Dashboard'
import PeopleIcon from '@mui/icons-material/People'
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch'
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser'
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'

export type AdminActiveKey = 'overview' | 'projects' | 'users' | 'kyc'

const navSections = [
  {
    title: 'OVERVIEW',
    items: [
      { key: 'overview' as AdminActiveKey, label: 'Dashboard', icon: <DashboardIcon sx={{ fontSize: 18 }} />, href: '/admin/dashboard' },
    ],
  },
  {
    title: 'MANAGEMENT',
    items: [
      { key: 'projects' as AdminActiveKey, label: 'Projects', icon: <RocketLaunchIcon sx={{ fontSize: 18 }} />, href: '/admin/projects' },
      { key: 'users' as AdminActiveKey, label: 'Users', icon: <PeopleIcon sx={{ fontSize: 18 }} />, href: '/admin/users' },
      { key: 'kyc' as AdminActiveKey, label: 'KYC Review', icon: <VerifiedUserIcon sx={{ fontSize: 18 }} />, href: '/admin/verifications' },
    ],
  },
]

interface AdminSidebarProps {
  activeKey: AdminActiveKey
}

export default function AdminSidebar({ activeKey }: AdminSidebarProps) {
  const router = useRouter()

  return (
    <Box sx={{
      width: 240,
      flexShrink: 0,
      bgcolor: '#fff',
      borderRight: '1px solid #e5e7eb',
      display: { xs: 'none', md: 'flex' },
      flexDirection: 'column',
      minHeight: '100vh',
      position: 'fixed',
      top: 0,
      left: 0,
      zIndex: 100,
    }}>
      {/* Brand */}
      <Box sx={{ px: 3, py: 2.5, borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box sx={{
          width: 32, height: 32, borderRadius: 1.5,
          bgcolor: '#111827',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <AdminPanelSettingsIcon sx={{ color: '#fff', fontSize: 18 }} />
        </Box>
        <Box>
          <Typography sx={{ fontWeight: 800, fontSize: 14, color: '#111827', lineHeight: 1.2 }}>StartupSri</Typography>
          <Typography sx={{ fontSize: 11, color: '#9ca3af', fontWeight: 500 }}>Admin Console</Typography>
        </Box>
      </Box>

      {/* Nav */}
      <Box sx={{ flex: 1, px: 2, py: 2, overflowY: 'auto' }}>
        {navSections.map(section => (
          <Box key={section.title} sx={{ mb: 3 }}>
            <Typography sx={{
              fontSize: 11, fontWeight: 700, color: '#9ca3af',
              letterSpacing: '0.07em', px: 1, mb: 1,
            }}>
              {section.title}
            </Typography>
            {section.items.map(item => {
              const isActive = item.key === activeKey
              return (
                <Box
                  key={item.key}
                  onClick={() => router.push(item.href)}
                  sx={{
                    display: 'flex', alignItems: 'center', gap: 1.5,
                    px: 1.5, py: 1.1, borderRadius: 1.5, cursor: 'pointer', mb: 0.5,
                    bgcolor: isActive ? '#f3f4f6' : 'transparent',
                    color: isActive ? '#111827' : '#6b7280',
                    fontWeight: isActive ? 700 : 500,
                    fontSize: 14,
                    transition: 'all 0.15s',
                    '&:hover': { bgcolor: '#f9fafb', color: '#111827' },
                  }}
                >
                  <Box sx={{ color: isActive ? '#111827' : '#9ca3af', display: 'flex', alignItems: 'center' }}>
                    {item.icon}
                  </Box>
                  {item.label}
                  {isActive && (
                    <Box sx={{ ml: 'auto', width: 6, height: 6, borderRadius: '50%', bgcolor: '#111827' }} />
                  )}
                </Box>
              )
            })}
          </Box>
        ))}
      </Box>
    </Box>
  )
}
