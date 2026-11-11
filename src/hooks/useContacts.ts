import { useState, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export interface ContactItem {
  id: number;
  name: string;
  relationship: string;
  phoneNumber: string;
  priority: 'Primary' | 'Secondary' | 'Doctor' | 'Other';
  childId: number;
  createdAt?: string;
}

export const useContacts = (initialChildId?: number) => {
  const { isAuthenticated } = useAuth();
  const [contacts, setContacts] = useState<ContactItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchContacts = useCallback(async (childId?: number) => {
    const targetId = childId || initialChildId;
    if (!isAuthenticated || !targetId) {
      setContacts([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await api.get(`/contacts/child/${targetId}`);
      const data = res.data;
      const list = Array.isArray(data) ? data : (data?.data || []);
      setContacts(list);
    } catch (err: any) {
      setError(err.message || 'Failed to load emergency contacts');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, initialChildId]);

  const addContact = useCallback(async (childId: number, data: { name: string; relationship: string; phoneNumber: string; priority: string }) => {
    try {
      setError(null);
      const res = await api.post(`/contacts/child/${childId}`, data);
      const created = res.data?.data || res.data;
      await fetchContacts(childId);
      return created;
    } catch (err: any) {
      throw new Error(err.message || 'Failed to add contact');
    }
  }, [fetchContacts]);

  const updateContact = useCallback(async (contactId: number, childId: number, data: { name?: string; relationship?: string; phoneNumber?: string; priority?: string }) => {
    try {
      setError(null);
      const res = await api.put(`/contacts/${contactId}`, data);
      const updated = res.data?.data || res.data;
      await fetchContacts(childId);
      return updated;
    } catch (err: any) {
      throw new Error(err.message || 'Failed to update contact');
    }
  }, [fetchContacts]);

  const deleteContact = useCallback(async (contactId: number, childId: number) => {
    try {
      setError(null);
      await api.delete(`/contacts/${contactId}`);
      await fetchContacts(childId);
    } catch (err: any) {
      throw new Error(err.message || 'Failed to delete contact');
    }
  }, [fetchContacts]);

  return {
    contacts,
    loading,
    error,
    fetchContacts,
    addContact,
    updateContact,
    deleteContact,
  };
};
