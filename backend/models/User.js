import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
      trim: true,
      maxlength: [50, 'Name cannot be more than 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please add a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    role: {
      type: String,
      enum: ['buyer', 'seller', 'admin'],
      default: 'buyer',
    },
    avatar: {
      type: String,
      default: '',
    },
    phone: {
      type: String,
      default: '',
    },
    address: {
      street: { type: String, default: '' },
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      country: { type: String, default: '' },
      zipCode: { type: String, default: '' },
    },
    savedAddresses: [
      {
        label: { type: String, default: 'Home' },
        street: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        country: { type: String, default: 'India' },
        zipCode: { type: String, required: true },
        phone: { type: String, default: '' },
      },
    ],
    // Seller specific fields
    sellerProfile: {
      storeName: { type: String, default: '' },
      storeLogo: { type: String, default: '' },
      storeDescription: { type: String, default: '' },
      gstNumber: { type: String, default: '' },
      approved: { type: Boolean, default: false },
      approvalStatus: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
      },
      rating: { type: Number, default: 0 },
      totalSales: { type: Number, default: 0 },
      totalEarnings: { type: Number, default: 0 },
    },
    // Buyer specific fields
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    recentlyViewed: [
      { product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' }, viewedAt: { type: Date, default: Date.now } },
    ],
    resetPasswordToken: { type: String },
    resetPasswordExpire: { type: Date },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Encrypt password using bcrypt
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Sign JWT and return
userSchema.methods.getSignedJwtToken = function () {
  return jwt.sign(
    { id: this._id, role: this.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
};

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Performance indexes for common queries
userSchema.index({ role: 1 });
userSchema.index({ 'sellerProfile.approvalStatus': 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ createdAt: -1 });

const User = mongoose.model('User', userSchema);
export default User;
