const express = require('express')
const crypto = require('crypto')
const { protect } = require('../middleware/auth')
const Investment = require('../models/Investment')

const router = express.Router()

/**
 * POST /api/payments/hash
 * Generate the PayHere order hash on the server so the merchant secret
 * is never exposed to the browser.
 * Body: { merchant_id, order_id, amount, currency }
 */
router.post('/hash', protect, (req, res) => {
  try {
    const { merchant_id, order_id, amount, currency } = req.body
    if (!merchant_id || !order_id || !amount || !currency) {
      return res.status(400).json({ success: false, message: 'merchant_id, order_id, amount and currency are required' })
    }

    const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET
    if (!merchantSecret) {
      return res.status(500).json({ success: false, message: 'Payment configuration error' })
    }
    const secretHash = crypto.createHash('md5').update(merchantSecret).digest('hex').toUpperCase()
    const formattedAmount = parseFloat(amount).toFixed(2)
    const rawHash = `${merchant_id}${order_id}${formattedAmount}${currency}${secretHash}`
    const hash = crypto.createHash('md5').update(rawHash).digest('hex').toUpperCase()

    res.json({ success: true, hash })
  } catch (err) {
    res.status(500).json({ success: false, message: 'Hash generation failed' })
  }
})

/**
 * POST /api/payments/notify
 * PayHere server-to-server notification after a payment.
 * Verifies the MD5 signature and marks the investment as completed.
 */
router.post('/notify', async (req, res) => {
  try {
    const { merchant_id, order_id, payment_id, payhere_amount, payhere_currency, status_code, md5sig } = req.body

    const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET || ''
    const secretHash = crypto.createHash('md5').update(merchantSecret).digest('hex').toUpperCase()
    const expectedSig = crypto
      .createHash('md5')
      .update(`${merchant_id}${order_id}${payhere_amount}${payhere_currency}${status_code}${secretHash}`)
      .digest('hex')
      .toUpperCase()

    if (expectedSig !== md5sig) {
      console.error(`[PayHere] Invalid signature for order ${order_id}`)
      return res.status(400).send('Invalid signature')
    }

    const statusMap = {
      '2': 'completed',   // success
      '0': 'pending',     // pending
      '-1': 'cancelled',  // cancelled
      '-2': 'cancelled',  // failed
      '-3': 'cancelled',  // chargedback
    }

    const newStatus = statusMap[status_code] || 'cancelled'

    const investment = await Investment.findOneAndUpdate(
      { paymentIntentId: order_id },
      { status: newStatus },
      { new: true }
    )

    if (!investment) {
      console.error(`[PayHere] No investment found for order ${order_id}`)
    }

    res.sendStatus(200)
  } catch (err) {
    console.error('[PayHere] Notify error:', err.message)
    res.sendStatus(500)
  }
})

module.exports = router
