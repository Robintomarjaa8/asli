import express from 'express';
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
  checkWishlist,
} from '../controllers/wishlistController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getWishlist);
router.post('/', addToWishlist);
router.delete('/', clearWishlist);
router.get('/check/:productId', checkWishlist);
router.delete('/:productId', removeFromWishlist);

export default router;