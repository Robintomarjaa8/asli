import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiPackage, FiDollarSign, FiTruck, FiStar, FiAlertTriangle, FiPlusCircle, FiArrowRight } from 'react-icons/fi';
import api, { getImageUrl } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const SellerDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const { data } = await api.get('/seller/dashboard');
        setData(data.data);
      } catch (error) {
        console.error('Error fetching seller dashboard:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}
        </div>
        <div className="skeleton h-64 rounded-2xl" />
      </div>
    );
  }

  const stats = data?.stats || {};

  const statCards = [
    { label: 'Total Products', value: stats.totalProducts, icon: FiPackage, color: 'bg-primary-100 text-primary-600 dark:bg-primary-900/30' },
    { label: 'Total Earnings', value: `₹${(stats.totalEarnings || 0).toLocaleString('en-IN')}`, icon: FiDollarSign, color: 'bg-green-100 text-green-600 dark:bg-green-900/30' },
    { label: 'Total Orders', value: stats.totalOrders, icon: FiTruck, color: 'bg-accent-100 text-accent-600 dark:bg-accent-900/30' },
    { label: 'Store Rating', value: stats.storeRating?.toFixed(1) || '0.0', icon: FiStar, color: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30' },
  ];

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Welcome, {user?.sellerProfile?.storeName || user?.name}!
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Here's your store overview</p>
        </div>
        <Link to="/seller/products/add" className="btn-primary text-sm">
          <FiPlusCircle className="mr-1" /> Add Product
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat, idx) => (
          <div key={idx} className="card p-5">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-3 ${stat.color}`}>
              <stat.icon size={22} />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stat.value}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Alerts */}
      {stats.lowStockProducts > 0 && (
        <div className="mb-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl flex items-center gap-3">
          <FiAlertTriangle className="text-yellow-600 shrink-0" />
          <p className="text-sm text-yellow-700 dark:text-yellow-400">
            {stats.lowStockProducts} products are low on stock. <Link to="/seller/inventory" className="font-semibold underline">Manage inventory</Link>
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent orders */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Recent Orders</h3>
            <Link to="/seller/orders" className="flex items-center gap-1 text-primary-600 text-sm hover:gap-2 transition-all">
              View All <FiArrowRight />
            </Link>
          </div>
          {data?.recentOrders?.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">No orders yet</p>
          ) : (
            <div className="space-y-3">
              {data?.recentOrders?.slice(0, 5).map((order) => (
                <div key={order._id} className="p-3 bg-gray-50 dark:bg-dark-800 rounded-lg">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-gray-900 dark:text-gray-100">#{order.orderNumber}</span>
                    <span className="text-gray-500 dark:text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-gray-500 dark:text-gray-400">{order.user?.name}</span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">₹{order.items.reduce((s, i) => s + i.price * i.quantity, 0).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top products */}
        <div className="card p-6">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Top Selling Products</h3>
          {data?.topProducts?.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">No products yet</p>
          ) : (
            <div className="space-y-3">
              {data?.topProducts?.map((product) => (
                <div key={product._id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-dark-800 rounded-lg">
                  <img src={getImageUrl(product.images?.[0]?.url)} alt={product.name} className="w-12 h-12 object-cover rounded-lg" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-1">{product.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{product.quantitySold} sold</p>
                  </div>
                  <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">₹{product.price.toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;