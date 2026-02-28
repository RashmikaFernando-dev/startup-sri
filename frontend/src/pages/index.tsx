import Head from 'next/head'
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Avatar,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  LinearProgress,
  TextField,
  Divider,
  Stack,
  IconButton,
  Paper,
} from '@mui/material'
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
import FormatQuoteIcon from '@mui/icons-material/FormatQuote'
import EmailIcon from '@mui/icons-material/Email'
import PhoneIcon from '@mui/icons-material/Phone'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import LinkedInIcon from '@mui/icons-material/LinkedIn'
import TwitterIcon from '@mui/icons-material/Twitter'
import FacebookIcon from '@mui/icons-material/Facebook'
import InstagramIcon from '@mui/icons-material/Instagram'

// ─── Data ────────────────────────────────────────────────────────────────────

const stats = [
  { value: 'LKR 45M+', label: 'Total Funded' },
  { value: '120+', label: 'Startups Funded' },
  { value: '800+', label: 'Active Investors' },
  { value: '94%', label: 'Success Rate' },
]

const features = [
  {
    icon: <AccountCircleIcon sx={{ fontSize: 36, color: 'primary.main' }} />,
    title: 'Startup Profiles',
    desc: 'Create rich, verified entrepreneur profiles that highlight your skills, project details, and track record to attract funding.',
  },
  {
    icon: <TrendingUpIcon sx={{ fontSize: 36, color: 'primary.main' }} />,
    title: 'Investor Matching',
    desc: 'Our platform surfaces your project to investors who are most likely to fund ventures in your category and stage.',
  },
  {
    icon: <BarChartIcon sx={{ fontSize: 36, color: 'primary.main' }} />,
    title: 'Funding Analytics',
    desc: 'Track funding progress, investor engagement, and milestone completion with real-time dashboard analytics.',
  },
  {
    icon: <PublicIcon sx={{ fontSize: 36, color: 'primary.main' }} />,
    title: 'Global Network',
    desc: 'Connect with a worldwide network of investors, including Sri Lankan diaspora ready to back local innovation.',
  },
  {
    icon: <VerifiedUserIcon sx={{ fontSize: 36, color: 'primary.main' }} />,
    title: 'Due Diligence Tools',
    desc: 'Multi-layer KYC, NIC verification, and document checks ensure every entrepreneur and project is credible.',
  },
  {
    icon: <AccountBalanceWalletIcon sx={{ fontSize: 36, color: 'primary.main' }} />,
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

const featuredStartups = [
  {
    name: 'EduTech LK',
    category: 'EdTech · SaaS',
    raised: 1800000,
    target: 2000000,
    equity: '8%',
    daysLeft: 14,
    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80',
    founder: 'Ravindu P.',
    status: 'Active',
  },
  {
    name: 'HealthConnect SL',
    category: 'HealthTech · Mobile',
    raised: 3200000,
    target: 4000000,
    equity: '10%',
    daysLeft: 21,
    image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800&q=80',
    founder: 'Amara S.',
    status: 'Active',
  },
  {
    name: 'AgriAI Sri Lanka',
    category: 'AgriTech · AI',
    raised: 900000,
    target: 1500000,
    equity: '12%',
    daysLeft: 30,
    image: 'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?auto=format&fit=crop&w=800&q=80',
    founder: 'Dinesh K.',
    status: 'Active',
  },
]

const testimonials = [
  {
    quote: 'StartupSri helped us connect with the perfect investors. We secured our seed round in full in just 6 weeks.',
    name: 'Sarah Johnson',
    title: 'CEO, TechNova',
    avatar: 'S',
    color: '#1976d2',
  },
  {
    quote: "As a diaspora investor, I couldn't find a trusted platform for Sri Lankan startups. StartupSri changed all that with full transparency.",
    name: 'Kamal Perera',
    title: 'Investor, London',
    avatar: 'K',
    color: '#ff9800',
  },
  {
    quote: "We're building our credit history while growing the business. The repayment dashboard keeps everything on track.",
    name: 'Nimal Dias',
    title: 'Founder, BuildFlow',
    avatar: 'N',
    color: '#4caf50',
  },
]

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

// ─── Component ───────────────────────────────────────────────────────────────

export default function Home() {
  const router = useRouter()

  return (
    <Layout>
      <Head>
        <title>StartupSri – Funding Platform for Tech Entrepreneurs</title>
        <meta name="description" content="Sri Lanka's first microloan and equity crowdfunding platform for tech entrepreneurs" />
      </Head>

      {/* ── Hero ── */}
      <Box
        sx={{
          position: 'relative',
          minHeight: { xs: '560px', md: '680px' },
          display: 'flex',
          alignItems: 'center',
          backgroundImage:
            'linear-gradient(135deg, rgba(10,25,60,0.92) 0%, rgba(21,65,132,0.85) 60%, rgba(0,0,0,0.75) 100%), url(https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=2000&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
          color: 'white',
          overflow: 'hidden',
        }}
      >
        {/* decorative blobs */}
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

        <Container maxWidth="lg" sx={{ py: { xs: 10, md: 14 }, position: 'relative', zIndex: 1 }}>
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
              fontSize: { xs: '2.4rem', sm: '3.2rem', md: '4rem', lg: '4.6rem' },
              mb: 3, lineHeight: 1.1, letterSpacing: '-0.02em', maxWidth: 800,
            }}
          >
            Connecting Visionary<br />
            <Box component="span" sx={{ color: '#ffb74d' }}>Startups</Box>{' '}
            with Strategic<br />Investors
          </Typography>
          <Typography
            variant="h6"
            sx={{ maxWidth: 640, mb: 5, opacity: 0.88, fontWeight: 400, fontSize: { xs: '1rem', md: '1.15rem' }, lineHeight: 1.7 }}
          >
            StartupSri provides tech entrepreneurs a transparent, verified path to raise
            microloans and equity funding — while giving investors a trusted gateway to back
            Sri Lanka's next big idea.
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 6 }}>
            <Button
              variant="contained" size="large"
              onClick={() => router.push('/register')}
              endIcon={<ArrowForwardIcon />}
              sx={{
                px: 4, py: 1.7, fontSize: '1rem', fontWeight: 700, borderRadius: 2, textTransform: 'none',
                bgcolor: '#1976d2', boxShadow: '0 8px 24px rgba(25,118,210,0.45)',
                '&:hover': { bgcolor: '#1565c0', transform: 'translateY(-2px)', boxShadow: '0 12px 28px rgba(25,118,210,0.5)' },
                transition: 'all 0.2s',
              }}
            >
              Apply for Funding
            </Button>
            <Button
              variant="outlined" size="large"
              onClick={() => router.push('/register?type=investor')}
              sx={{
                px: 4, py: 1.7, fontSize: '1rem', fontWeight: 700, borderRadius: 2, textTransform: 'none',
                color: 'white', borderColor: 'rgba(255,255,255,0.6)',
                '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)', transform: 'translateY(-2px)' },
                transition: 'all 0.2s',
              }}
            >
              Become an Investor
            </Button>
          </Stack>
          <Stack direction="row" spacing={3} sx={{ opacity: 0.75 }} flexWrap="wrap" useFlexGap>
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
      <Box sx={{ bgcolor: 'primary.main', py: { xs: 4, md: 5 } }}>
        <Container maxWidth="lg">
          <Grid container spacing={2} justifyContent="center">
            {stats.map((s) => (
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
      <Box id="features" sx={{ py: { xs: 8, md: 12 }, bgcolor: '#fafafa' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Chip label="Features" color="primary" variant="outlined" sx={{ mb: 2, fontWeight: 600 }} />
            <Typography variant="h3" sx={{ fontWeight: 700, mb: 2, fontSize: { xs: '2rem', md: '2.5rem' } }}>
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
                    height: '100%', p: 1, border: '1px solid', borderColor: 'grey.100',
                    transition: 'all 0.25s',
                    '&:hover': { transform: 'translateY(-6px)', boxShadow: '0 16px 40px rgba(25,118,210,0.12)', borderColor: 'primary.light' },
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box
                      sx={{
                        width: 60, height: 60, borderRadius: 2,
                        background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
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
      <Box id="how-it-works" sx={{ py: { xs: 8, md: 12 } }}>
        <Container maxWidth="lg">
          <Grid container spacing={8} alignItems="center">
            <Grid item xs={12} md={6}>
              <Chip label="Process" color="primary" variant="outlined" sx={{ mb: 2, fontWeight: 600 }} />
              <Typography variant="h3" sx={{ fontWeight: 700, mb: 2, fontSize: { xs: '2rem', md: '2.5rem' } }}>
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
                        bgcolor: i < 2 ? 'primary.main' : 'grey.200',
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
                onClick={() => router.push('/register')}
                endIcon={<ArrowForwardIcon />}
                sx={{ mt: 5, px: 4, py: 1.5, fontWeight: 700, borderRadius: 2, textTransform: 'none', boxShadow: '0 6px 20px rgba(25,118,210,0.35)' }}
              >
                Get Started Free
              </Button>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  position: 'relative', borderRadius: 4, overflow: 'hidden',
                  boxShadow: '0 24px 64px rgba(0,0,0,0.15)',
                  '&:hover img': { transform: 'scale(1.03)' },
                }}
              >
                <Box
                  component="img"
                  src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=900&q=80"
                  alt="How it works"
                  sx={{ width: '100%', height: 480, objectFit: 'cover', display: 'block', transition: 'transform 0.4s ease' }}
                />
                <Paper
                  elevation={8}
                  sx={{
                    position: 'absolute', bottom: 24, left: 24, right: 24, p: 2.5, borderRadius: 3,
                    background: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(12px)',
                    display: 'flex', gap: 2, alignItems: 'center',
                  }}
                >
                  <Avatar sx={{ bgcolor: 'success.main', width: 44, height: 44 }}>
                    <CheckCircleIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>HealthConnect SL just reached funding target</Typography>
                    <Typography variant="caption" color="text.secondary">LKR 4,000,000 raised · 2 mins ago</Typography>
                  </Box>
                </Paper>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ── Featured Startups ── */}
      <Box id="opportunities" sx={{ bgcolor: '#fafafa', py: { xs: 8, md: 12 } }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, mb: 6, flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
            <Box>
              <Chip label="Opportunities" color="primary" variant="outlined" sx={{ mb: 1.5, fontWeight: 600 }} />
              <Typography variant="h3" sx={{ fontWeight: 700, fontSize: { xs: '2rem', md: '2.5rem' } }}>Featured Startups</Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>Meet your next investment opportunity</Typography>
            </Box>
            <Button
              variant="outlined" size="large" endIcon={<ArrowForwardIcon />}
              onClick={() => router.push('/user/projects')}
              sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2, px: 3, flexShrink: 0 }}
            >
              Discover More
            </Button>
          </Box>
          <Grid container spacing={3}>
            {featuredStartups.map((s) => {
              const pct = Math.round((s.raised / s.target) * 100)
              return (
                <Grid item xs={12} md={4} key={s.name}>
                  <Card
                    sx={{
                      height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden',
                      transition: 'all 0.25s',
                      '&:hover': { transform: 'translateY(-6px)', boxShadow: '0 20px 45px rgba(0,0,0,0.12)' },
                    }}
                  >
                    <Box sx={{ position: 'relative' }}>
                      <Box
                        component="img" src={s.image} alt={s.name}
                        sx={{ width: '100%', height: 200, objectFit: 'cover', display: 'block' }}
                      />
                      <Chip
                        label={s.status} size="small"
                        sx={{ position: 'absolute', top: 12, right: 12, bgcolor: 'success.main', color: 'white', fontWeight: 700, fontSize: '0.7rem' }}
                      />
                    </Box>
                    <CardContent sx={{ flexGrow: 1, p: 3 }}>
                      <Chip label={s.category} size="small" variant="outlined" color="primary" sx={{ mb: 1.5, fontWeight: 600 }} />
                      <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>{s.name}</Typography>
                      <Typography variant="caption" color="text.secondary">by {s.founder}</Typography>
                      <Box sx={{ mt: 2.5, mb: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.8 }}>
                          <Typography variant="body2" color="text.secondary">
                            Raised: <strong>LKR {(s.raised / 1000000).toFixed(1)}M</strong>
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main' }}>{pct}%</Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate" value={pct}
                          sx={{ height: 7, borderRadius: 4, bgcolor: 'grey.200', '& .MuiLinearProgress-bar': { borderRadius: 4 } }}
                        />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.8 }}>
                          <Typography variant="caption" color="text.secondary">Target: LKR {(s.target / 1000000).toFixed(1)}M</Typography>
                          <Typography variant="caption" color="text.secondary">{s.daysLeft} days left</Typography>
                        </Box>
                      </Box>
                      <Divider sx={{ my: 2 }} />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" color="text.secondary">Equity: <strong>{s.equity}</strong></Typography>
                        <Button
                          variant="contained" size="small"
                          onClick={() => router.push('/user/projects')}
                          sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 1.5 }}
                        >
                          Learn More
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              )
            })}
          </Grid>
        </Container>
      </Box>

      {/* ── Testimonials ── */}
      <Box sx={{ py: { xs: 8, md: 12 } }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 7 }}>
            <Chip label="Success Stories" color="primary" variant="outlined" sx={{ mb: 2, fontWeight: 600 }} />
            <Typography variant="h3" sx={{ fontWeight: 700, mb: 2, fontSize: { xs: '2rem', md: '2.5rem' } }}>
              Hear From Our Community
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 560, mx: 'auto' }}>
              Founders and investors share their experiences with StartupSri.
            </Typography>
          </Box>
          <Grid container spacing={3}>
            {testimonials.map((t) => (
              <Grid item xs={12} md={4} key={t.name}>
                <Card
                  sx={{
                    height: '100%', p: 1, border: '1px solid', borderColor: 'grey.100',
                    transition: 'all 0.25s',
                    '&:hover': { boxShadow: '0 12px 36px rgba(0,0,0,0.1)', transform: 'translateY(-4px)' },
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <FormatQuoteIcon sx={{ fontSize: 36, color: 'primary.light', mb: 1.5 }} />
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 3, lineHeight: 1.8, fontStyle: 'italic' }}>
                      "{t.quote}"
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: t.color, fontWeight: 700 }}>{t.avatar}</Avatar>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{t.name}</Typography>
                        <Typography variant="caption" color="text.secondary">{t.title}</Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ── FAQ ── */}
      <Box sx={{ bgcolor: '#fafafa', py: { xs: 8, md: 12 } }}>
        <Container maxWidth="md">
          <Box sx={{ textAlign: 'center', mb: 7 }}>
            <Chip label="FAQ" color="primary" variant="outlined" sx={{ mb: 2, fontWeight: 600 }} />
            <Typography variant="h3" sx={{ fontWeight: 700, mb: 2, fontSize: { xs: '2rem', md: '2.5rem' } }}>
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
                  border: '1px solid', borderColor: 'grey.200',
                  borderRadius: '12px !important',
                  '&:before': { display: 'none' },
                  boxShadow: 'none',
                  '&.Mui-expanded': { boxShadow: '0 4px 20px rgba(25,118,210,0.1)' },
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
              onClick={() => router.push('/register')}
              sx={{ px: 4, py: 1.5, fontWeight: 700, borderRadius: 2, textTransform: 'none', boxShadow: '0 6px 20px rgba(25,118,210,0.3)' }}
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
          background: 'linear-gradient(135deg, #0a1940 0%, #1565c0 100%)',
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
              onClick={() => router.push('/register')}
              sx={{
                px: 4, py: 1.5, fontWeight: 700, borderRadius: 2, textTransform: 'none',
                bgcolor: '#ff9800', '&:hover': { bgcolor: '#f57c00', transform: 'translateY(-2px)' },
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
            <Chip label="Contact Us" color="primary" variant="outlined" sx={{ mb: 2, fontWeight: 600 }} />
            <Typography variant="h3" sx={{ fontWeight: 700, mb: 1.5, fontSize: { xs: '2rem', md: '2.5rem' } }}>Get In Touch</Typography>
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
                        background: 'linear-gradient(135deg, #e3f2fd, #bbdefb)',
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
              <Card sx={{ p: 1, border: '1px solid', borderColor: 'grey.100' }}>
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
                        sx={{ py: 1.5, fontWeight: 700, borderRadius: 2, textTransform: 'none', boxShadow: '0 6px 20px rgba(25,118,210,0.3)' }}
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

      {/* ── Footer ── */}
      <Box sx={{ bgcolor: '#0a1940', color: 'rgba(255,255,255,0.8)', pt: { xs: 6, md: 8 }, pb: 4 }}>
        <Container maxWidth="lg">
          <Grid container spacing={5} sx={{ mb: 5 }}>
            <Grid item xs={12} md={4}>
              <Typography variant="h5" sx={{ fontWeight: 800, color: 'white', mb: 1.5 }}>StartupSri</Typography>
              <Typography variant="body2" sx={{ lineHeight: 1.8, mb: 3, opacity: 0.75 }}>
                Sri Lanka's first dedicated microloan and equity crowdfunding platform for
                technology-focused startups. Empowering innovation, one fund at a time.
              </Typography>
              <Stack direction="row" spacing={1}>
                {[<LinkedInIcon />, <TwitterIcon />, <FacebookIcon />, <InstagramIcon />].map((ic, i) => (
                  <IconButton
                    key={i} size="small"
                    sx={{
                      color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 1.5,
                      '&:hover': { color: 'white', borderColor: 'white', bgcolor: 'rgba(255,255,255,0.08)' },
                    }}
                  >
                    {ic}
                  </IconButton>
                ))}
              </Stack>
            </Grid>
            {[
              { heading: 'Platform', links: ['How It Works', 'Browse Projects', 'Investor Dashboard', 'Apply for Loan'] },
              { heading: 'Company', links: ['About Us', 'Blog', 'Careers', 'Press'] },
              { heading: 'Support', links: ['Help Centre', 'Privacy Policy', 'Terms of Service', 'Contact Us'] },
            ].map((col) => (
              <Grid item xs={6} sm={4} md={2.5} key={col.heading}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'white', mb: 2 }}>{col.heading}</Typography>
                <Stack spacing={1.2}>
                  {col.links.map((l) => (
                    <Typography
                      key={l} variant="body2"
                      sx={{ opacity: 0.65, cursor: 'pointer', transition: 'opacity 0.15s', '&:hover': { opacity: 1 } }}
                    >
                      {l}
                    </Typography>
                  ))}
                </Stack>
              </Grid>
            ))}
            <Grid item xs={12} md={3}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'white', mb: 2 }}>Stay Updated</Typography>
              <Typography variant="body2" sx={{ opacity: 0.65, mb: 2, lineHeight: 1.7 }}>
                Get the latest startup opportunities and platform news delivered to your inbox.
              </Typography>
              <Stack spacing={1}>
                <TextField
                  placeholder="Your email" size="small"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      bgcolor: 'rgba(255,255,255,0.08)', borderRadius: 1.5, color: 'white',
                      '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                      '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.4)' },
                      '& input::placeholder': { color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' },
                    },
                  }}
                />
                <Button
                  variant="contained"
                  sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 1.5, bgcolor: '#1976d2', '&:hover': { bgcolor: '#1565c0' } }}
                >
                  Subscribe →
                </Button>
              </Stack>
            </Grid>
          </Grid>
          <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', mb: 3 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
            <Typography variant="caption" sx={{ opacity: 0.5 }}>© 2026 StartupSri. All rights reserved.</Typography>
            <Typography variant="caption" sx={{ opacity: 0.5 }}>Built for Sri Lanka's Digital Economy · BSc (Hons) Software Engineering FYP</Typography>
          </Box>
        </Container>
      </Box>
    </Layout>
  )
}
