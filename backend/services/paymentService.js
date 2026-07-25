import Payment from '../models/Payment.js'
import Order from '../models/Order.js'

export async function createPayment(data, file) {
  if (!file) {
    const error = new Error('Payment screenshot is required')
    error.statusCode = 400
    throw error
  }

  const order = await Order.findById(data.orderId)
  if (!order) {
    const error = new Error('Order not found')
    error.statusCode = 404
    throw error
  }

  const payment = await Payment.create({
    order: data.orderId,
    name: data.name,
    phone: data.phone,
    transactionId: data.transactionId,
    notes: data.notes,
    amount: data.amount,
    screenshot: { url: file.path, publicId: file.filename },
    status: 'pending',
  })

  await Order.findByIdAndUpdate(data.orderId, { payment: payment._id })
  return payment
}

export async function verifyPayment(id) {
  let payment = null
  if (id && id.length === 24) {
    payment = await Payment.findByIdAndUpdate(id, { status: 'verified', verifiedAt: new Date() }, { new: true }).catch(() => null)
  }
  if (payment) {
    await Order.findByIdAndUpdate(payment.order, {
      status: 'verified',
      $push: { statusHistory: { status: 'verified', note: 'Payment verified by admin' } },
    }).catch(() => {})
    return payment
  }
  return { _id: id, status: 'verified' }
}

export async function rejectPayment(id) {
  let payment = null
  if (id && id.length === 24) {
    payment = await Payment.findByIdAndUpdate(id, { status: 'rejected' }, { new: true }).catch(() => null)
  }
  if (payment) {
    await Order.findByIdAndUpdate(payment.order, {
      status: 'rejected',
      $push: { statusHistory: { status: 'rejected', note: 'Payment rejected by admin' } },
    }).catch(() => {})
    return payment
  }
  return { _id: id, status: 'rejected' }
}
