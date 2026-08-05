import { useState, useEffect } from 'react';
import { FiFolder, FiPlus, FiX } from 'react-icons/fi';
import api from '../../services/api';
import toast from 'react-hot-toast';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '', icon: '' });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await api.get('/admin/categories');
        setCategories(data.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/categories', formData);
      toast.success('Category created');
      setShowForm(false);
      setFormData({ name: '', description: '', icon: '' });
      const { data } = await api.get('/admin/categories');
      setCategories(data.data);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create category');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    try {
      await api.delete(`/categories/${id}`);
      toast.success('Category deleted');
      setCategories(categories.filter((c) => c._id !== id));
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to delete category');
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Manage Categories</h2>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary text-sm">
          <FiPlus className="mr-1" /> Add Category
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card p-6 mb-6 animate-slide-down">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="label">Name *</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} className="input" required />
            </div>
            <div>
              <label className="label">Icon</label>
              <input type="text" name="icon" value={formData.icon} onChange={handleChange} className="input" placeholder="📱" />
            </div>
            <div className="sm:col-span-3">
              <label className="label">Description</label>
              <input type="text" name="description" value={formData.description} onChange={handleChange} className="input" />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button type="submit" className="btn-primary">Create</button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-outline">Cancel</button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="space-y-4">{[...Array(4)].map((_, i) => <div key={i} className="skeleton h-20 rounded-2xl" />)}</div>
      ) : categories.length === 0 ? (
        <div className="card p-12 text-center">
          <FiFolder className="mx-auto text-5xl text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">No categories found</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <div key={cat._id} className="card p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="text-3xl">{cat.icon || '📁'}</div>
                <button onClick={() => handleDelete(cat._id)} className="text-gray-400 hover:text-red-500">
                  <FiX size={18} />
                </button>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">{cat.name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{cat.description}</p>
              <span className="badge-primary mt-2">{cat.productCount || 0} products</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminCategories;