import express from 'express'
import * as categoryController from '../controllers/categoryController.js'
import { protectAdmin } from '../middleware/auth.js'

const router = express.Router()

router.get('/', categoryController.getCategories)
router.post('/', protectAdmin, categoryController.createCategory)
router.put('/:id', protectAdmin, categoryController.updateCategory)
router.delete('/:id', protectAdmin, categoryController.deleteCategory)

export default router
