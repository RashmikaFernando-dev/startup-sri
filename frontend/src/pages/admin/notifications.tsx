import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import {
  Box, Typography, Button, Alert, Snackbar, IconButton, Tooltip,
} from '@mui/material'
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import DoneAllIcon from '@mui/icons-material/DoneAll'
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead'
import AdminNavbar from '@/components/admin/AdminNavbar'
import AdminSidebar from '@/components/admin/AdminSidebar'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
const CONTENT_LEFT = 240

const TYPE_STYLE = {
  success: { icon: <CheckCircleOutlineIcon sx={{ fontSize: 20, color: '#16a34a' }} />, dot: '#16a34a', bg: '#f0fdf4' },
  warning: { icon: <WarningAmberIcon sx={{ fontSize: 20, color: '#d97706' }} />,        dot: '#d97706', bg: '#fffbeb' },
  info:    { icon: <InfoOutlinedIcon sx={{ fontSize: 20, color: '#2563eb' }} />,         dot: '#2563eb', bg: '#eff6ff' },
}

interface Notif {
  _id: string
  message: string
  type: 'success' | 'warning' | 'info'
  isRead: boolean
  createdAt: string
}

export default function AdminNotifications() {
  const router = useRouter()
  const [admin, setAdmin] = useState<any>(null)
  const [notifications, setNotifications] = useState<Notif[]>([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<{ open: boolean; msg: string; type: 'success' | 'error' }>({
    open: false, msg: '', type: 'success',
  })

  const token = () => localStorage.getItem('adminToken') || ''

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
    fetchNotifications()
  }, [admin])

  const fetchNotifications = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API}/notifications`, {
        headers: { Authorization: `Bearer ${token()}` },
      })
      const data = await res.json()
      if (data.success) setNotifications(data.data)
    } catch {
      setToast({ open: true, msg: 'Could not load notifications.', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const markRead = async (id: string) => {
    await fetch(`${API}/notifications/${id}/read`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token()}` },
    })
    setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n))
  }

  const markAllRead = async () => {
    await fetch(`${API}/notifications/read-all`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token()}` },
    })
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
    setToast({ open: true, msg: 'All notifications marked as read.', type: 'success' })
  }

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminUser')
    router.push('/admin/login')
  }

  const unread = notifications.filter(n => !n.isRead).length

  return (
    <>
      <Head><title>Notifications – StartupSri Admin</title></Head>

      <AdminNavbar admin={admin} onLogout={handleLogout} />
      <AdminSidebar activeKey="notifications" />

      <Box sx={{ ml: `${CONTENT_LEFT}px`, mt: '64px', p: 4, minHeight: 'calc(100vh - 64px)', bgcolor: '#f7f8fa' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#0a1940' }}>Notifications</Typography>
            <Typography sx={{ color: '#6b7280', fontSize: 14, mt: 0.5 }}>
              {unread > 0 ? `${unread} unread notification${unread !== 1 ? 's' : ''}` : 'All caught up'}
            </Typography>
          </Box>
          {unread > 0 && (
            <Button
              startIcon={<DoneAllIcon />}
              onClick={markAllRead}
              sx={{
                textTransform: 'none', fontWeight: 700, color: '#111827',
                border: '1px solid #e5e7eb', borderRadius: 2, px: 2,
                '&:hover': { bgcolor: '#f9fafb' },
              }}
            >
              Mark all read
            </Button>
          )}
        </Box>

        {/* Stats strip */}
        <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap' }}>
          {[
            { label: 'Total',  value: notifications.length,                              color: '#0a1940' },
            { label: 'Unread', value: unread,                                             color: '#2563eb' },
            { label: 'Read',   value: notifications.filter(n => n.isRead).length,        color: '#16a34a' },
          ].map(s => (
            <Box key={s.label} sx={{ bgcolor: '#fff', border: '1px solid #e5e7eb', borderRadius: 2, px: 3, py: 2, minWidth: 110 }}>
              <Typography sx={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</Typography>
              <Typography sx={{ fontSize: 13, color: '#6b7280' }}>{s.label}</Typography>
            </Box>
          ))}
        </Box>

        {/* List */}
        {loading ? (
          <Box sx={{ py: 10, textAlign: 'center', color: '#9ca3af' }}>
            <Typography>Loading notifications...</Typography>
          </Box>
        ) : notifications.length === 0 ? (
          <Box sx={{ bgcolor: '#fff', border: '2px dashed #e5e7eb', borderRadius: 3, textAlign: 'center', py: 12 }}>
            <NotificationsNoneIcon sx={{ fontSize: 52, color: '#d1d5db', mb: 2, display: 'block', mx: 'auto' }} />
            <Typography sx={{ fontWeight: 700, color: '#374151', fontSize: 16 }}>No notifications yet</Typography>
            <Typography sx={{ color: '#9ca3af', fontSize: 14, mt: 0.5 }}>
              You'll be notified when users submit projects or KYC reviews.
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {notifications.map(n => {
              const style = TYPE_STYLE[n.type] ?? TYPE_STYLE.info
              return (
                <Box
                  key={n._id}
                  sx={{
                    bgcolor: n.isRead ? '#fff' : style.bg,
                    border: `1px solid ${n.isRead ? '#e5e7eb' : '#d1d5db'}`,
                    borderLeft: `4px solid ${n.isRead ? '#e5e7eb' : style.dot}`,
                    borderRadius: 2.5,
                    p: 2.5,
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 2,
                    transition: 'all 0.15s',
                    '&:hover': { boxShadow: '0 2px 12px rgba(0,0,0,0.06)' },
                  }}
                >
                  <Box sx={{ mt: 0.2, flexShrink: 0 }}>{style.icon}</Box>

                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{
                      fontSize: 14,
                      color: n.isRead ? '#6b7280' : '#111827',
                      fontWeight: n.isRead ? 400 : 600,
                      lineHeight: 1.6,
                    }}>
                      {n.message}
                    </Typography>
                    <Typography sx={{ fontSize: 12, color: '#9ca3af', mt: 0.5 }}>
                      {new Date(n.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      {' at '}
                      {new Date(n.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                    </Typography>
                  </Box>

                  {!n.isRead && (
                    <Tooltip title="Mark as read">
                      <IconButton
                        size="small"
                        onClick={() => markRead(n._id)}
                        sx={{ flexShrink: 0, color: '#9ca3af', '&:hover': { color: '#2563eb', bgcolor: '#eff6ff' } }}
                      >
                        <MarkEmailReadIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
              )
            })}
          </Box>
        )}
      </Box>

      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        onClose={() => setToast(t => ({ ...t, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity={toast.type} variant="filled" sx={{ width: '100%' }}>{toast.msg}</Alert>
      </Snackbar>
    </>
  )
}
