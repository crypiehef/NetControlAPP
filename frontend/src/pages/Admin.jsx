import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  getAllUsers, 
  createUser, 
  deleteUser, 
  resetUserPassword,
  updateUserRole,
  updateUser,
  toggleUserEnabled,
  generateOperationsReport
} from '../services/api';
import { toast } from 'react-toastify';

const Admin = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [editUserData, setEditUserData] = useState({
    username: '',
    callsign: '',
    email: ''
  });
  const [newUser, setNewUser] = useState({
    username: '',
    callsign: '',
    email: '',
    password: '',
    role: 'operator'
  });
  const [reportFilters, setReportFilters] = useState({
    operatorId: 'all',
    startDate: '',
    endDate: ''
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
    e.stopPropagation();
    
    // Validate password
    if (!newPassword || newPassword.trim().length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (!selectedUser || !selectedUser._id) {
      toast.error('No user selected');
      return;
    }

    setLoading(true);
    try {
      await resetUserPassword(selectedUser._id, newPassword.trim());
      const isOwnPassword = selectedUser._id === user._id;
      toast.success(isOwnPassword 
        ? 'Password changed successfully! Please login again with your new password.'
        : `Password reset successfully for ${selectedUser.username}!`
      );
      setShowResetModal(false);
      setSelectedUser(null);
      setNewPassword('');
      
      // If user changed their own password, show option to logout
      if (isOwnPassword) {
        // Optionally auto-logout or show a message
        setTimeout(() => {
          if (window.confirm('Your password has been changed. Would you like to logout now to login with your new password?')) {
            // This will be handled by the logout in Navbar or AuthContext
            window.location.href = '/login';
          }
        }, 1000);
      }
    } catch (error) {
      console.error('Reset password error:', error);
      toast.error(error.response?.data?.error || error.message || 'Failed to reset password');
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

  const handleToggleEnabled = async (userId, currentStatus) => {
    const newStatus = !currentStatus;
    const action = newStatus ? 'enable' : 'disable';
    
    if (!window.confirm(`${action === 'enable' ? 'Enable' : 'Disable'} this user account?`)) {
      return;
    }

    setLoading(true);
    try {
      await toggleUserEnabled(userId, newStatus);
      toast.success(`User account ${action}d successfully!`);
      loadUsers();
    } catch (error) {
      toast.error(error.response?.data?.error || `Failed to ${action} user`);
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = async (e) => {
    e.preventDefault();

    setLoading(true);
    try {
      await updateUser(selectedUser._id, editUserData);
      toast.success('User updated successfully!');
      setShowEditModal(false);
      setSelectedUser(null);
      setEditUserData({ username: '', callsign: '', email: '' });
      loadUsers();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update user');
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (u) => {
    setSelectedUser(u);
    setEditUserData({
      username: u.username,
      callsign: u.callsign,
      email: u.email
    });
    setShowEditModal(true);
  };

  const handleGenerateReport = async (e) => {
    e.preventDefault();

    setLoading(true);
    try {
      // Build filters object - only include dates if they're filled in
      const filters = {
        operatorId: reportFilters.operatorId
      };
      
      if (reportFilters.startDate) {
        filters.startDate = reportFilters.startDate;
      }
      
      if (reportFilters.endDate) {
        filters.endDate = reportFilters.endDate;
      }

      console.log('Sending report filters:', filters);

      const pdfBlob = await generateOperationsReport(filters);
      const url = window.URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `net-operations-report-${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Report generated successfully!');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="container">
        <h1>Admin Panel</h1>

        {/* Advanced Reporting Section */}
        <div className="reporting-section" style={{ marginBottom: '3rem', padding: '1.5rem', backgroundColor: 'var(--surface-color)', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }}>
          <h2>📊 Advanced Reporting</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            Generate comprehensive PDF reports with custom filters
          </p>
          
          <form onSubmit={handleGenerateReport}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              <div className="form-group">
                <label htmlFor="reportOperator">Filter by Operator</label>
                <select
                  id="reportOperator"
                  value={reportFilters.operatorId}
                  onChange={(e) => setReportFilters({ ...reportFilters, operatorId: e.target.value })}
                  className="form-control"
                >
                  <option value="all">All Operators</option>
                  {users.map(u => (
                    <option key={u._id} value={u._id}>
                      {u.callsign} - {u.username}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="reportStartDate">Start Date (Optional)</label>
                <input
                  type="date"
                  id="reportStartDate"
                  value={reportFilters.startDate}
                  onChange={(e) => setReportFilters({ ...reportFilters, startDate: e.target.value })}
                  className="form-control"
                />
                <small style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                  Leave blank for all dates
                </small>
              </div>

              <div className="form-group">
                <label htmlFor="reportEndDate">End Date (Optional)</label>
                <input
                  type="date"
                  id="reportEndDate"
                  value={reportFilters.endDate}
                  onChange={(e) => setReportFilters({ ...reportFilters, endDate: e.target.value })}
                  className="form-control"
                />
                <small style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                  Leave blank for all dates
                </small>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Generating Report...' : '📄 Generate PDF Report'}
              </button>
              <button 
                type="button"
                onClick={() => setReportFilters({ operatorId: 'all', startDate: '', endDate: '' })}
                className="btn btn-secondary"
                disabled={loading}
              >
                🔄 Clear Filters
              </button>
            </div>
          </form>
        </div>

        <h2>User Management</h2>
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
                    <th>Status</th>
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
                      <td>
                        <span className={`status-badge ${u.isEnabled ? 'enabled' : 'pending'}`}>
                          {u.isEnabled ? '✓ Enabled' : '⏳ Pending'}
                        </span>
                      </td>
                      <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td>
                        <div className="action-buttons">
                          <button
                            onClick={() => openEditModal(u)}
                            className="btn btn-small btn-primary"
                            disabled={loading}
                            title="Edit User"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => {
                              setSelectedUser(u);
                              setNewPassword(''); // Clear password field when opening modal
                              setShowResetModal(true);
                            }}
                            className="btn btn-small btn-secondary"
                            disabled={loading}
                            title={u._id === user._id ? "Change Your Password" : "Reset Password"}
                          >
                            {u._id === user._id ? "Change Password" : "Reset Password"}
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
                            onClick={() => handleToggleEnabled(u._id, u.isEnabled)}
                            className={`btn btn-small ${u.isEnabled ? 'btn-secondary' : 'btn-success'}`}
                            disabled={loading || u._id === user._id}
                            title={u.isEnabled ? 'Disable User Account' : 'Enable User Account'}
                          >
                            {u.isEnabled ? '🔒 Disable' : '✅ Enable'}
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
              <h2>{selectedUser._id === user._id ? 'Change Your Password' : `Reset Password for ${selectedUser.username}`}</h2>
              {selectedUser._id === user._id && (
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '0.9rem' }}>
                  You are changing your own password. After changing, you will need to login again with the new password.
                </p>
              )}
              <form onSubmit={handleResetPassword}>
                <div className="form-group">
                  <label htmlFor="newPassword">New Password</label>
                  <input
                    type="password"
                    id="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                    className="form-control"
                    placeholder="Enter new password (minimum 6 characters)"
                    autoFocus
                    disabled={loading}
                  />
                  <small style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', display: 'block', marginTop: '0.5rem' }}>
                    Password must be at least 6 characters long
                  </small>
                </div>
                <div className="modal-actions">
                  <button 
                    type="submit" 
                    className="btn btn-primary" 
                    disabled={loading || !newPassword || newPassword.trim().length < 6}
                  >
                    {loading 
                      ? (selectedUser._id === user._id ? 'Changing...' : 'Resetting...') 
                      : (selectedUser._id === user._id ? 'Change Password' : 'Reset Password')
                    }
                  </button>
                  <button 
                    type="button" 
                    onClick={() => {
                      setShowResetModal(false);
                      setSelectedUser(null);
                      setNewPassword('');
                    }} 
                    className="btn btn-secondary"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit User Modal */}
        {showEditModal && selectedUser && (
          <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>Edit User: {selectedUser.username}</h2>
              <form onSubmit={handleEditUser}>
                <div className="form-group">
                  <label htmlFor="editUsername">Username</label>
                  <input
                    type="text"
                    id="editUsername"
                    value={editUserData.username}
                    onChange={(e) => setEditUserData({ ...editUserData, username: e.target.value })}
                    required
                    minLength="3"
                    className="form-control"
                    autoFocus
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="editCallsign">Callsign</label>
                  <input
                    type="text"
                    id="editCallsign"
                    value={editUserData.callsign}
                    onChange={(e) => setEditUserData({ ...editUserData, callsign: e.target.value.toUpperCase() })}
                    required
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="editEmail">Email</label>
                  <input
                    type="email"
                    id="editEmail"
                    value={editUserData.email}
                    onChange={(e) => setEditUserData({ ...editUserData, email: e.target.value })}
                    required
                    className="form-control"
                  />
                </div>

                <div className="modal-actions">
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Updating...' : 'Update User'}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => {
                      setShowEditModal(false);
                      setSelectedUser(null);
                      setEditUserData({ username: '', callsign: '', email: '' });
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

        .status-badge {
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 0.85em;
          font-weight: 600;
        }

        .status-badge.enabled {
          background: #28a745;
          color: #fff;
        }

        .status-badge.pending {
          background: #ffc107;
          color: #000;
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
          background: var(--surface-color);
          padding: 30px;
          border-radius: 8px;
          max-width: 500px;
          width: 90%;
          color: var(--text-color);
        }

        .modal-content h2 {
          margin-top: 0;
          color: var(--text-color);
        }

        .modal-content label {
          color: var(--text-color);
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

