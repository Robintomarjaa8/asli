import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiShoppingCart, FiHeart, FiUser, FiSearch, FiMenu, FiX, FiMoon, FiSun, FiLogOut, FiPackage, FiTruck } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { cartCount } = useCart();
  const { darkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState([]);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const userMenuRef = useRef(null);

  useEffect(() => {
    // Fetch categories
    const fetchCategories = async () => {
      try {
        const { data } = await api.get('/categories');
        setCategories(data.data.slice(0, 8));
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm('');
      setSearchOpen(false);
    }
  };

  const getDashboardLink = () => {
    if (user?.role === 'admin') return '/admin/dashboard';
    if (user?.role === 'seller') return '/seller/dashboard';
    return '/dashboard';
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-dark-900/95 backdrop-blur-lg border-b border-gray-200 dark:border-dark-700 shadow-sm">
      <nav className="container-custom">
        <div className="flex items-center justify-between h-16">
          {/* Mobile menu button */}
          <button
            className="lg:hidden p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-800 rounded-lg"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent font-display">
              ASLI
            </span>
            <span className="hidden sm:inline text-sm font-medium text-gray-500 dark:text-gray-400">
              Shoppe
            </span>
          </Link>

          {/* Desktop Search */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl mx-8">
            <div className="relative w-full">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search products, brands and more..."
                className="input pl-10 pr-4 rounded-r-none"
              />
              <FiSearch className="absolute left-3 top-3 text-gray-400" />
              <button type="submit" className="btn-primary rounded-l-none px-6">
                Search
              </button>
            </div>
          </form>

          {/* Right icons */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-800"
              title="Toggle theme"
            >
              {darkMode ? <FiSun size={20} /> : <FiMoon size={20} />}
            </button>

            {/* Mobile search */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="md:hidden p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-800"
            >
              <FiSearch size={20} />
            </button>

            {/* Cart */}
            <Link to="/cart" className="relative p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-800">
              <FiShoppingCart size={22} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-accent-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Wishlist */}
            <Link to="/wishlist" className="hidden sm:block p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-800">
              <FiHeart size={22} />
            </Link>

            {/* User menu */}
            {isAuthenticated ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-800"
                >
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold">
                      {user?.name?.charAt(0)?.toUpperCase()}
                    </div>
                  )}
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-dark-800 rounded-xl shadow-card-hover border border-gray-200 dark:border-dark-700 py-2 animate-scale-in">
                    <div className="px-4 py-2 border-b border-gray-100 dark:border-dark-700">
                      <p className="font-semibold text-sm text-gray-900 dark:text-gray-100">{user?.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
                    </div>
                    <Link to={getDashboardLink()} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-700">
                      <FiPackage size={16} /> Dashboard
                    </Link>
                    <Link to="/profile" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-700">
                      <FiUser size={16} /> My Profile
                    </Link>
                    <Link to="/orders" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-700">
                      <FiTruck size={16} /> My Orders
                    </Link>
                    <button
                      onClick={logout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <FiLogOut size={16} /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="btn-ghost text-sm hidden sm:inline-flex">
                  Login
                </Link>
                <Link to="/register" className="btn-primary text-sm hidden sm:inline-flex">
                  Register
                </Link>
                <Link to="/login" className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-800 sm:hidden">
                  <FiUser size={22} />
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile search */}
        {searchOpen && (
          <form onSubmit={handleSearch} className="md:hidden pb-3 animate-slide-down">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search products..."
                className="input pl-10"
                autoFocus
              />
              <FiSearch className="absolute left-3 top-3 text-gray-400" />
            </div>
          </form>
        )}
      </nav>

      {/* Category bar */}
      <div className="hidden lg:block border-t border-gray-100 dark:border-dark-700">
        <div className="container-custom flex items-center gap-6 overflow-x-auto scrollbar-hide py-2">
          <Link to="/shop" className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 whitespace-nowrap transition-colors">
            All Products
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat._id}
              to={`/category/${cat.slug}`}
              className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 whitespace-nowrap transition-colors"
            >
              {cat.name}
            </Link>
          ))}
          <Link to="/track-order" className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 whitespace-nowrap transition-colors">
            Track Order
          </Link>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-gray-200 dark:border-dark-700 bg-white dark:bg-dark-900 animate-slide-down">
          <div className="container-custom py-4 space-y-4">
            <div className="flex flex-col gap-2">
              <Link to="/shop" className="px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-800 text-gray-700 dark:text-gray-300 font-medium">
                All Products
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat._id}
                  to={`/category/${cat.slug}`}
                  className="px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-800 text-gray-700 dark:text-gray-300 font-medium"
                >
                  {cat.name}
                </Link>
              ))}
              <Link to="/track-order" className="px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-800 text-gray-700 dark:text-gray-300 font-medium">
                Track Order
              </Link>
            </div>
            {!isAuthenticated && (
              <div className="flex gap-3 pt-2 border-t border-gray-200 dark:border-dark-700">
                <Link to="/login" className="btn-outline flex-1">Login</Link>
                <Link to="/register" className="btn-primary flex-1">Register</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;