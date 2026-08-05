import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiPackage, FiTruck, FiHeart, FiUser, FiDollarSign, FiArrowRight } from 'react-icons/fi';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const BuyerDashboard = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await api.get('/orders/my-orders?limit=5');
        setOrders(data.data);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const totalSpent = orders.reduce((sum, order) => sum + order.totalPrice, 0);

  const stats = [
    { label: 'Total Orders', value: orders.length, icon: FiPackage, color: 'bg-primary-100 text-primary-600 dark:bg-primary-900/30' },
    { label: 'Total Spent', value: `₹${totalSpent.toLocaleString('en-IN')}`, icon: FiDollarSign, color: 'bg-green-100 text-green-600 dark:bg-green-900/30' },
    { label: 'Wishlist Items', value: user?.wishlist?.length || 0, icon: FiHeart, color: 'bg-red-100 text-red-600 dark:bg-red-900/30' },
    { label: 'Profile', value: 'Complete', icon: FiUser, color: 'bg-accent-100 text-accent-600 dark:bg-accent-900/30' },
  ];

  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Welcome back, {user?.name}!</h2>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, idx) => (
          <div key={idx} className="card p-5">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-3 ${stat.color}`}>
              <stat.icon size={22} />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stat.value}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Recent orders */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">Recent Orders</h3>
          <Link to="/orders" className="flex items-center gap-1 text-primary-600 text-sm hover:gap-2 transition-all">
            View All <FiArrowRight />
          </Link>
        </div>
        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => <div key={i} className="skeleton h-16 rounded-lg" />)}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-8">
            <FiTruck className="mx-auto text-4xl text-gray-300 mb-3" />
            <p className="text-gray-500 dark:text-gray-400 mb-4">No orders yet</p>
            <Link to="/shop" className="btn-primary">Start Shopping</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <Link key={order._id} to={`/orders/${order._id}`} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-dark-800 rounded-lg hover:shadow-card transition-shadow">
                <div>
                  <p className="font-medium text-sm text-gray-900 dark:text-gray-100">#{order.orderNumber}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-sm text-gray-900 dark:text-gray-100">₹{order.totalPrice.toLocaleString('en-IN')}</p>
                  <span className="badge-warning text-xs">{order.orderStatus}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BuyerDashboard;