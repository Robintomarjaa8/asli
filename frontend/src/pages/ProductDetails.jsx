import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiShoppingCart, FiHeart, FiStar, FiCheck, FiTruck, FiShield, FiRefreshCw } from 'react-icons/fi';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/ProductCard';
import toast from 'react-hot-toast';

const ProductDetails = () => {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const { addToCart, addToWishlist, removeFromWishlist, isInWishlist } = useCart();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', comment: '' });

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/products/${id}`);
        setProduct(data.data);
        setReviews(data.reviews || []);
        setRelatedProducts(data.relatedProducts || []);
      } catch (error) {
        toast.error(error.response?.data?.error || 'Product not found');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="container-custom py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="skeleton aspect-square rounded-2xl" />
          <div className="space-y-4">
            <div className="skeleton h-8 w-3/4" />
            <div className="skeleton h-4 w-1/2" />
            <div className="skeleton h-12 w-1/3" />
            <div className="skeleton h-24 w-full" />
            <div className="skeleton h-12 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container-custom py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Product not found</h2>
        <Link to="/shop" className="btn-primary">Back to Shop</Link>
      </div>
    );
  }

  const inWishlist = isInWishlist(product._id);
  const discount = product.discount || (product.mrp > product.price ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to add to cart');
      return;
    }
    await addToCart(product._id, quantity, selectedSize, selectedColor);
  };

  const handleWishlist = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to add to wishlist');
      return;
    }
    if (inWishlist) {
      await removeFromWishlist(product._id);
    } else {
      await addToWishlist(product._id);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please login to review');
      return;
    }
    try {
      await api.post('/reviews', {
        product: product._id,
        rating: reviewForm.rating,
        title: reviewForm.title,
        comment: reviewForm.comment,
      });
      toast.success('Review submitted!');
      setReviewForm({ rating: 5, title: '', comment: '' });
      // Refresh reviews
      const { data } = await api.get(`/reviews/product/${product._id}`);
      setReviews(data.data);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to submit review');
    }
  };

  return (
    <div className="container-custom py-8 animate-fade-in">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        <Link to="/" className="hover:text-primary-600">Home</Link>
        <span className="mx-2">/</span>
        <Link to="/shop" className="hover:text-primary-600">Shop</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900 dark:text-gray-100">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Images */}
        <div>
          <div className="card overflow-hidden mb-4">
            <img
              src={product.images?.[activeImage]?.url || product.images?.[0]?.url}
              alt={product.name}
              className="w-full aspect-square object-cover"
            />
          </div>
          {product.images?.length > 1 && (
            <div className="flex gap-3 overflow-x-auto scrollbar-hide">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                    activeImage === idx ? 'border-primary-600' : 'border-transparent hover:border-gray-300'
                  }`}
                >
                  <img src={img.url} alt={img.alt} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{product.brand}</p>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 font-display mb-3">
            {product.name}
          </h1>

          {/* Rating */}
          <div className="flex items-center gap-3 mb-4">
            <span className="flex items-center gap-1 bg-green-600 text-white text-sm font-semibold px-2 py-0.5 rounded">
              {product.ratings?.average?.toFixed(1)} <FiStar size={12} fill="currentColor" />
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {product.ratings?.count || 0} ratings
            </span>
            {product.inventory?.status === 'in_stock' ? (
              <span className="badge-success">In Stock</span>
            ) : product.inventory?.status === 'low_stock' ? (
              <span className="badge-warning">Only {product.inventory.stock} left</span>
            ) : (
              <span className="badge-danger">Out of Stock</span>
            )}
          </div>

          {/* Price */}
          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              ₹{product.price.toLocaleString('en-IN')}
            </span>
            {product.mrp > product.price && (
              <>
                <span className="text-lg text-gray-400 line-through">₹{product.mrp.toLocaleString('en-IN')}</span>
                <span className="badge-success">{discount}% OFF</span>
              </>
            )}
          </div>

          {/* Short description */}
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {product.shortDescription || product.description?.slice(0, 200)}...
          </p>

          {/* Color variants */}
          {product.colorVariants?.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Color</h3>
              <div className="flex gap-2">
                {product.colorVariants.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => setSelectedColor(color.name)}
                    className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all ${
                      selectedColor === color.name ? 'border-primary-600 scale-110' : 'border-gray-300 hover:border-gray-400'
                    }`}
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                  >
                    {selectedColor === color.name && <FiCheck className="text-white" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Size variants */}
          {product.sizeVariants?.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Size</h3>
              <div className="flex gap-2">
                {product.sizeVariants.map((size) => (
                  <button
                    key={size.size}
                    onClick={() => setSelectedSize(size.size)}
                    className={`px-4 py-2 rounded-lg border-2 font-medium transition-all ${
                      selectedSize === size.size
                        ? 'border-primary-600 bg-primary-50 text-primary-700 dark:bg-primary-900/20'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {size.size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="flex items-center gap-4 mb-6">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Quantity</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-2 rounded-lg border border-gray-300 dark:border-dark-600 hover:bg-gray-100 dark:hover:bg-dark-800"
              >
                -
              </button>
              <span className="w-10 text-center font-medium">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(product.inventory.stock, quantity + 1))}
                className="p-2 rounded-lg border border-gray-300 dark:border-dark-600 hover:bg-gray-100 dark:hover:bg-dark-800"
              >
                +
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <button
              onClick={handleAddToCart}
              disabled={product.inventory?.status === 'out_of_stock'}
              className="btn-accent flex-1 py-3 disabled:opacity-50"
            >
              <FiShoppingCart className="mr-2" /> Add to Cart
            </button>
            <button
              onClick={handleWishlist}
              className={`btn-outline py-3 ${inWishlist ? 'text-red-500 border-red-500' : ''}`}
            >
              <FiHeart className="mr-2" fill={inWishlist ? 'currentColor' : 'none'} />
              {inWishlist ? 'In Wishlist' : 'Wishlist'}
            </button>
          </div>

          {/* Services */}
          <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-dark-800 rounded-xl">
            <div className="text-center">
              <FiTruck className="mx-auto text-primary-600 mb-2" size={24} />
              <p className="text-xs text-gray-600 dark:text-gray-400">Free Shipping</p>
            </div>
            <div className="text-center">
              <FiShield className="mx-auto text-primary-600 mb-2" size={24} />
              <p className="text-xs text-gray-600 dark:text-gray-400">Secure Payment</p>
            </div>
            <div className="text-center">
              <FiRefreshCw className="mx-auto text-primary-600 mb-2" size={24} />
              <p className="text-xs text-gray-600 dark:text-gray-400">Easy Returns</p>
            </div>
          </div>
        </div>
      </div>

      {/* Description & Specifications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
        <div className="card p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Description</h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{product.description}</p>
          {product.warranty && (
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              <strong>Warranty:</strong> {product.warranty}
            </p>
          )}
          {product.returnPolicy && (
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              <strong>Return Policy:</strong> {product.returnPolicy}
            </p>
          )}
        </div>

        {product.specifications?.length > 0 && (
          <div className="card p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Specifications</h2>
            <div className="divide-y divide-gray-200 dark:divide-dark-700">
              {product.specifications.map((spec, idx) => (
                <div key={idx} className="py-3 flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">{spec.key}</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">{spec.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Reviews */}
      <div className="mt-12">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">Customer Reviews</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="card p-6">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Write a Review</h3>
            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="label">Rating</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                      className={`text-2xl ${star <= reviewForm.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="label">Title</label>
                <input
                  type="text"
                  value={reviewForm.title}
                  onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })}
                  className="input"
                  placeholder="Review title"
                />
              </div>
              <div>
                <label className="label">Comment</label>
                <textarea
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                  className="input min-h-[100px]"
                  placeholder="Share your experience"
                  required
                />
              </div>
              <button type="submit" className="btn-primary w-full">Submit Review</button>
            </form>
          </div>

          <div className="lg:col-span-2 space-y-4">
            {reviews.length === 0 ? (
              <div className="card p-8 text-center">
                <p className="text-gray-500 dark:text-gray-400">No reviews yet. Be the first to review!</p>
              </div>
            ) : (
              reviews.map((review) => (
                <div key={review._id} className="card p-6">
                  <div className="flex items-center gap-3 mb-3">
                    {review.user?.avatar ? (
                      <img src={review.user.avatar} className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold">
                        {review.user?.name?.charAt(0)?.toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">{review.user?.name}</p>
                      <div className="flex items-center gap-1 text-yellow-400">
                        {[...Array(review.rating)].map((_, i) => <FiStar key={i} size={14} fill="currentColor" />)}
                        {review.isVerifiedPurchase && <span className="badge-success ml-2">Verified Purchase</span>}
                      </div>
                    </div>
                  </div>
                  {review.title && <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">{review.title}</h4>}
                  <p className="text-gray-600 dark:text-gray-400">{review.comment}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-12">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">Related Products</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {relatedProducts.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetails;