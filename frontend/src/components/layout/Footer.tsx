import { Box, Typography, IconButton, Stack } from '@mui/material'
import LinkedInIcon from '@mui/icons-material/LinkedIn'
import TwitterIcon from '@mui/icons-material/Twitter'
import FacebookIcon from '@mui/icons-material/Facebook'
import InstagramIcon from '@mui/icons-material/Instagram'
import EmailIcon from '@mui/icons-material/Email'
import Link from 'next/link'

export default function Footer() {
  return (
    <Box
      sx={{
        background: 'linear-gradient(95deg, #101224 0%, #22274a 100%)',
        borderTop: '1px solid rgba(183,187,255,0.16)',
        mt: 4,
      }}
    >
      <Box sx={{ maxWidth: 1100, mx: 'auto', px: { xs: 2, md: 4 }, py: 6, display: 'flex', flexWrap: 'wrap', gap: 4, justifyContent: 'space-between' }}>
        <Box sx={{ maxWidth: 260 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
            <Box component="img" src="/StartupSri.svg" alt="logo" sx={{ width: 28, height: 28 }} onError={(e: any) => { e.target.style.display = 'none' }} />
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#ffffff' }}>StartupSri</Typography>
          </Box>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 2 }}>
            Connecting tech entrepreneurs with investors to build Sri Lanka's startup ecosystem.
          </Typography>
          <Stack direction="row" spacing={1}>
            <IconButton component="a" href="https://linkedin.com/company/startupsri" target="_blank" sx={{ color: 'rgba(255,255,255,0.7)', bgcolor: 'rgba(255,255,255,0.05)', '&:hover': { color: '#0077b5', bgcolor: 'rgba(255,255,255,0.1)' } }}>
              <LinkedInIcon fontSize="small" />
            </IconButton>
            <IconButton component="a" href="https://facebook.com/startupsri" target="_blank" sx={{ color: 'rgba(255,255,255,0.7)', bgcolor: 'rgba(255,255,255,0.05)', '&:hover': { color: '#1877f2', bgcolor: 'rgba(255,255,255,0.1)' } }}>
              <FacebookIcon fontSize="small" />
            </IconButton>
            <IconButton component="a" href="https://instagram.com/startupsri" target="_blank" sx={{ color: 'rgba(255,255,255,0.7)', bgcolor: 'rgba(255,255,255,0.05)', '&:hover': { color: '#e4405f', bgcolor: 'rgba(255,255,255,0.1)' } }}>
              <InstagramIcon fontSize="small" />
            </IconButton>
            <IconButton component="a" href="https://x.com/startupsri" target="_blank" sx={{ color: 'rgba(255,255,255,0.7)', bgcolor: 'rgba(255,255,255,0.05)', '&:hover': { color: '#000000', bgcolor: 'rgba(255,255,255,0.1)' } }}>
              <TwitterIcon fontSize="small" />
            </IconButton>
            <IconButton component="a" href="mailto:hello@startupsri.lk" sx={{ color: 'rgba(255,255,255,0.7)', bgcolor: 'rgba(255,255,255,0.05)', '&:hover': { color: '#ea4335', bgcolor: 'rgba(255,255,255,0.1)' } }}>
              <EmailIcon fontSize="small" />
            </IconButton>
          </Stack>
        </Box>
        {[
          {
            title: 'Platform',
            links: [
              { label: 'How It Works', href: '/#how-it-works' },
              { label: 'Browse Projects', href: '/user/projects' },
              { label: 'Apply to Raise', href: '/user/submit-project' },
              { label: 'Contact Us', href: '/#contact' },
            ],
          },
          {
            title: 'Company',
            links: [
              { label: 'About Us', href: '/#about' },
              { label: 'Register', href: '/auth/register' },
              { label: 'Login', href: '/auth/login' },
            ],
          },
          {
            title: 'Resources',
            links: [
              { label: 'KYC Verification', href: '/user/verifications' },
              { label: 'Investor Portfolio', href: '/user/portfolio' },
              { label: 'Startup Guide', href: '/user/submit-project' },
              { label: 'Dashboard', href: '/user/dashboard' },
            ],
          },
        ].map(col => (
          <Box key={col.title}>
            <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, color: 'rgba(255,255,255,0.9)' }}>
              {col.title}
            </Typography>
            <Box sx={{ mt: 1.5, display: 'flex', flexDirection: 'column', gap: 1 }}>
              {col.links.map(link => (
                <Link key={link.label} href={link.href} style={{ textDecoration: 'none' }}>
                  <Typography variant="body2" sx={{ cursor: 'pointer', color: 'rgba(255,255,255,0.65)', '&:hover': { color: '#ffffff' } }}>
                    {link.label}
                  </Typography>
                </Link>
              ))}
            </Box>
          </Box>
        ))}
      </Box>
      <Box sx={{ borderTop: '1px solid rgba(183,187,255,0.16)', py: 2, textAlign: 'center' }}>
        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.45)' }}>© {new Date().getFullYear()} StartupSri. All rights reserved.</Typography>
      </Box>
    </Box>
  )
}
