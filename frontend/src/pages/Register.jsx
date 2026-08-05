import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiUser, FiEye, FiEyeOff, FiBriefcase } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState('buyer');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    storeName: '',
    storeDescription: '',
    gstNumber: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        role,
        sellerProfile: role === 'seller' ? {
          storeName: formData.storeName,
          storeDescription: formData.storeDescription,
          gstNumber: formData.gstNumber,
        } : undefined,
      });
      if (data.user.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (data.user.role === 'seller') {
        navigate('/seller/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      // Error handled in context
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-lg">
        <div className="card p-8 animate-slide-up">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold font-display text-gray-900 dark:text-gray-100 mb-2">
              Create Account
            </h1>
            <p className="text-gray-500 dark:text-gray-400">Join ASLI today</p>
          </div>

          {/* Role selection */}
          <div className="grid grid-cols-2 gap-3 mb-8">
            <button
              type="button"
              onClick={() => setRole('buyer')}
              className={`p-4 rounded-xl border-2 transition-all ${
                role === 'buyer'
                  ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-gray-200 dark:border-dark-700 hover:border-gray-300'
              }`}
            >
              <div className="text-2xl mb-2">🛒</div>
              <p className="font-semibold text-sm text-gray-900 dark:text-gray-100">Buyer</p>
              <p className="text-xs text-gray-500">Shop products</p>
            </button>
            <button
              type="button"
              onClick={() => setRole('seller')}
              className={`p-4 rounded-xl border-2 transition-all ${
                role === 'seller'
                  ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-gray-200 dark:border-dark-700 hover:border-gray-300'
              }`}
            >
              <div className="text-2xl mb-2">🏪</div>
              <p className="font-semibold text-sm text-gray-900 dark:text-gray-100">Seller</p>
              <p className="text-xs text-gray-500">Sell products</p>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">Full Name</label>
              <div className="relative">
                <FiUser className="absolute left-3 top-3.5 text-gray-400" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your name"
                  className="input pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <label className="label">Email</label>
              <div className="relative">
                <FiMail className="absolute left-3 top-3.5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="input pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <label className="label">Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+91 98765 43210"
                className="input"
              />
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <FiLock className="absolute left-3 top-3.5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Min 6 characters"
                  className="input pl-10 pr-10"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            {role === 'seller' && (
              <div className="space-y-5 p-4 bg-gray-50 dark:bg-dark-800 rounded-lg animate-slide-down">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  <FiBriefcase className="text-primary-600" /> Store Details
                </div>
                <div>
                  <label className="label">Store Name</label>
                  <input
                    type="text"
                    name="storeName"
                    value={formData.storeName}
                    onChange={handleChange}
                    placeholder="Your store name"
                    className="input"
                    required={role === 'seller'}
                  />
                </div>
                <div>
                  <label className="label">Store Description</label>
                  <textarea
                    name="storeDescription"
                    value={formData.storeDescription}
                    onChange={handleChange}
                    placeholder="Describe your store"
                    className="input min-h-[80px]"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="label">GST Number</label>
                  <input
                    type="text"
                    name="gstNumber"
                    value={formData.gstNumber}
                    onChange={handleChange}
                    placeholder="GSTIN"
                    className="input"
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Your seller account will be reviewed by admin before approval.
                </p>
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;