import express from 'express'
import asyncHandler from 'express-async-handler'
import Order from '../models/Order.js'
import Settings from '../models/Settings.js'

const router = express.Router()

const escapeHtml = (s = '') => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))

// GET /api/orders/:orderNumber/receipt — a self-contained, printable HTML receipt.
// No PDF library needed: the browser's own "Print > Save as PDF" covers that use case,
// and a plain HTML response is instantly viewable, linkable, and easy to style/theme.
router.get('/:orderNumber/receipt', asyncHandler(async (req, res) => {
  const order = await Order.findOne({ orderNumber: req.params.orderNumber })
  if (!order) { res.status(404); throw new Error('Order not found') }
  const settings = (await Settings.findOne()) || {}

  const statusLabel = {
    payment_pending: 'Payment Verification Pending',
    verified: 'Verified', rejected: 'Rejected', printing: 'Printing',
    packed: 'Packed', shipped: 'Shipped', delivered: 'Delivered',
  }[order.status] || order.status

  const rows = order.items.map((item) => `
    <tr>
      <td>${escapeHtml(item.name)}${item.isCustom ? ' <span class="muted">(custom upload)</span>' : ''}<br/>
        <span class="muted">${[item.size, item.finish, item.border].filter(Boolean).map(escapeHtml).join(' · ')}</span>
      </td>
      <td class="right">${item.quantity}</td>
      <td class="right">₹${item.price}</td>
      <td class="right">₹${item.price * item.quantity}</td>
    </tr>`).join('')

  const html = `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>Receipt — ${escapeHtml(order.orderNumber)}</title>
<style>
  body { font-family: -apple-system, 'Segoe UI', Roboto, sans-serif; color: #0A0A0A; max-width: 640px; margin: 40px auto; padding: 0 20px; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #FFD000; padding-bottom: 20px; margin-bottom: 24px; }
  .brand { font-weight: 800; font-size: 22px; }
  .muted { color: #888; font-size: 12px; }
  .badge { display: inline-block; background: #FFF6CC; color: #8a6d00; font-weight: 700; font-size: 12px; padding: 4px 12px; border-radius: 999px; margin-top: 6px; }
  table { width: 100%; border-collapse: collapse; margin: 20px 0; }
  th { text-align: left; font-size: 12px; color: #888; padding: 8px 0; border-bottom: 1px solid #eee; }
  td { padding: 12px 0; border-bottom: 1px solid #f2f2f2; font-size: 14px; vertical-align: top; }
  .right { text-align: right; }
  .totals { margin-left: auto; width: 260px; font-size: 14px; }
  .totals div { display: flex; justify-content: space-between; padding: 4px 0; }
  .grand { font-weight: 800; font-size: 17px; border-top: 2px solid #0A0A0A; margin-top: 8px; padding-top: 10px !important; }
  .footer { margin-top: 40px; font-size: 12px; color: #999; text-align: center; }
  @media print { body { margin: 0; } }
</style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand">${escapeHtml(settings.businessName || 'WallSticks')}</div>
      <div class="muted">${escapeHtml(settings.address || '')}</div>
    </div>
    <div style="text-align:right">
      <div class="muted">Order</div>
      <div style="font-weight:700">#${escapeHtml(order.orderNumber)}</div>
      <div class="badge">${escapeHtml(statusLabel)}</div>
    </div>
  </div>

  <div style="display:flex; justify-content:space-between; margin-bottom: 20px; font-size: 14px;">
    <div>
      <div class="muted">Billed to</div>
      <div>${escapeHtml(order.shipping?.name)}</div>
      <div class="muted">${escapeHtml(order.shipping?.phone)}</div>
      ${order.deliveryMethod === 'courier' ? `<div class="muted">${escapeHtml([order.shipping?.address, order.shipping?.city, order.shipping?.state, order.shipping?.pincode].filter(Boolean).join(', '))}</div>` : '<div class="muted">Store Pickup</div>'}
    </div>
    <div style="text-align:right">
      <div class="muted">Date</div>
      <div>${new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
    </div>
  </div>

  <table>
    <thead><tr><th>Item</th><th class="right">Qty</th><th class="right">Price</th><th class="right">Total</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>

  <div class="totals">
    <div><span>Subtotal</span><span>₹${order.pricing?.subtotal ?? 0}</span></div>
    ${order.pricing?.discount ? `<div><span>Discount</span><span>-₹${order.pricing.discount}</span></div>` : ''}
    <div><span>${order.deliveryMethod === 'pickup' ? 'Pickup' : 'Courier charge'}</span><span>₹${order.pricing?.courierCharge ?? 0}</span></div>
    ${order.pricing?.gst ? `<div><span>GST</span><span>₹${order.pricing.gst}</span></div>` : ''}
    <div class="grand"><span>Total</span><span>₹${order.pricing?.total ?? 0}</span></div>
  </div>

  <div class="footer">Thank you for shopping with ${escapeHtml(settings.businessName || 'WallSticks')}. Questions? ${escapeHtml(settings.email || '')}</div>
</body>
</html>`

  res.set('Content-Type', 'text/html').send(html)
}))

export default router
