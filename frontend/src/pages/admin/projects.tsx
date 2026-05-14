import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import type { Project } from '@/redux/slices/projectSlice'
import {
  Box, Typography, Button, TextField, InputAdornment,
  Select, MenuItem, FormControl, InputLabel, Alert, Snackbar, LinearProgress,
  Drawer, Divider, IconButton, Chip,
} from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CancelIcon from '@mui/icons-material/Cancel'
import SearchIcon from '@mui/icons-material/Search'
import CloseIcon from '@mui/icons-material/Close'
import VisibilityIcon from '@mui/icons-material/Visibility'
import DescriptionIcon from '@mui/icons-material/Description'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import AdminNavbar from '@/components/admin/AdminNavbar'
import AdminSidebar from '@/components/admin/AdminSidebar'
import ConfirmDialog from '@/components/ui/ConfirmDialog'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'


const CONTENT_LEFT = 240

const STATUS_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  pending:   { bg: '#fef3c7', text: '#92400e', label: 'Pending' },
  approved:  { bg: '#d1fae5', text: '#065f46', label: 'Approved' },
  rejected:  { bg: '#fee2e2', text: '#991b1b', label: 'Rejected' },
  active:    { bg: '#dbeafe', text: '#1e40af', label: 'Active' },
  funded:    { bg: '#ede9fe', text: '#5b21b6', label: 'Funded' },
  completed: { bg: '#f3f4f6', text: '#374151', label: 'Completed' },
}

export default function AdminProjects() {
  const router = useRouter()
  const [admin, setAdmin] = useState<any>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [toast, setToast] = useState<{ open: boolean; msg: string; type: 'success' | 'error' }>({ open: false, msg: '', type: 'success' })
  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; title: string; body: string; onConfirm: () => void }>({ open: false, title: '', body: '', onConfirm: () => {} })
  const [justApproved, setJustApproved] = useState<Project | null>(null)
  const [selectedProject, setSelectedProject] = useState<any>(null)

  useEffect(() => {
    const stored = localStorage.getItem('adminUser')
    const tok = localStorage.getItem('adminToken')
    if (!stored || !tok) { router.push('/admin/login'); return }
    const u = JSON.parse(stored)
    if (u.role !== 'admin') { router.push('/admin/login'); return }
    setAdmin(u)
  }, [])

  useEffect(() => {
    if (!admin) return
    fetchProjects()
  }, [admin])

  const token = () => localStorage.getItem('adminToken')

  const fetchProjects = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/admin/projects`, { headers: { Authorization: `Bearer ${token()}` } })
      const data = await res.json()
      if (data.success) setProjects(data.data)
    } catch {} finally { setLoading(false) }
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
      const serverProject = data.data
      const updated = { ...projects.find(p => p._id === id)!, status, proposalId: serverProject?.proposalId, qrCode: serverProject?.qrCode }
      setProjects(prev => prev.map(p => p._id === id ? updated : p))
      setSelectedProject(null)
      if (status === 'approved') {
        setJustApproved(updated)
        setTimeout(() => setJustApproved(null), 5000)
      } else {
        setToast({ open: true, msg: `Project ${status} successfully.`, type: 'success' })
      }
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

  const filteredProjects = projects.filter(p => {
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.entrepreneur?.email?.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || p.status === statusFilter
    return matchSearch && matchStatus
  })

  return (
    <>
      <Head><title>Projects – Admin | StartupSri</title></Head>

      {/* Approval toast card */}
      {justApproved && (
        <Box sx={{
          position: 'fixed', top: 80, left: '50%', transform: 'translateX(-50%)',
          zIndex: 1400, bgcolor: '#fff', border: '1px solid #bbf7d0', borderRadius: 2.5,
          boxShadow: '0 8px 32px rgba(22,163,74,0.18)', px: 3, py: 2.5,
          display: 'flex', alignItems: 'center', gap: 2, minWidth: 320,
        }}>
          <Box sx={{ width: 40, height: 40, borderRadius: '50%', bgcolor: '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircleIcon sx={{ fontSize: 24, color: '#16a34a' }} />
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 800, color: '#111827', fontSize: 14 }}>Approved!</Typography>
            <Typography sx={{ fontSize: 12, color: '#6b7280' }}>"{justApproved.title}" is now live for investors.</Typography>
            {(justApproved as any).proposalId && (
              <Typography sx={{ fontSize: 12, color: '#1d4ed8', fontWeight: 700, fontFamily: 'monospace', mt: 0.5 }}>
                Proposal ID: {(justApproved as any).proposalId}
              </Typography>
            )}
          </Box>
        </Box>
      )}

      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f9fafb' }}>
        <AdminSidebar activeKey="projects" />

        <Box sx={{ flex: 1, ml: { xs: 0, md: `${CONTENT_LEFT}px` }, display: 'flex', flexDirection: 'column' }}>
          <AdminNavbar
            admin={admin}
            onLogout={handleLogout}
            pageTitle="Projects"
            pageSubtitle="Review, approve or reject startup listings"
          />

          <Box sx={{ flex: 1, px: { xs: 2, md: 4 }, pt: '80px', pb: 6 }}>

            {/* Filters */}
            <Box sx={{ display: 'flex', gap: 2, mt: 3, mb: 3, flexWrap: 'wrap' }}>
              <TextField
                size="small"
                placeholder="Search by title or email…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" sx={{ color: '#9ca3af' }} /></InputAdornment> }}
                sx={{ flex: 1, minWidth: 220, '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: '#fff' } }}
              />
              <FormControl size="small" sx={{ minWidth: 160 }}>
                <InputLabel>Status</InputLabel>
                <Select value={statusFilter} label="Status" onChange={e => setStatusFilter(e.target.value)} sx={{ borderRadius: 2, bgcolor: '#fff' }}>
                  <MenuItem value="all">All Statuses</MenuItem>
                  {['pending', 'approved', 'rejected', 'funded', 'active', 'completed'].map(s => (
                    <MenuItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {/* Table */}
            <Box sx={{ bgcolor: '#fff', borderRadius: 2.5, border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              {/* Table header */}
              <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse' }}>
                <Box component="thead">
                  <Box component="tr" sx={{ bgcolor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                    {['Project', 'Category', 'Type', 'Goal', 'Progress', 'Status', 'Actions'].map(h => (
                      <Box component="th" key={h} sx={{ px: 3, py: 1.8, textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
                        {h}
                      </Box>
                    ))}
                  </Box>
                </Box>

                <Box component="tbody">
                  {loading ? (
                    <Box component="tr">
                      <Box component="td" colSpan={7} sx={{ px: 3, py: 6, textAlign: 'center', color: '#9ca3af', fontSize: 14 }}>
                        Loading projects…
                      </Box>
                    </Box>
                  ) : filteredProjects.length === 0 ? (
                    <Box component="tr">
                      <Box component="td" colSpan={7} sx={{ px: 3, py: 6, textAlign: 'center', color: '#9ca3af', fontSize: 14 }}>
                        No projects found.
                      </Box>
                    </Box>
                  ) : filteredProjects.map((p, idx, arr) => {
                    const progress = Math.min(Math.round(((p.currentFunding || 0) / p.fundingGoal) * 100), 100)
                    const sc = STATUS_COLORS[p.status] ?? { bg: '#f3f4f6', text: '#374151', label: p.status }
                    return (
                      <Box component="tr" key={p._id} sx={{
                        borderBottom: idx < arr.length - 1 ? '1px solid #f3f4f6' : 'none',
                        '&:hover': { bgcolor: '#fafafa' },
                        transition: 'background 0.12s',
                      }}>
                        <Box component="td" sx={{ px: 3, py: 2.5, minWidth: 180 }}>
                          <Typography
                            sx={{ fontSize: 14, fontWeight: 700, color: '#111827', cursor: 'pointer', '&:hover': { color: '#1d4ed8', textDecoration: 'underline' } }}
                            onClick={() => setSelectedProject(p)}
                          >
                            {p.title}
                          </Typography>
                          <Typography sx={{ fontSize: 12, color: '#9ca3af' }}>{p.entrepreneur?.firstName} {p.entrepreneur?.lastName}</Typography>
                          <Typography sx={{ fontSize: 11, color: '#d1d5db' }}>{p.entrepreneur?.email}</Typography>
                        </Box>
                        <Box component="td" sx={{ px: 3, py: 2.5, fontSize: 13, color: '#374151' }}>{p.category}</Box>
                        <Box component="td" sx={{ px: 3, py: 2.5, fontSize: 13, color: '#374151', textTransform: 'capitalize' }}>{p.fundingType}</Box>
                        <Box component="td" sx={{ px: 3, py: 2.5, fontSize: 13, color: '#374151', whiteSpace: 'nowrap' }}>
                          {fmt(p.fundingGoal)}
                        </Box>
                        <Box component="td" sx={{ px: 3, py: 2.5, minWidth: 130 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LinearProgress
                              variant="determinate"
                              value={progress}
                              sx={{ flex: 1, height: 5, borderRadius: 3, bgcolor: '#f3f4f6', '& .MuiLinearProgress-bar': { bgcolor: '#111827' } }}
                            />
                            <Typography sx={{ fontSize: 12, fontWeight: 700, color: '#6b7280', minWidth: 32 }}>{progress}%</Typography>
                          </Box>
                          <Typography sx={{ fontSize: 11, color: '#9ca3af', mt: 0.5 }}>{fmt(p.currentFunding || 0)} raised</Typography>
                        </Box>
                        <Box component="td" sx={{ px: 3, py: 2.5 }}>
                          <Box sx={{ display: 'inline-flex', bgcolor: sc.bg, color: sc.text, fontSize: 12, fontWeight: 700, px: 1.5, py: 0.4, borderRadius: 10 }}>
                            {sc.label}
                          </Box>
                        </Box>
                        <Box component="td" sx={{ px: 3, py: 2.5 }}>
                          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<VisibilityIcon sx={{ fontSize: 14 }} />}
                              onClick={() => setSelectedProject(p)}
                              sx={{ borderRadius: 1.5, textTransform: 'none', fontSize: 12, fontWeight: 700, borderColor: '#e5e7eb', color: '#374151', '&:hover': { borderColor: '#111827', bgcolor: '#f9fafb' } }}
                            >
                              View
                            </Button>
                            {p.status === 'pending' && (
                              <>
                                <Button
                                  size="small"
                                  variant="contained"
                                  startIcon={<CheckCircleIcon sx={{ fontSize: 14 }} />}
                                  onClick={() => confirm('Approve Project', `Approve "${p.title}"?`, () => updateProjectStatus(p._id, 'approved'))}
                                  sx={{ bgcolor: '#111827', borderRadius: 1.5, textTransform: 'none', fontWeight: 700, fontSize: 12, '&:hover': { bgcolor: '#1f2937' } }}
                                >
                                  Approve
                                </Button>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  startIcon={<CancelIcon sx={{ fontSize: 14 }} />}
                                  onClick={() => confirm('Reject Project', `Reject "${p.title}"?`, () => updateProjectStatus(p._id, 'rejected'))}
                                  sx={{ borderRadius: 1.5, textTransform: 'none', fontSize: 12, borderColor: '#e5e7eb', color: '#ef4444', '&:hover': { borderColor: '#ef4444', bgcolor: '#fef2f2' } }}
                                >
                                  Reject
                                </Button>
                              </>
                            )}
                            {(p as any).proposalId && (
                              <Typography
                                component="a"
                                href={`/verify/${(p as any).proposalId}`}
                                target="_blank"
                                sx={{ fontSize: 11, fontWeight: 700, color: '#1d4ed8', fontFamily: 'monospace', textDecoration: 'underline', cursor: 'pointer' }}
                              >
                                {(p as any).proposalId}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </Box>
                    )
                  })}
                </Box>
              </Box>
            </Box>

            {/* Count label */}
            {!loading && (
              <Typography sx={{ mt: 2, fontSize: 13, color: '#9ca3af' }}>
                Showing {filteredProjects.length} of {projects.length} projects
              </Typography>
            )}
          </Box>
        </Box>
      </Box>

      {/* ── Project Detail Drawer ── */}
      <Drawer
        anchor="right"
        open={!!selectedProject}
        onClose={() => setSelectedProject(null)}
        PaperProps={{ sx: { width: { xs: '100%', sm: 480 }, bgcolor: '#f9fafb' } }}
      >
        {selectedProject && (() => {
          const p = selectedProject
          const sc = STATUS_COLORS[p.status] ?? { bg: '#f3f4f6', text: '#374151', label: p.status }
          const progress = Math.min(Math.round(((p.currentFunding || 0) / p.fundingGoal) * 100), 100)
          const docs = p.documents || {}
          const hasAnyDoc = docs.businessPlan || docs.budgetBreakdown || docs.businessRegCertificate
          return (
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              {/* Header */}
              <Box sx={{ px: 3, py: 2.5, bgcolor: '#fff', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontWeight: 800, fontSize: 18, color: '#0a1940' }}>{p.title}</Typography>
                  <Typography sx={{ fontSize: 13, color: '#6b7280' }}>
                    by {p.entrepreneur?.firstName} {p.entrepreneur?.lastName}
                  </Typography>
                </Box>
                <IconButton onClick={() => setSelectedProject(null)} size="small">
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>

              {/* Scrollable content */}
              <Box sx={{ flex: 1, overflow: 'auto', px: 3, py: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}>

                {/* Status + Date */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Chip label={sc.label} size="small" sx={{ bgcolor: sc.bg, color: sc.text, fontWeight: 700, fontSize: 12 }} />
                  <Typography sx={{ fontSize: 12, color: '#9ca3af' }}>
                    Submitted {new Date(p.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </Typography>
                </Box>

                {/* Proposal ID */}
                {p.proposalId && (
                  <Box sx={{ bgcolor: '#eef2ff', border: '1px solid #c7d2fe', borderRadius: 2, px: 2, py: 1.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#4338ca', fontFamily: 'monospace' }}>{p.proposalId}</Typography>
                    <Typography
                      component="a"
                      href={`/verify/${p.proposalId}`}
                      target="_blank"
                      sx={{ fontSize: 12, color: '#6366f1', display: 'flex', alignItems: 'center', gap: 0.3, '&:hover': { textDecoration: 'underline' } }}
                    >
                      Certificate <OpenInNewIcon sx={{ fontSize: 12 }} />
                    </Typography>
                  </Box>
                )}

                {/* Description */}
                <Box sx={{ bgcolor: '#fff', borderRadius: 2.5, border: '1px solid #e5e7eb', p: 2.5 }}>
                  <Typography sx={{ fontSize: 12, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', mb: 1 }}>Description</Typography>
                  <Typography sx={{ fontSize: 13, color: '#374151', lineHeight: 1.7 }}>{p.description}</Typography>
                  {p.longDescription && (
                    <Typography sx={{ fontSize: 13, color: '#6b7280', lineHeight: 1.7, mt: 1.5 }}>{p.longDescription}</Typography>
                  )}
                </Box>

                {/* Business Info */}
                {(p.businessName || p.businessType || p.businessRegNumber) && (
                  <Box sx={{ bgcolor: '#fff', borderRadius: 2.5, border: '1px solid #e5e7eb', p: 2.5 }}>
                    <Typography sx={{ fontSize: 12, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', mb: 1.5 }}>Business Information</Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {p.businessName && <DetailRow label="Business Name" value={p.businessName} />}
                      {p.businessType && <DetailRow label="Business Type" value={p.businessType} />}
                      {p.businessRegNumber && <DetailRow label="Reg. Number" value={p.businessRegNumber} />}
                    </Box>
                  </Box>
                )}

                {/* Funding Details */}
                <Box sx={{ bgcolor: '#fff', borderRadius: 2.5, border: '1px solid #e5e7eb', p: 2.5 }}>
                  <Typography sx={{ fontSize: 12, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', mb: 1.5 }}>Funding Details</Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <DetailRow label="Category" value={p.category} />
                    <DetailRow label="Funding Type" value={p.fundingType === 'equity' ? 'Equity' : 'Microloan'} />
                    <DetailRow label="Funding Goal" value={fmt(p.fundingGoal)} />
                    <DetailRow label="Current Funding" value={fmt(p.currentFunding || 0)} />
                    <Box sx={{ mt: 0.5 }}>
                      <LinearProgress variant="determinate" value={progress} sx={{ height: 6, borderRadius: 3, bgcolor: '#f3f4f6', '& .MuiLinearProgress-bar': { bgcolor: '#111827' } }} />
                      <Typography sx={{ fontSize: 11, color: '#9ca3af', mt: 0.5, textAlign: 'right' }}>{progress}% funded</Typography>
                    </Box>
                    {p.fundingType === 'microloan' ? (
                      <>
                        {p.interestRate != null && <DetailRow label="Interest Rate" value={`${p.interestRate}% p.a.`} />}
                        {p.duration != null && <DetailRow label="Duration" value={`${p.duration} months`} />}
                      </>
                    ) : (
                      p.equityOffered != null && <DetailRow label="Equity Offered" value={`${p.equityOffered}%`} />
                    )}
                  </Box>
                </Box>

                {/* Documents */}
                {hasAnyDoc && (
                  <Box sx={{ bgcolor: '#fff', borderRadius: 2.5, border: '1px solid #e5e7eb', p: 2.5 }}>
                    <Typography sx={{ fontSize: 12, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', mb: 1.5 }}>Documents</Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {docs.businessPlan && (
                        <DocLink label="Business Plan" url={docs.businessPlan} />
                      )}
                      {docs.budgetBreakdown && (
                        <DocLink label="Budget Breakdown" url={docs.budgetBreakdown} />
                      )}
                      {docs.businessRegCertificate && (
                        <DocLink label="Registration Certificate" url={docs.businessRegCertificate} />
                      )}
                    </Box>
                  </Box>
                )}

                {/* Entrepreneur Contact */}
                <Box sx={{ bgcolor: '#fff', borderRadius: 2.5, border: '1px solid #e5e7eb', p: 2.5 }}>
                  <Typography sx={{ fontSize: 12, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', mb: 1.5 }}>Entrepreneur</Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <DetailRow label="Name" value={`${p.entrepreneur?.firstName || ''} ${p.entrepreneur?.lastName || ''}`.trim() || 'N/A'} />
                    <DetailRow label="Email" value={p.entrepreneur?.email || 'N/A'} />
                  </Box>
                </Box>

                {/* QR Code */}
                {p.qrCode && (
                  <Box sx={{ bgcolor: '#fff', borderRadius: 2.5, border: '1px solid #e5e7eb', p: 2.5, textAlign: 'center' }}>
                    <Typography sx={{ fontSize: 12, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', mb: 1.5 }}>QR Code</Typography>
                    <Box component="img" src={p.qrCode} alt="QR Code" sx={{ width: 140, height: 140, mx: 'auto' }} />
                  </Box>
                )}
              </Box>

              {/* Footer actions for pending projects */}
              {p.status === 'pending' && (
                <Box sx={{ px: 3, py: 2.5, bgcolor: '#fff', borderTop: '1px solid #e5e7eb', display: 'flex', gap: 1.5 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<CheckCircleIcon />}
                    onClick={() => confirm('Approve Project', `Approve "${p.title}"?`, () => updateProjectStatus(p._id, 'approved'))}
                    sx={{ bgcolor: '#16a34a', borderRadius: 2, textTransform: 'none', fontWeight: 700, fontSize: 14, py: 1.2, '&:hover': { bgcolor: '#15803d' } }}
                  >
                    Approve
                  </Button>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<CancelIcon />}
                    onClick={() => confirm('Reject Project', `Reject "${p.title}"?`, () => updateProjectStatus(p._id, 'rejected'))}
                    sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700, fontSize: 14, py: 1.2, borderColor: '#fca5a5', color: '#dc2626', '&:hover': { borderColor: '#dc2626', bgcolor: '#fef2f2' } }}
                  >
                    Reject
                  </Button>
                </Box>
              )}
            </Box>
          )
        })()}
      </Drawer>

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

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Typography sx={{ fontSize: 13, color: '#6b7280', fontWeight: 600 }}>{label}</Typography>
      <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#111827', textAlign: 'right', maxWidth: '60%', wordBreak: 'break-word' }}>{value}</Typography>
    </Box>
  )
}

function DocLink({ label, url }: { label: string; url: string }) {
  return (
    <Box
      component="a"
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      sx={{
        display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5,
        bgcolor: '#f9fafb', borderRadius: 2, border: '1px solid #e5e7eb',
        textDecoration: 'none', '&:hover': { bgcolor: '#f0f4ff', borderColor: '#c7d2fe' },
        transition: 'all 0.15s',
      }}
    >
      <DescriptionIcon sx={{ fontSize: 20, color: '#6366f1' }} />
      <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#374151', flex: 1 }}>{label}</Typography>
      <OpenInNewIcon sx={{ fontSize: 14, color: '#9ca3af' }} />
    </Box>
  )
}
