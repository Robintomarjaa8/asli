import Review from '../models/Review.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import asyncHandler from '../utils/asyncHandler.js';
import ErrorResponse from '../utils/errorResponse.js';

// @desc    Get reviews for a product
// @route   GET /api/reviews/product/:productId
// @access  Public
export const getProductReviews = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const query = { product: req.params.productId, status: 'approved' };

  const total = await Review.countDocuments(query);
  const reviews = await Review.find(query)
    .populate('user', 'name avatar')
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

// @desc    Create review
// @route   POST /api/reviews
// @access  Private
export const createReview = asyncHandler(async (req, res, next) => {
  const { product, rating, title, comment, images } = req.body;

  // Check if product exists
  const productExists = await Product.findById(product);
  if (!productExists) {
    return next(new ErrorResponse('Product not found', 404));
  }

  // Check if user already reviewed
  const existingReview = await Review.findOne({ user: req.user.id, product });
  if (existingReview) {
    return next(new ErrorResponse('You have already reviewed this product', 400));
  }

  // Check if user purchased the product
  const order = await Order.findOne({
    user: req.user.id,
    'items.product': product,
    orderStatus: { $in: ['delivered', 'shipped'] },
  });

  const review = await Review.create({
    user: req.user.id,
    product,
    rating,
    title,
    comment,
    images: images || [],
    isVerifiedPurchase: !!order,
  });

  // Update product ratings
  await updateProductRatings(product, review);

  res.status(201).json({
    success: true,
    data: review,
  });
});

// @desc    Update review
// @route   PUT /api/reviews/:id
// @access  Private
export const updateReview = asyncHandler(async (req, res, next) => {
  let review = await Review.findById(req.params.id);

  if (!review) {
    return next(new ErrorResponse('Review not found', 404));
  }

  // Check ownership
  if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to update this review', 403));
  }

  const oldRating = review.rating;

  review = await Review.findByIdAndUpdate(
    req.params.id,
    {
      rating: req.body.rating || review.rating,
      title: req.body.title || review.title,
      comment: req.body.comment || review.comment,
      images: req.body.images || review.images,
    },
    { new: true, runValidators: true }
  );

  // Update product ratings if rating changed
  if (req.body.rating && req.body.rating !== oldRating) {
    await updateProductRatings(review.product, review, oldRating);
  }

  res.status(200).json({
    success: true,
    data: review,
  });
});

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private
export const deleteReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    return next(new ErrorResponse('Review not found', 404));
  }

  // Check ownership
  if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to delete this review', 403));
  }

  const productId = review.product;
  const rating = review.rating;

  await review.deleteOne();

  // Recalculate product ratings
  await recalculateProductRatings(productId, rating);

  res.status(200).json({
    success: true,
    data: {},
  });
});

// @desc    Mark review as helpful
// @route   POST /api/reviews/:id/helpful
// @access  Private
export const markHelpful = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    return next(new ErrorResponse('Review not found', 404));
  }

  const alreadyMarked = review.helpfulUsers.includes(req.user.id);

  if (alreadyMarked) {
    review.helpfulUsers = review.helpfulUsers.filter(
      (id) => id.toString() !== req.user.id.toString()
    );
    review.helpful = Math.max(0, review.helpful - 1);
  } else {
    review.helpfulUsers.push(req.user.id);
    review.helpful += 1;
  }

  await review.save();

  res.status(200).json({
    success: true,
    helpful: review.helpful,
    isHelpful: !alreadyMarked,
  });
});

// @desc    Seller reply to review
// @route   POST /api/reviews/:id/reply
// @access  Private (Seller)
export const sellerReply = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id).populate('product');

  if (!review) {
    return next(new ErrorResponse('Review not found', 404));
  }

  // Check if seller owns the product
  if (review.product.seller.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to reply to this review', 403));
  }

  review.sellerReply = {
    text: req.body.text,
    repliedAt: Date.now(),
  };

  await review.save();

  res.status(200).json({
    success: true,
    data: review,
  });
});

// Helper: Update product ratings after new review
const updateProductRatings = async (productId, review) => {
  const product = await Product.findById(productId);
  if (!product) return;

  product.ratings.count += 1;
  product.ratings.average =
    (product.ratings.average * (product.ratings.count - 1) + review.rating) /
    product.ratings.count;

  // Increment star counter
  switch (review.rating) {
    case 1: product.ratings.oneStar += 1; break;
    case 2: product.ratings.twoStar += 1; break;
    case 3: product.ratings.threeStar += 1; break;
    case 4: product.ratings.fourStar += 1; break;
    case 5: product.ratings.fiveStar += 1; break;
  }

  product.ratings.average = Math.round(product.ratings.average * 10) / 10;
  await product.save({ validateBeforeSave: false });
};

// Helper: Recalculate product ratings after delete
const recalculateProductRatings = async (productId, deletedRating) => {
  const product = await Product.findById(productId);
  if (!product) return;

  const reviews = await Review.find({ product: productId, status: 'approved' });

  if (reviews.length === 0) {
    product.ratings = {
      average: 0,
      count: 0,
      oneStar: 0,
      twoStar: 0,
      threeStar: 0,
      fourStar: 0,
      fiveStar: 0,
    };
  } else {
    let total = 0;
    let oneStar = 0, twoStar = 0, threeStar = 0, fourStar = 0, fiveStar = 0;

    reviews.forEach((r) => {
      total += r.rating;
      switch (r.rating) {
        case 1: oneStar += 1; break;
        case 2: twoStar += 1; break;
        case 3: threeStar += 1; break;
        case 4: fourStar += 1; break;
        case 5: fiveStar += 1; break;
      }
    });

    product.ratings = {
      average: Math.round((total / reviews.length) * 10) / 10,
      count: reviews.length,
      oneStar,
      twoStar,
      threeStar,
      fourStar,
      fiveStar,
    };
  }

  await product.save({ validateBeforeSave: false });
};