import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    rating: {
      type: Number,
      required: [true, 'Please provide a rating'],
      min: 1,
      max: 5,
    },
    title: {
      type: String,
      default: '',
      maxlength: [100, 'Title cannot be more than 100 characters'],
    },
    comment: {
      type: String,
      required: [true, 'Please add a comment'],
      maxlength: [1000, 'Comment cannot be more than 1000 characters'],
    },
    images: [String],
    isVerifiedPurchase: {
      type: Boolean,
      default: false,
    },
    helpful: {
      type: Number,
      default: 0,
    },
    helpfulUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'approved',
    },
    sellerReply: {
      text: { type: String, default: '' },
      repliedAt: { type: Date },
    },
  },
  { timestamps: true }
);

// Prevent duplicate reviews
reviewSchema.index({ user: 1, product: 1 }, { unique: true });

const Review = mongoose.model('Review', reviewSchema);
export default Review;