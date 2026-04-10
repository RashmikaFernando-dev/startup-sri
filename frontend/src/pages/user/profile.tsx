import { useState, useEffect, useRef } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useAppDispatch, useAppSelector } from '@/hooks/useTypedSelector'
import { logout } from '@/redux/slices/authSlice'
import {
  Box,
  Typography,
  Button,
  Avatar,
  Chip,
  Divider,
  TextField,
  Alert,
  Snackbar,
} from '@mui/material'
import PersonIcon from '@mui/icons-material/Person'
import SettingsIcon from '@mui/icons-material/Settings'
import CameraAltIcon from '@mui/icons-material/CameraAlt'
import NotificationsIcon from '@mui/icons-material/Notifications'
import SecurityIcon from '@mui/icons-material/Security'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import LogoutIcon from '@mui/icons-material/Logout'
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser'
import UserNavbar from '@/components/user/UserNavbar'

const tabs = [
  { key: 'info', label: 'Profile Info', icon: <PersonIcon fontSize="small" /> },
  { key: 'settings', label: 'Settings', icon: <SettingsIcon fontSize="small" /> },
]

export default function ProfilePage() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const user = useAppSelector((s) => s.auth.user)
  const [activeTab, setActiveTab] = useState('info')
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [toast, setToast] = useState<{ open: boolean; msg: string; type: 'success' | 'error' }>({ open: false, msg: '', type: 'success' })

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { router.push('/auth/login'); return }
    // Load profile image
    if (user?.id) {
      const img = localStorage.getItem(`profileImage_${user.id}`)
      if (img) setProfileImage(img)
    }
  }, [user?.id])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      setToast({ open: true, msg: 'Image must be under 2MB.', type: 'error' }); return
    }
    if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
      setToast({ open: true, msg: 'Only JPG, PNG or GIF allowed.', type: 'error' }); return
    }
    const reader = new FileReader()
    reader.onload = () => {
      const base64 = reader.result as string
      setProfileImage(base64)
      if (user) localStorage.setItem(`profileImage_${user.id}`, base64)
      setToast({ open: true, msg: 'Profile photo updated!', type: 'success' })
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveImage = () => {
    setProfileImage(null)
    if (user) localStorage.removeItem(`profileImage_${user.id}`)
    if (fileInputRef.current) fileInputRef.current.value = ''
    setToast({ open: true, msg: 'Profile photo removed.', type: 'success' })
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    dispatch(logout())
    router.push('/')
  }

  return (
    <>
      <Head><title>Profile – StartupSri</title></Head>
      <Box sx={{ minHeight: '100vh', bgcolor: '#f7f8fa', display: 'flex', flexDirection: 'column' }}>

        <UserNavbar
          user={user}
          profileImage={profileImage}
          onLogout={handleLogout}
          onBack={() => router.push(user?.role === 'investor' ? '/user/projects' : '/user/dashboard')}
          backLabel="Profile"
        />

        {/* Body */}
        <Box sx={{ flex: 1, maxWidth: 800, mx: 'auto', width: '100%', px: { xs: 2, md: 4 }, py: 5 }}>

          {/* Page header */}
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#0a1940', mb: 0.5 }}>Account</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>Manage your profile and account settings</Typography>

          {/* Tab bar */}
          <Box sx={{ display: 'flex', gap: 0.5, mb: 3, bgcolor: '#f3f4f6', borderRadius: 2, p: 0.5, width: 'fit-content' }}>
            {tabs.map(t => (
              <Box key={t.key} onClick={() => setActiveTab(t.key)} sx={{
                display: 'flex', alignItems: 'center', gap: 1,
                px: 2.5, py: 1, borderRadius: 1.5, cursor: 'pointer',
                bgcolor: activeTab === t.key ? '#fff' : 'transparent',
                color: activeTab === t.key ? '#0a1940' : '#6b7280',
                fontWeight: activeTab === t.key ? 700 : 500,
                fontSize: '0.875rem',
                boxShadow: activeTab === t.key ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.15s',
              }}>
                {t.icon}{t.label}
              </Box>
            ))}
          </Box>

          {/* ── PROFILE INFO tab ── */}
          {activeTab === 'info' && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

              {/* Avatar card */}
              <Box sx={{ bgcolor: '#fff', border: '1px solid #e5e7eb', borderRadius: 3, p: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#0a1940', mb: 3 }}>Profile Photo</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
                  {/* Avatar with hover camera overlay */}
                  <Box sx={{ position: 'relative', width: 96, height: 96, flexShrink: 0 }}>
                    <Avatar
                      src={profileImage || undefined}
                      sx={{ bgcolor: '#0a1940', width: 96, height: 96, fontSize: 34, fontWeight: 700 }}
                    >
                      {!profileImage && `${user?.firstName?.[0]}${user?.lastName?.[0]}`}
                    </Avatar>
                    <Box
                      onClick={() => fileInputRef.current?.click()}
                      sx={{
                        position: 'absolute', inset: 0, borderRadius: '50%',
                        bgcolor: 'rgba(0,0,0,0.45)', opacity: 0, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'opacity 0.2s',
                        '&:hover': { opacity: 1 },
                      }}
                    >
                      <CameraAltIcon sx={{ color: '#fff', fontSize: 28 }} />
                    </Box>
                    <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/gif" style={{ display: 'none' }} onChange={handleImageChange} />
                  </Box>

                  <Box>
                    <Typography variant="body1" sx={{ fontWeight: 700, color: '#0a1940', mb: 0.5 }}>
                      {user?.firstName} {user?.lastName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>{user?.email}</Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Button
                        size="small" variant="contained"
                        startIcon={<CameraAltIcon />}
                        onClick={() => fileInputRef.current?.click()}
                        sx={{ bgcolor: '#111111', '&:hover': { bgcolor: '#000000' }, borderRadius: 2, textTransform: 'none', fontWeight: 700, fontSize: 12 }}
                      >
                        {profileImage ? 'Change Photo' : 'Upload Photo'}
                      </Button>
                      {profileImage && (
                        <Button
                          size="small" variant="outlined" color="error"
                          onClick={handleRemoveImage}
                          sx={{ borderRadius: 2, textTransform: 'none', fontSize: 12 }}
                        >
                          Remove
                        </Button>
                      )}
                    </Box>
                    <Typography variant="caption" color="text.disabled" sx={{ mt: 1, display: 'block' }}>
                      JPG, PNG or GIF · Max 2MB
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Profile details card */}
              <Box sx={{ bgcolor: '#fff', border: '1px solid #e5e7eb', borderRadius: 3, p: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#0a1940', mb: 3 }}>Personal Information</Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2.5 }}>
                  <TextField label="First Name" value={user?.firstName || ''} size="small" InputProps={{ readOnly: true }} fullWidth />
                  <TextField label="Last Name" value={user?.lastName || ''} size="small" InputProps={{ readOnly: true }} fullWidth />
                  <TextField label="Email Address" value={user?.email || ''} size="small" InputProps={{ readOnly: true }} fullWidth sx={{ gridColumn: { sm: '1 / -1' } }} />
                  <Box sx={{ gridColumn: { sm: '1 / -1' } }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5 }}>Account Role</Typography>
                    <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Chip label={user?.role} size="small" sx={{ bgcolor: '#dbeafe', color: '#1d4ed8', fontWeight: 700, textTransform: 'capitalize' }} />
                      {user?.role === 'entrepreneur' && (
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<VerifiedUserIcon fontSize="small" />}
                          onClick={() => router.push('/user/verifications')}
                          sx={{ borderRadius: 2, textTransform: 'none', fontSize: '0.75rem' }}
                        >
                          Verify
                        </Button>
                      )}
                    </Box>
                  </Box>
                </Box>
                <Box sx={{ mt: 3, p: 2, bgcolor: '#f9fafb', borderRadius: 2, border: '1px solid #e5e7eb' }}>
                  <Typography variant="body2" color="text.secondary">
                    To update your name or email address, please contact <strong>support@startupsri.lk</strong>.
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}

          {/* ── SETTINGS tab ── */}
          {activeTab === 'settings' && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

              {/* Notifications */}
              <Box sx={{ bgcolor: '#fff', border: '1px solid #e5e7eb', borderRadius: 3, p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                  <NotificationsIcon sx={{ color: '#0a1940' }} />
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#0a1940' }}>Notifications</Typography>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {[
                    { label: 'Email Notifications', desc: 'Receive updates about your listings and investments' },
                    { label: 'Investor Activity', desc: 'Get notified when someone views or funds your project' },
                    { label: 'Admin Approvals', desc: 'Alert when your project status changes' },
                  ].map(item => (
                    <Box key={item.label} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, border: '1px solid #e5e7eb', borderRadius: 2 }}>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{item.label}</Typography>
                        <Typography variant="caption" color="text.secondary">{item.desc}</Typography>
                      </Box>
                      <Chip label="Enabled" color="success" size="small" sx={{ fontWeight: 700 }} />
                    </Box>
                  ))}
                </Box>
              </Box>

              {/* Account status */}
              <Box sx={{ bgcolor: '#fff', border: '1px solid #e5e7eb', borderRadius: 3, p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                  <SecurityIcon sx={{ color: '#0a1940' }} />
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#0a1940' }}>Account</Typography>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, border: '1px solid #e5e7eb', borderRadius: 2 }}>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>Account Status</Typography>
                      <Typography variant="caption" color="text.secondary">Your account is verified and active</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CheckCircleIcon sx={{ color: '#059669', fontSize: 18 }} />
                      <Chip label="Active" color="success" size="small" sx={{ fontWeight: 700 }} />
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, border: '1px solid #e5e7eb', borderRadius: 2 }}>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>Identity Verified</Typography>
                      <Typography variant="caption" color="text.secondary">KYC verification status</Typography>
                    </Box>
                    <Chip label="Verified" color="success" size="small" sx={{ fontWeight: 700 }} />
                  </Box>
                </Box>

                <Divider sx={{ my: 3 }} />
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#dc2626', mb: 2 }}>Danger Zone</Typography>
                <Button
                  variant="outlined" color="error" startIcon={<LogoutIcon />}
                  onClick={handleLogout}
                  sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
                >
                  Logout
                </Button>
              </Box>
            </Box>
          )}

        </Box>
      </Box>

      <Snackbar open={toast.open} autoHideDuration={3500} onClose={() => setToast(t => ({ ...t, open: false }))} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert severity={toast.type} variant="filled" sx={{ width: '100%' }}>{toast.msg}</Alert>
      </Snackbar>
    </>
  )
}
