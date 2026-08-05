import express from 'express';
import {
  getDashboardStats,
  getUsers,
  getSellers,
  approveSeller,
  toggleUserStatus,
  getAdminProducts,
  approveProduct,
  toggleFeatured,
  getAdminOrders,
  getAdminReviews,
  updateReviewStatus,
  getAdminCategories,
  getAnalytics,
  deleteUser,
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect, authorize('admin'));

// Dashboard
router.get('/dashboard', getDashboardStats);
router.get('/analytics', getAnalytics);

// Users
router.get('/users', getUsers);
router.put('/users/:id/toggle', toggleUserStatus);
router.delete('/users/:id', deleteUser);

// Sellers
router.get('/sellers', getSellers);
router.put('/sellers/:id/approve', approveSeller);

// Products
router.get('/products', getAdminProducts);
router.put('/products/:id/approve', approveProduct);
router.put('/products/:id/featured', toggleFeatured);

// Orders
router.get('/orders', getAdminOrders);

// Reviews
router.get('/reviews', getAdminReviews);
router.put('/reviews/:id/status', updateReviewStatus);

// Categories
router.get('/categories', getAdminCategories);

export default router;