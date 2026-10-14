import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import type { ApiTag } from '../types';
import { useAuth } from '../context/AuthContext';

export interface UseTagsReturn {
  tags: ApiTag[];
  loading: boolean;
  error: string | null;
  fetchTags: () => Promise<void>;
  createTag: (tagCode: string, childId: number) => Promise<ApiTag | null>;
  updateTag: (id: number | string, data: { isActive?: boolean; childId?: number }) => Promise<boolean>;
  deleteTag: (id: number | string) => Promise<boolean>;
}

export const useTags = (): UseTagsReturn => {
  const { isAuthenticated } = useAuth();
  const [tags, setTags] = useState<ApiTag[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTags = useCallback(async () => {
    if (!isAuthenticated) {
      setTags([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/tags');
      const data = res.data;
      const list = Array.isArray(data) ? data : (data?.data || []);
      setTags(list);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch tags');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const createTag = useCallback(async (tagCode: string, childId: number): Promise<ApiTag | null> => {
    try {
      const res = await api.post('/tags', { tagCode, childId });
      const created = res.data?.data || res.data;
      await fetchTags();
      return created;
    } catch (err: any) {
      throw new Error(err.message || 'Failed to create tag');
    }
  }, [fetchTags]);

  const updateTag = useCallback(async (id: number | string, data: { isActive?: boolean; childId?: number }): Promise<boolean> => {
    try {
      await api.put(`/tags/${id}`, data);
      setTags((prev) =>
        prev.map((t) => (t.id === Number(id) || t.tagCode === String(id) ? { ...t, ...data } : t))
      );
      return true;
    } catch (err: any) {
      throw new Error(err.message || 'Failed to update tag');
    }
  }, []);

  const deleteTag = useCallback(async (id: number | string): Promise<boolean> => {
    try {
      await api.delete(`/tags/${id}`);
      setTags((prev) => prev.filter((t) => t.id !== Number(id) && t.tagCode !== String(id)));
      return true;
    } catch (err: any) {
      throw new Error(err.message || 'Failed to delete tag');
    }
  }, []);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  return {
    tags,
    loading,
    error,
    fetchTags,
    createTag,
    updateTag,
    deleteTag,
  };
};

export default useTags;
