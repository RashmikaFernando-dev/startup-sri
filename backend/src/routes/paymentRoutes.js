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

    const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET || 'sandbox_secret'
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

    const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET || 'sandbox_secret'
    const secretHash = crypto.createHash('md5').update(merchantSecret).digest('hex').toUpperCase()
    const expectedSig = crypto
      .createHash('md5')
      .update(`${merchant_id}${order_id}${payhere_amount}${payhere_currency}${status_code}${secretHash}`)
      .digest('hex')
      .toUpperCase()

    if (expectedSig !== md5sig) {
      return res.status(400).send('Invalid signature')
    }

    // status_code 2 = successful payment
    if (status_code === '2') {
      await Investment.findOneAndUpdate(
        { paymentIntentId: order_id },
        { status: 'completed' }
      )
    }

    res.sendStatus(200)
  } catch (err) {
    res.sendStatus(500)
  }
})

module.exports = router
