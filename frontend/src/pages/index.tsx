import Head from 'next/head'
import { useEffect, useState } from 'react'
import { Box, Container, Typography, Button, Grid, Card, CardContent, Avatar, Chip, Accordion, AccordionSummary, AccordionDetails, LinearProgress, TextField, Divider, Stack, IconButton } from '@mui/material'
import { useRouter } from 'next/router'
import Layout from '@/components/layout/Layout'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import BarChartIcon from '@mui/icons-material/BarChart'
import PublicIcon from '@mui/icons-material/Public'
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser'
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import EmailIcon from '@mui/icons-material/Email'
import PhoneIcon from '@mui/icons-material/Phone'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import api from '@/utils/api'


const fallbackStats = [
  { value: 'LKR 0', label: 'Total Funded' },
  { value: '0', label: 'Startups Funded' },
  { value: '0', label: 'Active Investors' },
  { value: '0%', label: 'Success Rate' },
]

const features = [
  {
    icon: <AccountCircleIcon sx={{ fontSize: 36, color: '#7f68ff' }} />,
    title: 'Startup Profiles',
    desc: 'Create rich, verified entrepreneur profiles that highlight your skills, project details, and track record to attract funding.',
  },
  {
    icon: <TrendingUpIcon sx={{ fontSize: 36, color: '#7f68ff' }} />,
    title: 'Investor Matching',
    desc: 'Our platform surfaces your project to investors who are most likely to fund ventures in your category and stage.',
  },
  {
    icon: <BarChartIcon sx={{ fontSize: 36, color: '#7f68ff' }} />,
    title: 'Funding Analytics',
    desc: 'Track funding progress, investor engagement, and milestone completion with real-time dashboard analytics.',
  },
  {
    icon: <PublicIcon sx={{ fontSize: 36, color: '#7f68ff' }} />,
    title: 'Global Network',
    desc: 'Connect with a worldwide network of investors, including Sri Lankan diaspora ready to back local innovation.',
  },
  {
    icon: <VerifiedUserIcon sx={{ fontSize: 36, color: '#7f68ff' }} />,
    title: 'Due Diligence Tools',
    desc: 'Multi-layer KYC, NIC verification, and document checks ensure every entrepreneur and project is credible.',
  },
  {
    icon: <AccountBalanceWalletIcon sx={{ fontSize: 36, color: '#7f68ff' }} />,
    title: 'Portfolio Management',
    desc: 'Investors can track all contributions, expected returns, and repayment schedules from a single dashboard.',
  },
]

const steps = [
  {
    num: '01',
    title: 'Create Your Profile',
    desc: 'Register as an entrepreneur or investor. Complete your profile with identity verification, professional background, and funding goals.',
  },
  {
    num: '02',
    title: 'Get Verified & Matched',
    desc: 'Complete KYC verification. Our system evaluates your credit score and surfaces your project to relevant investors.',
  },
  {
    num: '03',
    title: 'Connect & Pitch',
    desc: "Submit your startup project with a funding target, use-of-funds breakdown, and milestones. Admin review ensures quality.",
  },
  {
    num: '04',
    title: 'Secure Funding',
    desc: 'Investors pledge capital via our secure payment gateway. Funds are released once targets are reached.',
  },
]

type ProjectCardItem = {
  id: string
  name: string
  category: string
  raised: number
  target: number
  equity: string
  daysLeft: number
  status: string
}

type FeedbackItem = {
  id: string
  quote: string
  name: string
  avatar: string
  color: string
}

const feedbackColors = ['#4f46e5', '#2563eb', '#0ea5e9', '#7c3aed', '#0891b2', '#1d4ed8']

const faqs = [
  {
    q: 'How does the funding process work?',
    a: 'Entrepreneurs register, complete KYC verification, and submit a project with a funding target. Once admin-approved, the project is listed publicly. Investors pledge capital until the target is met, at which point funds are released to the entrepreneur.',
  },
  {
    q: 'What types of startups are eligible?',
    a: 'StartupSri is exclusively for technology-focused startups — software, mobile apps, SaaS platforms, hardware, EdTech, HealthTech, AgriTech, and similar ventures. All founders must be verified Sri Lankan citizens or legal residents.',
  },
  {
    q: 'What information do I need to provide?',
    a: 'You need a valid NIC, proof of address, a business plan or pitch deck, your funding target with breakdown of use of funds, and project milestones. The more complete your profile, the higher your credit score and funding chances.',
  },
  {
    q: 'How much does it cost to use the platform?',
    a: 'Registration is free. If your project is successfully funded, a small platform fee is deducted. There are no upfront charges for listing a project or browsing investments.',
  },
  {
    q: 'Is my investment protected?',
    a: 'All transactions go through our secure, PCI-compliant payment gateway. Every entrepreneur and project is verified before listing. Repayment schedules are tracked and documented for all microloan agreements.',
  },
]


export default function Home() {
  const router = useRouter()
  const displayFont = '"Poppins", "Segoe UI", sans-serif'
  const [featuredProjects, setFeaturedProjects] = useState<ProjectCardItem[]>([])
  const [projectsLoading, setProjectsLoading] = useState(true)
  const [feedbackItems, setFeedbackItems] = useState<FeedbackItem[]>([])
  const [feedbackLoading, setFeedbackLoading] = useState(true)
  const [feedbackError, setFeedbackError] = useState('')
  const [platformStats, setPlatformStats] = useState(fallbackStats)

  useEffect(() => {
    const loadStats = async () => {
      try {
        const res = await api.get('/stats/public')
        const d = res.data?.data
        if (d) {
          const fmtAmount = (n: number) => {
            if (n >= 1_000_000) return `LKR ${(n / 1_000_000).toFixed(1)}M+`
            if (n >= 1_000) return `LKR ${(n / 1_000).toFixed(0)}K+`
            return `LKR ${n.toLocaleString()}`
          }
          setPlatformStats([
            { value: fmtAmount(d.totalFunded), label: 'Total Funded' },
            { value: `${d.startupsFunded}+`, label: 'Startups Funded' },
            { value: `${d.activeInvestors}+`, label: 'Active Investors' },
            { value: `${d.successRate}%`, label: 'Success Rate' },
          ])
        }
      } catch {}
    }
    loadStats()
  }, [])

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const response = await api.get('/projects')
        const projects = Array.isArray(response.data?.data) ? response.data.data : []

        const mapped: ProjectCardItem[] = projects
          .filter((project: any) => ['approved', 'active', 'funded'].includes(project.status))
          .slice(0, 3)
          .map((project: any) => {
            const endDate = project.endDate ? new Date(project.endDate) : null
            const today = new Date()
            const daysLeft = endDate
              ? Math.max(0, Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)))
              : 30

            return {
              id: project._id,
              name: project.title,
              category: `${project.category} · ${project.fundingType === 'equity' ? 'Equity' : 'Microloan'}`,
              raised: Number(project.currentFunding || 0),
              target: Number(project.fundingGoal || 0),
              equity: project.fundingType === 'equity'
                ? `${Number(project.equityOffered || 0)}%`
                : `${Number(project.interestRate || 0)}% APR`,
              daysLeft,
              status: (project.status || 'active').charAt(0).toUpperCase() + (project.status || 'active').slice(1),
            }
          })

        setFeaturedProjects(mapped)
      } catch (error) {
        setFeaturedProjects([])
      } finally {
        setProjectsLoading(false)
      }
    }

    loadProjects()
  }, [])

  useEffect(() => {
    const loadLatestFeedback = async () => {
      setFeedbackLoading(true)
      setFeedbackError('')

      try {
        const response = await api.get('/feedback/latest')
        const items = Array.isArray(response.data?.data) ? response.data.data : []

        const mapped: FeedbackItem[] = items.map((item: any, index: number) => {
          const commenterName = String(item.userName || 'Anonymous User').trim() || 'Anonymous User'
          const avatarLetter = commenterName.charAt(0).toUpperCase() || 'A'

          return {
            id: String(item._id),
            quote: String(item.text || ''),
            name: commenterName,
            avatar: avatarLetter,
            color: feedbackColors[index % feedbackColors.length],
          }
        })

        setFeedbackItems(mapped)
      } catch (error) {
        setFeedbackItems([])
        setFeedbackError('Failed to load feedback. Please try again later.')
      } finally {
        setFeedbackLoading(false)
      }
    }

    loadLatestFeedback()
  }, [])

  return (
    <Layout>
      <Head>
        <title>StartupSri – Funding Platform for Tech Entrepreneurs</title>
        <meta name="description" content="Sri Lanka's first microloan and equity crowdfunding platform for tech entrepreneurs" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </Head>

      <Box
        sx={{
          position: 'relative',
          minHeight: { xs: '560px', md: '680px' },
          display: 'flex',
          alignItems: 'center',
          backgroundImage:
            'radial-gradient(circle at 15% 15%, rgba(127,104,255,0.32), transparent 30%), radial-gradient(circle at 80% 8%, rgba(91,194,255,0.22), transparent 34%), linear-gradient(155deg, rgba(15,16,36,0.92) 0%, rgba(27,29,62,0.84) 55%, rgba(39,35,93,0.82) 100%), url(https://imageio.forbes.com/specials-images/imageserve/643ee558bb3476ae781e5605/0x0.jpg?format=jpg&height=900&width=1600&fit=bounds)',
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
          color: 'white',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            position: 'absolute', top: -100, right: -80, width: 500, height: 500,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(25,118,210,0.25) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />
        <Box
          sx={{
            position: 'absolute', bottom: -60, left: -60, width: 350, height: 350,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,152,0,0.18) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        <Container  maxWidth={false} sx={{  py: { xs: 10, md: 14 },  position: 'relative', zIndex: 1,px: { xs: 2.5, md: 5, lg: 7 } }} >
          
          <Chip
            label="Sri Lanka's #1 Tech Startup Funding Platform"
            sx={{
              bgcolor: 'rgba(255,255,255,0.15)', color: 'white', fontWeight: 600, mb: 3, px: 1,
              backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.25)',
            }}
          />
          <Typography
            variant="h1"
            component="h1"
            sx={{
              fontWeight: 800,
              fontFamily: displayFont,
              fontSize: { xs: '2.4rem', sm: '3.2rem', md: '4rem', lg: '4.6rem' },
              mb: 3, lineHeight: 1.1, letterSpacing: '-0.02em', maxWidth: 800,
            }}
          >
            Where Sri Lanka's Tech Dreams<br />
            Meet{' '}<Box component="span" sx={{ color: '#7f68ff' }}>Smart Capital</Box>
          </Typography>
          <Typography
            variant="h6"
            sx={{ maxWidth: 640, mb: 5, opacity: 0.88, fontWeight: 400, fontSize: { xs: '1rem', md: '1.15rem' }, lineHeight: 1.7 }}
          >
            StartupSri creates a trusted ecosystem where verified entrepreneurs raise microloans
            and equity funding — and investors confidently support the next generation of digital innovation.
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 6 }}>
            <Button
              variant="contained" size="large"
              onClick={() => router.push('/auth/register')}
              endIcon={<ArrowForwardIcon />}
              sx={{
                px: 4, py: 1.7, fontSize: '1rem', fontWeight: 700, borderRadius: 2, textTransform: 'none',
                bgcolor: '#7f68ff', boxShadow: '0 14px 32px rgba(127,104,255,0.44)',
                '&:hover': { bgcolor: '#6e57ef', transform: 'translateY(-2px)', boxShadow: '0 18px 34px rgba(127,104,255,0.5)' },
                transition: 'all 0.2s',
              }}
            >
              Apply for Funding
            </Button>
            <Button
              variant="outlined" size="large"
              onClick={() => router.push('/auth/register?type=investor')}
              sx={{
                px: 4, py: 1.7, fontSize: '1rem', fontWeight: 700, borderRadius: 2, textTransform: 'none',
                color: 'white',
                borderColor: 'rgba(255,255,255,0.4)',
                bgcolor: 'rgba(255,255,255,0.05)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                '&:hover': {
                  borderColor: 'rgba(255,255,255,0.75)',
                  bgcolor: 'rgba(255,255,255,0.14)',
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.2s',
              }}
            >
              Become an Investor
            </Button>
          </Stack>
          <Stack direction="row" spacing={1.5} sx={{ opacity: 0.75 }} flexWrap="wrap" useFlexGap>
            {['Verified Entrepreneurs', 'Secure Payments', 'Transparent Funding', 'CRIB-Ready Reports'].map((t) => (
              <Box key={t} sx={{ display: 'flex', alignItems: 'center', gap: 0.7 }}>
                <CheckCircleIcon sx={{ fontSize: 16, color: '#81c784' }} />
                <Typography variant="caption" sx={{ fontWeight: 500, fontSize: '0.8rem' }}>{t}</Typography>
              </Box>
            ))}
          </Stack>
        </Container>
      </Box>

      {/* ── Stats Bar ── */}
      <Box sx={{ bgcolor: '#f3f4fb', py: { xs: 4, md: 5 } }}>
        <Container maxWidth="lg">
          <Grid container spacing={2} justifyContent="center" sx={{
            background: 'linear-gradient(95deg, #17192d 0%, #2a2f57 100%)',
            borderRadius: 4,
            p: { xs: 2.2, md: 3.2 },
            border: '1px solid rgba(183,187,255,0.2)',
          }}>
            {platformStats.map((s) => (
              <Grid item xs={6} md={3} key={s.label}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: 'white', fontSize: { xs: '1.8rem', md: '2.2rem' } }}>
                    {s.value}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.75)', fontWeight: 500, mt: 0.5 }}>
                    {s.label}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ── Features ── */}
      <Box id="features" sx={{ py: { xs: 8, md: 12 }, bgcolor: '#f4f5fb' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Chip label="Features" variant="outlined" sx={{ mb: 2, fontWeight: 700, bgcolor: '#ece9ff', borderColor: '#cfc9ff', color: '#4b3fbd' }} />
            <Typography variant="h3" sx={{ fontWeight: 700, mb: 2, fontSize: { xs: '2rem', md: '2.5rem' }, fontFamily: displayFont, color: '#1f2343' }}>
              Everything You Need to Succeed
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 620, mx: 'auto', fontSize: '1.05rem', lineHeight: 1.8 }}>
              Our platform provides all the tools and resources for startups to receive funding and for
              investors to find their next big opportunity.
            </Typography>
          </Box>
          <Grid container spacing={3}>
            {features.map((f) => (
              <Grid item xs={12} sm={6} md={4} key={f.title}>
                <Card
                  sx={{
                    height: '100%', p: 1, border: '1px solid', borderColor: '#e4e7f5',
                    borderRadius: 4,
                    background: 'linear-gradient(180deg, #ffffff 0%, #fafbff 100%)',
                    transition: 'all 0.25s',
                    '&:hover': { transform: 'translateY(-6px)', boxShadow: '0 20px 44px rgba(53,58,120,0.14)', borderColor: '#b9beef' },
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box
                      sx={{
                        width: 60, height: 60, borderRadius: 2,
                        background: 'linear-gradient(135deg, #ede9ff 0%, #d9ecff 100%)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2.5,
                      }}
                    >
                      {f.icon}
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>{f.title}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.75 }}>{f.desc}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ── How It Works ── */}
      <Box id="how-it-works" sx={{ py: { xs: 8, md: 12 }, background: 'linear-gradient(180deg, #ffffff 0%, #f7f8fd 100%)' }}>
        <Container maxWidth="lg">
          <Grid container spacing={8} alignItems="center">
            <Grid item xs={12} md={6}>
              <Chip label="Process" variant="outlined" sx={{ mb: 2, fontWeight: 700, bgcolor: '#ece9ff', borderColor: '#cfc9ff', color: '#4b3fbd' }} />
              <Typography variant="h3" sx={{ fontWeight: 700, mb: 2, fontSize: { xs: '2rem', md: '2.5rem' }, fontFamily: displayFont, color: '#1f2343' }}>
                How It Works
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 5, lineHeight: 1.8 }}>
                A simple, transparent process for both startups and investors, built for Sri Lanka's financial and regulatory context.
              </Typography>
              <Stack spacing={3}>
                {steps.map((step, i) => (
                  <Box key={step.num} sx={{ display: 'flex', gap: 2.5, alignItems: 'flex-start' }}>
                    <Box
                      sx={{
                        minWidth: 52, height: 52, borderRadius: '50%',
                        bgcolor: i < 2 ? '#7f68ff' : '#e4e6f4',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      }}
                    >
                      <Typography sx={{ fontWeight: 800, fontSize: '0.85rem', color: i < 2 ? 'white' : 'text.secondary' }}>
                        {step.num}
                      </Typography>
                    </Box>
                    <Box sx={{ pt: 0.5 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>{step.title}</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>{step.desc}</Typography>
                    </Box>
                  </Box>
                ))}
              </Stack>
              <Button
                variant="contained" size="large"
                onClick={() => router.push('/auth/register')}
                endIcon={<ArrowForwardIcon />}
                sx={{
                  mt: 5,
                  px: 4,
                  py: 1.5,
                  fontWeight: 700,
                  borderRadius: 2,
                  textTransform: 'none',
                  bgcolor: '#111111',
                  boxShadow: '0 10px 26px rgba(0,0,0,0.3)',
                  '&:hover': { bgcolor: '#000000' },
                }}
              >
                Get Started Free
              </Button>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  position: 'relative', borderRadius: 4, overflow: 'hidden',
                  boxShadow: '0 24px 58px rgba(34,42,96,0.25)',
                  '&:hover img': { transform: 'scale(1.03)' },
                }}
              >
                <Box
                  component="img"
                  src="/howitworks.jpeg"
                  alt="How it works"
                  sx={{ width: '100%', height: 480, objectFit: 'cover', display: 'block', transition: 'transform 0.4s ease' }}
                />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ── Featured Startups ── */}
      <Box id="opportunities" sx={{ bgcolor: '#f4f5fb', py: { xs: 8, md: 12 } }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, mb: 6, flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
            <Box>
              <Chip label="Opportunities" variant="outlined" sx={{ mb: 1.5, fontWeight: 700, bgcolor: '#ece9ff', borderColor: '#cfc9ff', color: '#4b3fbd' }} />
              <Typography variant="h3" sx={{ fontWeight: 700, fontSize: { xs: '2rem', md: '2.5rem' }, fontFamily: displayFont, color: '#1f2343' }}>Featured Startups</Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>Meet your next investment opportunity</Typography>
            </Box>
            <Button
              variant="outlined" size="large" endIcon={<ArrowForwardIcon />}
              onClick={() => router.push('/user/projects')}
              sx={{
                textTransform: 'none',
                fontWeight: 700,
                borderRadius: 2,
                px: 3,
                flexShrink: 0,
                color: '#111111',
                borderColor: '#111111',
                '&:hover': { borderColor: '#000000', bgcolor: 'rgba(0,0,0,0.04)' },
              }}
            >
              Discover More
            </Button>
          </Box>
          <Grid container spacing={3}>
            {(projectsLoading ? [] : featuredProjects).map((s) => {
              const targetSafe = s.target > 0 ? s.target : 1
              const pct = Math.min(100, Math.round((s.raised / targetSafe) * 100))
              return (
                <Grid item xs={12} md={4} key={s.id}>
                  <Card
                    sx={{
                      height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden',
                      borderRadius: 4,
                      border: '1px solid #e4e7f5',
                      background: 'linear-gradient(180deg, #ffffff 0%, #fafbff 100%)',
                      transition: 'all 0.25s',
                      '&:hover': { transform: 'translateY(-6px)', boxShadow: '0 18px 42px rgba(53,58,120,0.14)' },
                    }}
                  >
                    <CardContent sx={{ flexGrow: 1, p: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                        <Chip label={s.category} size="small" variant="outlined" color="primary" sx={{ fontWeight: 600 }} />
                        <Chip
                          label={s.status}
                          size="small"
                          sx={{ bgcolor: 'success.main', color: 'white', fontWeight: 700, fontSize: '0.7rem' }}
                        />
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>{s.name}</Typography>
                      <Box sx={{ mt: 2.5, mb: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.8 }}>
                          <Typography variant="body2" color="text.secondary">
                            Raised: <strong>LKR {s.raised.toLocaleString()}</strong>
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main' }}>{pct}%</Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate" value={pct}
                          sx={{ height: 7, borderRadius: 4, bgcolor: 'grey.200', '& .MuiLinearProgress-bar': { borderRadius: 4 } }}
                        />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.8 }}>
                          <Typography variant="caption" color="text.secondary">Target: LKR {s.target.toLocaleString()}</Typography>
                          <Typography variant="caption" color="text.secondary">{s.daysLeft} days left</Typography>
                        </Box>
                      </Box>
                      <Divider sx={{ my: 2 }} />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" color="text.secondary">Equity: <strong>{s.equity}</strong></Typography>
                        <Button
                          variant="contained" size="small"
                          onClick={() => router.push('/user/projects')}
                          sx={{
                            textTransform: 'none',
                            fontWeight: 700,
                            borderRadius: 1.5,
                            bgcolor: '#111111',
                            '&:hover': { bgcolor: '#000000' },
                          }}
                        >
                          Learn More
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              )
            })}

            {!projectsLoading && featuredProjects.length === 0 && (
              <Grid item xs={12}>
                <Card sx={{ borderRadius: 3, border: '1px dashed #c7cbe6', boxShadow: 'none' }}>
                  <CardContent sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: '#1f2343' }}>
                      No Approved Projects Yet
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Featured startups will appear here once projects are approved and active.
                    </Typography>
                    <Button
                      variant="contained"
                      onClick={() => router.push('/auth/register')}
                      sx={{ bgcolor: '#111111', '&:hover': { bgcolor: '#000000' } }}
                    >
                      Submit a Project
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            )}

            {projectsLoading && (
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                  Loading featured projects...
                </Typography>
              </Grid>
            )}
          </Grid>
        </Container>
      </Box>

      {/* ── Testimonials ── */}
      <Box sx={{ py: { xs: 8, md: 10 }, bgcolor: '#f2f3f5' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 4.5 }}>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                mb: 1,
                fontSize: { xs: '1.9rem', md: '2.3rem' },
                fontFamily: displayFont,
                color: '#1f2937',
              }}
            >
              Our client Feedback
            </Typography>
            <Typography variant="body2" sx={{ color: '#6b7280', maxWidth: 640, mx: 'auto' }}>
              Through direct reviews, founders and investors shared how StartupSri improved funding operations and transparency.
            </Typography>
          </Box>
          <Grid container spacing={2}>
            {feedbackLoading && (
              <Grid item xs={12}>
                <Typography variant="body2" sx={{ color: '#6b7280', textAlign: 'center' }}>
                  Loading feedback...
                </Typography>
              </Grid>
            )}

            {!feedbackLoading && feedbackError && (
              <Grid item xs={12}>
                <Typography variant="body2" sx={{ color: '#6b7280', textAlign: 'center' }}>
                  {feedbackError}
                </Typography>
              </Grid>
            )}

            {!feedbackLoading && !feedbackError && feedbackItems.length === 0 && (
              <Grid item xs={12}>
                <Typography variant="body2" sx={{ color: '#6b7280', textAlign: 'center' }}>
                  No feedback available yet
                </Typography>
              </Grid>
            )}

            {!feedbackLoading && !feedbackError && feedbackItems.map((t) => (
              <Grid item xs={12} sm={6} md={4} key={t.id}>
                <Card
                  sx={{
                    height: '100%',
                    border: '1px solid #e5e7eb',
                    borderRadius: 2,
                    background: '#ffffff',
                    transition: 'all 0.25s',
                    '&:hover': { boxShadow: '0 8px 18px rgba(15,23,42,0.08)', transform: 'translateY(-2px)' },
                  }}
                >
                  <CardContent sx={{ p: 2.2 }}>
                    <Typography variant="body2" sx={{ color: '#374151', lineHeight: 1.6, minHeight: 90 }}>
                      {t.quote}
                    </Typography>
                    <Divider sx={{ my: 1.5, borderColor: '#e5e7eb' }} />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                      <Avatar sx={{ bgcolor: t.color, fontWeight: 700, width: 34, height: 34, fontSize: '0.88rem' }}>{t.avatar}</Avatar>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.86rem', lineHeight: 1.2 }}>{t.name}</Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
          <Box sx={{ textAlign: 'center', mt: 4.5 }}>
            <Typography sx={{ fontSize: '0.86rem', color: '#374151', fontWeight: 600 }}>Compliance And Security</Typography>
            <Typography sx={{ fontSize: '0.72rem', color: '#9ca3af', mt: 0.3 }}>
              Startup policy compliance and KYC standards are built into every workflow.
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* ── FAQ ── */}
      <Box sx={{ bgcolor: '#f4f5fb', py: { xs: 8, md: 12 } }}>
        <Container maxWidth="md">
          <Box sx={{ textAlign: 'center', mb: 7 }}>
            <Chip label="FAQ" variant="outlined" sx={{ mb: 2, fontWeight: 700, bgcolor: '#ece9ff', borderColor: '#cfc9ff', color: '#4b3fbd' }} />
            <Typography variant="h3" sx={{ fontWeight: 700, mb: 2, fontSize: { xs: '2rem', md: '2.5rem' }, fontFamily: displayFont, color: '#1f2343' }}>
              Frequently Asked Questions
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 560, mx: 'auto' }}>
              Find answers to common questions about our platform, funding process, and investors.
            </Typography>
          </Box>
          <Stack spacing={1.5}>
            {faqs.map((faq, i) => (
              <Accordion
                key={i}
                sx={{
                  border: '1px solid', borderColor: '#dfe3f3',
                  borderRadius: '12px !important',
                  '&:before': { display: 'none' },
                  boxShadow: 'none',
                  '&.Mui-expanded': { boxShadow: '0 10px 24px rgba(53,58,120,0.14)' },
                }}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ px: 3, py: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{faq.q}</Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ px: 3, pb: 2.5 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>{faq.a}</Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </Stack>
          <Box sx={{ textAlign: 'center', mt: 6 }}>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>Still have questions?</Typography>
            <Button
              variant="contained" size="large"
              onClick={() => router.push('/auth/register')}
              sx={{
                px: 4,
                py: 1.5,
                fontWeight: 700,
                borderRadius: 2,
                textTransform: 'none',
                bgcolor: '#111111',
                boxShadow: '0 10px 24px rgba(0,0,0,0.3)',
                '&:hover': { bgcolor: '#000000' },
              }}
            >
              Contact Support
            </Button>
          </Box>
        </Container>
      </Box>

      {/* ── Newsletter / CTA ── */}
      <Box
        sx={{
          py: { xs: 8, md: 12 },
          background: 'linear-gradient(120deg, #17192d 0%, #2b2a5c 62%, #5847bd 100%)',
          color: 'white',
        }}
      >
        <Container maxWidth="md" sx={{ textAlign: 'center' }}>
          <Chip
            label="Get Started"
            sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: 'white', mb: 3, fontWeight: 600, border: '1px solid rgba(255,255,255,0.3)' }}
          />
          <Typography variant="h3" sx={{ fontWeight: 700, mb: 2, fontSize: { xs: '2rem', md: '2.8rem' } }}>
            Ready to Take the Next Step?
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.82, mb: 5, fontWeight: 400, lineHeight: 1.7 }}>
            Join thousands of entrepreneurs and investors making an impact on Sri Lanka's digital economy. Register free today.
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} justifyContent="center" sx={{ maxWidth: 520, mx: 'auto' }}>
            <TextField
              placeholder="Enter your email"
              size="medium"
              sx={{
                flexGrow: 1,
                '& .MuiOutlinedInput-root': {
                  bgcolor: 'rgba(255,255,255,0.12)', borderRadius: 2, color: 'white',
                  '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                  '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.6)' },
                  '& input::placeholder': { color: 'rgba(255,255,255,0.6)' },
                },
              }}
            />
            <Button
              variant="contained" size="large"
              onClick={() => router.push('/auth/register')}
              sx={{
                px: 4, py: 1.5, fontWeight: 700, borderRadius: 2, textTransform: 'none',
                bgcolor: '#111111', '&:hover': { bgcolor: '#000000', transform: 'translateY(-2px)' },
                transition: 'all 0.2s', whiteSpace: 'nowrap',
              }}
            >
              Sign Up Free →
            </Button>
          </Stack>
        </Container>
      </Box>

      {/* ── Contact ── */}
      <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: '#fff' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 7 }}>
            <Chip label="Contact Us" variant="outlined" sx={{ mb: 2, fontWeight: 700, bgcolor: '#ece9ff', borderColor: '#cfc9ff', color: '#4b3fbd' }} />
            <Typography variant="h3" sx={{ fontWeight: 700, mb: 1.5, fontSize: { xs: '2rem', md: '2.5rem' }, fontFamily: displayFont, color: '#1f2343' }}>Get In Touch</Typography>
            <Typography variant="body1" color="text.secondary">Have questions or want to connect with our team? Reach out to us.</Typography>
          </Box>
          <Grid container spacing={5} alignItems="flex-start">
            <Grid item xs={12} md={5}>
              <Stack spacing={4}>
                {[
                  { icon: <EmailIcon color="primary" />, label: 'Email', val: 'hello@startupsri.lk' },
                  { icon: <PhoneIcon color="primary" />, label: 'Phone', val: '+94 77 000 0000' },
                  { icon: <LocationOnIcon color="primary" />, label: 'Address', val: 'Colombo 03, Sri Lanka' },
                ].map((c) => (
                  <Box key={c.label} sx={{ display: 'flex', gap: 2.5, alignItems: 'flex-start' }}>
                    <Box
                      sx={{
                        width: 48, height: 48, borderRadius: 2,
                        background: 'linear-gradient(135deg, #ede9ff, #d9ecff)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      }}
                    >
                      {c.icon}
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{c.label}</Typography>
                      <Typography variant="body2" color="text.secondary">{c.val}</Typography>
                    </Box>
                  </Box>
                ))}
              </Stack>
            </Grid>
            <Grid item xs={12} md={7}>
              <Card sx={{ p: 1, border: '1px solid', borderColor: '#e4e7f5', borderRadius: 4, boxShadow: '0 18px 36px rgba(53,58,120,0.12)' }}>
                <CardContent sx={{ p: 3 }}>
                  <Grid container spacing={2.5}>
                    <Grid item xs={12} sm={6}>
                      <TextField fullWidth label="Your Name" variant="outlined" />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField fullWidth label="Email Address" variant="outlined" type="email" />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField fullWidth label="Subject" variant="outlined" />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField fullWidth label="Message" variant="outlined" multiline rows={4} />
                    </Grid>
                    <Grid item xs={12}>
                      <Button
                        variant="contained" size="large" fullWidth
                        sx={{
                          py: 1.5,
                          fontWeight: 700,
                          borderRadius: 2,
                          textTransform: 'none',
                          bgcolor: '#111111',
                          boxShadow: '0 10px 24px rgba(0,0,0,0.3)',
                          '&:hover': { bgcolor: '#000000' },
                        }}
                      >
                        Send Message
                      </Button>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

    </Layout>
  )
}
