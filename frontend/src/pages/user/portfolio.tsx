import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useAppDispatch, useAppSelector } from '@/hooks/useTypedSelector'
import { logout } from '@/redux/slices/authSlice'
import { Box, Typography, LinearProgress, Chip, Alert, Snackbar, Collapse, IconButton, Button } from '@mui/material'
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import FolderOpenIcon from '@mui/icons-material/FolderOpen'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong'
import jsPDF from 'jspdf'
import UserNavbar from '@/components/user/UserNavbar'
import InvestorSidebar from '@/components/user/InvestorSidebar'
import Footer from '@/components/layout/Footer'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js'
import { Doughnut, Bar } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend)

const fmt = (n: number) => `LKR ${n.toLocaleString()}`

const BADGE: Record<string, { bg: string; color: string }> = {
  completed: { bg: '#d1fae5', color: '#065f46' },
  pending:   { bg: '#fef3c7', color: '#92400e' },
  cancelled: { bg: '#fee2e2', color: '#991b1b' },
  refunded:  { bg: '#f3f4f6', color: '#374151' },
  active:    { bg: '#d1fae5', color: '#065f46' },
  approved:  { bg: '#dbeafe', color: '#1e40af' },
  funded:    { bg: '#ede9fe', color: '#5b21b6' },
  paid:      { bg: '#d1fae5', color: '#065f46' },
  overdue:   { bg: '#fee2e2', color: '#991b1b' },
}

function Badge({ label, status }: { label: string; status: string }) {
  const s = BADGE[status] ?? { bg: '#f3f4f6', color: '#374151' }
  return (
    <Box component="span" sx={{ display: 'inline-flex', bgcolor: s.bg, color: s.color, fontSize: 11, fontWeight: 700, px: 1.5, py: 0.4, borderRadius: 10 }}>
      {label}
    </Box>
  )
}

function InvestmentCard({ inv, user }: { inv: any; user: any }) {
  const [open, setOpen] = useState(false)
  const p = inv.project
  const progress = p ? Math.min(Math.round(((p.currentFunding || 0) / p.fundingGoal) * 100), 100) : 0
  const schedule: any[] = inv.repaymentSchedule ?? []
  const paidAmt = schedule.filter(r => r.status === 'paid').reduce((s: number, r: any) => s + r.amount, 0)
  const totalAmt = schedule.reduce((s: number, r: any) => s + r.amount, 0)

  const generateReceipt = () => {
    const doc = new jsPDF()
    const pageW = doc.internal.pageSize.getWidth()
    const leftM = 20
    const rightVal = pageW - 20
    let y = 20

    doc.setFillColor(10, 25, 64)
    doc.rect(0, 0, pageW, 48, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(22)
    doc.setFont('helvetica', 'bold')
    doc.text('StartupSri', leftM, 22)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text('Investment Receipt', leftM, 32)
    doc.setFontSize(9)
    doc.text('www.startupsri.lk', leftM, 40)

    const receiptNo = `RCP-${inv._id.slice(-8).toUpperCase()}`
    doc.setFontSize(10)
    doc.text(receiptNo, rightVal, 22, { align: 'right' })
    doc.text(new Date(inv.createdAt).toLocaleDateString('en-LK', { year: 'numeric', month: 'long', day: 'numeric' }), rightVal, 32, { align: 'right' })

    y = 62

    doc.setTextColor(107, 114, 128)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.text('INVESTOR', leftM, y)
    y += 7
    doc.setTextColor(10, 25, 64)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    doc.text(`${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Investor', leftM, y)
    y += 6
    doc.setFontSize(9)
    doc.setTextColor(107, 114, 128)
    doc.text(user?.email || '', leftM, y)

    y += 16

    doc.setDrawColor(229, 231, 235)
    doc.setLineWidth(0.5)
    doc.line(leftM, y, rightVal, y)
    y += 12

    doc.setTextColor(107, 114, 128)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.text('TRANSACTION DETAILS', leftM, y)
    y += 10

    const addRow = (label: string, value: string, highlight = false) => {
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(10)
      doc.setTextColor(107, 114, 128)
      doc.text(label, leftM, y)
      if (highlight) { doc.setTextColor(22, 163, 74) } else { doc.setTextColor(10, 25, 64) }
      doc.setFont('helvetica', highlight ? 'bold' : 'normal')
      doc.text(value, rightVal, y, { align: 'right' })
      y += 8
    }

    addRow('Transaction ID', inv.paymentIntentId || inv._id)
    addRow('Date & Time', new Date(inv.createdAt).toLocaleString('en-LK'))
    addRow('Project', p?.title || 'N/A')
    addRow('Investment Type', inv.type === 'equity' ? 'Equity' : 'Microloan')

    if (inv.type === 'loan') {
      if (p?.interestRate) addRow('Interest Rate', `${p.interestRate}% p.a.`)
      if (p?.duration) addRow('Loan Duration', `${p.duration} months`)
    }
    if (inv.type === 'equity' && p?.equityOffered) {
      addRow('Equity Offered', `${p.equityOffered}%`)
    }

    addRow('Payment Method', 'PayHere')
    addRow('Status', inv.status === 'completed' ? 'Completed' : inv.status)

    y += 4
    doc.setDrawColor(229, 231, 235)
    doc.line(leftM, y, rightVal, y)
    y += 10

    doc.setFontSize(10)
    doc.setTextColor(107, 114, 128)
    doc.setFont('helvetica', 'normal')
    doc.text('Investment Amount', leftM, y)
    doc.setFontSize(16)
    doc.setTextColor(10, 25, 64)
    doc.setFont('helvetica', 'bold')
    doc.text(fmt(inv.amount), rightVal, y, { align: 'right' })
    y += 10

    if (inv.type === 'loan' && totalAmt > 0) {
      doc.setFontSize(10)
      doc.setTextColor(107, 114, 128)
      doc.setFont('helvetica', 'normal')
      doc.text('Expected Total Return', leftM, y)
      doc.setTextColor(22, 163, 74)
      doc.setFont('helvetica', 'bold')
      doc.text(fmt(totalAmt), rightVal, y, { align: 'right' })
      y += 10
    }

    y += 16
    doc.setDrawColor(229, 231, 235)
    doc.line(leftM, y, rightVal, y)
    y += 10
    doc.setFontSize(8)
    doc.setTextColor(156, 163, 175)
    doc.setFont('helvetica', 'normal')
    doc.text('This is a computer-generated receipt and does not require a signature.', pageW / 2, y, { align: 'center' })
    y += 5
    doc.text('For queries, contact hello@startupsri.lk | +94 77 000 0000', pageW / 2, y, { align: 'center' })

    doc.save(`StartupSri_Receipt_${receiptNo}.pdf`)
  }

  return (
    <Box sx={{ bgcolor: '#fff', border: '1px solid #e5e7eb', borderRadius: 3, overflow: 'hidden', '&:hover': { boxShadow: '0 4px 20px rgba(0,0,0,0.07)' }, transition: 'box-shadow 0.2s' }}>
      <Box sx={{ p: 3 }}>
        {/* Title row */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 1.5, mb: 1 }}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, flexWrap: 'wrap' }}>
              <Typography sx={{ fontWeight: 800, fontSize: 16, color: '#0a1940' }}>{p?.title ?? 'Unknown Project'}</Typography>
              {p && <Badge label={p.status} status={p.status} />}
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {p?.category && <Chip label={p.category} size="small" variant="outlined" sx={{ fontSize: 11, borderColor: '#e5e7eb', color: '#6b7280' }} />}
              <Chip label={inv.type === 'equity' ? 'Equity' : 'Microloan'} size="small"
                sx={{ fontSize: 11, fontWeight: 700, border: 'none', bgcolor: inv.type === 'equity' ? '#ede9fe' : '#dbeafe', color: inv.type === 'equity' ? '#7c3aed' : '#1d4ed8' }} />
            </Box>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Typography sx={{ fontWeight: 800, fontSize: 22, color: '#0a1940', lineHeight: 1 }}>{fmt(inv.amount)}</Typography>
            <Typography sx={{ fontSize: 12, color: '#9ca3af', mb: 0.8 }}>You invested</Typography>
            <Badge label={inv.status} status={inv.status} />
          </Box>
        </Box>

        {/* Progress */}
        {p && (
          <Box sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography sx={{ fontSize: 12, color: '#6b7280' }}>Project funding</Typography>
              <Typography sx={{ fontSize: 12, fontWeight: 700, color: '#0a1940' }}>{progress}%</Typography>
            </Box>
            <LinearProgress variant="determinate" value={progress}
              sx={{ height: 6, borderRadius: 3, bgcolor: '#f3f4f6', '& .MuiLinearProgress-bar': { bgcolor: '#0a1940' } }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
              <Typography sx={{ fontSize: 11, color: '#9ca3af' }}>{fmt(p.currentFunding)} raised</Typography>
              <Typography sx={{ fontSize: 11, color: '#9ca3af' }}>Goal: {fmt(p.fundingGoal)}</Typography>
            </Box>
          </Box>
        )}

        {/* Equity info */}
        {inv.type === 'equity' && p?.equityOffered && (
          <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f3ff', borderRadius: 2, display: 'flex', gap: 4 }}>
            <Box>
              <Typography sx={{ fontSize: 12, color: '#6b7280' }}>Your equity share</Typography>
              <Typography sx={{ fontWeight: 800, color: '#7c3aed', fontSize: 15 }}>
                {((inv.amount / p.fundingGoal) * p.equityOffered).toFixed(2)}%
              </Typography>
            </Box>
            <Box>
              <Typography sx={{ fontSize: 12, color: '#6b7280' }}>Total equity pool</Typography>
              <Typography sx={{ fontWeight: 700, color: '#374151', fontSize: 14 }}>{p.equityOffered}%</Typography>
            </Box>
          </Box>
        )}

        {/* Microloan summary */}
        {inv.type === 'loan' && schedule.length > 0 && (
          <Box sx={{ mt: 2, p: 2, bgcolor: '#f0fdf4', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
            <Box sx={{ display: 'flex', gap: 3 }}>
              <Box>
                <Typography sx={{ fontSize: 12, color: '#6b7280' }}>Repayments</Typography>
                <Typography sx={{ fontWeight: 700, color: '#065f46' }}>{schedule.filter(r => r.status === 'paid').length}/{schedule.length} paid</Typography>
              </Box>
              <Box>
                <Typography sx={{ fontSize: 12, color: '#6b7280' }}>Received / Expected</Typography>
                <Typography sx={{ fontWeight: 700, color: '#374151' }}>{fmt(paidAmt)} / {fmt(totalAmt)}</Typography>
              </Box>
            </Box>
            <IconButton size="small" onClick={() => setOpen(v => !v)} sx={{ color: '#6b7280', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
              <ExpandMoreIcon />
            </IconButton>
          </Box>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
          <Typography sx={{ fontSize: 12, color: '#9ca3af' }}>
            Invested on {new Date(inv.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
          </Typography>
          <Button
            size="small"
            startIcon={<ReceiptLongIcon sx={{ fontSize: 16 }} />}
            onClick={generateReceipt}
            sx={{
              textTransform: 'none',
              fontSize: 12,
              fontWeight: 700,
              color: '#16a34a',
              borderColor: '#bbf7d0',
              border: '1px solid #bbf7d0',
              borderRadius: 2,
              px: 1.5,
              py: 0.5,
              '&:hover': { bgcolor: '#f0fdf4', borderColor: '#16a34a' },
            }}
          >
            Print Receipt
          </Button>
        </Box>
      </Box>

      {/* Repayment schedule table */}
      {inv.type === 'loan' && schedule.length > 0 && (
        <Collapse in={open}>
          <Box sx={{ borderTop: '1px solid #f3f4f6', px: 3, pb: 3, pt: 2 }}>
            <Typography sx={{ fontWeight: 700, fontSize: 13, color: '#0a1940', mb: 1.5 }}>Repayment Schedule</Typography>
            <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse' }}>
              <Box component="thead">
                <Box component="tr" sx={{ bgcolor: '#f9fafb' }}>
                  {['#', 'Due Date', 'Amount', 'Status'].map(h => (
                    <Box component="th" key={h} sx={{ px: 2, py: 1.2, textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</Box>
                  ))}
                </Box>
              </Box>
              <Box component="tbody">
                {schedule.map((r: any, i: number) => (
                  <Box component="tr" key={i} sx={{ borderTop: '1px solid #f3f4f6' }}>
                    <Box component="td" sx={{ px: 2, py: 1.5, fontSize: 13, color: '#6b7280' }}>{i + 1}</Box>
                    <Box component="td" sx={{ px: 2, py: 1.5, fontSize: 13, color: '#374151' }}>
                      {new Date(r.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </Box>
                    <Box component="td" sx={{ px: 2, py: 1.5, fontSize: 13, fontWeight: 700, color: '#0a1940' }}>{fmt(r.amount)}</Box>
                    <Box component="td" sx={{ px: 2, py: 1.5 }}><Badge label={r.status} status={r.status} /></Box>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        </Collapse>
      )}
    </Box>
  )
}

export default function PortfolioDashboard() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const user = useAppSelector(s => s.auth.user)
  const token = useAppSelector(s => s.auth.token)
  const [investments, setInvestments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [toast, setToast] = useState({ open: false, msg: '', type: 'success' as 'success' | 'error' })

  useEffect(() => {
    const storedToken = localStorage.getItem('token')
    if (!storedToken) { router.push('/auth/login'); return }
    try {
      const parsed = JSON.parse(localStorage.getItem('user') || '{}')
      const img = localStorage.getItem(`profileImage_${parsed.id}`)
      if (img) setProfileImage(img)
    } catch {}
    fetchInvestments()
  }, [])

  const fetchInvestments = async () => {
    setLoading(true)
    try {
      const authToken = token || localStorage.getItem('token')
      const res = await fetch('http://localhost:5000/api/investments/my', { headers: { Authorization: `Bearer ${authToken}` } })
      const data = await res.json()
      if (data.success) setInvestments(data.data)
      else setToast({ open: true, msg: 'Failed to load investments.', type: 'error' })
    } catch {
      setToast({ open: true, msg: 'Could not connect to server.', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    dispatch(logout())
    router.push('/')
  }

  const totalInvested  = investments.reduce((s, i) => s + i.amount, 0)
  const activeCount    = investments.filter(i => ['active', 'approved', 'funded'].includes(i.project?.status ?? '')).length
  const totalExpected  = investments.reduce((s, i) => s + (i.repaymentSchedule ?? []).reduce((rs: number, r: any) => rs + r.amount, 0), 0)

  const stats = [
    { label: 'Total Invested',    value: fmt(totalInvested),              icon: <AccountBalanceWalletIcon sx={{ fontSize: 22, color: '#3b82f6' }} />, bg: '#dbeafe' },
    { label: 'Projects Backed',   value: investments.length,              icon: <FolderOpenIcon sx={{ fontSize: 22, color: '#8b5cf6' }} />,          bg: '#ede9fe' },
    { label: 'Active',            value: activeCount,                     icon: <TrendingUpIcon sx={{ fontSize: 22, color: '#10b981' }} />,           bg: '#d1fae5' },
    { label: 'Expected Returns',  value: totalExpected > 0 ? fmt(totalExpected) : 'N/A', icon: <CheckCircleIcon sx={{ fontSize: 22, color: '#f59e0b' }} />, bg: '#fef3c7' },
  ]

  return (
    <>
      <Head><title>My Portfolio – StartupSri</title></Head>
      <Box sx={{ minHeight: '100vh', bgcolor: '#f7f8fa', display: 'flex', flexDirection: 'column' }}>
        <UserNavbar user={user} profileImage={profileImage} onLogout={handleLogout} />

        <Box sx={{ flex: 1, maxWidth: 1100, mx: 'auto', width: '100%', px: { xs: 2, md: 4 }, py: 4, display: 'flex', gap: 3 }}>
          <InvestorSidebar active="portfolio" />

          <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#0a1940', mb: 0.5 }}>My Portfolio</Typography>
            <Typography color="text.secondary">Track your investments, returns and repayment schedules</Typography>
          </Box>

          {/* Stats */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4,1fr)' }, gap: 2.5, mb: 4 }}>
            {stats.map(s => (
              <Box key={s.label} sx={{ bgcolor: '#fff', borderRadius: 2.5, border: '1px solid #e5e7eb', p: 2.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                  <Typography sx={{ fontSize: 13, color: '#6b7280', fontWeight: 600 }}>{s.label}</Typography>
                  <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{s.icon}</Box>
                </Box>
                <Typography sx={{ fontSize: 22, fontWeight: 800, color: '#0a1940' }}>{s.value}</Typography>
              </Box>
            ))}
          </Box>

          {/* Charts */}
          {investments.length > 0 && (() => {
            const byType: Record<string, number> = {}
            const byProject: Record<string, number> = {}
            investments.forEach(inv => {
              const t = inv.type === 'equity' ? 'Equity' : 'Microloan'
              byType[t] = (byType[t] || 0) + inv.amount
              const pName = inv.project?.title || 'Unknown'
              byProject[pName] = (byProject[pName] || 0) + inv.amount
            })

            const typeChartData = {
              labels: Object.keys(byType),
              datasets: [{
                data: Object.values(byType),
                backgroundColor: ['#8b5cf6', '#3b82f6'],
                borderWidth: 0,
                hoverOffset: 6,
              }],
            }

            const projectNames = Object.keys(byProject).map(n => n.length > 16 ? n.slice(0, 16) + '…' : n)
            const projectBarData = {
              labels: projectNames,
              datasets: [{
                label: 'Invested (LKR)',
                data: Object.values(byProject),
                backgroundColor: 'rgba(99,102,241,0.7)',
                borderRadius: 4,
              }],
            }

            return (
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '3fr 2fr' }, gap: 2.5, mb: 4 }}>
                <Box sx={{ bgcolor: '#fff', border: '1px solid #e5e7eb', borderRadius: 2.5, p: 2.5 }}>
                  <Typography sx={{ fontWeight: 700, fontSize: 14, color: '#0a1940', mb: 2 }}>Investment by Project</Typography>
                  <Box sx={{ height: 220 }}>
                    <Bar data={projectBarData} options={{
                      responsive: true, maintainAspectRatio: false,
                      plugins: { legend: { display: false } },
                      scales: {
                        y: { beginAtZero: true, ticks: { callback: (v) => `${(Number(v) / 1000).toFixed(0)}K`, font: { size: 10 } }, grid: { color: '#f3f4f6' } },
                        x: { ticks: { font: { size: 10 } }, grid: { display: false } },
                      },
                    }} />
                  </Box>
                </Box>
                <Box sx={{ bgcolor: '#fff', border: '1px solid #e5e7eb', borderRadius: 2.5, p: 2.5 }}>
                  <Typography sx={{ fontWeight: 700, fontSize: 14, color: '#0a1940', mb: 2 }}>By Investment Type</Typography>
                  <Box sx={{ maxWidth: 200, mx: 'auto' }}>
                    <Doughnut data={typeChartData} options={{
                      responsive: true, maintainAspectRatio: true, cutout: '65%',
                      plugins: { legend: { position: 'bottom', labels: { font: { size: 11 }, padding: 12, usePointStyle: true, pointStyle: 'circle' } } },
                    }} />
                  </Box>
                </Box>
              </Box>
            )
          })()}

          {/* List */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography sx={{ fontWeight: 700, fontSize: 16, color: '#0a1940' }}>Investment History</Typography>
            <Typography sx={{ fontSize: 13, color: '#9ca3af' }}>{investments.length} investment{investments.length !== 1 ? 's' : ''}</Typography>
          </Box>

          {loading ? (
            <Box sx={{ py: 8, textAlign: 'center', color: '#9ca3af' }}><Typography>Loading…</Typography></Box>
          ) : investments.length === 0 ? (
            <Box sx={{ bgcolor: '#fff', border: '2px dashed #e5e7eb', borderRadius: 3, textAlign: 'center', py: 10 }}>
              <AccountBalanceWalletIcon sx={{ fontSize: 52, color: '#d1d5db', mb: 2, display: 'block', mx: 'auto' }} />
              <Typography sx={{ fontWeight: 700, color: '#374151', fontSize: 18, mb: 1 }}>No investments yet</Typography>
              <Typography color="text.secondary" sx={{ mb: 3 }}>Browse available projects and make your first investment.</Typography>
              <Box onClick={() => router.push('/user/projects')}
                sx={{ display: 'inline-flex', bgcolor: '#111', color: '#fff', px: 3, py: 1.2, borderRadius: 2, fontWeight: 700, fontSize: 14, cursor: 'pointer', '&:hover': { bgcolor: '#000' } }}>
                Explore Projects
              </Box>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              {investments.map(inv => <InvestmentCard key={inv._id} inv={inv} user={user} />)}
            </Box>
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
