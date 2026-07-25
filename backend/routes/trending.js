import express from 'express'
import * as trendingController from '../controllers/trendingController.js'
import { protectAdmin } from '../middleware/auth.js'

const router = express.Router()

router.get('/', trendingController.getTrending)
router.post('/', protectAdmin, trendingController.addTrending)
router.put('/reorder', protectAdmin, trendingController.reorderTrending)
router.delete('/:id', protectAdmin, trendingController.removeTrending)

export default router
