import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { Box, Typography, Avatar, Button, Snackbar, Alert } from '@mui/material'
import BlockIcon from '@mui/icons-material/Block'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import AdminNavbar from '@/components/admin/AdminNavbar'
import AdminSidebar from '@/components/admin/AdminSidebar'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'


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

const CONTENT_LEFT = 240

const ROLE_COLORS: Record<string, { bg: string; text: string }> = {
  investor:      { bg: '#dbeafe', text: '#1e40af' },
  entrepreneur:  { bg: '#d1fae5', text: '#065f46' },
  admin:         { bg: '#ede9fe', text: '#5b21b6' },
}

export default function AdminUsers() {
  const router = useRouter()
  const [admin, setAdmin] = useState<any>(null)
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [toast, setToast] = useState<{ open: boolean; msg: string; type: 'success' | 'error' }>({ open: false, msg: '', type: 'success' })

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
      const res = await fetch(`${API_BASE}/admin/users`, { headers: { Authorization: `Bearer ${token()}` } })
      const data = await res.json()
      if (data.success) setUsers(data.data)
    } catch {} finally { setLoading(false) }
  }

  const handleToggleStatus = async (u: User) => {
    const newStatus = !u.isActive
    setActionLoading(u._id)
    try {
      const res = await fetch(`${API_BASE}/admin/users/${u._id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify({ isActive: newStatus }),
      })
      const data = await res.json()
      if (data.success) {
        setUsers(prev => prev.map(x => x._id === u._id ? { ...x, isActive: newStatus } : x))
        setToast({ open: true, msg: `${u.firstName} ${u.lastName} has been ${newStatus ? 'reactivated' : 'suspended'}.`, type: 'success' })
      } else {
        setToast({ open: true, msg: data.message || 'Action failed.', type: 'error' })
      }
    } catch {
      setToast({ open: true, msg: 'Network error. Please try again.', type: 'error' })
    } finally {
      setActionLoading(null)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminUser')
    router.push('/admin/login')
  }

  return (
    <>
      <Head><title>Users – Admin | StartupSri</title></Head>

      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f9fafb' }}>
        <AdminSidebar activeKey="users" />

        <Box sx={{ flex: 1, ml: { xs: 0, md: `${CONTENT_LEFT}px` }, display: 'flex', flexDirection: 'column' }}>
          <AdminNavbar
            admin={admin}
            onLogout={handleLogout}
            pageTitle="Users"
            pageSubtitle="All registered platform users"
          />

          <Box sx={{ flex: 1, px: { xs: 2, md: 4 }, pt: '80px', pb: 6 }}>

            {/* Summary row */}
            <Box sx={{ display: 'flex', gap: 2, mt: 3, mb: 3, flexWrap: 'wrap' }}>
              {[
                { label: 'Total Users', value: users.length },
                { label: 'Active', value: users.filter(u => u.isActive).length },
                { label: 'Entrepreneurs', value: users.filter(u => u.role === 'entrepreneur').length },
                { label: 'Investors', value: users.filter(u => u.role === 'investor').length },
              ].map(s => (
                <Box key={s.label} sx={{
                  bgcolor: '#fff', border: '1px solid #e5e7eb', borderRadius: 2, px: 3, py: 2,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)', minWidth: 120,
                }}>
                  <Typography sx={{ fontSize: 12, color: '#9ca3af', fontWeight: 600 }}>{s.label}</Typography>
                  <Typography sx={{ fontSize: 24, fontWeight: 800, color: '#111827' }}>{s.value}</Typography>
                </Box>
              ))}
            </Box>

            {/* Table */}
            <Box sx={{ bgcolor: '#fff', borderRadius: 2.5, border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse' }}>
                <Box component="thead">
                  <Box component="tr" sx={{ bgcolor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                    {['User', 'Email', 'Role', 'Status', 'Verified', 'Joined', 'Actions'].map(h => (
                      <Box component="th" key={h} sx={{ px: 3, py: 1.8, textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {h}
                      </Box>
                    ))}
                  </Box>
                </Box>

                <Box component="tbody">
                  {loading ? (
                    <Box component="tr">
                      <Box component="td" colSpan={7} sx={{ px: 3, py: 6, textAlign: 'center', color: '#9ca3af', fontSize: 14 }}>
                        Loading users…
                      </Box>
                    </Box>
                  ) : users.length === 0 ? (
                    <Box component="tr">
                      <Box component="td" colSpan={7} sx={{ px: 3, py: 6, textAlign: 'center', color: '#9ca3af', fontSize: 14 }}>
                        No users found.
                      </Box>
                    </Box>
                  ) : users.map((u, idx, arr) => {
                    const roleColor = ROLE_COLORS[u.role] ?? { bg: '#f3f4f6', text: '#374151' }
                    return (
                      <Box component="tr" key={u._id} sx={{
                        borderBottom: idx < arr.length - 1 ? '1px solid #f3f4f6' : 'none',
                        '&:hover': { bgcolor: '#fafafa' },
                        transition: 'background 0.12s',
                      }}>
                        <Box component="td" sx={{ px: 3, py: 2.5 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Avatar sx={{ bgcolor: '#111827', width: 34, height: 34, fontSize: 13, fontWeight: 700 }}>
                              {u.firstName?.[0]}{u.lastName?.[0]}
                            </Avatar>
                            <Typography sx={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>
                              {u.firstName} {u.lastName}
                            </Typography>
                          </Box>
                        </Box>
                        <Box component="td" sx={{ px: 3, py: 2.5, fontSize: 13, color: '#6b7280' }}>{u.email}</Box>
                        <Box component="td" sx={{ px: 3, py: 2.5 }}>
                          <Box sx={{ display: 'inline-flex', bgcolor: roleColor.bg, color: roleColor.text, fontSize: 12, fontWeight: 700, px: 1.5, py: 0.4, borderRadius: 10, textTransform: 'capitalize' }}>
                            {u.role}
                          </Box>
                        </Box>
                        <Box component="td" sx={{ px: 3, py: 2.5 }}>
                          <Box sx={{ display: 'inline-flex', bgcolor: u.isActive ? '#d1fae5' : '#f3f4f6', color: u.isActive ? '#065f46' : '#9ca3af', fontSize: 12, fontWeight: 700, px: 1.5, py: 0.4, borderRadius: 10 }}>
                            {u.isActive ? 'Active' : 'Inactive'}
                          </Box>
                        </Box>
                        <Box component="td" sx={{ px: 3, py: 2.5 }}>
                          <Box sx={{ display: 'inline-flex', bgcolor: u.isVerified ? '#dbeafe' : '#fef3c7', color: u.isVerified ? '#1e40af' : '#92400e', fontSize: 12, fontWeight: 700, px: 1.5, py: 0.4, borderRadius: 10 }}>
                            {u.isVerified ? 'Verified' : 'Unverified'}
                          </Box>
                        </Box>
                        <Box component="td" sx={{ px: 3, py: 2.5, fontSize: 13, color: '#9ca3af' }}>
                          {new Date(u.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </Box>
                        <Box component="td" sx={{ px: 3, py: 2.5 }}>
                          {u.role !== 'admin' && (
                            <Button
                              size="small"
                              variant="outlined"
                              disabled={actionLoading === u._id}
                              startIcon={u.isActive ? <BlockIcon sx={{ fontSize: 15 }} /> : <CheckCircleOutlineIcon sx={{ fontSize: 15 }} />}
                              onClick={() => handleToggleStatus(u)}
                              sx={{
                                textTransform: 'none', fontWeight: 700, fontSize: 12, borderRadius: 1.5,
                                borderColor: u.isActive ? '#ef4444' : '#10b981',
                                color: u.isActive ? '#ef4444' : '#10b981',
                                '&:hover': {
                                  bgcolor: u.isActive ? '#fef2f2' : '#ecfdf5',
                                  borderColor: u.isActive ? '#dc2626' : '#059669',
                                },
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {actionLoading === u._id ? 'Saving…' : u.isActive ? 'Suspend' : 'Reactivate'}
                            </Button>
                          )}
                        </Box>
                      </Box>
                    )
                  })}
                </Box>
              </Box>
            </Box>

            {!loading && users.length > 0 && (
              <Typography sx={{ mt: 2, fontSize: 13, color: '#9ca3af' }}>
                {users.length} users total
              </Typography>
            )}
          </Box>
        </Box>
      </Box>

      <Snackbar open={toast.open} autoHideDuration={4000} onClose={() => setToast(t => ({ ...t, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={toast.type} onClose={() => setToast(t => ({ ...t, open: false }))} sx={{ fontWeight: 600 }}>
          {toast.msg}
        </Alert>
      </Snackbar>
    </>
  )
}
