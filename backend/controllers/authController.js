import User from '../models/User.js';
import Cart from '../models/Cart.js';
import Wishlist from '../models/Wishlist.js';
import asyncHandler from '../utils/asyncHandler.js';
import ErrorResponse from '../utils/errorResponse.js';
import sendEmail from '../utils/sendEmail.js';
import crypto from 'crypto';

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = asyncHandler(async (req, res, next) => {
  const { name, email, password, role, phone, sellerProfile } = req.body;

  // Check if user exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    return next(new ErrorResponse('User already exists with this email', 400));
  }

  // Create user
  const user = await User.create({
    name,
    email,
    password,
    role: role || 'buyer',
    phone,
    sellerProfile: role === 'seller' ? { ...sellerProfile, approvalStatus: 'pending' } : undefined,
  });

  // Create cart and wishlist for buyer
  if (user.role === 'buyer') {
    await Cart.create({ user: user._id, items: [] });
    await Wishlist.create({ user: user._id, items: [] });
  }

  // Send token
  sendTokenResponse(user, 201, res);
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Validate email & password
  if (!email || !password) {
    return next(new ErrorResponse('Please provide an email and password', 400));
  }

  // Check for user
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  // Check if password matches
  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  // Check if user is active
  if (!user.isActive) {
    return next(new ErrorResponse('Account has been deactivated. Contact support.', 403));
  }

  sendTokenResponse(user, 200, res);
});

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id)
    .populate('wishlist', 'name price images inventory')
    .populate('recentlyViewed.product', 'name price images');

  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc    Update user profile
// @route   PUT /api/auth/updatedetails
// @access  Private
export const updateDetails = asyncHandler(async (req, res, next) => {
  const fieldsToUpdate = {
    name: req.body.name,
    phone: req.body.phone,
    avatar: req.body.avatar,
    address: req.body.address,
  };

  // Remove undefined fields
  Object.keys(fieldsToUpdate).forEach((key) => {
    if (fieldsToUpdate[key] === undefined) delete fieldsToUpdate[key];
  });

  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc    Update password
// @route   PUT /api/auth/updatepassword
// @access  Private
export const updatePassword = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');

  // Check current password
  const isMatch = await user.matchPassword(req.body.currentPassword);
  if (!isMatch) {
    return next(new ErrorResponse('Current password is incorrect', 401));
  }

  user.password = req.body.newPassword;
  await user.save();

  sendTokenResponse(user, 200, res);
});

// @desc    Forgot password
// @route   POST /api/auth/forgotpassword
// @access  Public
export const forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorResponse('No user found with that email', 404));
  }

  // Get reset token
  const resetToken = crypto.randomBytes(20).toString('hex');

  // Hash token and set to resetPasswordToken field
  user.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

  await user.save({ validateBeforeSave: false });

  // Create reset url
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

  const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Password reset token',
      message,
    });

    res.status(200).json({
      success: true,
      data: 'Email sent',
    });
  } catch (err) {
    console.log(err);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new ErrorResponse('Email could not be sent', 500));
  }
});

// @desc    Reset password
// @route   PUT /api/auth/resetpassword/:resettoken
// @access  Public
export const resetPassword = asyncHandler(async (req, res, next) => {
  // Get hashed token
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.resettoken)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(new ErrorResponse('Invalid token', 400));
  }

  // Set new password
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  sendTokenResponse(user, 200, res);
});

// @desc    Update seller profile
// @route   PUT /api/auth/sellerprofile
// @access  Private (Seller)
export const updateSellerProfile = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  if (user.role !== 'seller') {
    return next(new ErrorResponse('Only sellers can update seller profile', 403));
  }

  user.sellerProfile = {
    ...user.sellerProfile,
    ...req.body,
  };

  await user.save();

  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc    Add saved address
// @route   POST /api/auth/addresses
// @access  Private
export const addAddress = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  user.savedAddresses.push(req.body);
  await user.save();

  res.status(200).json({
    success: true,
    data: user.savedAddresses,
  });
});

// @desc    Update saved address
// @route   PUT /api/auth/addresses/:addressId
// @access  Private
export const updateAddress = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  const addressIndex = user.savedAddresses.findIndex(
    (addr) => addr._id.toString() === req.params.addressId
  );

  if (addressIndex === -1) {
    return next(new ErrorResponse('Address not found', 404));
  }

  user.savedAddresses[addressIndex] = {
    ...user.savedAddresses[addressIndex].toObject(),
    ...req.body,
  };

  await user.save();

  res.status(200).json({
    success: true,
    data: user.savedAddresses,
  });
});

// @desc    Delete saved address
// @route   DELETE /api/auth/addresses/:addressId
// @access  Private
export const deleteAddress = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  user.savedAddresses = user.savedAddresses.filter(
    (addr) => addr._id.toString() !== req.params.addressId
  );

  await user.save();

  res.status(200).json({
    success: true,
    data: user.savedAddresses,
  });
});

// @desc    Logout user
// @route   GET /api/auth/logout
// @access  Private
export const logout = asyncHandler(async (req, res, next) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    data: {},
  });
});

// Helper to send token response
const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        sellerProfile: user.sellerProfile,
      },
    });
};