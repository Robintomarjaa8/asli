import express from 'express';
import {
  getCategories,
  getCategory,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
  getFeaturedCategories,
} from '../controllers/categoryController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getCategories);
router.get('/featured', getFeaturedCategories);
router.get('/slug/:slug', getCategoryBySlug);

// Protected routes
router.post('/', protect, authorize('admin'), createCategory);
router.put('/:id', protect, authorize('admin'), updateCategory);
router.delete('/:id', protect, authorize('admin'), deleteCategory);

// Must be after /featured and /slug/:slug
router.get('/:id', getCategory);

export default router;