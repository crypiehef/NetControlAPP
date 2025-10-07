import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  getAllUsers, 
  createUser, 
  deleteUser, 
  resetUserPassword,
  updateUserRole 
} from '../services/api';
import { toast } from 'react-toastify';

const Admin = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [newUser, setNewUser] = useState({
    username: '',
    callsign: '',
    email: '',
    password: '',
    role: 'operator'
  });

  useEffect(() => {
    // Check if user is admin
    if (user && user.role !== 'admin') {
      toast.error('Access denied. Admin only.');
      navigate('/');
      return;
    }
    loadUsers();
  }, [user, navigate]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createUser(newUser);
      toast.success('User created successfully!');
      setNewUser({
        username: '',
        callsign: '',
        email: '',
        password: '',
        role: 'operator'
      });
      setShowAddForm(false);
      loadUsers();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId, username) => {
    if (!window.confirm(`Are you sure you want to delete user "${username}"? This action cannot be undone.`)) {
      return;
    }
    
    setLoading(true);
    try {
      await deleteUser(userId);
      toast.success('User deleted successfully!');
      loadUsers();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to delete user');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await resetUserPassword(selectedUser._id, newPassword);
      toast.success(`Password reset for ${selectedUser.username}!`);
      setShowResetModal(false);
      setSelectedUser(null);
      setNewPassword('');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleRole = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'operator' : 'admin';
    
    if (!window.confirm(`Change role to ${newRole.toUpperCase()}?`)) {
      return;
    }

    setLoading(true);
    try {
      await updateUserRole(userId, newRole);
      toast.success('User role updated!');
      loadUsers();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update role');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="container">
        <h1>Admin - User Management</h1>

        <div className="admin-actions">
          <button 
            onClick={() => setShowAddForm(!showAddForm)} 
            className="btn btn-primary"
            disabled={loading}
          >
            {showAddForm ? 'Cancel' : '+ Add Net Operator'}
          </button>
        </div>

        {showAddForm && (
          <div className="add-user-form card">
            <h2>Add New Net Operator</h2>
            <form onSubmit={handleAddUser}>
              <div className="form-group">
                <label htmlFor="username">Username *</label>
                <input
                  type="text"
                  id="username"
                  value={newUser.username}
                  onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                  required
                  minLength="3"
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label htmlFor="callsign">Callsign *</label>
                <input
                  type="text"
                  id="callsign"
                  value={newUser.callsign}
                  onChange={(e) => setNewUser({ ...newUser, callsign: e.target.value.toUpperCase() })}
                  required
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input
                  type="email"
                  id="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  required
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password *</label>
                <input
                  type="password"
                  id="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  required
                  minLength="6"
                  className="form-control"
                  placeholder="Minimum 6 characters"
                />
              </div>

              <div className="form-group">
                <label htmlFor="role">Role *</label>
                <select
                  id="role"
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="form-control"
                >
                  <option value="operator">Operator</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Creating...' : 'Create User'}
              </button>
            </form>
          </div>
        )}

        <div className="users-list">
          <h2>Net Operators ({users.length})</h2>
          {loading && users.length === 0 ? (
            <p>Loading users...</p>
          ) : users.length === 0 ? (
            <p className="no-data">No users found</p>
          ) : (
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Callsign</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id}>
                      <td>{u.username}</td>
                      <td className="callsign-cell">{u.callsign}</td>
                      <td>{u.email}</td>
                      <td>
                        <span className={`role-badge ${u.role}`}>
                          {u.role.toUpperCase()}
                        </span>
                      </td>
                      <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td>
                        <div className="action-buttons">
                          <button
                            onClick={() => {
                              setSelectedUser(u);
                              setShowResetModal(true);
                            }}
                            className="btn btn-small btn-secondary"
                            disabled={loading || u._id === user._id}
                            title="Reset Password"
                          >
                            Reset Password
                          </button>
                          <button
                            onClick={() => handleToggleRole(u._id, u.role)}
                            className="btn btn-small btn-warning"
                            disabled={loading || u._id === user._id}
                            title={`Change to ${u.role === 'admin' ? 'Operator' : 'Admin'}`}
                          >
                            {u.role === 'admin' ? '👤 Make Operator' : '⭐ Make Admin'}
                          </button>
                          <button
                            onClick={() => handleDeleteUser(u._id, u.username)}
                            className="btn btn-small btn-danger"
                            disabled={loading || u._id === user._id}
                            title="Delete User"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Reset Password Modal */}
        {showResetModal && selectedUser && (
          <div className="modal-overlay" onClick={() => setShowResetModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>Reset Password for {selectedUser.username}</h2>
              <form onSubmit={handleResetPassword}>
                <div className="form-group">
                  <label htmlFor="newPassword">New Password</label>
                  <input
                    type="password"
                    id="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength="6"
                    className="form-control"
                    placeholder="Minimum 6 characters"
                    autoFocus
                  />
                </div>
                <div className="modal-actions">
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Resetting...' : 'Reset Password'}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => {
                      setShowResetModal(false);
                      setSelectedUser(null);
                      setNewPassword('');
                    }} 
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .admin-actions {
          margin: 20px 0;
        }

        .add-user-form {
          margin: 20px 0;
          padding: 20px;
          background: var(--card-bg);
          border-radius: 8px;
        }

        .add-user-form h2 {
          margin-top: 0;
        }

        .users-list {
          margin-top: 30px;
        }

        .admin-table {
          width: 100%;
          border-collapse: collapse;
        }

        .admin-table th,
        .admin-table td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid var(--border-color);
        }

        .admin-table th {
          background: var(--header-bg);
          font-weight: 600;
        }

        .role-badge {
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 0.85em;
          font-weight: 600;
        }

        .role-badge.admin {
          background: #ffd700;
          color: #000;
        }

        .role-badge.operator {
          background: #4a90e2;
          color: #fff;
        }

        .action-buttons {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-content {
          background: var(--card-bg);
          padding: 30px;
          border-radius: 8px;
          max-width: 500px;
          width: 90%;
        }

        .modal-content h2 {
          margin-top: 0;
        }

        .modal-actions {
          display: flex;
          gap: 10px;
          margin-top: 20px;
        }
      `}</style>
    </div>
  );
};

export default Admin;

