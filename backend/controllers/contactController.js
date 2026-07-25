import asyncHandler from 'express-async-handler'
import ContactMessage from '../models/ContactMessage.js'

export const submitContactForm = asyncHandler(async (req, res) => {
  if (req.body.company) {
    // Honeypot tripped — pretend success
    return res.status(201).json({ message: 'Message sent' })
  }
  const { name, email, message } = req.body
  await ContactMessage.create({ name, email, message })
  res.status(201).json({ message: 'Message sent' })
})

export const getContactMessages = asyncHandler(async (req, res) => {
  const messages = await ContactMessage.find().sort('-createdAt')
  res.json(messages)
})

export const markMessageRead = asyncHandler(async (req, res) => {
  const message = await ContactMessage.findByIdAndUpdate(req.params.id, { read: true }, { new: true })
  res.json(message)
})

export const deleteContactMessage = asyncHandler(async (req, res) => {
  await ContactMessage.findByIdAndDelete(req.params.id)
  res.json({ message: 'Message deleted' })
})
