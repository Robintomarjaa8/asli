import { useState, useEffect } from 'react';
import { FiMapPin, FiPlus, FiTrash2 } from 'react-icons/fi';
import api from '../../services/api';
import toast from 'react-hot-toast';

const Addresses = () => {
  const [addresses, setAddresses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ label: 'Home', street: '', city: '', state: '', country: 'India', zipCode: '', phone: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const { data } = await api.get('/auth/me');
        setAddresses(data.data.savedAddresses || []);
      } catch (error) {
        console.error('Error fetching addresses:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAddresses();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/auth/addresses', formData);
      setAddresses(data.data);
      setShowForm(false);
      setFormData({ label: 'Home', street: '', city: '', state: '', country: 'India', zipCode: '', phone: '' });
      toast.success('Address added successfully');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to add address');
    }
  };

  const handleDelete = async (addressId) => {
    if (!window.confirm('Delete this address?')) return;
    try {
      const { data } = await api.delete(`/auth/addresses/${addressId}`);
      setAddresses(data.data);
      toast.success('Address deleted');
    } catch (error) {
      toast.error('Failed to delete address');
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Saved Addresses</h2>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary text-sm">
          <FiPlus className="mr-1" /> Add Address
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card p-6 mb-6 animate-slide-down">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Label</label>
              <select name="label" value={formData.label} onChange={handleChange} className="input">
                <option>Home</option>
                <option>Work</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label className="label">Phone</label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="input" />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Street</label>
              <input type="text" name="street" value={formData.street} onChange={handleChange} className="input" required />
            </div>
            <div>
              <label className="label">City</label>
              <input type="text" name="city" value={formData.city} onChange={handleChange} className="input" required />
            </div>
            <div>
              <label className="label">State</label>
              <input type="text" name="state" value={formData.state} onChange={handleChange} className="input" required />
            </div>
            <div>
              <label className="label">ZIP Code</label>
              <input type="text" name="zipCode" value={formData.zipCode} onChange={handleChange} className="input" required />
            </div>
            <div>
              <label className="label">Country</label>
              <input type="text" name="country" value={formData.country} onChange={handleChange} className="input" />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button type="submit" className="btn-primary">Save Address</button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-outline">Cancel</button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="space-y-4">{[...Array(2)].map((_, i) => <div key={i} className="skeleton h-32 rounded-2xl" />)}</div>
      ) : addresses.length === 0 ? (
        <div className="card p-12 text-center">
          <FiMapPin className="mx-auto text-5xl text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">No saved addresses</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">Add an address for faster checkout</p>
          <button onClick={() => setShowForm(true)} className="btn-primary">Add Address</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <div key={addr._id} className="card p-6">
              <div className="flex items-start justify-between mb-3">
                <span className="badge-primary">{addr.label}</span>
                <button onClick={() => handleDelete(addr._id)} className="text-gray-400 hover:text-red-500">
                  <FiTrash2 size={18} />
                </button>
              </div>
              <p className="text-gray-900 dark:text-gray-100 font-medium">{addr.street}</p>
              <p className="text-gray-500 dark:text-gray-400 text-sm">{addr.city}, {addr.state} - {addr.zipCode}</p>
              <p className="text-gray-500 dark:text-gray-400 text-sm">{addr.country}</p>
              {addr.phone && <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{addr.phone}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Addresses;