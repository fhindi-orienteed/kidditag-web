import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Plus,
  RefreshCw,
  Shield,
  Tag as TagIcon,
  Trash2,
  UserCheck,
  UserX,
  Users,
  X,
  AlertCircle
} from 'lucide-react';
import api from '../../../../../services/api';
import './accountDetails.css';

interface UserItem {
  id: number;
  name: string | null;
  userName: string;
  email: string | null;
  role: string;
  status: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

interface TagItem {
  id: number;
  tagCode?: string;
  code?: string;
  isActive?: boolean;
  status?: string;
  child?: {
    id: number;
    name: string;
  };
}

interface AccountDetails {
  id: number;
  name: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  users: UserItem[];
  tags: TagItem[];
  _count: {
    users: number;
    tags: number;
  };
}

export default function AdminAccountDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [account, setAccount] = useState<AccountDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState('user');
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchAccountDetails = async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/admin/accounts/${id}`);
      const data = response.data?.data || response.data;
      setAccount(data);
    } catch (err: any) {
      console.error('Failed to load account details:', err);
      setError(err?.response?.data?.message || err?.message || 'Failed to fetch account details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccountDetails();
  }, [id]);

  // Handle Add New User
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserEmail.trim()) {
      setFormError('Email is required');
      return;
    }

    try {
      setFormSubmitting(true);
      setFormError(null);

      await api.post(`/admin/accounts/${id}/users`, {
        name: newUserName.trim() || undefined,
        email: newUserEmail.trim(),
        password: newUserPassword.trim() || undefined,
        role: newUserRole,
      });

      // Reset and close
      setNewUserName('');
      setNewUserEmail('');
      setNewUserPassword('');
      setNewUserRole('user');
      setIsModalOpen(false);

      // Refresh list
      await fetchAccountDetails();
    } catch (err: any) {
      console.error('Failed to add user:', err);
      setFormError(err?.response?.data?.message || err?.message || 'Failed to add user to this account.');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Handle Toggle User Status (Disable / Enable)
  const handleToggleStatus = async (user: UserItem) => {
    const newStatus = user.status === 'disabled' ? 'active' : 'disabled';
    const confirmMsg = user.status === 'disabled'
      ? `Re-enable account access for ${user.name || user.email}?`
      : `Disable account access for ${user.name || user.email}? They will not be able to log in.`;

    if (!window.confirm(confirmMsg)) return;

    try {
      await api.patch(`/admin/accounts/${id}/users/${user.id}/status`, {
        status: newStatus,
      });
      await fetchAccountDetails();
    } catch (err: any) {
      console.error('Failed to update user status:', err);
      alert(err?.response?.data?.message || 'Failed to update user status.');
    }
  };

  // Handle Delete User
  const handleDeleteUser = async (user: UserItem) => {
    if (!window.confirm(`Are you sure you want to permanently delete user "${user.name || user.email}"? This cannot be undone.`)) {
      return;
    }

    try {
      await api.delete(`/admin/accounts/${id}/users/${user.id}`);
      await fetchAccountDetails();
    } catch (err: any) {
      console.error('Failed to delete user:', err);
      alert(err?.response?.data?.message || 'Failed to delete user.');
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="account-details-container">
      {/* Back Button */}
      <button className="account-back-btn" onClick={() => navigate('/dashboard/admin/accounts')}>
        <ArrowLeft size={16} />
        <span>Back to Registered Accounts</span>
      </button>

      {/* Error Alert */}
      {error && (
        <div className="admin-error-box">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="admin-state-box" style={{ background: '#fff', borderRadius: 16, padding: 48 }}>
          <RefreshCw size={32} className="animate-spin" color="#6366f1" />
          <p>Loading account details...</p>
        </div>
      ) : account ? (
        <>
          {/* Top Account Details Card */}
          <div className="account-header-card">
            <div className="account-header-top">
              <div className="account-title-box">
                <div className="account-avatar-icon">
                  <Building2 size={28} />
                </div>
                <div>
                  <h1>{account.name || 'Unnamed Account'}</h1>
                  <div className="account-meta-line">
                    <span className="account-id-badge">Account #{account.id}</span>
                    <span>•</span>
                    <span className={`status-badge ${account.status?.toLowerCase()}`}>
                      {account.status === 'active' && <CheckCircle2 size={12} />}
                      {account.status === 'pending' && <Clock size={12} />}
                      {account.status}
                    </span>
                  </div>
                </div>
              </div>

              <button 
                className="admin-btn-refresh"
                onClick={fetchAccountDetails}
                disabled={loading}
              >
                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                <span>Refresh</span>
              </button>
            </div>

            {/* Info Grid */}
            <div className="account-info-grid">
              <div className="account-info-item">
                <span className="account-info-label">Caregivers & Users</span>
                <span className="account-info-value">
                  <Users size={16} color="#6366f1" />
                  {account.users?.length ?? 0}
                </span>
              </div>

              <div className="account-info-item">
                <span className="account-info-label">Assigned Tags</span>
                <span className="account-info-value">
                  <TagIcon size={16} color="#8b5cf6" />
                  {account.tags?.length ?? account._count?.tags ?? 0}
                </span>
              </div>

              <div className="account-info-item">
                <span className="account-info-label">Created At</span>
                <span className="account-info-value">
                  <Calendar size={16} color="#64748b" />
                  {formatDate(account.createdAt)}
                </span>
              </div>

              <div className="account-info-item">
                <span className="account-info-label">Tenant Status</span>
                <span className="account-info-value" style={{ textTransform: 'capitalize' }}>
                  {account.status}
                </span>
              </div>
            </div>
          </div>

          {/* Users Table Section */}
          <div className="section-header-row">
            <h2>
              <Users size={20} color="#6366f1" />
              Account Caregivers & Users
            </h2>
            <button className="btn-add-user" onClick={() => setIsModalOpen(true)}>
              <Plus size={16} />
              <span>Add New User</span>
            </button>
          </div>

          <div className="admin-table-card">
            {account.users && account.users.length > 0 ? (
              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>User ID</th>
                      <th>Caregiver Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Account Status</th>
                      <th>Email Verified</th>
                      <th>Joined Date</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {account.users.map((u) => {
                      const isDisabled = u.status === 'disabled';
                      return (
                        <tr key={u.id} style={{ opacity: isDisabled ? 0.7 : 1 }}>
                          <td>
                            <span className="account-id-badge">#{u.id}</span>
                          </td>
                          <td className="account-name-cell">
                            {u.name || u.userName}
                          </td>
                          <td style={{ color: '#475569' }}>
                            {u.email || u.userName}
                          </td>
                          <td>
                            <span 
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                padding: '2px 8px',
                                borderRadius: 6,
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                background: u.role === 'admin' ? '#ede9fe' : '#f1f5f9',
                                color: u.role === 'admin' ? '#6d28d9' : '#475569',
                                textTransform: 'capitalize'
                              }}
                            >
                              {u.role === 'admin' && <Shield size={11} style={{ marginRight: 4 }} />}
                              {u.role}
                            </span>
                          </td>
                          <td>
                            <span className={`user-status-pill ${isDisabled ? 'disabled' : 'active'}`}>
                              {isDisabled ? <UserX size={12} /> : <UserCheck size={12} />}
                              {isDisabled ? 'Disabled' : 'Active'}
                            </span>
                          </td>
                          <td>
                            {u.isVerified ? (
                              <span style={{ color: '#059669', display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.82rem', fontWeight: 600 }}>
                                <CheckCircle2 size={13} />
                                Verified
                              </span>
                            ) : (
                              <span style={{ color: '#d97706', display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.82rem', fontWeight: 600 }}>
                                <Clock size={13} />
                                Pending
                              </span>
                            )}
                          </td>
                          <td style={{ color: '#64748b', fontSize: '0.85rem' }}>
                            {formatDate(u.createdAt)}
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', gap: 8 }}>
                              {/* Toggle Status Button (Disable / Enable) */}
                              <button
                                className={`btn-action-icon ${isDisabled ? 'enable' : 'disable'}`}
                                onClick={() => handleToggleStatus(u)}
                                title={isDisabled ? 'Re-enable User' : 'Disable User'}
                              >
                                {isDisabled ? <UserCheck size={16} /> : <UserX size={16} />}
                              </button>

                              {/* Delete User Button */}
                              <button
                                className="btn-action-icon delete"
                                onClick={() => handleDeleteUser(u)}
                                title="Delete User"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="admin-state-box">
                <Users size={32} color="#94a3b8" />
                <p>No users currently attached to this account.</p>
              </div>
            )}
          </div>
        </>
      ) : null}

      {/* Add User Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add New User to Account</h3>
              <button className="modal-close-btn" onClick={() => setIsModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddUser}>
              <div className="modal-body">
                {formError && (
                  <div className="admin-error-box" style={{ marginBottom: 16 }}>
                    <AlertCircle size={16} />
                    <span>{formError}</span>
                  </div>
                )}

                <div className="modal-field">
                  <label>Caregiver / Full Name</label>
                  <input
                    type="text"
                    className="modal-input"
                    placeholder="e.g. Sarah Sinclair"
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                  />
                </div>

                <div className="modal-field">
                  <label>Email Address *</label>
                  <input
                    type="email"
                    className="modal-input"
                    placeholder="name@example.com"
                    required
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                  />
                </div>

                <div className="modal-field">
                  <label>Initial Password (Optional)</label>
                  <input
                    type="password"
                    className="modal-input"
                    placeholder="Leave blank for auto-generated (KiddiTag@2026)"
                    value={newUserPassword}
                    onChange={(e) => setNewUserPassword(e.target.value)}
                  />
                </div>

                <div className="modal-field">
                  <label>Role</label>
                  <select
                    className="modal-input"
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value)}
                  >
                    <option value="user">User (Caregiver)</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setIsModalOpen(false)}
                  disabled={formSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-add-user"
                  disabled={formSubmitting}
                >
                  {formSubmitting ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      <span>Adding...</span>
                    </>
                  ) : (
                    <span>Create User</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
