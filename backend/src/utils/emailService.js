const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY || '')

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
  } catch (error) {
    console.error('❌ Email sending failed:', error)
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

module.exports = { sendEmail, sendWelcomeEmail, sendProjectApprovalEmail }
