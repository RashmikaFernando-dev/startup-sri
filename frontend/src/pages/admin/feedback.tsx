import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import {
  Box,
  Typography,
  Avatar,
  IconButton,
  Alert,
  Snackbar,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import RateReviewIcon from '@mui/icons-material/RateReview'
import AdminNavbar from '@/components/admin/AdminNavbar'
import AdminSidebar from '@/components/admin/AdminSidebar'

const CONTENT_LEFT = 240

const ROLE_COLORS: Record<string, { bg: string; text: string }> = {
  investor:     { bg: '#dbeafe', text: '#1e40af' },
  entrepreneur: { bg: '#ede9fe', text: '#7c3aed' },
}

const AVATAR_COLORS = ['#4f46e5', '#2563eb', '#0ea5e9', '#7c3aed', '#0891b2', '#1d4ed8']

interface Feedback {
  _id: string
  userName: string
  text: string
  role: string
  createdAt: string
}

export default function AdminFeedback() {
  const router = useRouter()
  const [admin, setAdmin] = useState<any>(null)
  const [feedback, setFeedback] = useState<Feedback[]>([])
  const [loading, setLoading] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Feedback | null>(null)
  const [toast, setToast] = useState<{ open: boolean; msg: string; type: 'success' | 'error' }>({
    open: false, msg: '', type: 'success',
  })

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
    fetchFeedback()
  }, [admin])

  const token = () => localStorage.getItem('adminToken')

  const fetchFeedback = async () => {
    setLoading(true)
    try {
      const res = await fetch('http://localhost:5000/api/feedback', {
        headers: { Authorization: `Bearer ${token()}` },
      })
      const data = await res.json()
      if (data.success) setFeedback(data.data)
    } catch {
      setToast({ open: true, msg: 'Failed to load feedback.', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      const res = await fetch(`http://localhost:5000/api/feedback/${deleteTarget._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token()}` },
      })
      const data = await res.json()
      if (!res.ok || !data.success) throw new Error(data.message || 'Delete failed')
      setFeedback(prev => prev.filter(f => f._id !== deleteTarget._id))
      setToast({ open: true, msg: 'Feedback deleted.', type: 'success' })
    } catch (err: any) {
      setToast({ open: true, msg: err.message || 'Failed to delete.', type: 'error' })
    } finally {
      setDeleteTarget(null)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminUser')
    router.push('/admin/login')
  }

  return (
    <>
      <Head><title>Feedback – StartupSri Admin</title></Head>

      <AdminNavbar admin={admin} onLogout={handleLogout} />
      <AdminSidebar activeKey="feedback" />

      <Box sx={{ ml: `${CONTENT_LEFT}px`, mt: '64px', p: 4, minHeight: 'calc(100vh - 64px)', bgcolor: '#f7f8fa' }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#0a1940' }}>User Feedback</Typography>
          <Typography sx={{ color: '#6b7280', fontSize: 14, mt: 0.5 }}>
            All platform feedback submitted by investors and entrepreneurs
          </Typography>
        </Box>

        {/* Stats strip */}
        <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap' }}>
          {[
            { label: 'Total', value: feedback.length, color: '#0a1940' },
            { label: 'Investors', value: feedback.filter(f => f.role === 'investor').length, color: '#1d4ed8' },
            { label: 'Entrepreneurs', value: feedback.filter(f => f.role === 'entrepreneur').length, color: '#7c3aed' },
          ].map(s => (
            <Box key={s.label} sx={{ bgcolor: '#fff', border: '1px solid #e5e7eb', borderRadius: 2, px: 3, py: 2, minWidth: 120 }}>
              <Typography sx={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</Typography>
              <Typography sx={{ fontSize: 13, color: '#6b7280' }}>{s.label}</Typography>
            </Box>
          ))}
        </Box>

        {/* List */}
        {loading ? (
          <Box sx={{ py: 10, textAlign: 'center', color: '#9ca3af' }}>
            <Typography>Loading feedback...</Typography>
          </Box>
        ) : feedback.length === 0 ? (
          <Box sx={{ bgcolor: '#fff', border: '2px dashed #e5e7eb', borderRadius: 3, textAlign: 'center', py: 10 }}>
            <RateReviewIcon sx={{ fontSize: 52, color: '#d1d5db', mb: 2, display: 'block', mx: 'auto' }} />
            <Typography sx={{ fontWeight: 700, color: '#374151', fontSize: 16 }}>No feedback yet</Typography>
            <Typography sx={{ color: '#9ca3af', fontSize: 14, mt: 0.5 }}>Users haven't submitted any feedback.</Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {feedback.map((fb, index) => {
              const roleStyle = ROLE_COLORS[fb.role] ?? { bg: '#f3f4f6', text: '#374151' }
              return (
                <Box
                  key={fb._id}
                  sx={{
                    bgcolor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: 2.5,
                    p: 2.5,
                    display: 'flex',
                    gap: 2,
                    alignItems: 'flex-start',
                    '&:hover': { boxShadow: '0 4px 16px rgba(0,0,0,0.06)' },
                    transition: 'box-shadow 0.2s',
                  }}
                >
                  <Avatar
                    sx={{
                      bgcolor: AVATAR_COLORS[index % AVATAR_COLORS.length],
                      width: 38, height: 38, fontSize: 15, fontWeight: 700, flexShrink: 0,
                    }}
                  >
                    {(fb.userName || 'A')[0].toUpperCase()}
                  </Avatar>

                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 0.5 }}>
                      <Typography sx={{ fontWeight: 700, fontSize: 14, color: '#0a1940' }}>{fb.userName}</Typography>
                      <Box sx={{ px: 1.2, py: 0.2, borderRadius: 10, bgcolor: roleStyle.bg, color: roleStyle.text, fontSize: 11, fontWeight: 700 }}>
                        {fb.role === 'entrepreneur' ? 'Entrepreneur' : 'Investor'}
                      </Box>
                      <Typography sx={{ fontSize: 12, color: '#9ca3af', ml: 'auto' }}>
                        {new Date(fb.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        {' '}at{' '}
                        {new Date(fb.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                      </Typography>
                    </Box>
                    <Typography sx={{ fontSize: 14, color: '#374151', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                      {fb.text}
                    </Typography>
                  </Box>

                  <Tooltip title="Delete feedback">
                    <IconButton
                      size="small"
                      onClick={() => setDeleteTarget(fb)}
                      sx={{ color: '#9ca3af', flexShrink: 0, '&:hover': { color: '#ef4444', bgcolor: '#fef2f2' } }}
                    >
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              )
            })}
          </Box>
        )}
      </Box>

      {/* Delete confirm dialog */}
      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Delete Feedback?</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: '#6b7280', fontSize: 14 }}>
            This will permanently remove the feedback from <strong>{deleteTarget?.userName}</strong>. This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteTarget(null)} sx={{ textTransform: 'none', color: '#6b7280' }}>Cancel</Button>
          <Button onClick={handleDelete} variant="contained"
            sx={{ textTransform: 'none', fontWeight: 700, bgcolor: '#ef4444', '&:hover': { bgcolor: '#dc2626' } }}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={toast.open}
        autoHideDuration={3500}
        onClose={() => setToast(t => ({ ...t, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity={toast.type} variant="filled" sx={{ width: '100%' }}>{toast.msg}</Alert>
      </Snackbar>
    </>
  )
}
