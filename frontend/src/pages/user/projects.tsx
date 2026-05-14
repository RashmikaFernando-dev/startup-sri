import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useAppDispatch, useAppSelector } from '@/hooks/useTypedSelector'
import { logout } from '@/redux/slices/authSlice'
import type { Project } from '@/redux/slices/projectSlice'
import {
  Box,
  Typography,
  Button,
  Chip,
  Avatar,
  LinearProgress,
  Tab,
  Tabs,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Snackbar,
  InputAdornment,
  Divider,
  Grid,
  Card,
  CardActionArea,
  CardContent,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import AccountBalanceIcon from '@mui/icons-material/AccountBalance'
import GroupIcon from '@mui/icons-material/Group'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import PieChartIcon from '@mui/icons-material/PieChart'
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile'
import PrintIcon from '@mui/icons-material/Print'
import EmailIcon from '@mui/icons-material/Email'
import PhoneIcon from '@mui/icons-material/Phone'
import SearchIcon from '@mui/icons-material/Search'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import StarIcon from '@mui/icons-material/Star'
import Footer from '../../components/layout/Footer'
import UserNavbar from '@/components/user/UserNavbar'
import InvestorSidebar from '@/components/user/InvestorSidebar'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'


// ── Types ─────────────────────────────────────────────────────────────────────

const scoreStyle = (s: number) =>
  s >= 70 ? { bg: '#d1fae5', color: '#065f46' }
  : s >= 40 ? { bg: '#fef3c7', color: '#92400e' }
  : { bg: '#fee2e2', color: '#991b1b' }

const CAT_COLOR: Record<string, string> = {
  Software: '#1565c0', Hardware: '#6a1b9a', SaaS: '#00838f',
  'Mobile App': '#2e7d32', 'Web Platform': '#e65100', 'AI/ML': '#ad1457', Other: '#37474f',
}

export default function InvestorDashboard() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const user = useAppSelector((s) => s.auth.user)
  const token = useAppSelector((s) => s.auth.token)

  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [typeFilter, setTypeFilter] = useState('All')
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [activeTab, setActiveTab] = useState(0)
  const [investDialog, setInvestDialog] = useState(false)
  const [investAmount, setInvestAmount] = useState('')
  const [toast, setToast] = useState<{ open: boolean; msg: string; type: 'success' | 'error' }>({ open: false, msg: '', type: 'success' })
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [kycStatus, setKycStatus] = useState<'approved' | 'pending' | 'rejected' | 'none' | 'loading'>('loading')

  // Auth guard
  useEffect(() => {
    const storedToken = localStorage.getItem('token')
    if (!storedToken) { router.push('/auth/login'); return }
    const userStr = localStorage.getItem('user')
    if (userStr) {
      try {
        const parsed = JSON.parse(userStr)
        const img = localStorage.getItem(`profileImage_${parsed.id}`)
        if (img) setProfileImage(img)
      } catch {}
    }

    // Fetch KYC status to show warning banner
    const fetchKyc = async () => {
      try {
        const res = await fetch(`${API_BASE}/kyc/my`, {
          headers: { Authorization: `Bearer ${storedToken}` },
        })
        if (res.status === 404) { setKycStatus('none'); return }
        const data = await res.json()
        if (data.success) setKycStatus(data.data.status)
        else setKycStatus('none')
      } catch {
        setKycStatus('none')
      }
    }
    fetchKyc()
  }, [])

  // Fetch projects
  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    setLoading(true)
    try {
      const authToken = token || localStorage.getItem('token')
      const res = await fetch(`${API_BASE}/projects`, {
        headers: { Authorization: `Bearer ${authToken}` },
      })
      const data = await res.json()
      if (data.success) {
        // Show only active/approved projects for investors
        const investable = data.data.filter((p: Project) =>
          ['active', 'approved'].includes(p.status)
        )
        setProjects(investable)
      }
    } catch (err) {
      console.error('Failed to fetch projects', err)
    } finally {
      setLoading(false)
    }
  }

  const handleProceedToCheckout = () => {
    if (!selectedProject || !investAmount) return
    const amount = parseFloat(investAmount)
    if (isNaN(amount) || amount <= 0) {
      setToast({ open: true, msg: 'Please enter a valid amount.', type: 'error' })
      return
    }
    const p = selectedProject
    router.push({
      pathname: '/user/checkout',
      query: {
        projectId: p._id,
        projectTitle: p.title,
        amount: amount.toString(),
        fundingType: p.fundingType,
        ...(p.fundingType === 'microloan' && {
          interestRate: p.interestRate?.toString(),
          duration: p.duration?.toString(),
        }),
        ...(p.fundingType === 'equity' && {
          equityOffered: p.equityOffered?.toString(),
        }),
      },
    })
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    dispatch(logout())
    router.push('/')
  }

  const handlePrint = (url: string) => {
    const w = window.open(url)
    if (w) {
      setTimeout(() => w.print(), 1000)
    }
  }

  const fmt = (n: number) => `LKR ${n.toLocaleString()}`
  const pct = (p: Project) => Math.min(Math.round(((p.currentFunding || 0) / p.fundingGoal) * 100), 100)

  const filteredProjects = projects.filter(p => {
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase())
    const matchCat = categoryFilter === 'All' || p.category === categoryFilter
    const matchType = typeFilter === 'All' || p.fundingType === typeFilter
    return matchSearch && matchCat && matchType
  })

  const categories = ['All', ...Array.from(new Set(projects.map(p => p.category)))]

  // ── Project Detail View ────────────────────────────────────────────────────
  if (selectedProject) {
    const p = selectedProject
    const progress = pct(p)
    return (
      <>
        <Head><title>{p.title} – StartupSri</title></Head>

        <Box sx={{ minHeight: '100vh', bgcolor: '#f7f8fa', display: 'flex', flexDirection: 'column' }}>

          <UserNavbar user={user} profileImage={profileImage} onLogout={handleLogout} />

          {/* Back button */}
          <Box sx={{ maxWidth: 1100, mx: 'auto', width: '100%', px: { xs: 2, md: 4 }, pt: 3 }}>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => { setSelectedProject(null); setActiveTab(0) }}
              sx={{ textTransform: 'none', color: '#111111', fontWeight: 600, borderRadius: 2, mb: 2 }}
            >
              Back to Projects
            </Button>
          </Box>

          {/* Main */}
          <Box sx={{ maxWidth: 1100, mx: 'auto', width: '100%', px: { xs: 2, md: 4 }, pb: 6, display: 'flex', gap: 3, flexWrap: { xs: 'wrap', md: 'nowrap' } }}>

            {/* Left – Project detail */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Box sx={{ bgcolor: '#fff', border: '1px solid #e5e7eb', borderRadius: 3, overflow: 'hidden' }}>
                {/* Header */}
                <Box sx={{ px: 3, pt: 3, pb: 2, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 800, color: '#0a1940', mb: 0.5 }}>{p.title}</Typography>
                    <Typography variant="body2" color="text.secondary">{p.description}</Typography>
                  </Box>
                  <Chip
                    label={p.category}
                    size="small"
                    sx={{ fontWeight: 700, bgcolor: CAT_COLOR[p.category] ? `${CAT_COLOR[p.category]}18` : '#f3f4f6', color: CAT_COLOR[p.category] || '#374151' }}
                  />
                </Box>

                {/* Tabs */}
                <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} sx={{ px: 2, borderBottom: '1px solid #e5e7eb' }}>
                  <Tab label="Overview" sx={{ textTransform: 'none', fontWeight: 600 }} />
                  <Tab label="Details" sx={{ textTransform: 'none', fontWeight: 600 }} />
                  <Tab label="Documents" sx={{ textTransform: 'none', fontWeight: 600 }} />
                </Tabs>

                <Box sx={{ p: 3 }}>
                  {/* ── Overview tab ── */}
                  {activeTab === 0 && (
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#0a1940' }}>
                        About {p.title}
                      </Typography>
                      <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8, whiteSpace: 'pre-line' }}>
                        {p.longDescription || p.description}
                      </Typography>

                      {p.entrepreneur && (
                        <Box sx={{ mt: 4 }}>
                          <Divider sx={{ mb: 3 }} />
                          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, color: '#0a1940' }}>Entrepreneur</Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar sx={{ bgcolor: '#0a1940', width: 44, height: 44, fontWeight: 700 }}>
                              {p.entrepreneur.firstName?.[0]}{p.entrepreneur.lastName?.[0]}
                            </Avatar>
                            <Box>
                              <Typography variant="body1" sx={{ fontWeight: 700 }}>
                                {p.entrepreneur.firstName} {p.entrepreneur.lastName}
                                {p.entrepreneur.startupName && ` · ${p.entrepreneur.startupName}`}
                              </Typography>
                              <Box sx={{ display: 'flex', gap: 2, mt: 0.5, flexWrap: 'wrap' }}>
                                {p.entrepreneur.email && (
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#6b7280' }}>
                                    <EmailIcon sx={{ fontSize: 14 }} />
                                    <Typography variant="caption">{p.entrepreneur.email}</Typography>
                                  </Box>
                                )}
                                {p.entrepreneur.phone && (
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#6b7280' }}>
                                    <PhoneIcon sx={{ fontSize: 14 }} />
                                    <Typography variant="caption">{p.entrepreneur.phone}</Typography>
                                  </Box>
                                )}
                              </Box>
                            </Box>
                          </Box>
                        </Box>
                      )}
                    </Box>
                  )}

                  {/* ── Details tab ── */}
                  {activeTab === 1 && (
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, color: '#0a1940' }}>Funding Details</Typography>
                      <Box sx={{ border: '1px solid #e5e7eb', borderRadius: 2, overflow: 'hidden' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                          <thead>
                            <tr style={{ background: '#f9fafb' }}>
                              <th style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 700, fontSize: 12, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e5e7eb', width: '40%' }}>Field</th>
                              <th style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 700, fontSize: 12, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e5e7eb' }}>Value</th>
                            </tr>
                          </thead>
                          <tbody>
                            {[
                              { label: 'Funding Type', value: p.fundingType === 'equity' ? 'Equity' : 'Microloan' },
                              { label: 'Funding Goal', value: fmt(p.fundingGoal) },
                              { label: 'Amount Raised', value: fmt(p.currentFunding || 0) },
                              ...(p.fundingType === 'equity' ? [{ label: 'Equity Offered', value: `${p.equityOffered}%` }] : []),
                              ...(p.fundingType === 'microloan' ? [
                                { label: 'Interest Rate', value: `${p.interestRate}% p.a.` },
                                { label: 'Duration', value: `${p.duration} months` },
                              ] : []),
                              { label: 'Category', value: p.category },
                              { label: 'Status', value: p.status.charAt(0).toUpperCase() + p.status.slice(1) },
                              { label: 'Listed', value: new Date(p.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) },
                            ].map((item, idx, arr) => (
                              <tr key={item.label} style={{ background: idx % 2 === 0 ? '#fff' : '#f9fafb' }}>
                                <td style={{ padding: '12px 16px', fontSize: 14, color: '#6b7280', fontWeight: 600, borderBottom: idx < arr.length - 1 ? '1px solid #e5e7eb' : 'none' }}>{item.label}</td>
                                <td style={{ padding: '12px 16px', fontSize: 14, color: '#0a1940', fontWeight: 700, borderBottom: idx < arr.length - 1 ? '1px solid #e5e7eb' : 'none' }}>{item.value}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </Box>

                      {/* ── Credit Score ── */}
                      {typeof (p as any).creditScore === 'number' && (() => {
                        const score: number = (p as any).creditScore
                        const breakdown: { label: string; points: number; met: boolean }[] = (p as any).creditBreakdown || []
                        const { bg, color } = scoreStyle(score)
                        return (
                          <Box sx={{ mt: 3 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, color: '#0a1940' }}>Credit Score</Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 2.5, p: 2.5, bgcolor: bg, borderRadius: 2 }}>
                              <Box sx={{ textAlign: 'center' }}>
                                <Typography sx={{ fontSize: 36, fontWeight: 900, color, lineHeight: 1 }}>{score}</Typography>
                                <Typography sx={{ fontSize: 11, fontWeight: 700, color }}>out of 100</Typography>
                              </Box>
                              <Box sx={{ flex: 1 }}>
                                <LinearProgress variant="determinate" value={score}
                                  sx={{ height: 10, borderRadius: 5, bgcolor: 'rgba(0,0,0,0.1)', '& .MuiLinearProgress-bar': { bgcolor: color, borderRadius: 5 } }} />
                                <Typography sx={{ mt: 0.8, fontSize: 12, color, fontWeight: 600 }}>
                                  {score >= 70 ? 'Strong credibility' : score >= 40 ? 'Moderate credibility' : 'Low credibility'}
                                </Typography>
                              </Box>
                            </Box>
                            <Box sx={{ border: '1px solid #e5e7eb', borderRadius: 2, overflow: 'hidden' }}>
                              {breakdown.map((r, i) => (
                                <Box key={r.label} sx={{
                                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                  px: 2, py: 1.5, bgcolor: i % 2 === 0 ? '#fff' : '#f9fafb',
                                  borderBottom: i < breakdown.length - 1 ? '1px solid #e5e7eb' : 'none',
                                }}>
                                  <Typography sx={{ fontSize: 13, color: '#374151' }}>{r.label}</Typography>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Typography sx={{ fontSize: 12, color: '#6b7280' }}>+{r.points} pts</Typography>
                                    <Box sx={{
                                      width: 20, height: 20, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                      bgcolor: r.met ? '#d1fae5' : '#fee2e2',
                                    }}>
                                      <Typography sx={{ fontSize: 11, fontWeight: 800, color: r.met ? '#065f46' : '#991b1b' }}>
                                        {r.met ? '✓' : '✗'}
                                      </Typography>
                                    </Box>
                                  </Box>
                                </Box>
                              ))}
                            </Box>
                          </Box>
                        )
                      })()}
                    </Box>
                  )}

                  {/* ── Documents tab ── */}
                  {activeTab === 2 && (
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, color: '#0a1940' }}>Available Documents</Typography>
                      {!p.documents || Object.values(p.documents).every(v => !v) ? (
                        <Box sx={{ textAlign: 'center', py: 5, color: '#9ca3af' }}>
                          <InsertDriveFileIcon sx={{ fontSize: 40, mb: 1 }} />
                          <Typography variant="body2">No documents uploaded yet.</Typography>
                        </Box>
                      ) : (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                          {p.documents.businessPlan && (
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, border: '1px solid #e5e7eb', borderRadius: 2 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <InsertDriveFileIcon sx={{ color: '#1d4ed8' }} />
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>Business Plan</Typography>
                              </Box>
                              <Box sx={{ display: 'flex', gap: 1 }}>
                                <Button size="small" variant="outlined" href={p.documents.businessPlan} target="_blank" sx={{ textTransform: 'none', borderRadius: 2, color: '#111111', borderColor: '#111111', '&:hover': { borderColor: '#000000', bgcolor: 'rgba(0,0,0,0.04)' } }}>View</Button>
                                <Button size="small" variant="outlined" startIcon={<PrintIcon />} onClick={() => handlePrint(p.documents!.businessPlan!)} sx={{ textTransform: 'none', borderRadius: 2, color: '#111111', borderColor: '#111111', '&:hover': { borderColor: '#000000', bgcolor: 'rgba(0,0,0,0.04)' } }}>Print</Button>
                              </Box>
                            </Box>
                          )}
                        </Box>
                      )}
                    </Box>
                  )}

                </Box>
              </Box>
            </Box>

            {/* Right – Funding Progress sidebar */}
            <Box sx={{ width: { xs: '100%', md: 280 }, flexShrink: 0 }}>
              <Box sx={{ bgcolor: '#fff', border: '1px solid #e5e7eb', borderRadius: 3, p: 3, position: { md: 'sticky' }, top: { md: 20 } }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0a1940', mb: 2 }}>Funding Progress</Typography>

                {/* Progress bar */}
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="caption" color="text.secondary">{fmt(p.currentFunding || 0)} raised</Typography>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#0a1940' }}>{progress}%</Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={progress}
                    sx={{ height: 8, borderRadius: 4, bgcolor: '#e5e7eb', '& .MuiLinearProgress-bar': { bgcolor: '#0a1940' } }}
                  />
                </Box>

                <Divider sx={{ mb: 2 }} />

                {/* Stats */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 3 }}>
                  {[
                    { icon: <AccountBalanceIcon sx={{ fontSize: 18, color: '#6b7280' }} />, label: 'Goal', value: fmt(p.fundingGoal) },
                    { icon: <GroupIcon sx={{ fontSize: 18, color: '#6b7280' }} />, label: 'Investors', value: p.investors?.length ? `${p.investors.length}` : 'N/A' },
                    { icon: <CalendarTodayIcon sx={{ fontSize: 18, color: '#6b7280' }} />, label: 'Days left', value: p.duration ? `${p.duration} months` : 'N/A' },
                    ...(p.fundingType === 'equity'
                      ? [{ icon: <PieChartIcon sx={{ fontSize: 18, color: '#6b7280' }} />, label: 'Equity offered', value: `${p.equityOffered}%` }]
                      : [{ icon: <TrendingUpIcon sx={{ fontSize: 18, color: '#6b7280' }} />, label: 'Interest rate', value: `${p.interestRate}% p.a.` }]),
                  ].map(item => (
                    <Box key={item.label} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      {item.icon}
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="caption" color="text.secondary">{item.label}</Typography>
                      </Box>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#0a1940' }}>{item.value}</Typography>
                    </Box>
                  ))}
                </Box>

                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  onClick={() => setInvestDialog(true)}
                  disabled={p.status === 'funded' || p.status === 'completed'}
                  sx={{
                    bgcolor: '#111111', borderRadius: 2, textTransform: 'none', fontWeight: 700,
                    '&:hover': { bgcolor: '#000000' },
                  }}
                >
                  {p.status === 'funded' ? 'Fully Funded' : 'Invest Now'}
                </Button>
              </Box>
            </Box>
          </Box>

          <Footer />
        </Box>

        {/* Invest Dialog */}
        <Dialog open={investDialog} onClose={() => setInvestDialog(false)} PaperProps={{ sx: { borderRadius: 3, p: 1, maxWidth: 420, width: '100%' } }}>
          <DialogTitle sx={{ fontWeight: 800, color: '#0a1940' }}>Invest in {p.title}</DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
              {p.fundingType === 'equity'
                ? `You will receive a proportional share of the ${p.equityOffered}% equity pool.`
                : `This is a microloan at ${p.interestRate}% p.a. over ${p.duration} months.`}
            </Typography>
            <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'text.secondary', display: 'block', mb: 0.75 }}>
              Investment Amount (LKR)
            </Typography>
            <TextField
              fullWidth
              type="number"
              placeholder="e.g. 10000"
              value={investAmount}
              onChange={e => setInvestAmount(e.target.value)}
              InputProps={{ startAdornment: <InputAdornment position="start">LKR</InputAdornment> }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setInvestDialog(false)} sx={{ textTransform: 'none', color: '#111111' }}>Cancel</Button>
            <Button
              variant="contained"
              onClick={handleProceedToCheckout}
              sx={{ bgcolor: '#111111', borderRadius: 2, textTransform: 'none', fontWeight: 700, '&:hover': { bgcolor: '#000000' } }}
            >
              Proceed to Payment
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar open={toast.open} autoHideDuration={3500} onClose={() => setToast(t => ({ ...t, open: false }))} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
          <Alert severity={toast.type} variant="filled" sx={{ width: '100%' }}>{toast.msg}</Alert>
        </Snackbar>
      </>
    )
  }

  // ── Projects List View ─────────────────────────────────────────────────────
  return (
    <>
      <Head><title>Investor Dashboard – StartupSri</title></Head>

      <Box sx={{ minHeight: '100vh', bgcolor: '#f7f8fa', display: 'flex', flexDirection: 'column' }}>

        <UserNavbar user={user} profileImage={profileImage} onLogout={handleLogout} />

        {/* Body */}
        <Box sx={{ flex: 1, maxWidth: 1100, mx: 'auto', width: '100%', px: { xs: 2, md: 4 }, py: 4, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>

          <InvestorSidebar active="projects" />

          <Box sx={{ flex: 1, minWidth: 0 }}>

          {/* KYC warning banner for unverified investors */}
          {kycStatus !== 'loading' && kycStatus !== 'approved' && (
            <Alert
              severity={kycStatus === 'pending' ? 'info' : 'warning'}
              sx={{ mb: 3, borderRadius: 2 }}
              action={
                <Button
                  color="inherit"
                  size="small"
                  sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}
                  onClick={() => router.push('/user/verifications')}
                >
                  {kycStatus === 'pending' ? 'View Status' : 'Verify Now'}
                </Button>
              }
            >
              {kycStatus === 'pending' && 'Your identity verification is pending admin review. You cannot invest until it is approved.'}
              {kycStatus === 'rejected' && 'Your identity verification was rejected. Please resubmit your documents to start investing.'}
              {kycStatus === 'none' && 'You must complete identity verification (KYC) before you can invest in any project.'}
            </Alert>
          )}

          {/* Header */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#0a1940', mb: 0.5 }}>Explore Opportunities</Typography>
            <Typography variant="body1" color="text.secondary">Discover and invest in verified Sri Lankan startups</Typography>
          </Box>

          {/* Filters */}
          <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap' }}>
            <TextField
              size="small"
              placeholder="Search projects..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
              sx={{ flex: 1, minWidth: 200, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Category</InputLabel>
              <Select value={categoryFilter} label="Category" onChange={e => setCategoryFilter(e.target.value)} sx={{ borderRadius: 2 }}>
                {categories.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel>Type</InputLabel>
              <Select value={typeFilter} label="Type" onChange={e => setTypeFilter(e.target.value)} sx={{ borderRadius: 2 }}>
                <MenuItem value="All">All Types</MenuItem>
                <MenuItem value="equity">Equity</MenuItem>
                <MenuItem value="microloan">Microloan</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* Project cards */}
          {loading ? (
            <Box sx={{ textAlign: 'center', py: 10, color: '#9ca3af' }}>
              <Typography>Loading projects...</Typography>
            </Box>
          ) : filteredProjects.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 10, bgcolor: '#fff', border: '1px solid #e5e7eb', borderRadius: 3 }}>
              <Typography color="text.secondary">No projects found matching your criteria.</Typography>
            </Box>
          ) : (
            <Grid container spacing={2.5}>
              {filteredProjects.map(p => (
                <Grid item xs={12} sm={6} md={4} key={p._id}>
                  <Card
                    sx={{
                      height: '100%', border: '1px solid #e5e7eb', borderRadius: 3, boxShadow: 'none',
                      transition: 'all 0.2s',
                      '&:hover': { boxShadow: '0 8px 24px rgba(0,0,0,0.09)', transform: 'translateY(-3px)', borderColor: '#c7d2fe' },
                    }}
                  >
                    <CardActionArea onClick={() => { setSelectedProject(p); setActiveTab(0) }} sx={{ height: '100%' }}>
                      <CardContent sx={{ p: 3 }}>
                        {/* Top row */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                          <Box
                            sx={{
                              width: 44, height: 44, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center',
                              bgcolor: CAT_COLOR[p.category] ? `${CAT_COLOR[p.category]}18` : '#f3f4f6',
                              color: CAT_COLOR[p.category] || '#374151', fontWeight: 800, fontSize: 16,
                            }}
                          >
                            {p.title[0]}
                          </Box>
                          <Chip
                            label={p.fundingType === 'equity' ? 'Equity' : 'Microloan'}
                            size="small"
                            sx={{
                              fontSize: 11, fontWeight: 700,
                              bgcolor: p.fundingType === 'equity' ? '#ede9fe' : '#dbeafe',
                              color: p.fundingType === 'equity' ? '#7c3aed' : '#1d4ed8',
                            }}
                          />
                        </Box>

                        <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0a1940', mb: 0.5 }}>{p.title}</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{
                          mb: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                        }}>
                          {p.description}
                        </Typography>

                        {/* Progress */}
                        <Box sx={{ mb: 1.5 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="caption" color="text.secondary">{fmt(p.currentFunding || 0)} raised</Typography>
                            <Typography variant="caption" sx={{ fontWeight: 700, color: '#0a1940' }}>{pct(p)}%</Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={pct(p)}
                            sx={{ height: 5, borderRadius: 3, bgcolor: '#f3f4f6', '& .MuiLinearProgress-bar': { bgcolor: '#0a1940' } }}
                          />
                        </Box>

                        {/* Credit score badge */}
                        {typeof (p as any).creditScore === 'number' && (() => {
                          const { bg, color } = scoreStyle((p as any).creditScore)
                          return (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1.5 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, px: 1.2, py: 0.3, borderRadius: 1.5, bgcolor: bg }}>
                                <StarIcon sx={{ fontSize: 12, color }} />
                                <Typography sx={{ fontSize: 11, fontWeight: 800, color }}>
                                  Score {(p as any).creditScore}/100
                                </Typography>
                              </Box>
                            </Box>
                          )
                        })()}

                        {/* Goal + type info */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 700, letterSpacing: 0.5 }}>Goal</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 800, color: '#0a1940' }}>{fmt(p.fundingGoal)}</Typography>
                          </Box>
                          <Box sx={{ textAlign: 'right' }}>
                            <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 700, letterSpacing: 0.5 }}>
                              {p.fundingType === 'equity' ? 'Equity' : 'Interest'}
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 800, color: '#059669' }}>
                              {p.fundingType === 'equity' ? `${p.equityOffered}%` : `${p.interestRate}% p.a.`}
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
          </Box>
        </Box>

        <Footer />
      </Box>

      <Snackbar open={toast.open} autoHideDuration={3500} onClose={() => setToast(t => ({ ...t, open: false }))} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert severity={toast.type} variant="filled" sx={{ width: '100%' }}>{toast.msg}</Alert>
      </Snackbar>
    </>
  )
}
