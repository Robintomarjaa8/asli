import { Link, useNavigate } from 'react-router-dom';
import { FiTrash2, FiPlus, FiMinus, FiShoppingBag, FiArrowRight } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { getImageUrl } from '../services/api';

const Cart = () => {
  const { isAuthenticated } = useAuth();
  const { cart, updateCartItem, removeFromCart, loading } = useCart();
  const navigate = useNavigate();

  if (!isAuthenticated) {
    return (
      <div className="container-custom py-16 text-center">
        <div className="text-6xl mb-4">🛒</div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Your cart is empty</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">Please login to view your cart</p>
        <Link to="/login" className="btn-primary">Login</Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container-custom py-16">
        <div className="skeleton h-8 w-48 mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="card p-4">
                <div className="skeleton h-24 w-full rounded-lg" />
              </div>
            ))}
          </div>
          <div className="skeleton h-64 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container-custom py-16 text-center animate-fade-in">
        <div className="text-6xl mb-4">🛒</div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Your cart is empty</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">Looks like you haven't added anything yet</p>
        <Link to="/shop" className="btn-primary">Start Shopping</Link>
      </div>
    );
  }

  const validCartItems = cart.items.filter((item) => item.product);
  const subtotal = validCartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal >= 999 ? 0 : 49;
  const total = subtotal + shipping;

  return (
    <div className="container-custom py-8 animate-fade-in">
      <h1 className="section-title mb-6">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cart items */}
        <div className="lg:col-span-2 space-y-4">
          {validCartItems.map((item) => (
            <div key={item._id} className="card p-4 flex gap-4">
              <Link to={`/product/${item.product._id}`} className="shrink-0">
                <img
                  src={getImageUrl(item.product.images?.[0]?.url)}
                  alt={item.product.name}
                  className="w-24 h-24 object-cover rounded-lg"
                />
              </Link>
              <div className="flex-1">
                <div className="flex justify-between start">
                  <Link to={`/product/${item.product._id}`} className="font-medium text-gray-900 dark:text-gray-100 hover:text-primary-600 line-clamp-2">
                    {item.product.name}
                  </Link>
                  <button
                    onClick={() => removeFromCart(item._id)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <FiTrash2 size={18} />
                  </button>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                  {item.product.brand}
                  {item.size && ` • Size: ${item.size}`}
                  {item.color && ` • Color: ${item.color}`}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateCartItem(item._id, Math.max(1, item.quantity - 1))}
                      className="p-1.5 rounded-lg border border-gray-300 dark:border-dark-600 hover:bg-gray-100 dark:hover:bg-dark-800"
                    >
                      <FiMinus size={14} />
                    </button>
                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                    <button
                      onClick={() => updateCartItem(item._id, item.quantity + 1)}
                      className="p-1.5 rounded-lg border border-gray-300 dark:border-dark-600 hover:bg-gray-100 dark:hover:bg-dark-800"
                    >
                      <FiPlus size={14} />
                    </button>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900 dark:text-gray-100">
                      ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                    </p>
                    {item.mrp > item.price && (
                      <p className="text-xs text-gray-400 line-through">
                        ₹{(item.mrp * item.quantity).toLocaleString('en-IN')}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div>
          <div className="card p-6 sticky top-24">
            <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Order Summary</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Subtotal</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Shipping</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {shipping === 0 ? 'FREE' : `₹${shipping}`}
                </span>
              </div>
              <div className="border-t border-gray-200 dark:border-dark-700 pt-3 flex justify-between">
                <span className="font-semibold text-gray-900 dark:text-gray-100">Total</span>
                <span className="font-bold text-lg text-gray-900 dark:text-gray-100">₹{total.toLocaleString('en-IN')}</span>
              </div>
            </div>
            <button onClick={() => navigate('/checkout')} className="btn-primary w-full mt-6 py-3">
              Proceed to Checkout <FiArrowRight className="ml-2" />
            </button>
            <Link to="/shop" className="btn-outline w-full mt-3">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;