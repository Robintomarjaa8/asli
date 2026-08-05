import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import asyncHandler from '../utils/asyncHandler.js';
import ErrorResponse from '../utils/errorResponse.js';

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
export const getCart = asyncHandler(async (req, res, next) => {
  let cart = await Cart.findOne({ user: req.user.id }).populate('items.product', 'name price mrp images inventory brand seller');

  if (!cart) {
    cart = await Cart.create({ user: req.user.id, items: [] });
  }

  res.status(200).json({
    success: true,
    data: cart,
  });
});

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
export const addToCart = asyncHandler(async (req, res, next) => {
  const { productId, quantity = 1, size = '', color = '' } = req.body;

  const product = await Product.findById(productId);
  if (!product) {
    return next(new ErrorResponse('Product not found', 404));
  }

  if (product.status !== 'approved' || !product.isActive) {
    return next(new ErrorResponse('Product is not available', 400));
  }

  if (product.inventory.stock < quantity) {
    return next(new ErrorResponse(`Only ${product.inventory.stock} items in stock`, 400));
  }

  let cart = await Cart.findOne({ user: req.user.id });

  if (!cart) {
    cart = await Cart.create({ user: req.user.id, items: [] });
  }

  // Check if item already exists
  const existingItemIndex = cart.items.findIndex(
    (item) =>
      item.product.toString() === productId &&
      item.size === size &&
      item.color === color
  );

  if (existingItemIndex > -1) {
    // Update quantity
    const newQty = cart.items[existingItemIndex].quantity + quantity;
    if (newQty > product.inventory.stock) {
      return next(new ErrorResponse(`Only ${product.inventory.stock} items in stock`, 400));
    }
    cart.items[existingItemIndex].quantity = newQty;
  } else {
    cart.items.push({
      product: productId,
      quantity,
      size,
      color,
      price: product.price,
    });
  }

  await cart.save();

  const populatedCart = await Cart.findById(cart._id).populate('items.product', 'name price mrp images inventory brand seller');

  res.status(200).json({
    success: true,
    data: populatedCart,
  });
});

// @desc    Update cart item quantity
// @route   PUT /api/cart/:itemId
// @access  Private
export const updateCartItem = asyncHandler(async (req, res, next) => {
  const { quantity } = req.body;

  if (!quantity || quantity < 1) {
    return next(new ErrorResponse('Quantity must be at least 1', 400));
  }

  let cart = await Cart.findOne({ user: req.user.id });

  if (!cart) {
    return next(new ErrorResponse('Cart not found', 404));
  }

  const itemIndex = cart.items.findIndex(
    (item) => item._id.toString() === req.params.itemId
  );

  if (itemIndex === -1) {
    return next(new ErrorResponse('Item not found in cart', 404));
  }

  const product = await Product.findById(cart.items[itemIndex].product);
  if (product && quantity > product.inventory.stock) {
    return next(new ErrorResponse(`Only ${product.inventory.stock} items in stock`, 400));
  }

  cart.items[itemIndex].quantity = quantity;
  await cart.save();

  const populatedCart = await Cart.findById(cart._id).populate('items.product', 'name price mrp images inventory brand seller');

  res.status(200).json({
    success: true,
    data: populatedCart,
  });
});

// @desc    Remove item from cart
// @route   DELETE /api/cart/:itemId
// @access  Private
export const removeFromCart = asyncHandler(async (req, res, next) => {
  let cart = await Cart.findOne({ user: req.user.id });

  if (!cart) {
    return next(new ErrorResponse('Cart not found', 404));
  }

  cart.items = cart.items.filter(
    (item) => item._id.toString() !== req.params.itemId
  );

  await cart.save();

  const populatedCart = await Cart.findById(cart._id).populate('items.product', 'name price mrp images inventory brand seller');

  res.status(200).json({
    success: true,
    data: populatedCart,
  });
});

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Private
export const clearCart = asyncHandler(async (req, res, next) => {
  let cart = await Cart.findOne({ user: req.user.id });

  if (!cart) {
    return next(new ErrorResponse('Cart not found', 404));
  }

  cart.items = [];
  await cart.save();

  res.status(200).json({
    success: true,
    data: cart,
  });
});