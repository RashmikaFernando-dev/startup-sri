import { Box, Typography, Avatar, IconButton, Tooltip } from '@mui/material'
import LogoutIcon from '@mui/icons-material/Logout'
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'

interface AdminNavbarProps {
  admin: { firstName?: string; lastName?: string } | null
  onLogout: () => void
}

export default function AdminNavbar({ admin, onLogout }: AdminNavbarProps) {
  return (
    <Box sx={{
      bgcolor: '#0a1940',
      px: { xs: 2, md: 4 }, py: 1.5,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box sx={{
          width: 32, height: 32, borderRadius: '50%',
          bgcolor: 'rgba(255,255,255,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <AdminPanelSettingsIcon sx={{ color: '#fff', fontSize: 18 }} />
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>
          StartupSri{' '}
          <Typography component="span" variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', fontWeight: 500, ml: 0.5 }}>
            Admin
          </Typography>
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
          <IconButton size="small" onClick={onLogout} sx={{ color: 'rgba(255,255,255,0.6)', '&:hover': { color: '#fff' } }}>
            <LogoutIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  )
}
