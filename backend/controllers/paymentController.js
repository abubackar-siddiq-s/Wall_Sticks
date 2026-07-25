import asyncHandler from 'express-async-handler'
import * as paymentService from '../services/paymentService.js'

export const createPayment = asyncHandler(async (req, res) => {
  const payment = await paymentService.createPayment(req.body, req.file)
  res.status(201).json(payment)
})

export const verifyPayment = asyncHandler(async (req, res) => {
  const payment = await paymentService.verifyPayment(req.params.id)
  res.json(payment)
})

export const rejectPayment = asyncHandler(async (req, res) => {
  const payment = await paymentService.rejectPayment(req.params.id)
  res.json(payment)
})
