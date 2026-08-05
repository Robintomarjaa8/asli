import { useState, useEffect } from 'react';
import { FiStar, FiCheck, FiX } from 'react-icons/fi';
import api from '../../services/api';
import toast from 'react-hot-toast';

const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const { data } = await api.get('/admin/reviews');
        setReviews(data.data);
      } catch (error) {
        console.error('Error fetching reviews:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/admin/reviews/${id}/status`, { status });
      toast.success(`Review ${status}`);
      setReviews(reviews.map((r) => (r._id === id ? { ...r, status } : r)));
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update review');
    }
  };

  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Manage Reviews</h2>
      {loading ? (
        <div className="space-y-4">{[...Array(4)].map((_, i) => <div key={i} className="skeleton h-20 rounded-2xl" />)}</div>
      ) : reviews.length === 0 ? (
        <div className="card p-12 text-center">
          <FiStar className="mx-auto text-5xl text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">No reviews found</h3>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review._id} className="card p-5">
              <div className="flex items-center gap-3 mb-3">
                {review.user?.avatar ? (
                  <img src={review.user.avatar} className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold">
                    {review.user?.name?.charAt(0)?.toUpperCase()}
                  </div>
                )}
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-gray-100">{review.user?.name}</p>
                  <div className="flex gap-0.5 text-yellow-400">
                    {[...Array(review.rating)].map((_, i) => <FiStar key={i} size={14} fill="currentColor" />)}
                  </div>
                </div>
                <span className={`badge ${review.status === 'approved' ? 'badge-success' : review.status === 'pending' ? 'badge-warning' : 'badge-danger'}`}>
                  {review.status}
                </span>
              </div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{review.product?.name}</p>
              {review.title && <p className="font-semibold text-gray-900 dark:text-gray-100 mt-1">{review.title}</p>}
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">{review.comment}</p>
              <div className="flex gap-2 mt-3">
                {review.status !== 'approved' && (
                  <button onClick={() => updateStatus(review._id, 'approved')} className="btn-primary text-sm py-1.5 px-3">
                    <FiCheck className="mr-1" size={14} /> Approve
                  </button>
                )}
                {review.status !== 'rejected' && (
                  <button onClick={() => updateStatus(review._id, 'rejected')} className="btn-danger text-sm py-1.5 px-3">
                    <FiX className="mr-1" size={14} /> Reject
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminReviews;