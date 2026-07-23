import request from 'supertest'
import { connect, closeDatabase, clearDatabase } from './setup.js'
import { buildTestApp } from './testApp.js'
import Admin from '../models/Admin.js'
import Category from '../models/Category.js'
import Product from '../models/Product.js'

const app = buildTestApp()

beforeAll(async () => { await connect() })
afterEach(async () => { await clearDatabase() })
afterAll(async () => { await closeDatabase() })

async function loginToken() {
  await Admin.create({ email: 'admin@posterwall.in', password: 'CorrectHorse123!' })
  const res = await request(app).post('/api/auth/admin/login').send({ email: 'admin@posterwall.in', password: 'CorrectHorse123!' })
  return res.body.token
}

describe('Product catalog', () => {
  test('rejects creating a product without admin auth', async () => {
    const res = await request(app).post('/api/products').send({ name: 'Test Poster', price: 399, category: 'nature' })
    expect(res.status).toBe(401)
  })

  test('rejects a negative price', async () => {
    const token = await loginToken()
    const category = await Category.create({ name: 'Nature', slug: 'nature' })
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Test Poster', price: -50, category: category._id.toString() })
    expect(res.status).toBe(400)
  })

  test('creates and lists a product', async () => {
    const token = await loginToken()
    const category = await Category.create({ name: 'Nature', slug: 'nature' })
    const createRes = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Quiet Mountains', slug: 'quiet-mountains', price: 449, category: category._id.toString() })
    expect(createRes.status).toBe(201)

    const listRes = await request(app).get('/api/products')
    expect(listRes.status).toBe(200)
    expect(listRes.body.total).toBe(1)
    expect(listRes.body.products[0].name).toBe('Quiet Mountains')
  })

  test('filters products by maxPrice', async () => {
    const token = await loginToken()
    const category = await Category.create({ name: 'Nature', slug: 'nature' })
    await Product.create({ name: 'Cheap Poster', slug: 'cheap', price: 299, category: category._id })
    await Product.create({ name: 'Pricey Poster', slug: 'pricey', price: 1200, category: category._id })

    const res = await request(app).get('/api/products').query({ maxPrice: 500 })
    expect(res.status).toBe(200)
    expect(res.body.products).toHaveLength(1)
    expect(res.body.products[0].name).toBe('Cheap Poster')
  })

  test('rejects an invalid sort value', async () => {
    const res = await request(app).get('/api/products').query({ sort: 'most-expensive-first' })
    expect(res.status).toBe(400)
  })
})
