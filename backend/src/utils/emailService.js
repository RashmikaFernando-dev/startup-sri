const sgMail = require('@sendgrid/mail')
const fs = require('fs')
const path = require('path')

sgMail.setApiKey(process.env.SENDGRID_API_KEY || '')

const LOG_FILE = path.join(__dirname, '../../logs/email.log')

const logEmail = (to, subject, status, error = null) => {
  const entry = {
    timestamp: new Date().toISOString(),
    to,
    subject,
    status,
    ...(error && { error }),
  }
  try {
    fs.mkdirSync(path.dirname(LOG_FILE), { recursive: true })
    fs.appendFileSync(LOG_FILE, JSON.stringify(entry) + '\n')
  } catch {}
}

/**
 * Send an email via SendGrid.
 * @param {{ to: string, subject: string, text?: string, html?: string }} options
 */
const sendEmail = async (options) => {
  const msg = {
    to: options.to,
    from: {
      email: process.env.FROM_EMAIL || 'noreply@startupsri.lk',
      name: process.env.FROM_NAME || 'StartupSri Platform',
    },
    subject: options.subject,
    text: options.text,
    html: options.html,
  }

  try {
    await sgMail.send(msg)
    console.log(`✅ Email sent to ${options.to}`)
    logEmail(options.to, options.subject, 'sent')
  } catch (error) {
    console.error('❌ Email sending failed:', error)
    logEmail(options.to, options.subject, 'failed', error.message)
    throw new Error('Email could not be sent')
  }
}

const sendWelcomeEmail = async (email, name) => {
  await sendEmail({
    to: email,
    subject: 'Welcome to StartupSri!',
    html: `
      <h1>Welcome to StartupSri, ${name}!</h1>
      <p>Thank you for joining Sri Lanka's premier microloan and equity crowdfunding platform for tech entrepreneurs.</p>
      <p>Get started by completing your profile and verification process.</p>
      <p>Best regards,<br>The StartupSri Team</p>
    `,
  })
}

const sendProjectApprovalEmail = async (email, projectTitle) => {
  await sendEmail({
    to: email,
    subject: 'Project Approved!',
    html: `
      <h1>Congratulations!</h1>
      <p>Your project "${projectTitle}" has been approved and is now live on StartupSri.</p>
      <p>Investors can now start funding your project.</p>
      <p>Best regards,<br>The StartupSri Team</p>
    `,
  })
}

const sendKycApprovedEmail = async (email, name) => {
  await sendEmail({
    to: email,
    subject: 'KYC Verified — You can now submit projects on StartupSri',
    html: `
      <h2>Identity Verified!</h2>
      <p>Hi ${name},</p>
      <p>Your KYC verification has been <strong>approved</strong>. You can now submit your startup projects for funding on StartupSri.</p>
      <p><a href="http://localhost:3000/user/submit-project">Submit Your Project →</a></p>
      <p>Best regards,<br>The StartupSri Team</p>
    `,
  })
}

const sendKycRejectedEmail = async (email, name, reason) => {
  await sendEmail({
    to: email,
    subject: 'KYC Verification Update — StartupSri',
    html: `
      <h2>KYC Not Approved</h2>
      <p>Hi ${name},</p>
      <p>Unfortunately your KYC verification was not approved at this time.</p>
      ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
      <p>Please resubmit your documents with the correct information.</p>
      <p><a href="http://localhost:3000/user/verifications">Resubmit KYC →</a></p>
      <p>Best regards,<br>The StartupSri Team</p>
    `,
  })
}

const sendProjectRejectionEmail = async (email, projectTitle, reason) => {
  await sendEmail({
    to: email,
    subject: `Project submission update — StartupSri`,
    html: `
      <h2>Project Not Approved</h2>
      <p>Unfortunately your project <strong>"${projectTitle}"</strong> was not approved at this time.</p>
      ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
      <p>You can update your project and resubmit for review.</p>
      <p>Best regards,<br>The StartupSri Team</p>
    `,
  })
}

const sendInvestmentReceivedEmail = async (email, projectTitle, amount) => {
  await sendEmail({
    to: email,
    subject: `You received a new investment — StartupSri`,
    html: `
      <h2>New Investment Received!</h2>
      <p>Your project <strong>"${projectTitle}"</strong> just received an investment of <strong>LKR ${Number(amount).toLocaleString()}</strong>.</p>
      <p>Log in to view your updated funding progress.</p>
      <p>Best regards,<br>The StartupSri Team</p>
    `,
  })
}

const sendRepaymentOverdueEmail = async (email, projectTitle, amount, dueDate) => {
  await sendEmail({
    to: email,
    subject: `Repayment overdue — StartupSri`,
    html: `
      <h2>Repayment Overdue</h2>
      <p>Your repayment instalment of <strong>LKR ${Number(amount).toLocaleString()}</strong> for the project <strong>"${projectTitle}"</strong> was due on <strong>${new Date(dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</strong> and is now overdue.</p>
      <p>Please log in and mark it as paid as soon as possible.</p>
      <p>Best regards,<br>The StartupSri Team</p>
    `,
  })
}

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendKycApprovedEmail,
  sendKycRejectedEmail,
  sendProjectApprovalEmail,
  sendProjectRejectionEmail,
  sendInvestmentReceivedEmail,
  sendRepaymentOverdueEmail,
}
