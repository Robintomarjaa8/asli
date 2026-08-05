import { useState } from 'react';
import { FiLock } from 'react-icons/fi';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const ChangePassword = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (formData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setSaving(true);
    try {
      await api.put('/auth/updatepassword', {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });
      toast.success('Password changed successfully');
      logout();
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="animate-fade-in max-w-md">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Change Password</h2>
      <form onSubmit={handleSubmit} className="card p-6 space-y-5">
        <div>
          <label className="label">Current Password</label>
          <div className="relative">
            <FiLock className="absolute left-3 top-3.5 text-gray-400" />
            <input type="password" name="currentPassword" value={formData.currentPassword} onChange={handleChange} className="input pl-10" required />
          </div>
        </div>
        <div>
          <label className="label">New Password</label>
          <div className="relative">
            <FiLock className="absolute left-3 top-3.5 text-gray-400" />
            <input type="password" name="newPassword" value={formData.newPassword} onChange={handleChange} className="input pl-10" required />
          </div>
        </div>
        <div>
          <label className="label">Confirm New Password</label>
          <div className="relative">
            <FiLock className="absolute left-3 top-3.5 text-gray-400" />
            <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className="input pl-10" required />
          </div>
        </div>
        <button type="submit" disabled={saving} className="btn-primary w-full py-3">
          {saving ? 'Updating...' : 'Change Password'}
        </button>
      </form>
    </div>
  );
};

export default ChangePassword;