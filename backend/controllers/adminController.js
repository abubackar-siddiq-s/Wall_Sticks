import asyncHandler from 'express-async-handler'
import * as statsService from '../services/statsService.js'

export const getAdminStats = asyncHandler(async (req, res) => {
  const stats = await statsService.getAdminStats()
  res.json(stats)
})
