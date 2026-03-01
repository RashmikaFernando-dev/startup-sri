import { useState } from 'react'
import Head from 'next/head'
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Button,
  Chip,
  LinearProgress,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Avatar,
  Skeleton,
  Divider,
  Tab,
  Tabs,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import CloseIcon from '@mui/icons-material/Close'
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn'
import GroupIcon from '@mui/icons-material/Group'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import PieChartIcon from '@mui/icons-material/PieChart'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked'
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile'
import EmailIcon from '@mui/icons-material/Email'
import PhoneIcon from '@mui/icons-material/Phone'
import Layout from '@/components/layout/Layout'

interface Milestone {
  title: string
  description: string
  amount: number
  completed: boolean
}

interface InvestorEntry {
  user: string
  amount: number
  type: 'loan' | 'equity'
  date: string
}

interface ProjectData {
  id: string
  title: string
  description: string
  longDescription: string
  category: string
  fundingType: 'microloan' | 'equity'
  fundingGoal: number
  currentFunding: number
  interestRate?: number
  equityOffered?: number
  duration?: number
  status: 'pending' | 'approved' | 'rejected' | 'funded' | 'active' | 'completed'
  investors: InvestorEntry[]
  entrepreneur: { id: string; name: string; email: string; phone?: string }
  milestones: Milestone[]
  documents: { businessPlan?: string; financialProjections?: string; productDemo?: string }
  createdAt: string
  updatedAt: string
}

// ── constants ─────────────────────────────────────────────────────────────────
const CATEGORIES = ['All', 'Software', 'Hardware', 'SaaS', 'Mobile App', 'Web Platform', 'AI/ML', 'Other']
const FUNDING_TYPES = ['All', 'microloan', 'equity']
const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'goal_asc', label: 'Goal: Low to High' },
  { value: 'goal_desc', label: 'Goal: High to Low' },
  { value: 'progress', label: 'Most Funded' },
]

const CAT_COLOR: Record<string, string> = {
  Software: '#1565c0',
  Hardware: '#6a1b9a',
  SaaS: '#00838f',
  'Mobile App': '#2e7d32',
  'Web Platform': '#e65100',
  'AI/ML': '#ad1457',
  Other: '#37474f',
}

// ── mock data ─────────────────────────────────────────────────────────────────
const MOCK_PROJECTS: ProjectData[] = [
  {
    id: '1',
    title: 'NeuroLink Insights',
    description: 'Brainwave-powered productivity assistant for remote teams.',
    longDescription: `NeuroLink Insights is developing a next-gen productivity platform that uses non-invasive brainwave headbands to track focus and cognitive load in real-time. Integrated with popular tools like Slack, Notion, and Trello, it provides analytics and nudges to help remote workers optimise their work cycles and reduce burnout.\n\nWith a growing interest in neurotechnology, we're pioneering a new wave of work-life harmony. Our technology has been tested with 200 beta users across three countries, achieving a 38% improvement in focussed work sessions and a 22% reduction in self-reported burnout scores.\n\nWe plan to launch a B2B SaaS model in Q3 2026, targeting remote-first companies with 10–500 employees, followed by an enterprise tier in Q1 2027.`,
    category: 'AI/ML',
    fundingType: 'equity',
    fundingGoal: 810000,
    currentFunding: 0,
    equityOffered: 9,
    status: 'active',
    investors: [],
    entrepreneur: { id: 'e1', name: 'Amara Silva', email: 'amara@neurolink.lk', phone: '+94 77 123 4567' },
    milestones: [
      { title: 'Beta product complete', description: 'Hardware v2 + core analytics dashboard shipped to 200 beta users.', amount: 200000, completed: true },
      { title: 'Seed round close', description: 'Close LKR 810,000 equity round and onboard advisory board.', amount: 810000, completed: false },
      { title: 'B2B pilot with 5 companies', description: 'Sign 5 paying B2B customers at LKR 45,000/seat/month.', amount: 0, completed: false },
      { title: 'Series-A preparation', description: 'Reach LKR 2M ARR, prepare for Series-A fundraise.', amount: 0, completed: false },
    ],
    documents: { businessPlan: '/docs/neurolink-business-plan.pdf', financialProjections: '/docs/neurolink-financials.xlsx', productDemo: 'https://demo.neurolink.lk' },
    createdAt: '2026-01-10T00:00:00Z',
    updatedAt: '2026-02-28T00:00:00Z',
  },
  {
    id: '2',
    title: 'AgriConnect – Smart Farming Platform',
    description: 'IoT-based platform connecting Sri Lankan farmers with buyers and providing real-time crop monitoring, weather alerts, and soil analytics.',
    longDescription: `AgriConnect bridges the gap between Sri Lankan farmers and modern agricultural technology. Our IoT sensors are deployed across paddy fields, vegetable farms, and tea estates to collect real-time data on soil moisture, temperature, and crop health.\n\nFarmers receive actionable alerts via SMS and a mobile app, while buyers get transparent supply-chain visibility. We have already onboarded 120 farmers across the North Central and Uva provinces.\n\nThe microloan will fund hardware manufacturing scale-up and expand our buyer network to 50 registered agri-businesses.`,
    category: 'Software',
    fundingType: 'microloan',
    fundingGoal: 750000,
    currentFunding: 480000,
    interestRate: 12,
    duration: 18,
    status: 'active',
    investors: [
      { user: 'u1', amount: 200000, type: 'loan', date: '2026-01-01' },
      { user: 'u2', amount: 280000, type: 'loan', date: '2026-01-15' },
    ],
    entrepreneur: { id: 'e2', name: 'Kamal Perera', email: 'kamal@agriconnect.lk', phone: '+94 71 234 5678' },
    milestones: [
      { title: 'Sensor v1 deployed', description: '50 IoT sensors deployed across pilot farms.', amount: 150000, completed: true },
      { title: '120 farmers onboarded', description: 'Farmer app launch and onboarding completed.', amount: 100000, completed: true },
      { title: 'Buyer network launch', description: 'Connect 50 agri-businesses to the platform.', amount: 250000, completed: false },
      { title: 'National expansion', description: 'All 9 provinces covered.', amount: 250000, completed: false },
    ],
    documents: { businessPlan: '/docs/agriconnect-plan.pdf' },
    createdAt: '2025-11-01T00:00:00Z',
    updatedAt: '2026-01-20T00:00:00Z',
  },
  {
    id: '3',
    title: 'MediTrack – Patient Management SaaS',
    description: 'Cloud-based electronic health record and patient flow management system designed for small clinics in Sri Lanka.',
    longDescription: `MediTrack is a lightweight, affordable EHR and clinic management suite built specifically for Sri Lankan small clinics and general practitioners who cannot afford enterprise healthcare IT solutions.\n\nFeatures include digital patient records, appointment scheduling, prescription management, billing, and insurance claim tracking. Our monthly subscription starts at LKR 4,500/month—well below any competitor.\n\nEquity investors will benefit from a fast-growing SaaS business in the underserved healthcare IT segment. We are currently live in 12 clinics with a pipeline of 80+ signed LOIs.`,
    category: 'SaaS',
    fundingType: 'equity',
    fundingGoal: 1200000,
    currentFunding: 360000,
    equityOffered: 9,
    status: 'active',
    investors: [{ user: 'u3', amount: 360000, type: 'equity', date: '2026-01-10' }],
    entrepreneur: { id: 'e3', name: 'Nirmala Jayawardena', email: 'nirmala@meditrack.lk' },
    milestones: [
      { title: '12 live clinics', description: 'Pilot programme completed.', amount: 200000, completed: true },
      { title: '80 LOIs signed', description: 'Pre-sales pipeline secured.', amount: 160000, completed: true },
      { title: '100 clinics onboarded', description: 'Full commercial launch.', amount: 500000, completed: false },
      { title: 'Insurance API integration', description: 'Direct claims to major insurers.', amount: 340000, completed: false },
    ],
    documents: { businessPlan: '/docs/meditrack-plan.pdf', financialProjections: '/docs/meditrack-finance.xlsx' },
    createdAt: '2025-12-15T00:00:00Z',
    updatedAt: '2026-02-01T00:00:00Z',
  },
  {
    id: '4',
    title: 'EduLearn – AI Tutoring App',
    description: 'Adaptive AI-powered mobile tutoring app targeting O/L and A/L students with personalized lesson plans and progress tracking.',
    longDescription: `EduLearn uses machine learning to adapt lesson difficulty and pacing to each student's performance in real-time. We cover all core O/L and A/L subjects with over 10,000 practice questions, video explanations, and live tutor sessions.\n\nOur beta saw 3,200 registered students and an average exam score improvement of 24% over three months. The app is free at the basic tier, with a premium upgrade at LKR 1,200/month.\n\nThis project is fully funded and in active development, expanding content libraries and adding new languages.`,
    category: 'AI/ML',
    fundingType: 'microloan',
    fundingGoal: 500000,
    currentFunding: 500000,
    interestRate: 10,
    duration: 12,
    status: 'funded',
    investors: [
      { user: 'u4', amount: 300000, type: 'loan', date: '2025-12-01' },
      { user: 'u5', amount: 200000, type: 'loan', date: '2025-12-15' },
    ],
    entrepreneur: { id: 'e4', name: 'Dasun Rathnayake', email: 'dasun@edulearn.lk' },
    milestones: [
      { title: '10,000 questions live', description: 'Full O/L content library live.', amount: 150000, completed: true },
      { title: '3,200 beta users', description: 'Beta completed, 24% avg improvement.', amount: 200000, completed: true },
      { title: 'A/L content launch', description: 'Expand to A/L subjects.', amount: 150000, completed: false },
    ],
    documents: { productDemo: 'https://demo.edulearn.lk' },
    createdAt: '2025-10-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: '5',
    title: 'LogiFlow – Last-Mile Delivery',
    description: 'Mobile-first platform optimising last-mile delivery routing for SME couriers using machine learning and live traffic data.',
    longDescription: `LogiFlow reduces last-mile delivery costs for small courier companies by up to 35% through AI-driven route optimisation, real-time traffic integration, and digital proof-of-delivery.\n\nWe currently process 1,200 deliveries per day across Colombo and the Western Province with three paying courier partners. Our equity round will fund expansion to five additional cities and a fleet management module.\n\nThe logistics market in Sri Lanka is an LKR 47B industry with negligible digital penetration—LogiFlow is positioned to be the category-defining platform.`,
    category: 'Mobile App',
    fundingType: 'equity',
    fundingGoal: 2000000,
    currentFunding: 600000,
    equityOffered: 14,
    status: 'active',
    investors: [{ user: 'u6', amount: 600000, type: 'equity', date: '2026-02-01' }],
    entrepreneur: { id: 'e5', name: 'Sahan Fernando', email: 'sahan@logiflow.lk', phone: '+94 76 567 8901' },
    milestones: [
      { title: '3 courier partners live', description: 'First commercial contracts signed.', amount: 300000, completed: true },
      { title: '1,200 daily deliveries', description: 'Operational scale-up in Western Province.', amount: 300000, completed: true },
      { title: '5-city expansion', description: 'Kandy, Galle, Kurunegala, Anuradhapura, Jaffna.', amount: 800000, completed: false },
      { title: 'Fleet management module', description: 'Vehicle tracking + maintenance scheduling.', amount: 600000, completed: false },
    ],
    documents: { businessPlan: '/docs/logiflow-plan.pdf', financialProjections: '/docs/logiflow-finance.xlsx' },
    createdAt: '2026-01-05T00:00:00Z',
    updatedAt: '2026-02-10T00:00:00Z',
  },
  {
    id: '6',
    title: 'SolarSense – IoT Energy Monitor',
    description: 'Hardware + software solution for monitoring and optimising household solar panel performance with predictive maintenance alerts.',
    longDescription: `SolarSense makes household solar investments smarter. Our plug-and-play monitoring device collects panel-level performance data and sends it to a mobile dashboard where homeowners can see real-time output, historical trends, and predictive maintenance alerts before costly failures occur.\n\nWith over 280,000 residential solar installations in Sri Lanka and growing, the addressable market is enormous. We have sold 450 units in private beta with a 4.8/5 satisfaction rating.\n\nEquity investors will participate in hardware margins, a recurring SaaS subscription, and a professional maintenance service we plan to launch in 2027.`,
    category: 'Hardware',
    fundingType: 'equity',
    fundingGoal: 3000000,
    currentFunding: 900000,
    equityOffered: 7,
    status: 'active',
    investors: [{ user: 'u8', amount: 900000, type: 'equity', date: '2026-01-20' }],
    entrepreneur: { id: 'e6', name: 'Chamara Bandara', email: 'chamara@solarsense.lk', phone: '+94 70 890 1234' },
    milestones: [
      { title: '450 beta units sold', description: 'Private beta completed.', amount: 500000, completed: true },
      { title: 'Retail partnership', description: 'Distribution agreement with Dialog + Singer.', amount: 400000, completed: false },
      { title: '5,000 units sold', description: 'Full commercial launch.', amount: 1200000, completed: false },
      { title: 'Maintenance service launch', description: 'Professional solar servicing network.', amount: 900000, completed: false },
    ],
    documents: { businessPlan: '/docs/solarsense-plan.pdf', productDemo: 'https://demo.solarsense.lk' },
    createdAt: '2025-11-20T00:00:00Z',
    updatedAt: '2026-02-15T00:00:00Z',
  },
]

// ── helpers ───────────────────────────────────────────────────────────────────
function fmtLKR(n: number) {
  if (n >= 1000000) return `LKR ${(n / 1000000).toFixed(1)}M`
  if (n >= 1000) return `LKR ${(n / 1000).toFixed(0)}K`
  return `LKR ${n}`
}
function pct(current: number, goal: number) {
  return Math.min(Math.round((current / goal) * 100), 100)
}
function daysLeft(createdAt: string, duration = 90) {
  const end = new Date(createdAt).getTime() + duration * 24 * 60 * 60 * 1000
  return Math.max(0, Math.ceil((end - Date.now()) / (1000 * 60 * 60 * 24)))
}

// ── TabPanel ──────────────────────────────────────────────────────────────────
function TabPanel({ children, index, value }: { children?: React.ReactNode; index: number; value: number }) {
  return (
    <Box role="tabpanel" hidden={value !== index} sx={{ pt: 3 }}>
      {value === index && children}
    </Box>
  )
}

// ── FundModal ─────────────────────────────────────────────────────────────────
function FundModal({ open, onClose, project }: { open: boolean; onClose: () => void; project: ProjectData }) {
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleFund = async () => {
    const val = parseFloat(amount)
    if (!amount || isNaN(val) || val < 1000) { setError('Minimum investment is LKR 1,000.'); return }
    setError(''); setLoading(true)
    await new Promise((r) => setTimeout(r, 1400)) // TODO: Stripe payment intent
    setLoading(false); setSuccess(true)
  }

  const handleClose = () => {
    setAmount(''); setSuccess(false); setError(''); setLoading(false); onClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth
      PaperProps={{ sx: { borderRadius: 3, p: 0.5, boxShadow: '0 24px 64px rgba(0,0,0,0.18)' } }}>
      <DialogTitle sx={{ fontWeight: 800, fontSize: '1.2rem', pb: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#0a1940' }}>
        Fund this Startup
        <IconButton size="small" onClick={handleClose}><CloseIcon fontSize="small" /></IconButton>
      </DialogTitle>
      <DialogContent sx={{ pt: 0 }}>
        {success ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CheckCircleIcon sx={{ fontSize: 56, color: '#2e7d32', mb: 2 }} />
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#0a1940', mb: 1 }}>Investment submitted!</Typography>
            <Typography variant="body2" color="text.secondary">
              Your investment of <strong>LKR {parseFloat(amount).toLocaleString()}</strong> in <em>{project.title}</em> has been received.
            </Typography>
          </Box>
        ) : (
          <>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#f8faff', border: '1px solid', borderColor: 'grey.200', borderRadius: 2, px: 2.5, py: 1.75, mb: 2 }}>
              <Typography variant="body2" color="text.secondary">Wallet Balance:</Typography>
              <Typography variant="body1" sx={{ fontWeight: 700, color: '#0a1940' }}>1.6291 ETH</Typography>
            </Box>
            {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}
            <TextField fullWidth placeholder="Amount in LKR (e.g., 50000)" value={amount} onChange={(e) => setAmount(e.target.value)}
              type="number" inputProps={{ min: 1000 }}
              sx={{ mb: 1, '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: '#fafafa' } }} />
            <Typography variant="caption" color="text.secondary">
              Minimum investment: <strong>LKR 1,000</strong> · Goal: <strong>{fmtLKR(project.fundingGoal)}</strong>
            </Typography>
          </>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3, pt: 0 }}>
        {success ? (
          <Button fullWidth variant="outlined" onClick={handleClose} sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}>Close</Button>
        ) : (
          <Button fullWidth variant="contained" size="large" disabled={loading} onClick={handleFund}
            sx={{ borderRadius: 2, fontWeight: 700, textTransform: 'none', bgcolor: '#0a1940', py: 1.5, boxShadow: 'none', '&:hover': { bgcolor: '#1565c0', boxShadow: '0 4px 16px rgba(21,101,192,0.35)' } }}>
            {loading ? 'Processing…' : 'Fund Now'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function UserProjectsPage() {
  // list state
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [fundingType, setFundingType] = useState('All')
  const [sort, setSort] = useState('newest')

  // detail state
  const [selected, setSelected] = useState<ProjectData | null>(null)
  const [tab, setTab] = useState(0)
  const [fundOpen, setFundOpen] = useState(false)

  const openDetail = (p: ProjectData) => { setSelected(p); setTab(0); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  const closeDetail = () => { setSelected(null); setFundOpen(false) }

  // filtered list
  const filtered = MOCK_PROJECTS
    .filter((p) => {
      const ms = search.toLowerCase()
      return (
        (p.title.toLowerCase().includes(ms) || p.description.toLowerCase().includes(ms)) &&
        (category === 'All' || p.category === category) &&
        (fundingType === 'All' || p.fundingType === fundingType)
      )
    })
    .sort((a, b) => {
      if (sort === 'goal_asc') return a.fundingGoal - b.fundingGoal
      if (sort === 'goal_desc') return b.fundingGoal - a.fundingGoal
      if (sort === 'progress') return pct(b.currentFunding, b.fundingGoal) - pct(a.currentFunding, a.fundingGoal)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

  // ── DETAIL VIEW ────────────────────────────────────────────────────────────
  if (selected) {
    const p = selected
    const prog = pct(p.currentFunding, p.fundingGoal)
    const days = daysLeft(p.createdAt, p.duration || 90)
    const cc = CAT_COLOR[p.category] || '#37474f'

    return (
      <Layout>
        <Head>
          <title>{p.title} – StartupSri</title>
          <meta name="description" content={p.description} />
        </Head>
        <FundModal open={fundOpen} onClose={() => setFundOpen(false)} project={p} />

        <Box sx={{ maxWidth: 1100, mx: 'auto', px: { xs: 2, md: 4 }, py: 4 }}>
          {/* Back */}
          <Button startIcon={<ArrowBackIcon />} onClick={closeDetail}
            sx={{ mb: 3, color: 'text.secondary', textTransform: 'none', fontWeight: 600, '&:hover': { color: 'primary.main', bgcolor: 'transparent' } }}>
            Back to Projects
          </Button>

          <Grid container spacing={4}>
            {/* LEFT */}
            <Grid item xs={12} md={7}>
              {/* Header card */}
              <Card elevation={0} sx={{ border: '1px solid', borderColor: 'grey.200', borderRadius: 3, mb: 3, overflow: 'hidden' }}>
                <Box sx={{ height: 6, background: `linear-gradient(90deg, ${cc}, ${cc}88)` }} />
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', gap: 1, mb: 1.5, flexWrap: 'wrap' }}>
                    <Chip label={p.category} size="small" sx={{ bgcolor: `${cc}18`, color: cc, fontWeight: 700, fontSize: '0.7rem' }} />
                    <Chip label={p.fundingType === 'microloan' ? 'Microloan' : 'Equity'} size="small"
                      sx={{ bgcolor: p.fundingType === 'microloan' ? '#e8f5e9' : '#fce4ec', color: p.fundingType === 'microloan' ? '#2e7d32' : '#ad1457', fontWeight: 700, fontSize: '0.7rem' }} />
                    {p.status === 'funded' && <Chip label="Fully Funded" size="small" sx={{ bgcolor: '#e3f2fd', color: '#1565c0', fontWeight: 700, fontSize: '0.7rem' }} />}
                  </Box>
                  <Typography variant="h4" component="h1" sx={{ fontWeight: 800, color: '#0a1940', letterSpacing: '-0.02em', lineHeight: 1.2 }}>{p.title}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>{p.description}</Typography>
                </CardContent>
              </Card>

              {/* Tabs */}
              <Box sx={{ borderBottom: '1px solid', borderColor: 'grey.200' }}>
                <Tabs value={tab} onChange={(_, v) => setTab(v)}
                  sx={{ '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, fontSize: '0.95rem', color: 'text.secondary', minWidth: 'unset', mr: 1 }, '& .Mui-selected': { color: '#0a1940' }, '& .MuiTabs-indicator': { bgcolor: '#0a1940', height: 2.5, borderRadius: 2 } }}>
                  <Tab label="Overview" />
                  <Tab label="Details" />
                  <Tab label="Documents" />
                </Tabs>
              </Box>

              {/* Overview */}
              <TabPanel value={tab} index={0}>
                <Card elevation={0} sx={{ border: '1px solid', borderColor: 'grey.200', borderRadius: 3 }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#0a1940' }}>About {p.title}</Typography>
                    {p.longDescription.split('\n\n').map((para, i) => (
                      <Typography key={i} variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.8 }}>{para.trim()}</Typography>
                    ))}
                  </CardContent>
                </Card>
                <Card elevation={0} sx={{ border: '1px solid', borderColor: 'grey.200', borderRadius: 3, mt: 3 }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 2.5, color: '#0a1940' }}>Milestones</Typography>
                    <List disablePadding>
                      {p.milestones.map((m, i) => (
                        <ListItem key={i} disablePadding sx={{ mb: 2, alignItems: 'flex-start' }}>
                          <ListItemIcon sx={{ minWidth: 32, mt: 0.25 }}>
                            {m.completed ? <CheckCircleIcon sx={{ color: '#2e7d32', fontSize: 20 }} /> : <RadioButtonUncheckedIcon sx={{ color: 'grey.400', fontSize: 20 }} />}
                          </ListItemIcon>
                          <ListItemText
                            primary={<Typography variant="body2" sx={{ fontWeight: 700, color: m.completed ? '#2e7d32' : '#0a1940' }}>{m.title}{m.amount > 0 && <Typography component="span" variant="caption" sx={{ ml: 1, color: 'text.secondary' }}>· {fmtLKR(m.amount)}</Typography>}</Typography>}
                            secondary={<Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>{m.description}</Typography>}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </TabPanel>

              {/* Details */}
              <TabPanel value={tab} index={1}>
                <Card elevation={0} sx={{ border: '1px solid', borderColor: 'grey.200', borderRadius: 3 }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: '#0a1940' }}>Funding Details</Typography>
                    {[
                      { label: 'Funding Type', value: p.fundingType === 'microloan' ? 'Microloan' : 'Equity Investment' },
                      { label: 'Funding Goal', value: fmtLKR(p.fundingGoal) },
                      { label: 'Current Funding', value: fmtLKR(p.currentFunding) },
                      ...(p.fundingType === 'equity'
                        ? [{ label: 'Equity Offered', value: `${p.equityOffered}%` }]
                        : [{ label: 'Interest Rate', value: `${p.interestRate}% p.a.` }, { label: 'Loan Duration', value: `${p.duration} months` }]),
                      { label: 'Status', value: p.status.charAt(0).toUpperCase() + p.status.slice(1) },
                      { label: 'Days Left', value: `${days} days` },
                    ].map((row) => (
                      <Box key={row.label} sx={{ display: 'flex', justifyContent: 'space-between', py: 1.5, borderBottom: '1px solid', borderColor: 'grey.100' }}>
                        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>{row.label}</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#0a1940' }}>{row.value}</Typography>
                      </Box>
                    ))}
                  </CardContent>
                </Card>
                <Card elevation={0} sx={{ border: '1px solid', borderColor: 'grey.200', borderRadius: 3, mt: 3 }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 2.5, color: '#0a1940' }}>Entrepreneur</Typography>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                      <Avatar sx={{ width: 52, height: 52, bgcolor: cc, fontWeight: 700, fontSize: '1.2rem' }}>{p.entrepreneur.name.charAt(0)}</Avatar>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0a1940' }}>{p.entrepreneur.name}</Typography>
                        <Box sx={{ display: 'flex', gap: 2, mt: 0.5, flexWrap: 'wrap' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <EmailIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                            <Typography variant="caption" color="text.secondary">{p.entrepreneur.email}</Typography>
                          </Box>
                          {p.entrepreneur.phone && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <PhoneIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                              <Typography variant="caption" color="text.secondary">{p.entrepreneur.phone}</Typography>
                            </Box>
                          )}
                        </Box>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </TabPanel>

              {/* Documents */}
              <TabPanel value={tab} index={2}>
                <Card elevation={0} sx={{ border: '1px solid', borderColor: 'grey.200', borderRadius: 3 }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 2.5, color: '#0a1940' }}>Project Documents</Typography>
                    {Object.entries(p.documents).filter(([, v]) => v).map(([key, url]) => (
                      <Box key={key} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, border: '1px solid', borderColor: 'grey.200', borderRadius: 2, mb: 2, transition: 'all 0.15s', '&:hover': { borderColor: 'primary.main', bgcolor: '#f8faff' } }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <InsertDriveFileIcon sx={{ color: cc }} />
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#0a1940', textTransform: 'capitalize' }}>{key.replace(/([A-Z])/g, ' $1').trim()}</Typography>
                            <Typography variant="caption" color="text.disabled">{url}</Typography>
                          </Box>
                        </Box>
                        <Button size="small" variant="outlined" href={url as string} target="_blank" sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2 }}>View</Button>
                      </Box>
                    ))}
                    {Object.values(p.documents).every((v) => !v) && <Typography variant="body2" color="text.secondary">No documents uploaded yet.</Typography>}
                  </CardContent>
                </Card>
              </TabPanel>
            </Grid>

            {/* RIGHT sidebar */}
            <Grid item xs={12} md={5}>
              <Box sx={{ position: { md: 'sticky' }, top: { md: 32 } }}>
                <Card elevation={0} sx={{ border: '1px solid', borderColor: 'grey.200', borderRadius: 3, overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
                  <Box sx={{ bgcolor: '#0a1940', px: 3, py: 2 }}>
                    <Typography variant="subtitle1" sx={{ color: '#fff', fontWeight: 700 }}>Funding Progress</Typography>
                  </Box>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                      <Typography variant="body2" color="text.secondary">{fmtLKR(p.currentFunding)} raised</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: prog >= 100 ? '#2e7d32' : 'primary.main' }}>{prog}%</Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={prog}
                      sx={{ height: 8, borderRadius: 4, bgcolor: 'grey.200', mb: 3, '& .MuiLinearProgress-bar': { borderRadius: 4, background: prog >= 100 ? 'linear-gradient(90deg,#2e7d32,#66bb6a)' : 'linear-gradient(90deg,#1565c0,#42a5f5)' } }} />
                    {[
                      { icon: <MonetizationOnIcon sx={{ fontSize: 18, color: 'text.secondary' }} />, label: `Goal: ${fmtLKR(p.fundingGoal)}` },
                      { icon: <GroupIcon sx={{ fontSize: 18, color: 'text.secondary' }} />, label: `${p.investors.length || 'N/A'} investor${p.investors.length !== 1 ? 's' : ''}` },
                      { icon: <CalendarTodayIcon sx={{ fontSize: 18, color: 'text.secondary' }} />, label: `${days || 'N/A'} days left` },
                      { icon: <PieChartIcon sx={{ fontSize: 18, color: 'text.secondary' }} />, label: p.fundingType === 'equity' ? `${p.equityOffered}% equity offered` : `${p.interestRate}% interest rate` },
                    ].map((item, i) => (
                      <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                        {item.icon}
                        <Typography variant="body2" color="text.secondary">{item.label}</Typography>
                      </Box>
                    ))}
                    <Divider sx={{ my: 2.5 }} />
                    <Button fullWidth variant="contained" size="large" onClick={() => setFundOpen(true)}
                      disabled={p.status === 'funded' || p.status === 'completed'}
                      sx={{ borderRadius: 2, fontWeight: 700, textTransform: 'none', fontSize: '1rem', py: 1.5, bgcolor: '#0a1940', boxShadow: 'none', '&:hover': { bgcolor: '#1565c0', boxShadow: '0 4px 16px rgba(21,101,192,0.35)' } }}>
                      {p.status === 'funded' ? 'Fully Funded' : 'Invest Now'}
                    </Button>
                    {p.status !== 'funded' && (
                      <Typography variant="caption" color="text.disabled" sx={{ display: 'block', textAlign: 'center', mt: 1.5 }}>Secure investment · Verified project</Typography>
                    )}
                  </CardContent>
                </Card>

                <Card elevation={0} sx={{ border: '1px solid', borderColor: 'grey.200', borderRadius: 3, mt: 2.5, bgcolor: '#fffde7' }}>
                  <CardContent sx={{ p: 2.5 }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#f57f17', display: 'block', mb: 0.5 }}>⚠ Investment Risk Notice</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                      Investing in early-stage startups involves significant risk. You may lose some or all of your investment. Past performance is no guarantee of future results.
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Layout>
    )
  }

  // ── LIST VIEW ──────────────────────────────────────────────────────────────
  return (
    <Layout>
      <Head>
        <title>Browse Projects – StartupSri</title>
        <meta name="description" content="Discover and fund innovative tech startups in Sri Lanka." />
      </Head>

      {/* Hero banner */}
      <Box sx={{ background: 'linear-gradient(135deg, #0a1940 0%, #1565c0 100%)', py: { xs: 6, md: 9 }, px: 2, textAlign: 'center', color: '#fff' }}>
        <Typography variant="h3" sx={{ fontWeight: 800, mb: 1.5, letterSpacing: '-0.02em' }}>Browse Startups</Typography>
        <Typography variant="h6" sx={{ fontWeight: 400, opacity: 0.8, maxWidth: 560, mx: 'auto' }}>
          Discover innovative Sri Lankan tech ventures seeking microloans and equity investment.
        </Typography>
      </Box>

      {/* Stats strip */}
      <Box sx={{ bgcolor: '#f8faff', borderBottom: '1px solid', borderColor: 'grey.200', py: 2.5 }}>
        <Box sx={{ maxWidth: 1100, mx: 'auto', px: 3, display: 'flex', gap: 5, flexWrap: 'wrap', justifyContent: 'center' }}>
          {[
            { label: 'Active Projects', value: MOCK_PROJECTS.filter((p) => p.status === 'active').length },
            { label: 'Total Raised', value: fmtLKR(MOCK_PROJECTS.reduce((s, p) => s + p.currentFunding, 0)) },
            { label: 'Investors', value: MOCK_PROJECTS.reduce((s, p) => s + p.investors.length, 0) },
            { label: 'Categories', value: CATEGORIES.length - 1 },
          ].map((stat) => (
            <Box key={stat.label} sx={{ textAlign: 'center' }}>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#0a1940' }}>{stat.value}</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>{stat.label}</Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Filters */}
      <Box sx={{ maxWidth: 1100, mx: 'auto', px: 3, py: 4 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField placeholder="Search projects…" size="small" value={search} onChange={(e) => setSearch(e.target.value)}
            sx={{ flex: '1 1 260px', '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: '#fafafa' } }}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" sx={{ color: 'text.disabled' }} /></InputAdornment> }} />
          <FormControl size="small" sx={{ minWidth: 150, '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: '#fafafa' } }}>
            <InputLabel>Category</InputLabel>
            <Select value={category} label="Category" onChange={(e) => setCategory(e.target.value)}>
              {CATEGORIES.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 150, '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: '#fafafa' } }}>
            <InputLabel>Type</InputLabel>
            <Select value={fundingType} label="Type" onChange={(e) => setFundingType(e.target.value)}>
              {FUNDING_TYPES.map((t) => <MenuItem key={t} value={t}>{t === 'All' ? 'All Types' : t.charAt(0).toUpperCase() + t.slice(1)}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 180, '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: '#fafafa' } }}>
            <InputLabel>Sort by</InputLabel>
            <Select value={sort} label="Sort by" onChange={(e) => setSort(e.target.value)}>
              {SORT_OPTIONS.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
            </Select>
          </FormControl>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Showing <strong>{filtered.length}</strong> of <strong>{MOCK_PROJECTS.length}</strong> projects
        </Typography>
      </Box>

      {/* Cards grid */}
      <Box sx={{ maxWidth: 1100, mx: 'auto', px: 3, pb: 10 }}>
        {filtered.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 12 }}>
            <Typography variant="h5" color="text.secondary" sx={{ mb: 1 }}>No projects found</Typography>
            <Typography variant="body2" color="text.disabled">Try adjusting your filters or search term.</Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {filtered.map((project) => {
              const progress = pct(project.currentFunding, project.fundingGoal)
              const dl = daysLeft(project.createdAt, project.duration || 90)
              const cc = CAT_COLOR[project.category] || '#37474f'
              return (
                <Grid item xs={12} sm={6} md={4} key={project.id}>
                  <Card elevation={0}
                    sx={{ border: '1px solid', borderColor: 'grey.200', borderRadius: 3, height: '100%', display: 'flex', flexDirection: 'column', transition: 'all 0.2s',
                      '&:hover': { boxShadow: '0 8px 32px rgba(0,0,0,0.10)', borderColor: 'primary.light', transform: 'translateY(-2px)' } }}>
                    <CardActionArea onClick={() => openDetail(project)}
                      sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch', p: 0 }}>
                      <Box sx={{ height: 6, borderRadius: '12px 12px 0 0', background: `linear-gradient(90deg, ${cc}, ${cc}88)` }} />
                      <CardContent sx={{ p: 3, flex: 1, display: 'flex', flexDirection: 'column' }}>
                        {/* Badges */}
                        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                          <Chip label={project.category} size="small" sx={{ bgcolor: `${cc}18`, color: cc, fontWeight: 700, fontSize: '0.7rem', height: 22 }} />
                          <Chip label={project.fundingType === 'microloan' ? 'Microloan' : 'Equity'} size="small"
                            sx={{ bgcolor: project.fundingType === 'microloan' ? '#e8f5e9' : '#fce4ec', color: project.fundingType === 'microloan' ? '#2e7d32' : '#ad1457', fontWeight: 700, fontSize: '0.7rem', height: 22 }} />
                          {project.status === 'funded' && <Chip label="Funded" size="small" sx={{ bgcolor: '#e3f2fd', color: '#1565c0', fontWeight: 700, fontSize: '0.7rem', height: 22 }} />}
                        </Box>
                        {/* Avatar + title */}
                        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start', mb: 1 }}>
                          <Avatar sx={{ width: 36, height: 36, bgcolor: cc, fontSize: '0.85rem', fontWeight: 700, flexShrink: 0, mt: 0.25 }}>{project.entrepreneur.name.charAt(0)}</Avatar>
                          <Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.3, color: '#0a1940' }}>{project.title}</Typography>
                            <Typography variant="caption" color="text.secondary">by {project.entrepreneur.name}</Typography>
                          </Box>
                        </Box>
                        {/* Description */}
                        <Typography variant="body2" color="text.secondary"
                          sx={{ mt: 1.5, mb: 2, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', flexGrow: 1, lineHeight: 1.6 }}>
                          {project.description}
                        </Typography>
                        {/* Funding bar */}
                        <Box sx={{ mt: 'auto' }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                            <Typography variant="caption" color="text.secondary">{fmtLKR(project.currentFunding)} raised</Typography>
                            <Typography variant="caption" sx={{ fontWeight: 700, color: progress >= 100 ? '#2e7d32' : 'primary.main' }}>{progress}%</Typography>
                          </Box>
                          <LinearProgress variant="determinate" value={progress}
                            sx={{ height: 6, borderRadius: 4, bgcolor: 'grey.200', '& .MuiLinearProgress-bar': { borderRadius: 4, background: progress >= 100 ? 'linear-gradient(90deg,#2e7d32,#66bb6a)' : 'linear-gradient(90deg,#1565c0,#42a5f5)' } }} />
                          <Divider sx={{ my: 2 }} />
                          {/* Metrics */}
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Box sx={{ textAlign: 'center' }}>
                              <Typography variant="caption" color="text.disabled" sx={{ display: 'block', textTransform: 'uppercase', fontSize: '0.62rem', letterSpacing: '0.05em', fontWeight: 600 }}>Goal</Typography>
                              <Typography variant="body2" sx={{ fontWeight: 700, color: '#0a1940', fontSize: '0.8rem' }}>{fmtLKR(project.fundingGoal)}</Typography>
                            </Box>
                            <Box sx={{ textAlign: 'center' }}>
                              <Typography variant="caption" color="text.disabled" sx={{ display: 'block', textTransform: 'uppercase', fontSize: '0.62rem', letterSpacing: '0.05em', fontWeight: 600 }}>
                                {project.fundingType === 'microloan' ? 'Interest' : 'Equity'}
                              </Typography>
                              <Typography variant="body2" sx={{ fontWeight: 700, color: '#0a1940', fontSize: '0.8rem' }}>
                                {project.fundingType === 'microloan' ? `${project.interestRate}%` : `${project.equityOffered}%`}
                              </Typography>
                            </Box>
                            <Box sx={{ textAlign: 'center' }}>
                              <Typography variant="caption" color="text.disabled" sx={{ display: 'block', textTransform: 'uppercase', fontSize: '0.62rem', letterSpacing: '0.05em', fontWeight: 600 }}>Days Left</Typography>
                              <Typography variant="body2" sx={{ fontWeight: 700, color: dl < 10 ? '#d32f2f' : '#0a1940', fontSize: '0.8rem' }}>{dl}</Typography>
                            </Box>
                          </Box>
                        </Box>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Grid>
              )
            })}
          </Grid>
        )}
      </Box>
    </Layout>
  )
}
