import request from 'supertest'
import { connect, closeDatabase, clearDatabase } from './setup.js'
import { buildTestApp } from './testApp.js'
import Category from '../models/Category.js'
import Product from '../models/Product.js'

const app = buildTestApp()

beforeAll(async () => { await connect() })
afterEach(async () => { await clearDatabase() })
afterAll(async () => { await closeDatabase() })

async function createProduct() {
  const category = await Category.create({ name: 'Nature', slug: 'nature' })
  return Product.create({ name: 'Quiet Mountains', slug: 'quiet-mountains', price: 449, category: category._id })
}

describe('Cart (session-based, no login required)', () => {
  test('returns an empty cart for a brand-new session', async () => {
    const res = await request(app).get('/api/cart/session-abc')
    expect(res.status).toBe(200)
    expect(res.body.items).toEqual([])
  })

  test('saves and retrieves cart items for a session', async () => {
    const product = await createProduct()
    const putRes = await request(app)
      .put('/api/cart/session-abc')
      .send({ items: [{ product: product._id, size: 'A3', finish: 'Premium Matte', quantity: 2, priceAtAdd: 449 }] })
    expect(putRes.status).toBe(200)
    expect(putRes.body.items).toHaveLength(1)

    const getRes = await request(app).get('/api/cart/session-abc')
    expect(getRes.body.items).toHaveLength(1)
    expect(getRes.body.items[0].quantity).toBe(2)
    expect(getRes.body.items[0].product.name).toBe('Quiet Mountains') // populated
  })

  test('two different sessions never see each other\'s carts', async () => {
    const product = await createProduct()
    await request(app).put('/api/cart/session-A').send({ items: [{ product: product._id, quantity: 1 }] })

    const otherSession = await request(app).get('/api/cart/session-B')
    expect(otherSession.body.items).toEqual([])
  })

  test('clearing a cart empties it without deleting the document', async () => {
    const product = await createProduct()
    await request(app).put('/api/cart/session-abc').send({ items: [{ product: product._id, quantity: 1 }] })
    const clearRes = await request(app).delete('/api/cart/session-abc')
    expect(clearRes.status).toBe(200)

    const getRes = await request(app).get('/api/cart/session-abc')
    expect(getRes.body.items).toEqual([])
  })
})

describe('Wishlist (session-based)', () => {
  test('toggling a product adds it, toggling again removes it', async () => {
    const product = await createProduct()

    const addRes = await request(app).post('/api/wishlist/session-abc/toggle').send({ productId: product._id })
    expect(addRes.status).toBe(200)
    expect(addRes.body.products.map(String)).toContain(product._id.toString())

    const removeRes = await request(app).post('/api/wishlist/session-abc/toggle').send({ productId: product._id })
    expect(removeRes.body.products).toHaveLength(0)
  })

  test('a fresh session has an empty wishlist', async () => {
    const res = await request(app).get('/api/wishlist/brand-new-session')
    expect(res.status).toBe(200)
    expect(res.body.products).toEqual([])
  })
})
