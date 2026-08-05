import { Link } from 'react-router-dom';
import { FiUsers, FiShoppingBag, FiShield, FiTruck } from 'react-icons/fi';

const About = () => {
  const stats = [
    { icon: FiUsers, value: '10K+', label: 'Happy Customers' },
    { icon: FiShoppingBag, value: '50K+', label: 'Products' },
    { icon: FiShield, value: '100%', label: 'Secure Payments' },
    { icon: FiTruck, value: '24/7', label: 'Delivery Support' },
  ];

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="bg-gradient-primary text-white py-20">
        <div className="container-custom text-center">
          <h1 className="text-4xl md:text-5xl font-bold font-display mb-4">About ASLI Shoppe</h1>
          <p className="text-white/80 max-w-2xl mx-auto text-lg">
            Your trusted multi-vendor marketplace. We connect quality sellers with happy customers across India.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="container-custom py-16">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, idx) => (
            <div key={idx} className="card p-6 text-center">
              <stat.icon className="mx-auto text-primary-600 mb-3" size={32} />
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stat.value}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Story */}
      <section className="container-custom py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold font-display text-gray-900 dark:text-gray-100 mb-4">Our Story</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
              ASLI Shoppe started with a simple mission - to make quality products accessible to everyone. We built a platform where verified sellers can showcase their products and customers can shop with confidence.
            </p>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
              Today, we're proud to be one of India's fastest-growing marketplaces, offering everything from electronics to fashion, home essentials to beauty products.
            </p>
            <Link to="/shop" className="btn-primary">Start Shopping</Link>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <img src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400" alt="Shopping" className="rounded-2xl object-cover h-48 w-full" />
            <img src="https://images.unsplash.com/photo-1556740738-b6a63e27c4df?w=400" alt="Delivery" className="rounded-2xl object-cover h-48 w-full mt-8" />
            <img src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400" alt="Warehouse" className="rounded-2xl object-cover h-48 w-full" />
            <img src="https://images.unsplash.com/photo-1556740738-b6a63e27c4df?w=400" alt="Support" className="rounded-2xl object-cover h-48 w-full mt-8" />
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-gray-50 dark:bg-dark-950 py-16">
        <div className="container-custom">
          <h2 className="text-3xl font-bold font-display text-center text-gray-900 dark:text-gray-100 mb-10">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card p-6 text-center">
              <div className="text-4xl mb-3">🛡️</div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Trust & Safety</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Verified sellers and secure payments for every transaction.</p>
            </div>
            <div className="card p-6 text-center">
              <div className="text-4xl mb-3">⭐</div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Quality First</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Handpicked products that meet our quality standards.</p>
            </div>
            <div className="card p-6 text-center">
              <div className="text-4xl mb-3">🤝</div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Customer First</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">24/7 support and easy returns to keep you happy.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;