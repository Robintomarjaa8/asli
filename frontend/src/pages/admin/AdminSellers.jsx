import { useState, useEffect } from 'react';
import { FiShoppingBag, FiCheck, FiX } from 'react-icons/fi';
import api from '../../services/api';
import toast from 'react-hot-toast';

const AdminSellers = () => {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    const fetchSellers = async () => {
      try {
        const { data } = await api.get(`/admin/sellers${filter ? `?status=${filter}` : ''}`);
        setSellers(data.data);
      } catch (error) {
        console.error('Error fetching sellers:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSellers();
  }, [filter]);

  const approveSeller = async (id, status) => {
    try {
      await api.put(`/admin/sellers/${id}/approve`, { status });
      toast.success(`Seller ${status}`);
      const { data } = await api.get(`/admin/sellers${filter ? `?status=${filter}` : ''}`);
      setSellers(data.data);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update seller');
    }
  };

  const getStatusBadge = (status) => {
    const map = { pending: 'badge-warning', approved: 'badge-success', rejected: 'badge-danger' };
    return map[status] || 'badge-info';
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Manage Sellers</h2>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="input w-auto text-sm">
          <option value="">All Sellers</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {loading ? (
        <div className="space-y-4">{[...Array(4)].map((_, i) => <div key={i} className="skeleton h-20 rounded-2xl" />)}</div>
      ) : sellers.length === 0 ? (
        <div className="card p-12 text-center">
          <FiShoppingBag className="mx-auto text-5xl text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">No sellers found</h3>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-dark-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Seller</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Store</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Products</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-dark-700">
                {sellers.map((seller) => (
                  <tr key={seller._id} className="hover:bg-gray-50 dark:hover:bg-dark-800">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {seller.avatar ? (
                          <img src={seller.avatar} className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold">
                            {seller.name?.charAt(0)?.toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100 text-sm">{seller.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{seller.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{seller.sellerProfile?.storeName}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{seller.sellerProfile?.gstNumber}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">{seller.productCount || 0}</td>
                    <td className="px-6 py-4">
                      <span className={`badge ${getStatusBadge(seller.sellerProfile?.approvalStatus)}`}>
                        {seller.sellerProfile?.approvalStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2 justify-end">
                        {seller.sellerProfile?.approvalStatus !== 'approved' && (
                          <button onClick={() => approveSeller(seller._id, 'approved')} className="p-2 rounded-lg text-green-600 hover:bg-green-50" title="Approve">
                            <FiCheck size={16} />
                          </button>
                        )}
                        {seller.sellerProfile?.approvalStatus !== 'rejected' && (
                          <button onClick={() => approveSeller(seller._id, 'rejected')} className="p-2 rounded-lg text-red-600 hover:bg-red-50" title="Reject">
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

export default AdminSellers;