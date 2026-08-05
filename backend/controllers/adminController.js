import User from '../models/User.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import Category from '../models/Category.js';
import Review from '../models/Review.js';
import asyncHandler from '../utils/asyncHandler.js';
import ErrorResponse from '../utils/errorResponse.js';

// @desc    Get admin dashboard stats
// @route   GET /api/admin/dashboard
// @access  Private (Admin)
export const getDashboardStats = asyncHandler(async (req, res, next) => {
  // Basic counts
  const [totalUsers, totalSellers, totalProducts, totalOrders, totalCategories, totalReviews] =
    await Promise.all([
      User.countDocuments({ role: 'buyer' }),
      User.countDocuments({ role: 'seller' }),
      Product.countDocuments(),
      Order.countDocuments(),
      Category.countDocuments(),
      Review.countDocuments(),
    ]);

  // Revenue
  const revenueResult = await Order.aggregate([
    { $match: { paymentInfo: { $exists: true }, 'paymentInfo.status': 'paid' } },
    { $group: { _id: null, total: { $sum: '$totalPrice' } } },
  ]);
  const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

  // Pending sellers
  const pendingSellers = await User.countDocuments({
    role: 'seller',
    'sellerProfile.approvalStatus': 'pending',
  });

  // Pending products
  const pendingProducts = await Product.countDocuments({ status: 'pending' });

  // Recent orders
  const recentOrders = await Order.find()
    .populate('user', 'name email')
    .sort('-createdAt')
    .limit(5);

  // Recent products
  const recentProducts = await Product.find()
    .populate('seller', 'name')
    .sort('-createdAt')
    .limit(5);

  // Recent users
  const recentUsers = await User.find()
    .sort('-createdAt')
    .limit(5);

  // Monthly sales for last 6 months
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);

  const monthlySales = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: sixMonthsAgo },
        'paymentInfo.status': 'paid',
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
        total: { $sum: '$totalPrice' },
        orders: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  // Top selling products
  const topProducts = await Product.find({ status: 'approved' })
    .sort('-quantitySold')
    .limit(5)
    .select('name price images quantitySold sales');

  // Top sellers
  const topSellers = await User.find({ role: 'seller', 'sellerProfile.approvalStatus': 'approved' })
    .sort('-sellerProfile.totalEarnings')
    .limit(5)
    .select('name email avatar sellerProfile');

  // Order status breakdown
  const orderStatusSummary = await Order.aggregate([
    { $group: { _id: '$orderStatus', count: { $sum: 1 } } },
  ]);

  // Recent reviews
  const recentReviews = await Review.find()
    .populate('user', 'name avatar')
    .populate('product', 'name images')
    .sort('-createdAt')
    .limit(5);

  res.status(200).json({
    success: true,
    data: {
      stats: {
        totalUsers,
        totalSellers,
        totalProducts,
        totalOrders,
        totalCategories,
        totalReviews,
        totalRevenue,
        pendingSellers,
        pendingProducts,
      },
      recentOrders,
      recentProducts,
      recentUsers,
      recentReviews,
      monthlySales,
      topProducts,
      topSellers,
      orderStatusSummary,
    },
  });
});

// @desc    Get all users (admin)
// @route   GET /api/admin/users
// @access  Private (Admin)
export const getUsers = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 15;
  const skip = (page - 1) * limit;

  const query = {};

  if (req.query.role) {
    query.role = req.query.role;
  }

  if (req.query.search) {
    query.$or = [
      { name: { $regex: req.query.search, $options: 'i' } },
      { email: { $regex: req.query.search, $options: 'i' } },
    ];
  }

  const total = await User.countDocuments(query);
  const users = await User.find(query)
    .select('-password')
    .sort('-createdAt')
    .skip(skip)
    .limit(limit);

  res.status(200).json({
    success: true,
    count: users.length,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    data: users,
  });
});

// @desc    Get sellers (admin)
// @route   GET /api/admin/sellers
// @access  Private (Admin)
export const getSellers = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 15;
  const skip = (page - 1) * limit;

  const query = { role: 'seller' };

  if (req.query.status) {
    query['sellerProfile.approvalStatus'] = req.query.status;
  }

  if (req.query.search) {
    query.$or = [
      { name: { $regex: req.query.search, $options: 'i' } },
      { email: { $regex: req.query.search, $options: 'i' } },
      { 'sellerProfile.storeName': { $regex: req.query.search, $options: 'i' } },
    ];
  }

  const total = await User.countDocuments(query);
  const sellers = await User.find(query)
    .select('-password')
    .sort('-createdAt')
    .skip(skip)
    .limit(limit)
    .lean();

  // Single aggregation to get product counts for all sellers at once (fixes N+1 query)
  const sellerIds = sellers.map((s) => s._id);
  const productCounts = await Product.aggregate([
    { $match: { seller: { $in: sellerIds } } },
    {
      $group: {
        _id: { seller: '$seller', status: '$status' },
        count: { $sum: 1 },
      },
    },
  ]);

  const countMap = new Map();
  productCounts.forEach((item) => {
    const sellerId = item._id.seller.toString();
    if (!countMap.has(sellerId)) countMap.set(sellerId, { productCount: 0, approvedCount: 0 });
    const entry = countMap.get(sellerId);
    entry.productCount += item.count;
    if (item._id.status === 'approved') entry.approvedCount += item.count;
  });

  const sellersWithCounts = sellers.map((seller) => ({
    ...seller,
    productCount: countMap.get(seller._id.toString())?.productCount || 0,
    approvedCount: countMap.get(seller._id.toString())?.approvedCount || 0,
  }));

  res.status(200).json({
    success: true,
    count: sellers.length,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    data: sellersWithCounts,
  });
});

// @desc    Approve/Reject seller
// @route   PUT /api/admin/sellers/:id/approve
// @access  Private (Admin)
export const approveSeller = asyncHandler(async (req, res, next) => {
  const { status } = req.body;

  if (!['approved', 'rejected'].includes(status)) {
    return next(new ErrorResponse('Invalid status. Must be approved or rejected', 400));
  }

  const seller = await User.findById(req.params.id);

  if (!seller) {
    return next(new ErrorResponse('Seller not found', 404));
  }

  if (seller.role !== 'seller') {
    return next(new ErrorResponse('User is not a seller', 400));
  }

  seller.sellerProfile.approvalStatus = status;
  seller.sellerProfile.approved = status === 'approved';

  await seller.save();

  res.status(200).json({
    success: true,
    data: seller,
  });
});

// @desc    Toggle user active status
// @route   PUT /api/admin/users/:id/toggle
// @access  Private (Admin)
export const toggleUserStatus = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }

  if (user.role === 'admin') {
    return next(new ErrorResponse('Cannot deactivate admin accounts', 400));
  }

  user.isActive = !user.isActive;
  await user.save();

  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc    Get all products (admin)
// @route   GET /api/admin/products
// @access  Private (Admin)
export const getAdminProducts = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 15;
  const skip = (page - 1) * limit;

  const query = {};

  if (req.query.status) {
    query.status = req.query.status;
  }

  if (req.query.search) {
    query.$or = [
      { name: { $regex: req.query.search, $options: 'i' } },
      { brand: { $regex: req.query.search, $options: 'i' } },
      { sku: { $regex: req.query.search, $options: 'i' } },
    ];
  }

  const total = await Product.countDocuments(query);
  const products = await Product.find(query)
    .populate('seller', 'name sellerProfile')
    .populate('category', 'name')
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

// @desc    Approve/Reject product
// @route   PUT /api/admin/products/:id/approve
// @access  Private (Admin)
export const approveProduct = asyncHandler(async (req, res, next) => {
  const { status } = req.body;

  if (!['approved', 'rejected', 'suspended'].includes(status)) {
    return next(new ErrorResponse('Invalid status', 400));
  }

  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorResponse('Product not found', 404));
  }

  product.status = status;
  product.isApproved = status === 'approved';
  product.isActive = status !== 'suspended';

  await product.save();

  res.status(200).json({
    success: true,
    data: product,
  });
});

// @desc    Toggle featured product
// @route   PUT /api/admin/products/:id/featured
// @access  Private (Admin)
export const toggleFeatured = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorResponse('Product not found', 404));
  }

  product.isFeatured = !product.isFeatured;
  await product.save();

  res.status(200).json({
    success: true,
    data: product,
  });
});

// @desc    Get all orders (admin)
// @route   GET /api/admin/orders
// @access  Private (Admin)
export const getAdminOrders = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 15;
  const skip = (page - 1) * limit;

  const query = {};

  if (req.query.status) {
    query.orderStatus = req.query.status;
  }

  const total = await Order.countDocuments(query);
  const orders = await Order.find(query)
    .populate('user', 'name email')
    .populate('items.product', 'name price images')
    .sort('-createdAt')
    .skip(skip)
    .limit(limit);

  res.status(200).json({
    success: true,
    count: orders.length,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    data: orders,
  });
});

// @desc    Get all reviews (admin)
// @route   GET /api/admin/reviews
// @access  Private (Admin)
export const getAdminReviews = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 15;
  const skip = (page - 1) * limit;

  const query = {};

  if (req.query.status) {
    query.status = req.query.status;
  }

  const total = await Review.countDocuments(query);
  const reviews = await Review.find(query)
    .populate('user', 'name avatar')
    .populate('product', 'name images')
    .sort('-createdAt')
    .skip(skip)
    .limit(limit);

  res.status(200).json({
    success: true,
    count: reviews.length,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    data: reviews,
  });
});

// @desc    Update review status (admin)
// @route   PUT /api/admin/reviews/:id/status
// @access  Private (Admin)
export const updateReviewStatus = asyncHandler(async (req, res, next) => {
  const { status } = req.body;

  if (!['approved', 'rejected', 'pending'].includes(status)) {
    return next(new ErrorResponse('Invalid status', 400));
  }

  const review = await Review.findById(req.params.id);

  if (!review) {
    return next(new ErrorResponse('Review not found', 404));
  }

  review.status = status;
  await review.save();

  res.status(200).json({
    success: true,
    data: review,
  });
});

// @desc    Get all categories (admin)
// @route   GET /api/admin/categories
// @access  Private (Admin)
export const getAdminCategories = asyncHandler(async (req, res, next) => {
  const categories = await Category.find().sort('sortOrder');

  res.status(200).json({
    success: true,
    count: categories.length,
    data: categories,
  });
});

// @desc    Get analytics data
// @route   GET /api/admin/analytics
// @access  Private (Admin)
export const getAnalytics = asyncHandler(async (req, res, next) => {
  const { period = 'month' } = req.query;

  let startDate = new Date();
  if (period === 'week') {
    startDate.setDate(startDate.getDate() - 7);
  } else if (period === 'month') {
    startDate.setMonth(startDate.getMonth() - 1);
  } else if (period === 'year') {
    startDate.setFullYear(startDate.getFullYear() - 1);
  }

  // Sales data
  const salesData = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate },
        'paymentInfo.status': 'paid',
      },
    },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
        },
        total: { $sum: '$totalPrice' },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  // User registrations
  const userData = await User.aggregate([
    {
      $match: { createdAt: { $gte: startDate } },
    },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  // Product data
  const productData = await Product.aggregate([
    {
      $match: { createdAt: { $gte: startDate } },
    },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  // Category distribution
  const categoryDistribution = await Product.aggregate([
    { $match: { status: 'approved' } },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
    { $limit: 10 },
  ]);

  // Populate category names
  const populatedCategories = await Promise.all(
    categoryDistribution.map(async (item) => {
      const category = await Category.findById(item._id).select('name');
      return {
        category: category ? category.name : 'Unknown',
        count: item.count,
      };
    })
  );

  res.status(200).json({
    success: true,
    data: {
      salesData,
      userData,
      productData,
      categoryDistribution: populatedCategories,
    },
  });
});

// @desc    Delete user (admin)
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
export const deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }

  if (user.role === 'admin') {
    return next(new ErrorResponse('Cannot delete admin accounts', 400));
  }

  await user.deleteOne();

  res.status(200).json({
    success: true,
    data: {},
  });
});