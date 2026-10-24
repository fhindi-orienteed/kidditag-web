import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Search,
  RefreshCw,
  CheckCircle2,
  UserX,
  Clock,
  AlertCircle,
  Users,
  Tag as TagIcon,
  Calendar,
  ChevronRight
} from 'lucide-react';
import '@styles/pages/accounts.scss';
import { useAccounts } from '@/hooks/useAccounts';

export default function AdminAccountsPage() {
  const navigate = useNavigate();
  const {
    accounts,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    filteredAccounts,
    stats,
    formatDate,
    fetchAccounts,
  } = useAccounts();

  return (
    <div className="admin-accounts-container">
      {/* Header */}
      <div className="admin-header-row">
        <div className="admin-title-group">
          <h1>
            <Building2 size={26} color="#6366f1" />
            Registered Accounts
            <span className="admin-title-badge">Admin Portal</span>
          </h1>
          <p className="admin-subtitle">
            System-wide overview of all registered multi-tenant family accounts and their active caregivers.
          </p>
        </div>

        <button
          className="admin-btn-refresh"
          onClick={fetchAccounts}
          disabled={loading}
          title="Refresh Accounts"
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-icon purple">
            <Building2 size={24} />
          </div>
          <div>
            <div className="admin-stat-value">{stats.total}</div>
            <div className="admin-stat-label">Total Accounts</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon green">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <div className="admin-stat-value">{stats.active}</div>
            <div className="admin-stat-label">Active Accounts</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon amber">
            <Clock size={24} />
          </div>
          <div>
            <div className="admin-stat-value">{stats.pending}</div>
            <div className="admin-stat-label">Pending Verification</div>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="admin-error-box">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Search Toolbar */}
      <div className="admin-toolbar">
        <div className="admin-search-wrapper">
          <Search size={17} className="admin-search-icon" />
          <input
            type="text"
            className="admin-search-input"
            placeholder="Search by account name, caregiver, email, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
          Showing <strong>{filteredAccounts.length}</strong> of <strong>{accounts.length}</strong> accounts
        </div>
      </div>

      {/* Accounts Table Card */}
      <div className="admin-table-card">
        {loading ? (
          <div className="admin-state-box">
            <RefreshCw size={30} className="animate-spin" color="#6366f1" />
            <p>Loading registered accounts...</p>
          </div>
        ) : filteredAccounts.length === 0 ? (
          <div className="admin-state-box">
            <Building2 size={36} color="#94a3b8" />
            <p>No registered accounts found matching your query.</p>
          </div>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Account ID</th>
                  <th>Account Name</th>
                  <th>Status</th>
                  <th>Primary Caregiver(s)</th>
                  <th>Users</th>
                  <th>Tags</th>
                  <th>Registered Date</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAccounts.map((acc) => (
                  <tr
                    key={acc.id}
                    style={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/dashboard/admin/accounts/${acc.id}`)}
                  >
                    <td>
                      <span className="account-id-badge">#{acc.id}</span>
                    </td>
                    <td className="account-name-cell">
                      {acc.name || 'Unnamed Account'}
                    </td>
                    <td>
                      <span className={`status-badge ${acc.status?.toLowerCase()}`}>
                        {acc.status === 'active' && <CheckCircle2 size={12} />}
                        {acc.status === 'pending' && <Clock size={12} />}
                        {acc.status === 'disabled' && <UserX size={12} />}
                        {acc.status || 'unknown'}
                      </span>
                    </td>
                    <td>
                      {acc.users && acc.users.length > 0 ? (
                        acc.users.map((u) => (
                          <div key={u.id} className="account-user-item">
                            <span className="account-user-name">
                              {u.name || u.userName}
                              {u.role === 'admin' && (
                                <span
                                  style={{
                                    marginLeft: 6,
                                    fontSize: '0.7rem',
                                    background: '#ede9fe',
                                    color: '#6d28d9',
                                    padding: '1px 5px',
                                    borderRadius: 4
                                  }}
                                >
                                  Admin
                                </span>
                              )}
                            </span>
                            <span className="account-user-email">
                              {u.email || u.userName}
                            </span>
                          </div>
                        ))
                      ) : (
                        <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>No users linked</span>
                      )}
                    </td>
                    <td>
                      <span className="count-pill">
                        <Users size={12} style={{ display: 'inline', marginRight: 4 }} />
                        {acc._count?.users ?? acc.users?.length ?? 0}
                      </span>
                    </td>
                    <td>
                      <span className="count-pill">
                        <TagIcon size={12} style={{ display: 'inline', marginRight: 4 }} />
                        {acc._count?.tags ?? 0}
                      </span>
                    </td>
                    <td>
                      <span style={{ color: '#64748b', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <Calendar size={13} />
                        {formatDate(acc.createdAt)}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        className="admin-btn-view"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/dashboard/admin/accounts/${acc.id}`);
                        }}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          padding: '6px 12px',
                          background: '#f1f5f9',
                          color: '#4338ca',
                          border: '1px solid #e0e7ff',
                          borderRadius: 6,
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        <span>Manage</span>
                        <ChevronRight size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
