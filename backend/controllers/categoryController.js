import Category from '../models/Category.js';
import Product from '../models/Product.js';
import asyncHandler from '../utils/asyncHandler.js';
import ErrorResponse from '../utils/errorResponse.js';

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
export const getCategories = asyncHandler(async (req, res, next) => {
  const categories = await Category.find({ isActive: true }).sort('sortOrder').lean();

  // Single aggregation to get product counts for all categories at once (fixes N+1 query)
  const productCounts = await Product.aggregate([
    { $match: { status: 'approved', isActive: true } },
    { $group: { _id: '$category', count: { $sum: 1 } } },
  ]);

  const countMap = new Map(productCounts.map((item) => [item._id.toString(), item.count]));

  const categoriesWithCount = categories.map((category) => ({
    ...category,
    productCount: countMap.get(category._id.toString()) || 0,
  }));

  res.status(200).json({
    success: true,
    count: categories.length,
    data: categoriesWithCount,
  });
});

// @desc    Get single category
// @route   GET /api/categories/:id
// @access  Public
export const getCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    return next(new ErrorResponse('Category not found', 404));
  }

  res.status(200).json({
    success: true,
    data: category,
  });
});

// @desc    Get category by slug
// @route   GET /api/categories/slug/:slug
// @access  Public
export const getCategoryBySlug = asyncHandler(async (req, res, next) => {
  const category = await Category.findOne({ slug: req.params.slug });

  if (!category) {
    return next(new ErrorResponse('Category not found', 404));
  }

  res.status(200).json({
    success: true,
    data: category,
  });
});

// @desc    Create category
// @route   POST /api/categories
// @access  Private (Admin)
export const createCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.create(req.body);

  res.status(201).json({
    success: true,
    data: category,
  });
});

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private (Admin)
export const updateCategory = asyncHandler(async (req, res, next) => {
  let category = await Category.findById(req.params.id);

  if (!category) {
    return next(new ErrorResponse('Category not found', 404));
  }

  category = await Category.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: category,
  });
});

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private (Admin)
export const deleteCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    return next(new ErrorResponse('Category not found', 404));
  }

  // Check if category has products
  const productCount = await Product.countDocuments({ category: category._id });
  if (productCount > 0) {
    return next(
      new ErrorResponse(`Cannot delete category with ${productCount} products. Move products first.`, 400)
    );
  }

  await category.deleteOne();

  res.status(200).json({
    success: true,
    data: {},
  });
});

// @desc    Get featured categories
// @route   GET /api/categories/featured
// @access  Public
export const getFeaturedCategories = asyncHandler(async (req, res, next) => {
  const categories = await Category.find({ isActive: true, featured: true })
    .sort('sortOrder')
    .limit(8);

  res.status(200).json({
    success: true,
    count: categories.length,
    data: categories,
  });
});