import { useState } from 'react';
import { FiTruck, FiSearch, FiCheckCircle, FiClock } from 'react-icons/fi';
import api from '../services/api';
import toast from 'react-hot-toast';

const TrackOrder = () => {
  const [orderNumber, setOrderNumber] = useState('');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleTrack = async (e) => {
    e.preventDefault();
    if (!orderNumber.trim()) {
      toast.error('Please enter an order number');
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.get(`/orders/track/${orderNumber.trim()}`);
      setOrder(data.data);
    } catch (error) {
      setOrder(null);
      toast.error(error.response?.data?.error || 'Order not found');
    } finally {
      setLoading(false);
    }
  };

  const statusSteps = ['pending', 'processing', 'shipped', 'delivered'];

  const getStatusIndex = (status) => {
    if (status === 'cancelled' || status === 'refunded') return -1;
    return statusSteps.indexOf(status);
  };

  return (
    <div className="container-custom py-12 animate-fade-in">
      <h1 className="section-title text-center mb-4">Track Your Order</h1>
      <p className="text-gray-500 dark:text-gray-400 text-center mb-8">
        Enter your order number to track its status
      </p>

      <form onSubmit={handleTrack} className="max-w-lg mx-auto mb-10">
        <div className="flex gap-2">
          <input
            type="text"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            placeholder="e.g. ASLI-20240803-1234"
            className="input flex-1"
          />
          <button type="submit" disabled={loading} className="btn-primary whitespace-nowrap">
            <FiSearch className="mr-2" /> {loading ? 'Tracking...' : 'Track'}
          </button>
        </div>
      </form>

      {order && (
        <div className="max-w-2xl mx-auto">
          <div className="card p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="font-semibold text-gray-900 dark:text-gray-100">Order #{order.orderNumber}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Placed on {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>
              <span className={`badge ${
                order.orderStatus === 'delivered' ? 'badge-success' :
                order.orderStatus === 'cancelled' ? 'badge-danger' : 'badge-warning'
              }`}>
                {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
              </span>
            </div>

            {/* Status timeline */}
            {getStatusIndex(order.orderStatus) >= 0 ? (
              <div className="flex items-center justify-between mb-6">
                {statusSteps.map((step, idx) => (
                  <div key={step} className="flex items-center flex-1">
                    <div className="flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        idx <= getStatusIndex(order.orderStatus)
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-200 dark:bg-dark-700 text-gray-400'
                      }`}>
                        {idx < getStatusIndex(order.orderStatus) ? <FiCheckCircle /> : <FiClock />}
                      </div>
                      <span className="text-xs mt-2 capitalize text-gray-600 dark:text-gray-400">{step}</span>
                    </div>
                    {idx < statusSteps.length - 1 && (
                      <div className={`flex-1 h-0.5 mx-2 ${
                        idx < getStatusIndex(order.orderStatus)
                          ? 'bg-primary-600'
                          : 'bg-gray-200 dark:bg-dark-700'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg text-red-600 dark:text-red-400">
                <p className="font-medium">Order {order.orderStatus}</p>
                {order.cancellationReason && <p className="text-sm mt-1">{order.cancellationReason}</p>}
              </div>
            )}

            {/* Items */}
            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item._id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-dark-800 rounded-lg">
                  <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-lg" />
                  <div className="flex-1">
                    <p className="font-medium text-sm text-gray-900 dark:text-gray-100">{item.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Qty: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm text-gray-900 dark:text-gray-100">₹{item.price * item.quantity}</p>
                    <span className="badge-warning text-xs capitalize">{item.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackOrder;