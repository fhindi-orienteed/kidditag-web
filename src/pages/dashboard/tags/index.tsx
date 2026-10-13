import { useState, useEffect } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import TagsCard from './TagCard';
import type { ApiTag } from '../../../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

export default function TagsPage() {
  const [tags, setTags] = useState<ApiTag[]>([]);
  const [children, setChildren] = useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [tagCode, setTagCode] = useState('');
  const [childId, setChildId] = useState('');
  const [newChildName, setNewChildName] = useState('');
  const [adding, setAdding] = useState(false);

  const token = localStorage.getItem('token');

  const fetchChildren = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/children`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      const list = Array.isArray(data) ? data : (data.data || []);
      if (res.ok) {
        setChildren(list);
        if (list.length > 0) {
          setChildId(String(list[0].id));
        } else {
          setChildId('__new__');
        }
      }
    } catch {
      console.error('Failed to load children');
    }
  };

  const fetchTags = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/tags`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      const list = Array.isArray(data) ? data : (data.data || []);
      if (res.ok) {
        setTags(list);
      } else {
        setError(data.message || 'Failed to load tags');
      }
    } catch {
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
    fetchChildren();
  }, []);

  const handleAddTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tagCode) return;

    setAdding(true);
    try {
      let targetChildId = childId;

      // If user chose to create a new child or has no children
      if ((targetChildId === '__new__' || !targetChildId) && newChildName.trim()) {
        const childRes = await fetch(`${API_BASE_URL}/children`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            name: newChildName.trim(),
            dateOfBirth: new Date('2020-01-01').toISOString()
          })
        });
        const childData = await childRes.json();
        const createdId = childData?.data?.id || childData?.id;
        if (childRes.ok && createdId) {
          targetChildId = String(createdId);
          await fetchChildren();
        } else {
          const errMsg = childData.errors ? childData.errors.map((e: any) => e.message).join(', ') : childData.message;
          alert(errMsg || 'Failed to create child');
          setAdding(false);
          return;
        }
      }

      if (!targetChildId || targetChildId === '__new__') {
        alert('Please select a child or enter a new child name');
        setAdding(false);
        return;
      }

      const res = await fetch(`${API_BASE_URL}/tags`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ tagCode, childId: Number(targetChildId) })
      });
      const data = await res.json();
      if (res.ok) {
        setShowAddForm(false);
        setTagCode('');
        setNewChildName('');
        fetchTags();
      } else {
        alert(data.message || 'Failed to add tag');
      }
    } catch {
      alert('Failed to connect to server');
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this tag?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/tags/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setTags(prev => prev.filter(t => t.id !== id));
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to delete tag');
      }
    } catch {
      alert('Failed to connect to server');
    }
  };

  const handleToggleActive = async (id: number, isActive: boolean) => {
    try {
      const res = await fetch(`${API_BASE_URL}/tags/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ isActive })
      });
      if (res.ok) {
        setTags(prev => prev.map(t => t.id === id ? { ...t, isActive } : t));
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to update tag');
      }
    } catch {
      alert('Failed to connect to server');
    }
  };

  if (loading) {
    return (
      <div className="dash-view-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
        <Loader2 size={32} className="spin" style={{ color: 'var(--brand-purple)' }} />
      </div>
    );
  }

  return (
    <div className="dash-view-container">
      <div className="dash-section-headline-row">
        <div>
          <h2 className="dash-section-h2">Physical Smart Tags ({tags.length})</h2>
          <p className="dash-card-sub">
            All active tags linked to your children. Passive NFC & QR - zero charging needed.
          </p>
        </div>
        <button className="btn-primary" onClick={() => setShowAddForm(true)}>
          <Plus size={16} />
          <span>Register Another Tag</span>
        </button>
      </div>

      {error && <p style={{ color: 'red', marginBottom: 12 }}>{error}</p>}

      {showAddForm && (
        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: 14,
          padding: 24,
          marginBottom: 28,
          boxShadow: '0 4px 12px rgba(0,0,0,0.04)'
        }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: '#1e293b' }}>
            Register & Assign New Smart Tag
          </h3>
          <form onSubmit={handleAddTag} style={{ display: 'flex', gap: 16, alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 200px' }}>
              <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 6, color: '#475569' }}>
                Tag Code (Serial / Barcode)
              </label>
              <input
                className="input-field"
                placeholder="e.g. KT-9902"
                value={tagCode}
                onChange={e => setTagCode(e.target.value)}
                required
                style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #cbd5e1' }}
              />
            </div>
            
            <div style={{ flex: '1 1 220px' }}>
              <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 6, color: '#475569' }}>
                Assign to Child
              </label>
              {children.length > 0 ? (
                <>
                  <select
                    value={childId}
                    onChange={e => setChildId(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 8,
                      border: '1px solid #cbd5e1',
                      background: '#fff',
                      color: '#1e293b',
                      fontSize: 14,
                      outline: 'none'
                    }}
                  >
                    {children.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                    <option value="__new__">+ Register New Child...</option>
                  </select>

                  {childId === '__new__' && (
                    <input
                      placeholder="Enter new child name"
                      value={newChildName}
                      onChange={e => setNewChildName(e.target.value)}
                      required
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: 8,
                        border: '1px solid #cbd5e1',
                        marginTop: 8
                      }}
                    />
                  )}
                </>
              ) : (
                <input
                  placeholder="Enter child name (e.g. Maya)"
                  value={newChildName}
                  onChange={e => setNewChildName(e.target.value)}
                  required
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #cbd5e1' }}
                />
              )}
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                type="submit"
                className="btn-primary"
                disabled={adding}
                style={{ height: 42, padding: '0 20px', borderRadius: 8 }}
              >
                {adding ? 'Saving...' : 'Save Tag'}
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setShowAddForm(false)}
                style={{ height: 42, padding: '0 18px', borderRadius: 8, background: '#f1f5f9', border: 'none', color: '#64748b' }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {tags.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
          <p>No tags registered yet. Click "Register Another Tag" to add one!</p>
        </div>
      ) : (
        <div className="dash-cards-grid-3">
          {tags.map(tag => (
            <TagsCard
              key={tag.id}
              tag={tag}
              onDelete={handleDelete}
              onToggleActive={handleToggleActive}
            />
          ))}
        </div>
      )}
    </div>
  );
}
