import { Box, Typography } from '@mui/material'

export default function Footer() {
  return (
    <Box sx={{ bgcolor: '#fff', borderTop: '1px solid #e5e7eb', mt: 4 }}>
      <Box sx={{ maxWidth: 1100, mx: 'auto', px: { xs: 2, md: 4 }, py: 6, display: 'flex', flexWrap: 'wrap', gap: 4, justifyContent: 'space-between' }}>
        <Box sx={{ maxWidth: 260 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
            <Box component="img" src="/StartupSri.svg" alt="logo" sx={{ width: 28, height: 28 }} onError={(e: any) => { e.target.style.display = 'none' }} />
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0a1940' }}>StartupSri</Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            Connecting tech entrepreneurs with investors to build Sri Lanka's startup ecosystem.
          </Typography>
        </Box>
        {[
          { title: 'Platform', links: ['How It Works', 'Browse Projects', 'Apply to Raise', 'Pricing'] },
          { title: 'Company', links: ['About Us', 'Careers', 'Blog', 'Press'] },
          { title: 'Resources', links: ['Help Center', 'Investor Guide', 'Startup Guide', 'Community'] },
        ].map(col => (
          <Box key={col.title}>
            <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, color: '#374151' }}>
              {col.title}
            </Typography>
            <Box sx={{ mt: 1.5, display: 'flex', flexDirection: 'column', gap: 1 }}>
              {col.links.map(link => (
                <Typography key={link} variant="body2" color="text.secondary" sx={{ cursor: 'pointer', '&:hover': { color: '#0a1940' } }}>
                  {link}
                </Typography>
              ))}
            </Box>
          </Box>
        ))}
      </Box>
      <Box sx={{ borderTop: '1px solid #e5e7eb', py: 2, textAlign: 'center' }}>
        <Typography variant="caption" color="text.disabled">© {new Date().getFullYear()} StartupSri. All rights reserved.</Typography>
      </Box>
    </Box>
  )
}
