import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import MainLayout from './layouts/MainLayout';
import DashboardLayout from './layouts/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';

// Eagerly load Home (landing page) for fast first paint
import Home from './pages/Home';

// Lazy load all other pages for code splitting & faster initial load
const Shop = lazy(() => import('./pages/Shop'));
const ProductDetails = lazy(() => import('./pages/ProductDetails'));
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));
const Wishlist = lazy(() => import('./pages/Wishlist'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const NotFound = lazy(() => import('./pages/NotFound'));
const TrackOrder = lazy(() => import('./pages/TrackOrder'));
const CategoryPage = lazy(() => import('./pages/CategoryPage'));

// Buyer pages
const BuyerDashboard = lazy(() => import('./pages/buyer/BuyerDashboard'));
const Orders = lazy(() => import('./pages/buyer/Orders'));
const OrderDetails = lazy(() => import('./pages/buyer/OrderDetails'));
const Profile = lazy(() => import('./pages/buyer/Profile'));
const ChangePassword = lazy(() => import('./pages/buyer/ChangePassword'));
const Addresses = lazy(() => import('./pages/buyer/Addresses'));

// Seller pages
const SellerDashboard = lazy(() => import('./pages/seller/SellerDashboard'));
const SellerProducts = lazy(() => import('./pages/seller/SellerProducts'));
const AddProduct = lazy(() => import('./pages/seller/AddProduct'));
const EditProduct = lazy(() => import('./pages/seller/EditProduct'));
const SellerOrders = lazy(() => import('./pages/seller/SellerOrders'));
const SellerInventory = lazy(() => import('./pages/seller/SellerInventory'));
const SellerAnalytics = lazy(() => import('./pages/seller/SellerAnalytics'));
const SellerEarnings = lazy(() => import('./pages/seller/SellerEarnings'));
const SellerReviews = lazy(() => import('./pages/seller/SellerReviews'));

// Admin pages
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));
const AdminSellers = lazy(() => import('./pages/admin/AdminSellers'));
const AdminProducts = lazy(() => import('./pages/admin/AdminProducts'));
const AdminOrders = lazy(() => import('./pages/admin/AdminOrders'));
const AdminCategories = lazy(() => import('./pages/admin/AdminCategories'));
const AdminReviews = lazy(() => import('./pages/admin/AdminReviews'));
const AdminAnalytics = lazy(() => import('./pages/admin/AdminAnalytics'));

// Loading fallback
const PageLoader = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
  </div>
);

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public routes with MainLayout */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/category/:slug" element={<CategoryPage />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/track-order" element={<TrackOrder />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <Login />} />
          <Route path="/register" element={isAuthenticated ? <Navigate to="/" /> : <Register />} />
        </Route>

        {/* Buyer dashboard routes */}
        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<BuyerDashboard />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/orders/:id" element={<OrderDetails />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/change-password" element={<ChangePassword />} />
          <Route path="/addresses" element={<Addresses />} />
        </Route>

        {/* Seller dashboard routes */}
        <Route
          element={
            <ProtectedRoute role="seller">
              <DashboardLayout role="seller" />
            </ProtectedRoute>
          }
        >
          <Route path="/seller/dashboard" element={<SellerDashboard />} />
          <Route path="/seller/products" element={<SellerProducts />} />
          <Route path="/seller/products/add" element={<AddProduct />} />
          <Route path="/seller/products/edit/:id" element={<EditProduct />} />
          <Route path="/seller/orders" element={<SellerOrders />} />
          <Route path="/seller/inventory" element={<SellerInventory />} />
          <Route path="/seller/analytics" element={<SellerAnalytics />} />
          <Route path="/seller/earnings" element={<SellerEarnings />} />
          <Route path="/seller/reviews" element={<SellerReviews />} />
        </Route>

        {/* Admin dashboard routes */}
        <Route
          element={
            <ProtectedRoute role="admin">
              <DashboardLayout role="admin" />
            </ProtectedRoute>
          }
        >
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/sellers" element={<AdminSellers />} />
          <Route path="/admin/products" element={<AdminProducts />} />
          <Route path="/admin/orders" element={<AdminOrders />} />
          <Route path="/admin/categories" element={<AdminCategories />} />
          <Route path="/admin/reviews" element={<AdminReviews />} />
          <Route path="/admin/analytics" element={<AdminAnalytics />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

export default App;