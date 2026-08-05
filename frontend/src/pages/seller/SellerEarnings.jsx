import { useState, useEffect } from 'react';
import { FiDollarSign, FiTrendingUp, FiShoppingBag } from 'react-icons/fi';
import api from '../../services/api';

const SellerEarnings = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        const { data } = await api.get('/seller/earnings');
        setData(data.data);
      } catch (error) {
        console.error('Error fetching earnings:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchEarnings();
  }, []);

  if (loading) return <div className="space-y-4">{[...Array(4)].map((_, i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}</div>;

  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Earnings</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="card p-5">
          <div className="w-11 h-11 rounded-xl bg-green-100 text-green-600 dark:bg-green-900/30 flex items-center justify-center mb-3"><FiDollarSign size={22} /></div>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">₹{(data?.totalEarnings || 0).toLocaleString('en-IN')}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Earnings</p>
        </div>
        <div className="card p-5">
          <div className="w-11 h-11 rounded-xl bg-primary-100 text-primary-600 dark:bg-primary-900/30 flex items-center justify-center mb-3"><FiTrendingUp size={22} /></div>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">₹{(data?.monthlyEarnings || 0).toLocaleString('en-IN')}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">This Month</p>
        </div>
        <div className="card p-5">
          <div className="w-11 h-11 rounded-xl bg-accent-100 text-accent-600 dark:bg-accent-900/30 flex items-center justify-center mb-3"><FiTrendingUp size={22} /></div>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">₹{(data?.weeklyEarnings || 0).toLocaleString('en-IN')}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">This Week</p>
        </div>
        <div className="card p-5">
          <div className="w-11 h-11 rounded-xl bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 flex items-center justify-center mb-3"><FiShoppingBag size={22} /></div>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{data?.totalItems || 0}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Items Sold</p>
        </div>
      </div>

      {/* Earnings by product */}
      <div className="card p-6">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Earnings by Product</h3>
        {data?.earningsByProduct?.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No earnings yet</p>
        ) : (
          <div className="space-y-3">
            {data?.earningsByProduct?.map((item, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-dark-800 rounded-lg">
                <img src={item.image} alt={item.product} className="w-12 h-12 object-cover rounded-lg" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-1">{item.product}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{item.count} sold</p>
                </div>
                <span className="text-sm font-semibold text-green-600">₹{item.total.toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerEarnings;