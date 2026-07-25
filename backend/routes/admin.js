import express from 'express'
import { protectAdmin } from '../middleware/auth.js'
import { getAdminStats } from '../controllers/adminController.js'

const router = express.Router()

router.get('/stats', protectAdmin, getAdminStats)

export default router
