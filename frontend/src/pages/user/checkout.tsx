import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useAppSelector, useAppDispatch } from '@/hooks/useTypedSelector'
import { logout } from '@/redux/slices/authSlice'
import {
  Box,
  Typography,
  Button,
  Paper,
  Divider,
  Alert,
  CircularProgress,
  Chip,
} from '@mui/material'
import UserNavbar from '@/components/user/UserNavbar'
import Footer from '@/components/layout/Footer'
import LockIcon from '@mui/icons-material/Lock'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import PaymentIcon from '@mui/icons-material/Payment'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import PieChartIcon from '@mui/icons-material/PieChart'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong'
import jsPDF from 'jspdf'

// Extend window for PayHere SDK
declare global {
  interface Window {
    payhere: {
      onCompleted: (orderId: string) => void
      onDismissed: () => void
      onError: (error: string) => void
      startPayment: (payment: Record<string, unknown>) => void
    }
  }
}

type PayStatus = 'idle' | 'processing' | 'success' | 'cancelled' | 'error'

const MERCHANT_ID = process.env.NEXT_PUBLIC_PAYHERE_MERCHANT_ID || '1234267'
const NOTIFY_URL = process.env.NEXT_PUBLIC_PAYHERE_NOTIFY_URL || 'http://localhost:5000/api/payments/notify'

export default function Checkout() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const user = useAppSelector((s) => s.auth.user)
  const token = useAppSelector((s) => s.auth.token)

  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [payStatus, setPayStatus] = useState<PayStatus>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [investmentData, setInvestmentData] = useState<any>(null)

  // Stable order ID for this checkout session
  const [orderId] = useState(
    () => `INV_${Date.now()}_${Math.random().toString(36).slice(2, 7).toUpperCase()}`
  )

  const {
    projectId,
    projectTitle,
    amount,
    fundingType,
    interestRate,
    duration,
    equityOffered,
  } = router.query as Record<string, string>

  const parsedAmount = parseFloat(amount || '0')

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      router.push('/auth/login')
      return
    }
    if (router.isReady && !projectId) {
      router.push('/user/projects')
      return
    }
    try {
      const userStr = localStorage.getItem('user')
      if (userStr) {
        const parsed = JSON.parse(userStr)
        const img = localStorage.getItem(`profileImage_${parsed.id}`)
        if (img) setProfileImage(img)
      }
    } catch {}
  }, [router.isReady])

  // Inject PayHere script once — button is always enabled; we check window.payhere on click
  useEffect(() => {
    const PAYHERE_SDK = 'https://www.payhere.lk/lib/payhere.js'
    if (!document.querySelector(`script[src="${PAYHERE_SDK}"]`)) {
      const script = document.createElement('script')
      script.src = PAYHERE_SDK
      script.async = true
      document.body.appendChild(script)
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    dispatch(logout())
    router.push('/')
  }

  const recordInvestment = async (completedOrderId: string) => {
    const authToken = token || localStorage.getItem('token')
    const res = await fetch('http://localhost:5000/api/investments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ projectId, amount: parsedAmount, orderId: completedOrderId }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message || 'Failed to record investment')
    setInvestmentData(data.data)
    return data
  }

  const handlePayNow = async () => {
    if (typeof window === 'undefined' || !(window as any).payhere) {
      setErrorMsg('Payment gateway is still loading. Please wait a moment and try again.')
      return
    }
    if (!projectId || parsedAmount <= 0) {
      setErrorMsg('Invalid payment details. Please go back and try again.')
      return
    }

    setPayStatus('processing')
    setErrorMsg('')

    try {
      const authToken = token || localStorage.getItem('token')

      // Generate hash on the server (merchant secret stays private)
      const hashRes = await fetch('http://localhost:5000/api/payments/hash', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          merchant_id: MERCHANT_ID,
          order_id: orderId,
          amount: parsedAmount.toFixed(2),
          currency: 'LKR',
        }),
      })
      const hashData = await hashRes.json()
      if (!hashData.success) throw new Error('Failed to generate payment hash')

      // Wire up PayHere callbacks before startPayment
      ;(window as any).payhere.onCompleted = async (completedOrderId: string) => {
        try {
          await recordInvestment(completedOrderId)
          setPayStatus('success')
        } catch (e: any) {
          setErrorMsg(
            e.message ||
              'Payment succeeded but investment could not be recorded. Please contact support.'
          )
          setPayStatus('error')
        }
      }

      ;(window as any).payhere.onDismissed = () => {
        setPayStatus('cancelled')
      }

      ;(window as any).payhere.onError = (error: string) => {
        setErrorMsg(error || 'Payment failed. Please try again.')
        setPayStatus('error')
      }

      const payment = {
        sandbox: true, // set to false in production
        merchant_id: MERCHANT_ID,
        return_url: `${window.location.origin}/user/projects`,
        cancel_url: `${window.location.origin}/user/projects`,
        notify_url: NOTIFY_URL,
        order_id: orderId,
        items: `Investment: ${projectTitle}`,
        amount: parsedAmount.toFixed(2),
        currency: 'LKR',
        hash: hashData.hash,
        first_name: user?.firstName || 'Investor',
        last_name: user?.lastName || '',
        email: user?.email || '',
        phone: '0771234567',
        address: 'No.1, Galle Road',
        city: 'Colombo',
        country: 'Sri Lanka',
      }

      setPayStatus('idle') // reset while PayHere popup is open
      ;(window as any).payhere.startPayment(payment)
    } catch (e: any) {
      setErrorMsg(e.message || 'Could not initiate payment. Please try again.')
      setPayStatus('error')
    }
  }

  const fmt = (n: number) => `LKR ${n.toLocaleString()}`

  const estimatedReturn =
    fundingType === 'microloan' && interestRate && duration
      ? parsedAmount * (1 + (parseFloat(interestRate) / 100) * (parseFloat(duration) / 12))
      : null

  const generateReceipt = () => {
    const doc = new jsPDF()
    const pageW = doc.internal.pageSize.getWidth()
    const leftM = 20
    const rightVal = pageW - 20
    let y = 20

    // Header
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

    // Receipt number on right
    const receiptNo = investmentData?._id
      ? `RCP-${investmentData._id.slice(-8).toUpperCase()}`
      : `RCP-${orderId.slice(-8).toUpperCase()}`
    doc.setFontSize(10)
    doc.text(receiptNo, rightVal, 22, { align: 'right' })
    doc.text(new Date().toLocaleDateString('en-LK', { year: 'numeric', month: 'long', day: 'numeric' }), rightVal, 32, { align: 'right' })

    y = 62

    // Investor info
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

    // Divider
    doc.setDrawColor(229, 231, 235)
    doc.setLineWidth(0.5)
    doc.line(leftM, y, rightVal, y)
    y += 12

    // Transaction details table
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

    addRow('Transaction ID', investmentData?.paymentIntentId || orderId)
    addRow('Date & Time', new Date().toLocaleString('en-LK'))
    addRow('Project', projectTitle || 'N/A')
    addRow('Investment Type', fundingType === 'equity' ? 'Equity' : 'Microloan')

    if (fundingType === 'microloan') {
      addRow('Interest Rate', `${interestRate}% p.a.`)
      addRow('Loan Duration', `${duration} months`)
    }
    if (fundingType === 'equity') {
      addRow('Equity Offered', `${equityOffered}%`)
    }

    addRow('Payment Method', 'PayHere')
    addRow('Status', 'Completed')

    y += 4
    doc.setDrawColor(229, 231, 235)
    doc.line(leftM, y, rightVal, y)
    y += 10

    // Amount
    doc.setFontSize(10)
    doc.setTextColor(107, 114, 128)
    doc.setFont('helvetica', 'normal')
    doc.text('Investment Amount', leftM, y)
    doc.setFontSize(16)
    doc.setTextColor(10, 25, 64)
    doc.setFont('helvetica', 'bold')
    doc.text(fmt(parsedAmount), rightVal, y, { align: 'right' })
    y += 10

    if (estimatedReturn) {
      doc.setFontSize(10)
      doc.setTextColor(107, 114, 128)
      doc.setFont('helvetica', 'normal')
      doc.text('Estimated Total Return', leftM, y)
      doc.setTextColor(22, 163, 74)
      doc.setFont('helvetica', 'bold')
      doc.text(fmt(Math.round(estimatedReturn)), rightVal, y, { align: 'right' })
      y += 10
    }

    // Footer
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
    <>
      <Head>
        <title>Checkout – StartupSri</title>
      </Head>

      <Box sx={{ minHeight: '100vh', bgcolor: '#f7f8fa', display: 'flex', flexDirection: 'column' }}>
        <UserNavbar user={user} profileImage={profileImage} onLogout={handleLogout} />

        <Box
          sx={{
            maxWidth: 560,
            mx: 'auto',
            width: '100%',
            px: { xs: 2, md: 3 },
            py: 5,
            flex: 1,
          }}
        >
          {/* Back */}
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => router.back()}
            sx={{ textTransform: 'none', color: '#374151', fontWeight: 600, borderRadius: 2, mb: 3 }}
          >
            Back to Project
          </Button>

          {payStatus === 'success' ? (
            /* ── Success State ── */
            <Paper
              sx={{
                borderRadius: 3,
                p: 5,
                textAlign: 'center',
                border: '1px solid #d1fae5',
                bgcolor: '#f0fdf4',
              }}
            >
              <CheckCircleIcon sx={{ fontSize: 72, color: '#16a34a', mb: 2 }} />
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#0a1940', mb: 1 }}>
                Investment Confirmed!
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 4, lineHeight: 1.7 }}>
                Your investment of <strong>{fmt(parsedAmount)}</strong> in{' '}
                <strong>{projectTitle}</strong> has been recorded successfully.
              </Typography>
              <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  startIcon={<ReceiptLongIcon />}
                  onClick={generateReceipt}
                  sx={{
                    bgcolor: '#16a34a',
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 700,
                    '&:hover': { bgcolor: '#15803d' },
                  }}
                >
                  Download Receipt
                </Button>
                <Button
                  variant="contained"
                  onClick={() => router.push(user?.role === 'entrepreneur' ? '/user/dashboard' : '/user/projects')}
                  sx={{
                    bgcolor: '#0a1940',
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 700,
                    '&:hover': { bgcolor: '#1565c0' },
                  }}
                >
                  {user?.role === 'entrepreneur' ? 'View Dashboard' : 'View My Investments'}
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => router.push('/user/projects')}
                  sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
                >
                  Browse More Projects
                </Button>
              </Box>
            </Paper>
          ) : (
            <>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#0a1940', mb: 3 }}>
                Complete Your Investment
              </Typography>

              {/* ── Order Summary ── */}
              <Paper sx={{ borderRadius: 3, p: 3, mb: 3, border: '1px solid #e5e7eb' }}>
                <Typography
                  variant="overline"
                  sx={{ fontWeight: 700, color: '#6b7280', letterSpacing: '0.08em' }}
                >
                  Order Summary
                </Typography>

                <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Row label="Project" value={projectTitle} bold />

                  <Row
                    label="Investment Type"
                    value={
                      <Chip
                        label={fundingType === 'equity' ? 'Equity' : 'Microloan'}
                        size="small"
                        color={fundingType === 'equity' ? 'secondary' : 'primary'}
                        sx={{ fontWeight: 700 }}
                      />
                    }
                  />

                  {fundingType === 'microloan' && (
                    <>
                      <Row
                        label="Interest Rate"
                        icon={<TrendingUpIcon sx={{ fontSize: 16, color: '#6b7280' }} />}
                        value={`${interestRate}% p.a.`}
                      />
                      <Row
                        label="Loan Duration"
                        icon={<CalendarTodayIcon sx={{ fontSize: 16, color: '#6b7280' }} />}
                        value={`${duration} months`}
                      />
                    </>
                  )}

                  {fundingType === 'equity' && (
                    <Row
                      label="Equity Pool"
                      icon={<PieChartIcon sx={{ fontSize: 16, color: '#6b7280' }} />}
                      value={`${equityOffered}% offered`}
                    />
                  )}
                </Box>

                <Divider sx={{ my: 2.5 }} />

                <Row
                  label="Investment Amount"
                  value={fmt(parsedAmount)}
                  bold
                  large
                />

                {estimatedReturn && (
                  <Box sx={{ mt: 1.5 }}>
                    <Row
                      label="Estimated Total Return"
                      value={fmt(Math.round(estimatedReturn))}
                      valueColor="#16a34a"
                    />
                  </Box>
                )}
              </Paper>

              {/* ── Payment Panel ── */}
              <Paper sx={{ borderRadius: 3, p: 3, border: '1px solid #e5e7eb' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5 }}>
                  <LockIcon sx={{ color: '#6b7280', fontSize: 18 }} />
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                    Secure payment powered by{' '}
                    <Box component="span" sx={{ fontWeight: 700, color: '#0a1940' }}>
                      PayHere
                    </Box>
                  </Typography>
                </Box>

                {errorMsg && (
                  <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                    {errorMsg}
                  </Alert>
                )}

                {payStatus === 'cancelled' && !errorMsg && (
                  <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>
                    Payment was cancelled. You can try again below.
                  </Alert>
                )}

                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  onClick={handlePayNow}
                  disabled={payStatus === 'processing'}
                  startIcon={
                    payStatus === 'processing' ? (
                      <CircularProgress size={18} color="inherit" />
                    ) : (
                      <PaymentIcon />
                    )
                  }
                  sx={{
                    bgcolor: '#0a1940',
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 700,
                    py: 1.6,
                    fontSize: '1rem',
                    '&:hover': { bgcolor: '#1565c0' },
                  }}
                >
                  {payStatus === 'processing'
                    ? 'Preparing Payment…'
                    : `Pay ${fmt(parsedAmount)} with PayHere`}
                </Button>

                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: 'block', textAlign: 'center', mt: 1.5 }}
                >
                  A secure PayHere popup will open to complete your payment.
                </Typography>
              </Paper>
            </>
          )}
        </Box>

        <Footer />
      </Box>
    </>
  )
}

// ── Small helper component ─────────────────────────────────────────────────
function Row({
  label,
  value,
  icon,
  bold,
  large,
  valueColor,
}: {
  label: string
  value: React.ReactNode
  icon?: React.ReactNode
  bold?: boolean
  large?: boolean
  valueColor?: string
}) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, color: '#6b7280' }}>
        {icon}
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
      </Box>
      {typeof value === 'string' || typeof value === 'number' ? (
        <Typography
          variant={large ? 'h6' : 'body2'}
          sx={{
            fontWeight: bold || large ? 800 : 600,
            color: valueColor || (bold ? '#0a1940' : 'text.primary'),
          }}
        >
          {value}
        </Typography>
      ) : (
        value
      )}
    </Box>
  )
}
