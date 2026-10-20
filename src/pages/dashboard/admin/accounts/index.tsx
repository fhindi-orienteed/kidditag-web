import { useState, useEffect, useMemo } from 'react';
import { 
  Building2, 
  Search, 
  RefreshCw, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Users, 
  Tag as TagIcon,
  Shield,
  Calendar
} from 'lucide-react';
import api from '../../../../services/api';
import './accounts.css';

interface AccountUser {
  id: number;
  name: string | null;
  userName: string;
  email: string | null;
  role: string;
  isVerified: boolean;
  createdAt: string;
}

interface AccountItem {
  id: number;
  name: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  users: AccountUser[];
  _count: {
    users: number;
    tags: number;
  };
}

export default function AdminAccountsPage() {
  const [accounts, setAccounts] = useState<AccountItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/admin/accounts');
      // Handle standard response structure { success: true, data: [...] } or array directly
      const data = response.data?.data || response.data || [];
      setAccounts(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error('Failed to load accounts:', err);
      setError(err?.response?.data?.message || err?.message || 'Failed to fetch registered accounts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  // Filter accounts by search query
  const filteredAccounts = useMemo(() => {
    if (!searchQuery.trim()) return accounts;
    const q = searchQuery.toLowerCase().trim();

    return accounts.filter((acc) => {
      const matchName = acc.name?.toLowerCase().includes(q);
      const matchStatus = acc.status?.toLowerCase().includes(q);
      const matchId = String(acc.id).includes(q);
      const matchUser = acc.users?.some(
        (u) =>
          u.name?.toLowerCase().includes(q) ||
          u.email?.toLowerCase().includes(q) ||
          u.userName?.toLowerCase().includes(q)
      );

      return matchName || matchStatus || matchId || matchUser;
    });
  }, [accounts, searchQuery]);

  // Quick statistics
  const stats = useMemo(() => {
    const total = accounts.length;
    const active = accounts.filter((a) => a.status === 'active').length;
    const pending = accounts.filter((a) => a.status === 'pending').length;
    return { total, active, pending };
  }, [accounts]);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

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
                </tr>
              </thead>
              <tbody>
                {filteredAccounts.map((acc) => (
                  <tr key={acc.id}>
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
