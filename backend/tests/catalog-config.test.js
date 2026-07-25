import request from 'supertest'
import { connect, closeDatabase, clearDatabase } from './setup.js'
import { buildTestApp } from './testApp.js'
import Admin from '../models/Admin.js'
import Category from '../models/Category.js'
import Product from '../models/Product.js'
import Trending from '../models/Trending.js'

const app = buildTestApp()

beforeAll(async () => { await connect() })
afterEach(async () => { await clearDatabase() })
afterAll(async () => { await closeDatabase() })

async function loginToken() {
  await Admin.create({ email: 'admin@posterwall.in', password: 'CorrectHorse123!' })
  const res = await request(app).post('/api/auth/admin/login').send({ email: 'admin@posterwall.in', password: 'CorrectHorse123!' })
  return res.body.token
}

describe('Categories', () => {
  test('lists only active categories, sorted by order', async () => {
    await Category.create({ name: 'Anime', slug: 'anime', order: 2, active: true })
    await Category.create({ name: 'Nature', slug: 'nature', order: 1, active: true })
    await Category.create({ name: 'Retired', slug: 'retired', order: 0, active: false })

    const res = await request(app).get('/api/categories')
    expect(res.status).toBe(200)
    expect(res.body.map((c) => c.slug)).toEqual(['nature', 'anime'])
  })

  test('rejects category creation without admin auth', async () => {
    const res = await request(app).post('/api/categories').send({ name: 'Sports', slug: 'sports' })
    expect(res.status).toBe(401)
  })
})

describe('Trending carousel', () => {
  test('admin can add a product to trending and reorder the list', async () => {
    const token = await loginToken()
    const category = await Category.create({ name: 'Nature', slug: 'nature' })
    const p1 = await Product.create({ name: 'Poster One', slug: 'poster-one', price: 399, category: category._id })
    const p2 = await Product.create({ name: 'Poster Two', slug: 'poster-two', price: 499, category: category._id })

    const t1 = await request(app).post('/api/trending').set('Authorization', `Bearer ${token}`).send({ productId: p1._id, order: 0 })
    const t2 = await request(app).post('/api/trending').set('Authorization', `Bearer ${token}`).send({ productId: p2._id, order: 1 })
    expect(t1.status).toBe(201)
    expect(t2.status).toBe(201)

    // Reorder: swap so p2 comes first
    const reorderRes = await request(app)
      .put('/api/trending/reorder')
      .set('Authorization', `Bearer ${token}`)
      .send({ items: [{ id: t2.body._id, order: 0 }, { id: t1.body._id, order: 1 }] })
    expect(reorderRes.status).toBe(200)

    const listRes = await request(app).get('/api/trending')
    expect(listRes.body[0].product._id.toString()).toBe(p2._id.toString())
  })

  test('rejects reordering without admin auth', async () => {
    const res = await request(app).put('/api/trending/reorder').send({ items: [] })
    expect(res.status).toBe(401)
  })
})

describe('Settings (singleton)', () => {
  test('GET creates a default settings document on first access', async () => {
    const res = await request(app).get('/api/settings')
    expect(res.status).toBe(200)
    expect(res.body.businessName).toBe('WallSticks')
  })

  test('rejects a negative courier charge', async () => {
    const token = await loginToken()
    const res = await request(app).put('/api/settings').set('Authorization', `Bearer ${token}`).send({ courierCharge: -10 })
    expect(res.status).toBe(400)
  })

  test('admin can update settings, and the change persists', async () => {
    const token = await loginToken()
    const res = await request(app).put('/api/settings').set('Authorization', `Bearer ${token}`).send({ courierCharge: 99, upiId: 'shop@upi' })
    expect(res.status).toBe(200)
    expect(res.body.courierCharge).toBe(99)

    const getRes = await request(app).get('/api/settings')
    expect(getRes.body.upiId).toBe('shop@upi')
  })
})

describe('Contact form spam protection', () => {
  test('accepts a legitimate message', async () => {
    const res = await request(app).post('/api/contact').send({ name: 'Rahul', email: 'rahul@example.com', message: 'Hi, when will my order ship?' })
    expect(res.status).toBe(201)
  })

  test('rejects a message with an invalid email', async () => {
    const res = await request(app).post('/api/contact').send({ name: 'Rahul', email: 'not-an-email', message: 'Hello there' })
    expect(res.status).toBe(400)
  })

  test('honeypot field silently drops the submission without erroring', async () => {
    const res = await request(app).post('/api/contact').send({ name: 'Bot', email: 'bot@example.com', message: 'buy cheap watches', company: 'FillingEveryField Inc' })
    expect(res.status).toBe(201) // looks like success to the bot...

    const token = await loginToken()
    const list = await request(app).get('/api/contact').set('Authorization', `Bearer ${token}`)
    expect(list.body).toHaveLength(0) // ...but nothing was actually saved
  })
})
