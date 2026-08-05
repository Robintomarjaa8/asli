import { Link } from 'react-router-dom';
import { FiFacebook, FiTwitter, FiInstagram, FiYoutube, FiMail, FiPhone, FiMapPin } from 'react-icons/fi';

const Footer = () => {
  return (
    <footer className="bg-white dark:bg-dark-900 border-t border-gray-200 dark:border-dark-700 mt-16">
      {/* Newsletter */}
      <div className="bg-gradient-primary py-10">
        <div className="container-custom flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-2xl font-bold text-white font-display">Stay in the loop</h3>
            <p className="text-white/80 mt-1">Get exclusive deals, new arrivals and more</p>
          </div>
          <form className="flex w-full md:w-auto gap-2" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="Enter your email"
              className="input flex-1 md:w-80 bg-white/20 border-white/30 text-white placeholder-white/60 focus:ring-white"
            />
            <button className="btn bg-white text-primary-600 hover:bg-gray-100 whitespace-nowrap">
              Subscribe
            </button>
          </form>
        </div>
      </div>

      {/* Main footer */}
      <div className="container-custom py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* Brand */}
        <div>
          <Link to="/" className="flex items-center gap-2 mb-4">
            <span className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent font-display">ASLI</span>
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Shoppe</span>
          </Link>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            Your one-stop destination for quality products. Shop the latest electronics, fashion, home essentials and more from trusted sellers.
          </p>
          <div className="flex gap-3 mt-4">
            <a href="#" className="p-2 rounded-lg bg-gray-100 dark:bg-dark-800 text-gray-600 dark:text-gray-300 hover:bg-primary-600 hover:text-white transition-colors">
              <FiFacebook size={18} />
            </a>
            <a href="#" className="p-2 rounded-lg bg-gray-100 dark:bg-dark-800 text-gray-600 dark:text-gray-300 hover:bg-primary-600 hover:text-white transition-colors">
              <FiTwitter size={18} />
            </a>
            <a href="#" className="p-2 rounded-lg bg-gray-100 dark:bg-dark-800 text-gray-600 dark:text-gray-300 hover:bg-primary-600 hover:text-white transition-colors">
              <FiInstagram size={18} />
            </a>
            <a href="#" className="p-2 rounded-lg bg-gray-100 dark:bg-dark-800 text-gray-600 dark:text-gray-300 hover:bg-primary-600 hover:text-white transition-colors">
              <FiYoutube size={18} />
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Quick Links</h4>
          <ul className="space-y-2">
            <li><Link to="/shop" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400">Shop All</Link></li>
            <li><Link to="/about" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400">About Us</Link></li>
            <li><Link to="/contact" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400">Contact</Link></li>
            <li><Link to="/track-order" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400">Track Order</Link></li>
            <li><Link to="/wishlist" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400">Wishlist</Link></li>
          </ul>
        </div>

        {/* Categories */}
        <div>
          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Categories</h4>
          <ul className="space-y-2">
            <li><Link to="/category/electronics" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400">Electronics</Link></li>
            <li><Link to="/category/fashion" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400">Fashion</Link></li>
            <li><Link to="/category/home-kitchen" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400">Home & Kitchen</Link></li>
            <li><Link to="/category/beauty" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400">Beauty</Link></li>
            <li><Link to="/category/sports" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400">Sports</Link></li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Contact Us</h4>
          <ul className="space-y-3">
            <li className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
              <FiMapPin className="text-primary-600 shrink-0" />
              <span>123 Market Street, Mumbai, India</span>
            </li>
            <li className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
              <FiPhone className="text-primary-600 shrink-0" />
              <span>+91 98765 43210</span>
            </li>
            <li className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
              <FiMail className="text-primary-600 shrink-0" />
              <span>support@asli.com</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-200 dark:border-dark-700">
        <div className="container-custom py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} ASLI Shoppe. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link to="#" className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary-600">Privacy Policy</Link>
            <Link to="#" className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary-600">Terms of Service</Link>
            <Link to="#" className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary-600">FAQ</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;