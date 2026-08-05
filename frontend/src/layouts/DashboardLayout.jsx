import { useState } from 'react';
import { Outlet, Link, NavLink, useNavigate } from 'react-router-dom';
import {
  FiHome, FiShoppingBag, FiPackage, FiTruck, FiUsers, FiStar, FiBarChart2,
  FiDollarSign, FiFolder, FiSettings, FiLogOut, FiMenu, FiX, FiChevronRight,
  FiGrid, FiPlusCircle, FiTruck as FiTruckIcon, FiHeart, FiShoppingCart
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { FiMoon, FiSun } from 'react-icons/fi';

const DashboardLayout = ({ role = 'buyer' }) => {
  const { user, logout } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const buyerLinks = [
    { to: '/dashboard', icon: FiHome, label: 'Dashboard' },
    { to: '/orders', icon: FiTruck, label: 'My Orders' },
    { to: '/wishlist', icon: FiHeart, label: 'Wishlist' },
    { to: '/cart', icon: FiShoppingCart, label: 'Cart' },
    { to: '/profile', icon: FiSettings, label: 'Profile' },
    { to: '/change-password', icon: FiSettings, label: 'Change Password' },
    { to: '/addresses', icon: FiGrid, label: 'Addresses' },
  ];

  const sellerLinks = [
    { to: '/seller/dashboard', icon: FiHome, label: 'Dashboard' },
    { to: '/seller/products', icon: FiPackage, label: 'Products' },
    { to: '/seller/products/add', icon: FiPlusCircle, label: 'Add Product' },
    { to: '/seller/orders', icon: FiTruckIcon, label: 'Orders' },
    { to: '/seller/inventory', icon: FiGrid, label: 'Inventory' },
    { to: '/seller/analytics', icon: FiBarChart2, label: 'Analytics' },
    { to: '/seller/earnings', icon: FiDollarSign, label: 'Earnings' },
    { to: '/seller/reviews', icon: FiStar, label: 'Reviews' },
  ];

  const adminLinks = [
    { to: '/admin/dashboard', icon: FiHome, label: 'Dashboard' },
    { to: '/admin/users', icon: FiUsers, label: 'Buyers' },
    { to: '/admin/sellers', icon: FiShoppingBag, label: 'Sellers' },
    { to: '/admin/products', icon: FiPackage, label: 'Products' },
    { to: '/admin/orders', icon: FiTruck, label: 'Orders' },
    { to: '/admin/categories', icon: FiFolder, label: 'Categories' },
    { to: '/admin/reviews', icon: FiStar, label: 'Reviews' },
    { to: '/admin/analytics', icon: FiBarChart2, label: 'Analytics' },
  ];

  const links = role === 'admin' ? adminLinks : role === 'seller' ? sellerLinks : buyerLinks;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const SidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200 dark:border-dark-700">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent font-display">ASLI</span>
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400 capitalize">{role} Panel</span>
        </Link>
      </div>

      {/* Nav links */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/20'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-800'
              }`
            }
          >
            <link.icon size={18} />
            {link.label}
          </NavLink>
        ))}
      </nav>

      {/* Bottom */}
      <div className="p-4 border-t border-gray-200 dark:border-dark-700 space-y-2">
        <Link to="/" className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-800">
          <FiShoppingBag size={18} />
          Back to Store
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
        >
          <FiLogOut size={18} />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-64 bg-white dark:bg-dark-900 border-r border-gray-200 dark:border-dark-700 fixed inset-y-0">
        {SidebarContent}
      </aside>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-white dark:bg-dark-900 shadow-xl animate-slide-right">
            <button
              className="absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-700"
              onClick={() => setSidebarOpen(false)}
            >
              <FiX size={20} />
            </button>
            {SidebarContent}
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 lg:ml-64">
        {/* Top bar */}
        <header className="sticky top-0 z-40 bg-white/95 dark:bg-dark-900/95 backdrop-blur border-b border-gray-200 dark:border-dark-700">
          <div className="flex items-center justify-between px-4 sm:px-6 py-4">
            <div className="flex items-center gap-3">
              <button
                className="lg:hidden p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-800"
                onClick={() => setSidebarOpen(true)}
              >
                <FiMenu size={22} />
              </button>
              <div>
                <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100 capitalize">
                  {role} Dashboard
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Welcome back, {user?.name}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-800"
              >
                {darkMode ? <FiSun size={18} /> : <FiMoon size={18} />}
              </button>
              <div className="flex items-center gap-2">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-9 h-9 rounded-full object-cover" />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold">
                    {user?.name?.charAt(0)?.toUpperCase()}
                  </div>
                )}
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{user?.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user?.role}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;