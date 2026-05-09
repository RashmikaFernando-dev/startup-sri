import { useState, useEffect } from 'react'
import { Box, Typography, Avatar, IconButton, Tooltip, Chip, Badge } from '@mui/material'
import { useRouter } from 'next/router'
import LogoutIcon from '@mui/icons-material/Logout'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

interface UserNavbarProps {
  user: { firstName?: string; lastName?: string } | null
  profileImage?: string | null
  onLogout: () => void
  /** If provided, renders a back button + label chip instead of the logo link */
  onBack?: () => void
  backLabel?: string
}

export default function UserNavbar({ user, profileImage, onLogout, onBack, backLabel }: UserNavbarProps) {
  const router = useRouter()
  const [unread, setUnread] = useState(0)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) return
    const fetchCount = async () => {
      try {
        const res = await fetch(`${API}/notifications/unread-count`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await res.json()
        if (data.success) setUnread(data.count)
      } catch {}
    }
    fetchCount()
    const interval = setInterval(fetchCount, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <Box sx={{
      bgcolor: '#fff', borderBottom: '1px solid #e5e7eb',
      px: { xs: 2, md: 4 }, py: 1.5,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>
      {/* Left side */}
      {onBack ? (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Tooltip title={`Back${backLabel ? ` to ${backLabel}` : ''}`}>
            <IconButton
              size="small"
              onClick={onBack}
              sx={{ color: '#6b7280', border: '1px solid #e5e7eb', borderRadius: 1.5 }}
            >
              <ArrowBackIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Typography
            variant="h6"
            sx={{ fontWeight: 800, color: '#0a1940', letterSpacing: '-0.02em', cursor: 'pointer' }}
            onClick={onBack}
          >
            StartupSri
          </Typography>
          {backLabel && (
            <Chip label={backLabel} size="small" sx={{ bgcolor: 'rgba(127,104,255,0.18)', color: '#6e57ef', fontWeight: 700 }} />
          )}
        </Box>
      ) : (
        <Box
          sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer' }}
          onClick={() => router.push('/')}
        >
          <Box
            component="img"
            src="/StartupSri.svg"
            alt="logo"
            sx={{ width: 32, height: 32, objectFit: 'contain' }}
            onError={(e: any) => { e.target.style.display = 'none' }}
          />
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#0a1940', letterSpacing: '-0.02em' }}>
            StartupSri
          </Typography>
        </Box>
      )}

      {/* Right side */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Tooltip title="Notifications">
          <IconButton size="small" onClick={() => router.push('/user/notifications')} sx={{ color: '#6b7280' }}>
            <Badge badgeContent={unread > 0 ? unread : undefined} color="error" max={9}
              sx={{ '& .MuiBadge-badge': { fontSize: 10, minWidth: 16, height: 16 } }}>
              <NotificationsNoneIcon fontSize="small" />
            </Badge>
          </IconButton>
        </Tooltip>
        <Avatar
          src={profileImage || undefined}
          sx={{ bgcolor: '#0a1940', width: 34, height: 34, fontSize: 14, fontWeight: 700 }}
        >
          {!profileImage && `${user?.firstName?.[0] ?? ''}${user?.lastName?.[0] ?? ''}`}
        </Avatar>
        <Typography variant="body2" sx={{ fontWeight: 600, color: '#0a1940', display: { xs: 'none', sm: 'block' } }}>
          {user?.firstName} {user?.lastName}
        </Typography>
        <Tooltip title="Logout">
          <IconButton size="small" onClick={onLogout} sx={{ color: '#6b7280' }}>
            <LogoutIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  )
}
