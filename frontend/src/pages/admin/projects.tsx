import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import {
  Box,
  Typography,
  Avatar,
  Chip,
  Button,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
} from '@mui/material'
import LogoutIcon from '@mui/icons-material/Logout'
import DashboardIcon from '@mui/icons-material/Dashboard'
import PeopleIcon from '@mui/icons-material/People'
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CancelIcon from '@mui/icons-material/Cancel'
import SearchIcon from '@mui/icons-material/Search'
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

const STATUS_COLOR: Record<string, any> = {
  pending: 'warning', approved: 'success', rejected: 'error',
  funded: 'primary', active: 'success', completed: 'info',
}

const sidebarItems = [
  { key: 'overview', label: 'Overview', icon: <DashboardIcon fontSize="small" />, href: '/admin/dashboard' },
  { key: 'projects', label: 'Projects', icon: <RocketLaunchIcon fontSize="small" />, href: '/admin/projects' },
  { key: 'users', label: 'Users', icon: <PeopleIcon fontSize="small" />, href: '/admin/users' },
]

export default function AdminProjects() {
  const router = useRouter()
  const [admin, setAdmin] = useState<any>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [toast, setToast] = useState<{ open: boolean; msg: string; type: 'success' | 'error' }>({ open: false, msg: '', type: 'success' })
  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; title: string; body: string; onConfirm: () => void }>({ open: false, title: '', body: '', onConfirm: () => {} })

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
    fetchProjects()
  }, [admin])

  const token = () => localStorage.getItem('adminToken')

  const fetchProjects = async () => {
    setLoading(true)
    try {
      const res = await fetch('http://localhost:5000/api/projects', { headers: { Authorization: `Bearer ${token()}` } })
      const data = await res.json()
      if (data.success) setProjects(data.data)
    } catch {} finally { setLoading(false) }
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
  const pct = (p: Project) => Math.min(Math.round((p.currentFunding / p.fundingGoal) * 100), 100)

  const filteredProjects = projects.filter(p => {
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.entrepreneur?.email?.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || p.status === statusFilter
    return matchSearch && matchStatus
  })

  return (
    <>
      <Head><title>Projects – Admin | StartupSri</title></Head>

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
                  bgcolor: item.key === 'projects' ? '#0a1940' : 'transparent',
                  color: item.key === 'projects' ? '#fff' : '#374151',
                  fontWeight: item.key === 'projects' ? 700 : 400, fontSize: '0.875rem',
                  transition: 'all 0.15s',
                  '&:hover': { bgcolor: item.key === 'projects' ? '#0a1940' : '#f3f4f6' },
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
                  variant={item.key === 'projects' ? 'contained' : 'outlined'}
                  onClick={() => router.push(item.href)}
                  sx={{ borderRadius: 2, textTransform: 'none', bgcolor: item.key === 'projects' ? '#0a1940' : undefined }}
                  startIcon={item.icon}>{item.label}</Button>
              ))}
            </Box>

            <Typography variant="h5" sx={{ fontWeight: 800, color: '#0a1940', mb: 1 }}>All Projects</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Review, approve or reject startup listings</Typography>

            {/* Filters */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
              <TextField size="small" placeholder="Search by title or email..."
                value={search} onChange={e => setSearch(e.target.value)}
                InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
                sx={{ flex: 1, minWidth: 220 }}
              />
              <FormControl size="small" sx={{ minWidth: 160 }}>
                <InputLabel>Status</InputLabel>
                <Select value={statusFilter} label="Status" onChange={e => setStatusFilter(e.target.value)}>
                  <MenuItem value="all">All</MenuItem>
                  {['pending', 'approved', 'rejected', 'funded', 'active', 'completed'].map(s => (
                    <MenuItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {loading ? <Box sx={{ py: 4, textAlign: 'center', color: '#9ca3af' }}>Loading...</Box>
              : filteredProjects.length === 0 ? (
                <Box sx={{ bgcolor: '#fff', border: '1px solid #e5e7eb', borderRadius: 3, p: 5, textAlign: 'center' }}>
                  <Typography color="text.secondary">No projects found.</Typography>
                </Box>
              ) : filteredProjects.map(p => (
                <Box key={p._id} sx={{ bgcolor: '#fff', border: '1px solid #e5e7eb', borderRadius: 3, p: 3, mb: 2, '&:hover': { boxShadow: '0 4px 16px rgba(0,0,0,0.07)' }, transition: 'box-shadow 0.2s' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
                    <Box>
                      <Typography variant="body1" sx={{ fontWeight: 800, color: '#0a1940' }}>{p.title}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        by {p.entrepreneur?.firstName} {p.entrepreneur?.lastName} · {p.entrepreneur?.email}
                      </Typography>
                    </Box>
                    <Chip label={p.status.charAt(0).toUpperCase() + p.status.slice(1)} color={STATUS_COLOR[p.status]} size="small" sx={{ fontWeight: 700 }} />
                  </Box>

                  <Box sx={{ display: 'flex', gap: 3, mb: 2, flexWrap: 'wrap' }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 700 }}>Goal</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>{fmt(p.fundingGoal)}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 700 }}>Raised</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#059669' }}>{fmt(p.currentFunding)}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 700 }}>Type</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700, textTransform: 'capitalize' }}>{p.fundingType}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 700 }}>Category</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>{p.category}</Typography>
                    </Box>
                  </Box>

                  <LinearProgress variant="determinate" value={pct(p)} sx={{ height: 5, borderRadius: 3, mb: 2, bgcolor: '#f3f4f6', '& .MuiLinearProgress-bar': { bgcolor: '#0a1940' } }} />

                  {p.status === 'pending' && (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button size="small" variant="contained" color="success" startIcon={<CheckCircleIcon />}
                        onClick={() => confirm('Approve Project', `Approve "${p.title}"?`, () => updateProjectStatus(p._id, 'approved'))}
                        sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}>Approve</Button>
                      <Button size="small" variant="outlined" color="error" startIcon={<CancelIcon />}
                        onClick={() => confirm('Reject Project', `Reject "${p.title}"?`, () => updateProjectStatus(p._id, 'rejected'))}
                        sx={{ borderRadius: 2, textTransform: 'none' }}>Reject</Button>
                    </Box>
                  )}
                </Box>
              ))}
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
