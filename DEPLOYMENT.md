# 🚀 Deployment Guide

Complete guide to deploy the ASLI Shoppe Multi-Vendor E-Commerce platform to production.

## Architecture Overview

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Frontend      │────▶│   Backend       │────▶│   Database      │
│   (Vercel)      │     │   (Render)      │     │   (MongoDB)     │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                 │
                                 ▼
                        ┌─────────────────┐
                        │  Cloudinary     │
                        │  (Images)       │
                        └─────────────────┘
```

## Prerequisites

Before deploying, you need accounts for:
1. **MongoDB Atlas** - Database (free tier available)
2. **Cloudinary** - Image hosting (free tier available)
3. **Render** - Backend hosting (free tier available)
4. **Vercel** - Frontend hosting (free tier available)

## 1. MongoDB Atlas Setup

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account or login
3. Create a new cluster (M0 free tier is fine)
4. Click "Connect" → "Connect your application"
5. Copy the connection string (example with your cluster):
   ```
   mongodb+srv://<username>:<password>@cluster0.5eo8odg.mongodb.net/asli-ecommerce
   ```
6. Replace `<username>` and `<password>` with your credentials
7. Add a database user:
   - Security → Database Access → Add New Database User
   - Create a user with read/write permissions
8. Add your IP address:
   - Security → Network Access → Add IP Address
   - For production, add `0.0.0.0/0` (allow all)

## 2. Cloudinary Setup

1. Go to [Cloudinary](https://cloudinary.com)
2. Create a free account
3. From the dashboard, copy:
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`

## 3. Deploy Backend to Render

### Option A: Using render.yaml (Recommended)

The project includes a `backend/render.yaml` file for automated deployment:

1. Go to [Render](https://render.com)
2. Create a free account
3. Click "New" → "Blueprint"
4. Connect your GitHub repository
5. Render will detect `backend/render.yaml` and create the service
6. Set the required environment variables (marked as `sync: false`):
   ```
   MONGODB_URI=your_mongodb_uri
   JWT_SECRET=your_strong_jwt_secret
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   FRONTEND_URL=https://your-frontend.vercel.app
   ```
7. Click "Apply" and wait for deployment

### Option B: Manual Setup

1. Go to [Render](https://render.com)
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: `asli-backend`
   - **Environment**: `Node`
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Add environment variables:
   ```
   NODE_ENV=production
   PORT=5000
   MONGODB_URI=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRE=7d
   JWT_COOKIE_EXPIRE=7
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   FRONTEND_URL=https://your-frontend.vercel.app
   ```
6. Click "Create Web Service"
7. Note your backend URL: `https://asli-backend.onrender.com`

### Seed the Database

After deployment, seed the database with demo data:

```bash
# Option 1: Use Render Shell
# In the Render dashboard, click "Shell" and run:
npm run seed

# Option 2: Run locally
cd backend
MONGODB_URI=your_mongodb_uri npm run seed
```

## 4. Deploy Frontend to Vercel

The project includes a `frontend/vercel.json` file for SPA routing and caching.

1. Go to [Vercel](https://vercel.com)
2. Create a free account
3. Click "New Project"
4. Import your GitHub repository
5. Configure:
   - **Root Directory**: `frontend`
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
6. Add environment variables:
   ```
   VITE_API_URL=https://asli-backend.onrender.com/api
   ```
7. Click "Deploy"
8. Your site will be live at: `https://your-project.vercel.app`

## 5. Update Backend CORS

After deploying the frontend, update the backend's `FRONTEND_URL` environment variable to your Vercel URL:
```
FRONTEND_URL=https://your-project.vercel.app
```

Then redeploy the backend on Render.

## 6. Verify Deployment

1. Visit your frontend URL
2. Test the health endpoint:
   ```
   https://asli-backend.onrender.com/api/health
   ```
3. Login with demo accounts:
   - Admin: `admin@asli.com` / `admin123`
   - Seller: `seller@asli.com` / `seller123`
   - Buyer: `buyer@asli.com` / `buyer123`

## 7. Production Considerations

### Security
- Use strong JWT secret (32+ characters)
- Enable HTTPS (auto on Vercel & Render)
- Set up rate limiting (already configured)
- Use environment variables for all secrets
- Never commit `.env` files to git

### Performance
- Enable MongoDB Atlas indexing
- Use Cloudinary for image optimization
- Add caching headers for static assets (configured in `vercel.json`)
- Consider using a CDN for images

### Monitoring
- Set up error tracking (Sentry, LogRocket)
- Monitor MongoDB Atlas metrics
- Set up Render uptime alerts
- Configure Vercel analytics

### Email Notifications
- Update SMTP settings in environment variables:
  ```
  SMTP_HOST=smtp.gmail.com
  SMTP_PORT=587
  SMTP_USER=your_email@gmail.com
  SMTP_PASS=your_app_password
  ```
- For Gmail, create an App Password:
  - Google Account → Security → 2-Step Verification → App Passwords

## 8. Troubleshooting

### Backend not responding
- Check Render logs
- Verify environment variables
- Check MongoDB connection string
- Ensure `MONGODB_URI` is set (required in production)

### Frontend not loading data
- Check API URL in Vercel environment
- Verify CORS settings in backend
- Test API endpoint directly in browser

### Images not uploading
- Verify Cloudinary credentials
- Check file size limits (10MB max)
- Check allowed file types

## 9. Cost Estimates

| Service | Free Tier | Production |
|---------|-----------|------------|
| MongoDB Atlas | 512MB storage | ~$57/mo |
| Render | 750 hrs/month | ~$7/mo |
| Vercel | 100GB bandwidth | ~$20/mo |
| Cloudinary | 25 credits | ~$89/mo |

---

## 🎉 Congratulations!

Your multi-vendor e-commerce platform is now live! 🎊