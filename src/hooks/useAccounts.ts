import { useState, useEffect, useCallback, useMemo } from 'react';
import accountService from '@/services/account';
import { Account } from '@/types';

export const useAccounts = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const fetchAccounts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await accountService.getAllAccounts();
      const data = response.data?.data || response.data || [];
      setAccounts(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error('Failed to load accounts:', err);
      setError(err?.response?.data?.message || err?.message || 'Failed to fetch registered accounts.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

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

  return {
    accounts,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    filteredAccounts,
    stats,
    formatDate,
    fetchAccounts,
    setAccounts,
  };
};

export default useAccounts;
