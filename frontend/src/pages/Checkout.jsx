import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiMapPin, FiCreditCard, FiCheckCircle } from 'react-icons/fi';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

const Checkout = () => {
  const { user, isAuthenticated } = useAuth();
  const { cart, clearCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [address, setAddress] = useState({
    label: 'Home',
    street: '',
    city: '',
    state: '',
    country: 'India',
    zipCode: '',
    phone: user?.phone || '',
  });

  const subtotal = cart?.items?.reduce((sum, item) => sum + item.price * item.quantity, 0) || 0;
  const shipping = subtotal >= 999 ? 0 : 49;
  const tax = Math.round(subtotal * 0.05);
  const total = subtotal + shipping + tax;

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const handlePlaceOrder = async () => {
    // Validate address
    if (!address.street || !address.city || !address.state || !address.zipCode) {
      toast.error('Please fill in all address fields');
      return;
    }

    setLoading(true);
    try {
      const items = cart.items.map((item) => ({
        product: item.product._id,
        quantity: item.quantity,
        size: item.size || '',
        color: item.color || '',
      }));

      // Create order
      const { data } = await api.post('/orders', {
        items,
        shippingAddress: address,
        paymentMethod,
      });

      toast.success('Order placed successfully!');
      await clearCart();
      navigate(`/orders/${data.data._id}`);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container-custom py-16 text-center">
        <div className="text-6xl mb-4">🛒</div>
        <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
        <Link to="/shop" className="btn-primary mt-4">Continue Shopping</Link>
      </div>
    );
  }

  return (
    <div className="container-custom py-8 animate-fade-in">
      <h1 className="section-title mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left - Address & Payment */}
        <div className="lg:col-span-2 space-y-6">
          {/* Address */}
          <div className="card p-6">
            <h2 className="flex items-center gap-2 font-semibold text-gray-900 dark:text-gray-100 mb-4">
              <FiMapPin className="text-primary-600" /> Shipping Address
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="label">Street Address</label>
                <input
                  type="text"
                  value={address.street}
                  onChange={(e) => setAddress({ ...address, street: e.target.value })}
                  className="input"
                  placeholder="House no, street, area"
                />
              </div>
              <div>
                <label className="label">City</label>
                <input
                  type="text"
                  value={address.city}
                  onChange={(e) => setAddress({ ...address, city: e.target.value })}
                  className="input"
                  placeholder="City"
                />
              </div>
              <div>
                <label className="label">State</label>
                <input
                  type="text"
                  value={address.state}
                  onChange={(e) => setAddress({ ...address, state: e.target.value })}
                  className="input"
                  placeholder="State"
                />
              </div>
              <div>
                <label className="label">ZIP Code</label>
                <input
                  type="text"
                  value={address.zipCode}
                  onChange={(e) => setAddress({ ...address, zipCode: e.target.value })}
                  className="input"
                  placeholder="PIN code"
                />
              </div>
              <div>
                <label className="label">Phone</label>
                <input
                  type="tel"
                  value={address.phone}
                  onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                  className="input"
                  placeholder="Phone number"
                />
              </div>
            </div>
          </div>

          {/* Payment */}
          <div className="card p-6">
            <h2 className="flex items-center gap-2 font-semibold text-gray-900 dark:text-gray-100 mb-4">
              <FiCreditCard className="text-primary-600" /> Payment Method
            </h2>
            <div className="space-y-3">
              <label className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                paymentMethod === 'cod' ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-200 dark:border-dark-700'
              }`}>
                <input
                  type="radio"
                  name="payment"
                  value="cod"
                  checked={paymentMethod === 'cod'}
                  onChange={() => setPaymentMethod('cod')}
                  className="accent-primary-600"
                />
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">Cash on Delivery</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Pay when you receive</p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right - Order Summary */}
        <div>
          <div className="card p-6 sticky top-24">
            <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Order Summary</h2>
            <div className="space-y-3 max-h-60 overflow-y-auto mb-4">
              {cart.items.map((item) => (
                <div key={item._id} className="flex items-center gap-3">
                  <img src={item.product.images?.[0]?.url} alt={item.product.name} className="w-14 h-14 object-cover rounded-lg" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-1">{item.product.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Qty: {item.quantity}</p>
                  </div>
                  <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>
            <div className="space-y-2 text-sm border-t border-gray-200 dark:border-dark-700 pt-4">
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Subtotal</span>
                <span className="font-medium">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Shipping</span>
                <span className="font-medium">{shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Tax (5%)</span>
                <span className="font-medium">₹{tax.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between border-t border-gray-200 dark:border-dark-700 pt-3">
                <span className="font-bold text-gray-900 dark:text-gray-100">Total</span>
                <span className="font-bold text-xl text-gray-900 dark:text-gray-100">₹{total.toLocaleString('en-IN')}</span>
              </div>
            </div>
            <button
              onClick={handlePlaceOrder}
              disabled={loading}
              className="btn-primary w-full mt-6 py-3"
            >
              {loading ? 'Placing Order...' : 'Place Order'}
            </button>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 text-center">
              <FiCheckCircle className="inline mr-1" />
              Secure & encrypted payment
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;