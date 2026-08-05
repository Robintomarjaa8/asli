import { useState, useEffect } from 'react';
import { FiBox } from 'react-icons/fi';
import api from '../../services/api';
import toast from 'react-hot-toast';

const SellerInventory = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const { data } = await api.get('/seller/inventory');
        setProducts(data.data);
      } catch (error) {
        console.error('Error fetching inventory:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchInventory();
  }, []);

  const updateStock = async (id, stock) => {
    try {
      await api.put(`/products/${id}/stock`, { stock });
      toast.success('Stock updated');
      const { data } = await api.get('/seller/inventory');
      setProducts(data.data);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update stock');
    }
  };

  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Inventory Management</h2>
      {loading ? (
        <div className="space-y-4">{[...Array(4)].map((_, i) => <div key={i} className="skeleton h-20 rounded-2xl" />)}</div>
      ) : products.length === 0 ? (
        <div className="card p-12 text-center">
          <FiBox className="mx-auto text-5xl text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">No products in inventory</h3>
          <p className="text-gray-500 dark:text-gray-400">Add products to manage inventory</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-dark-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">SKU</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Sold</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-dark-700">
                {products.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-50 dark:hover:bg-dark-800">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img src={product.images?.[0]?.url} alt={product.name} className="w-10 h-10 object-cover rounded-lg" />
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-1">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{product.sku}</td>
                    <td className="px-6 py-4">
                      <input
                        type="number"
                        value={product.inventory.stock}
                        onChange={(e) => updateStock(product._id, parseInt(e.target.value))}
                        className="input w-20 text-sm py-1"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <span className={`badge ${product.inventory.status === 'in_stock' ? 'badge-success' : product.inventory.status === 'low_stock' ? 'badge-warning' : 'badge-danger'}`}>
                        {product.inventory.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">{product.quantitySold}</td>
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

export default SellerInventory;