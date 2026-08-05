import { useState, useEffect } from 'react';
import { FiEye, FiTrendingUp } from 'react-icons/fi';
import api from '../../services/api';

const SellerAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const { data } = await api.get('/seller/analytics');
        setData(data.data);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) return <div className="space-y-4">{[...Array(4)].map((_, i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}</div>;

  const totalSales = data?.salesData?.reduce((sum, d) => sum + d.total, 0) || 0;

  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Product Analytics</h2>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="card p-5">
          <div className="w-11 h-11 rounded-xl bg-primary-100 text-primary-600 dark:bg-primary-900/30 flex items-center justify-center mb-3"><FiTrendingUp size={22} /></div>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">₹{totalSales.toLocaleString('en-IN')}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Sales</p>
        </div>
        <div className="card p-5">
          <div className="w-11 h-11 rounded-xl bg-green-100 text-green-600 dark:bg-green-900/30 flex items-center justify-center mb-3"><FiEye size={22} /></div>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{data?.totalViews || 0}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Views</p>
        </div>
      </div>

      {/* Sales trend */}
      <div className="card p-6 mb-6">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Sales Trend</h3>
        {data?.salesData?.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No sales data yet</p>
        ) : (
          <div className="space-y-2">
            {data?.salesData?.map((item) => (
              <div key={item._id} className="flex items-center gap-3">
                <span className="text-sm text-gray-500 w-24">{item._id}</span>
                <div className="flex-1 bg-gray-100 dark:bg-dark-700 rounded-full h-4 overflow-hidden">
                  <div className="bg-primary-600 h-full rounded-full" style={{ width: `${Math.min(100, (item.total / Math.max(...data.salesData.map((d) => d.total))) * 100)}%` }} />
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100 w-24 text-right">₹{item.total.toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Product performance */}
      <div className="card p-6">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Product Performance</h3>
        {data?.productPerformance?.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No products yet</p>
        ) : (
          <div className="space-y-3">
            {data?.productPerformance?.map((product) => (
              <div key={product._id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-dark-800 rounded-lg">
                <img src={product.images?.[0]?.url} alt={product.name} className="w-12 h-12 object-cover rounded-lg" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-1">{product.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{product.viewCount} views • {product.quantitySold} sold</p>
                </div>
                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">₹{product.price.toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerAnalytics;