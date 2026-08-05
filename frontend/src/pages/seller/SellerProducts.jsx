import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiEdit2, FiTrash2, FiPackage } from 'react-icons/fi';
import api from '../../services/api';
import toast from 'react-hot-toast';

const SellerProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await api.get('/products/seller/products');
        setProducts(data.data);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      setProducts(products.filter((p) => p._id !== id));
      toast.success('Product deleted');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to delete product');
    }
  };

  const getStatusBadge = (status) => {
    const map = {
      pending: 'badge-warning',
      approved: 'badge-success',
      rejected: 'badge-danger',
      suspended: 'badge-danger',
    };
    return map[status] || 'badge-info';
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">My Products</h2>
        <Link to="/seller/products/add" className="btn-primary text-sm">
          <FiPlus className="mr-1" /> Add Product
        </Link>
      </div>

      {loading ? (
        <div className="space-y-4">{[...Array(4)].map((_, i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}</div>
      ) : products.length === 0 ? (
        <div className="card p-12 text-center">
          <FiPackage className="mx-auto text-5xl text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">No products yet</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">Start selling by adding your first product</p>
          <Link to="/seller/products/add" className="btn-primary">Add Product</Link>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-dark-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-dark-700">
                {products.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-50 dark:hover:bg-dark-800">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img src={product.images?.[0]?.url} alt={product.name} className="w-12 h-12 object-cover rounded-lg" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100 text-sm line-clamp-1">{product.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">SKU: {product.sku}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">₹{product.price.toLocaleString('en-IN')}</td>
                    <td className="px-6 py-4">
                      <span className={`text-sm ${product.inventory.stock <= 5 ? 'text-red-600' : 'text-gray-900 dark:text-gray-100'}`}>
                        {product.inventory.stock}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`badge ${getStatusBadge(product.status)}`}>{product.status}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2 justify-end">
                        <Link to={`/seller/products/edit/${product._id}`} className="p-2 rounded-lg text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20">
                          <FiEdit2 size={16} />
                        </Link>
                        <button onClick={() => handleDelete(product._id)} className="p-2 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                          <FiTrash2 size={16} />
                        </button>
                      </div>
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

export default SellerProducts;