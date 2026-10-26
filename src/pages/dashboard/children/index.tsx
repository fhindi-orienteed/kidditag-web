import { useState, useRef } from 'react';
import { Plus, Camera, Loader2, CheckCircle2, ShieldCheck, Edit3, Heart } from 'lucide-react';
import { useChildren } from '../../../hooks/useChildren';
import { useAuth } from '../../../context/AuthContext';

interface ChildrenPageProps {
  onOpenActivation?: () => void;
}

export default function ChildrenPage({ onOpenActivation }: ChildrenPageProps) {
  const { isAuthenticated } = useAuth();
  const { children, loading, error, updateChild, createChild } = useChildren();

  const [uploadingId, setUploadingId] = useState<number | null>(null);
  const [successId, setSuccessId] = useState<number | null>(null);
  const [activeChildId, setActiveChildId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // New child modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [addingChild, setAddingChild] = useState(false);

  // Edit child details modal state
  const [editingChild, setEditingChild] = useState<any | null>(null);
  const [editName, setEditName] = useState('');
  const [editAllergies, setEditAllergies] = useState('');
  const [editMedical, setEditMedical] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  // Open file picker for specific child
  const handleOpenPhotoPicker = (childId: number) => {
    setActiveChildId(childId);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  // Convert selected photo to Base64 and save to PostgreSQL DB
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeChildId) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('Photo is too large. Please select an image under 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      try {
        setUploadingId(activeChildId);
        await updateChild(activeChildId, { photoUrl: base64 });
        setSuccessId(activeChildId);
        setTimeout(() => setSuccessId(null), 3000);
      } catch (err: any) {
        alert(err.message || 'Failed to upload photo');
      } finally {
        setUploadingId(null);
        setActiveChildId(null);
      }
    };
    reader.readAsDataURL(file);
  };

  // Open edit modal
  const handleOpenEditModal = (child: any) => {
    setEditingChild(child);
    setEditName(child.name || '');
    setEditAllergies(child.allergies || '');
    setEditMedical(child.medicalInfo || '');
  };

  // Save edited child details
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingChild) return;
    setSavingEdit(true);
    try {
      await updateChild(editingChild.id, {
        name: editName.trim(),
        allergies: editAllergies.trim(),
        medicalInfo: editMedical.trim(),
      });
      setEditingChild(null);
    } catch (err: any) {
      alert(err.message || 'Failed to update child details');
    } finally {
      setSavingEdit(false);
    }
  };

  // Handle adding new real child
  const handleAddChild = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setAddingChild(true);
    try {
      await createChild(newName.trim());
      setNewName('');
      setShowAddModal(false);
    } catch (err: any) {
      alert(err.message || 'Failed to add child');
    } finally {
      setAddingChild(false);
    }
  };

  return (
    <div className="dash-view-container">
      {/* Hidden file input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        style={{ display: 'none' }} 
        accept="image/png, image/jpeg, image/webp"
        onChange={handleFileChange}
      />

      <div className="dash-section-headline-row">
        <div>
          <h2 className="dash-section-h2">Children Under Your Care</h2>
          <p className="dash-card-sub">Real database profiles, medical information, and emergency photos.</p>
        </div>
        <button 
          className="btn-primary" 
          onClick={() => (onOpenActivation ? onOpenActivation() : setShowAddModal(true))}
        >
          <Plus size={16} />
          <span>Add Child</span>
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 250 }}>
          <Loader2 size={36} className="spin" style={{ color: 'var(--brand-purple)' }} />
        </div>
      ) : error ? (
        <div className="dash-card-alert" style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: 20, borderRadius: 16 }}>
          <span style={{ color: '#991b1b' }}>{error}</span>
        </div>
      ) : children.length === 0 ? (
        <div className="tags-empty-state" style={{ background: '#ffffff', borderRadius: 20, padding: 40, textAlign: 'center', border: '1px solid #e7e2f5' }}>
          <ShieldCheck size={40} style={{ color: 'var(--brand-purple)', margin: '0 auto 12px' }} />
          <h3>No Children Added Yet</h3>
          <p style={{ color: '#8d89a5', maxWidth: 400, margin: '0 auto 20px' }}>
            Add your children to link physical smart tags and upload their emergency contact cards.
          </p>
          <button className="btn-primary" onClick={() => setShowAddModal(true)}>
            <Plus size={16} />
            <span>Add First Child</span>
          </button>
        </div>
      ) : (
        <div className="dash-cards-grid-2">
          {children.map((child) => (
            <div key={child.id} className="dash-child-full-card" style={{ background: '#ffffff' }}>
              <div className="dash-child-card-header" style={{ position: 'relative' }}>
                <div style={{ position: 'relative', width: 68, height: 68, flexShrink: 0 }}>
                  {child.photoUrl ? (
                    <img 
                      src={child.photoUrl} 
                      alt={child.name} 
                      style={{ 
                        width: '100%', 
                        height: '100%', 
                        borderRadius: '50%', 
                        objectFit: 'cover', 
                        border: '3px solid #582be8',
                        boxShadow: '0 4px 12px rgba(88, 43, 232, 0.15)'
                      }} 
                    />
                  ) : (
                    <div 
                      className="dash-child-avatar-big" 
                      style={{ 
                        width: '100%', 
                        height: '100%', 
                        borderRadius: '50%',
                        background: '#f4f0ff',
                        color: '#582be8',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.75rem',
                        fontWeight: 700,
                        border: '2px solid #e4d8ff'
                      }}
                    >
                      {child.name.charAt(0).toUpperCase()}
                    </div>
                  )}

                  {/* Upload Camera Pill */}
                  <button 
                    type="button"
                    onClick={() => handleOpenPhotoPicker(child.id)}
                    title="Upload or change child photo"
                    style={{
                      position: 'absolute',
                      bottom: -2,
                      right: -2,
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      background: '#582be8',
                      color: '#ffffff',
                      border: '2px solid #ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                    }}
                  >
                    {uploadingId === child.id ? (
                      <Loader2 size={13} className="spin" />
                    ) : successId === child.id ? (
                      <CheckCircle2 size={13} style={{ color: '#86efac' }} />
                    ) : (
                      <Camera size={13} />
                    )}
                  </button>
                </div>

                <div style={{ marginLeft: 16, flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <h3 className="dash-child-name" style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 4px' }}>
                      {child.name}
                    </h3>
                    <button 
                      type="button"
                      onClick={() => handleOpenEditModal(child)}
                      title="Edit child profile details"
                      style={{
                        background: '#f5f3fc',
                        border: '1px solid #e4d8ff',
                        color: '#582be8',
                        borderRadius: 8,
                        padding: '4px 8px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      <Edit3 size={12} />
                      <span>Edit</span>
                    </button>
                  </div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#f5f3fc', padding: '3px 10px', borderRadius: 99, fontSize: '0.78rem', color: '#582be8', fontWeight: 600 }}>
                    <ShieldCheck size={13} />
                    <span>Database ID: #{child.id}</span>
                  </div>
                </div>
              </div>

              <div className="dash-child-meta-list" style={{ marginTop: 16 }}>
                <div>🏷️ <strong>{child.tags?.length || 0} Linked Tag(s)</strong> {child.tags && child.tags.length > 0 ? `(${child.tags.map((t: any) => t.tagCode).join(', ')})` : ''}</div>
                <div>⚠️ <strong>Allergies:</strong> {child.allergies || 'None recorded'}</div>
                <div>🩺 <strong>Medical:</strong> {child.medicalInfo || 'Standard Emergency Profile'}</div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 18 }}>
                <button 
                  type="button"
                  className="btn-secondary"
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    gap: 6,
                    fontWeight: 600,
                    padding: '10px 12px',
                    fontSize: '0.85rem'
                  }}
                  onClick={() => handleOpenPhotoPicker(child.id)}
                  disabled={uploadingId === child.id}
                >
                  <Camera size={14} />
                  <span>{child.photoUrl ? 'Change Photo' : 'Upload Photo'}</span>
                </button>

                <button 
                  type="button"
                  className="btn-primary"
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    gap: 6,
                    fontWeight: 600,
                    padding: '10px 12px',
                    fontSize: '0.85rem'
                  }}
                  onClick={() => handleOpenEditModal(child)}
                >
                  <Edit3 size={14} />
                  <span>Edit Details</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Child Profile Modal */}
      {editingChild && (
        <div className="modal-overlay" onClick={() => setEditingChild(null)}>
          <div className="modal-content-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480, padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <Heart size={20} style={{ color: '#582be8' }} />
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>Edit Emergency Profile: {editingChild.name}</h3>
            </div>
            
            <form onSubmit={handleSaveEdit}>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 6 }}>Full Name</label>
                <input 
                  type="text" 
                  className="dash-input" 
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #e7e2f5' }}
                  required
                />
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 6 }}>Known Allergies (Emergency Alert)</label>
                <textarea 
                  className="dash-input" 
                  placeholder="e.g. Severe Peanut Allergy (EpiPen required)"
                  value={editAllergies}
                  onChange={(e) => setEditAllergies(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #e7e2f5', minHeight: 70 }}
                />
              </div>

              <div style={{ marginBottom: 18 }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 6 }}>Medical Conditions & Notes</label>
                <textarea 
                  className="dash-input" 
                  placeholder="e.g. Type 1 Diabetes, Asthma inhaler in bag"
                  value={editMedical}
                  onChange={(e) => setEditMedical(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #e7e2f5', minHeight: 70 }}
                />
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button type="button" className="btn-secondary" onClick={() => setEditingChild(null)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={savingEdit}>
                  {savingEdit ? 'Saving...' : 'Save Emergency Details'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Add Child Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 440, padding: 24 }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1.2rem', fontWeight: 700 }}>Add New Child</h3>
            <form onSubmit={handleAddChild}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: 6 }}>Child Name</label>
                <input 
                  type="text" 
                  className="dash-input" 
                  placeholder="e.g. Maya Ahmad"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #e7e2f5' }}
                  required
                />
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={addingChild}>
                  {addingChild ? 'Adding...' : 'Create Child Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
