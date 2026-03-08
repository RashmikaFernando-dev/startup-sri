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
import ListAltIcon from '@mui/icons-material/ListAlt'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import PersonIcon from '@mui/icons-material/Person'
import SettingsIcon from '@mui/icons-material/Settings'
import UserNavbar from '@/components/user/UserNavbar'

// Sidebar items 
const sidebarItems = [
  { key: 'apply', label: 'Apply to raise', icon: <RocketLaunchIcon fontSize="small" /> },
  { key: 'listings', label: 'My Listings', icon: <ListAltIcon fontSize="small" /> },
  { key: 'profile', label: 'Profile', icon: <PersonIcon fontSize="small" /> },
  { key: 'settings', label: 'Settings', icon: <SettingsIcon fontSize="small" /> },
]

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

          {/* ── Sidebar ── */}
          <Box sx={{
            width: 200, flexShrink: 0,
            bgcolor: '#fff', borderRadius: 3, border: '1px solid #e5e7eb',
            p: 2, height: 'fit-content',
            display: { xs: 'none', md: 'block' },
          }}>
            <Typography variant="caption" sx={{ color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, px: 1 }}>
              Categories
            </Typography>
            <Box sx={{ mt: 1.5, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              {sidebarItems.map(item => (
                <Box
                  key={item.key}
                  onClick={() => handleSidebarClick(item.key)}
                  sx={{
                    display: 'flex', alignItems: 'center', gap: 1.5,
                    px: 2, py: 1.2, borderRadius: 2, cursor: 'pointer',
                    bgcolor: activeTab === item.key ? '#0a1940' : 'transparent',
                    color: activeTab === item.key ? '#fff' : '#374151',
                    fontWeight: activeTab === item.key ? 700 : 400,
                    fontSize: '0.875rem',
                    transition: 'all 0.15s',
                    '&:hover': {
                      bgcolor: activeTab === item.key ? '#0a1940' : '#f3f4f6',
                    },
                  }}
                >
                  {item.icon}
                  {item.label}
                </Box>
              ))}
            </Box>
          </Box>

          {/* ── Main Content ── */}
          <Box sx={{ flex: 1, minWidth: 0 }}>

            {/* Mobile tab bar */}
            <Box sx={{ display: { xs: 'flex', md: 'none' }, gap: 1, mb: 2, flexWrap: 'wrap' }}>
              {sidebarItems.map(item => (
                <Button
                  key={item.key}
                  size="small"
                  variant={activeTab === item.key ? 'contained' : 'outlined'}
                  onClick={() => handleSidebarClick(item.key)}
                  sx={{ borderRadius: 2, textTransform: 'none', bgcolor: activeTab === item.key ? '#0a1940' : undefined }}
                  startIcon={item.icon}
                >
                  {item.label}
                </Button>
              ))}
            </Box>

            {/* ── MY LISTINGS tab ── */}
            {activeTab === 'listings' && (
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 800, color: '#0a1940' }}>My Listings</Typography>
                    <Typography variant="body2" color="text.secondary">View and manage your startup listings</Typography>
                  </Box>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => router.push('/user/submit-project')}
                    sx={{ bgcolor: '#0a1940', borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
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
                      sx={{ bgcolor: '#0a1940', borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
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
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<EditIcon />}
                              sx={{ borderRadius: 2, textTransform: 'none', borderColor: '#d1d5db', color: '#374151' }}
                            >
                              Edit
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<DeleteIcon />}
                              onClick={() => setDeleteId(project._id)}
                              sx={{ borderRadius: 2, textTransform: 'none', borderColor: '#fca5a5', color: '#dc2626' }}
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
          <Button onClick={() => setDeleteId(null)} sx={{ textTransform: 'none' }}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDelete} sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}>
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
