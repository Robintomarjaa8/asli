import { Link } from 'react-router-dom';
import { FiHeart, FiShoppingCart, FiStar } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';

const ProductCard = ({ product }) => {
  const { isAuthenticated } = useAuth();
  const { addToCart, addToWishlist, removeFromWishlist, isInWishlist } = useCart();
  const navigate = useNavigate();

  if (!product) return null;

  const image = product.images?.[0]?.url || '';
  const price = product.price;
  const mrp = product.mrp || price;
  const discount = product.discount || (mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0);
  const rating = product.ratings?.average || 0;
  const ratingCount = product.ratings?.count || 0;
  const inWishlist = isInWishlist(product._id);

  const handleWishlist = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (inWishlist) {
      await removeFromWishlist(product._id);
    } else {
      await addToWishlist(product._id);
    }
  };

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    await addToCart(product._id, 1);
  };

  return (
    <Link
      to={`/product/${product._id}`}
      className="group card hover:shadow-card-hover transition-all duration-300 transform hover:-translate-y-1"
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-dark-900">
        {image ? (
          <img
            src={image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            No image
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {discount > 0 && (
            <span className="badge-danger">{discount}% OFF</span>
          )}
          {product.isFeatured && (
            <span className="badge-primary">Featured</span>
          )}
        </div>

        {/* Wishlist button */}
        <button
          onClick={handleWishlist}
          className={`absolute top-3 right-3 p-2 rounded-full bg-white/90 dark:bg-dark-800/90 backdrop-blur hover:scale-110 transition-all ${
            inWishlist ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
          }`}
        >
          <FiHeart size={18} fill={inWishlist ? 'currentColor' : 'none'} />
        </button>

        {/* Stock status */}
        {product.inventory?.status === 'out_of_stock' && (
          <div className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-center py-1.5 text-sm font-medium">
            Out of Stock
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{product.brand}</p>
        <h3 className="font-medium text-gray-900 dark:text-gray-100 text-sm line-clamp-2 mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
          {product.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-2">
          <span className="flex items-center gap-0.5 bg-green-600 text-white text-xs font-semibold px-1.5 py-0.5 rounded">
            {rating.toFixed(1)} <FiStar size={10} fill="currentColor" />
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">({ratingCount})</span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
            ₹{price.toLocaleString('en-IN')}
          </span>
          {mrp > price && (
            <span className="text-sm text-gray-400 line-through">₹{mrp.toLocaleString('en-IN')}</span>
          )}
        </div>

        {/* Add to cart */}
        <button
          onClick={handleAddToCart}
          disabled={product.inventory?.status === 'out_of_stock'}
          className="w-full btn-primary py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FiShoppingCart size={16} className="mr-2" />
          {product.inventory?.status === 'out_of_stock' ? 'Out of Stock' : 'Add to Cart'}
        </button>
      </div>
    </Link>
  );
};

export default ProductCard;