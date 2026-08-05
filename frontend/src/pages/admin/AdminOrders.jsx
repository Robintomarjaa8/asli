import { useState, useEffect } from 'react';
import { FiTruck } from 'react-icons/fi';
import api from '../../services/api';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await api.get(`/admin/orders${filter ? `?status=${filter}` : ''}`);
        setOrders(data.data);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [filter]);

  const getStatusBadge = (status) => {
    const map = {
      pending: 'badge-warning', processing: 'badge-info', shipped: 'badge-primary',
      delivered: 'badge-success', cancelled: 'badge-danger', refunded: 'badge-danger',
    };
    return map[status] || 'badge-info';
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Manage Orders</h2>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="input w-auto text-sm">
          <option value="">All Orders</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {loading ? (
        <div className="space-y-4">{[...Array(4)].map((_, i) => <div key={i} className="skeleton h-20 rounded-2xl" />)}</div>
      ) : orders.length === 0 ? (
        <div className="card p-12 text-center">
          <FiTruck className="mx-auto text-5xl text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">No orders found</h3>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-dark-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Order</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Items</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-dark-700">
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50 dark:hover:bg-dark-800">
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">#{order.orderNumber}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">{order.user?.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{order.items.length}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">₹{order.totalPrice.toLocaleString('en-IN')}</td>
                    <td className="px-6 py-4">
                      <span className={`badge ${getStatusBadge(order.orderStatus)}`}>{order.orderStatus}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;