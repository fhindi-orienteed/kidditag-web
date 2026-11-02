import { useState, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export interface ScanIncident {
  id: number;
  tagCode: string;
  latitude: number;
  longitude: number;
  locationName: string | null;
  accuracy: number | null;
  deviceInfo: string | null;
  childId: number | null;
  createdAt: string;
}

export const useScans = (initialChildId?: number) => {
  const { isAuthenticated } = useAuth();
  const [scans, setScans] = useState<ScanIncident[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchScans = useCallback(async (childId?: number) => {
    const targetId = childId || initialChildId;
    if (!isAuthenticated || !targetId) {
      setScans([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await api.get(`/tags/scans/child/${targetId}`);
      const data = res.data;
      const list = Array.isArray(data) ? data : (data?.data || []);
      setScans(list);
    } catch (err: any) {
      setError(err.message || 'Failed to load scans');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, initialChildId]);

  return {
    scans,
    loading,
    error,
    fetchScans,
  };
};
