import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiX, FiUpload } from 'react-icons/fi';
import api from '../../services/api';
import toast from 'react-hot-toast';

const AddProduct = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [saving, setSaving] = useState(false);
  const [images, setImages] = useState([]);
  const [sizeVariants, setSizeVariants] = useState([]);
  const [specifications, setSpecifications] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    shortDescription: '',
    price: '',
    mrp: '',
    brand: '',
    sku: '',
    barcode: '',
    category: '',
    tags: '',
    stock: '',
    warranty: '',
    returnPolicy: '',
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await api.get('/categories');
        setCategories(data.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const previews = files.map((file) => URL.createObjectURL(file));
    setImages([...images, ...previews]);
  };

  const removeImage = (idx) => {
    setImages(images.filter((_, i) => i !== idx));
  };

  const addSize = () => setSizeVariants([...sizeVariants, { size: '', price: '', stock: '' }]);
  const updateSize = (idx, field, value) => {
    const updated = sizeVariants.map((s, i) => (i === idx ? { ...s, [field]: value } : s));
    setSizeVariants(updated);
  };
  const removeSize = (idx) => setSizeVariants(sizeVariants.filter((_, i) => i !== idx));

  const addSpec = () => setSpecifications([...specifications, { key: '', value: '' }]);
  const updateSpec = (idx, field, value) => {
    const updated = specifications.map((s, i) => (i === idx ? { ...s, [field]: value } : s));
    setSpecifications(updated);
  };
  const removeSpec = (idx) => setSpecifications(specifications.filter((_, i) => i !== idx));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formDataObj = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value) formDataObj.append(key, value);
      });
      formDataObj.append('tags', JSON.stringify(formData.tags.split(',').map((t) => t.trim()).filter(Boolean)));
      formDataObj.append('specifications', JSON.stringify(specifications.filter((s) => s.key && s.value)));
      formDataObj.append('sizeVariants', JSON.stringify(sizeVariants.filter((s) => s.size)));
      if (images.length > 0) {
        // Note: Preview URLs can't be uploaded directly. In production use actual File objects.
        // For demo, we'll use placeholder images
        images.forEach((img, i) => {
          formDataObj.append('images', new File([img], `product-${i}.jpg`, { type: 'image/jpeg' }));
        });
      }

      await api.post('/products', formDataObj);
      toast.success('Product added successfully! It will be reviewed by admin.');
      navigate('/seller/products');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to add product');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Add New Product</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic info */}
        <div className="card p-6">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Basic Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="label">Product Name *</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} className="input" required />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Description *</label>
              <textarea name="description" value={formData.description} onChange={handleChange} className="input min-h-[100px]" required />
            </div>
            <div>
              <label className="label">Price (₹) *</label>
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
              <label className="label">Category *</label>
              <select name="category" value={formData.category} onChange={handleChange} className="input" required>
                <option value="">Select category</option>
                {categories.map((cat) => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">SKU *</label>
              <input type="text" name="sku" value={formData.sku} onChange={handleChange} className="input" required />
            </div>
            <div>
              <label className="label">Barcode</label>
              <input type="text" name="barcode" value={formData.barcode} onChange={handleChange} className="input" />
            </div>
            <div>
              <label className="label">Tags (comma separated)</label>
              <input type="text" name="tags" value={formData.tags} onChange={handleChange} className="input" placeholder="electronics, wireless, audio" />
            </div>
            <div>
              <label className="label">Stock *</label>
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

        {/* Images */}
        <div className="card p-6">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Product Images</h3>
          <div className="flex flex-wrap gap-4">
            {images.map((img, idx) => (
              <div key={idx} className="relative">
                <img src={img} alt={`Product ${idx + 1}`} className="w-24 h-24 object-cover rounded-lg" />
                <button type="button" onClick={() => removeImage(idx)} className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center">
                  <FiX size={14} />
                </button>
              </div>
            ))}
            <label className="w-24 h-24 border-2 border-dashed border-gray-300 dark:border-dark-600 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary-500 transition-colors">
              <FiUpload className="text-gray-400 mb-1" />
              <span className="text-xs text-gray-500">Upload</span>
              <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>
          </div>
          <p className="text-xs text-gray-500 mt-2">Upload up to 5 images. First image will be the main image.</p>
        </div>

        {/* Size variants */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Size Variants</h3>
            <button type="button" onClick={addSize} className="btn-outline text-sm"><FiPlus className="mr-1" /> Add Size</button>
          </div>
          {sizeVariants.length === 0 ? (
            <p className="text-sm text-gray-500">No size variants. Add sizes if applicable.</p>
          ) : (
            <div className="space-y-3">
              {sizeVariants.map((size, idx) => (
                <div key={idx} className="flex gap-3 items-end">
                  <div className="flex-1">
                    <label className="label">Size</label>
                    <input type="text" value={size.size} onChange={(e) => updateSize(idx, 'size', e.target.value)} className="input" />
                  </div>
                  <div className="flex-1">
                    <label className="label">Price</label>
                    <input type="number" value={size.price} onChange={(e) => updateSize(idx, 'price', e.target.value)} className="input" />
                  </div>
                  <div className="flex-1">
                    <label className="label">Stock</label>
                    <input type="number" value={size.stock} onChange={(e) => updateSize(idx, 'stock', e.target.value)} className="input" />
                  </div>
                  <button type="button" onClick={() => removeSize(idx)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                    <FiX size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Specifications */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Specifications</h3>
            <button type="button" onClick={addSpec} className="btn-outline text-sm"><FiPlus className="mr-1" /> Add Spec</button>
          </div>
          {specifications.length === 0 ? (
            <p className="text-sm text-gray-500">No specifications added.</p>
          ) : (
            <div className="space-y-3">
              {specifications.map((spec, idx) => (
                <div key={idx} className="flex gap-3 items-end">
                  <div className="flex-1">
                    <label className="label">Key</label>
                    <input type="text" value={spec.key} onChange={(e) => updateSpec(idx, 'key', e.target.value)} className="input" placeholder="e.g. Material" />
                  </div>
                  <div className="flex-1">
                    <label className="label">Value</label>
                    <input type="text" value={spec.value} onChange={(e) => updateSpec(idx, 'value', e.target.value)} className="input" placeholder="e.g. Cotton" />
                  </div>
                  <button type="button" onClick={() => removeSpec(idx)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                    <FiX size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="btn-primary flex-1 py-3">
            {saving ? 'Saving...' : 'Add Product'}
          </button>
          <button type="button" onClick={() => navigate('/seller/products')} className="btn-outline px-8">Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;