import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import type { Project } from '@/redux/slices/projectSlice'
import { Box, Typography, Button, Alert, Snackbar } from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CancelIcon from '@mui/icons-material/Cancel'
import AdminNavbar from '@/components/admin/AdminNavbar'
import AdminSidebar from '@/components/admin/AdminSidebar'
import ConfirmDialog from '@/components/ui/ConfirmDialog'

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
      const res = await fetch('http://localhost:5000/api/admin/projects', { headers: { Authorization: `Bearer ${token()}` } })
      const data = await res.json()
      if (data.success) setProjects(data.data)
    } catch {}
  }

  const updateProjectStatus = async (id: string, status: Project['status']) => {
    try {
      const res = await fetch(`http://localhost:5000/api/admin/projects/${id}/status`, {
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

        <AdminNavbar admin={admin} onLogout={handleLogout} />

        {/* Body */}
        <Box sx={{ flex: 1, display: 'flex', maxWidth: 1200, mx: 'auto', width: '100%', px: { xs: 2, md: 4 }, py: 4, gap: 3 }}>

          <AdminSidebar activeKey="overview" />

          {/* Main */}
          <Box sx={{ flex: 1, minWidth: 0 }}>

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

      <ConfirmDialog
        open={confirmDialog.open}
        title={confirmDialog.title}
        body={confirmDialog.body}
        onConfirm={confirmDialog.onConfirm}
        onClose={() => setConfirmDialog(d => ({ ...d, open: false }))}
      />

      {/* Toast */}
      <Snackbar open={toast.open} autoHideDuration={3500} onClose={() => setToast(t => ({ ...t, open: false }))} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert severity={toast.type} variant="filled" sx={{ width: '100%' }}>{toast.msg}</Alert>
      </Snackbar>
    </>
  )
}
