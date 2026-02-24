import Head from 'next/head'
import { Box, Container, Typography, Button, Grid, Card, CardContent } from '@mui/material'
import { useRouter } from 'next/router'
import Layout from '@/components/layout/Layout'
import HandshakeIcon from '@mui/icons-material/Handshake'
import PaidIcon from '@mui/icons-material/Paid'
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch'

export default function Home() {
  const router = useRouter()

  return (
    <Layout>
      <Head>
        <title>StartupSri - Funding Platform for Tech Entrepreneurs</title>
        <meta name="description" content="Sri Lanka's first microloan and equity crowdfunding platform for tech entrepreneurs" />
      </Head>

      {/* Hero Section */}
      <Box
        sx={{
          position: 'relative',
          minHeight: '480px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.6)), url(https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=2000&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          color: 'white',
          textAlign: 'center',
          py: { xs: 8, md: 12 },
          borderRadius: 3,
          mx: { xs: 2, sm: 4, md: 8 },
          my: 4,
        }}
      >
        <Container maxWidth="lg">
          <Typography
            variant="h2"
            component="h1"
            sx={{
              fontWeight: 800,
              fontSize: { xs: '2rem', sm: '3rem', md: '3.5rem', lg: '4rem' },
              mb: 3,
              letterSpacing: '-0.02em',
            }}
          >
            Empowering Tech Entrepreneurs in Sri Lanka
          </Typography>
          <Typography
            variant="h6"
            sx={{
              maxWidth: '800px',
              mx: 'auto',
              mb: 5,
              opacity: 0.95,
              fontSize: { xs: '1rem', md: '1.25rem' },
            }}
          >
            Connect with investors and lenders to secure the funding you need to turn your innovative ideas into reality.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={() => router.push('/register')}
              sx={{
                px: 4,
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 700,
                borderRadius: 2,
                textTransform: 'none',
                '&:hover': {
                  transform: 'scale(1.05)',
                },
                transition: 'transform 0.2s',
              }}
            >
              Apply for a Loan
            </Button>
            <Button
              variant="contained"
              sx={{
                px: 4,
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 700,
                borderRadius: 2,
                textTransform: 'none',
                bgcolor: 'rgba(255, 255, 255, 0.9)',
                color: 'grey.900',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 1)',
                  transform: 'scale(1.05)',
                },
                transition: 'transform 0.2s',
              }}
              onClick={() => router.push('/register?type=investor')}
            >
              Become an Investor
            </Button>
          </Box>
        </Container>
      </Box>

      {/* How It Works Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 8, md: 12 } }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography
            variant="h3"
            component="h2"
            sx={{
              fontWeight: 700,
              mb: 2,
              fontSize: { xs: '2rem', md: '2.5rem' },
            }}
          >
            How It Works
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: '700px', mx: 'auto' }}>
            Our platform simplifies the microloan process, connecting entrepreneurs with lenders in a secure and transparent environment.
          </Typography>
        </Box>

        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Card
              sx={{
                height: '100%',
                textAlign: 'center',
                p: 3,
                border: '1px solid',
                borderColor: 'primary.light',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: 6,
                },
              }}
            >
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  bgcolor: 'primary.light',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 3,
                }}
              >
                <HandshakeIcon sx={{ fontSize: 32, color: 'primary.main' }} />
              </Box>
              <Typography variant="h5" component="h3" sx={{ fontWeight: 700, mb: 2 }}>
                Apply for a Loan
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Create a verified profile and submit your loan application with detailed business information and project plans.
              </Typography>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card
              sx={{
                height: '100%',
                textAlign: 'center',
                p: 3,
                border: '1px solid',
                borderColor: 'primary.light',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: 6,
                },
              }}
            >
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  bgcolor: 'primary.light',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 3,
                }}
              >
                <PaidIcon sx={{ fontSize: 32, color: 'primary.main' }} />
              </Box>
              <Typography variant="h5" component="h3" sx={{ fontWeight: 700, mb: 2 }}>
                Get Funded
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Our platform matches you with potential lenders and investors who believe in your vision and want to support your growth.
              </Typography>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card
              sx={{
                height: '100%',
                textAlign: 'center',
                p: 3,
                border: '1px solid',
                borderColor: 'primary.light',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: 6,
                },
              }}
            >
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  bgcolor: 'primary.light',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 3,
                }}
              >
                <RocketLaunchIcon sx={{ fontSize: 32, color: 'primary.main' }} />
              </Box>
              <Typography variant="h5" component="h3" sx={{ fontWeight: 700, mb: 2 }}>
                Grow Your Business
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Use the funds to expand your operations, develop products, create jobs, and build Sri Lanka's digital economy.
              </Typography>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* Success Stories Section */}
      <Box sx={{ bgcolor: 'background.default', py: { xs: 8, md: 12 } }}>
        <Container maxWidth="lg">
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: { xs: 'start', md: 'center' },
              mb: 6,
              flexDirection: { xs: 'column', md: 'row' },
              gap: 3,
            }}
          >
            <Box sx={{ maxWidth: '600px' }}>
              <Typography
                variant="h3"
                component="h2"
                sx={{
                  fontWeight: 700,
                  mb: 2,
                  fontSize: { xs: '2rem', md: '2.5rem' },
                }}
              >
                Meet Our Entrepreneurs
              </Typography>
              <Typography variant="h6" color="text.secondary">
                Discover inspiring stories of tech entrepreneurs who have successfully used our platform to achieve their business goals.
              </Typography>
            </Box>
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={() => router.push('/projects')}
              sx={{
                px: 4,
                py: 1.5,
                fontWeight: 700,
                borderRadius: 2,
                textTransform: 'none',
                flexShrink: 0,
              }}
            >
              View All Projects
            </Button>
          </Box>

          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Card
                sx={{
                  overflow: 'hidden',
                  transition: 'transform 0.3s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    '& .story-image': {
                      transform: 'scale(1.05)',
                    },
                  },
                }}
              >
                <Box
                  className="story-image"
                  sx={{
                    height: 280,
                    backgroundImage: 'url(https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?auto=format&fit=crop&w=800&q=80)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    transition: 'transform 0.3s',
                  }}
                />
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h5" component="h3" sx={{ fontWeight: 700, mb: 1 }}>
                    Amara's Tech Success
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Amara, a software engineer from Colombo, secured LKR 2M to develop her SaaS platform for local businesses, creating 8 jobs.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card
                sx={{
                  overflow: 'hidden',
                  transition: 'transform 0.3s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    '& .story-image': {
                      transform: 'scale(1.05)',
                    },
                  },
                }}
              >
                <Box
                  className="story-image"
                  sx={{
                    height: 280,
                    backgroundImage: 'url(https://images.unsplash.com/photo-1556157382-97eda2d62296?auto=format&fit=crop&w=800&q=80)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    transition: 'transform 0.3s',
                  }}
                />
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h5" component="h3" sx={{ fontWeight: 700, mb: 1 }}>
                    Ravindu's Mobile App
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Ravindu raised LKR 1.5M in equity funding to launch his education technology mobile app, now used by 10,000+ students.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 8, md: 12 } }}>
        <Box
          sx={{
            bgcolor: 'primary.main',
            color: 'white',
            borderRadius: 3,
            p: { xs: 6, md: 10 },
            textAlign: 'center',
          }}
        >
          <Typography
            variant="h3"
            component="h2"
            sx={{
              fontWeight: 700,
              mb: 3,
              fontSize: { xs: '2rem', md: '2.5rem' },
            }}
          >
            Ready to Make a Difference?
          </Typography>
          <Typography
            variant="h6"
            sx={{
              mb: 5,
              maxWidth: '700px',
              mx: 'auto',
              opacity: 0.95,
            }}
          >
            Join our community of entrepreneurs and investors today and start your journey towards financial empowerment and innovation.
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => router.push('/register')}
            sx={{
              bgcolor: 'white',
              color: 'primary.main',
              px: 5,
              py: 2,
              fontSize: '1.1rem',
              fontWeight: 700,
              borderRadius: 2,
              textTransform: 'none',
              '&:hover': {
                bgcolor: 'grey.100',
                transform: 'scale(1.05)',
              },
              transition: 'transform 0.2s',
            }}
          >
            Get Started Today
          </Button>
        </Box>
      </Container>
    </Layout>
  )
}
