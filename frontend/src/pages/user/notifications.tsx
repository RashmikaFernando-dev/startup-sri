import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useAppDispatch, useAppSelector } from '@/hooks/useTypedSelector'
import { logout } from '@/redux/slices/authSlice'
import { Box, Typography, Button, Alert, Snackbar, IconButton, Tooltip } from '@mui/material'
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import DoneAllIcon from '@mui/icons-material/DoneAll'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import UserNavbar from '@/components/user/UserNavbar'
import InvestorSidebar from '@/components/user/InvestorSidebar'
import EntrepreneurSidebar from '@/components/user/EntrepreneurSidebar'
import Footer from '@/components/layout/Footer'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

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

export default function NotificationsPage() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const user = useAppSelector(s => s.auth.user)
  const token = useAppSelector(s => s.auth.token)

  const [notifications, setNotifications] = useState<Notif[]>([])
  const [loading, setLoading] = useState(true)
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [toast, setToast] = useState<{ open: boolean; msg: string; type: 'success' | 'error' }>({
    open: false, msg: '', type: 'success',
  })

  const authToken = () => token || localStorage.getItem('token') || ''

  useEffect(() => {
    if (!localStorage.getItem('token')) { router.push('/auth/login'); return }
    try {
      const parsed = JSON.parse(localStorage.getItem('user') || '{}')
      const img = localStorage.getItem(`profileImage_${parsed.id}`)
      if (img) setProfileImage(img)
    } catch {}
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API}/notifications`, {
        headers: { Authorization: `Bearer ${authToken()}` },
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
      headers: { Authorization: `Bearer ${authToken()}` },
    })
    setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n))
  }

  const markAllRead = async () => {
    await fetch(`${API}/notifications/read-all`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${authToken()}` },
    })
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
    setToast({ open: true, msg: 'All notifications marked as read.', type: 'success' })
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    dispatch(logout())
    router.push('/')
  }

  const isEntrepreneur = user?.role === 'entrepreneur'
  const unread = notifications.filter(n => !n.isRead).length

  return (
    <>
      <Head><title>Notifications – StartupSri</title></Head>
      <Box sx={{ minHeight: '100vh', bgcolor: '#f7f8fa', display: 'flex', flexDirection: 'column' }}>
        <UserNavbar user={user} profileImage={profileImage} onLogout={handleLogout} />

        <Box sx={{ flex: 1, maxWidth: 1100, mx: 'auto', width: '100%', px: { xs: 2, md: 4 }, py: 4, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
          {isEntrepreneur ? (
            <EntrepreneurSidebar active="notifications" onItemClick={(key) => {
              if (key === 'apply') router.push('/user/submit-project')
              else if (key === 'listings') router.push('/user/dashboard')
              else if (key === 'repayments') router.push('/user/dashboard')
              else if (key === 'feedback') router.push('/user/feedback')
              else if (key === 'profile' || key === 'settings') router.push('/user/profile')
            }} />
          ) : (
            <InvestorSidebar active="notifications" />
          )}

          <Box sx={{ flex: 1, minWidth: 0 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4, flexWrap: 'wrap', gap: 2 }}>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#0a1940', mb: 0.5 }}>Notifications</Typography>
                <Typography color="text.secondary">
                  {unread > 0 ? `${unread} unread notification${unread !== 1 ? 's' : ''}` : 'All caught up'}
                </Typography>
              </Box>
              {unread > 0 && (
                <Button
                  startIcon={<DoneAllIcon />}
                  onClick={markAllRead}
                  sx={{ textTransform: 'none', fontWeight: 700, color: '#0a1940', border: '1px solid #e5e7eb', borderRadius: 2, px: 2 }}
                >
                  Mark all read
                </Button>
              )}
            </Box>

            {/* List */}
            {loading ? (
              <Box sx={{ py: 10, textAlign: 'center', color: '#9ca3af' }}>
                <Typography>Loading...</Typography>
              </Box>
            ) : notifications.length === 0 ? (
              <Box sx={{ bgcolor: '#fff', border: '2px dashed #e5e7eb', borderRadius: 3, textAlign: 'center', py: 12 }}>
                <NotificationsNoneIcon sx={{ fontSize: 52, color: '#d1d5db', mb: 2, display: 'block', mx: 'auto' }} />
                <Typography sx={{ fontWeight: 700, color: '#374151', fontSize: 18, mb: 1 }}>No notifications yet</Typography>
                <Typography color="text.secondary">We'll notify you when something important happens.</Typography>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {notifications.map(n => {
                  const style = TYPE_STYLE[n.type] ?? TYPE_STYLE.info
                  return (
                    <Box
                      key={n._id}
                      onClick={() => !n.isRead && markRead(n._id)}
                      sx={{
                        bgcolor: n.isRead ? '#fff' : style.bg,
                        border: `1px solid ${n.isRead ? '#e5e7eb' : '#d1d5db'}`,
                        borderLeft: `4px solid ${n.isRead ? '#e5e7eb' : style.dot}`,
                        borderRadius: 2.5,
                        p: 2.5,
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 2,
                        cursor: n.isRead ? 'default' : 'pointer',
                        transition: 'all 0.15s',
                        '&:hover': { boxShadow: '0 2px 12px rgba(0,0,0,0.06)' },
                      }}
                    >
                      <Box sx={{ mt: 0.2, flexShrink: 0 }}>{style.icon}</Box>

                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography sx={{
                          fontSize: 14, color: n.isRead ? '#6b7280' : '#0a1940',
                          fontWeight: n.isRead ? 400 : 600, lineHeight: 1.6,
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
                            onClick={e => { e.stopPropagation(); markRead(n._id) }}
                            sx={{ flexShrink: 0, color: '#9ca3af', '&:hover': { color: '#0a1940' } }}
                          >
                            <DeleteOutlineIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  )
                })}
              </Box>
            )}
          </Box>
        </Box>

        <Footer />
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
