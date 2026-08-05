import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars from backend/.env (works regardless of cwd)
dotenv.config({ path: path.join(__dirname, '.env') });

// Import database connection
import connectDB from './config/db.js';

// Import routes
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import wishlistRoutes from './routes/wishlistRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import sellerRoutes from './routes/sellerRoutes.js';

// Import error handler
import errorHandler from './middleware/errorMiddleware.js';
import { seedIfEmpty } from './utils/seedData.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Enable compression for faster responses
app.use(compression());

// Enable CORS
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  })
);

// Rate limiting (relaxed to prevent false positives during normal usage)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api', limiter);

// Static folder for uploads (with caching headers)
app.use(
  '/uploads',
  express.static(path.join(__dirname, 'uploads'), {
    maxAge: '7d',
    etag: true,
  })
);

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'API is running', timestamp: new Date().toISOString() });
});

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/seller', sellerRoutes);

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

// Error handler
app.use(errorHandler);

// Start server ONLY after DB is connected and seeded (fixes admin login race condition)
const startServer = async () => {
  try {
    // Connect to database first
    await connectDB();
    // Seed demo data if database is empty (await to ensure admin user exists before serving)
    await seedIfEmpty();

    const server = app.listen(PORT, () => {
      console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err, promise) => {
      console.log(`Error: ${err.message}`);
      // Close server & exit process
      server.close(() => process.exit(1));
    });
  } catch (error) {
    console.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

startServer();
