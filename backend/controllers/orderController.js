import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Cart from '../models/Cart.js';
import User from '../models/User.js';
import asyncHandler from '../utils/asyncHandler.js';
import ErrorResponse from '../utils/errorResponse.js';
import crypto from 'crypto';
import sendEmail from '../utils/sendEmail.js';

// @desc    Create order
// @route   POST /api/orders
// @access  Private
export const createOrder = asyncHandler(async (req, res, next) => {
  const { items, shippingAddress, paymentMethod = 'cod' } = req.body;

  if (!items || items.length === 0) {
    return next(new ErrorResponse('No items in order', 400));
  }

  if (!shippingAddress) {
    return next(new ErrorResponse('Please provide shipping address', 400));
  }

  // Validate shipping address required fields
  if (!shippingAddress.street || !shippingAddress.city || !shippingAddress.state || !shippingAddress.zipCode) {
    return next(new ErrorResponse('Please provide a complete shipping address', 400));
  }

  // Validate items and calculate prices
  let itemsPrice = 0;
  let discount = 0;
  let shippingPrice = 0;
  const validItems = [];

  for (const item of items) {
    const product = await Product.findById(item.product);

    if (!product) {
      return next(new ErrorResponse(`Product not found: ${item.product}`, 404));
    }

    if (product.status !== 'approved' || !product.isActive) {
      return next(new ErrorResponse(`${product.name} is not available for purchase`, 400));
    }

    // Guard against NaN/invalid stock values in the database
    const productStock = Number.isNaN(Number(product.inventory.stock)) ? 0 : Number(product.inventory.stock);

    if (productStock < item.quantity) {
      return next(
        new ErrorResponse(
          `Only ${productStock} units of ${product.name} available. Please update the product stock to continue.`,
          400
        )
      );
    }

    const price = product.price;
    const mrp = product.mrp || price;

    itemsPrice += price * item.quantity;
    discount += (mrp - price) * item.quantity;

    validItems.push({
      product: product._id,
      name: product.name,
      image: product.images[0]?.url || 'https://placehold.co/500x500/png?text=No+Image',
      price,
      mrp,
      quantity: item.quantity,
      size: item.size || '',
      color: item.color || '',
      seller: product.seller,
    });

    // Check shipping
    if (product.shippingDetails?.freeShipping) {
      // free shipping
    } else if (product.shippingDetails?.shippingCharges) {
      shippingPrice += product.shippingDetails.shippingCharges;
    }
  }

  // Free shipping over threshold
  if (itemsPrice >= 999) {
    shippingPrice = 0;
  }

  const taxPrice = Math.round(itemsPrice * 0.05); // 5% GST
  const totalPrice = itemsPrice + taxPrice + shippingPrice - discount;

  // Create order
  const order = await Order.create({
    user: req.user.id,
    items: validItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    taxPrice,
    shippingPrice,
    discount,
    totalPrice,
    orderStatus: 'pending',
    estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days
  });

  // Clear cart after order
  await Cart.findOneAndUpdate(
    { user: req.user.id },
    { $pull: { items: { product: { $in: validItems.map((i) => i.product) } } } }
  );

  res.status(201).json({
    success: true,
    data: order,
  });
});

// @desc    Get user orders
// @route   GET /api/orders/my-orders
// @access  Private
export const getMyOrders = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const query = { user: req.user.id };

  if (req.query.status) {
    query.orderStatus = req.query.status;
  }

  const total = await Order.countDocuments(query);
  const orders = await Order.find(query)
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

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
export const getOrder = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id)
    .populate('items.product', 'name price images')
    .populate('user', 'name email phone');

  if (!order) {
    return next(new ErrorResponse('Order not found', 404));
  }

  // Check ownership
  if (order.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to view this order', 403));
  }

  res.status(200).json({
    success: true,
    data: order,
  });
});

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
export const cancelOrder = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new ErrorResponse('Order not found', 404));
  }

  // Check ownership
  if (order.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to cancel this order', 403));
  }

  if (order.orderStatus === 'delivered') {
    return next(new ErrorResponse('Cannot cancel a delivered order', 400));
  }

  if (order.orderStatus === 'cancelled') {
    return next(new ErrorResponse('Order already cancelled', 400));
  }

  order.orderStatus = 'cancelled';
  order.cancelledAt = Date.now();
  order.cancellationReason = req.body.reason || 'User cancelled';

  // Restore stock
  for (const item of order.items) {
    const product = await Product.findById(item.product);
    if (product) {
      product.inventory.stock += item.quantity;
      product.inventory.sold -= item.quantity;
      product.quantitySold -= item.quantity;
      await product.save();
    }
  }

  await order.save();

  res.status(200).json({
    success: true,
    data: order,
  });
});

// @desc    Get order by order number
// @route   GET /api/orders/track/:orderNumber
// @access  Public
export const trackOrder = asyncHandler(async (req, res, next) => {
  const order = await Order.findOne({ orderNumber: req.params.orderNumber })
    .populate('items.product', 'name price images');

  if (!order) {
    return next(new ErrorResponse('Order not found', 404));
  }

  res.status(200).json({
    success: true,
    data: order,
  });
});

// @desc    Get seller's received orders
// @route   GET /api/orders/seller/orders
// @access  Private (Seller)
export const getSellerOrders = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const query = { 'items.seller': req.user.id };

  if (req.query.status) {
    query['items.status'] = req.query.status;
  }

  const total = await Order.countDocuments(query);
  const orders = await Order.find(query)
    .populate('items.product', 'name price images')
    .populate('user', 'name email phone')
    .sort('-createdAt')
    .skip(skip)
    .limit(limit);

  // Filter items to only show seller's items
  const filteredOrders = orders.map((order) => {
    const orderObj = order.toObject();
    orderObj.items = orderObj.items.filter(
      (item) => item.seller.toString() === req.user.id.toString()
    );
    return orderObj;
  });

  res.status(200).json({
    success: true,
    count: filteredOrders.length,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    data: filteredOrders,
  });
});

// @desc    Update order item status (seller)
// @route   PUT /api/orders/item/:itemId/status
// @access  Private (Seller)
export const updateOrderItemStatus = asyncHandler(async (req, res, next) => {
  const { status, description, location } = req.body;

  const order = await Order.findOne({ 'items._id': req.params.itemId });

  if (!order) {
    return next(new ErrorResponse('Order not found', 404));
  }

  const item = order.items.find((i) => i._id.toString() === req.params.itemId);

  if (!item) {
    return next(new ErrorResponse('Order item not found', 404));
  }

  // Check ownership
  if (item.seller.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to update this order', 403));
  }

  item.status = status;
  item.trackingUpdates.push({
    status,
    description: description || `Order ${status}`,
    location: location || '',
    date: Date.now(),
  });

  // Check if all items have same status
  const allDelivered = order.items.every((i) => i.status === 'delivered');
  const allShipped = order.items.every((i) => i.status === 'shipped');

  if (allDelivered) {
    order.orderStatus = 'delivered';
    order.isDelivered = true;
    order.deliveredAt = Date.now();
  } else if (allShipped) {
    order.orderStatus = 'shipped';
  }

  await order.save();

  res.status(200).json({
    success: true,
    data: order,
  });
});

// @desc    Get all orders (admin)
// @route   GET /api/orders/admin/all
// @access  Private (Admin)
export const getAllOrders = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 15;
  const skip = (page - 1) * limit;

  const query = {};

  if (req.query.status) {
    query.orderStatus = req.query.status;
  }

  if (req.query.search) {
    query.$or = [
      { orderNumber: { $regex: req.query.search, $options: 'i' } },
    ];
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