# 🛍️ ASLI Shoppe - Multi-Vendor E-Commerce Platform

A complete, production-ready multi-vendor e-commerce website similar to Amazon/Flipkart built with the MERN stack.

## ✨ Features

### 👤 Buyer Panel
- Register/Login with JWT authentication
- Browse products with search, filters, sorting & pagination
- Product details with reviews, ratings & related products
- Add to cart & wishlist
- Checkout with Cash on Delivery
- Order tracking & history
- Download invoices
- User profile & saved addresses
- Change password

### 🏪 Seller Panel
- Seller registration with admin approval
- Dashboard with sales analytics
- Add/Edit/Delete products with multiple images
- Product variants (colors, sizes), SKU, barcode
- Inventory management
- View received orders & update status
- Earnings tracking
- Product reviews

### 🛡️ Admin Panel
- Secure admin login
- Dashboard with statistics & charts
- Manage buyers & sellers
- Approve/reject sellers & products
- Manage categories
- Manage orders & reviews
- Analytics dashboard

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas |
| Authentication | JWT + bcrypt |
| State Management | Context API |
| Image Upload | Cloudinary |
| Payments | Cash on Delivery |
| Charts | Recharts |
| Animations | Framer Motion |

## 📁 Project Structure

```
ASLI/
├── backend/
│   ├── config/       # Database & config
│   ├── controllers/  # Business logic
│   ├── middleware/   # Auth, error, upload
│   ├── models/       # Mongoose models
│   ├── routes/       # API routes
│   ├── utils/        # Helpers
│   ├── server.js     # Entry point
│   └── seeder.js     # Database seeder
└── frontend/
    ├── src/
    │   ├── components/  # Reusable components
    │   ├── context/     # State management
    │   ├── layouts/     # Layout wrappers
    │   ├── pages/       # Page components
    │   └── services/    # API layer
    ├── index.html
    └── vite.config.js
```

## 🛠️ Installation

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas account (for production)
- Cloudinary account

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd ASLI
```

### 2. Install all dependencies
```bash
npm run install:all
```

### 3. Setup Backend
```bash
cd backend
cp .env.example .env
# Edit .env with your credentials
# For local dev, leave MONGODB_URI empty to use in-memory MongoDB
# Run the seeder to create demo data (optional)
npm run seed
```

### 4. Setup Frontend
```bash
cd frontend
cp .env.example .env
# Edit .env with your API URL
```

### 5. Run the application
```bash
# From the root directory - runs both backend & frontend
npm run dev

# Or run them separately
npm run dev:backend
npm run dev:frontend
```

### 6. Access the application
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api
- Health Check: http://localhost:5000/api/health

## 🎯 Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@asli.com | admin123 |
| Seller | seller@asli.com | seller123 |
| Buyer | buyer@asli.com | buyer123 |

## 📦 Database Collections

- **Users** - Buyers, sellers, admins
- **Products** - Full product catalog with variants
- **Categories** - Product categories
- **Orders** - Order & payment details
- **Reviews** - Product reviews & ratings
- **Wishlist** - User wishlists
- **Cart** - User carts

## 🔐 Environment Variables

### Backend (.env)
```
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.5eo8odg.mongodb.net/asli-ecommerce
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=7d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api
```

## 📄 API Endpoints

### Auth
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/updatedetails` - Update profile
- `PUT /api/auth/updatepassword` - Change password

### Products
- `GET /api/products` - Get all products (with filters)
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (seller)
- `PUT /api/products/:id` - Update product (seller)
- `DELETE /api/products/:id` - Delete product (seller)

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create (admin)
- `PUT /api/categories/:id` - Update (admin)
- `DELETE /api/categories/:id` - Delete (admin)

### Cart & Wishlist
- `GET/POST/PUT/DELETE /api/cart` - Cart operations
- `GET/POST/DELETE /api/wishlist` - Wishlist operations

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders/my-orders` - Get user orders
- `GET /api/orders/track/:orderNumber` - Track order

### Admin
- `GET /api/admin/dashboard` - Dashboard stats
- `GET /api/admin/users` - Manage users
- `GET /api/admin/sellers` - Manage sellers
- `GET /api/admin/products` - Manage products
- `GET /api/admin/analytics` - Analytics

### Seller
- `GET /api/seller/dashboard` - Seller dashboard
- `GET /api/seller/analytics` - Analytics
- `GET /api/seller/inventory` - Inventory
- `GET /api/seller/earnings` - Earnings

## 📦 Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions for:
- **Frontend**: Vercel
- **Backend**: Render
- **Database**: MongoDB Atlas

## 📝 License

MIT License

---

Built with ❤️ using the MERN stack