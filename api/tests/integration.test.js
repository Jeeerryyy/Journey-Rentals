import request from 'supertest'
import express from 'express'
import app from '../src/app.js'

describe('Integration Tests: Booking Extension', () => {
  it('PATCH /api/bookings/:id/request-extension should return 401 without auth', async () => {
    const res = await request(app).patch('/api/bookings/123/request-extension')
    expect(res.statusCode).toBe(401)
  })

  // We are mostly testing that the routes exist and the rate limit/auth middleware blocks us
  // properly without complex mocking of the database.
  
  it('PUT /api/owner/bookings/:id should return 401 without admin auth', async () => {
    const res = await request(app).put('/api/owner/bookings/123').send({ extensionStatus: 'approved' })
    expect(res.statusCode).toBe(401)
  })

  it('GET /api/owner/dashboard should return 401 without admin auth', async () => {
    const res = await request(app).get('/api/owner/dashboard')
    expect(res.statusCode).toBe(401)
  })
})
