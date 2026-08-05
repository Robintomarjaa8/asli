import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiX, FiUpload } from 'react-icons/fi';
import api from '../../services/api';
import toast from 'react-hot-toast';

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({});
  const [specifications, setSpecifications] = useState([]);
  const [sizeVariants, setSizeVariants] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, prodRes] = await Promise.all([
          api.get('/categories'),
          api.get(`/products/${id}`),
        ]);
        setCategories(catRes.data.data);
        const p = prodRes.data.data;
        setFormData({
          name: p.name,
          description: p.description,
          price: p.price,
          mrp: p.mrp,
          brand: p.brand,
          category: p.category?._id || p.category,
          sku: p.sku,
          stock: p.inventory?.stock,
          warranty: p.warranty || '',
          returnPolicy: p.returnPolicy || '',
        });
        setSpecifications(p.specifications || []);
        setSizeVariants(p.sizeVariants || []);
      } catch (error) {
        toast.error('Failed to load product');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put(`/products/${id}`, {
        ...formData,
        specifications,
        sizeVariants,
      });
      toast.success('Product updated successfully');
      navigate('/seller/products');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update product');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="space-y-4">{[...Array(4)].map((_, i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}</div>;

  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Edit Product</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card p-6">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Basic Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="label">Product Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} className="input" required />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Description</label>
              <textarea name="description" value={formData.description} onChange={handleChange} className="input min-h-[100px]" required />
            </div>
            <div>
              <label className="label">Price (₹)</label>
              <input type="number" name="price" value={formData.price} onChange={handleChange} className="input" required />
            </div>
            <div>
              <label className="label">MRP (₹)</label>
              <input type="number" name="mrp" value={formData.mrp} onChange={handleChange} className="input" />
            </div>
            <div>
              <label className="label">Brand</label>
              <input type="text" name="brand" value={formData.brand} onChange={handleChange} className="input" />
            </div>
            <div>
              <label className="label">Category</label>
              <select name="category" value={formData.category} onChange={handleChange} className="input" required>
                <option value="">Select category</option>
                {categories.map((cat) => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">SKU</label>
              <input type="text" name="sku" value={formData.sku} onChange={handleChange} className="input" required />
            </div>
            <div>
              <label className="label">Stock</label>
              <input type="number" name="stock" value={formData.stock} onChange={handleChange} className="input" required />
            </div>
            <div>
              <label className="label">Warranty</label>
              <input type="text" name="warranty" value={formData.warranty} onChange={handleChange} className="input" />
            </div>
            <div>
              <label className="label">Return Policy</label>
              <input type="text" name="returnPolicy" value={formData.returnPolicy} onChange={handleChange} className="input" />
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="btn-primary flex-1 py-3">
            {saving ? 'Saving...' : 'Update Product'}
          </button>
          <button type="button" onClick={() => navigate('/seller/products')} className="btn-outline px-8">Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default EditProduct;