import { useState, useEffect } from 'react';
import { FiTruck } from 'react-icons/fi';
import api from '../../services/api';
import toast from 'react-hot-toast';

const SellerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await api.get('/orders/seller/orders');
        setOrders(data.data);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const updateStatus = async (itemId, status) => {
    try {
      await api.put(`/orders/item/${itemId}/status`, { status });
      toast.success(`Order marked as ${status}`);
      // Refresh
      const { data } = await api.get('/orders/seller/orders');
      setOrders(data.data);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update status');
    }
  };

  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Received Orders</h2>
      {loading ? (
        <div className="space-y-4">{[...Array(4)].map((_, i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}</div>
      ) : orders.length === 0 ? (
        <div className="card p-12 text-center">
          <FiTruck className="mx-auto text-5xl text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">No orders yet</h3>
          <p className="text-gray-500 dark:text-gray-400">Orders from customers will appear here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order._id} className="card p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">Order #{order.orderNumber}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {order.user?.name} • {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span className="badge-info">{order.paymentMethod}</span>
              </div>
              <div className="space-y-3">
                {order.items.map((item) => (
                  <div key={item._id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-dark-800 rounded-lg">
                    <img src={item.image} alt={item.name} className="w-14 h-14 object-cover rounded-lg" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{item.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Qty: {item.quantity} • ₹{item.price}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="badge-warning text-xs capitalize">{item.status}</span>
                      <select
                        value={item.status}
                        onChange={(e) => updateStatus(item._id, e.target.value)}
                        className="input text-xs py-1 px-2 w-auto"
                      >
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SellerOrders;