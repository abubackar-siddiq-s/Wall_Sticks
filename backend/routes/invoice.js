import express from 'express'
import asyncHandler from 'express-async-handler'
import { generateInvoiceHtml } from '../services/invoiceService.js'

const router = express.Router()

router.get('/:orderNumber/receipt', asyncHandler(async (req, res) => {
  const html = await generateInvoiceHtml(req.params.orderNumber)
  res.set('Content-Type', 'text/html').send(html)
}))

export default router
