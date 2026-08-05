import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import ErrorResponse from '../utils/errorResponse.js';

// Protect routes - verify JWT
export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }

    if (!user.isActive) {
      return next(new ErrorResponse('Account has been deactivated. Contact support.', 403));
    }

    req.user = user;
    next();
  } catch (err) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }
};

// Authorize specific roles
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(`User role ${req.user.role} is not authorized to access this route`, 403)
      );
    }
    next();
  };
};

// Authorize seller (must be approved)
export const authorizeSeller = async (req, res, next) => {
  if (req.user.role !== 'seller') {
    return next(new ErrorResponse('Only sellers can access this route', 403));
  }

  if (req.user.sellerProfile && req.user.sellerProfile.approvalStatus !== 'approved') {
    return next(new ErrorResponse('Seller account not approved yet. Please wait for admin approval.', 403));
  }

  next();
};

// Check if user owns the resource or is admin
export const checkOwnership = (Model) => {
  return async (req, res, next) => {
    try {
      const resource = await Model.findById(req.params.id);
      if (!resource) {
        return next(new ErrorResponse('Resource not found', 404));
      }

      if (
        req.user.role === 'admin' ||
        (resource.user && resource.user.toString() === req.user._id.toString()) ||
        (resource.seller && resource.seller.toString() === req.user._id.toString())
      ) {
        req.resource = resource;
        return next();
      }

      return next(new ErrorResponse('Not authorized to access this resource', 403));
    } catch (err) {
      return next(new ErrorResponse('Server error', 500));
    }
  };
};