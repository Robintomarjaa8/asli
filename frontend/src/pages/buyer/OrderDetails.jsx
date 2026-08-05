import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiMapPin, FiTruck, FiDownload, FiCheckCircle, FiClock } from 'react-icons/fi';
import api from '../../services/api';
import toast from 'react-hot-toast';

const OrderDetails = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data } = await api.get(`/orders/${id}`);
        setOrder(data.data);
      } catch (error) {
        toast.error(error.response?.data?.error || 'Failed to load order');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  const cancelOrder = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    try {
      const { data } = await api.put(`/orders/${id}/cancel`, { reason: 'Cancelled by user' });
      setOrder(data.data);
      toast.success('Order cancelled');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to cancel order');
    }
  };

  const downloadInvoice = () => {
    toast.success('Invoice download started');
    window.print();
  };

  if (loading) {
    return <div className="space-y-4"><div className="skeleton h-64 rounded-2xl" /><div className="skeleton h-40 rounded-2xl" /></div>;
  }

  if (!order) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold mb-4">Order not found</h2>
        <Link to="/orders" className="btn-primary">Back to Orders</Link>
      </div>
    );
  }

  const statusSteps = ['pending', 'processing', 'shipped', 'delivered'];
  const currentStep = order.orderStatus === 'cancelled' ? -1 : statusSteps.indexOf(order.orderStatus);

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Order #{order.orderNumber}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Placed on {new Date(order.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={downloadInvoice} className="btn-outline text-sm">
            <FiDownload className="mr-1" /> Invoice
          </button>
          {order.orderStatus !== 'cancelled' && order.orderStatus !== 'delivered' && (
            <button onClick={cancelOrder} className="btn-danger text-sm">Cancel Order</button>
          )}
        </div>
      </div>

      {/* Status */}
      <div className="card p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">Order Status</h3>
          <span className={`badge ${
            order.orderStatus === 'delivered' ? 'badge-success' :
            order.orderStatus === 'cancelled' ? 'badge-danger' : 'badge-warning'
          }`}>{order.orderStatus}</span>
        </div>
        {currentStep >= 0 ? (
          <div className="flex items-center">
            {statusSteps.map((step, idx) => (
              <div key={step} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    idx <= currentStep ? 'bg-primary-600 text-white' : 'bg-gray-200 dark:bg-dark-700 text-gray-400'
                  }`}>
                    {idx < currentStep ? <FiCheckCircle /> : <FiClock />}
                  </div>
                  <span className="text-xs mt-2 capitalize text-gray-600 dark:text-gray-400">{step}</span>
                </div>
                {idx < statusSteps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 ${idx < currentStep ? 'bg-primary-600' : 'bg-gray-200 dark:bg-dark-700'}`} />
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg text-red-600 dark:text-red-400">
            <p className="font-medium">Order Cancelled</p>
            {order.cancellationReason && <p className="text-sm mt-1">{order.cancellationReason}</p>}
          </div>
        )}
      </div>

      {/* Items */}
      <div className="card p-6 mb-6">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Items</h3>
        <div className="space-y-4">
          {order.items.map((item) => (
            <div key={item._id} className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-dark-800 rounded-lg">
              <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-lg" />
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-gray-100">{item.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Qty: {item.quantity} • ₹{item.price}
                  {item.size && ` • Size: ${item.size}`}
                  {item.color && ` • Color: ${item.color}`}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900 dark:text-gray-100">₹{item.price * item.quantity}</p>
                <span className="badge-warning text-xs capitalize">{item.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Address */}
        <div className="card p-6">
          <h3 className="flex items-center gap-2 font-semibold text-gray-900 dark:text-gray-100 mb-4">
            <FiMapPin className="text-primary-600" /> Shipping Address
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            {order.shippingAddress.street}, {order.shippingAddress.city},
            {order.shippingAddress.state} - {order.shippingAddress.zipCode}
          </p>
          <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">{order.shippingAddress.phone}</p>
        </div>

        {/* Summary */}
        <div className="card p-6">
          <h3 className="flex items-center gap-2 font-semibold text-gray-900 dark:text-gray-100 mb-4">
            <FiTruck className="text-primary-600" /> Payment Summary
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Items</span><span>₹{order.itemsPrice.toLocaleString('en-IN')}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Shipping</span><span>{order.shippingPrice === 0 ? 'FREE' : `₹${order.shippingPrice}`}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Tax</span><span>₹{order.taxPrice.toLocaleString('en-IN')}</span></div>
            {order.discount > 0 && (
              <div className="flex justify-between"><span className="text-gray-500">Discount</span><span className="text-green-600">-₹{order.discount.toLocaleString('en-IN')}</span></div>
            )}
            <div className="border-t pt-3 flex justify-between font-bold">
              <span>Total</span><span>₹{order.totalPrice.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Payment</span>
              <span className={order.paymentInfo.status === 'paid' ? 'text-green-600' : 'text-yellow-600'}>
                {order.paymentInfo.status === 'paid' ? 'Paid' : order.paymentMethod === 'cod' ? 'COD' : 'Pending'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;