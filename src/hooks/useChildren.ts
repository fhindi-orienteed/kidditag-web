import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export interface ChildItem {
  id: number;
  name: string;
  dateOfBirth?: string;
  medicalInfo?: string;
  allergies?: string;
  photoUrl?: string;
  tags?: any[];
}

export const useChildren = () => {
  const { isAuthenticated } = useAuth();
  const [children, setChildren] = useState<ChildItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchChildren = useCallback(async () => {
    if (!isAuthenticated) {
      setChildren([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/children');
      const data = res.data;
      const list = Array.isArray(data) ? data : (data?.data || []);
      setChildren(list);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch children');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const createChild = useCallback(async (name: string, dateOfBirth: string = '2020-01-01', photoUrl?: string): Promise<ChildItem> => {
    try {
      const res = await api.post('/children', { name, dateOfBirth, photoUrl });
      const created = res.data?.data || res.data;
      await fetchChildren();
      return created;
    } catch (err: any) {
      throw new Error(err.message || 'Failed to create child');
    }
  }, [fetchChildren]);

  const updateChild = useCallback(async (id: number, data: { name?: string; photoUrl?: string; medicalInfo?: string; allergies?: string }): Promise<ChildItem> => {
    try {
      const res = await api.put(`/children/${id}`, data);
      const updated = res.data?.data || res.data;
      await fetchChildren();
      return updated;
    } catch (err: any) {
      throw new Error(err.message || 'Failed to update child');
    }
  }, [fetchChildren]);

  useEffect(() => {
    fetchChildren();
  }, [fetchChildren]);

  return {
    children,
    loading,
    error,
    fetchChildren,
    createChild,
    updateChild,
  };
};

export default useChildren;
