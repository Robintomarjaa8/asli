import express from 'express';
import {
  getProducts,
  getProduct,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
  getSellerProducts,
  uploadProductImages,
  getFeaturedProducts,
  getProductsByCategory,
  getRecentProducts,
  getBestSellers,
  getBrands,
  updateStock,
} from '../controllers/productController.js';
import { protect, authorize, authorizeSeller } from '../middleware/authMiddleware.js';
import { uploadImages } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/recent', getRecentProducts);
router.get('/best-sellers', getBestSellers);
router.get('/brands', getBrands);
router.get('/category/:categoryId', getProductsByCategory);
router.get('/slug/:slug', getProductBySlug);
router.get('/seller/products', protect, authorizeSeller, getSellerProducts);

// Protected routes
router.post('/', protect, authorizeSeller, uploadImages, createProduct);
router.put('/:id', protect, authorize('seller', 'admin'), uploadImages, updateProduct);
router.delete('/:id', protect, authorize('seller', 'admin'), deleteProduct);
router.put('/:id/stock', protect, authorizeSeller, updateStock);
router.post('/upload', protect, authorizeSeller, uploadImages, uploadProductImages);

// Must be after /seller/products and /slug/:slug
router.get('/:id', getProduct);

export default router;