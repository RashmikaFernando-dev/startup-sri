import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import {
  Box,
  Typography,
  Avatar,
  Chip,
  Divider,
} from '@mui/material'
import AdminNavbar from '@/components/admin/AdminNavbar'
import AdminSidebar from '@/components/admin/AdminSidebar'

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
      const res = await fetch('http://localhost:5000/api/admin/users', { headers: { Authorization: `Bearer ${token()}` } })
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

      <Box sx={{
        minHeight: '100vh',
        background: 'linear-gradient(95deg, #101224 0%, #22274a 100%)',
        display: 'flex',
        flexDirection: 'column',
      }}>

        <AdminNavbar admin={admin} onLogout={handleLogout} />

        {/* Body */}
        <Box sx={{
          flex: 1,
          display: 'flex',
          maxWidth: '100%',
          mx: 0,
          width: '100%',
          px: 0,
          py: { xs: 3, md: 4 },
          gap: 2,
          bgcolor: { xs: 'transparent', md: '#0d1329' },
          borderRadius: 0,
          boxShadow: { xs: 'none', md: '0 20px 40px rgba(7, 12, 22, 0.22)' },
        }}>

          <AdminSidebar activeKey="users" />

          {/* Main Content */}
          <Box sx={{
            flex: 1,
            minWidth: 0,
            bgcolor: '#d5dae3',
            borderRadius: 0,
            p: { xs: 0, md: 3 },
          }}>

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
