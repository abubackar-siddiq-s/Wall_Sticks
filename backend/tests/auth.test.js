import request from 'supertest'
import { connect, closeDatabase, clearDatabase } from './setup.js'
import { buildTestApp } from './testApp.js'
import Admin from '../models/Admin.js'

const app = buildTestApp()

beforeAll(async () => { await connect() })
afterEach(async () => { await clearDatabase() })
afterAll(async () => { await closeDatabase() })

describe('Admin auth', () => {
  test('rejects malformed email', async () => {
    const res = await request(app).post('/api/auth/admin/login').send({ email: 'not-an-email', password: 'x' })
    expect(res.status).toBe(400)
  })

  test('rejects login for a non-existent admin', async () => {
    const res = await request(app).post('/api/auth/admin/login').send({ email: 'nobody@posterwall.in', password: 'whatever' })
    expect(res.status).toBe(401)
  })

  test('rejects the wrong password', async () => {
    await Admin.create({ email: 'admin@posterwall.in', password: 'CorrectHorse123!' })
    const res = await request(app).post('/api/auth/admin/login').send({ email: 'admin@posterwall.in', password: 'WrongPassword' })
    expect(res.status).toBe(401)
  })

  test('issues a JWT on correct credentials, and the password hash is never returned', async () => {
    await Admin.create({ email: 'admin@posterwall.in', password: 'CorrectHorse123!' })
    const res = await request(app).post('/api/auth/admin/login').send({ email: 'admin@posterwall.in', password: 'CorrectHorse123!' })
    expect(res.status).toBe(200)
    expect(typeof res.body.token).toBe('string')
    expect(res.body.admin.email).toBe('admin@posterwall.in')
    expect(res.body.admin.password).toBeUndefined()
  })
})
