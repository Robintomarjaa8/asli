import { useState, useEffect } from 'react';
import { FiPackage, FiCheck, FiX, FiStar } from 'react-icons/fi';
import api, { getImageUrl } from '../../services/api';
import toast from 'react-hot-toast';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await api.get(`/admin/products${filter ? `?status=${filter}` : ''}`);
        setProducts(data.data);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [filter]);

  const approveProduct = async (id, status) => {
    try {
      await api.put(`/admin/products/${id}/approve`, { status });
      toast.success(`Product ${status}`);
      const { data } = await api.get(`/admin/products${filter ? `?status=${filter}` : ''}`);
      setProducts(data.data);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update product');
    }
  };

  const toggleFeatured = async (id) => {
    try {
      await api.put(`/admin/products/${id}/featured`);
      toast.success('Featured status toggled');
      const { data } = await api.get(`/admin/products${filter ? `?status=${filter}` : ''}`);
      setProducts(data.data);
    } catch (error) {
      toast.error('Failed to toggle featured');
    }
  };

  const getStatusBadge = (status) => {
    const map = { pending: 'badge-warning', approved: 'badge-success', rejected: 'badge-danger', suspended: 'badge-danger' };
    return map[status] || 'badge-info';
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Manage Products</h2>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="input w-auto text-sm">
          <option value="">All Products</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      {loading ? (
        <div className="space-y-4">{[...Array(4)].map((_, i) => <div key={i} className="skeleton h-20 rounded-2xl" />)}</div>
      ) : products.length === 0 ? (
        <div className="card p-12 text-center">
          <FiPackage className="mx-auto text-5xl text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">No products found</h3>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-dark-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Seller</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-dark-700">
                {products.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-50 dark:hover:bg-dark-800">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img src={getImageUrl(product.images?.[0]?.url)} alt={product.name} className="w-10 h-10 object-cover rounded-lg" />
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-1">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{product.seller?.name}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">₹{product.price.toLocaleString('en-IN')}</td>
                    <td className="px-6 py-4">
                      <span className={`badge ${getStatusBadge(product.status)}`}>{product.status}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => toggleFeatured(product._id)} className={`p-2 rounded-lg ${product.isFeatured ? 'text-yellow-600 hover:bg-yellow-50' : 'text-gray-400 hover:bg-gray-50'}`} title="Toggle featured">
                          <FiStar size={16} fill={product.isFeatured ? 'currentColor' : 'none'} />
                        </button>
                        {product.status !== 'approved' && (
                          <button onClick={() => approveProduct(product._id, 'approved')} className="p-2 rounded-lg text-green-600 hover:bg-green-50" title="Approve">
                            <FiCheck size={16} />
                          </button>
                        )}
                        {product.status !== 'suspended' && (
                          <button onClick={() => approveProduct(product._id, 'suspended')} className="p-2 rounded-lg text-red-600 hover:bg-red-50" title="Suspend">
                            <FiX size={16} />
                          </button>
                        )}
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

export default AdminProducts;