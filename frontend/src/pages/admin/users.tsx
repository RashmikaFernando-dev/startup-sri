import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import {
  Box,
  Typography,
  Avatar,
  Chip,
  Button,
  Divider,
  IconButton,
  Tooltip,
} from '@mui/material'
import LogoutIcon from '@mui/icons-material/Logout'
import DashboardIcon from '@mui/icons-material/Dashboard'
import PeopleIcon from '@mui/icons-material/People'
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch'
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'

interface User {
  _id: string
  firstName: string
  lastName: string
  email: string
  role: string
  isActive: boolean
  isVerified: boolean
  createdAt: string
}

const sidebarItems = [
  { key: 'overview', label: 'Overview', icon: <DashboardIcon fontSize="small" />, href: '/admin/dashboard' },
  { key: 'projects', label: 'Projects', icon: <RocketLaunchIcon fontSize="small" />, href: '/admin/projects' },
  { key: 'users', label: 'Users', icon: <PeopleIcon fontSize="small" />, href: '/admin/users' },
]

export default function AdminUsers() {
  const router = useRouter()
  const [admin, setAdmin] = useState<any>(null)
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('adminUser')
    const tok = localStorage.getItem('adminToken')
    if (!stored || !tok) { router.push('/admin/login'); return }
    const u = JSON.parse(stored)
    if (u.role !== 'admin') { router.push('/admin/login'); return }
    setAdmin(u)
  }, [])

  useEffect(() => {
    if (!admin) return
    fetchUsers()
  }, [admin])

  const token = () => localStorage.getItem('adminToken')

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const res = await fetch('http://localhost:5000/api/users', { headers: { Authorization: `Bearer ${token()}` } })
      const data = await res.json()
      if (data.success) setUsers(data.data)
    } catch {} finally { setLoading(false) }
  }

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminUser')
    router.push('/admin/login')
  }

  return (
    <>
      <Head><title>Users – Admin | StartupSri</title></Head>

      <Box sx={{ minHeight: '100vh', bgcolor: '#f7f8fa', display: 'flex', flexDirection: 'column' }}>

        {/* Top Nav */}
        <Box sx={{ bgcolor: '#0a1940', px: { xs: 2, md: 4 }, py: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ width: 32, height: 32, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AdminPanelSettingsIcon sx={{ color: '#fff', fontSize: 18 }} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>
              StartupSri <Typography component="span" variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', fontWeight: 500, ml: 0.5 }}>Admin</Typography>
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 34, height: 34, fontSize: 13, fontWeight: 700, color: '#fff' }}>
              {admin?.firstName?.[0]}{admin?.lastName?.[0]}
            </Avatar>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.85)', display: { xs: 'none', sm: 'block' } }}>
              {admin?.firstName} {admin?.lastName}
            </Typography>
            <Tooltip title="Logout">
              <IconButton size="small" onClick={handleLogout} sx={{ color: 'rgba(255,255,255,0.6)', '&:hover': { color: '#fff' } }}>
                <LogoutIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Body */}
        <Box sx={{ flex: 1, display: 'flex', maxWidth: 1200, mx: 'auto', width: '100%', px: { xs: 2, md: 4 }, py: 4, gap: 3 }}>

          {/* Sidebar */}
          <Box sx={{ width: 200, flexShrink: 0, bgcolor: '#fff', borderRadius: 3, border: '1px solid #e5e7eb', p: 2, height: 'fit-content', display: { xs: 'none', md: 'block' } }}>
            <Typography variant="caption" sx={{ color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, px: 1 }}>
              Admin Menu
            </Typography>
            <Box sx={{ mt: 1.5, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              {sidebarItems.map(item => (
                <Box key={item.key} onClick={() => router.push(item.href)} sx={{
                  display: 'flex', alignItems: 'center', gap: 1.5,
                  px: 2, py: 1.2, borderRadius: 2, cursor: 'pointer',
                  bgcolor: item.key === 'users' ? '#0a1940' : 'transparent',
                  color: item.key === 'users' ? '#fff' : '#374151',
                  fontWeight: item.key === 'users' ? 700 : 400, fontSize: '0.875rem',
                  transition: 'all 0.15s',
                  '&:hover': { bgcolor: item.key === 'users' ? '#0a1940' : '#f3f4f6' },
                }}>
                  {item.icon}{item.label}
                </Box>
              ))}
            </Box>
          </Box>

          {/* Main Content */}
          <Box sx={{ flex: 1, minWidth: 0 }}>

            {/* Mobile tabs */}
            <Box sx={{ display: { xs: 'flex', md: 'none' }, gap: 1, mb: 2 }}>
              {sidebarItems.map(item => (
                <Button key={item.key} size="small"
                  variant={item.key === 'users' ? 'contained' : 'outlined'}
                  onClick={() => router.push(item.href)}
                  sx={{ borderRadius: 2, textTransform: 'none', bgcolor: item.key === 'users' ? '#0a1940' : undefined }}
                  startIcon={item.icon}>{item.label}</Button>
              ))}
            </Box>

            <Typography variant="h5" sx={{ fontWeight: 800, color: '#0a1940', mb: 1 }}>Users</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>All registered platform users</Typography>

            <Box sx={{ bgcolor: '#fff', border: '1px solid #e5e7eb', borderRadius: 3, overflow: 'hidden' }}>
              {loading ? (
                <Box sx={{ p: 5, textAlign: 'center' }}>
                  <Typography color="text.secondary">Loading...</Typography>
                </Box>
              ) : users.length === 0 ? (
                <Box sx={{ p: 5, textAlign: 'center' }}>
                  <Typography color="text.secondary">No users found via API yet.</Typography>
                  <Typography variant="caption" color="text.disabled" sx={{ mt: 1, display: 'block' }}>
                    (Requires GET /api/users endpoint to be implemented)
                  </Typography>
                </Box>
              ) : users.map((u, i) => (
                <Box key={u._id}>
                  {i > 0 && <Divider />}
                  <Box sx={{ px: 3, py: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: '#0a1940', width: 38, height: 38, fontSize: 14, fontWeight: 700 }}>
                        {u.firstName?.[0]}{u.lastName?.[0]}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>{u.firstName} {u.lastName}</Typography>
                        <Typography variant="caption" color="text.secondary">{u.email}</Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                      <Chip label={u.role} size="small" sx={{ fontWeight: 700, textTransform: 'capitalize', bgcolor: '#dbeafe', color: '#1d4ed8' }} />
                      <Chip label={u.isActive ? 'Active' : 'Inactive'} size="small" color={u.isActive ? 'success' : 'default'} />
                    </Box>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  )
}
