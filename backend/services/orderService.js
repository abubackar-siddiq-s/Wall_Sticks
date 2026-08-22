import Order from '../models/Order.js'
import Payment from '../models/Payment.js'

const generateOrderNumber = () => 'PW' + Math.floor(100000 + Math.random() * 900000)

export async function createOrder(data, file) {
  const items = data.items.map((item) => ({
    ...item,
    customImage: (item.isCustom && file) ? { url: file.path, publicId: file.filename } : item.customImage,
  }))

  let attempts = 0
  while (attempts < 5) {
    attempts++
    let orderNumber = generateOrderNumber()
    try {
      const order = await Order.create({
        orderNumber,
        user: data.user,
        items,
        notes: data.notes || '',
        shipping: data.shipping,
        deliveryMethod: data.deliveryMethod || 'courier',
        pricing: data.pricing,
        couponCode: data.couponCode,
        status: 'payment_pending',
        statusHistory: [{ status: 'payment_pending', note: 'Order placed, awaiting payment verification' }],
      })
      return order
    } catch (err) {
      if (err.code === 11000 && attempts < 5) {
        continue // Retry with fresh orderNumber if collision occurs
      }
      throw err
    }
  }
}

export async function getOrderByNumber(orderNumber) {
  const order = await Order.findOne({ orderNumber }).populate('payment').populate('items.product')
  if (!order) {
    const error = new Error('Order not found')
    error.statusCode = 404
    throw error
  }
  return order
}

export async function getOrdersByPhone(phone) {
  const rawPhone = phone.replace(/\D/g, '')
  const last10 = rawPhone.slice(-10) || phone
  return await Order.find({
    'shipping.phone': { $regex: last10, $options: 'i' }
  }).populate('payment').populate('items.product').sort('-createdAt')
}

export async function getOrders(statusFilter) {
  const filter = statusFilter ? { status: statusFilter } : {}
  return await Order.find(filter).populate('payment').populate('items.product').sort('-createdAt')
}

export async function updateOrderStatus(id, status, note) {
  const backendStatus = status === 'pending' ? 'payment_pending' : status
  let order = null

  if (id && id.length === 24) {
    order = await Order.findById(id).catch(() => null)
  }
  if (!order && id) {
    order = await Order.findOne({ orderNumber: id }).catch(() => null)
  }

  if (order) {
    order.status = backendStatus
    order.statusHistory.push({ status: backendStatus, note: note || `Status updated to ${backendStatus}` })
    await order.save()

    if (order.payment && backendStatus === 'verified') {
      await Payment.findByIdAndUpdate(order.payment, { status: 'verified', verifiedAt: new Date() }).catch(() => { })
    } else if (order.payment && backendStatus === 'rejected') {
      await Payment.findByIdAndUpdate(order.payment, { status: 'rejected' }).catch(() => { })
    }

    if (backendStatus === 'shipped') {
      let recipientEmail = order.shipping?.email
      if (!recipientEmail && order.user) {
        try {
          const User = (await import('../models/User.js')).default
          const userDoc = await User.findById(order.user)
          if (userDoc?.email) recipientEmail = userDoc.email
        } catch { }
      }
      if (!recipientEmail && order.shipping?.phone) {
        try {
          const User = (await import('../models/User.js')).default
          const rawPhone = order.shipping.phone.replace(/\D/g, '')
          const last10 = rawPhone.slice(-10)
          if (last10) {
            const userDoc = await User.findOne({ phone: { $regex: last10 } })
            if (userDoc?.email) recipientEmail = userDoc.email
          }
        } catch { }
      }

      if (recipientEmail) {
        console.log(`🚀 Dispatching shipping notification email for Order #${order.orderNumber} to ${recipientEmail}`)
        const { sendShippingNotificationEmail } = await import('./emailService.js')
        sendShippingNotificationEmail(order, recipientEmail).catch((err) => {
          console.error('❌ Failed to send shipping notification email:', err)
        })
      } else {
        console.warn(`⚠️ Could not send shipping notification for Order #${order.orderNumber}: No email provided in shipping or user account.`)
      }
    }

    return order
  }

  return { _id: id, orderNumber: id, status: backendStatus }
}
