import { Box, Container, Typography, Link, Grid, IconButton } from '@mui/material'
import TwitterIcon from '@mui/icons-material/Twitter'
import FacebookIcon from '@mui/icons-material/Facebook'
import InstagramIcon from '@mui/icons-material/Instagram'
import LinkedInIcon from '@mui/icons-material/LinkedIn'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <Box
      component="footer"
      sx={{
        borderTop: '1px solid',
        borderColor: 'rgba(25, 118, 210, 0.2)',
        bgcolor: 'background.paper',
        py: 6,
        mt: 'auto',
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center' }}>
          <Box sx={{ mb: 3 }}>
            <Link
              href="/about"
              underline="none"
              sx={{
                mx: 2,
                color: 'text.secondary',
                fontSize: '0.875rem',
                transition: 'color 0.2s',
                '&:hover': {
                  color: 'primary.main',
                },
              }}
            >
              About Us
            </Link>
            <Link
              href="/contact"
              underline="none"
              sx={{
                mx: 2,
                color: 'text.secondary',
                fontSize: '0.875rem',
                transition: 'color 0.2s',
                '&:hover': {
                  color: 'primary.main',
                },
              }}
            >
              Contact
            </Link>
            <Link
              href="/terms"
              underline="none"
              sx={{
                mx: 2,
                color: 'text.secondary',
                fontSize: '0.875rem',
                transition: 'color 0.2s',
                '&:hover': {
                  color: 'primary.main',
                },
              }}
            >
              Terms of Service
            </Link>
            <Link
              href="/privacy"
              underline="none"
              sx={{
                mx: 2,
                color: 'text.secondary',
                fontSize: '0.875rem',
                transition: 'color 0.2s',
                '&:hover': {
                  color: 'primary.main',
                },
              }}
            >
              Privacy Policy
            </Link>
          </Box>

          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center', gap: 1 }}>
            <IconButton
              href="https://twitter.com"
              target="_blank"
              sx={{
                color: 'text.secondary',
                '&:hover': {
                  color: 'primary.main',
                },
              }}
            >
              <TwitterIcon />
            </IconButton>
            <IconButton
              href="https://facebook.com"
              target="_blank"
              sx={{
                color: 'text.secondary',
                '&:hover': {
                  color: 'primary.main',
                },
              }}
            >
              <FacebookIcon />
            </IconButton>
            <IconButton
              href="https://instagram.com"
              target="_blank"
              sx={{
                color: 'text.secondary',
                '&:hover': {
                  color: 'primary.main',
                },
              }}
            >
              <InstagramIcon />
            </IconButton>
            <IconButton
              href="https://linkedin.com"
              target="_blank"
              sx={{
                color: 'text.secondary',
                '&:hover': {
                  color: 'primary.main',
                },
              }}
            >
              <LinkedInIcon />
            </IconButton>
          </Box>

          <Typography variant="body2" color="text.secondary">
            © {currentYear} StartupSri. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  )
}
