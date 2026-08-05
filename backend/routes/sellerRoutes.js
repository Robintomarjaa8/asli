import express from 'express';
import {
  getSellerDashboard,
  getSellerAnalytics,
  getSellerInventory,
  getSellerEarnings,
  getSellerReviews,
} from '../controllers/sellerController.js';
import { protect, authorizeSeller } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect, authorizeSeller);

router.get('/dashboard', getSellerDashboard);
router.get('/analytics', getSellerAnalytics);
router.get('/inventory', getSellerInventory);
router.get('/earnings', getSellerEarnings);
router.get('/reviews', getSellerReviews);

export default router;