import React, { useState, useEffect } from 'react';
import { Plus, PhoneCall, Trash2, Pencil, X, Loader2, UserRound } from 'lucide-react';
import { useContacts, ContactItem } from '../../../hooks/useContacts';
import { useChildren } from '../../../hooks/useChildren';

const PRIORITY_OPTIONS = ['Primary', 'Secondary', 'Doctor', 'Other'] as const;

const PRIORITY_COLORS: Record<string, string> = {
  Primary: '#7c3aed',
  Secondary: '#2563eb',
  Doctor: '#dc2626',
  Other: '#6b7280',
};

interface ContactFormData {
  name: string;
  relationship: string;
  phoneNumber: string;
  priority: string;
}

const EMPTY_FORM: ContactFormData = {
  name: '',
  relationship: '',
  phoneNumber: '',
  priority: 'Secondary',
};

export default function ContactsPage() {
  const { children, loading: childrenLoading } = useChildren();
  const [selectedChildId, setSelectedChildId] = useState<number | null>(null);
  const { contacts, loading, error, fetchContacts, addContact, updateContact, deleteContact } = useContacts();

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingContact, setEditingContact] = useState<ContactItem | null>(null);
  const [formData, setFormData] = useState<ContactFormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Auto-select first child
  useEffect(() => {
    if (children.length > 0 && !selectedChildId) {
      setSelectedChildId(children[0].id);
    }
  }, [children, selectedChildId]);

  // Fetch contacts when child selected
  useEffect(() => {
    if (selectedChildId) {
      fetchContacts(selectedChildId);
    }
  }, [selectedChildId, fetchContacts]);

  const openAddModal = () => {
    setEditingContact(null);
    setFormData(EMPTY_FORM);
    setFormError('');
    setShowModal(true);
  };

  const openEditModal = (contact: ContactItem) => {
    setEditingContact(contact);
    setFormData({
      name: contact.name,
      relationship: contact.relationship,
      phoneNumber: contact.phoneNumber,
      priority: contact.priority,
    });
    setFormError('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingContact(null);
    setFormData(EMPTY_FORM);
    setFormError('');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChildId) return;
    if (!formData.name || !formData.phoneNumber || !formData.relationship) {
      setFormError('Please fill in all required fields.');
      return;
    }

    try {
      setSaving(true);
      setFormError('');
      if (editingContact) {
        await updateContact(editingContact.id, selectedChildId, formData);
      } else {
        await addContact(selectedChildId, formData);
      }
      closeModal();
    } catch (err: any) {
      setFormError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (contactId: number) => {
    if (!selectedChildId) return;
    if (!window.confirm('Are you sure you want to remove this emergency contact?')) return;
    try {
      setDeletingId(contactId);
      await deleteContact(contactId, selectedChildId);
    } catch (err: any) {
      alert(err.message || 'Failed to delete contact');
    } finally {
      setDeletingId(null);
    }
  };

  const selectedChild = children.find(c => c.id === selectedChildId);

  return (
    <div className="dash-view-container">
      <div className="dash-card">
        {/* Header */}
        <div className="dash-card-header">
          <div>
            <h2 className="dash-card-title">Emergency Contact Priority List</h2>
            <p className="dash-card-sub">
              When your child's tag is scanned, finders can call these verified numbers instantly.
            </p>
          </div>
          <button className="btn-primary" onClick={openAddModal} disabled={!selectedChildId}>
            <Plus size={14} />
            <span>Add New Contact</span>
          </button>
        </div>

        {/* Child Selector */}
        {!childrenLoading && children.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
              Viewing contacts for:
            </label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {children.map(child => (
                <button
                  key={child.id}
                  onClick={() => setSelectedChildId(child.id)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 20,
                    border: '2px solid',
                    borderColor: selectedChildId === child.id ? '#7c3aed' : 'var(--border-light)',
                    background: selectedChildId === child.id ? '#f3effe' : 'transparent',
                    color: selectedChildId === child.id ? '#7c3aed' : 'var(--text-muted)',
                    fontWeight: 600,
                    fontSize: '0.83rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  {child.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Contacts List */}
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 0', gap: 10, color: 'var(--text-muted)' }}>
            <Loader2 size={20} className="spin" />
            <span>Loading emergency contacts...</span>
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', color: '#dc2626', padding: '30px 0', fontSize: '0.88rem' }}>
            ⚠️ {error}
          </div>
        ) : contacts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-muted)' }}>
            <UserRound size={40} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
            <p style={{ fontWeight: 600, marginBottom: 4 }}>No emergency contacts yet</p>
            <p style={{ fontSize: '0.84rem' }}>
              Add contacts so finders can reach {selectedChild?.name || 'your child'}'s guardians immediately.
            </p>
          </div>
        ) : (
          <div className="dash-contact-list">
            {contacts.map((contact) => (
              <div key={contact.id} className="dash-contact-item">
                <div style={{ flex: 1 }}>
                  <div className="dash-contact-name-row">
                    <strong>{contact.name}</strong>
                    <span
                      className="dash-priority-pill"
                      style={{ background: PRIORITY_COLORS[contact.priority] + '18', color: PRIORITY_COLORS[contact.priority], border: `1.5px solid ${PRIORITY_COLORS[contact.priority]}40` }}
                    >
                      {contact.priority}
                    </span>
                  </div>
                  <div className="dash-contact-phone">
                    {contact.relationship} · {contact.phoneNumber}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <a
                    href={`tel:${contact.phoneNumber}`}
                    className="btn-secondary"
                    style={{ padding: '6px 12px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: 5, textDecoration: 'none' }}
                  >
                    <PhoneCall size={13} />
                    <span>Call</span>
                  </a>
                  <button
                    className="btn-secondary"
                    style={{ padding: '6px 12px', fontSize: '0.78rem' }}
                    onClick={() => openEditModal(contact)}
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    className="btn-secondary"
                    style={{ padding: '6px 10px', fontSize: '0.78rem', color: '#dc2626', borderColor: '#fecaca' }}
                    onClick={() => handleDelete(contact.id)}
                    disabled={deletingId === contact.id}
                  >
                    {deletingId === contact.id ? <Loader2 size={13} className="spin" /> : <Trash2 size={13} />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
        >
          <div style={{ background: '#fff', borderRadius: 16, padding: 28, width: '100%', maxWidth: 480, boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                {editingContact ? 'Edit Emergency Contact' : 'Add Emergency Contact'}
              </h3>
              <button onClick={closeModal} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Sarah Ahmad"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Relationship *</label>
                <input
                  type="text"
                  placeholder="e.g. Mother, Father, Pediatrician"
                  value={formData.relationship}
                  onChange={e => setFormData({ ...formData, relationship: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Phone Number *</label>
                <input
                  type="tel"
                  placeholder="+970599000000"
                  value={formData.phoneNumber}
                  onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Priority</label>
                <select
                  value={formData.priority}
                  onChange={e => setFormData({ ...formData, priority: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid var(--border-light)', fontSize: '0.9rem', outline: 'none' }}
                >
                  {PRIORITY_OPTIONS.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              {formError && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', color: '#dc2626', fontSize: '0.84rem' }}>
                  ⚠️ {formError}
                </div>
              )}

              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" style={{ flex: 1 }} disabled={saving}>
                  {saving ? <Loader2 size={16} className="spin" /> : null}
                  <span>{saving ? 'Saving...' : editingContact ? 'Save Changes' : 'Add Contact'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
