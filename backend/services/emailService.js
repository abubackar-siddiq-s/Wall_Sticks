import https from 'node:https'

export async function sendOtp(email, code) {
  const smtpUser = process.env.SMTP_USER || process.env.GMAIL_USER
  const smtpPass = process.env.SMTP_PASS || process.env.GMAIL_PASS
  const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com'

  const brevoKey = process.env.BREVO_API_KEY
  const resendKey = process.env.RESEND_API_KEY

  const senderEmail = smtpUser || process.env.BREVO_SENDER || 'wallsticks0319@gmail.com'
  const subject = 'Your WallSticks Verification Code'

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>WallSticks OTP</title>
</head>
<body style="margin:0; padding:0; background-color:#0F0F12; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing:antialiased;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#0F0F12; padding:40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:520px; background-color:#18181C; border-radius:24px; border:1px solid #27272A; overflow:hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.5);">
          
          <!-- BRAND HEADER -->
          <tr>
            <td style="padding:36px 36px 20px 36px; text-align:center; background-image: radial-gradient(circle at top, rgba(245, 158, 11, 0.15) 0%, transparent 70%);">
              <div style="display:inline-block; padding:6px 16px; border-radius:999px; background-color:rgba(245, 158, 11, 0.12); border:1px solid rgba(245, 158, 11, 0.3); color:#F59E0B; font-size:11px; font-weight:700; letter-spacing:2px; text-transform:uppercase; margin-bottom:16px;">
                WALLSTICKS · PREMIUM ART
              </div>
              <h1 style="margin:0; color:#FFFFFF; font-size:26px; font-weight:800; letter-spacing:-0.5px;">Verification Code</h1>
              <p style="margin:10px 0 0 0; color:#A1A1AA; font-size:14px; line-height:1.5;">Use the 4-digit code below to complete your login</p>
            </td>
          </tr>

          <!-- OTP DISPLAY -->
          <tr>
            <td style="padding:0 36px 28px 36px;" align="center">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td align="center" style="background-color:#27272A; border-radius:18px; padding:24px; border:1px solid #3F3F46; box-shadow: inset 0 2px 4px rgba(0,0,0,0.2);">
                    <span style="font-size:40px; font-weight:900; letter-spacing:14px; color:#F59E0B; font-family:Consolas, Monaco, monospace; display:inline-block; margin-left:14px;">${code}</span>
                  </td>
                </tr>
              </table>
              <p style="margin:16px 0 0 0; color:#71717A; font-size:12px; text-align:center;">⏱️ Valid for <strong>10 minutes</strong>. Never share your verification code.</p>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="padding:24px 36px; background-color:#121215; border-top:1px solid #27272A; text-align:center;">
              <p style="margin:0; color:#71717A; font-size:12px; line-height:1.6;">If you did not request this login code, you can safely ignore this message.<br>Instagram: <a href="https://www.instagram.com/wall_sticks_official" style="color:#F59E0B; text-decoration:none; font-weight:600;">@wall_sticks_official</a></p>
              <p style="margin:16px 0 0 0; color:#52525B; font-size:11px;">© 2026 WallSticks. All rights reserved.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
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
  const subject = `🚀 Your WallSticks Order #${order.orderNumber} Has Been Shipped!`

  const itemsHtml = (order.items || [])
    .map((item) => {
      const borderInfo = item.border ? (item.borderColor ? `${item.border} (${item.borderColor})` : item.border) : ''
      const details = [item.size, borderInfo, item.finish].filter(Boolean).join(' · ')
      return `
        <tr>
          <td style="padding:12px 0; border-bottom:1px solid #27272A;">
            <p style="margin:0; color:#FFFFFF; font-size:14px; font-weight:700;">${item.name || 'Custom Poster'}</p>
            <p style="margin:4px 0 0 0; color:#A1A1AA; font-size:12px;">${details}</p>
          </td>
          <td align="center" style="padding:12px 0; border-bottom:1px solid #27272A; color:#D4D4D8; font-size:13px; font-weight:600;">
            x${item.quantity || 1}
          </td>
          <td align="right" style="padding:12px 0; border-bottom:1px solid #27272A; color:#F59E0B; font-size:14px; font-weight:700;">
            ₹${(item.price || 0) * (item.quantity || 1)}
          </td>
        </tr>
      `
    })
    .join('')

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Shipped - WallSticks</title>
</head>
<body style="margin:0; padding:0; background-color:#0F0F12; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing:antialiased;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#0F0F12; padding:40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:600px; background-color:#18181C; border-radius:24px; border:1px solid #27272A; overflow:hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.5);">
          
          <!-- HEADER BANNER -->
          <tr>
            <td style="padding:40px 36px 28px 36px; text-align:center; background-image: radial-gradient(circle at top, rgba(245, 158, 11, 0.18) 0%, transparent 75%); border-bottom:1px solid #27272A;">
              <div style="display:inline-block; padding:6px 18px; border-radius:999px; background-color:rgba(245, 158, 11, 0.12); border:1px solid rgba(245, 158, 11, 0.3); color:#F59E0B; font-size:11px; font-weight:700; letter-spacing:2px; text-transform:uppercase; margin-bottom:16px;">
                🚀 ORDER DISPATCHED
              </div>
              <h1 style="margin:0; color:#FFFFFF; font-size:28px; font-weight:800; letter-spacing:-0.5px;">Your WallSticks Order is On Its Way!</h1>
              <p style="margin:12px 0 0 0; color:#A1A1AA; font-size:14px; line-height:1.5;">Order <strong style="color:#FFFFFF;">#${order.orderNumber}</strong> has been printed, quality checked, and dispatched.</p>
            </td>
          </tr>

          <!-- ORDER ITEMS TABLE -->
          <tr>
            <td style="padding:28px 36px 16px 36px;">
              <h3 style="margin:0 0 16px 0; color:#F59E0B; font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:1.5px;">ORDER SUMMARY</h3>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse:collapse;">
                ${itemsHtml}
              </table>
            </td>
          </tr>

          <!-- SHIPPING DESTINATION CARD -->
          <tr>
            <td style="padding:0 36px 24px 36px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="background-color:#27272A; border-radius:16px; padding:20px; border:1px solid #3F3F46;" valign="top">
                    <h4 style="margin:0 0 10px 0; color:#A1A1AA; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:1px;">SHIPPING DESTINATION</h4>
                    <p style="margin:0; color:#FFFFFF; font-size:14px; font-weight:700;">${order.shipping?.name || 'Customer'}</p>
                    <p style="margin:6px 0 0 0; color:#D4D4D8; font-size:13px; line-height:1.6;">
                      ${order.shipping?.address || ''}<br>
                      ${order.shipping?.city || ''}, ${order.shipping?.state || ''} - ${order.shipping?.pincode || ''}<br>
                      <span style="color:#A1A1AA;">📞 ${order.shipping?.phone || ''}</span>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- TOTAL SUMMARY -->
          <tr>
            <td style="padding:0 36px 32px 36px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:rgba(245, 158, 11, 0.08); border-radius:16px; padding:18px 24px; border:1px solid rgba(245, 158, 11, 0.25);">
                <tr>
                  <td style="color:#D4D4D8; font-size:14px; font-weight:600;">Total Amount Paid</td>
                  <td align="right" style="color:#F59E0B; font-size:22px; font-weight:800;">₹${order.pricing?.total || 0}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- BRAND FOOTER -->
          <tr>
            <td style="padding:28px 36px; background-color:#121215; border-top:1px solid #27272A; text-align:center;">
              <p style="margin:0 0 14px 0; color:#A1A1AA; font-size:13px;">Share your setup and tag us on Instagram when your poster arrives!</p>
              <a href="https://www.instagram.com/wall_sticks_official" style="display:inline-block; padding:10px 24px; border-radius:999px; background-color:#F59E0B; color:#000000; font-size:13px; font-weight:700; text-decoration:none;">Follow @wall_sticks_official</a>
              <p style="margin:20px 0 0 0; color:#52525B; font-size:11px;">© 2026 WallSticks Art Studios. Museum-Grade Custom Posters.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
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
