import Order from '../models/Order.js'

const generateOrderNumber = () => 'PW' + Math.floor(100000 + Math.random() * 900000)

export async function createOrder(data, file) {
  let orderNumber = generateOrderNumber()
  while (await Order.findOne({ orderNumber })) {
    orderNumber = generateOrderNumber()
  }

  const items = data.items.map((item) => ({
    ...item,
    customImage: (item.isCustom && file) ? { url: file.path, publicId: file.filename } : item.customImage,
  }))

  const order = await Order.create({
    orderNumber,
    items,
    shipping: data.shipping,
    deliveryMethod: data.deliveryMethod || 'courier',
    pricing: data.pricing,
    couponCode: data.couponCode,
    status: 'payment_pending',
    statusHistory: [{ status: 'payment_pending', note: 'Order placed, awaiting payment verification' }],
  })

  return order
}

export async function getOrderByNumber(orderNumber) {
  const order = await Order.findOne({ orderNumber }).populate('payment')
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
  }).populate('payment').sort('-createdAt')
}

export async function getOrders(statusFilter) {
  const filter = statusFilter ? { status: statusFilter } : {}
  return await Order.find(filter).populate('payment').sort('-createdAt')
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
      await Payment.findByIdAndUpdate(order.payment, { status: 'verified', verifiedAt: new Date() }).catch(() => {})
    } else if (order.payment && backendStatus === 'rejected') {
      await Payment.findByIdAndUpdate(order.payment, { status: 'rejected' }).catch(() => {})
    }
    return order
  }

  return { _id: id, orderNumber: id, status: backendStatus }
}
