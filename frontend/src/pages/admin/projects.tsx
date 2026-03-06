import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import type { Project } from '@/redux/slices/projectSlice'
import {
  Box,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Snackbar,
} from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CancelIcon from '@mui/icons-material/Cancel'
import SearchIcon from '@mui/icons-material/Search'
import AdminNavbar from '@/components/admin/AdminNavbar'
import AdminSidebar from '@/components/admin/AdminSidebar'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import StatusChip from '@/components/ui/StatusChip'
import FundingProgress from '@/components/ui/FundingProgress'

export default function AdminProjects() {
  const router = useRouter()
  const [admin, setAdmin] = useState<any>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [toast, setToast] = useState<{ open: boolean; msg: string; type: 'success' | 'error' }>({ open: false, msg: '', type: 'success' })
  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; title: string; body: string; onConfirm: () => void }>({ open: false, title: '', body: '', onConfirm: () => {} })
  const [justApproved, setJustApproved] = useState<Project | null>(null)

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
      const res = await fetch('http://localhost:5000/api/admin/projects', { headers: { Authorization: `Bearer ${token()}` } })
      const data = await res.json()
      if (data.success) setProjects(data.data)
    } catch {} finally { setLoading(false) }
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
      const updated = { ...projects.find(p => p._id === id)!, status }
      setProjects(prev => prev.map(p => p._id === id ? updated : p))
      if (status === 'approved') {
        setJustApproved(updated)
        setTimeout(() => setJustApproved(null), 3000)
      } else {
        setToast({ open: true, msg: `Project ${status} successfully.`, type: 'success' })
      }
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

  const filteredProjects = projects.filter(p => {
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.entrepreneur?.email?.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || p.status === statusFilter
    return matchSearch && matchStatus
  })

  return (
    <>
      <Head><title>Projects – Admin | StartupSri</title></Head>

      {/* ── Approval popup card ── */}
      {justApproved && (
        <Box sx={{
          position: 'fixed', top: 80, left: '50%', transform: 'translateX(-50%)',
          zIndex: 1400,
          bgcolor: '#fff',
          border: '1px solid #bbf7d0',
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(22,163,74,0.18)',
          px: 3, py: 2.5,
          display: 'flex', alignItems: 'center', gap: 2,
          minWidth: 320,
          animation: 'slideDown 0.3s cubic-bezier(0.34,1.56,0.64,1)',
          '@keyframes slideDown': {
            from: { opacity: 0, transform: 'translateX(-50%) translateY(-16px) scale(0.95)' },
            to:   { opacity: 1, transform: 'translateX(-50%) translateY(0)    scale(1)' },
          },
        }}>
          <Box sx={{
            width: 44, height: 44, borderRadius: '50%', bgcolor: '#d1fae5', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <CheckCircleIcon sx={{ fontSize: 26, color: '#16a34a' }} />
          </Box>
          <Box>
            <Typography variant="body1" sx={{ fontWeight: 800, color: '#0a1940', lineHeight: 1.3 }}>Approved!</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.4 }}>&#8220;{justApproved.title}&#8221; is now live for investors.</Typography>
          </Box>
        </Box>
      )}

      <Box sx={{ minHeight: '100vh', bgcolor: '#f7f8fa', display: 'flex', flexDirection: 'column' }}>

        <AdminNavbar admin={admin} onLogout={handleLogout} />

        {/* Body */}
        <Box sx={{ flex: 1, display: 'flex', maxWidth: 1200, mx: 'auto', width: '100%', px: { xs: 2, md: 4 }, py: 4, gap: 3 }}>

          <AdminSidebar activeKey="projects" />

          {/* Main Content */}
          <Box sx={{ flex: 1, minWidth: 0 }}>

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
                <Box key={p._id} sx={{
                  bgcolor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: 3, p: 3, mb: 2,
                  position: 'relative', overflow: 'hidden',
                  '&:hover': { boxShadow: '0 4px 16px rgba(0,0,0,0.07)' },
                  transition: 'box-shadow 0.2s',
                }}>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 800, color: '#0a1940' }}>{p.title}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          by {p.entrepreneur?.firstName} {p.entrepreneur?.lastName} · {p.entrepreneur?.email}
                        </Typography>
                      </Box>
                    </Box>
                    <StatusChip status={p.status} />
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

                  <Box sx={{ mb: 2 }}>
                    <FundingProgress currentFunding={p.currentFunding} fundingGoal={p.fundingGoal} />
                  </Box>

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
