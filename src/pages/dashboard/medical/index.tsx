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
  PhoneCall,
  Sparkles,
  Zap,
  ExternalLink,
  ShieldAlert,
  Wifi,
  Battery
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
const LANGUAGE_PRESETS = ['Arabic & English', 'Arabic Only', 'English Only', 'Arabic, English & French', 'Spanish & English', 'Non-verbal / Sign Language'];

const SEVERITY_LEVELS = [
  { id: 'HIGH', label: 'Severe / Anaphylaxis Risk', color: '#dc2626', bg: '#fef2f2', border: '#fca5a5' },
  { id: 'MODERATE', label: 'Moderate (Hives / Swelling)', color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
  { id: 'MILD', label: 'Mild / Dietary Sensitivity', color: '#059669', bg: '#f0fdf4', border: '#a7f3d0' },
];

const QUICK_FIRST_AID_TEMPLATES = [
  'Carry EpiPen Jr. in front backpack pocket',
  'Ventolin inhaler: 2 puffs if breathing is strained',
  'Fast-acting glucose/juice for low blood sugar',
  'Wears official MedicAlert identification bracelet',
  'Non-verbal under extreme stress - please speak gently'
];

export default function MedicalPage() {
  const { children, loading: childrenLoading, updateChild, createChild } = useChildren();

  const [selectedChildId, setSelectedChildId] = useState<number | null>(null);

  // Form states
  const [bloodType, setBloodType] = useState('Not Specified');
  const [languages, setLanguages] = useState('Arabic & English');
  const [allergySeverity, setAllergySeverity] = useState('HIGH');
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
      const rawAllergies = selectedChild.allergies || '';
      
      // Check if severity prefix was saved
      if (rawAllergies.includes('[Critical: Anaphylaxis]')) {
        setAllergySeverity('HIGH');
        setAllergies(rawAllergies.replace('[Critical: Anaphylaxis]', '').trim());
      } else if (rawAllergies.includes('[Moderate]')) {
        setAllergySeverity('MODERATE');
        setAllergies(rawAllergies.replace('[Moderate]', '').trim());
      } else if (rawAllergies.includes('[Mild]')) {
        setAllergySeverity('MILD');
        setAllergies(rawAllergies.replace('[Mild]', '').trim());
      } else {
        setAllergies(rawAllergies);
      }

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

      // Try to extract Languages if formatted
      const langMatch = rawMedical.match(/Languages?:\s*([^\n\r]+)/i);
      if (langMatch) {
        setLanguages(langMatch[1].trim());
      } else {
        setLanguages('Arabic & English');
      }

      // Remaining text is instructions
      let cleanInstructions = rawMedical
        .replace(/Blood Type:?\s*(AB[+-]|[ABO][+-])[,;\s]*/i, '')
        .replace(/Conditions:\s*[^\n\r]+[\n\r]*/i, '')
        .replace(/Languages?:\s*[^\n\r]+[\n\r]*/i, '')
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

  // Readiness Score Calculation
  const hasBloodType = bloodType && bloodType !== 'Not Specified';
  const hasLanguages = Boolean(languages && languages.trim());
  const hasAllergies = allergies.trim().length > 0;
  const hasConditions = conditions.trim().length > 0;
  const hasInstructions = emergencyInstructions.trim().length > 0;

  const scoreItems = [
    { label: 'Blood Type', ready: hasBloodType, weight: 25 },
    { label: 'Allergies Info', ready: hasAllergies, weight: 25 },
    { label: 'Conditions', ready: hasConditions, weight: 25 },
    { label: 'First-Aid Action', ready: hasInstructions, weight: 25 }
  ];
  const readinessScore = scoreItems.reduce((acc, curr) => acc + (curr.ready ? curr.weight : 0), 0);
  const missingItems = scoreItems.filter(i => !i.ready).map(i => i.label);

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

  // Add Quick First Aid Template
  const handleAddQuickTemplate = (template: string) => {
    if (!emergencyInstructions.includes(template)) {
      setEmergencyInstructions(prev => prev.trim() ? `${prev.trim()}\n${template}` : template);
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
    if (languages.trim()) {
      parts.push(`Languages: ${languages.trim()}`);
    }
    if (emergencyInstructions.trim()) {
      parts.push(emergencyInstructions.trim());
    }
    return parts.join('\n');
  };

  // Build compiled allergies string
  const compileAllergies = () => {
    if (!allergies.trim()) return '';
    const prefix = allergySeverity === 'HIGH' ? '[Critical: Anaphylaxis] ' : allergySeverity === 'MODERATE' ? '[Moderate] ' : '[Mild] ';
    return `${prefix}${allergies.trim()}`;
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
      const compiledAllergiesStr = compileAllergies();

      await updateChild(selectedChild.id, {
        allergies: compiledAllergiesStr,
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
          <button 
            type="button" 
            onClick={() => setShowAddChildModal(true)} 
            className="btn-primary" 
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
          >
            <Plus size={16} />
            <span>Add Child Profile</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dash-view-container" style={{ maxWidth: '1240px', margin: '0 auto' }}>
      
      {/* Top Banner Notice with Readiness Progress */}
      <div style={{
        background: 'linear-gradient(135deg, #ffffff 0%, #faf8ff 100%)',
        border: '1px solid #e7e2f5',
        borderRadius: '20px',
        padding: '20px 24px',
        marginBottom: '24px',
        boxShadow: '0 4px 20px rgba(88, 43, 232, 0.05)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: readinessScore === 100 ? '#ecfdf5' : '#ede9fe',
              color: readinessScore === 100 ? '#059669' : '#582be8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              {readinessScore === 100 ? <ShieldCheck size={24} /> : <ShieldAlert size={24} />}
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1a1438', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>Emergency Health & Safety Protocol</span>
                {readinessScore === 100 && (
                  <span style={{ fontSize: '0.72rem', background: '#dcfce7', color: '#15803d', fontWeight: 800, padding: '2px 8px', borderRadius: '12px' }}>
                    100% READY
                  </span>
                )}
              </h3>
              <p style={{ fontSize: '0.84rem', color: '#6e6893', margin: '3px 0 0', lineHeight: 1.4 }}>
                Instant medical telemetry broadcasted to first responders and finders during a smart tag scan.
              </p>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: readinessScore === 100 ? '#059669' : '#582be8' }}>
              Safety Readiness: {readinessScore}%
            </span>
            <div style={{
              width: '180px',
              height: '8px',
              background: '#e2e8f0',
              borderRadius: '10px',
              overflow: 'hidden',
              marginTop: '6px'
            }}>
              <div style={{
                width: `${readinessScore}%`,
                height: '100%',
                background: readinessScore === 100 ? 'linear-gradient(90deg, #10b981, #059669)' : 'linear-gradient(90deg, #7c3aed, #582be8)',
                borderRadius: '10px',
                transition: 'width 0.4s ease'
              }} />
            </div>
            {missingItems.length > 0 && (
              <span style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', marginTop: '4px' }}>
                Remaining: {missingItems.join(', ')}
              </span>
            )}
          </div>
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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '24px' }}>
        
        {/* Medical Form */}
        <div className="dash-card" style={{ background: '#ffffff', borderRadius: '20px', padding: '26px', border: '1px solid #e9e8f2', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '22px' }}>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1a1438', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Activity size={20} style={{ color: '#582be8' }} />
                <span>{selectedChild?.name}'s Health File</span>
              </h2>
              <p style={{ fontSize: '0.82rem', color: '#6e6893', margin: '4px 0 0' }}>
                Changes save securely to cloud database and sync immediately to QR & NFC tag scans.
              </p>
            </div>
            <span style={{
              background: '#f0fdf4',
              color: '#15803d',
              border: '1px solid #bbf7d0',
              padding: '5px 12px',
              borderRadius: '20px',
              fontSize: '0.75rem',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <ShieldCheck size={13} />
              <span>Verified Protected</span>
            </span>
          </div>

          <form onSubmit={handleSaveMedical}>
            
            {/* Blood Type Selection */}
            <div style={{ marginBottom: '22px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <label style={{ fontSize: '0.86rem', fontWeight: 700, color: '#1a1438' }}>
                  Blood Type
                </label>
                <span style={{ fontSize: '0.74rem', color: '#94a3b8' }}>Vital for emergency transfusion</span>
              </div>
              
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
                        minWidth: type === 'Not Specified' ? 'auto' : '44px',
                        borderRadius: '8px',
                        border: isChecked ? '1.5px solid #e11d48' : '1px solid #e2e8f0',
                        background: isChecked ? '#fff1f2' : '#f8fafc',
                        color: isChecked ? '#be123c' : '#475569',
                        fontWeight: isChecked ? 800 : 600,
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

            {/* Spoken Languages Section */}
            <div style={{ marginBottom: '22px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <label style={{ fontSize: '0.86rem', fontWeight: 700, color: '#1a1438' }}>
                  Spoken Languages
                </label>
                <span style={{ fontSize: '0.74rem', color: '#6366f1', fontWeight: 600 }}>Emergency Communication</span>
              </div>
              
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
                {LANGUAGE_PRESETS.map(preset => {
                  const isChecked = languages.toLowerCase() === preset.toLowerCase();
                  return (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setLanguages(preset)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '8px',
                        border: isChecked ? '1.5px solid #582be8' : '1px solid #e2e8f0',
                        background: isChecked ? '#f4f0ff' : '#f8fafc',
                        color: isChecked ? '#582be8' : '#475569',
                        fontWeight: isChecked ? 800 : 600,
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {preset}
                    </button>
                  );
                })}
              </div>

              <input
                type="text"
                value={languages}
                onChange={(e) => setLanguages(e.target.value)}
                placeholder="e.g. Arabic & English, German, Non-verbal"
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.86rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Known Allergies & Severity Level */}
            <div style={{ marginBottom: '22px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label style={{ fontSize: '0.86rem', fontWeight: 700, color: '#1a1438' }}>
                  Known Allergies & Triggers
                </label>
                <span style={{ fontSize: '0.74rem', color: '#c2410c', fontWeight: 600 }}>Click tags to add quickly</span>
              </div>

              {/* Allergy Severity Selector */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                {SEVERITY_LEVELS.map(sev => {
                  const isSelected = allergySeverity === sev.id;
                  return (
                    <button
                      key={sev.id}
                      type="button"
                      onClick={() => setAllergySeverity(sev.id)}
                      style={{
                        flex: 1,
                        padding: '6px 8px',
                        borderRadius: '8px',
                        border: `1.5px solid ${isSelected ? sev.color : '#e2e8f0'}`,
                        background: isSelected ? sev.bg : '#ffffff',
                        color: isSelected ? sev.color : '#64748b',
                        fontSize: '0.72rem',
                        fontWeight: isSelected ? 800 : 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: sev.color, flexShrink: 0 }} />
                      <span>{sev.label}</span>
                    </button>
                  );
                })}
              </div>
              
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
                      padding: '4px 9px',
                      fontSize: '0.74rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      transition: 'all 0.1s ease'
                    }}
                  >
                    <Plus size={11} />
                    <span>{allergy}</span>
                  </button>
                ))}
              </div>

              <input
                type="text"
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
                placeholder="e.g. Severe Peanuts, Tree Nuts, Bee stings"
                style={{
                  width: '100%',
                  padding: '11px 14px',
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
            <div style={{ marginBottom: '22px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label style={{ fontSize: '0.86rem', fontWeight: 700, color: '#1a1438' }}>
                  Chronic Medical Diagnoses
                </label>
                <span style={{ fontSize: '0.74rem', color: '#1d4ed8', fontWeight: 600 }}>Click diagnosis tags</span>
              </div>
              
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
                      padding: '4px 9px',
                      fontSize: '0.74rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Plus size={11} />
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
                  padding: '11px 14px',
                  borderRadius: '10px',
                  border: '1.5px solid #e2e8f0',
                  fontSize: '0.88rem',
                  outline: 'none',
                  color: '#1a1438',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Emergency Action & Medication Instructions with Quick Chips */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label style={{ fontSize: '0.86rem', fontWeight: 700, color: '#1a1438' }}>
                  Emergency Action & Medication Instructions
                </label>
                <span style={{ fontSize: '0.74rem', color: '#7c3aed', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <Sparkles size={12} />
                  <span>Quick Templates</span>
                </span>
              </div>

              {/* Quick Template Chips */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
                {QUICK_FIRST_AID_TEMPLATES.map(tpl => (
                  <button
                    key={tpl}
                    type="button"
                    onClick={() => handleAddQuickTemplate(tpl)}
                    style={{
                      background: '#faf5ff',
                      border: '1px solid #e9d5ff',
                      color: '#6b21a8',
                      borderRadius: '6px',
                      padding: '4px 9px',
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <span>{tpl}</span>
                  </button>
                ))}
              </div>

              <textarea
                value={emergencyInstructions}
                onChange={(e) => setEmergencyInstructions(e.target.value)}
                rows={4}
                placeholder="Specific instructions for first responders (e.g. location of inhaler/EpiPen in backpack, specific doses, pediatrician info)..."
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
                padding: '12px 16px',
                borderRadius: '10px',
                fontSize: '0.86rem',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '18px',
                animation: 'fadeIn 0.2s ease'
              }}>
                <CheckCircle2 size={18} />
                <span>Medical protocol saved successfully to PostgreSQL database and synced to tag scans!</span>
              </div>
            )}

            {saveError && (
              <div style={{
                background: '#fef2f2',
                color: '#b91c1c',
                border: '1px solid #fecaca',
                padding: '12px 16px',
                borderRadius: '10px',
                fontSize: '0.86rem',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '18px'
              }}>
                <AlertTriangle size={18} />
                <span>{saveError}</span>
              </div>
            )}

            {/* Submit Button */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid #f1f0f7' }}>
              <span style={{ fontSize: '0.8rem', color: '#8d89a5', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Info size={14} />
                <span>Encrypted AES-256 cloud record</span>
              </span>
              <button
                type="submit"
                disabled={isSaving}
                className="btn-primary"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '11px 24px',
                  borderRadius: '12px',
                  fontWeight: 700,
                  fontSize: '0.92rem',
                  boxShadow: '0 4px 14px rgba(88, 43, 232, 0.25)'
                }}
              >
                {isSaving ? (
                  <>
                    <Loader2 size={16} className="spin" />
                    <span>Updating Cloud Record...</span>
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

        {/* Ultra-Realistic Mobile Device Frame (Right Column) */}
        <div>
          <div style={{
            position: 'sticky',
            top: '24px'
          }}>
            <div style={{
              background: '#0f172a',
              borderRadius: '36px',
              padding: '12px',
              boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25), 0 0 0 1px rgba(255,255,255,0.1)'
            }}>
              {/* Phone Inner Screen */}
              <div style={{
                background: '#ffffff',
                borderRadius: '28px',
                padding: '18px 16px',
                overflow: 'hidden'
              }}>
                
                {/* iPhone Status Bar */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', fontSize: '0.72rem', color: '#0f172a', fontWeight: 700, padding: '0 4px' }}>
                  <span>9:41</span>
                  {/* Dynamic Island Pill */}
                  <div style={{ width: '64px', height: '14px', background: '#000000', borderRadius: '10px' }} />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Wifi size={12} />
                    <Battery size={13} />
                  </div>
                </div>

                {/* Finder Header inside preview */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ fontSize: '0.68rem', background: '#fee2e2', color: '#dc2626', fontWeight: 800, padding: '2px 8px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Zap size={10} />
                    <span>EMERGENCY TAG SCAN</span>
                  </span>
                  <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>
                    /scan/KID-***
                  </span>
                </div>

                {/* Child Mini Card */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px', padding: '10px', background: '#f8fafc', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                  {selectedChild?.photoUrl ? (
                    <img 
                      src={selectedChild.photoUrl} 
                      alt={selectedChild.name} 
                      style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover' }} 
                    />
                  ) : (
                    <div style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      background: '#ede9fe',
                      color: '#582be8',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '1.1rem'
                    }}>
                      {selectedChild?.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <div style={{ fontSize: '0.96rem', fontWeight: 800, color: '#0f172a' }}>{selectedChild?.name}</div>
                    <div style={{ fontSize: '0.72rem', color: '#16a34a', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#16a34a' }} />
                      <span>Smart Safety Wristband Active</span>
                    </div>
                    {languages && (
                      <div style={{
                        marginTop: '4px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        background: '#f4f0ff',
                        color: '#582be8',
                        padding: '2px 7px',
                        borderRadius: '6px',
                        fontSize: '0.68rem',
                        fontWeight: 700
                      }}>
                        <span>Speaks:</span>
                        <span>{languages}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Medical Details Card in Mobile View */}
                <div style={{
                  background: '#ffffff',
                  border: '1.5px solid #fee2e2',
                  borderRadius: '14px',
                  padding: '14px',
                  boxShadow: '0 2px 10px rgba(239, 68, 68, 0.06)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#dc2626', fontWeight: 800, fontSize: '0.84rem' }}>
                      <Heart size={15} style={{ color: '#ef4444' }} />
                      <span>Critical Medical Protocol</span>
                    </div>
                    {bloodType && bloodType !== 'Not Specified' && (
                      <span style={{
                        background: '#dc2626',
                        color: '#ffffff',
                        fontWeight: 800,
                        fontSize: '0.72rem',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        boxShadow: '0 2px 6px rgba(220, 38, 38, 0.25)'
                      }}>
                        {bloodType}
                      </span>
                    )}
                  </div>

                  {/* Allergies Highlight */}
                  <div style={{ padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3px' }}>
                      <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>Known Allergies:</span>
                      <span style={{
                        fontSize: '0.68rem',
                        fontWeight: 800,
                        color: allergySeverity === 'HIGH' ? '#dc2626' : allergySeverity === 'MODERATE' ? '#d97706' : '#059669',
                        background: allergySeverity === 'HIGH' ? '#fef2f2' : allergySeverity === 'MODERATE' ? '#fffbeb' : '#f0fdf4',
                        padding: '1px 6px',
                        borderRadius: '4px'
                      }}>
                        {allergySeverity === 'HIGH' ? 'Critical' : allergySeverity === 'MODERATE' ? 'Moderate' : 'Mild'}
                      </span>
                    </div>
                    <span style={{
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      color: allergies ? '#dc2626' : '#94a3b8',
                      display: 'block'
                    }}>
                      {allergies || 'None reported'}
                    </span>
                  </div>

                  {/* Conditions */}
                  {conditions && (
                    <div style={{ padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                      <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600, display: 'block', marginBottom: '2px' }}>
                        Diagnosed Conditions:
                      </span>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1e40af' }}>
                        {conditions}
                      </span>
                    </div>
                  )}

                  {/* First Aid Instructions */}
                  <div style={{ paddingTop: '8px' }}>
                    <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                      First-Aid & Action Instructions:
                    </span>
                    <div style={{
                      fontSize: '0.76rem',
                      color: emergencyInstructions ? '#1e293b' : '#94a3b8',
                      background: '#f8fafc',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      lineHeight: 1.45,
                      whiteSpace: 'pre-wrap',
                      maxHeight: '90px',
                      overflowY: 'auto'
                    }}>
                      {emergencyInstructions || 'No emergency instructions provided.'}
                    </div>
                  </div>
                </div>

                {/* Emergency Calling Section */}
                <div style={{ marginTop: '12px' }}>
                  <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
                    One-Tap Emergency Calling Available:
                  </span>
                  {contacts.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {contacts.slice(0, 2).map(c => (
                        <div key={c.id} style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '7px 10px',
                          background: '#f0fdf4',
                          border: '1px solid #bbf7d0',
                          borderRadius: '8px',
                          fontSize: '0.76rem'
                        }}>
                          <span style={{ fontWeight: 700, color: '#14532d' }}>{c.name} ({c.relationship})</span>
                          <span style={{ color: '#059669', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <PhoneCall size={12} />
                            <span>Direct Call</span>
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.74rem', color: '#94a3b8', fontStyle: 'italic', padding: '4px 0' }}>
                      No emergency contacts linked.
                    </div>
                  )}
                </div>

                {/* Button to open live test scan */}
                {(() => {
                  const childTagCode = selectedChild?.tags && selectedChild.tags.length > 0
                    ? selectedChild.tags[0].tagCode
                    : null;
                  return childTagCode ? (
                    <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
                      <a
                        href={`/scan/${childTagCode}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          width: '100%',
                          padding: '8px 12px',
                          background: '#582be8',
                          color: '#ffffff',
                          borderRadius: '10px',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          textDecoration: 'none',
                          boxSizing: 'border-box'
                        }}
                      >
                        <ExternalLink size={13} />
                        <span>Open Live Finder Scan View</span>
                      </a>
                    </div>
                  ) : (
                    <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
                      <div
                        title="No tag linked to this child yet"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          width: '100%',
                          padding: '8px 12px',
                          background: '#cbd5e1',
                          color: '#64748b',
                          borderRadius: '10px',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          boxSizing: 'border-box',
                          cursor: 'not-allowed'
                        }}
                      >
                        <ExternalLink size={13} />
                        <span>No Tag Linked Yet</span>
                      </div>
                    </div>
                  );
                })()}

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
