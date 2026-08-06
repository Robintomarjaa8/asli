import Product from '../models/Product.js';
import Category from '../models/Category.js';
import Review from '../models/Review.js';
import asyncHandler from '../utils/asyncHandler.js';
import ErrorResponse from '../utils/errorResponse.js';

// @desc    Get all products
// @route   GET /api/products
// @access  Public
export const getProducts = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 12;
  const skip = (page - 1) * limit;

  // Build query
  const query = { status: 'approved', isActive: true };

  // Search
  if (req.query.search) {
    query.$text = { $search: req.query.search };
  }

  // Keyword search (alternative)
  if (req.query.keyword) {
    query.$or = [
      { name: { $regex: req.query.keyword, $options: 'i' } },
      { description: { $regex: req.query.keyword, $options: 'i' } },
      { brand: { $regex: req.query.keyword, $options: 'i' } },
      { tags: { $elemMatch: { $regex: req.query.keyword, $options: 'i' } } },
    ];
  }

  // Category filter
  if (req.query.category) {
    query.category = req.query.category;
  }

  // Category slug filter
  if (req.query.categorySlug) {
    const category = await Category.findOne({ slug: req.query.categorySlug });
    if (category) {
      query.category = category._id;
    }
  }

  // Brand filter
  if (req.query.brand) {
    query.brand = req.query.brand;
  }

  // Price range filter
  if (req.query.minPrice || req.query.maxPrice) {
    query.price = {};
    if (req.query.minPrice) query.price.$gte = Number(req.query.minPrice);
    if (req.query.maxPrice) query.price.$lte = Number(req.query.maxPrice);
  }

  // Rating filter
  if (req.query.rating) {
    query['ratings.average'] = { $gte: Number(req.query.rating) };
  }

  // In stock filter
  if (req.query.inStock === 'true') {
    query['inventory.status'] = { $ne: 'out_of_stock' };
  }

  // Featured filter
  if (req.query.featured === 'true') {
    query.isFeatured = true;
  }

  // Discount filter
  if (req.query.discount) {
    query.discount = { $gte: Number(req.query.discount) };
  }

  // Sorting
  let sort = {};
  switch (req.query.sort) {
    case 'price_asc':
      sort = { price: 1 };
      break;
    case 'price_desc':
      sort = { price: -1 };
      break;
    case 'newest':
      sort = { createdAt: -1 };
      break;
    case 'rating':
      sort = { 'ratings.average': -1 };
      break;
    case 'popular':
      sort = { quantitySold: -1 };
      break;
    case 'discount':
      sort = { discount: -1 };
      break;
    default:
      sort = { createdAt: -1 };
  }

  const total = await Product.countDocuments(query);
  const products = await Product.find(query)
    .populate('category', 'name slug')
    .populate('seller', 'name sellerProfile')
    .sort(sort)
    .skip(skip)
    .limit(limit);

  // Get distinct brands for filters
  const brands = await Product.distinct('brand', { status: 'approved', isActive: true });

  res.status(200).json({
    success: true,
    count: products.length,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    brands,
    data: products,
  });
});

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
export const getProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id)
    .populate('category', 'name slug')
    .populate('seller', 'name email sellerProfile avatar')
    .populate('relatedProducts', 'name price mrp images ratings inventory');

  if (!product) {
    return next(new ErrorResponse('Product not found', 404));
  }

  // Increment view count using atomic update (non-blocking, no full save)
  Product.updateOne({ _id: product._id }, { $inc: { viewCount: 1 } }).exec();

  // Get reviews
  const reviews = await Review.find({ product: product._id, status: 'approved' })
    .populate('user', 'name avatar')
    .sort('-createdAt')
    .limit(10);

  // Get related products (products in same category)
  let relatedProducts = product.relatedProducts;
  if (!relatedProducts || relatedProducts.length === 0) {
    relatedProducts = await Product.find({
      category: product.category,
      _id: { $ne: product._id },
      status: 'approved',
      isActive: true,
    })
      .limit(4)
      .select('name price mrp images ratings inventory');
  }

  res.status(200).json({
    success: true,
    data: product,
    reviews,
    relatedProducts,
  });
});

// @desc    Get product by slug
// @route   GET /api/products/slug/:slug
// @access  Public
export const getProductBySlug = asyncHandler(async (req, res, next) => {
  const product = await Product.findOne({ slug: req.params.slug })
    .populate('category', 'name slug')
    .populate('seller', 'name email sellerProfile avatar')
    .populate('relatedProducts', 'name price mrp images ratings inventory');

  if (!product) {
    return next(new ErrorResponse('Product not found', 404));
  }

  // Increment view count using atomic update (non-blocking, no full save)
  Product.updateOne({ _id: product._id }, { $inc: { viewCount: 1 } }).exec();

  const reviews = await Review.find({ product: product._id, status: 'approved' })
    .populate('user', 'name avatar')
    .sort('-createdAt')
    .limit(10);

  let relatedProducts = product.relatedProducts;
  if (!relatedProducts || relatedProducts.length === 0) {
    relatedProducts = await Product.find({
      category: product.category,
      _id: { $ne: product._id },
      status: 'approved',
      isActive: true,
    })
      .limit(4)
      .select('name price mrp images ratings inventory');
  }

  res.status(200).json({
    success: true,
    data: product,
    reviews,
    relatedProducts,
  });
});

// @desc    Create product
// @route   POST /api/products
// @access  Private (Seller)
export const createProduct = asyncHandler(async (req, res, next) => {
  req.body.seller = req.user.id;

  // Parse images from files
  if (req.files && req.files.length > 0) {
    req.body.images = req.files.map((file) => ({
      url: file.path && file.path.startsWith('http') ? file.path : `/uploads/${file.filename}`,
      public_id: file.filename || '',
      alt: req.body.name || '',
    }));
  } else if (!req.body.images) {
    // Use placeholder image if no images uploaded
    req.body.images = [{
      url: 'https://placehold.co/500x500/png?text=No+Image',
      public_id: '',
      alt: req.body.name || 'Product image',
    }];
  }

  // Parse JSON strings from form data
  if (req.body.specifications && typeof req.body.specifications === 'string') {
    req.body.specifications = JSON.parse(req.body.specifications);
  }
  if (req.body.tags && typeof req.body.tags === 'string') {
    req.body.tags = JSON.parse(req.body.tags);
  }
  if (req.body.colorVariants && typeof req.body.colorVariants === 'string') {
    req.body.colorVariants = JSON.parse(req.body.colorVariants);
  }
  if (req.body.sizeVariants && typeof req.body.sizeVariants === 'string') {
    req.body.sizeVariants = JSON.parse(req.body.sizeVariants);
  }
  if (req.body.shippingDetails && typeof req.body.shippingDetails === 'string') {
    req.body.shippingDetails = JSON.parse(req.body.shippingDetails);
  }

  // New products need admin approval
  req.body.status = 'pending';
  req.body.isApproved = false;

  const product = await Product.create(req.body);

  res.status(201).json({
    success: true,
    data: product,
  });
});

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private (Seller)
export const updateProduct = asyncHandler(async (req, res, next) => {
  let product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorResponse('Product not found', 404));
  }

  // Check ownership
  if (product.seller.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to update this product', 403));
  }

  // Parse JSON strings from form data
  if (req.body.specifications && typeof req.body.specifications === 'string') {
    req.body.specifications = JSON.parse(req.body.specifications);
  }
  if (req.body.tags && typeof req.body.tags === 'string') {
    req.body.tags = JSON.parse(req.body.tags);
  }
  if (req.body.colorVariants && typeof req.body.colorVariants === 'string') {
    req.body.colorVariants = JSON.parse(req.body.colorVariants);
  }
  if (req.body.sizeVariants && typeof req.body.sizeVariants === 'string') {
    req.body.sizeVariants = JSON.parse(req.body.sizeVariants);
  }

  // Handle new images
  if (req.files && req.files.length > 0) {
    const newImages = req.files.map((file) => ({
      url: file.path && file.path.startsWith('http') ? file.path : `/uploads/${file.filename}`,
      public_id: file.filename || '',
      alt: req.body.name || '',
    }));
    req.body.images = [...(product.images || []), ...newImages];
  }

  // If product was edited, it needs re-approval
  if (req.user.role === 'seller') {
    req.body.status = 'pending';
    req.body.isApproved = false;
  }

  product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: product,
  });
});

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private (Seller)
export const deleteProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorResponse('Product not found', 404));
  }

  // Check ownership
  if (product.seller.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to delete this product', 403));
  }

  await product.deleteOne();

  res.status(200).json({
    success: true,
    data: {},
  });
});

// @desc    Get seller's products
// @route   GET /api/products/seller/products
// @access  Private (Seller)
export const getSellerProducts = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const query = { seller: req.user.id };

  if (req.query.status) {
    query.status = req.query.status;
  }

  const total = await Product.countDocuments(query);
  const products = await Product.find(query)
    .populate('category', 'name slug')
    .sort('-createdAt')
    .skip(skip)
    .limit(limit);

  res.status(200).json({
    success: true,
    count: products.length,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    data: products,
  });
});

// @desc    Upload product images
// @route   POST /api/products/upload
// @access  Private (Seller)
export const uploadProductImages = asyncHandler(async (req, res, next) => {
  if (!req.files || req.files.length === 0) {
    return next(new ErrorResponse('Please upload at least one image', 400));
  }

  const images = req.files.map((file) => ({
    url: file.path && file.path.startsWith('http') ? file.path : `/uploads/${file.filename}`,
    public_id: file.filename || '',
    alt: req.body.alt || '',
  }));

  res.status(200).json({
    success: true,
    data: images,
  });
});

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
export const getFeaturedProducts = asyncHandler(async (req, res, next) => {
  const products = await Product.find({
    isFeatured: true,
    status: 'approved',
    isActive: true,
  })
    .populate('category', 'name slug')
    .limit(8)
    .select('name price mrp images ratings inventory discount');

  res.status(200).json({
    success: true,
    count: products.length,
    data: products,
  });
});

// @desc    Get products by category
// @route   GET /api/products/category/:categoryId
// @access  Public
export const getProductsByCategory = asyncHandler(async (req, res, next) => {
  const products = await Product.find({
    category: req.params.categoryId,
    status: 'approved',
    isActive: true,
  })
    .populate('category', 'name slug')
    .limit(20);

  res.status(200).json({
    success: true,
    count: products.length,
    data: products,
  });
});

// @desc    Get recent products
// @route   GET /api/products/recent
// @access  Public
export const getRecentProducts = asyncHandler(async (req, res, next) => {
  const products = await Product.find({ status: 'approved', isActive: true })
    .sort('-createdAt')
    .limit(8)
    .select('name price mrp images ratings inventory discount');

  res.status(200).json({
    success: true,
    count: products.length,
    data: products,
  });
});

// @desc    Get best sellers
// @route   GET /api/products/best-sellers
// @access  Public
export const getBestSellers = asyncHandler(async (req, res, next) => {
  const products = await Product.find({ status: 'approved', isActive: true })
    .sort('-quantitySold')
    .limit(8)
    .select('name price mrp images ratings inventory discount');

  res.status(200).json({
    success: true,
    count: products.length,
    data: products,
  });
});

// @desc    Get all brands
// @route   GET /api/products/brands
// @access  Public
export const getBrands = asyncHandler(async (req, res, next) => {
  const brands = await Product.distinct('brand', { status: 'approved', isActive: true });

  res.status(200).json({
    success: true,
    count: brands.length,
    data: brands,
  });
});

// @desc    Update product stock
// @route   PUT /api/products/:id/stock
// @access  Private (Seller)
export const updateStock = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorResponse('Product not found', 404));
  }

  if (product.seller.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to update this product', 403));
  }

  product.inventory.stock = req.body.stock ?? product.inventory.stock;
  if (req.body.lowStockThreshold !== undefined) {
    product.inventory.lowStockThreshold = req.body.lowStockThreshold;
  }

  await product.save();

  res.status(200).json({
    success: true,
    data: product,
  });
});