import express from 'express';
import {
  createOrder,
  verifyPayment,
  getMyOrders,
  getOrder,
  cancelOrder,
  trackOrder,
  getSellerOrders,
  updateOrderItemStatus,
  getAllOrders,
} from '../controllers/orderController.js';
import { protect, authorize, authorizeSeller } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/track/:orderNumber', trackOrder);

// Protected - buyer
router.post('/', protect, createOrder);
router.post('/verify-payment', protect, verifyPayment);
router.get('/my-orders', protect, getMyOrders);
router.put('/:id/cancel', protect, cancelOrder);

// Protected - seller
router.get('/seller/orders', protect, authorizeSeller, getSellerOrders);
router.put('/item/:itemId/status', protect, authorize('seller', 'admin'), updateOrderItemStatus);

// Protected - admin
router.get('/admin/all', protect, authorize('admin'), getAllOrders);

// Must be after specific routes
router.get('/:id', protect, getOrder);

export default router;