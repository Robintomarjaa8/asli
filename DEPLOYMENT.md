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

## 1. MongoDB Atlas Setup

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account or login
3. Create a new cluster (M0 free tier is fine)
4. Click "Connect" → "Connect your application"
5. Copy the connection string:
   ```
   mongodb+srv://<username>:<password>@cluster.mongodb.net/asli-ecommerce
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

## 3. Razorpay Setup

1. Go to [Razorpay](https://razorpay.com)
2. Create an account (use test mode for development)
3. Go to Dashboard → Settings → API Keys
4. Copy:
   - `RAZORPAY_KEY_ID`
   - `RAZORPAY_KEY_SECRET`

## 4. Deploy Backend to Render

1. Go to [Render](https://render.com)
2. Create a free account
3. Click "New" → "Web Service"
4. Connect your GitHub repository
5. Configure:
   - **Name**: `asli-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Root Directory**: `backend`
6. Add environment variables:
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
   RAZORPAY_KEY_ID=your_razorpay_key
   RAZORPAY_KEY_SECRET=your_razorpay_secret
   FRONTEND_URL=https://your-frontend.vercel.app
   ```
7. Click "Create Web Service"
8. Wait for deployment to complete
9. Note your backend URL: `https://asli-backend.onrender.com`

### Seed the Database
1. After deployment, run the seed script:
   ```bash
   # Option 1: Use Render Shell
   # In the Render dashboard, click "Shell" and run:
   npm run seed
   
   # Option 2: Run locally
   cd backend
   MONGODB_URI=your_mongodb_uri npm run seed
   ```

## 5. Deploy Frontend to Vercel

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
   VITE_RAZORPAY_KEY_ID=your_razorpay_key
   ```
7. Click "Deploy"
8. Wait for deployment to complete
9. Your site will be live at: `https://your-project.vercel.app`

## 6. Update Backend CORS

After deploying the frontend, update the backend's `FRONTEND_URL` environment variable to your Vercel URL:
```
FRONTEND_URL=https://your-project.vercel.app
```

Then redeploy the backend on Render.

## 7. Verify Deployment

1. Visit your frontend URL
2. Test the health endpoint:
   ```
   https://asli-backend.onrender.com/api/health
   ```
3. Login with demo accounts:
   - Admin: `admin@asli.com` / `admin123`
   - Seller: `seller@asli.com` / `seller123`
   - Buyer: `buyer@asli.com` / `buyer123`

## 8. Production Considerations

### Security
- Use strong JWT secret (32+ characters)
- Enable HTTPS (auto on Vercel & Render)
- Set up rate limiting (already configured)
- Use environment variables for all secrets

### Performance
- Enable MongoDB Atlas indexing
- Use Cloudinary for image optimization
- Add caching headers for static assets
- Consider using a CDN for images

### Monitoring
- Set up error tracking (Sentry, LogRocket)
- Monitor MongoDB Atlas metrics
- Set up Render uptime alerts
- Configure Vercel analytics

### Email Notifications
- Update SMTP settings in `.env`:
  ```
  SMTP_HOST=smtp.gmail.com
  SMTP_PORT=587
  SMTP_USER=your_email@gmail.com
  SMTP_PASS=your_app_password
  ```
- For Gmail, create an App Password:
  - Google Account → Security → 2-Step Verification → App Passwords

## 9. Troubleshooting

### Backend not responding
- Check Render logs
- Verify environment variables
- Check MongoDB connection string

### Frontend not loading data
- Check API URL in Vercel environment
- Verify CORS settings in backend
- Test API endpoint directly in browser

### Images not uploading
- Verify Cloudinary credentials
- Check file size limits (10MB max)
- Check allowed file types

### Payment not working
- Verify Razorpay keys are correct
- Test mode keys for development
- Production keys for live payments

## 10. Cost Estimates

| Service | Free Tier | Production |
|---------|-----------|------------|
| MongoDB Atlas | 512MB storage | ~$57/mo |
| Render | 750 hrs/month | ~$7/mo |
| Vercel | 100GB bandwidth | ~$20/mo |
| Cloudinary | 25 credits | ~$89/mo |
| Razorpay | 0 setup fee | 2% per transaction |

---

## 🎉 Congratulations!

Your multi-vendor e-commerce platform is now live! 🎊