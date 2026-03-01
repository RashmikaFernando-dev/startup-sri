import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import {
  Box,
  Typography,
  Avatar,
  Button,
  IconButton,
  Tooltip,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material'
import LogoutIcon from '@mui/icons-material/Logout'
import DashboardIcon from '@mui/icons-material/Dashboard'
import PeopleIcon from '@mui/icons-material/People'
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CancelIcon from '@mui/icons-material/Cancel'
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'

interface Project {
  _id: string
  title: string
  description: string
  category: string
  fundingType: string
  fundingGoal: number
  currentFunding: number
  status: string
  createdAt: string
  entrepreneur: { firstName: string; lastName: string; email: string }
}

const sidebarItems = [
  { key: 'overview', label: 'Overview', icon: <DashboardIcon fontSize="small" />, href: '/admin/dashboard' },
  { key: 'projects', label: 'Projects', icon: <RocketLaunchIcon fontSize="small" />, href: '/admin/projects' },
  { key: 'users', label: 'Users', icon: <PeopleIcon fontSize="small" />, href: '/admin/users' },
]

export default function AdminDashboard() {
  const router = useRouter()
  const [admin, setAdmin] = useState<any>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [toast, setToast] = useState<{ open: boolean; msg: string; type: 'success' | 'error' }>({ open: false, msg: '', type: 'success' })
  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; title: string; body: string; onConfirm: () => void }>({ open: false, title: '', body: '', onConfirm: () => {} })

  useEffect(() => {
    const stored = localStorage.getItem('adminUser')
    const token = localStorage.getItem('adminToken')
    if (!stored || !token) { router.push('/admin/login'); return }
    const u = JSON.parse(stored)
    if (u.role !== 'admin') { router.push('/admin/login'); return }
    setAdmin(u)
  }, [])

  useEffect(() => {
    if (!admin) return
    fetchProjects()
  }, [admin])

  const token = () => localStorage.getItem('adminToken')

  const fetchProjects = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/projects', { headers: { Authorization: `Bearer ${token()}` } })
      const data = await res.json()
      if (data.success) setProjects(data.data)
    } catch {}
  }

  const updateProjectStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`http://localhost:5000/api/projects/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify({ status }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      setProjects(prev => prev.map(p => p._id === id ? { ...p, status } : p))
      setToast({ open: true, msg: `Project ${status} successfully.`, type: 'success' })
    } catch (e: any) {
      setToast({ open: true, msg: e.message || 'Update failed.', type: 'error' })
    }
  }

  const confirm = (title: string, body: string, onConfirm: () => void) => {
    setConfirmDialog({ open: true, title, body, onConfirm })
  }

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminUser')
    router.push('/admin/login')
  }

  const fmt = (n: number) => `LKR ${n.toLocaleString()}`

  // Stats
  const totalProjects = projects.length
  const pendingProjects = projects.filter(p => p.status === 'pending').length
  const approvedProjects = projects.filter(p => p.status === 'approved').length
  const totalFunding = projects.reduce((s, p) => s + p.currentFunding, 0)

  return (
    <>
      <Head><title>Admin Dashboard – StartupSri</title></Head>

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
                  bgcolor: item.key === 'overview' ? '#0a1940' : 'transparent',
                  color: item.key === 'overview' ? '#fff' : '#374151',
                  fontWeight: item.key === 'overview' ? 700 : 400, fontSize: '0.875rem',
                  transition: 'all 0.15s',
                  '&:hover': { bgcolor: item.key === 'overview' ? '#0a1940' : '#f3f4f6' },
                }}>
                  {item.icon}{item.label}
                </Box>
              ))}
            </Box>
          </Box>

          {/* Main */}
          <Box sx={{ flex: 1, minWidth: 0 }}>

            {/* Mobile tabs */}
            <Box sx={{ display: { xs: 'flex', md: 'none' }, gap: 1, mb: 2 }}>
              {sidebarItems.map(item => (
                <Button key={item.key} size="small" variant={item.key === 'overview' ? 'contained' : 'outlined'}
                  onClick={() => router.push(item.href)}
                  sx={{ borderRadius: 2, textTransform: 'none', bgcolor: item.key === 'overview' ? '#0a1940' : undefined }}
                  startIcon={item.icon}>{item.label}</Button>
              ))}
            </Box>

            {/* ── OVERVIEW ── */}
            <Box>
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#0a1940', mb: 1 }}>Overview</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Platform summary at a glance</Typography>

                {/* Stat cards */}
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 2, mb: 4 }}>
                  {[
                    { label: 'Total Projects', value: totalProjects, color: '#dbeafe', text: '#1d4ed8' },
                    { label: 'Pending Review', value: pendingProjects, color: '#fef3c7', text: '#d97706' },
                    { label: 'Approved', value: approvedProjects, color: '#d1fae5', text: '#065f46' },
                    { label: 'Total Raised', value: fmt(totalFunding), color: '#ede9fe', text: '#7c3aed' },
                  ].map(stat => (
                    <Box key={stat.label} sx={{ bgcolor: '#fff', border: '1px solid #e5e7eb', borderRadius: 3, p: 3 }}>
                      <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: '#6b7280' }}>{stat.label}</Typography>
                      <Typography variant="h4" sx={{ fontWeight: 800, color: stat.text, mt: 0.5 }}>{stat.value}</Typography>
                    </Box>
                  ))}
                </Box>

                {/* Recent pending projects */}
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#0a1940', mb: 2 }}>Pending Approvals</Typography>
                {projects.filter(p => p.status === 'pending').length === 0 ? (
                  <Box sx={{ bgcolor: '#fff', border: '1px solid #e5e7eb', borderRadius: 3, p: 4, textAlign: 'center' }}>
                    <CheckCircleIcon sx={{ fontSize: 40, color: '#d1fae5', mb: 1 }} />
                    <Typography color="text.secondary">No pending projects — all caught up!</Typography>
                  </Box>
                ) : (
                  projects.filter(p => p.status === 'pending').slice(0, 5).map(p => (
                    <Box key={p._id} sx={{ bgcolor: '#fff', border: '1px solid #fef3c7', borderRadius: 3, p: 3, mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 700, color: '#0a1940' }}>{p.title}</Typography>
                        <Typography variant="caption" color="text.secondary">{p.entrepreneur?.email} · {p.category} · {fmt(p.fundingGoal)}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button size="small" variant="contained" color="success" startIcon={<CheckCircleIcon />}
                          onClick={() => confirm('Approve Project', `Approve "${p.title}"?`, () => updateProjectStatus(p._id, 'approved'))}
                          sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}>Approve</Button>
                        <Button size="small" variant="outlined" color="error" startIcon={<CancelIcon />}
                          onClick={() => confirm('Reject Project', `Reject "${p.title}"?`, () => updateProjectStatus(p._id, 'rejected'))}
                          sx={{ borderRadius: 2, textTransform: 'none' }}>Reject</Button>
                      </Box>
                    </Box>
                  ))
                )}
            </Box>

          </Box>
        </Box>
      </Box>

      {/* Confirm Dialog */}
      <Dialog open={confirmDialog.open} onClose={() => setConfirmDialog(d => ({ ...d, open: false }))} PaperProps={{ sx: { borderRadius: 3, p: 1 } }}>
        <DialogTitle sx={{ fontWeight: 800, color: '#0a1940' }}>{confirmDialog.title}</DialogTitle>
        <DialogContent><Typography variant="body2" color="text.secondary">{confirmDialog.body}</Typography></DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setConfirmDialog(d => ({ ...d, open: false }))} sx={{ textTransform: 'none' }}>Cancel</Button>
          <Button variant="contained" onClick={() => { confirmDialog.onConfirm(); setConfirmDialog(d => ({ ...d, open: false })) }}
            sx={{ bgcolor: '#0a1940', borderRadius: 2, textTransform: 'none', fontWeight: 700 }}>Confirm</Button>
        </DialogActions>
      </Dialog>

      {/* Toast */}
      <Snackbar open={toast.open} autoHideDuration={3500} onClose={() => setToast(t => ({ ...t, open: false }))} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert severity={toast.type} variant="filled" sx={{ width: '100%' }}>{toast.msg}</Alert>
      </Snackbar>
    </>
  )
}
