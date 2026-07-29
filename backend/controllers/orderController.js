import asyncHandler from 'express-async-handler'
import * as orderService from '../services/orderService.js'

export const parseOrderPayload = (req, res, next) => {
  if (typeof req.body.payload === 'string') {
    try {
      req.body = { ...JSON.parse(req.body.payload) }
    } catch {
      return res.status(400).json({ message: 'Invalid payload JSON' })
    }
  }
  next()
}

export const createOrder = asyncHandler(async (req, res) => {
  if (req.user) {
    req.body.user = req.user._id
  }
  const order = await orderService.createOrder(req.body, req.file)
  res.status(201).json(order)
})

export const getOrderByNumber = asyncHandler(async (req, res) => {
  const order = await orderService.getOrderByNumber(req.params.orderNumber)
  res.json(order)
})

export const getOrdersByPhone = asyncHandler(async (req, res) => {
  if (req.user && req.user.phone !== req.params.phone && !req.admin) {
    res.status(403)
    throw new Error('Access denied to requested order history')
  }
  const orders = await orderService.getOrdersByPhone(req.params.phone)
  res.json(orders)
})

export const getOrders = asyncHandler(async (req, res) => {
  const orders = await orderService.getOrders(req.query.status)
  res.json(orders)
})

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, note } = req.body
  const result = await orderService.updateOrderStatus(req.params.id, status, note)
  res.json(result)
})

export const uploadCustomImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' })
  }
  res.status(200).json({
    url: req.file.path,
    publicId: req.file.filename,
  })
})

