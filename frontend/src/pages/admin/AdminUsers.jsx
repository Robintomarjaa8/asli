import { useState, useEffect } from 'react';
import { FiUsers, FiUserX, FiUserCheck } from 'react-icons/fi';
import api from '../../services/api';
import toast from 'react-hot-toast';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await api.get('/admin/users?role=buyer');
        setUsers(data.data);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const toggleStatus = async (id) => {
    try {
      const { data } = await api.put(`/admin/users/${id}/toggle`);
      setUsers(users.map((u) => (u._id === id ? data.data : u)));
      toast.success('User status updated');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update user');
    }
  };

  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Manage Buyers</h2>
      {loading ? (
        <div className="space-y-4">{[...Array(4)].map((_, i) => <div key={i} className="skeleton h-20 rounded-2xl" />)}</div>
      ) : users.length === 0 ? (
        <div className="card p-12 text-center">
          <FiUsers className="mx-auto text-5xl text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">No buyers found</h3>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-dark-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">User</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Joined</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-dark-700">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-dark-800">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {user.avatar ? (
                          <img src={user.avatar} className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold">
                            {user.name?.charAt(0)?.toUpperCase()}
                          </div>
                        )}
                        <span className="font-medium text-gray-900 dark:text-gray-100 text-sm">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{user.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <span className={`badge ${user.isActive ? 'badge-success' : 'badge-danger'}`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => toggleStatus(user._id)} className={`p-2 rounded-lg ${user.isActive ? 'text-red-600 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}`}>
                        {user.isActive ? <FiUserX size={16} /> : <FiUserCheck size={16} />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;