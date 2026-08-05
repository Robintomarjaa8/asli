import { Link } from 'react-router-dom';
import { FiHeart, FiTrash2, FiShoppingCart } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Wishlist = () => {
  const { isAuthenticated } = useAuth();
  const { wishlist, removeFromWishlist, addToCart } = useCart();

  if (!isAuthenticated) {
    return (
      <div className="container-custom py-16 text-center">
        <div className="text-6xl mb-4">💖</div>
        <h2 className="text-2xl font-bold mb-2">Your wishlist is empty</h2>
        <p className="text-gray-500 mb-6">Please login to view your wishlist</p>
        <Link to="/login" className="btn-primary">Login</Link>
      </div>
    );
  }

  if (!wishlist || wishlist.items.length === 0) {
    return (
      <div className="container-custom py-16 text-center animate-fade-in">
        <div className="text-6xl mb-4">💖</div>
        <h2 className="text-2xl font-bold mb-2">Your wishlist is empty</h2>
        <p className="text-gray-500 mb-6">Save your favorite products for later</p>
        <Link to="/shop" className="btn-primary">Browse Products</Link>
      </div>
    );
  }

  return (
    <div className="container-custom py-8 animate-fade-in">
      <h1 className="section-title mb-6">My Wishlist</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {wishlist.items.map((item) => {
          const product = item.product;
          if (!product) return null;
          return (
            <div key={item._id} className="card p-4 hover:shadow-card-hover transition-shadow">
              <Link to={`/product/${product._id}`} className="block">
                <img src={product.images?.[0]?.url} alt={product.name} className="w-full aspect-square object-cover rounded-lg mb-3" />
                <p className="text-sm text-gray-500 mb-1">{product.brand}</p>
                <h3 className="font-medium text-gray-900 dark:text-gray-100 text-sm line-clamp-2 mb-2">{product.name}</h3>
                <div className="flex items-center gap-2 mb-3">
                  <span className="font-bold text-gray-900 dark:text-gray-100">₹{product.price.toLocaleString('en-IN')}</span>
                  {product.mrp > product.price && (
                    <span className="text-sm text-gray-400 line-through">₹{product.mrp.toLocaleString('en-IN')}</span>
                  )}
                </div>
              </Link>
              <div className="flex gap-2">
                <button
                  onClick={() => addToCart(product._id, 1)}
                  className="btn-primary flex-1 py-2 text-sm"
                >
                  <FiShoppingCart className="mr-1" size={14} /> Add to Cart
                </button>
                <button
                  onClick={() => removeFromWishlist(product._id)}
                  className="btn-danger p-2"
                  title="Remove from wishlist"
                >
                  <FiTrash2 size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Wishlist;