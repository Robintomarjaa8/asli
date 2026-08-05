import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiUsers, FiShoppingBag, FiPackage, FiDollarSign, FiTruck, FiStar, FiArrowRight } from 'react-icons/fi';
import api from '../../services/api';

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const { data } = await api.get('/admin/dashboard');
        setData(data.data);
      } catch (error) {
        console.error('Error fetching admin dashboard:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <div className="space-y-4">{[...Array(4)].map((_, i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}</div>;

  const stats = data?.stats || {};

  const statCards = [
    { label: 'Total Revenue', value: `₹${(stats.totalRevenue || 0).toLocaleString('en-IN')}`, icon: FiDollarSign, color: 'bg-green-100 text-green-600 dark:bg-green-900/30', link: '/admin/analytics' },
    { label: 'Total Buyers', value: stats.totalUsers || 0, icon: FiUsers, color: 'bg-primary-100 text-primary-600 dark:bg-primary-900/30', link: '/admin/users' },
    { label: 'Total Sellers', value: stats.totalSellers || 0, icon: FiShoppingBag, color: 'bg-accent-100 text-accent-600 dark:bg-accent-900/30', link: '/admin/sellers' },
    { label: 'Total Products', value: stats.totalProducts || 0, icon: FiPackage, color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30', link: '/admin/products' },
    { label: 'Total Orders', value: stats.totalOrders || 0, icon: FiTruck, color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30', link: '/admin/orders' },
    { label: 'Total Reviews', value: stats.totalReviews || 0, icon: FiStar, color: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30', link: '/admin/reviews' },
  ];

  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Admin Dashboard</h2>

      {/* Alerts */}
      {(stats.pendingSellers > 0 || stats.pendingProducts > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {stats.pendingSellers > 0 && (
            <Link to="/admin/sellers?status=pending" className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl flex items-center gap-3 hover:shadow-card transition-shadow">
              <div className="text-2xl">🏪</div>
              <div>
                <p className="font-semibold text-yellow-700 dark:text-yellow-400">{stats.pendingSellers} pending seller approvals</p>
                <p className="text-xs text-yellow-600 dark:text-yellow-500">Review seller applications</p>
              </div>
            </Link>
          )}
          {stats.pendingProducts > 0 && (
            <Link to="/admin/products?status=pending" className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl flex items-center gap-3 hover:shadow-card transition-shadow">
              <div className="text-2xl">📦</div>
              <div>
                <p className="font-semibold text-blue-700 dark:text-blue-400">{stats.pendingProducts} pending product approvals</p>
                <p className="text-xs text-blue-600 dark:text-blue-500">Review product submissions</p>
              </div>
            </Link>
          )}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {statCards.map((stat, idx) => (
          <Link key={idx} to={stat.link} className="card p-5 hover:shadow-card-hover transition-shadow">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-3 ${stat.color}`}>
              <stat.icon size={22} />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stat.value}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent orders */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Recent Orders</h3>
            <Link to="/admin/orders" className="flex items-center gap-1 text-primary-600 text-sm hover:gap-2 transition-all">View All <FiArrowRight /></Link>
          </div>
          {data?.recentOrders?.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No orders yet</p>
          ) : (
            <div className="space-y-3">
              {data?.recentOrders?.map((order) => (
                <div key={order._id} className="p-3 bg-gray-50 dark:bg-dark-800 rounded-lg">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-gray-900 dark:text-gray-100">#{order.orderNumber}</span>
                    <span className="text-gray-500 dark:text-gray-400">{order.user?.name}</span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-gray-500 dark:text-gray-400">{order.orderStatus}</span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">₹{order.totalPrice.toLocaleString('en-IN')}</span>
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
            <p className="text-gray-500 text-center py-8">No products yet</p>
          ) : (
            <div className="space-y-3">
              {data?.topProducts?.map((product) => (
                <div key={product._id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-dark-800 rounded-lg">
                  <img src={product.images?.[0]?.url} alt={product.name} className="w-12 h-12 object-cover rounded-lg" />
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

export default AdminDashboard;