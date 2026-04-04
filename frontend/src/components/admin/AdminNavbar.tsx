import { Box, Typography, Avatar, IconButton, Tooltip } from '@mui/material'
import LogoutIcon from '@mui/icons-material/Logout'

interface AdminNavbarProps {
  admin: { firstName?: string; lastName?: string } | null
  onLogout: () => void
  pageTitle?: string
  pageSubtitle?: string
}

export default function AdminNavbar({ admin, onLogout, pageTitle, pageSubtitle }: AdminNavbarProps) {
  const initials = `${admin?.firstName?.[0] ?? ''}${admin?.lastName?.[0] ?? ''}`

  return (
    <Box sx={{
      height: 64,
      bgcolor: '#fff',
      borderBottom: '1px solid #e5e7eb',
      px: { xs: 2, md: 4 },
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'fixed',
      top: 0,
      left: { xs: 0, md: 240 },
      right: 0,
      zIndex: 99,
    }}>
      {/* Left – page heading */}
      <Box>
        {pageTitle && (
          <Typography sx={{ fontWeight: 800, fontSize: 20, color: '#111827', lineHeight: 1.2 }}>
            {pageTitle}
          </Typography>
        )}
        {pageSubtitle && (
          <Typography sx={{ fontSize: 13, color: '#6b7280', mt: 0.2 }}>
            {pageSubtitle}
          </Typography>
        )}
      </Box>

      {/* Right – user info */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box sx={{ textAlign: 'right', display: { xs: 'none', sm: 'block' } }}>
          <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#111827', lineHeight: 1.2 }}>
            {admin?.firstName} {admin?.lastName}
          </Typography>
          <Typography sx={{ fontSize: 12, color: '#9ca3af' }}>Admin</Typography>
        </Box>
        <Avatar sx={{
          bgcolor: '#111827', width: 36, height: 36,
          fontSize: 13, fontWeight: 700, color: '#fff',
        }}>
          {initials}
        </Avatar>
        <Tooltip title="Logout">
          <IconButton size="small" onClick={onLogout} sx={{ color: '#9ca3af', '&:hover': { color: '#111827' } }}>
            <LogoutIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  )
}
