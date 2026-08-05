import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a product name'],
      trim: true,
      maxlength: [200, 'Product name cannot be more than 200 characters'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
      maxlength: [5000, 'Description cannot be more than 5000 characters'],
    },
    shortDescription: {
      type: String,
      default: '',
      maxlength: [500, 'Short description cannot be more than 500 characters'],
    },
    price: {
      type: Number,
      required: [true, 'Please add a price'],
      min: [0, 'Price must be positive'],
    },
    mrp: {
      type: Number,
      min: [0, 'MRP must be positive'],
      default: 0,
    },
    discount: {
      type: Number,
      default: 0,
      min: [0, 'Discount must be positive'],
      max: [100, 'Discount cannot exceed 100%'],
    },
    images: [
      {
        url: { type: String, required: true },
        public_id: { type: String },
        alt: { type: String, default: '' },
      },
    ],
    video: {
      url: { type: String, default: '' },
      title: { type: String, default: '' },
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Please add a category'],
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    brand: {
      type: String,
      default: 'Generic',
      trim: true,
    },
    sku: {
      type: String,
      unique: true,
      required: [true, 'Please add a SKU'],
      trim: true,
    },
    barcode: {
      type: String,
      default: '',
      trim: true,
    },
    tags: [String],
    specifications: [
      {
        key: { type: String, required: true },
        value: { type: String, required: true },
      },
    ],
    colorVariants: [
      {
        name: { type: String, required: true },
        hex: { type: String, default: '#000000' },
        image: { type: String, default: '' },
      },
    ],
    sizeVariants: [
      {
        size: { type: String, required: true },
        price: { type: Number, default: 0 },
        stock: { type: Number, default: 0 },
        sku: { type: String, default: '' },
      },
    ],
    inventory: {
      stock: {
        type: Number,
        required: [true, 'Please add stock quantity'],
        default: 0,
        min: [0, 'Stock cannot be negative'],
      },
      lowStockThreshold: { type: Number, default: 5 },
      sold: { type: Number, default: 0 },
      status: {
        type: String,
        enum: ['in_stock', 'low_stock', 'out_of_stock'],
        default: 'in_stock',
      },
    },
    ratings: {
      average: { type: Number, default: 0 },
      count: { type: Number, default: 0 },
      oneStar: { type: Number, default: 0 },
      twoStar: { type: Number, default: 0 },
      threeStar: { type: Number, default: 0 },
      fourStar: { type: Number, default: 0 },
      fiveStar: { type: Number, default: 0 },
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'suspended'],
      default: 'pending',
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    relatedProducts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
      },
    ],
    warranty: {
      type: String,
      default: '',
    },
    returnPolicy: {
      type: String,
      default: '',
    },
    shippingDetails: {
      weight: { type: Number, default: 0 },
      dimensions: { type: String, default: '' },
      freeShipping: { type: Boolean, default: false },
      shippingCharges: { type: Number, default: 0 },
    },
    quantitySold: {
      type: Number,
      default: 0,
    },
    sales: {
      total: { type: Number, default: 0 },
      count: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

// Create slug from name before saving
productSchema.pre('save', function (next) {
  if (!this.slug) {
    this.slug = this.name.toLowerCase().replace(/[^a-zA-Z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now().toString(36);
  }
  // Auto calculate discount if not set
  if (this.mrp > this.price && this.discount === 0) {
    this.discount = Math.round(((this.mrp - this.price) / this.mrp) * 100);
  }
  // Auto set inventory status
  if (this.inventory.stock <= 0) {
    this.inventory.status = 'out_of_stock';
  } else if (this.inventory.stock <= this.inventory.lowStockThreshold) {
    this.inventory.status = 'low_stock';
  } else {
    this.inventory.status = 'in_stock';
  }
  next();
});

// Index for search
productSchema.index({ name: 'text', description: 'text', tags: 'text', brand: 'text' });

// Performance indexes for common queries
productSchema.index({ status: 1, isActive: 1 });
productSchema.index({ category: 1, status: 1, isActive: 1 });
productSchema.index({ seller: 1, status: 1 });
productSchema.index({ isFeatured: 1, status: 1, isActive: 1 });
productSchema.index({ quantitySold: -1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ price: 1 });
productSchema.index({ 'ratings.average': -1 });
productSchema.index({ 'inventory.status': 1 });

const Product = mongoose.model('Product', productSchema);
export default Product;
