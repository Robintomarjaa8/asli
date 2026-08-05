import Wishlist from '../models/Wishlist.js';
import Product from '../models/Product.js';
import asyncHandler from '../utils/asyncHandler.js';
import ErrorResponse from '../utils/errorResponse.js';

// @desc    Get user wishlist
// @route   GET /api/wishlist
// @access  Private
export const getWishlist = asyncHandler(async (req, res, next) => {
  let wishlist = await Wishlist.findOne({ user: req.user.id }).populate('items.product', 'name price mrp images inventory ratings brand');

  if (!wishlist) {
    wishlist = await Wishlist.create({ user: req.user.id, items: [] });
  }

  res.status(200).json({
    success: true,
    data: wishlist,
  });
});

// @desc    Add to wishlist
// @route   POST /api/wishlist
// @access  Private
export const addToWishlist = asyncHandler(async (req, res, next) => {
  const { productId } = req.body;

  const product = await Product.findById(productId);
  if (!product) {
    return next(new ErrorResponse('Product not found', 404));
  }

  let wishlist = await Wishlist.findOne({ user: req.user.id });

  if (!wishlist) {
    wishlist = await Wishlist.create({ user: req.user.id, items: [] });
  }

  // Check if product already in wishlist
  const exists = wishlist.items.some(
    (item) => item.product.toString() === productId
  );

  if (exists) {
    return next(new ErrorResponse('Product already in wishlist', 400));
  }

  wishlist.items.push({ product: productId });
  await wishlist.save();

  const populatedWishlist = await Wishlist.findById(wishlist._id).populate('items.product', 'name price mrp images inventory ratings brand');

  res.status(200).json({
    success: true,
    data: populatedWishlist,
  });
});

// @desc    Remove from wishlist
// @route   DELETE /api/wishlist/:productId
// @access  Private
export const removeFromWishlist = asyncHandler(async (req, res, next) => {
  let wishlist = await Wishlist.findOne({ user: req.user.id });

  if (!wishlist) {
    return next(new ErrorResponse('Wishlist not found', 404));
  }

  wishlist.items = wishlist.items.filter(
    (item) => item.product.toString() !== req.params.productId
  );

  await wishlist.save();

  const populatedWishlist = await Wishlist.findById(wishlist._id).populate('items.product', 'name price mrp images inventory ratings brand');

  res.status(200).json({
    success: true,
    data: populatedWishlist,
  });
});

// @desc    Clear wishlist
// @route   DELETE /api/wishlist
// @access  Private
export const clearWishlist = asyncHandler(async (req, res, next) => {
  let wishlist = await Wishlist.findOne({ user: req.user.id });

  if (!wishlist) {
    return next(new ErrorResponse('Wishlist not found', 404));
  }

  wishlist.items = [];
  await wishlist.save();

  res.status(200).json({
    success: true,
    data: wishlist,
  });
});

// @desc    Check if product is in wishlist
// @route   GET /api/wishlist/check/:productId
// @access  Private
export const checkWishlist = asyncHandler(async (req, res, next) => {
  const wishlist = await Wishlist.findOne({ user: req.user.id });

  if (!wishlist) {
    return res.status(200).json({ success: true, inWishlist: false });
  }

  const inWishlist = wishlist.items.some(
    (item) => item.product.toString() === req.params.productId
  );

  res.status(200).json({
    success: true,
    inWishlist,
  });
});