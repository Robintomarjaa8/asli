import express from 'express';
import {
  getProductReviews,
  createReview,
  updateReview,
  deleteReview,
  markHelpful,
  sellerReply,
} from '../controllers/reviewController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/product/:productId', getProductReviews);

// Protected routes
router.post('/', protect, createReview);
router.put('/:id', protect, updateReview);
router.delete('/:id', protect, deleteReview);
router.post('/:id/helpful', protect, markHelpful);
router.post('/:id/reply', protect, authorize('seller', 'admin'), sellerReply);

export default router;