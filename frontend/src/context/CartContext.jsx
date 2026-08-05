import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState(null);
  const [wishlist, setWishlist] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch cart and wishlist when logged in
  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
      fetchWishlist();
    } else {
      setCart(null);
      setWishlist(null);
    }
  }, [isAuthenticated]);

  const fetchCart = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/cart');
      setCart(data.data);
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWishlist = async () => {
    try {
      const { data } = await api.get('/wishlist');
      setWishlist(data.data);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    }
  };

  const addToCart = async (productId, quantity = 1, size = '', color = '') => {
    try {
      const { data } = await api.post('/cart', { productId, quantity, size, color });
      setCart(data.data);
      toast.success('Added to cart');
      return true;
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to add to cart');
      return false;
    }
  };

  const updateCartItem = async (itemId, quantity) => {
    try {
      const { data } = await api.put(`/cart/${itemId}`, { quantity });
      setCart(data.data);
      return true;
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update cart');
      return false;
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      const { data } = await api.delete(`/cart/${itemId}`);
      setCart(data.data);
      toast.success('Removed from cart');
      return true;
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to remove from cart');
      return false;
    }
  };

  const clearCart = async () => {
    try {
      const { data } = await api.delete('/cart');
      setCart(data.data);
      return true;
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to clear cart');
      return false;
    }
  };

  const addToWishlist = async (productId) => {
    try {
      const { data } = await api.post('/wishlist', { productId });
      setWishlist(data.data);
      toast.success('Added to wishlist');
      return true;
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to add to wishlist');
      return false;
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      const { data } = await api.delete(`/wishlist/${productId}`);
      setWishlist(data.data);
      toast.success('Removed from wishlist');
      return true;
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to remove from wishlist');
      return false;
    }
  };

  const isInWishlist = (productId) => {
    return wishlist?.items?.some((item) => item.product?._id === productId || item.product === productId) || false;
  };

  const cartCount = cart?.totalItems || 0;
  const cartTotal = cart?.totalPrice || 0;

  const value = {
    cart,
    wishlist,
    loading,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    fetchCart,
    fetchWishlist,
    cartCount,
    cartTotal,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export default CartContext;