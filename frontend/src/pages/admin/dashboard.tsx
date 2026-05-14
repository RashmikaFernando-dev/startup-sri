import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import type { Project } from '@/redux/slices/projectSlice'
import { Box, Typography, Button, Alert, Snackbar, LinearProgress, Chip } from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CancelIcon from '@mui/icons-material/Cancel'
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch'
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty'
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet'
import PeopleIcon from '@mui/icons-material/People'
import AdminNavbar from '@/components/admin/AdminNavbar'
import AdminSidebar from '@/components/admin/AdminSidebar'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import { MonthlyInvestmentChart, CategoryBreakdownChart, ProjectStatusChart, FundingTypeChart } from '@/components/admin/ProjectFundingChart'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'


const CONTENT_LEFT = 240

export default function AdminDashboard() {
  const router = useRouter()
  const [admin, setAdmin] = useState<any>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [toast, setToast] = useState<{ open: boolean; msg: string; type: 'success' | 'error' }>({ open: false, msg: '', type: 'success' })
  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; title: string; body: string; onConfirm: () => void }>({ open: false, title: '', body: '', onConfirm: () => {} })
  const [analytics, setAnalytics] = useState<any>(null)

  useEffect(() => {
    const stored = localStorage.getItem('adminUser')
    const token = localStorage.getItem('adminToken')
    if (!stored || !token) { router.push('/admin/login'); return }
    const u = JSON.parse(stored)
    if (u.role !== 'admin') { router.push('/admin/login'); return }
    setAdmin(u)
  }, [])

  useEffect(() => {
    if (!admin) return
    fetchProjects()
    fetchAnalytics()
  }, [admin])

  const fetchAnalytics = async () => {
    try {
      const res = await fetch(`${API_BASE}/stats/admin`, { headers: { Authorization: `Bearer ${token()}` } })
      const data = await res.json()
      if (data.success) setAnalytics(data.data)
    } catch {}
  }

  const token = () => localStorage.getItem('adminToken')

  const fetchProjects = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/projects`, { headers: { Authorization: `Bearer ${token()}` } })
      const data = await res.json()
      if (data.success) setProjects(data.data)
    } catch {}
  }

  const updateProjectStatus = async (id: string, status: Project['status']) => {
    try {
      const res = await fetch(`${API_BASE}/admin/projects/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify({ status }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      setProjects(prev => prev.map(p => p._id === id ? { ...p, status } : p))
      setToast({ open: true, msg: `Project ${status} successfully.`, type: 'success' })
    } catch (e: any) {
      setToast({ open: true, msg: e.message || 'Update failed.', type: 'error' })
    }
  }

  const confirm = (title: string, body: string, onConfirm: () => void) =>
    setConfirmDialog({ open: true, title, body, onConfirm })

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminUser')
    router.push('/admin/login')
  }

  const fmt = (n: number) => `LKR ${n.toLocaleString()}`

  const totalProjects = projects.length
  const pendingProjects = projects.filter(p => p.status === 'pending').length
  const approvedProjects = projects.filter(p => p.status === 'approved' || p.status === 'active').length
  const totalFunding = projects.reduce((s, p) => s + (p.currentFunding || 0), 0)

  const totalUsers = analytics ? Object.values(analytics.usersByRole as Record<string, number>).reduce((s: number, v: number) => s + v, 0) : 0

  const statCards = [
    {
      label: 'Total Projects',
      value: totalProjects,
      icon: <RocketLaunchIcon sx={{ fontSize: 22, color: '#6366f1' }} />,
      iconBg: '#ede9fe',
    },
    {
      label: 'Pending Review',
      value: pendingProjects,
      icon: <HourglassEmptyIcon sx={{ fontSize: 22, color: '#f59e0b' }} />,
      iconBg: '#fef3c7',
    },
    {
      label: 'Total Users',
      value: totalUsers,
      icon: <PeopleIcon sx={{ fontSize: 22, color: '#10b981' }} />,
      iconBg: '#d1fae5',
    },
    {
      label: 'Total Invested',
      value: analytics ? fmt(analytics.totalInvested) : fmt(totalFunding),
      icon: <AccountBalanceWalletIcon sx={{ fontSize: 22, color: '#3b82f6' }} />,
      iconBg: '#dbeafe',
    },
  ]

  const STATUS_COLORS: Record<string, { bg: string; text: string; label: string }> = {
    pending:   { bg: '#fef3c7', text: '#92400e', label: 'Pending' },
    approved:  { bg: '#d1fae5', text: '#065f46', label: 'Approved' },
    rejected:  { bg: '#fee2e2', text: '#991b1b', label: 'Rejected' },
    active:    { bg: '#dbeafe', text: '#1e40af', label: 'Active' },
    funded:    { bg: '#ede9fe', text: '#5b21b6', label: 'Funded' },
    completed: { bg: '#f3f4f6', text: '#374151', label: 'Completed' },
  }

  return (
    <>
      <Head><title>Dashboard – Admin | StartupSri</title></Head>

      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f9fafb' }}>
        <AdminSidebar activeKey="overview" />

        <Box sx={{ flex: 1, ml: { xs: 0, md: `${CONTENT_LEFT}px` }, display: 'flex', flexDirection: 'column' }}>
          <AdminNavbar
            admin={admin}
            onLogout={handleLogout}
            pageTitle="Dashboard"
            pageSubtitle={`Welcome back, ${admin?.firstName ?? 'Admin'}. Here's what's happening.`}
          />

          {/* Page content */}
          <Box sx={{ flex: 1, px: { xs: 2, md: 4 }, pt: '80px', pb: 6 }}>

            {/* Stat cards */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 2.5, mb: 4, mt: 3 }}>
              {statCards.map(card => (
                <Box key={card.label} sx={{
                  bgcolor: '#fff', borderRadius: 2.5, border: '1px solid #e5e7eb',
                  p: 3, display: 'flex', flexDirection: 'column', gap: 1.5,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography sx={{ fontSize: 13, color: '#6b7280', fontWeight: 600 }}>{card.label}</Typography>
                    <Box sx={{ width: 38, height: 38, borderRadius: 2, bgcolor: card.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {card.icon}
                    </Box>
                  </Box>
                  <Typography sx={{ fontSize: 28, fontWeight: 800, color: '#111827', lineHeight: 1 }}>{card.value}</Typography>
                </Box>
              ))}
            </Box>

            {/* Analytics Charts */}
            {analytics && (
              <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2.5, mb: 2.5 }}>
                  <MonthlyInvestmentChart data={analytics.monthlyInvestments || []} />
                  <CategoryBreakdownChart data={analytics.categoryBreakdown || []} />
                </Box>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2.5 }}>
                  <ProjectStatusChart data={analytics.statusBreakdown || []} />
                  <FundingTypeChart data={analytics.fundingTypeBreakdown || []} />
                </Box>
              </Box>
            )}

            {/* Pending Approvals */}
            <Box sx={{ bgcolor: '#fff', borderRadius: 2.5, border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <Box sx={{ px: 3, py: 2.5, borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography sx={{ fontWeight: 700, fontSize: 16, color: '#111827' }}>Pending Approvals</Typography>
                  <Typography sx={{ fontSize: 13, color: '#9ca3af', mt: 0.3 }}>Projects awaiting your review</Typography>
                </Box>
                {pendingProjects > 0 && (
                  <Box sx={{ bgcolor: '#fef3c7', color: '#92400e', fontWeight: 700, fontSize: 12, px: 1.5, py: 0.4, borderRadius: 10 }}>
                    {pendingProjects} pending
                  </Box>
                )}
              </Box>

              {projects.filter(p => p.status === 'pending').length === 0 ? (
                <Box sx={{ py: 6, textAlign: 'center', color: '#9ca3af' }}>
                  <CheckCircleIcon sx={{ fontSize: 40, color: '#d1fae5', mb: 1, display: 'block', mx: 'auto' }} />
                  <Typography sx={{ fontSize: 14 }}>No pending projects — all caught up!</Typography>
                </Box>
              ) : (
                <Box>
                  {projects.filter(p => p.status === 'pending').slice(0, 6).map((p, idx, arr) => {
                    const progress = Math.min(Math.round(((p.currentFunding || 0) / p.fundingGoal) * 100), 100)
                    return (
                      <Box key={p._id} sx={{
                        px: 3, py: 2.5,
                        borderBottom: idx < arr.length - 1 ? '1px solid #f3f4f6' : 'none',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        flexWrap: 'wrap', gap: 2,
                        '&:hover': { bgcolor: '#fafafa' },
                        transition: 'background 0.15s',
                      }}>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
                            <Typography sx={{ fontWeight: 700, color: '#111827', fontSize: 14 }}>{p.title}</Typography>
                            <Box sx={{
                              bgcolor: STATUS_COLORS[p.status]?.bg,
                              color: STATUS_COLORS[p.status]?.text,
                              fontSize: 11, fontWeight: 700, px: 1.2, py: 0.3, borderRadius: 10,
                            }}>
                              {STATUS_COLORS[p.status]?.label}
                            </Box>
                          </Box>
                          <Typography sx={{ fontSize: 12, color: '#9ca3af', mb: 1 }}>
                            {p.entrepreneur?.email} · {p.category} · Goal: {fmt(p.fundingGoal)}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LinearProgress
                              variant="determinate"
                              value={progress}
                              sx={{ flex: 1, height: 5, borderRadius: 3, bgcolor: '#f3f4f6', '& .MuiLinearProgress-bar': { bgcolor: '#111827' } }}
                            />
                            <Typography sx={{ fontSize: 12, fontWeight: 700, color: '#6b7280', minWidth: 36 }}>{progress}%</Typography>
                          </Box>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1, flexShrink: 0 }}>
                          <Button
                            size="small"
                            variant="contained"
                            startIcon={<CheckCircleIcon sx={{ fontSize: 15 }} />}
                            onClick={() => confirm('Approve Project', `Approve "${p.title}"?`, () => updateProjectStatus(p._id, 'approved'))}
                            sx={{ bgcolor: '#111827', borderRadius: 1.5, textTransform: 'none', fontWeight: 700, fontSize: 13, '&:hover': { bgcolor: '#1f2937' } }}
                          >
                            Approve
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<CancelIcon sx={{ fontSize: 15 }} />}
                            onClick={() => confirm('Reject Project', `Reject "${p.title}"?`, () => updateProjectStatus(p._id, 'rejected'))}
                            sx={{ borderRadius: 1.5, textTransform: 'none', borderColor: '#e5e7eb', color: '#ef4444', '&:hover': { borderColor: '#ef4444', bgcolor: '#fef2f2' } }}
                          >
                            Reject
                          </Button>
                        </Box>
                      </Box>
                    )
                  })}
                </Box>
              )}
            </Box>

            {/* Recent Projects summary */}
            <Box sx={{ bgcolor: '#fff', borderRadius: 2.5, border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', mt: 3 }}>
              <Box sx={{ px: 3, py: 2.5, borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography sx={{ fontWeight: 700, fontSize: 16, color: '#111827' }}>All Projects</Typography>
                <Button
                  size="small"
                  onClick={() => router.push('/admin/projects')}
                  sx={{ textTransform: 'none', fontSize: 13, color: '#6b7280', '&:hover': { color: '#111827' } }}
                >
                  View all →
                </Button>
              </Box>
              <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse' }}>
                <Box component="thead">
                  <Box component="tr" sx={{ bgcolor: '#f9fafb' }}>
                    {['Project', 'Category', 'Funding Type', 'Progress', 'Status'].map(h => (
                      <Box component="th" key={h} sx={{ px: 3, py: 1.5, textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {h}
                      </Box>
                    ))}
                  </Box>
                </Box>
                <Box component="tbody">
                  {projects.slice(0, 5).map((p, idx, arr) => {
                    const progress = Math.min(Math.round(((p.currentFunding || 0) / p.fundingGoal) * 100), 100)
                    const sc = STATUS_COLORS[p.status] ?? { bg: '#f3f4f6', text: '#374151', label: p.status }
                    return (
                      <Box component="tr" key={p._id} sx={{
                        borderBottom: idx < arr.length - 1 ? '1px solid #f3f4f6' : 'none',
                        '&:hover': { bgcolor: '#fafafa' },
                      }}>
                        <Box component="td" sx={{ px: 3, py: 2 }}>
                          <Typography sx={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>{p.title}</Typography>
                          <Typography sx={{ fontSize: 12, color: '#9ca3af' }}>{p.entrepreneur?.email}</Typography>
                        </Box>
                        <Box component="td" sx={{ px: 3, py: 2, fontSize: 13, color: '#374151' }}>{p.category}</Box>
                        <Box component="td" sx={{ px: 3, py: 2, fontSize: 13, color: '#374151', textTransform: 'capitalize' }}>{p.fundingType}</Box>
                        <Box component="td" sx={{ px: 3, py: 2, minWidth: 120 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LinearProgress
                              variant="determinate"
                              value={progress}
                              sx={{ flex: 1, height: 5, borderRadius: 3, bgcolor: '#f3f4f6', '& .MuiLinearProgress-bar': { bgcolor: '#111827' } }}
                            />
                            <Typography sx={{ fontSize: 12, fontWeight: 700, color: '#6b7280' }}>{progress}%</Typography>
                          </Box>
                        </Box>
                        <Box component="td" sx={{ px: 3, py: 2 }}>
                          <Box sx={{ display: 'inline-flex', bgcolor: sc.bg, color: sc.text, fontSize: 12, fontWeight: 700, px: 1.5, py: 0.4, borderRadius: 10 }}>
                            {sc.label}
                          </Box>
                        </Box>
                      </Box>
                    )
                  })}
                </Box>
              </Box>
            </Box>

          </Box>
        </Box>
      </Box>

      <ConfirmDialog
        open={confirmDialog.open}
        title={confirmDialog.title}
        body={confirmDialog.body}
        onConfirm={confirmDialog.onConfirm}
        onClose={() => setConfirmDialog(d => ({ ...d, open: false }))}
      />

      <Snackbar open={toast.open} autoHideDuration={3500} onClose={() => setToast(t => ({ ...t, open: false }))} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert severity={toast.type} variant="filled" sx={{ width: '100%' }}>{toast.msg}</Alert>
      </Snackbar>
    </>
  )
}
