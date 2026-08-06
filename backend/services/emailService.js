import https from 'node:https'

export async function sendOtp(email, code) {
  const smtpUser = process.env.SMTP_USER || process.env.GMAIL_USER
  const smtpPass = process.env.SMTP_PASS || process.env.GMAIL_PASS
  const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com'

  const brevoKey = process.env.BREVO_API_KEY
  const resendKey = process.env.RESEND_API_KEY

  const senderEmail = smtpUser || process.env.BREVO_SENDER || 'wallsticks0319@gmail.com'
  const subject = 'Your WallSticks Verification OTP'
  const htmlContent = `
    <div style="font-family: sans-serif; padding: 24px; max-width: 600px; color: #111; line-height: 1.5;">
      <h2 style="font-weight: 800; font-size: 24px; margin-bottom: 16px;">WallSticks Verification</h2>
      <p style="font-size: 15px; color: #555;">Please use the following 4-digit code to complete your login. This code is valid for 10 minutes:</p>
      <div style="background-color: #F3F4F6; padding: 18px; border-radius: 12px; font-size: 28px; font-weight: 800; letter-spacing: 4px; text-align: center; margin: 24px 0; color: #111;">
        ${code}
      </div>
      <p style="font-size: 12px; color: #999; margin-top: 32px;">If you did not request this code, you can safely ignore this email.</p>
    </div>
  `

  // 1. Try Brevo HTTPS API first (runs on Port 443, reliable on cloud platforms like Render)
  if (brevoKey) {
    try {
      const sent = await new Promise((resolve) => {
        const data = JSON.stringify({
          sender: { name: 'WallSticks', email: senderEmail },
          to: [{ email }],
          subject,
          htmlContent,
        })
        const req = https.request(
          {
            hostname: 'api.brevo.com',
            path: '/v3/smtp/email',
            method: 'POST',
            headers: {
              'accept': 'application/json',
              'api-key': brevoKey,
              'content-type': 'application/json',
              'content-length': Buffer.byteLength(data),
            },
          },
          (res) => {
            let body = ''
            res.on('data', (c) => (body += c))
            res.on('end', () => {
              if (res.statusCode >= 200 && res.statusCode < 300) resolve(true)
              else {
                console.warn(`⚠️ Brevo API status ${res.statusCode}:`, body)
                resolve(false)
              }
            })
          }
        )
        req.on('error', (e) => {
          console.warn('⚠️ Brevo connection error:', e.message)
          resolve(false)
        })
        req.write(data)
        req.end()
      })
      if (sent) {
        console.log(`✉️ Email OTP sent via Brevo API to ${email}`)
        return true
      }
    } catch {}
  }

  // 2. Try Resend HTTPS API (Port 443)
  if (resendKey) {
    try {
      const sent = await new Promise((resolve) => {
        const data = JSON.stringify({
          from: 'WallSticks <onboarding@resend.dev>',
          to: [email],
          subject,
          html: htmlContent,
        })
        const req = https.request(
          {
            hostname: 'api.resend.com',
            path: '/emails',
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${resendKey}`,
              'content-type': 'application/json',
              'content-length': Buffer.byteLength(data),
            },
          },
          (res) => resolve(res.statusCode >= 200 && res.statusCode < 300)
        )
        req.on('error', () => resolve(false))
        req.write(data)
        req.end()
      })
      if (sent) {
        console.log(`✉️ Email OTP sent via Resend API to ${email}`)
        return true
      }
    } catch {}
  }

  // 3. Fallback: Gmail SMTP via Nodemailer (with 3s connection timeout)
  if (smtpUser && smtpPass) {
    const cleanPass = smtpPass.replace(/\s+/g, '')
    const portsToTry = [
      { port: 587, secure: false },
      { port: 465, secure: true },
    ]

    for (const p of portsToTry) {
      try {
        const nodemailer = (await import('nodemailer')).default
        const transporter = nodemailer.createTransport({
          host: smtpHost,
          port: p.port,
          secure: p.secure,
          auth: {
            user: smtpUser,
            pass: cleanPass,
          },
          connectionTimeout: 3000,
          greetingTimeout: 3000,
          socketTimeout: 3000,
        })

        await transporter.sendMail({
          from: `"WallSticks" <${smtpUser}>`,
          to: email,
          subject,
          html: htmlContent,
        })

        console.log(`✉️ Email OTP sent via Gmail SMTP (port ${p.port}) to ${email}`)
        return true
      } catch (err) {
        console.warn(`⚠️ Gmail SMTP port ${p.port} failed:`, err.message || err)
      }
    }
  }

  // 4. Fallback to Local Logging
  console.log('\n--- [EMAIL OTP BYPASS] ---')
  console.log(`To: ${email}`)
  console.log(`OTP Code: ${code}`)
  console.log('--------------------------\n')
  return true
}

export async function sendShippingNotificationEmail(order, recipientEmail) {
  if (!recipientEmail) return false

  const smtpUser = process.env.SMTP_USER || process.env.GMAIL_USER
  const smtpPass = process.env.SMTP_PASS || process.env.GMAIL_PASS
  const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com'

  const resendKey = process.env.RESEND_API_KEY
  const brevoKey = process.env.BREVO_API_KEY

  const senderEmail = smtpUser || process.env.BREVO_SENDER || 'wallsticks0319@gmail.com'
  const subject = `Your WallSticks Order #${order.orderNumber} Has Been Shipped!`
  const itemsListHtml = (order.items || [])
    .map((item) => `<li style="margin-bottom: 6px;"><strong>${item.name}</strong> (${item.size || 'Standard'}, ${item.quantity}x)</li>`)
    .join('')

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; padding: 24px; max-width: 600px; color: #111; line-height: 1.6; background-color: #ffffff; border: 1px solid #eee; border-radius: 12px;">
      <h2 style="font-weight: 800; font-size: 22px; color: #111; margin-top: 0;">🚀 Great News! Your Order is On Its Way</h2>
      <p style="font-size: 15px; color: #444;">Hello <strong>${order.shipping?.name || 'Customer'}</strong>,</p>
      <p style="font-size: 15px; color: #444;">Your order <strong>#${order.orderNumber}</strong> has been printed, carefully packed, and handed over to our courier partner!</p>
      
      <div style="background-color: #F8F9FA; padding: 16px; border-radius: 10px; margin: 20px 0;">
        <h4 style="margin: 0 0 10px 0; font-size: 14px; text-transform: uppercase; color: #666; letter-spacing: 1px;">Order Summary</h4>
        <ul style="padding-left: 20px; margin: 0; font-size: 14px; color: #333;">
          ${itemsListHtml}
        </ul>
        <div style="margin-top: 12px; font-weight: bold; font-size: 15px;">Total: ₹${order.pricing?.total || 0}</div>
      </div>

      <div style="background-color: #EFF6FF; border-left: 4px solid #3B82F6; padding: 12px 16px; border-radius: 6px; margin-bottom: 24px;">
        <p style="margin: 0; font-size: 13px; color: #1E40AF;"><strong>Delivery Address:</strong> ${order.shipping?.address || ''}, ${order.shipping?.city || ''}, ${order.shipping?.state || ''} - ${order.shipping?.pincode || ''}</p>
      </div>

      <p style="font-size: 14px; color: #555;">Thank you for shopping with <strong>WallSticks</strong>! Follow us on Instagram for new drops and customer features: <a href="https://www.instagram.com/wall_sticks_official" style="color: #E1306C; font-weight: bold; text-decoration: none;">@wall_sticks_official</a></p>
    </div>
  `

  // 1. Try Brevo HTTPS API first (Port 443, instant & non-blocking)
  if (brevoKey) {
    try {
      const sent = await new Promise((resolve) => {
        const data = JSON.stringify({
          sender: { name: 'WallSticks', email: senderEmail },
          to: [{ email: recipientEmail }],
          subject,
          htmlContent,
        })
        const req = https.request(
          {
            hostname: 'api.brevo.com',
            path: '/v3/smtp/email',
            method: 'POST',
            headers: {
              'accept': 'application/json',
              'api-key': brevoKey,
              'content-type': 'application/json',
              'content-length': Buffer.byteLength(data),
            },
          },
          (res) => {
            let body = ''
            res.on('data', (c) => (body += c))
            res.on('end', () => {
              if (res.statusCode >= 200 && res.statusCode < 300) resolve(true)
              else {
                console.warn(`⚠️ Brevo API shipping notification status ${res.statusCode}:`, body)
                resolve(false)
              }
            })
          }
        )
        req.on('error', (e) => {
          console.warn('⚠️ Brevo shipping notification connection error:', e.message)
          resolve(false)
        })
        req.write(data)
        req.end()
      })
      if (sent) {
        console.log(`✉️ Shipping notification email sent via Brevo API to ${recipientEmail}`)
        return true
      }
    } catch {}
  }

  // 2. Try Resend HTTPS API (Port 443)
  if (resendKey) {
    try {
      const sent = await new Promise((resolve) => {
        const data = JSON.stringify({
          from: 'WallSticks <onboarding@resend.dev>',
          to: [recipientEmail],
          subject,
          html: htmlContent,
        })
        const req = https.request(
          {
            hostname: 'api.resend.com',
            path: '/emails',
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${resendKey}`,
              'content-type': 'application/json',
              'content-length': Buffer.byteLength(data),
            },
          },
          (res) => resolve(res.statusCode >= 200 && res.statusCode < 300)
        )
        req.on('error', () => resolve(false))
        req.write(data)
        req.end()
      })
      if (sent) {
        console.log(`✉️ Shipping notification email sent via Resend API to ${recipientEmail}`)
        return true
      }
    } catch {}
  }

  // 3. Fallback: Gmail SMTP via Nodemailer
  if (smtpUser && smtpPass) {
    const cleanPass = smtpPass.replace(/\s+/g, '')
    const portsToTry = [
      { port: 587, secure: false },
      { port: 465, secure: true },
    ]

    for (const p of portsToTry) {
      try {
        const nodemailer = (await import('nodemailer')).default
        const transporter = nodemailer.createTransport({
          host: smtpHost,
          port: p.port,
          secure: p.secure,
          auth: { user: smtpUser, pass: cleanPass },
          connectionTimeout: 3000,
          greetingTimeout: 3000,
          socketTimeout: 3000,
        })

        await transporter.sendMail({
          from: `"WallSticks" <${smtpUser}>`,
          to: recipientEmail,
          subject,
          html: htmlContent,
        })

        console.log(`✉️ Shipping notification email sent via Gmail SMTP (port ${p.port}) to ${recipientEmail}`)
        return true
      } catch (err) {
        console.warn(`⚠️ Gmail SMTP shipping notification port ${p.port} failed:`, err.message || err)
      }
    }
  }

  // 4. Fallback log
  console.log('\n--- [SHIPPING EMAIL NOTIFICATION LOG] ---')
  console.log(`To: ${recipientEmail}`)
  console.log(`Order: #${order.orderNumber}`)
  console.log('-----------------------------------------\n')
  return true
}
