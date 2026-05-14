import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { Box, Typography, Divider, Chip, CircularProgress } from '@mui/material'
import VerifiedIcon from '@mui/icons-material/Verified'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

const STATUS_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  approved: { bg: '#d1fae5', color: '#065f46', label: 'Verified' },
  active: { bg: '#d1fae5', color: '#065f46', label: 'Verified & Active' },
  funded: { bg: '#ede9fe', color: '#5b21b6', label: 'Verified & Funded' },
  completed: { bg: '#dbeafe', color: '#1e40af', label: 'Completed' },
}

export default function VerificationCertificate() {
  const router = useRouter()
  const { id } = router.query
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return
    const fetchVerification = async () => {
      setLoading(true)
      try {
        const res = await fetch(`${API_BASE_URL}/projects/verify/${id}`)
        const json = await res.json()
        if (json.success) {
          setData(json.data)
        } else {
          setError(json.message || 'Proposal not found')
        }
      } catch {
        setError('Could not connect to server')
      } finally {
        setLoading(false)
      }
    }
    fetchVerification()
  }, [id])

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f7f8fa' }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error || !data) {
    return (
      <>
        <Head><title>Verification – StartupSri</title></Head>
        <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f7f8fa' }}>
          <Box sx={{ textAlign: 'center', maxWidth: 400 }}>
            <ErrorOutlineIcon sx={{ fontSize: 56, color: '#ef4444', mb: 2 }} />
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#111827', mb: 1 }}>
              Not Found
            </Typography>
            <Typography color="text.secondary">
              {error || 'This proposal ID does not exist or has not been verified.'}
            </Typography>
          </Box>
        </Box>
      </>
    )
  }

  const st = STATUS_STYLE[data.status] ?? { bg: '#f3f4f6', color: '#374151', label: data.status }
  const entrepreneurName = `${data.entrepreneur?.firstName || ''} ${data.entrepreneur?.lastName || ''}`.trim() || 'N/A'

  return (
    <>
      <Head><title>Verification Certificate – {data.proposalId} | StartupSri</title></Head>
      <Box sx={{ minHeight: '100vh', bgcolor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', py: 6, px: 2 }}>
        <Box sx={{ maxWidth: 520, width: '100%', bgcolor: '#fff', borderRadius: 4, border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }}>

          {/* Header */}
          <Box sx={{ bgcolor: '#0a1940', px: 4, py: 3.5, textAlign: 'center' }}>
            <Typography sx={{ fontWeight: 800, fontSize: 24, color: '#fff', letterSpacing: '-0.02em' }}>
              StartupSri
            </Typography>
            <Typography sx={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', mt: 0.5 }}>
              Verification Certificate
            </Typography>
          </Box>

          {/* Verified badge */}
          <Box sx={{ textAlign: 'center', mt: -2.5 }}>
            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, bgcolor: st.bg, color: st.color, px: 2.5, py: 0.8, borderRadius: 10, fontSize: 14, fontWeight: 800, border: '3px solid #fff' }}>
              <VerifiedIcon sx={{ fontSize: 18 }} />
              {st.label}
            </Box>
          </Box>

          {/* Content */}
          <Box sx={{ px: 4, py: 3.5 }}>
            <Typography sx={{ fontWeight: 800, fontSize: 20, color: '#0a1940', textAlign: 'center', mb: 0.5 }}>
              {data.title}
            </Typography>
            <Typography sx={{ fontSize: 13, color: '#6b7280', textAlign: 'center', mb: 3 }}>
              {data.description}
            </Typography>

            <Divider sx={{ mb: 2.5 }} />

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.8 }}>
              <InfoRow label="Proposal ID" value={data.proposalId} highlight />
              <InfoRow label="Entrepreneur" value={entrepreneurName} />
              {data.businessName && <InfoRow label="Business Name" value={data.businessName} />}
              {data.businessType && <InfoRow label="Business Type" value={data.businessType} />}
              <InfoRow label="Category" value={data.category} />
              <InfoRow label="Funding Type" value={data.fundingType === 'equity' ? 'Equity' : 'Microloan'} />
              <InfoRow label="Funding Goal" value={`LKR ${data.fundingGoal?.toLocaleString()}`} />
              <InfoRow label="Submitted" value={new Date(data.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} />
              <InfoRow label="Verified On" value={new Date(data.verifiedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} />
            </Box>

            {/* QR Code */}
            {data.qrCode && (
              <Box sx={{ textAlign: 'center', mt: 3 }}>
                <Divider sx={{ mb: 2.5 }} />
                <Box component="img" src={data.qrCode} alt="QR Code" sx={{ width: 160, height: 160, mx: 'auto', display: 'block' }} />
                <Typography sx={{ fontSize: 11, color: '#9ca3af', mt: 1 }}>
                  Scan to verify this proposal
                </Typography>
              </Box>
            )}

            {/* Footer */}
            <Divider sx={{ mt: 3, mb: 2 }} />
            <Typography sx={{ fontSize: 11, color: '#9ca3af', textAlign: 'center' }}>
              This is a digitally generated verification certificate by StartupSri.
            </Typography>
            <Typography sx={{ fontSize: 11, color: '#9ca3af', textAlign: 'center' }}>
              For queries, contact hello@startupsri.lk | +94 77 000 0000
            </Typography>
          </Box>
        </Box>
      </Box>
    </>
  )
}

function InfoRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Typography sx={{ fontSize: 13, color: '#6b7280', fontWeight: 600 }}>{label}</Typography>
      <Typography sx={{ fontSize: 13, fontWeight: highlight ? 800 : 700, color: highlight ? '#1d4ed8' : '#0a1940', fontFamily: highlight ? 'monospace' : 'inherit' }}>
        {value}
      </Typography>
    </Box>
  )
}
