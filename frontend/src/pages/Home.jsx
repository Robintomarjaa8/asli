import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiTruck, FiShield, FiRefreshCw, FiHeadphones, FiArrowRight } from 'react-icons/fi';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import HeroSlider from '../components/HeroSlider';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [recentProducts, setRecentProducts] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [featuredRes, recentRes, bestRes, catRes] = await Promise.all([
          api.get('/products/featured'),
          api.get('/products/recent'),
          api.get('/products/best-sellers'),
          api.get('/categories'),
        ]);
        setFeaturedProducts(featuredRes.data.data);
        setRecentProducts(recentRes.data.data);
        setBestSellers(bestRes.data.data);
        setCategories(catRes.data.data);
      } catch (error) {
        console.error('Error fetching home data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const features = [
    { icon: FiTruck, title: 'Free Shipping', desc: 'On orders above ₹999' },
    { icon: FiShield, title: 'Secure Payment', desc: '100% secure payments' },
    { icon: FiRefreshCw, title: 'Easy Returns', desc: '7-day return policy' },
    { icon: FiHeadphones, title: '24/7 Support', desc: 'Dedicated support' },
  ];

  return (
    <div className="animate-fade-in">
      {/* Hero Slider */}
      <HeroSlider />

      {/* Features */}
      <div className="container-custom py-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="card p-6 flex items-center gap-4 hover:shadow-card-hover transition-shadow"
            >
              <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex items-center justify-center">
                <feature.icon size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">{feature.title}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">{feature.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Categories */}
      <section className="container-custom py-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="section-title">Shop by Category</h2>
          <Link to="/shop" className="flex items-center gap-1 text-primary-600 dark:text-primary-400 text-sm font-medium hover:gap-2 transition-all">
            View All <FiArrowRight />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
          {categories.map((cat, idx) => (
            <motion.div
              key={cat._id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Link
                to={`/category/${cat.slug}`}
                className="card p-4 flex flex-col items-center gap-3 hover:shadow-card-hover hover:-translate-y-1 transition-all group"
              >
                <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-dark-800 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                  {cat.icon || '🛍️'}
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center">{cat.name}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="bg-gradient-to-b from-gray-50 to-white dark:from-dark-950 dark:to-dark-900 py-12">
        <div className="container-custom">
          <div className="flex items-center justify-between mb-6">
            <h2 className="section-title">Featured Products</h2>
            <Link to="/shop?sort=featured" className="flex items-center gap-1 text-primary-600 dark:text-primary-400 text-sm font-medium hover:gap-2 transition-all">
              View All <FiArrowRight />
            </Link>
          </div>
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="card p-4">
                  <div className="skeleton aspect-square rounded-xl mb-4" />
                  <div className="skeleton h-4 w-3/4 mb-2" />
                  <div className="skeleton h-4 w-1/2 mb-4" />
                  <div className="skeleton h-10 w-full rounded-lg" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {featuredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Best Sellers */}
      <section className="container-custom py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="section-title">Best Sellers</h2>
          <Link to="/shop?sort=popular" className="flex items-center gap-1 text-primary-600 dark:text-primary-400 text-sm font-medium hover:gap-2 transition-all">
            View All <FiArrowRight />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {bestSellers.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </section>

      {/* Promo banner */}
      <section className="container-custom py-8">
        <div className="bg-gradient-accent rounded-2xl p-8 md:p-12 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
          <div className="relative max-w-xl">
            <h2 className="text-3xl md:text-4xl font-bold font-display mb-3">Summer Sale!</h2>
            <p className="text-white/90 mb-6">Get up to 70% off on select items. Limited time offer!</p>
            <Link to="/shop" className="inline-flex items-center gap-2 bg-white text-accent-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Shop Now <FiArrowRight />
            </Link>
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="container-custom py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="section-title">New Arrivals</h2>
          <Link to="/shop?sort=newest" className="flex items-center gap-1 text-primary-600 dark:text-primary-400 text-sm font-medium hover:gap-2 transition-all">
            View All <FiArrowRight />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {recentProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;