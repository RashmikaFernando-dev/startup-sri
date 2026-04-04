import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import type { Project } from '@/redux/slices/projectSlice'
import {
  Box, Typography, Button, TextField, InputAdornment,
  Select, MenuItem, FormControl, InputLabel, Alert, Snackbar, LinearProgress,
} from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CancelIcon from '@mui/icons-material/Cancel'
import SearchIcon from '@mui/icons-material/Search'
import AdminNavbar from '@/components/admin/AdminNavbar'
import AdminSidebar from '@/components/admin/AdminSidebar'
import ConfirmDialog from '@/components/ui/ConfirmDialog'

const CONTENT_LEFT = 240

const STATUS_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  pending:   { bg: '#fef3c7', text: '#92400e', label: 'Pending' },
  approved:  { bg: '#d1fae5', text: '#065f46', label: 'Approved' },
  rejected:  { bg: '#fee2e2', text: '#991b1b', label: 'Rejected' },
  active:    { bg: '#dbeafe', text: '#1e40af', label: 'Active' },
  funded:    { bg: '#ede9fe', text: '#5b21b6', label: 'Funded' },
  completed: { bg: '#f3f4f6', text: '#374151', label: 'Completed' },
}

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

  const confirm = (title: string, body: string, onConfirm: () => void) =>
    setConfirmDialog({ open: true, title, body, onConfirm })

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

      {/* Approval toast card */}
      {justApproved && (
        <Box sx={{
          position: 'fixed', top: 80, left: '50%', transform: 'translateX(-50%)',
          zIndex: 1400, bgcolor: '#fff', border: '1px solid #bbf7d0', borderRadius: 2.5,
          boxShadow: '0 8px 32px rgba(22,163,74,0.18)', px: 3, py: 2.5,
          display: 'flex', alignItems: 'center', gap: 2, minWidth: 320,
        }}>
          <Box sx={{ width: 40, height: 40, borderRadius: '50%', bgcolor: '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircleIcon sx={{ fontSize: 24, color: '#16a34a' }} />
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 800, color: '#111827', fontSize: 14 }}>Approved!</Typography>
            <Typography sx={{ fontSize: 12, color: '#6b7280' }}>"{justApproved.title}" is now live for investors.</Typography>
          </Box>
        </Box>
      )}

      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f9fafb' }}>
        <AdminSidebar activeKey="projects" />

        <Box sx={{ flex: 1, ml: { xs: 0, md: `${CONTENT_LEFT}px` }, display: 'flex', flexDirection: 'column' }}>
          <AdminNavbar
            admin={admin}
            onLogout={handleLogout}
            pageTitle="Projects"
            pageSubtitle="Review, approve or reject startup listings"
          />

          <Box sx={{ flex: 1, px: { xs: 2, md: 4 }, pt: '80px', pb: 6 }}>

            {/* Filters */}
            <Box sx={{ display: 'flex', gap: 2, mt: 3, mb: 3, flexWrap: 'wrap' }}>
              <TextField
                size="small"
                placeholder="Search by title or email…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" sx={{ color: '#9ca3af' }} /></InputAdornment> }}
                sx={{ flex: 1, minWidth: 220, '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: '#fff' } }}
              />
              <FormControl size="small" sx={{ minWidth: 160 }}>
                <InputLabel>Status</InputLabel>
                <Select value={statusFilter} label="Status" onChange={e => setStatusFilter(e.target.value)} sx={{ borderRadius: 2, bgcolor: '#fff' }}>
                  <MenuItem value="all">All Statuses</MenuItem>
                  {['pending', 'approved', 'rejected', 'funded', 'active', 'completed'].map(s => (
                    <MenuItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {/* Table */}
            <Box sx={{ bgcolor: '#fff', borderRadius: 2.5, border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              {/* Table header */}
              <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse' }}>
                <Box component="thead">
                  <Box component="tr" sx={{ bgcolor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                    {['Project', 'Category', 'Type', 'Goal', 'Progress', 'Status', 'Actions'].map(h => (
                      <Box component="th" key={h} sx={{ px: 3, py: 1.8, textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
                        {h}
                      </Box>
                    ))}
                  </Box>
                </Box>

                <Box component="tbody">
                  {loading ? (
                    <Box component="tr">
                      <Box component="td" colSpan={7} sx={{ px: 3, py: 6, textAlign: 'center', color: '#9ca3af', fontSize: 14 }}>
                        Loading projects…
                      </Box>
                    </Box>
                  ) : filteredProjects.length === 0 ? (
                    <Box component="tr">
                      <Box component="td" colSpan={7} sx={{ px: 3, py: 6, textAlign: 'center', color: '#9ca3af', fontSize: 14 }}>
                        No projects found.
                      </Box>
                    </Box>
                  ) : filteredProjects.map((p, idx, arr) => {
                    const progress = Math.min(Math.round(((p.currentFunding || 0) / p.fundingGoal) * 100), 100)
                    const sc = STATUS_COLORS[p.status] ?? { bg: '#f3f4f6', text: '#374151', label: p.status }
                    return (
                      <Box component="tr" key={p._id} sx={{
                        borderBottom: idx < arr.length - 1 ? '1px solid #f3f4f6' : 'none',
                        '&:hover': { bgcolor: '#fafafa' },
                        transition: 'background 0.12s',
                      }}>
                        <Box component="td" sx={{ px: 3, py: 2.5, minWidth: 180 }}>
                          <Typography sx={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>{p.title}</Typography>
                          <Typography sx={{ fontSize: 12, color: '#9ca3af' }}>{p.entrepreneur?.firstName} {p.entrepreneur?.lastName}</Typography>
                          <Typography sx={{ fontSize: 11, color: '#d1d5db' }}>{p.entrepreneur?.email}</Typography>
                        </Box>
                        <Box component="td" sx={{ px: 3, py: 2.5, fontSize: 13, color: '#374151' }}>{p.category}</Box>
                        <Box component="td" sx={{ px: 3, py: 2.5, fontSize: 13, color: '#374151', textTransform: 'capitalize' }}>{p.fundingType}</Box>
                        <Box component="td" sx={{ px: 3, py: 2.5, fontSize: 13, color: '#374151', whiteSpace: 'nowrap' }}>
                          {fmt(p.fundingGoal)}
                        </Box>
                        <Box component="td" sx={{ px: 3, py: 2.5, minWidth: 130 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LinearProgress
                              variant="determinate"
                              value={progress}
                              sx={{ flex: 1, height: 5, borderRadius: 3, bgcolor: '#f3f4f6', '& .MuiLinearProgress-bar': { bgcolor: '#111827' } }}
                            />
                            <Typography sx={{ fontSize: 12, fontWeight: 700, color: '#6b7280', minWidth: 32 }}>{progress}%</Typography>
                          </Box>
                          <Typography sx={{ fontSize: 11, color: '#9ca3af', mt: 0.5 }}>{fmt(p.currentFunding || 0)} raised</Typography>
                        </Box>
                        <Box component="td" sx={{ px: 3, py: 2.5 }}>
                          <Box sx={{ display: 'inline-flex', bgcolor: sc.bg, color: sc.text, fontSize: 12, fontWeight: 700, px: 1.5, py: 0.4, borderRadius: 10 }}>
                            {sc.label}
                          </Box>
                        </Box>
                        <Box component="td" sx={{ px: 3, py: 2.5 }}>
                          {p.status === 'pending' ? (
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <Button
                                size="small"
                                variant="contained"
                                startIcon={<CheckCircleIcon sx={{ fontSize: 14 }} />}
                                onClick={() => confirm('Approve Project', `Approve "${p.title}"?`, () => updateProjectStatus(p._id, 'approved'))}
                                sx={{ bgcolor: '#111827', borderRadius: 1.5, textTransform: 'none', fontWeight: 700, fontSize: 12, '&:hover': { bgcolor: '#1f2937' } }}
                              >
                                Approve
                              </Button>
                              <Button
                                size="small"
                                variant="outlined"
                                startIcon={<CancelIcon sx={{ fontSize: 14 }} />}
                                onClick={() => confirm('Reject Project', `Reject "${p.title}"?`, () => updateProjectStatus(p._id, 'rejected'))}
                                sx={{ borderRadius: 1.5, textTransform: 'none', fontSize: 12, borderColor: '#e5e7eb', color: '#ef4444', '&:hover': { borderColor: '#ef4444', bgcolor: '#fef2f2' } }}
                              >
                                Reject
                              </Button>
                            </Box>
                          ) : (
                            <Typography sx={{ fontSize: 12, color: '#d1d5db' }}>—</Typography>
                          )}
                        </Box>
                      </Box>
                    )
                  })}
                </Box>
              </Box>
            </Box>

            {/* Count label */}
            {!loading && (
              <Typography sx={{ mt: 2, fontSize: 13, color: '#9ca3af' }}>
                Showing {filteredProjects.length} of {projects.length} projects
              </Typography>
            )}
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

      <Snackbar open={toast.open} autoHideDuration={3500} onClose={() => setToast(t => ({ ...t, open: false }))} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert severity={toast.type} variant="filled" sx={{ width: '100%' }}>{toast.msg}</Alert>
      </Snackbar>
    </>
  )
}
