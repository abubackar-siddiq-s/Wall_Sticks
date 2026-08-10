import request from 'supertest'
import { connect, closeDatabase, clearDatabase } from './setup.js'
import { buildTestApp } from './testApp.js'
import Admin from '../models/Admin.js'
import Order from '../models/Order.js'
import Payment from '../models/Payment.js'

const app = buildTestApp()

const sampleOrderPayload = () => ({
  items: [{ name: 'Midnight Skyline', size: 'A3', finish: 'Premium Matte', border: 'White', quantity: 2, price: 399 }],
  shipping: { name: 'Rahul Verma', phone: '9000011122', address: '221B Anna Salai', city: 'Chennai', state: 'TN', pincode: '600002' },
  deliveryMethod: 'courier',
  pricing: { subtotal: 798, courierCharge: 79, total: 877 },
})

async function createAdmin() {
  return Admin.create({ email: 'admin@posterwall.in', password: 'SuperSecret123!', name: 'Test Admin' })
}

async function loginAsAdmin() {
  const res = await request(app).post('/api/auth/admin/login').send({ email: 'admin@posterwall.in', password: 'SuperSecret123!' })
  return res.body.token
}

beforeAll(async () => { await connect() })
afterEach(async () => { await clearDatabase() })
afterAll(async () => { await closeDatabase() })

describe('Order creation', () => {
  test('rejects an order with no items', async () => {
    const res = await request(app).post('/api/orders').send({ ...sampleOrderPayload(), items: [] })
    expect(res.status).toBe(400)
    expect(res.body.errors.some((e) => e.field === 'items')).toBe(true)
  })

  test('rejects an order missing shipping phone', async () => {
    const payload = sampleOrderPayload()
    delete payload.shipping.phone
    const res = await request(app).post('/api/orders').send(payload)
    expect(res.status).toBe(400)
  })

  test('creates an order with custom border and color hex', async () => {
    const payload = sampleOrderPayload()
    payload.items[0].border = 'Custom Border (#C1272D)'
    payload.items[0].borderColor = '#C1272D'

    const res = await request(app).post('/api/orders').send(payload)
    expect(res.status).toBe(201)
    expect(res.body.items[0].border).toBe('Custom Border (#C1272D)')
    expect(res.body.items[0].borderColor).toBe('#C1272D')
  })
})

describe('Payment submission does NOT auto-verify', () => {
  test('a submitted payment stays pending until an admin acts on it', async () => {
    const orderRes = await request(app).post('/api/orders').send(sampleOrderPayload())
    const orderId = orderRes.body._id

    const paymentRes = await request(app)
      .post('/api/payments')
      .field('orderId', orderId)
      .field('name', 'Rahul Verma')
      .field('phone', '9000011122')
      .field('transactionId', 'UPI2026071812345')
      .attach('screenshot', Buffer.from('fake-image-bytes'), { filename: 'proof.png', contentType: 'image/png' })

    expect(paymentRes.status).toBe(201)
    expect(paymentRes.body.status).toBe('pending')

    // Crucially: the order itself must still be payment_pending, not auto-flipped to verified
    const orderAfter = await Order.findById(orderId)
    expect(orderAfter.status).toBe('payment_pending')
    expect(orderAfter.payment.toString()).toBe(paymentRes.body._id)
  })

  test('rejects a payment submission with no screenshot', async () => {
    const orderRes = await request(app).post('/api/orders').send(sampleOrderPayload())
    const res = await request(app)
      .post('/api/payments')
      .field('orderId', orderRes.body._id)
      .field('name', 'Rahul Verma')
      .field('phone', '9000011122')
      .field('transactionId', 'UPI2026071812345')
    expect(res.status).toBe(400)
  })

  test('rejects a payment submission with an invalid orderId', async () => {
    const res = await request(app)
      .post('/api/payments')
      .field('orderId', 'not-a-valid-id')
      .field('name', 'Rahul Verma')
      .field('phone', '9000011122')
      .field('transactionId', 'UPI2026071812345')
      .attach('screenshot', Buffer.from('fake-image-bytes'), { filename: 'proof.png', contentType: 'image/png' })
    expect(res.status).toBe(400)
  })
})

describe('Admin verification flow', () => {
  async function createOrderWithPayment() {
    const orderRes = await request(app).post('/api/orders').send(sampleOrderPayload())
    const orderId = orderRes.body._id
    const paymentRes = await request(app)
      .post('/api/payments')
      .field('orderId', orderId)
      .field('name', 'Rahul Verma')
      .field('phone', '9000011122')
      .field('transactionId', 'UPI2026071812345')
      .attach('screenshot', Buffer.from('fake-image-bytes'), { filename: 'proof.png', contentType: 'image/png' })
    return { orderId, paymentId: paymentRes.body._id }
  }

  test('unauthenticated requests cannot verify a payment', async () => {
    const { paymentId } = await createOrderWithPayment()
    const res = await request(app).put(`/api/payments/${paymentId}/verify`)
    expect(res.status).toBe(401)
  })

  test('an authenticated admin can verify a payment, flipping the order to verified', async () => {
    await createAdmin()
    const token = await loginAsAdmin()
    const { orderId, paymentId } = await createOrderWithPayment()

    const verifyRes = await request(app)
      .put(`/api/payments/${paymentId}/verify`)
      .set('Authorization', `Bearer ${token}`)
    expect(verifyRes.status).toBe(200)
    expect(verifyRes.body.status).toBe('verified')

    const order = await Order.findById(orderId)
    expect(order.status).toBe('verified')
    expect(order.statusHistory.some((h) => h.status === 'verified')).toBe(true)
  })

  test('an authenticated admin can reject a payment, flipping the order to rejected', async () => {
    await createAdmin()
    const token = await loginAsAdmin()
    const { orderId, paymentId } = await createOrderWithPayment()

    const rejectRes = await request(app)
      .put(`/api/payments/${paymentId}/reject`)
      .set('Authorization', `Bearer ${token}`)
    expect(rejectRes.status).toBe(200)
    expect(rejectRes.body.status).toBe('rejected')

    const order = await Order.findById(orderId)
    expect(order.status).toBe('rejected')
  })

  test('order status cannot be set to a bogus value', async () => {
    await createAdmin()
    const token = await loginAsAdmin()
    const orderRes = await request(app).post('/api/orders').send(sampleOrderPayload())

    const res = await request(app)
      .put(`/api/orders/${orderRes.body._id}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'teleported' })
    expect(res.status).toBe(400)
  })

  test('a verified order can be progressed through printing -> packed -> shipped -> delivered', async () => {
    await createAdmin()
    const token = await loginAsAdmin()
    const { orderId, paymentId } = await createOrderWithPayment()
    await request(app).put(`/api/payments/${paymentId}/verify`).set('Authorization', `Bearer ${token}`)

    for (const status of ['printing', 'packed', 'shipped', 'delivered']) {
      const res = await request(app)
        .put(`/api/orders/${orderId}/status`)
        .set('Authorization', `Bearer ${token}`)
        .send({ status })
      expect(res.status).toBe(200)
      expect(res.body.status).toBe(status)
    }

    const finalOrder = await Order.findById(orderId)
    expect(finalOrder.status).toBe('delivered')
    expect(finalOrder.statusHistory.map((h) => h.status)).toEqual(
      expect.arrayContaining(['payment_pending', 'verified', 'printing', 'packed', 'shipped', 'delivered'])
    )
  })
})
