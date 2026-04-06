import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useAppDispatch, useAppSelector } from '@/hooks/useTypedSelector'
import { logout } from '@/redux/slices/authSlice'
import {
  fetchProjectsStart,
  fetchProjectsSuccess,
  fetchProjectsFailure,
  removeProject,
} from '@/redux/slices/projectSlice'
import {
  Box,
  Typography,
  Button,
  Chip,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
} from '@mui/material'
import Footer from '../../components/layout/Footer'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import AddIcon from '@mui/icons-material/Add'
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import AccountBalanceIcon from '@mui/icons-material/AccountBalance'
import PaymentsIcon from '@mui/icons-material/Payments'
import UserNavbar from '@/components/user/UserNavbar'
import EntrepreneurSidebar from '@/components/user/EntrepreneurSidebar'

const STATUS_COLOR: Record<string, 'default' | 'warning' | 'success' | 'error' | 'info' | 'primary'> = {
  pending: 'warning',
  approved: 'success',
  rejected: 'error',
  funded: 'primary',
  active: 'success',
  completed: 'info',
}

export default function Dashboard() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const user = useAppSelector((s) => s.auth.user)
  const token = useAppSelector((s) => s.auth.token)
  const projects = useAppSelector((s) => s.project.projects)
  const loading = useAppSelector((s) => s.project.loading)
  const [activeTab, setActiveTab] = useState('listings')
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [toast, setToast] = useState<{ open: boolean; msg: string; type: 'success' | 'error' }>({
    open: false, msg: '', type: 'success',
  })

  // Delete confirm dialog
  const [deleteId, setDeleteId] = useState<string | null>(null)

  // Repayments tab
  const [repayments, setRepayments] = useState<any[]>([])
  const [repaymentsLoading, setRepaymentsLoading] = useState(false)

  useEffect(() => {
    const storedToken = localStorage.getItem('token')
    if (!storedToken) { router.push('/auth/login'); return }
    // Load profile image (kept in localStorage keyed by user id)
    const userStr = localStorage.getItem('user')
    if (userStr) {
      try {
        const parsed = JSON.parse(userStr)
        const img = localStorage.getItem(`profileImage_${parsed.id}`)
        if (img) setProfileImage(img)
      } catch {}
    }
  }, [])

  // Fetch my projects 
  useEffect(() => {
    if (!user) return
    fetchProjects()
  }, [user])

  const fetchProjects = async () => {
    dispatch(fetchProjectsStart())
    try {
      const authToken = token || localStorage.getItem('token')
      const res = await fetch('http://localhost:5000/api/projects', {
        headers: { Authorization: `Bearer ${authToken}` },
      })
      const data = await res.json()
      if (data.success) {
        // Filter only own projects
        const mine = data.data.filter(
          (p: any) => p.entrepreneur?._id === user?.id || p.entrepreneur === user?.id
        )
        dispatch(fetchProjectsSuccess(mine))
      } else {
        dispatch(fetchProjectsFailure('Failed to load projects'))
      }
    } catch (err: any) {
      dispatch(fetchProjectsFailure(err.message || 'Failed to load projects'))
    }
  }

  const fetchRepayments = async () => {
    setRepaymentsLoading(true)
    try {
      const authToken = token || localStorage.getItem('token')
      const res = await fetch('http://localhost:5000/api/investments/entrepreneur', {
        headers: { Authorization: `Bearer ${authToken}` },
      })
      const data = await res.json()
      if (data.success) setRepayments(data.data)
    } catch {}
    finally { setRepaymentsLoading(false) }
  }

  const markPaid = async (investmentId: string, index: number) => {
    try {
      const authToken = token || localStorage.getItem('token')
      const res = await fetch(`http://localhost:5000/api/investments/${investmentId}/repayment/${index}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${authToken}` },
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      setToast({ open: true, msg: 'Instalment marked as paid.', type: 'success' })
      fetchRepayments()
    } catch (e: any) {
      setToast({ open: true, msg: e.message || 'Failed to update.', type: 'error' })
    }
  }

  // Delete project
  const handleDelete = async () => {
    if (!deleteId) return
    try {
      const authToken = token || localStorage.getItem('token')
      const res = await fetch(`http://localhost:5000/api/projects/${deleteId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${authToken}` },
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      dispatch(removeProject(deleteId))
      setToast({ open: true, msg: 'Project deleted.', type: 'success' })
    } catch (e: any) {
      setToast({ open: true, msg: e.message || 'Delete failed.', type: 'error' })
    } finally {
      setDeleteId(null)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    dispatch(logout())
    router.push('/')
  }


  const handleSidebarClick = (key: string) => {
    if (key === 'apply') { router.push('/user/submit-project'); return }
    if (key === 'profile' || key === 'settings') { router.push('/user/profile'); return }
    if (key === 'repayments') fetchRepayments()
    setActiveTab(key)
  }

  
  const pct = (p: { currentFunding: number; fundingGoal: number }) =>
    Math.min(Math.round((p.currentFunding / p.fundingGoal) * 100), 100)
  const fmt = (n: number) => `LKR ${n.toLocaleString()}`

  return (
    <>
      <Head>
        <title>Dashboard – StartupSri</title>
      </Head>

      <Box sx={{ minHeight: '100vh', bgcolor: '#f7f8fa', display: 'flex', flexDirection: 'column' }}>

        <UserNavbar user={user} profileImage={profileImage} onLogout={handleLogout} />

        {/* ── Body ── */}
        <Box sx={{ flex: 1, display: 'flex', maxWidth: 1100, mx: 'auto', width: '100%', px: { xs: 2, md: 4 }, py: 4, gap: 3 }}>

          <EntrepreneurSidebar active={activeTab} onItemClick={handleSidebarClick} />

          {/* ── Main Content ── */}
          <Box sx={{ flex: 1, minWidth: 0 }}>

            {/* ── MY LISTINGS tab ── */}
            {activeTab === 'listings' && (
              <Box>
                {/* ── Analytics stats row ── */}
                {projects.length > 0 && (() => {
                  const totalRaised    = projects.reduce((s, p) => s + (p.currentFunding || 0), 0)
                  const totalGoal      = projects.reduce((s, p) => s + p.fundingGoal, 0)
                  const approvedCount  = projects.filter(p => ['approved', 'active', 'funded'].includes(p.status)).length
                  const pendingCount   = projects.filter(p => p.status === 'pending').length
                  const overallPct     = totalGoal > 0 ? Math.min(Math.round((totalRaised / totalGoal) * 100), 100) : 0

                  const stats = [
                    { label: 'Total Projects',   value: projects.length,      icon: <RocketLaunchIcon sx={{ fontSize: 20, color: '#6366f1' }} />, iconBg: '#ede9fe' },
                    { label: 'Total Raised',     value: fmt(totalRaised),     icon: <AccountBalanceWalletIcon sx={{ fontSize: 20, color: '#3b82f6' }} />, iconBg: '#dbeafe' },
                    { label: 'Approved / Active',value: approvedCount,        icon: <CheckCircleIcon sx={{ fontSize: 20, color: '#10b981' }} />, iconBg: '#d1fae5' },
                    { label: 'Pending Review',   value: pendingCount,         icon: <HourglassEmptyIcon sx={{ fontSize: 20, color: '#f59e0b' }} />, iconBg: '#fef3c7' },
                  ]

                  return (
                    <Box sx={{ mb: 3 }}>
                      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4,1fr)' }, gap: 2, mb: 2.5 }}>
                        {stats.map(s => (
                          <Box key={s.label} sx={{ bgcolor: '#fff', border: '1px solid #e5e7eb', borderRadius: 2.5, p: 2.5 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                              <Typography sx={{ fontSize: 12, color: '#6b7280', fontWeight: 600 }}>{s.label}</Typography>
                              <Box sx={{ width: 32, height: 32, borderRadius: 1.5, bgcolor: s.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {s.icon}
                              </Box>
                            </Box>
                            <Typography sx={{ fontWeight: 800, fontSize: 22, color: '#0a1940' }}>{s.value}</Typography>
                          </Box>
                        ))}
                      </Box>

                      {/* Overall funding progress */}
                      <Box sx={{ bgcolor: '#fff', border: '1px solid #e5e7eb', borderRadius: 2.5, p: 2.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <TrendingUpIcon sx={{ fontSize: 18, color: '#0a1940' }} />
                            <Typography sx={{ fontWeight: 700, fontSize: 14, color: '#0a1940' }}>Overall Funding Progress</Typography>
                          </Box>
                          <Typography sx={{ fontWeight: 800, fontSize: 14, color: '#0a1940' }}>{overallPct}%</Typography>
                        </Box>
                        <LinearProgress variant="determinate" value={overallPct}
                          sx={{ height: 8, borderRadius: 4, bgcolor: '#f3f4f6', '& .MuiLinearProgress-bar': { bgcolor: '#0a1940' } }} />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                          <Typography sx={{ fontSize: 12, color: '#6b7280' }}>{fmt(totalRaised)} raised</Typography>
                          <Typography sx={{ fontSize: 12, color: '#6b7280' }}>Goal: {fmt(totalGoal)}</Typography>
                        </Box>
                      </Box>
                    </Box>
                  )
                })()}

                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 800, color: '#0a1940' }}>My Listings</Typography>
                    <Typography variant="body2" color="text.secondary">View and manage your startup listings</Typography>
                  </Box>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => router.push('/user/submit-project')}
                    sx={{ bgcolor: '#111111', borderRadius: 2, textTransform: 'none', fontWeight: 700, '&:hover': { bgcolor: '#000000' } }}
                  >
                    New Listing
                  </Button>
                </Box>

                {loading ? (
                  <Box sx={{ textAlign: 'center', py: 6, color: '#9ca3af' }}>Loading...</Box>
                ) : projects.length === 0 ? (
                  <Box sx={{
                    bgcolor: '#fff', border: '2px dashed #e5e7eb', borderRadius: 3,
                    textAlign: 'center', py: 8, px: 4,
                  }}>
                    <RocketLaunchIcon sx={{ fontSize: 48, color: '#d1d5db', mb: 2 }} />
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#374151', mb: 1 }}>No listings yet</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      Submit your startup to start raising funds.
                    </Typography>
                    <Button
                      variant="contained"
                      onClick={() => router.push('/user/submit-project')}
                      sx={{ bgcolor: '#111111', borderRadius: 2, textTransform: 'none', fontWeight: 700, '&:hover': { bgcolor: '#000000' } }}
                    >
                      Apply to Raise
                    </Button>
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {projects.map(project => (
                      <Box key={project._id} sx={{
                        bgcolor: '#fff', border: '1px solid #e5e7eb', borderRadius: 3, p: 3,
                        '&:hover': { boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }, transition: 'box-shadow 0.2s',
                      }}>
                        {/* Header row */}
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1.5 }}>
                          <Box>
                            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0a1940', mb: 0.3 }}>
                              {project.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{
                              display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                            }}>
                              {project.description}
                            </Typography>
                          </Box>
                          <Chip
                            label={project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                            color={STATUS_COLOR[project.status]}
                            size="small"
                            sx={{ fontWeight: 700, ml: 2, flexShrink: 0 }}
                          />
                        </Box>

                        {/* Stats row */}
                        <Box sx={{ display: 'flex', gap: 4, my: 2, flexWrap: 'wrap' }}>
                          <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 700, letterSpacing: 0.5 }}>
                              Funding Goal
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 800, color: '#0a1940' }}>
                              {fmt(project.fundingGoal)}
                            </Typography>
                          </Box>
                          {project.fundingType === 'equity' && project.equityOffered != null && (
                            <Box>
                              <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 700, letterSpacing: 0.5 }}>
                                Equity
                              </Typography>
                              <Typography variant="body1" sx={{ fontWeight: 800, color: '#0a1940' }}>
                                {project.equityOffered}%
                              </Typography>
                            </Box>
                          )}
                          {project.fundingType === 'microloan' && project.interestRate != null && (
                            <Box>
                              <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 700, letterSpacing: 0.5 }}>
                                Interest Rate
                              </Typography>
                              <Typography variant="body1" sx={{ fontWeight: 800, color: '#0a1940' }}>
                                {project.interestRate}%
                              </Typography>
                            </Box>
                          )}
                          <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 700, letterSpacing: 0.5 }}>
                              Raised
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 800, color: '#2e7d32' }}>
                              {fmt(project.currentFunding)}
                            </Typography>
                          </Box>
                        </Box>

                        {/* Progress bar */}
                        <Box sx={{ mb: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="caption" color="text.secondary">Progress</Typography>
                            <Typography variant="caption" sx={{ fontWeight: 700, color: '#0a1940' }}>{pct(project)}%</Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={pct(project)}
                            sx={{ height: 6, borderRadius: 3, bgcolor: '#f3f4f6', '& .MuiLinearProgress-bar': { bgcolor: '#0a1940' } }}
                          />
                        </Box>

                        {/* Meta + Actions */}
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#6b7280' }}>
                              <CalendarTodayIcon sx={{ fontSize: 14 }} />
                              <Typography variant="caption">
                                {new Date(project.createdAt).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}
                              </Typography>
                            </Box>
                            <Chip label={project.category} size="small" variant="outlined" sx={{ fontSize: 11 }} />
                            <Chip
                              label={project.fundingType === 'equity' ? 'Equity' : 'Microloan'}
                              size="small"
                              sx={{ fontSize: 11, bgcolor: project.fundingType === 'equity' ? '#ede9fe' : '#dbeafe', color: project.fundingType === 'equity' ? '#7c3aed' : '#1d4ed8', border: 'none' }}
                            />
                          </Box>
                          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'nowrap', flexShrink: 0 }}>
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<EditIcon />}
                              sx={{
                                borderRadius: 2,
                                textTransform: 'none',
                                borderColor: '#111111',
                                color: '#111111',
                                '&:hover': { borderColor: '#000000', bgcolor: 'rgba(0,0,0,0.04)' },
                                whiteSpace: 'nowrap',
                              }}
                            >
                              Edit
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<DeleteIcon />}
                              onClick={() => setDeleteId(project._id)}
                              sx={{
                                borderRadius: 2,
                                textTransform: 'none',
                                borderColor: '#111111',
                                color: '#111111',
                                '&:hover': { borderColor: '#000000', bgcolor: 'rgba(0,0,0,0.04)' },
                                whiteSpace: 'nowrap',
                              }}
                            >
                              Delete
                            </Button>
                          </Box>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
            )}


            {/* ── REPAYMENTS tab ── */}
            {activeTab === 'repayments' && (
              <Box>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: '#0a1940' }}>Repayments</Typography>
                  <Typography variant="body2" color="text.secondary">Microloan instalments owed to your investors</Typography>
                </Box>

                {repaymentsLoading ? (
                  <Box sx={{ textAlign: 'center', py: 6, color: '#9ca3af' }}>Loading...</Box>
                ) : repayments.length === 0 ? (
                  <Box sx={{ bgcolor: '#fff', border: '2px dashed #e5e7eb', borderRadius: 3, textAlign: 'center', py: 8 }}>
                    <AccountBalanceIcon sx={{ fontSize: 48, color: '#d1d5db', mb: 2 }} />
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#374151' }}>No repayments yet</Typography>
                    <Typography variant="body2" color="text.secondary">Microloan repayment schedules will appear here once investors fund your projects.</Typography>
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {repayments.map((inv: any) => {
                      const paid   = inv.repaymentSchedule.filter((r: any) => r.status === 'paid').length
                      const total  = inv.repaymentSchedule.length
                      const overdue = inv.repaymentSchedule.filter((r: any) => r.status !== 'paid' && new Date(r.dueDate) < new Date()).length

                      return (
                        <Box key={inv._id} sx={{ bgcolor: '#fff', border: '1px solid #e5e7eb', borderRadius: 3, p: 3 }}>
                          {/* Header */}
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                            <Box>
                              <Typography sx={{ fontWeight: 800, color: '#0a1940' }}>{inv.project?.title}</Typography>
                              <Typography variant="body2" color="text.secondary">
                                Investor: {inv.investor?.firstName} {inv.investor?.lastName} · LKR {inv.amount?.toLocaleString()} borrowed
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <Box sx={{ px: 1.5, py: 0.4, borderRadius: 1.5, bgcolor: '#d1fae5' }}>
                                <Typography sx={{ fontSize: 11, fontWeight: 800, color: '#065f46' }}>{paid}/{total} paid</Typography>
                              </Box>
                              {overdue > 0 && (
                                <Box sx={{ px: 1.5, py: 0.4, borderRadius: 1.5, bgcolor: '#fee2e2' }}>
                                  <Typography sx={{ fontSize: 11, fontWeight: 800, color: '#991b1b' }}>{overdue} overdue</Typography>
                                </Box>
                              )}
                            </Box>
                          </Box>

                          {/* Instalment table */}
                          <Box sx={{ border: '1px solid #e5e7eb', borderRadius: 2, overflow: 'hidden' }}>
                            {inv.repaymentSchedule.map((r: any, i: number) => {
                              const isOverdue = r.status !== 'paid' && new Date(r.dueDate) < new Date()
                              const statusColor = r.status === 'paid' ? { bg: '#d1fae5', color: '#065f46' }
                                : isOverdue ? { bg: '#fee2e2', color: '#991b1b' }
                                : { bg: '#fef3c7', color: '#92400e' }

                              return (
                                <Box key={i} sx={{
                                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                  px: 2, py: 1.5, bgcolor: i % 2 === 0 ? '#fff' : '#f9fafb',
                                  borderBottom: i < inv.repaymentSchedule.length - 1 ? '1px solid #e5e7eb' : 'none',
                                  flexWrap: 'wrap', gap: 1,
                                }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Typography sx={{ fontSize: 12, color: '#6b7280', minWidth: 24 }}>#{i + 1}</Typography>
                                    <Box>
                                      <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#0a1940' }}>
                                        LKR {r.amount?.toLocaleString()}
                                      </Typography>
                                      <Typography sx={{ fontSize: 11, color: '#6b7280' }}>
                                        Due: {new Date(r.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        {r.paidDate && ` · Paid: ${new Date(r.paidDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`}
                                      </Typography>
                                    </Box>
                                  </Box>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <Box sx={{ px: 1.2, py: 0.3, borderRadius: 1.5, bgcolor: statusColor.bg }}>
                                      <Typography sx={{ fontSize: 11, fontWeight: 800, color: statusColor.color }}>
                                        {r.status === 'paid' ? 'Paid' : isOverdue ? 'Overdue' : 'Pending'}
                                      </Typography>
                                    </Box>
                                    {r.status !== 'paid' && (
                                      <Button size="small" variant="contained" startIcon={<PaymentsIcon sx={{ fontSize: 14 }} />}
                                        onClick={() => markPaid(inv._id, i)}
                                        sx={{ fontSize: 11, textTransform: 'none', borderRadius: 2, py: 0.5,
                                          bgcolor: '#0a1940', '&:hover': { bgcolor: '#000' } }}>
                                        Mark Paid
                                      </Button>
                                    )}
                                  </Box>
                                </Box>
                              )
                            })}
                          </Box>
                        </Box>
                      )
                    })}
                  </Box>
                )}
              </Box>
            )}

          </Box>
        </Box>

        <Footer />
      </Box>

      {/* ── Delete Confirm Dialog ── */}
      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)} PaperProps={{ sx: { borderRadius: 3, p: 1 } }}>
        <DialogTitle sx={{ fontWeight: 800, color: '#dc2626' }}>Delete Listing?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            This action cannot be undone. The project will be permanently removed.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteId(null)} sx={{ textTransform: 'none', color: '#111111' }}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleDelete}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 700,
              bgcolor: '#111111',
              '&:hover': { bgcolor: '#000000' },
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Toast ── */}
      <Snackbar open={toast.open} autoHideDuration={3500} onClose={() => setToast(t => ({ ...t, open: false }))} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert severity={toast.type} variant="filled" sx={{ width: '100%' }}>{toast.msg}</Alert>
      </Snackbar>
    </>
  )
}
