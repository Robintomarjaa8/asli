import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiTruck, FiPackage } from 'react-icons/fi';
import api from '../../services/api';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await api.get(`/orders/my-orders${statusFilter ? `?status=${statusFilter}` : ''}`);
        setOrders(data.data);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [statusFilter]);

  const statuses = ['', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'];

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">My Orders</h2>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input w-auto text-sm"
        >
          {statuses.map((s) => (
            <option key={s} value={s}>
              {s ? s.charAt(0).toUpperCase() + s.slice(1) : 'All Orders'}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}
        </div>
      ) : orders.length === 0 ? (
        <div className="card p-12 text-center">
          <FiPackage className="mx-auto text-5xl text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">No orders found</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">You haven't placed any orders yet</p>
          <Link to="/shop" className="btn-primary">Start Shopping</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link key={order._id} to={`/orders/${order._id}`} className="card p-5 hover:shadow-card-hover transition-shadow block">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">Order #{order.orderNumber}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(order.createdAt).toLocaleDateString()} • {order.items.length} items
                  </p>
                </div>
                <span className={`badge ${
                  order.orderStatus === 'delivered' ? 'badge-success' :
                  order.orderStatus === 'cancelled' ? 'badge-danger' : 'badge-warning'
                }`}>
                  {order.orderStatus}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex -space-x-2">
                  {order.items.slice(0, 4).map((item) => (
                    <img key={item._id} src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover border-2 border-white dark:border-dark-800" />
                  ))}
                  {order.items.length > 4 && (
                    <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-dark-700 flex items-center justify-center text-sm font-semibold text-gray-600 dark:text-gray-300 border-2 border-white dark:border-dark-800">
                      +{order.items.length - 4}
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900 dark:text-gray-100">₹{order.totalPrice.toLocaleString('en-IN')}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <FiTruck className="inline" /> {order.paymentMethod === 'cod' ? 'COD' : 'Paid'}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;