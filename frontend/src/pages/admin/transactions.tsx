import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { Box, Typography, Select, MenuItem, FormControl, InputLabel } from '@mui/material'
import AdminNavbar from '@/components/admin/AdminNavbar'
import AdminSidebar from '@/components/admin/AdminSidebar'

const CONTENT_LEFT = 240

const TYPE_COLOR: Record<string, { bg: string; text: string }> = {
  loan:   { bg: '#dbeafe', text: '#1e40af' },
  equity: { bg: '#ede9fe', text: '#5b21b6' },
}
const STATUS_COLOR: Record<string, { bg: string; text: string }> = {
  completed: { bg: '#d1fae5', text: '#065f46' },
  pending:   { bg: '#fef3c7', text: '#92400e' },
  cancelled: { bg: '#fee2e2', text: '#991b1b' },
  refunded:  { bg: '#f3f4f6', text: '#374151' },
}

export default function AdminTransactions() {
  const router = useRouter()
  const [admin, setAdmin] = useState<any>(null)
  const [txns, setTxns] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    const stored = localStorage.getItem('adminUser')
    const tok = localStorage.getItem('adminToken')
    if (!stored || !tok) { router.push('/admin/login'); return }
    const u = JSON.parse(stored)
    if (u.role !== 'admin') { router.push('/admin/login'); return }
    setAdmin(u)
  }, [])

  useEffect(() => { if (admin) fetchTxns() }, [admin, typeFilter, statusFilter])

  const token = () => localStorage.getItem('adminToken')

  const fetchTxns = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (typeFilter !== 'all') params.set('type', typeFilter)
      if (statusFilter !== 'all') params.set('status', statusFilter)
      const res = await fetch(`http://localhost:5000/api/admin/transactions?${params}`, {
        headers: { Authorization: `Bearer ${token()}` },
      })
      const data = await res.json()
      if (data.success) setTxns(data.data)
    } catch {}
    finally { setLoading(false) }
  }

  const fmt = (n: number) => `LKR ${n?.toLocaleString() ?? 0}`
  const totalVolume = txns.filter(t => t.status === 'completed').reduce((s, t) => s + (t.amount || 0), 0)

  return (
    <>
      <Head><title>Transactions – Admin</title></Head>
      <AdminSidebar activeKey="transactions" />

      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f9fafb' }}>
        <AdminSidebar activeKey="transactions" />

        <Box sx={{ flex: 1, ml: { xs: 0, md: `${CONTENT_LEFT}px` }, display: 'flex', flexDirection: 'column' }}>
        <AdminNavbar admin={admin} pageTitle="Transactions" pageSubtitle="All investment transaction records" onLogout={() => { localStorage.removeItem('adminToken'); localStorage.removeItem('adminUser'); router.push('/admin/login') }} />

        <Box sx={{ flex: 1, px: { xs: 2, md: 4 }, pt: '80px', pb: 6 }}>

          {/* Summary cards */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4,1fr)' }, gap: 2, mb: 4 }}>
            {[
              { label: 'Total Transactions', value: txns.length },
              { label: 'Completed',          value: txns.filter(t => t.status === 'completed').length },
              { label: 'Pending',            value: txns.filter(t => t.status === 'pending').length },
              { label: 'Volume (Completed)', value: fmt(totalVolume) },
            ].map(s => (
              <Box key={s.label} sx={{ bgcolor: '#fff', border: '1px solid #e5e7eb', borderRadius: 2.5, p: 2.5 }}>
                <Typography sx={{ fontSize: 12, color: '#6b7280', fontWeight: 600, mb: 0.5 }}>{s.label}</Typography>
                <Typography sx={{ fontWeight: 800, fontSize: 22, color: '#111827' }}>{s.value}</Typography>
              </Box>
            ))}
          </Box>

          {/* Filters */}
          <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel>Type</InputLabel>
              <Select value={typeFilter} label="Type" onChange={e => setTypeFilter(e.target.value)} sx={{ borderRadius: 2, bgcolor: '#fff' }}>
                <MenuItem value="all">All Types</MenuItem>
                <MenuItem value="loan">Microloan</MenuItem>
                <MenuItem value="equity">Equity</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel>Status</InputLabel>
              <Select value={statusFilter} label="Status" onChange={e => setStatusFilter(e.target.value)} sx={{ borderRadius: 2, bgcolor: '#fff' }}>
                <MenuItem value="all">All Statuses</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
                <MenuItem value="refunded">Refunded</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* Table */}
          <Box sx={{ bgcolor: '#fff', border: '1px solid #e5e7eb', borderRadius: 2.5, overflow: 'hidden' }}>
            {/* Table header */}
            <Box sx={{ display: 'grid', gridTemplateColumns: '1.6fr 1.6fr 1fr 1fr 1fr 1fr', px: 3, py: 1.5, bgcolor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
              {['Investor', 'Project', 'Amount', 'Type', 'Status', 'Date'].map(h => (
                <Typography key={h} sx={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</Typography>
              ))}
            </Box>

            {loading ? (
              <Box sx={{ textAlign: 'center', py: 8, color: '#9ca3af' }}>Loading...</Box>
            ) : txns.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 8, color: '#9ca3af' }}>No transactions found.</Box>
            ) : (
              txns.map((t, i) => {
                const typeC   = TYPE_COLOR[t.type]   || { bg: '#f3f4f6', text: '#374151' }
                const statusC = STATUS_COLOR[t.status] || { bg: '#f3f4f6', text: '#374151' }
                return (
                  <Box key={t._id} sx={{
                    display: 'grid', gridTemplateColumns: '1.6fr 1.6fr 1fr 1fr 1fr 1fr',
                    px: 3, py: 2, borderBottom: i < txns.length - 1 ? '1px solid #f3f4f6' : 'none',
                    alignItems: 'center',
                    '&:hover': { bgcolor: '#fafafa' },
                  }}>
                    <Box>
                      <Typography sx={{ fontWeight: 600, fontSize: 14, color: '#111827' }}>
                        {t.investor?.firstName} {t.investor?.lastName}
                      </Typography>
                      <Typography sx={{ fontSize: 12, color: '#6b7280' }}>{t.investor?.email}</Typography>
                    </Box>
                    <Box>
                      <Typography sx={{ fontWeight: 600, fontSize: 14, color: '#111827' }}>{t.project?.title}</Typography>
                      <Typography sx={{ fontSize: 12, color: '#6b7280' }}>{t.project?.category}</Typography>
                    </Box>
                    <Typography sx={{ fontWeight: 700, fontSize: 14, color: '#111827' }}>{fmt(t.amount)}</Typography>
                    <Box sx={{ px: 1.2, py: 0.4, borderRadius: 1.5, bgcolor: typeC.bg, display: 'inline-flex', width: 'fit-content' }}>
                      <Typography sx={{ fontSize: 11, fontWeight: 700, color: typeC.text }}>
                        {t.type === 'loan' ? 'Microloan' : 'Equity'}
                      </Typography>
                    </Box>
                    <Box sx={{ px: 1.2, py: 0.4, borderRadius: 1.5, bgcolor: statusC.bg, display: 'inline-flex', width: 'fit-content' }}>
                      <Typography sx={{ fontSize: 11, fontWeight: 700, color: statusC.text, textTransform: 'capitalize' }}>
                        {t.status}
                      </Typography>
                    </Box>
                    <Typography sx={{ fontSize: 13, color: '#6b7280' }}>
                      {new Date(t.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </Typography>
                  </Box>
                )
              })
            )}
          </Box>

        </Box>
        </Box>
      </Box>
    </>
  )
}
