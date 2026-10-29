import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Tag, 
  Clock, 
  ShieldCheck, 
  MapPin, 
  Plus, 
  QrCode, 
  ExternalLink, 
  PhoneCall,
  Loader2,
  HeartPulse,
  Users
} from 'lucide-react';
import { useChildren } from '../../../hooks/useChildren';
import { useTags } from '../../../hooks/useTags';
import { useScans } from '../../../hooks/useScans';
import { useContacts } from '../../../hooks/useContacts';

interface OverviewPageProps {
  onOpenActivation?: () => void;
}

export default function OverviewPage({ onOpenActivation }: OverviewPageProps) {
  const navigate = useNavigate();
  const { children, loading: childrenLoading, updateChild } = useChildren();
  const { tags } = useTags();

  const [selectedChildId, setSelectedChildId] = useState<number | null>(null);

  // Auto-select first child
  useEffect(() => {
    if (children.length > 0 && !selectedChildId) {
      setSelectedChildId(children[0].id);
    }
  }, [children, selectedChildId]);

  const selectedChild = children.find(c => c.id === selectedChildId);

  // Scans and Contacts for selected child
  const { scans, fetchScans } = useScans(selectedChild?.id);
  const { contacts, fetchContacts } = useContacts(selectedChild?.id);

  useEffect(() => {
    if (selectedChild?.id) {
      fetchScans(selectedChild.id);
      fetchContacts(selectedChild.id);
    }
  }, [selectedChild?.id, fetchScans, fetchContacts]);

  // Medical state
  const [medicalNotes, setMedicalNotes] = useState('');
  const [allergiesNotes, setAllergiesNotes] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [savingMedical, setSavingMedical] = useState(false);

  useEffect(() => {
    if (selectedChild) {
      setMedicalNotes(selectedChild.medicalInfo || '');
      setAllergiesNotes(selectedChild.allergies || '');
    }
  }, [selectedChild]);

  const handleSaveMedical = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChild) return;

    try {
      setSavingMedical(true);
      await updateChild(selectedChild.id, {
        medicalInfo: medicalNotes,
        allergies: allergiesNotes,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to update medical details');
    } finally {
      setSavingMedical(false);
    }
  };

  // Filter tags linked to selected child
  const childTags = tags.filter(t => t.childId === selectedChild?.id || (t.child && t.child.id === selectedChild?.id));
  const latestScan = scans.length > 0 ? scans[0] : null;

  if (childrenLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 350, gap: 10, color: 'var(--text-muted)' }}>
        <Loader2 size={24} className="spin" />
        <span>Loading Caregiver Overview...</span>
      </div>
    );
  }

  return (
    <div className="dash-view-container">
      {/* Child Selector Tabs */}
      {children.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
            Viewing overview for child:
          </label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {children.map(child => (
              <button
                key={child.id}
                onClick={() => setSelectedChildId(child.id)}
                style={{
                  padding: '6px 16px',
                  borderRadius: 20,
                  border: '2px solid',
                  borderColor: selectedChildId === child.id ? '#7c3aed' : 'var(--border-light)',
                  background: selectedChildId === child.id ? '#f3effe' : 'transparent',
                  color: selectedChildId === child.id ? '#7c3aed' : 'var(--text-muted)',
                  fontWeight: 600,
                  fontSize: '0.84rem',
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

      {/* 4 Real Metric Cards */}
      <div className="dash-stat-grid">
        <div className="dash-metric-card">
          <div className="dash-metric-header">
            <span className="dash-metric-label">Active Linked Tags</span>
            <Tag size={18} className="dash-metric-icon purple" />
          </div>
          <div className="dash-metric-value">{childTags.length}</div>
          <div className="dash-metric-sub green">✓ Synced to Live Profile</div>
        </div>

        <div className="dash-metric-card">
          <div className="dash-metric-header">
            <span className="dash-metric-label">Total Scans Logged</span>
            <Clock size={18} className="dash-metric-icon blue" />
          </div>
          <div className="dash-metric-value">{scans.length}</div>
          <div className="dash-metric-sub">
            {latestScan ? `Last: ${latestScan.locationName || 'GPS Ping'}` : 'No scans logged yet'}
          </div>
        </div>

        <div className="dash-metric-card">
          <div className="dash-metric-header">
            <span className="dash-metric-label">Emergency Contacts</span>
            <Users size={18} className="dash-metric-icon green" />
          </div>
          <div className="dash-metric-value" style={{ color: 'var(--accent-green)', fontSize: '1.4rem' }}>
            {contacts.length} Registered
          </div>
          <div className="dash-metric-sub">Direct phone reachability</div>
        </div>

        <div className="dash-metric-card">
          <div className="dash-metric-header">
            <span className="dash-metric-label">Medical Safeguard</span>
            <HeartPulse size={18} className="dash-metric-icon violet" />
          </div>
          <div className="dash-metric-value" style={{ fontSize: '1.4rem' }}>
            {selectedChild?.allergies || selectedChild?.medicalInfo ? 'Active' : 'Pending'}
          </div>
          <div className="dash-metric-sub green">Visible upon NFC / QR scan</div>
        </div>
      </div>

      {/* 2-Column Split: Map & Tags (Left) | Medical & Contacts (Right) */}
      <div className="dash-split-grid">
        {/* Left Column */}
        <div className="dash-split-col">
          {/* Map Preview Card */}
          <div className="dash-card">
            <div className="dash-card-header">
              <div>
                <h2 className="dash-card-title">Live Scan Location</h2>
                <p className="dash-card-sub">GPS coordinates sent instantly upon tag scan.</p>
              </div>
              <button 
                className="btn-secondary"
                style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                onClick={() => navigate('/dashboard/map')}
              >
                Full Map View
              </button>
            </div>

            {latestScan ? (
              <div style={{ position: 'relative', borderRadius: 10, overflow: 'hidden', height: 200, background: '#f8fafc', border: '1px solid var(--border-light)' }}>
                <iframe
                  title="Overview Map Preview"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${latestScan.longitude - 0.006}%2C${latestScan.latitude - 0.004}%2C${latestScan.longitude + 0.006}%2C${latestScan.latitude + 0.004}&layer=mapnik&marker=${latestScan.latitude}%2C${latestScan.longitude}`}
                />
                <div style={{ position: 'absolute', bottom: 8, left: 8, background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(4px)', padding: '4px 10px', borderRadius: 6, fontSize: '0.75rem', fontWeight: 600 }}>
                  📍 {latestScan.locationName || 'GPS Location'}
                </div>
              </div>
            ) : (
              <div className="simulated-map-box" style={{ height: 180 }}>
                <div className="map-grid-bg"></div>
                <div className="map-pin-pulse">
                  <div className="map-pin-marker">
                    <MapPin size={18} />
                  </div>
                  <span className="map-label-tag">
                    Radar Active · Waiting for tag scans
                  </span>
                </div>
              </div>
            )}

            <div className="dash-map-footer">
              <div className="dash-map-meta">
                <span>Location: <strong>{latestScan?.locationName || 'No recent scans'}</strong></span>
                {latestScan && <span> • Time: {new Date(latestScan.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>}
              </div>
            </div>
          </div>

          {/* Registered Physical Tags List */}
          <div className="dash-card">
            <div className="dash-card-header">
              <div>
                <h2 className="dash-card-title">Registered Physical Tags</h2>
                <p className="dash-card-sub">Wristbands and badges linked to {selectedChild?.name || 'this child'}.</p>
              </div>
              <button 
                className="btn-primary"
                style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                onClick={() => onOpenActivation?.()}
              >
                <Plus size={14} />
                <span>Add Tag</span>
              </button>
            </div>

            <div className="dash-tag-list">
              {childTags.length === 0 ? (
                <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  No physical tags linked to {selectedChild?.name || 'this child'} yet.
                </div>
              ) : (
                childTags.map((tag) => (
                  <div key={tag.id} className="dash-tag-item">
                    <div className="dash-tag-item-left">
                      <div className="dash-tag-icon-box">
                        <QrCode size={20} />
                      </div>
                      <div>
                        <div className="dash-tag-name-row">
                          <strong>Tag {tag.tagCode}</strong>
                          <span className="badge-save" style={{ fontSize: '0.68rem', padding: '2px 8px' }}>
                            {tag.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <div className="dash-tag-id-sub">
                          Code: <code>{tag.tagCode}</code> · Linked to {selectedChild?.name}
                        </div>
                      </div>
                    </div>

                    <div className="dash-tag-actions">
                      <a 
                        href={`/scan/${tag.tagCode}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-secondary"
                        style={{ padding: '6px 12px', fontSize: '0.78rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}
                      >
                        <ExternalLink size={13} />
                        <span>View Scan</span>
                      </a>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="dash-split-col">
          {/* Medical Condition Alert Card */}
          <div className="dash-card">
            <div className="dash-card-header">
              <div>
                <h2 className="dash-card-title">Vital Medical & Allergy Alert</h2>
                <p className="dash-card-sub">Instantly visible to anyone who scans the tag.</p>
              </div>
            </div>

            <form onSubmit={handleSaveMedical}>
              <div style={{ marginBottom: 10 }}>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                  Known Allergies:
                </label>
                <input
                  type="text"
                  value={allergiesNotes}
                  onChange={(e) => setAllergiesNotes(e.target.value)}
                  placeholder="e.g. Severe Lactose, Peanuts"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1.5px solid var(--border-light)', fontSize: '0.86rem', outline: 'none' }}
                />
              </div>

              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>
                  Medical Conditions & Emergency Instructions:
                </label>
                <textarea 
                  value={medicalNotes}
                  onChange={(e) => setMedicalNotes(e.target.value)}
                  rows={3}
                  placeholder="e.g. Inhaler in backpack, Blood Type O+"
                  className="dash-textarea"
                />
              </div>

              <div className="dash-textarea-footer">
                <span className="dash-saved-indicator">
                  {savedSuccess ? '✓ Saved to child cloud profile!' : '🔒 Real-time emergency protocol'}
                </span>
                <button type="submit" className="btn-primary" style={{ padding: '7px 16px', fontSize: '0.82rem' }} disabled={savingMedical}>
                  {savingMedical ? 'Saving...' : 'Save Protocol'}
                </button>
              </div>
            </form>
          </div>

          {/* Emergency Contacts Card */}
          <div className="dash-card">
            <div className="dash-card-header">
              <div>
                <h2 className="dash-card-title">Emergency Contacts</h2>
                <p className="dash-card-sub">Reachable immediately when tag is scanned.</p>
              </div>
              <button 
                className="btn-secondary"
                style={{ padding: '6px 12px', fontSize: '0.78rem' }}
                onClick={() => navigate('/dashboard/contacts')}
              >
                Manage
              </button>
            </div>

            <div className="dash-contact-list">
              {contacts.length === 0 ? (
                <div style={{ padding: '16px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.84rem' }}>
                  No emergency contacts registered yet.
                </div>
              ) : (
                contacts.slice(0, 3).map((contact) => (
                  <div key={contact.id} className="dash-contact-item">
                    <div>
                      <div className="dash-contact-name-row">
                        <strong>{contact.name}</strong>
                        <span className="dash-priority-pill">{contact.priority}</span>
                      </div>
                      <div className="dash-contact-phone">{contact.relationship} · {contact.phoneNumber}</div>
                    </div>
                    <a 
                      href={`tel:${contact.phoneNumber}`}
                      className="dash-call-test-btn"
                      style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      title="Direct call"
                    >
                      <PhoneCall size={14} />
                    </a>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
