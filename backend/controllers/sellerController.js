import User from '../models/User.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import Review from '../models/Review.js';
import asyncHandler from '../utils/asyncHandler.js';
import ErrorResponse from '../utils/errorResponse.js';

// @desc    Get seller dashboard stats
// @route   GET /api/seller/dashboard
// @access  Private (Seller)
export const getSellerDashboard = asyncHandler(async (req, res, next) => {
  const sellerId = req.user.id;

  // Product stats
  const [totalProducts, approvedProducts, pendingProducts, lowStockProducts, outOfStockProducts] =
    await Promise.all([
      Product.countDocuments({ seller: sellerId }),
      Product.countDocuments({ seller: sellerId, status: 'approved' }),
      Product.countDocuments({ seller: sellerId, status: 'pending' }),
      Product.countDocuments({ seller: sellerId, 'inventory.status': 'low_stock' }),
      Product.countDocuments({ seller: sellerId, 'inventory.status': 'out_of_stock' }),
    ]);

  // Order stats
  const orderQuery = { 'items.seller': sellerId };
  const [totalOrders, pendingOrders, shippedOrders, deliveredOrders, cancelledOrders] =
    await Promise.all([
      Order.countDocuments(orderQuery),
      Order.countDocuments({ ...orderQuery, 'items.status': 'processing' }),
      Order.countDocuments({ ...orderQuery, 'items.status': 'shipped' }),
      Order.countDocuments({ ...orderQuery, 'items.status': 'delivered' }),
      Order.countDocuments({ ...orderQuery, 'items.status': 'cancelled' }),
    ]);

  // Earnings
  const earningsResult = await Order.aggregate([
    { $match: { 'items.seller': sellerId, 'paymentInfo.status': 'paid' } },
    { $unwind: '$items' },
    { $match: { 'items.seller': sellerId } },
    {
      $group: {
        _id: null,
        totalEarnings: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
        totalItems: { $sum: '$items.quantity' },
      },
    },
  ]);

  const totalEarnings = earningsResult.length > 0 ? earningsResult[0].totalEarnings : 0;
  const totalItemsSold = earningsResult.length > 0 ? earningsResult[0].totalItems : 0;

  // Recent orders for this seller
  const recentOrders = await Order.find({ 'items.seller': sellerId })
    .populate('user', 'name email')
    .populate('items.product', 'name images price')
    .sort('-createdAt')
    .limit(5);

  // Filter orders to only show seller's items
  const filteredOrders = recentOrders.map((order) => {
    const orderObj = order.toObject();
    orderObj.items = orderObj.items.filter(
      (item) => item.seller.toString() === sellerId.toString()
    );
    return orderObj;
  });

  // Monthly sales for seller
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);

  const monthlySales = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: sixMonthsAgo },
        'items.seller': sellerId,
        'paymentInfo.status': 'paid',
      },
    },
    { $unwind: '$items' },
    { $match: { 'items.seller': sellerId } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
        total: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
        orders: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  // Top selling products
  const topProducts = await Product.find({ seller: sellerId, status: 'approved' })
    .sort('-quantitySold')
    .limit(5)
    .select('name price images quantitySold inventory');

  // Recent reviews on seller products
  const recentReviews = await Review.find({ product: { $in: await Product.find({ seller: sellerId }).select('_id') } })
    .populate('user', 'name avatar')
    .populate('product', 'name images')
    .sort('-createdAt')
    .limit(5);

  // Seller rating
  const seller = await User.findById(sellerId);

  res.status(200).json({
    success: true,
    data: {
      stats: {
        totalProducts,
        approvedProducts,
        pendingProducts,
        lowStockProducts,
        outOfStockProducts,
        totalOrders,
        pendingOrders,
        shippedOrders,
        deliveredOrders,
        cancelledOrders,
        totalEarnings,
        totalItemsSold,
        storeRating: seller.sellerProfile?.rating || 0,
      },
      recentOrders: filteredOrders,
      monthlySales,
      topProducts,
      recentReviews,
    },
  });
});

// @desc    Get seller product analytics
// @route   GET /api/seller/analytics
// @access  Private (Seller)
export const getSellerAnalytics = asyncHandler(async (req, res, next) => {
  const sellerId = req.user.id;
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
        'items.seller': sellerId,
        'paymentInfo.status': 'paid',
      },
    },
    { $unwind: '$items' },
    { $match: { 'items.seller': sellerId } },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
        },
        total: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  // Product views
  const productViews = await Product.aggregate([
    { $match: { seller: sellerId, createdAt: { $gte: startDate } } },
    { $group: { _id: null, total: { $sum: '$viewCount' } } },
  ]);

  // Product performance
  const productPerformance = await Product.find({ seller: sellerId })
    .sort('-quantitySold')
    .limit(10)
    .select('name price images quantitySold viewCount inventory ratings');

  res.status(200).json({
    success: true,
    data: {
      salesData,
      totalViews: productViews.length > 0 ? productViews[0].total : 0,
      productPerformance,
    },
  });
});

// @desc    Get seller inventory
// @route   GET /api/seller/inventory
// @access  Private (Seller)
export const getSellerInventory = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const query = { seller: req.user.id };

  if (req.query.status) {
    query['inventory.status'] = req.query.status;
  }

  const total = await Product.countDocuments(query);
  const products = await Product.find(query)
    .select('name sku price images inventory quantitySold')
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

// @desc    Get seller earnings
// @route   GET /api/seller/earnings
// @access  Private (Seller)
export const getSellerEarnings = asyncHandler(async (req, res, next) => {
  const sellerId = req.user.id;

  // Total earnings
  const earningsResult = await Order.aggregate([
    { $match: { 'items.seller': sellerId, 'paymentInfo.status': 'paid' } },
    { $unwind: '$items' },
    { $match: { 'items.seller': sellerId } },
    {
      $group: {
        _id: null,
        totalEarnings: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
        totalItems: { $sum: '$items.quantity' },
        totalOrders: { $sum: 1 },
      },
    },
  ]);

  // Earnings this month
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const monthlyEarnings = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: startOfMonth },
        'items.seller': sellerId,
        'paymentInfo.status': 'paid',
      },
    },
    { $unwind: '$items' },
    { $match: { 'items.seller': sellerId } },
    {
      $group: {
        _id: null,
        total: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
      },
    },
  ]);

  // Earnings this week
  const startOfWeek = new Date();
  startOfWeek.setDate(startOfWeek.getDate() - 7);

  const weeklyEarnings = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: startOfWeek },
        'items.seller': sellerId,
        'paymentInfo.status': 'paid',
      },
    },
    { $unwind: '$items' },
    { $match: { 'items.seller': sellerId } },
    {
      $group: {
        _id: null,
        total: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
      },
    },
  ]);

  // Earnings by product
  const earningsByProduct = await Order.aggregate([
    { $match: { 'items.seller': sellerId, 'paymentInfo.status': 'paid' } },
    { $unwind: '$items' },
    { $match: { 'items.seller': sellerId } },
    {
      $group: {
        _id: '$items.product',
        total: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
        count: { $sum: '$items.quantity' },
      },
    },
    { $sort: { total: -1 } },
    { $limit: 10 },
  ]);

  // Populate product names
  const populatedProducts = await Promise.all(
    earningsByProduct.map(async (item) => {
      const product = await Product.findById(item._id).select('name images price');
      return {
        product: product ? product.name : 'Deleted Product',
        image: product?.images?.[0]?.url || '',
        total: item.total,
        count: item.count,
      };
    })
  );

  res.status(200).json({
    success: true,
    data: {
      totalEarnings: earningsResult.length > 0 ? earningsResult[0].totalEarnings : 0,
      totalItems: earningsResult.length > 0 ? earningsResult[0].totalItems : 0,
      totalOrders: earningsResult.length > 0 ? earningsResult[0].totalOrders : 0,
      monthlyEarnings: monthlyEarnings.length > 0 ? monthlyEarnings[0].total : 0,
      weeklyEarnings: weeklyEarnings.length > 0 ? weeklyEarnings[0].total : 0,
      earningsByProduct: populatedProducts,
    },
  });
});

// @desc    Get seller reviews
// @route   GET /api/seller/reviews
// @access  Private (Seller)
export const getSellerReviews = asyncHandler(async (req, res, next) => {
  const sellerId = req.user.id;

  // Get all products for this seller
  const products = await Product.find({ seller: sellerId }).select('_id');
  const productIds = products.map((p) => p._id);

  const reviews = await Review.find({ product: { $in: productIds } })
    .populate('user', 'name avatar')
    .populate('product', 'name images')
    .sort('-createdAt')
    .limit(20);

  res.status(200).json({
    success: true,
    count: reviews.length,
    data: reviews,
  });
});