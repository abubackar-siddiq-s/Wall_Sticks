import Order from '../models/Order.js'
import Settings from '../models/Settings.js'

const escapeHtml = (s = '') => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))

export async function generateInvoiceHtml(orderNumber) {
  const order = await Order.findOne({ orderNumber })
  if (!order) {
    const error = new Error('Order not found')
    error.statusCode = 404
    throw error
  }

  const settings = (await Settings.findOne()) || {}

  const statusLabel = {
    payment_pending: 'Payment Verification Pending',
    verified: 'Verified',
    rejected: 'Rejected',
    printing: 'Printing',
    packed: 'Packed',
    shipped: 'Shipped',
    delivered: 'Delivered',
  }[order.status] || order.status

  const rows = order.items.map((item) => `
    <tr>
      <td>${escapeHtml(item.name)}${item.isCustom ? ' <span class="muted">(custom upload)</span>' : ''}<br/>
        <span class="muted">${[
          item.size, 
          item.finish, 
          item.border ? (item.borderColor ? `${item.border} (${item.borderColor})` : item.border) : null
        ].filter(Boolean).map(escapeHtml).join(' · ')}</span>
      </td>
      <td class="right">${item.quantity}</td>
      <td class="right">₹${item.price}</td>
      <td class="right">₹${item.price * item.quantity}</td>
    </tr>`).join('')

  return `<!doctype html>
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
  .print-bar { display: flex; justify-content: flex-end; margin-bottom: 20px; }
  .print-btn { background: #0A0A0A; color: #FFD000; font-weight: 700; font-size: 14px; padding: 10px 22px; border: none; border-radius: 999px; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.12); transition: all 0.2s ease; user-select: none; }
  .print-btn:hover { background: #222; transform: translateY(-1px); }
  @media print { body { margin: 0; } .no-print { display: none !important; } }
</style>
</head>
<body>
  <div class="print-bar no-print">
    <button type="button" id="printBtn" onclick="triggerPrint(); return false;" class="print-btn">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
      Print Receipt
    </button>
  </div>

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

  <script>
    function triggerPrint() {
      try {
        window.focus();
        window.print();
      } catch (e) {
        console.error('Print trigger failed:', e);
      }
    }

    document.addEventListener('DOMContentLoaded', function() {
      var btn = document.getElementById('printBtn');
      if (btn) {
        btn.addEventListener('click', function(e) {
          e.preventDefault();
          triggerPrint();
        });
      }
    });
  </script>
</body>
</html>`
}
