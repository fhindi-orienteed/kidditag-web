import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  AlertTriangle, 
  ShieldCheck, 
  CheckCircle2, 
  Loader2, 
  Activity, 
  Eye, 
  Save, 
  Baby, 
  Plus, 
  Info,
  PhoneCall
} from 'lucide-react';
import { useChildren } from '../../../hooks/useChildren';
import { useContacts } from '../../../hooks/useContacts';

const COMMON_ALLERGIES = [
  'Peanuts',
  'Tree Nuts',
  'Dairy / Lactose',
  'Bee Stings',
  'Penicillin',
  'Eggs',
  'Gluten / Celiac',
  'Soy',
  'Latex',
  'Seafood / Shellfish'
];

const COMMON_CONDITIONS = [
  'Asthma',
  'Type 1 Diabetes',
  'Epilepsy / Seizures',
  'Autism Spectrum',
  'Severe Eczema',
  'G6PD Deficiency',
  'Heart Condition'
];

const BLOOD_TYPES = ['Not Specified', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function MedicalPage() {
  const { children, loading: childrenLoading, updateChild, createChild } = useChildren();

  const [selectedChildId, setSelectedChildId] = useState<number | null>(null);

  // Form states
  const [bloodType, setBloodType] = useState('Not Specified');
  const [allergies, setAllergies] = useState('');
  const [conditions, setConditions] = useState('');
  const [emergencyInstructions, setEmergencyInstructions] = useState('');

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Add child modal states
  const [showAddChildModal, setShowAddChildModal] = useState(false);
  const [newChildName, setNewChildName] = useState('');
  const [isAddingChild, setIsAddingChild] = useState(false);

  const handleCreateChild = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChildName.trim()) return;
    try {
      setIsAddingChild(true);
      const created = await createChild(newChildName.trim());
      setNewChildName('');
      setShowAddChildModal(false);
      if (created?.id) {
        setSelectedChildId(created.id);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to create child profile');
    } finally {
      setIsAddingChild(false);
    }
  };

  // Auto-select first child
  useEffect(() => {
    if (children.length > 0 && !selectedChildId) {
      setSelectedChildId(children[0].id);
    }
  }, [children, selectedChildId]);

  const selectedChild = children.find(c => c.id === selectedChildId);
  const { contacts } = useContacts(selectedChild?.id);

  // Parse existing child data into structured fields
  useEffect(() => {
    if (selectedChild) {
      setAllergies(selectedChild.allergies || '');

      const rawMedical = selectedChild.medicalInfo || '';
      
      // Try to extract Blood Type if formatted (supports "Blood Type: O+", "Blood Type O+,", etc.)
      const bloodMatch = rawMedical.match(/Blood Type:?\s*(AB[+-]|[ABO][+-])/i);
      if (bloodMatch) {
        const matched = bloodMatch[1].toUpperCase();
        if (BLOOD_TYPES.includes(matched)) {
          setBloodType(matched);
        } else {
          setBloodType('Not Specified');
        }
      } else {
        setBloodType('Not Specified');
      }

      // Try to extract Conditions if formatted
      const condMatch = rawMedical.match(/Conditions:\s*([^\n\r]+)/i);
      if (condMatch) {
        setConditions(condMatch[1].trim());
      } else {
        setConditions('');
      }

      // Remaining text is instructions
      let cleanInstructions = rawMedical
        .replace(/Blood Type:?\s*(AB[+-]|[ABO][+-])[,;\s]*/i, '')
        .replace(/Conditions:\s*[^\n\r]+[\n\r]*/i, '')
        .trim();

      // If nothing extracted but rawMedical exists, put it all into instructions
      if (!bloodMatch && !condMatch && rawMedical) {
        cleanInstructions = rawMedical;
      }

      setEmergencyInstructions(cleanInstructions);
      setSaveSuccess(false);
      setSaveError(null);
    }
  }, [selectedChild]);

  // Add allergy tag preset
  const handleAddAllergyTag = (allergy: string) => {
    const list = allergies.split(',').map(s => s.trim()).filter(Boolean);
    if (!list.some(item => item.toLowerCase() === allergy.toLowerCase())) {
      const updated = list.length > 0 ? `${allergies.trim()}, ${allergy}` : allergy;
      setAllergies(updated);
    }
  };

  // Add condition tag preset
  const handleAddConditionTag = (condition: string) => {
    const list = conditions.split(',').map(s => s.trim()).filter(Boolean);
    if (!list.some(item => item.toLowerCase() === condition.toLowerCase())) {
      const updated = list.length > 0 ? `${conditions.trim()}, ${condition}` : condition;
      setConditions(updated);
    }
  };

  // Build compiled medicalInfo string
  const compileMedicalInfo = () => {
    const parts: string[] = [];
    if (bloodType && bloodType !== 'Not Specified') {
      parts.push(`Blood Type: ${bloodType}`);
    }
    if (conditions.trim()) {
      parts.push(`Conditions: ${conditions.trim()}`);
    }
    if (emergencyInstructions.trim()) {
      parts.push(emergencyInstructions.trim());
    }
    return parts.join('\n');
  };

  // Save handler
  const handleSaveMedical = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChild) return;

    try {
      setIsSaving(true);
      setSaveError(null);
      setSaveSuccess(false);

      const compiledMedical = compileMedicalInfo();

      await updateChild(selectedChild.id, {
        allergies: allergies.trim(),
        medicalInfo: compiledMedical
      });

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: any) {
      setSaveError(err.message || 'Failed to update medical details.');
    } finally {
      setIsSaving(false);
    }
  };

  if (childrenLoading) {
    return (
      <div className="dash-view-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '350px' }}>
        <Loader2 className="spin" size={32} style={{ color: '#582be8' }} />
      </div>
    );
  }

  if (children.length === 0) {
    return (
      <div className="dash-view-container">
        <div className="dash-card" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <Baby size={48} style={{ color: '#8d89a5', margin: '0 auto 16px' }} />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1a1438', marginBottom: 8 }}>No Child Profiles Found</h2>
          <p style={{ color: '#6e6893', maxWidth: '440px', margin: '0 auto 20px', fontSize: '0.9rem' }}>
            Please add a child profile first in the Children tab before configuring medical and allergy emergency protocols.
          </p>
          <a href="/dashboard/children" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <Plus size={16} />
            <span>Add Child Profile</span>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="dash-view-container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Top Banner Notice */}
      <div style={{
        background: 'linear-gradient(135deg, #fef2f2 0%, #fff1f2 100%)',
        border: '1px solid #fecdd3',
        borderRadius: '16px',
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '14px',
        marginBottom: '24px'
      }}>
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '10px',
          background: '#fee2e2',
          color: '#e11d48',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          <AlertTriangle size={20} />
        </div>
        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#9f1239', margin: 0, marginBottom: '4px' }}>
            Emergency Life-Saving Protocol
          </h3>
          <p style={{ fontSize: '0.84rem', color: '#be123c', margin: 0, lineHeight: 1.5 }}>
            The information you provide here is displayed immediately to anyone who scans your child's KiddiTag wristband or tag. 
            Ensure allergy triggers, medications (e.g. EpiPen locations), and chronic health conditions are clear and up to date.
          </p>
        </div>
      </div>

      {/* Child Selector Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px', overflowX: 'auto', paddingBottom: '4px' }}>
        <span style={{ fontSize: '0.86rem', fontWeight: 600, color: '#6e6893', marginRight: '6px' }}>Select Child:</span>
        {children.map(child => {
          const isSelected = child.id === selectedChildId;
          return (
            <button
              key={child.id}
              onClick={() => setSelectedChildId(child.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '8px 16px',
                borderRadius: '12px',
                border: isSelected ? '2px solid #582be8' : '1px solid #e0e0ea',
                background: isSelected ? '#582be8' : '#ffffff',
                color: isSelected ? '#ffffff' : '#1a1438',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.88rem',
                transition: 'all 0.15s ease',
                boxShadow: isSelected ? '0 4px 12px rgba(88, 43, 232, 0.2)' : 'none'
              }}
            >
              {child.photoUrl ? (
                <img 
                  src={child.photoUrl} 
                  alt={child.name} 
                  style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover' }} 
                />
              ) : (
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: isSelected ? 'rgba(255,255,255,0.25)' : '#ede9fe',
                  color: isSelected ? '#ffffff' : '#582be8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 700
                }}>
                  {child.name.charAt(0).toUpperCase()}
                </div>
              )}
              <span>{child.name}</span>
            </button>
          );
        })}

        {/* Quick Add Child Button */}
        <button
          type="button"
          onClick={() => setShowAddChildModal(true)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 14px',
            borderRadius: '12px',
            border: '1.5px dashed #c4b5fd',
            background: '#faf5ff',
            color: '#7c3aed',
            fontSize: '0.82rem',
            fontWeight: 600,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            transition: 'all 0.15s ease'
          }}
          title="Add a new child profile"
        >
          <Plus size={14} />
          <span>Add Child</span>
        </button>
      </div>

      {/* Main Grid: Form (Left) & Real-Time Preview (Right) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
        {/* Medical Form */}
        <div className="dash-card" style={{ background: '#ffffff', borderRadius: '16px', padding: '24px', border: '1px solid #e9e8f2' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#1a1438', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Activity size={20} style={{ color: '#582be8' }} />
                <span>{selectedChild?.name}'s Medical File</span>
              </h2>
              <p style={{ fontSize: '0.82rem', color: '#6e6893', margin: '4px 0 0' }}>
                Updates save directly to PostgreSQL database & sync to public tag scans.
              </p>
            </div>
            <span style={{
              background: '#f0fdf4',
              color: '#15803d',
              border: '1px solid #bbf7d0',
              padding: '4px 10px',
              borderRadius: '20px',
              fontSize: '0.75rem',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <ShieldCheck size={12} />
              <span>Active</span>
            </span>
          </div>

          <form onSubmit={handleSaveMedical}>
            {/* Blood Type Selection */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: '#1a1438', marginBottom: '8px' }}>
                Blood Type
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {BLOOD_TYPES.map(type => {
                  const isChecked = bloodType === type;
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setBloodType(type)}
                      style={{
                        padding: type === 'Not Specified' ? '6px 12px' : '6px 10px',
                        minWidth: type === 'Not Specified' ? 'auto' : '42px',
                        borderRadius: '8px',
                        border: isChecked ? '1.5px solid #e11d48' : '1px solid #e2e8f0',
                        background: isChecked ? '#fff1f2' : '#f8fafc',
                        color: isChecked ? '#be123c' : '#475569',
                        fontWeight: isChecked ? 700 : 600,
                        fontSize: '0.82rem',
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {type}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Known Allergies */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: '#1a1438', marginBottom: '4px' }}>
                Known Allergies & Triggers
              </label>
              <p style={{ fontSize: '0.78rem', color: '#6e6893', margin: '0 0 8px' }}>
                Click common tags or type custom allergies below (separated by comma):
              </p>
              
              {/* Preset Allergy Tags */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
                {COMMON_ALLERGIES.map(allergy => (
                  <button
                    key={allergy}
                    type="button"
                    onClick={() => handleAddAllergyTag(allergy)}
                    style={{
                      background: '#fff7ed',
                      border: '1px solid #fed7aa',
                      color: '#c2410c',
                      borderRadius: '6px',
                      padding: '3px 8px',
                      fontSize: '0.74rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '3px'
                    }}
                  >
                    <Plus size={10} />
                    <span>{allergy}</span>
                  </button>
                ))}
              </div>

              <input
                type="text"
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
                placeholder="e.g. Severe Peanuts, Penicillin, Bee stings"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1.5px solid #e2e8f0',
                  fontSize: '0.88rem',
                  outline: 'none',
                  color: '#1a1438',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Chronic Medical Conditions */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: '#1a1438', marginBottom: '4px' }}>
                Chronic Medical Conditions
              </label>
              <p style={{ fontSize: '0.78rem', color: '#6e6893', margin: '0 0 8px' }}>
                Add known medical diagnoses:
              </p>
              
              {/* Preset Conditions Tags */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
                {COMMON_CONDITIONS.map(cond => (
                  <button
                    key={cond}
                    type="button"
                    onClick={() => handleAddConditionTag(cond)}
                    style={{
                      background: '#eff6ff',
                      border: '1px solid #bfdbfe',
                      color: '#1d4ed8',
                      borderRadius: '6px',
                      padding: '3px 8px',
                      fontSize: '0.74rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '3px'
                    }}
                  >
                    <Plus size={10} />
                    <span>{cond}</span>
                  </button>
                ))}
              </div>

              <input
                type="text"
                value={conditions}
                onChange={(e) => setConditions(e.target.value)}
                placeholder="e.g. Asthma, Type 1 Diabetes"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1.5px solid #e2e8f0',
                  fontSize: '0.88rem',
                  outline: 'none',
                  color: '#1a1438',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Emergency Action & Medication Instructions */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: '#1a1438', marginBottom: '4px' }}>
                Emergency Medication & First-Aid Instructions
              </label>
              <p style={{ fontSize: '0.78rem', color: '#6e6893', margin: '0 0 8px' }}>
                Specific steps for first responders (e.g. medication location, inhaler instructions, dosage):
              </p>
              <textarea
                value={emergencyInstructions}
                onChange={(e) => setEmergencyInstructions(e.target.value)}
                rows={4}
                placeholder="e.g. Ventolin inhaler is inside the front zipper pocket of his school backpack. Administer 2 puffs immediately if breathing becomes wheezy."
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  border: '1.5px solid #e2e8f0',
                  fontSize: '0.88rem',
                  outline: 'none',
                  color: '#1a1438',
                  lineHeight: 1.5,
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Status alerts */}
            {saveSuccess && (
              <div style={{
                background: '#f0fdf4',
                color: '#15803d',
                border: '1px solid #bbf7d0',
                padding: '10px 14px',
                borderRadius: '8px',
                fontSize: '0.84rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '16px'
              }}>
                <CheckCircle2 size={16} />
                <span>Medical protocol updated securely in the database and synced to tag scans!</span>
              </div>
            )}

            {saveError && (
              <div style={{
                background: '#fef2f2',
                color: '#b91c1c',
                border: '1px solid #fecaca',
                padding: '10px 14px',
                borderRadius: '8px',
                fontSize: '0.84rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '16px'
              }}>
                <AlertTriangle size={16} />
                <span>{saveError}</span>
              </div>
            )}

            {/* Submit Button */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px solid #f1f0f7' }}>
              <span style={{ fontSize: '0.8rem', color: '#8d89a5', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Info size={14} />
                <span>Encrypted on cloud storage</span>
              </span>
              <button
                type="submit"
                disabled={isSaving}
                className="btn-primary"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 22px',
                  borderRadius: '10px',
                  fontWeight: 600,
                  fontSize: '0.9rem'
                }}
              >
                {isSaving ? (
                  <>
                    <Loader2 size={16} className="spin" />
                    <span>Saving to Database...</span>
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    <span>Save Medical Protocol</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Live Public Scan Simulation Preview (Right Column) */}
        <div>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            padding: '24px',
            border: '1px solid #e9e8f2',
            position: 'sticky',
            top: '24px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Eye size={18} style={{ color: '#582be8' }} />
                <h3 style={{ fontSize: '0.96rem', fontWeight: 700, color: '#1a1438', margin: 0 }}>
                  Live Finder Emergency Preview
                </h3>
              </div>
              <span style={{ fontSize: '0.72rem', background: '#f5f3fc', color: '#582be8', fontWeight: 700, padding: '3px 8px', borderRadius: '12px' }}>
                /scan/KID-***
              </span>
            </div>

            <p style={{ fontSize: '0.8rem', color: '#6e6893', margin: '0 0 16px' }}>
              Here is how first responders and finders will see {selectedChild?.name}'s medical warning card upon scanning:
            </p>

            {/* Mobile Card Mockup */}
            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '16px',
              padding: '18px',
              boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.03)'
            }}>
              {/* Header inside preview */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                {selectedChild?.photoUrl ? (
                  <img 
                    src={selectedChild.photoUrl} 
                    alt={selectedChild.name} 
                    style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover' }} 
                  />
                ) : (
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    background: '#ede9fe',
                    color: '#582be8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '1rem'
                  }}>
                    {selectedChild?.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>{selectedChild?.name}</div>
                  <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Active Safety Tag Attached</div>
                </div>
              </div>

              {/* Emergency Card in Preview */}
              <div style={{
                background: '#ffffff',
                border: '1.5px solid #fee2e2',
                borderRadius: '12px',
                padding: '14px',
                boxShadow: '0 2px 8px rgba(239, 68, 68, 0.05)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#dc2626', fontWeight: 700, fontSize: '0.86rem', marginBottom: '12px' }}>
                  <Heart size={16} style={{ color: '#ef4444' }} />
                  <span>Important Medical Details</span>
                </div>

                {/* Blood Type Badge */}
                {bloodType && bloodType !== 'Not Specified' && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f1f5f9' }}>
                    <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 500 }}>Blood Type</span>
                    <span style={{
                      background: '#fee2e2',
                      color: '#991b1b',
                      fontWeight: 800,
                      fontSize: '0.78rem',
                      padding: '2px 8px',
                      borderRadius: '6px'
                    }}>
                      {bloodType}
                    </span>
                  </div>
                )}

                {/* Allergies in preview */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 500 }}>Allergies</span>
                  <span style={{
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    color: allergies ? '#dc2626' : '#94a3b8',
                    textAlign: 'right',
                    maxWidth: '180px'
                  }}>
                    {allergies || 'None reported'}
                  </span>
                </div>

                {/* Chronic Conditions */}
                {conditions && (
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                    <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 500 }}>Conditions</span>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1e40af', textAlign: 'right', maxWidth: '180px' }}>
                      {conditions}
                    </span>
                  </div>
                )}

                {/* Instructions in preview */}
                <div style={{ paddingTop: '8px' }}>
                  <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                    First-Aid & Action Notes:
                  </span>
                  <div style={{
                    fontSize: '0.78rem',
                    color: emergencyInstructions ? '#334155' : '#94a3b8',
                    background: '#f8fafc',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    lineHeight: 1.4,
                    whiteSpace: 'pre-wrap'
                  }}>
                    {emergencyInstructions || 'No additional medication or instructions specified.'}
                  </div>
                </div>
              </div>

              {/* Contacts preview snippet */}
              <div style={{ marginTop: '12px' }}>
                <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                  Emergency Call Buttons Available to Finder:
                </span>
                {contacts.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {contacts.slice(0, 2).map(c => (
                      <div key={c.id} style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '6px 10px',
                        background: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        fontSize: '0.76rem'
                      }}>
                        <span style={{ fontWeight: 600, color: '#1e293b' }}>{c.name} ({c.relationship})</span>
                        <span style={{ color: '#059669', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <PhoneCall size={12} />
                          <span>Call</span>
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ fontSize: '0.74rem', color: '#94a3b8', fontStyle: 'italic' }}>
                    No contacts linked yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Modal for adding child directly from Medical page */}
      {showAddChildModal && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.5)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}
          onClick={() => setShowAddChildModal(false)}
        >
          <div 
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              padding: '28px',
              width: '100%',
              maxWidth: '440px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: '#ede9fe',
                color: '#582be8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Baby size={20} />
              </div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
                Add New Child Profile
              </h3>
            </div>
            <p style={{ fontSize: '0.84rem', color: '#64748b', margin: '0 0 20px', lineHeight: 1.5 }}>
              Create a child profile to manage their medical protocols and safety tags.
            </p>

            <form onSubmit={handleCreateChild}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: '#1e293b', marginBottom: '6px' }}>
                  Child's Full Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Maya Salmeyeh"
                  value={newChildName}
                  onChange={(e) => setNewChildName(e.target.value)}
                  required
                  autoFocus
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '10px',
                    border: '1.5px solid #e2e8f0',
                    fontSize: '0.9rem',
                    outline: 'none',
                    color: '#0f172a',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowAddChildModal(false)}
                  style={{
                    padding: '10px 18px',
                    borderRadius: '10px',
                    border: '1px solid #e2e8f0',
                    background: '#f8fafc',
                    color: '#64748b',
                    fontWeight: 600,
                    fontSize: '0.86rem',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAddingChild || !newChildName.trim()}
                  className="btn-primary"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 20px',
                    borderRadius: '10px',
                    fontWeight: 600,
                    fontSize: '0.86rem'
                  }}
                >
                  {isAddingChild ? (
                    <>
                      <Loader2 size={16} className="spin" />
                      <span>Creating Profile...</span>
                    </>
                  ) : (
                    <>
                      <Plus size={16} />
                      <span>Add Child</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
