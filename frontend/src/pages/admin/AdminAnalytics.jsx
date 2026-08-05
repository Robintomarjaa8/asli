import { useState, useEffect } from 'react';
import { FiTrendingUp, FiUsers, FiPackage } from 'react-icons/fi';
import api from '../../services/api';

const AdminAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('month');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const { data } = await api.get(`/admin/analytics?period=${period}`);
        setData(data.data);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [period]);

  if (loading) return <div className="space-y-4">{[...Array(4)].map((_, i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}</div>;

  const totalSales = data?.salesData?.reduce((sum, d) => sum + d.total, 0) || 0;
  const totalUsers = data?.userData?.reduce((sum, d) => sum + d.count, 0) || 0;
  const totalProducts = data?.productData?.reduce((sum, d) => sum + d.count, 0) || 0;

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Analytics</h2>
        <select value={period} onChange={(e) => setPeriod(e.target.value)} className="input w-auto text-sm">
          <option value="week">Last Week</option>
          <option value="month">Last Month</option>
          <option value="year">Last Year</option>
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="card p-5">
          <div className="w-11 h-11 rounded-xl bg-green-100 text-green-600 dark:bg-green-900/30 flex items-center justify-center mb-3"><FiTrendingUp size={22} /></div>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">₹{totalSales.toLocaleString('en-IN')}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Sales</p>
        </div>
        <div className="card p-5">
          <div className="w-11 h-11 rounded-xl bg-primary-100 text-primary-600 dark:bg-primary-900/30 flex items-center justify-center mb-3"><FiUsers size={22} /></div>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{totalUsers}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">New Users</p>
        </div>
        <div className="card p-5">
          <div className="w-11 h-11 rounded-xl bg-purple-100 text-purple-600 dark:bg-purple-900/30 flex items-center justify-center mb-3"><FiPackage size={22} /></div>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{totalProducts}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">New Products</p>
        </div>
      </div>

      {/* Sales chart */}
      <div className="card p-6 mb-6">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Sales Trend</h3>
        {data?.salesData?.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No sales data for this period</p>
        ) : (
          <div className="space-y-2">
            {data?.salesData?.map((item) => (
              <div key={item._id} className="flex items-center gap-3">
                <span className="text-sm text-gray-500 w-24">{item._id}</span>
                <div className="flex-1 bg-gray-100 dark:bg-dark-700 rounded-full h-5 overflow-hidden">
                  <div className="bg-gradient-primary h-full rounded-full" style={{ width: `${Math.min(100, (item.total / Math.max(...data.salesData.map((d) => d.total))) * 100)}%` }} />
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100 w-24 text-right">₹{item.total.toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Category distribution */}
      <div className="card p-6">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Category Distribution</h3>
        {data?.categoryDistribution?.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No products yet</p>
        ) : (
          <div className="space-y-2">
            {data?.categoryDistribution?.map((item) => (
              <div key={item.category} className="flex items-center gap-3">
                <span className="text-sm text-gray-500 w-32">{item.category}</span>
                <div className="flex-1 bg-gray-100 dark:bg-dark-700 rounded-full h-4 overflow-hidden">
                  <div className="bg-accent-500 h-full rounded-full" style={{ width: `${Math.min(100, (item.count / Math.max(...data.categoryDistribution.map((d) => d.count))) * 100)}%` }} />
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100 w-16 text-right">{item.count}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAnalytics;