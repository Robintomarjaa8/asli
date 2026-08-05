import { useState } from 'react';
import { FiUser, FiMail, FiPhone, FiMapPin } from 'react-icons/fi';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || { street: '', city: '', state: '', country: 'India', zipCode: '' },
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddressChange = (e) => {
    setFormData({ ...formData, address: { ...formData.address, [e.target.name]: e.target.value } });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.put('/auth/updatedetails', formData);
      updateUser({ ...user, ...data.data });
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="animate-fade-in max-w-2xl">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">My Profile</h2>

      <div className="card p-6 mb-6">
        <div className="flex items-center gap-4 mb-6">
          {user?.avatar ? (
            <img src={user.avatar} alt={user.name} className="w-20 h-20 rounded-full object-cover" />
          ) : (
            <div className="w-20 h-20 rounded-full bg-primary-600 text-white flex items-center justify-center text-2xl font-bold">
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>
          )}
          <div>
            <p className="text-xl font-semibold text-gray-900 dark:text-gray-100">{user?.name}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
            <span className="badge-primary mt-1 capitalize">{user?.role}</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card p-6 space-y-5">
        <div>
          <label className="label">Full Name</label>
          <div className="relative">
            <FiUser className="absolute left-3 top-3.5 text-gray-400" />
            <input type="text" name="name" value={formData.name} onChange={handleChange} className="input pl-10" required />
          </div>
        </div>
        <div>
          <label className="label">Email</label>
          <div className="relative">
            <FiMail className="absolute left-3 top-3.5 text-gray-400" />
            <input type="email" value={user?.email} className="input pl-10 opacity-60" disabled />
          </div>
        </div>
        <div>
          <label className="label">Phone</label>
          <div className="relative">
            <FiPhone className="absolute left-3 top-3.5 text-gray-400" />
            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="input pl-10" />
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-dark-700 pt-5">
          <h3 className="flex items-center gap-2 font-semibold text-gray-900 dark:text-gray-100 mb-4">
            <FiMapPin className="text-primary-600" /> Address
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="label">Street</label>
              <input type="text" name="street" value={formData.address.street} onChange={handleAddressChange} className="input" />
            </div>
            <div>
              <label className="label">City</label>
              <input type="text" name="city" value={formData.address.city} onChange={handleAddressChange} className="input" />
            </div>
            <div>
              <label className="label">State</label>
              <input type="text" name="state" value={formData.address.state} onChange={handleAddressChange} className="input" />
            </div>
            <div>
              <label className="label">ZIP Code</label>
              <input type="text" name="zipCode" value={formData.address.zipCode} onChange={handleAddressChange} className="input" />
            </div>
            <div>
              <label className="label">Country</label>
              <input type="text" name="country" value={formData.address.country} onChange={handleAddressChange} className="input" />
            </div>
          </div>
        </div>

        <button type="submit" disabled={saving} className="btn-primary w-full py-3">
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
};

export default Profile;