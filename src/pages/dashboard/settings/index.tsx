import React, { useState, useEffect } from 'react';
import {
  User,
  Shield,
  ShieldCheck,
  KeyRound,
  QrCode,
  Bell,
  PhoneCall,
  Smartphone,
  Lock,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  Loader2,
  Eye,
  EyeOff,
  CreditCard,
  MessageSquare,
  MapPin,
  Siren,
  Mail,
  Sparkles,
  Users,
  Tag,
  ChevronRight,
  ShoppingBag,
  PackageCheck,
  Truck,
  X,
  Minus,
  Plus
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useChildren } from '../../../hooks/useChildren';
import api from '../../../services/api';

type SettingsTab = 'profile' | 'security' | 'alerts' | 'privacy' | 'plan';

export default function SettingsPage() {
  const { user, updateUser, displayName, initials } = useAuth();
  const { children } = useChildren();
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');

  // Profile Form State
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Security & 2FA State
  const [is2FAEnabled, setIs2FAEnabled] = useState(Boolean(user?.isTwoFactorEnabled));
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [secretCode, setSecretCode] = useState<string | null>(null);
  const [twoFACode, setTwoFACode] = useState('');
  const [twoFALoading, setTwoFALoading] = useState(false);
  const [twoFAError, setTwoFAError] = useState<string | null>(null);
  const [copiedSecret, setCopiedSecret] = useState(false);

  // Hardware Store Modal States
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedHardware, setSelectedHardware] = useState<'wristband' | 'backpack' | 'shoe'>('wristband');
  const [selectedColor, setSelectedColor] = useState('Lavender Purple');
  const [quantity, setQuantity] = useState(1);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderLoading, setOrderLoading] = useState(false);
  const [trackingId, setTrackingId] = useState('');
  const [orderToast, setOrderToast] = useState(false);

  // Change Password State
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Alert & Dispatch Preferences
  const [prefs, setPrefs] = useState(() => {
    const saved = localStorage.getItem('kidditag_user_prefs');
    return saved
      ? JSON.parse(saved)
      : {
          instantSms: true,
          whatsappPing: true,
          emailDigest: false,
          sirenSound: true,
          safeProxy: true,
          hideLastName: false,
          requireFinderConfirm: true
        };
  });

  // Sync profile fields from user
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhoneNumber(user.phoneNumber || '');
      setIs2FAEnabled(Boolean(user.isTwoFactorEnabled));
    }
  }, [user]);

  // Save preferences to localStorage
  const handleTogglePref = (key: keyof typeof prefs) => {
    setPrefs((prev: any) => {
      const updated = { ...prev, [key]: !prev[key] };
      localStorage.setItem('kidditag_user_prefs', JSON.stringify(updated));
      return updated;
    });
  };

  // Save Profile Handler
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setProfileSaving(true);
      setProfileError(null);
      setProfileSuccess(false);

      const res = await api.put('/users/me', {
        name: name.trim() || undefined,
        phoneNumber: phoneNumber.trim() || undefined
      });

      const updatedData = res.data?.data || res.data;
      updateUser(updatedData);

      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3500);
    } catch (err: any) {
      setProfileError(err.response?.data?.message || err.message || 'Failed to update profile');
    } finally {
      setProfileSaving(false);
    }
  };

  // Generate 2FA Secret
  const handleStart2FASetup = async () => {
    try {
      setTwoFALoading(true);
      setTwoFAError(null);
      const res = await api.post('/auth/2fa/generate');
      const payload = res.data?.data || res.data;
      setQrCodeUrl(payload.qrCodeUrl);
      setSecretCode(payload.secret);
      setShow2FAModal(true);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to initialize 2FA generator');
    } finally {
      setTwoFALoading(false);
    }
  };

  // Verify and activate 2FA
  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!twoFACode || twoFACode.length < 6) {
      setTwoFAError('Please enter a valid 6-digit verification code');
      return;
    }
    try {
      setTwoFALoading(true);
      setTwoFAError(null);
      await api.post('/auth/2fa/verify-setup', { code: twoFACode.trim() });
      setIs2FAEnabled(true);
      updateUser({ isTwoFactorEnabled: true });
      setShow2FAModal(false);
      setTwoFACode('');
      alert('Two-Factor Authentication is now actively protecting your account! 🛡️');
    } catch (err: any) {
      setTwoFAError(err.response?.data?.message || 'Invalid verification code. Please check your authenticator app.');
    } finally {
      setTwoFALoading(false);
    }
  };

  // Disable 2FA
  const handleDisable2FA = async () => {
    if (!window.confirm('Are you sure you want to disable Two-Factor Authentication? Your account will be less secure.')) {
      return;
    }
    try {
      setTwoFALoading(true);
      await api.post('/auth/2fa/disable');
      setIs2FAEnabled(false);
      updateUser({ isTwoFactorEnabled: false });
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to disable 2FA');
    } finally {
      setTwoFALoading(false);
    }
  };

  // Change Password Handler
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    try {
      setPasswordLoading(true);
      setPasswordError(null);
      setPasswordSuccess(false);

      await api.post('/auth/change-password', {
        oldPassword,
        newPassword
      });

      setPasswordSuccess(true);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(false), 4000);
    } catch (err: any) {
      setPasswordError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleCopySecret = () => {
    if (!secretCode) return;
    navigator.clipboard.writeText(secretCode);
    setCopiedSecret(true);
    setTimeout(() => setCopiedSecret(false), 2500);
  };

  return (
    <div className="dash-view-container" style={{ maxWidth: '1040px', margin: '0 auto', paddingBottom: '60px' }}>
      
      {/* ── Top Header with Subtle Glow Banner ── */}
      <div style={{
        background: 'linear-gradient(135deg, #ffffff 0%, #fbfaff 100%)',
        border: '1.5px solid #ede9fe',
        borderRadius: '22px',
        padding: '24px 28px',
        marginBottom: '26px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        boxShadow: '0 8px 30px rgba(88, 43, 232, 0.04)'
      }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#f4f0ff', color: '#582be8', padding: '4px 10px', borderRadius: '999px', fontSize: '0.74rem', fontWeight: 800, marginBottom: '8px' }}>
            <Sparkles size={13} />
            <span>CAREGIVER CONTROL PANEL</span>
          </div>
          <h1 style={{ fontSize: '1.55rem', fontWeight: 800, color: '#140d3a', margin: '0 0 6px', letterSpacing: '-0.3px' }}>
            Safety & Privacy Hub
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.88rem', margin: 0 }}>
            Configure account credentials, two-factor authentication, and safe proxy communication rules.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: is2FAEnabled ? '#f0fdf4' : '#fffbeb',
            border: is2FAEnabled ? '1.5px solid #bbf7d0' : '1.5px solid #fde68a',
            padding: '8px 14px',
            borderRadius: '12px',
            fontSize: '0.8rem',
            fontWeight: 700,
            color: is2FAEnabled ? '#15803d' : '#b45309'
          }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: is2FAEnabled ? '#16a34a' : '#d97706',
              boxShadow: is2FAEnabled ? '0 0 0 3px rgba(34, 197, 94, 0.2)' : '0 0 0 3px rgba(217, 119, 6, 0.2)'
            }} />
            <span>{is2FAEnabled ? '2FA Shield Active' : 'Basic Security Mode'}</span>
          </div>
        </div>
      </div>

      {/* ── Modern Floating Segmented Tabs ── */}
      <div style={{
        background: '#ffffff',
        border: '1.5px solid #ede9fe',
        borderRadius: '16px',
        padding: '6px',
        marginBottom: '26px',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        boxShadow: '0 4px 16px rgba(20, 13, 58, 0.03)',
        overflowX: 'auto'
      }}>
        {[
          { id: 'profile', label: 'Guardian Profile', icon: User },
          { id: 'security', label: 'Security & 2FA', icon: ShieldCheck },
          { id: 'alerts', label: 'Alert Preferences', icon: Bell },
          { id: 'privacy', label: 'Privacy & Safe Proxy', icon: Lock },
          { id: 'plan', label: 'Family Membership', icon: CreditCard }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as SettingsTab)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 18px',
                borderRadius: '12px',
                background: isActive ? '#582be8' : 'transparent',
                color: isActive ? '#ffffff' : '#64748b',
                fontWeight: isActive ? 700 : 600,
                fontSize: '0.86rem',
                border: 'none',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: isActive ? '0 4px 12px rgba(88, 43, 232, 0.28)' : 'none'
              }}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── TAB 1: GUARDIAN PROFILE ────────────────────────────────────────── */}
      {activeTab === 'profile' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 320px', gap: '24px' }}>
          
          {/* Main Edit Form Card */}
          <div style={{
            background: '#ffffff',
            borderRadius: '20px',
            padding: '28px',
            border: '1.5px solid #ede9fe',
            boxShadow: '0 8px 24px rgba(88, 43, 232, 0.04)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#f4f0ff', color: '#582be8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <User size={18} />
              </div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#140d3a', margin: 0 }}>
                Caregiver Credentials
              </h2>
            </div>
            <p style={{ fontSize: '0.84rem', color: '#64748b', margin: '0 0 22px' }}>
              Your verified contact information is presented to finders when they scan child wristbands.
            </p>

            {profileSuccess && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: '#f0fdf4',
                border: '1.5px solid #bbf7d0',
                color: '#15803d',
                padding: '11px 16px',
                borderRadius: '12px',
                marginBottom: '20px',
                fontSize: '0.86rem',
                fontWeight: 600
              }}>
                <CheckCircle2 size={18} />
                <span>Guardian details updated securely in cloud database!</span>
              </div>
            )}

            {profileError && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: '#fef2f2',
                border: '1.5px solid #fecaca',
                color: '#b91c1c',
                padding: '11px 16px',
                borderRadius: '12px',
                marginBottom: '20px',
                fontSize: '0.86rem'
              }}>
                <AlertTriangle size={18} />
                <span>{profileError}</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#1e293b', marginBottom: '8px' }}>
                  Full Name / Primary Guardian
                </label>
                <div style={{ position: 'relative' }}>
                  <User size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Sarah Sinclair"
                    style={{
                      width: '100%',
                      padding: '11px 14px 11px 40px',
                      borderRadius: '12px',
                      border: '1.5px solid #e2e8f0',
                      background: '#fcfbfe',
                      fontSize: '0.92rem',
                      outline: 'none',
                      boxSizing: 'border-box',
                      transition: 'all 0.15s ease'
                    }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = '#582be8'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(88, 43, 232, 0.1)'; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = 'none'; }}
                  />
                </div>
                <span style={{ fontSize: '0.74rem', color: '#94a3b8', marginTop: '4px', display: 'block' }}>
                  Shown prominently on the green "Call Guardian Now" button.
                </span>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#1e293b', marginBottom: '8px' }}>
                  Primary Emergency Phone
                </label>
                <div style={{ position: 'relative' }}>
                  <PhoneCall size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="e.g. +970599123456"
                    style={{
                      width: '100%',
                      padding: '11px 14px 11px 40px',
                      borderRadius: '12px',
                      border: '1.5px solid #e2e8f0',
                      background: '#fcfbfe',
                      fontSize: '0.92rem',
                      outline: 'none',
                      boxSizing: 'border-box',
                      transition: 'all 0.15s ease'
                    }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = '#582be8'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(88, 43, 232, 0.1)'; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = 'none'; }}
                  />
                </div>
                <span style={{ fontSize: '0.74rem', color: '#94a3b8', marginTop: '4px', display: 'block' }}>
                  Dialed immediately with one tap when a finder scans the physical tag.
                </span>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#1e293b', marginBottom: '8px' }}>
                  Account Identifier / Email
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input
                    type="email"
                    value={user?.email || user?.userName || ''}
                    disabled
                    style={{
                      width: '100%',
                      padding: '11px 14px 11px 40px',
                      borderRadius: '12px',
                      border: '1.5px solid #e2e8f0',
                      background: '#f8fafc',
                      color: '#64748b',
                      fontSize: '0.92rem',
                      boxSizing: 'border-box',
                      cursor: 'not-allowed'
                    }}
                  />
                </div>
                <span style={{ fontSize: '0.74rem', color: '#94a3b8', marginTop: '4px', display: 'block' }}>
                  Linked to your caregiver authentication profile.
                </span>
              </div>

              <div style={{ paddingTop: '10px', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="submit"
                  disabled={profileSaving}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '11px 24px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #582be8 0%, #4b22ce 100%)',
                    color: '#ffffff',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    cursor: profileSaving ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 14px rgba(88, 43, 232, 0.3)',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {profileSaving ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                  <span>{profileSaving ? 'Saving Changes...' : 'Save Profile Changes'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Right Column: High-Fidelity Guardian Card */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            
            <div style={{
              background: 'linear-gradient(180deg, #ffffff 0%, #faf8ff 100%)',
              border: '1.5px solid #ede9fe',
              borderRadius: '20px',
              padding: '24px 20px',
              textAlign: 'center',
              boxShadow: '0 8px 24px rgba(88, 43, 232, 0.05)'
            }}>
              {/* Avatar with Glow Ring */}
              <div style={{ position: 'relative', width: '74px', height: '74px', margin: '0 auto 14px' }}>
                <div style={{
                  position: 'absolute',
                  inset: '-4px',
                  borderRadius: '50%',
                  border: '2px dashed #c4b5fd',
                  animation: 'spin 12s linear infinite'
                }} />
                <div style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #582be8, #7c3aed)',
                  color: '#ffffff',
                  fontSize: '1.6rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 16px rgba(88, 43, 232, 0.35)'
                }}>
                  {initials}
                </div>
              </div>

              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#140d3a', margin: '0 0 4px' }}>
                {displayName}
              </h3>

              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: '#f4f0ff', border: '1px solid #e4d8ff', color: '#6d28d9', padding: '3px 10px', borderRadius: '999px', fontSize: '0.74rem', fontWeight: 700, marginBottom: '16px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#6d28d9' }} />
                <span>Primary Account Holder</span>
              </div>

              {/* Stats Grid */}
              <div style={{
                background: '#ffffff',
                border: '1px solid #ede9fe',
                borderRadius: '14px',
                padding: '12px 14px',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '8px',
                textAlign: 'center'
              }}>
                <div style={{ borderRight: '1px solid #f1f5f9' }}>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#140d3a' }}>{children.length}</div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>Children Active</div>
                </div>
                <div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0ea76b' }}>100%</div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>Safe Proxy Active</div>
                </div>
              </div>

              <div style={{ marginTop: '14px', borderTop: '1px solid #f1f5f9', paddingTop: '12px', fontSize: '0.76rem', color: '#64748b', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Account ID:</span>
                  <strong style={{ color: '#1e293b' }}>KT-ACC-{user?.accountId || user?.id || 101}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Encrypted Channel:</span>
                  <span style={{ color: '#0ea76b', fontWeight: 700 }}>TLS 1.3 Active</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ── TAB 2: SECURITY & 2FA ────────────────────────────────────────── */}
      {activeTab === 'security' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
          
          {/* Two-Factor Authentication Card with Light Glow */}
          <div style={{
            background: 'linear-gradient(180deg, #ffffff 0%, #fbfaff 100%)',
            border: is2FAEnabled ? '1.5px solid #bbf7d0' : '1.5px solid #ede9fe',
            borderRadius: '20px',
            padding: '28px',
            boxShadow: '0 8px 24px rgba(88, 43, 232, 0.04)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '14px',
                  background: is2FAEnabled ? '#f0fdf4' : '#fff1f2',
                  border: is2FAEnabled ? '2px solid #86efac' : '2px solid #fecdd3',
                  color: is2FAEnabled ? '#15803d' : '#e11d48',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: is2FAEnabled ? '0 4px 12px rgba(22, 163, 74, 0.15)' : 'none'
                }}>
                  <ShieldCheck size={26} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#140d3a', margin: 0 }}>
                      Two-Factor Authentication (2FA)
                    </h3>
                    <span style={{
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: '999px',
                      background: is2FAEnabled ? '#f0fdf4' : '#fff1f2',
                      color: is2FAEnabled ? '#15803d' : '#e11d48',
                      border: is2FAEnabled ? '1px solid #bbf7d0' : '1px solid #fecdd3'
                    }}>
                      {is2FAEnabled ? 'ACTIVE & ENFORCED' : 'PROTECTION OFF'}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
                    TOTP Security via Google Authenticator or Microsoft Authenticator
                  </span>
                </div>
              </div>

              {is2FAEnabled ? (
                <button
                  onClick={handleDisable2FA}
                  disabled={twoFALoading}
                  style={{
                    padding: '9px 18px',
                    borderRadius: '12px',
                    background: '#fff1f2',
                    border: '1.5px solid #fecdd3',
                    color: '#e11d48',
                    fontSize: '0.84rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  Disable 2FA Shield
                </button>
              ) : (
                <button
                  onClick={handleStart2FASetup}
                  disabled={twoFALoading}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 20px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #582be8 0%, #4b22ce 100%)',
                    border: 'none',
                    color: '#ffffff',
                    fontSize: '0.86rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(88, 43, 232, 0.3)'
                  }}
                >
                  {twoFALoading ? <Loader2 size={16} className="animate-spin" /> : <QrCode size={16} />}
                  <span>Enable 2FA Protection</span>
                </button>
              )}
            </div>

            <p style={{ fontSize: '0.84rem', color: '#64748b', lineHeight: 1.55, margin: 0 }}>
              Protects sensitive child health and location data by requiring a 6-digit TOTP code generated on your smartphone every time you sign into the Caregiver Hub.
            </p>
          </div>

          {/* Change Password Card */}
          <div style={{
            background: '#ffffff',
            borderRadius: '20px',
            padding: '28px',
            border: '1.5px solid #ede9fe',
            boxShadow: '0 8px 24px rgba(88, 43, 232, 0.04)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#f4f0ff', color: '#582be8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <KeyRound size={18} />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#140d3a', margin: 0 }}>
                Change Account Password
              </h3>
            </div>
            <p style={{ fontSize: '0.84rem', color: '#64748b', margin: '0 0 20px' }}>
              Ensure your account is protected with a strong, distinct password.
            </p>

            {passwordSuccess && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: '#f0fdf4',
                border: '1.5px solid #bbf7d0',
                color: '#15803d',
                padding: '11px 16px',
                borderRadius: '12px',
                marginBottom: '20px',
                fontSize: '0.86rem',
                fontWeight: 600
              }}>
                <CheckCircle2 size={18} />
                <span>Password changed successfully! Next login will require your new password.</span>
              </div>
            )}

            {passwordError && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: '#fef2f2',
                border: '1.5px solid #fecaca',
                color: '#b91c1c',
                padding: '11px 16px',
                borderRadius: '12px',
                marginBottom: '20px',
                fontSize: '0.86rem'
              }}>
                <AlertTriangle size={18} />
                <span>{passwordError}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '18px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#1e293b', marginBottom: '8px' }}>
                  Current Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showOldPassword ? 'text' : 'password'}
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    required
                    placeholder="Enter current password"
                    style={{
                      width: '100%',
                      padding: '10px 38px 10px 14px',
                      borderRadius: '12px',
                      border: '1.5px solid #e2e8f0',
                      background: '#fcfbfe',
                      fontSize: '0.9rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPassword(!showOldPassword)}
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                  >
                    {showOldPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#1e293b', marginBottom: '8px' }}>
                  New Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    placeholder="Min 6 characters"
                    style={{
                      width: '100%',
                      padding: '10px 38px 10px 14px',
                      borderRadius: '12px',
                      border: '1.5px solid #e2e8f0',
                      background: '#fcfbfe',
                      fontSize: '0.9rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                  >
                    {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#1e293b', marginBottom: '8px' }}>
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Re-type new password"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '12px',
                    border: '1.5px solid #e2e8f0',
                    background: '#fcfbfe',
                    fontSize: '0.9rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', paddingTop: '6px' }}>
                <button
                  type="submit"
                  disabled={passwordLoading}
                  style={{
                    padding: '10px 22px',
                    borderRadius: '12px',
                    background: '#1e1b4b',
                    color: '#ffffff',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    cursor: passwordLoading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 4px 12px rgba(30, 27, 75, 0.25)'
                  }}
                >
                  {passwordLoading && <Loader2 size={15} className="animate-spin" />}
                  <span>Update Password</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── TAB 3: ALERT PREFERENCES ────────────────────────────────────── */}
      {activeTab === 'alerts' && (
        <div style={{
          background: '#ffffff',
          borderRadius: '20px',
          padding: '28px',
          border: '1.5px solid #ede9fe',
          boxShadow: '0 8px 24px rgba(88, 43, 232, 0.04)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#f4f0ff', color: '#582be8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bell size={18} />
            </div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#140d3a', margin: 0 }}>
              Emergency Dispatch & Alert Routing
            </h2>
          </div>
          <p style={{ fontSize: '0.84rem', color: '#64748b', margin: '0 0 24px' }}>
            Choose how you and designated family guardians are notified the instant a child's wristband is scanned.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {[
              {
                id: 'instantSms',
                icon: MessageSquare,
                iconColor: '#2563eb',
                iconBg: '#eff6ff',
                title: 'Instant SMS Broadcast',
                desc: 'Dispatches real-time text message with direct GPS map coordinates to all verified guardians.',
                active: prefs.instantSms
              },
              {
                id: 'whatsappPing',
                icon: MapPin,
                iconColor: '#0ea76b',
                iconBg: '#eaf8f1',
                title: 'WhatsApp Emergency Ping',
                desc: 'Sends a formatted WhatsApp message with child emergency card and location pin.',
                active: prefs.whatsappPing
              },
              {
                id: 'sirenSound',
                icon: Siren,
                iconColor: '#dc2626',
                iconBg: '#fee2e2',
                title: 'Audible Siren on Lost Child Mode',
                desc: 'Plays an audible warning chime inside the dashboard when Lost Child Mode is toggled active.',
                active: prefs.sirenSound
              },
              {
                id: 'emailDigest',
                icon: Mail,
                iconColor: '#582be8',
                iconBg: '#f4f0ff',
                title: 'Daily Safety & Scan Summary',
                desc: 'Sends a consolidated daily email report of scans, location checks, and tag battery diagnostics.',
                active: prefs.emailDigest
              }
            ].map((item) => {
              const ItemIcon = item.icon;
              return (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px 20px',
                    borderRadius: '16px',
                    background: item.active ? 'linear-gradient(135deg, #ffffff 0%, #faf8ff 100%)' : '#ffffff',
                    border: item.active ? '1.5px solid #ddd6fe' : '1.5px solid #f1f5f9',
                    boxShadow: item.active ? '0 4px 16px rgba(88, 43, 232, 0.05)' : 'none',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '12px',
                      background: item.iconBg,
                      color: item.iconColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <ItemIcon size={20} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#1e293b', marginBottom: '2px' }}>
                        {item.title}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{item.desc}</div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleTogglePref(item.id as any)}
                    style={{
                      width: '46px',
                      height: '26px',
                      borderRadius: '999px',
                      background: item.active ? '#582be8' : '#cbd5e1',
                      border: 'none',
                      position: 'relative',
                      cursor: 'pointer',
                      transition: 'background 0.2s ease',
                      flexShrink: 0
                    }}
                  >
                    <span style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      background: '#ffffff',
                      position: 'absolute',
                      top: '3px',
                      left: item.active ? '23px' : '3px',
                      transition: 'left 0.2s ease',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                    }} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── TAB 4: PRIVACY & SAFE PROXY ─────────────────────────────────── */}
      {activeTab === 'privacy' && (
        <div style={{
          background: '#ffffff',
          borderRadius: '20px',
          padding: '28px',
          border: '1.5px solid #ede9fe',
          boxShadow: '0 8px 24px rgba(88, 43, 232, 0.04)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#f4f0ff', color: '#582be8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Lock size={18} />
            </div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#140d3a', margin: 0 }}>
              Privacy Masking & Safe Proxy Controls
            </h2>
          </div>
          <p style={{ fontSize: '0.84rem', color: '#64748b', margin: '0 0 24px' }}>
            Control what random bystanders see when they scan your child's tag before contacting you.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {[
              {
                id: 'safeProxy',
                icon: Shield,
                iconColor: '#0ea76b',
                iconBg: '#eaf8f1',
                title: 'Safe Call Proxy Protection',
                desc: 'Masks your personal cell phone number behind a secure virtual VoIP relay so finders never see your real number.',
                active: prefs.safeProxy
              },
              {
                id: 'hideLastName',
                icon: User,
                iconColor: '#2563eb',
                iconBg: '#eff6ff',
                title: 'Hide Child Surname on Public Scan',
                desc: 'Only displays the child’s first name (e.g. "Maya" instead of "Maya Sinclair") to protect family privacy.',
                active: prefs.hideLastName
              },
              {
                id: 'requireFinderConfirm',
                icon: CheckCircle2,
                iconColor: '#d97706',
                iconBg: '#fffbeb',
                title: 'Require Safety Intent Confirmation',
                desc: 'Requires the finder to tap "I have found this child" before medical and allergy sheets are revealed.',
                active: prefs.requireFinderConfirm
              }
            ].map((item) => {
              const ItemIcon = item.icon;
              return (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px 20px',
                    borderRadius: '16px',
                    background: item.active ? 'linear-gradient(135deg, #ffffff 0%, #faf8ff 100%)' : '#ffffff',
                    border: item.active ? '1.5px solid #bbf7d0' : '1.5px solid #f1f5f9',
                    boxShadow: item.active ? '0 4px 16px rgba(14, 167, 107, 0.05)' : 'none',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '12px',
                      background: item.iconBg,
                      color: item.iconColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <ItemIcon size={20} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#1e293b', marginBottom: '2px' }}>
                        {item.title}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{item.desc}</div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleTogglePref(item.id as any)}
                    style={{
                      width: '46px',
                      height: '26px',
                      borderRadius: '999px',
                      background: item.active ? '#0ea76b' : '#cbd5e1',
                      border: 'none',
                      position: 'relative',
                      cursor: 'pointer',
                      transition: 'background 0.2s ease',
                      flexShrink: 0
                    }}
                  >
                    <span style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      background: '#ffffff',
                      position: 'absolute',
                      top: '3px',
                      left: item.active ? '23px' : '3px',
                      transition: 'left 0.2s ease',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                    }} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── TAB 5: MEMBERSHIP & PLAN ─────────────────────────────────────── */}
      {activeTab === 'plan' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 300px', gap: '24px' }}>
          
          <div style={{
            background: 'linear-gradient(180deg, #ffffff 0%, #faf8ff 100%)',
            border: '1.5px solid #ede9fe',
            borderRadius: '20px',
            padding: '28px',
            boxShadow: '0 8px 24px rgba(88, 43, 232, 0.04)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div>
                <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#582be8', background: '#f4f0ff', padding: '4px 10px', borderRadius: '999px', textTransform: 'uppercase' }}>
                  ACTIVE TIER
                </span>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#140d3a', margin: '10px 0 3px' }}>
                  KiddiTag Family Care Pro
                </h2>
                <span style={{ fontSize: '0.84rem', color: '#64748b' }}>Annual family license • Active on account</span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '1.6rem', fontWeight: 800, color: '#140d3a' }}>
                  $19.99
                </span>
                <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>/yr</span>
              </div>
            </div>

            <div style={{ borderTop: '1px solid #ede9fe', paddingTop: '18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                'Unlimited NFC & QR Tag Scans across all tags',
                'Live GPS Finder Radar with Accuracy & Device Metrics',
                'Critical Medical & Allergy Protocols with Instant First-Aid Guides',
                'Automated Lost Child Mode Emergency Broadcast System',
                'Priority Safe Proxy VoIP Calling Relay'
              ].map((feat) => (
                <div key={feat} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.86rem', color: '#334155' }}>
                  <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#eaf8f1', color: '#0ea76b', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <CheckCircle2 size={14} />
                  </div>
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{
            background: '#ffffff',
            border: '1.5px solid #ede9fe',
            borderRadius: '20px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: '0 8px 24px rgba(88, 43, 232, 0.04)'
          }}>
            <div>
              <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#f4f0ff', color: '#582be8', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
                <Tag size={20} />
              </div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#140d3a', margin: '0 0 6px' }}>Need Extra Wristbands?</h4>
              <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
                Order additional waterproof silicone wristbands, shoe tags, or backpack charms for new siblings.
              </p>
            </div>
            
            <button
              type="button"
              onClick={() => { setShowOrderModal(true); setOrderSuccess(false); }}
              style={{
                marginTop: '20px',
                width: '100%',
                padding: '11px 16px',
                borderRadius: '12px',
                background: '#f4f0ff',
                border: '1.5px solid #e4d8ff',
                color: '#582be8',
                fontSize: '0.86rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                transition: 'all 0.15s ease'
              }}
            >
              <span>Order Tag Hardware</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ── 2FA QR SETUP MODAL ───────────────────────────────────────────── */}
      {show2FAModal && (
        <div className="modal-overlay" onClick={() => setShow2FAModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{
            maxWidth: '440px',
            borderRadius: '24px',
            padding: '28px',
            border: '1.5px solid #ede9fe',
            boxShadow: '0 20px 40px rgba(20, 13, 58, 0.12)'
          }}>
            
            <div style={{ textAlign: 'center', marginBottom: '18px' }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #f4f0ff 0%, #ede9fe 100%)',
                color: '#582be8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 14px',
                boxShadow: '0 4px 14px rgba(88, 43, 232, 0.15)'
              }}>
                <ShieldCheck size={30} />
              </div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#140d3a', margin: '0 0 6px' }}>
                Set Up Two-Factor Auth
              </h2>
              <p style={{ fontSize: '0.84rem', color: '#64748b', margin: 0 }}>
                Scan this QR code with Google Authenticator or Microsoft Authenticator app on your phone.
              </p>
            </div>

            {/* QR Code Frame */}
            {qrCodeUrl && (
              <div style={{
                background: '#ffffff',
                border: '2px solid #ede9fe',
                borderRadius: '20px',
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 18px',
                maxWidth: '200px',
                boxShadow: '0 4px 16px rgba(88, 43, 232, 0.06)'
              }}>
                <img src={qrCodeUrl} alt="2FA QR Code" style={{ width: '100%', height: 'auto', display: 'block', borderRadius: '8px' }} />
              </div>
            )}

            {/* Secret Code Manual Entry */}
            {secretCode && (
              <div style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '9px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '18px'
              }}>
                <div>
                  <span style={{ fontSize: '0.68rem', color: '#94a3b8', display: 'block', fontWeight: 700 }}>MANUAL SECRET KEY</span>
                  <code style={{ fontSize: '0.82rem', fontWeight: 800, color: '#334155' }}>{secretCode}</code>
                </div>
                <button
                  type="button"
                  onClick={handleCopySecret}
                  style={{
                    background: copiedSecret ? '#f0fdf4' : '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    color: copiedSecret ? '#16a34a' : '#582be8',
                    cursor: 'pointer',
                    padding: '6px 8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.74rem',
                    fontWeight: 700
                  }}
                  title="Copy secret key"
                >
                  {copiedSecret ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copiedSecret ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            )}

            {twoFAError && (
              <div style={{ fontSize: '0.82rem', color: '#b91c1c', background: '#fef2f2', padding: '9px 14px', borderRadius: '10px', marginBottom: '16px', border: '1.5px solid #fecaca' }}>
                {twoFAError}
              </div>
            )}

            {/* Verification Form */}
            <form onSubmit={handleVerify2FA}>
              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#1e293b', marginBottom: '8px', textAlign: 'center' }}>
                  Enter 6-Digit Authenticator Code:
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={twoFACode}
                  onChange={(e) => setTwoFACode(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  autoFocus
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '14px',
                    border: '2px solid #582be8',
                    background: '#fcfbfe',
                    fontSize: '1.4rem',
                    fontWeight: 800,
                    letterSpacing: '6px',
                    textAlign: 'center',
                    outline: 'none',
                    boxSizing: 'border-box',
                    boxShadow: '0 0 0 4px rgba(88, 43, 232, 0.1)'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShow2FAModal(false)}
                  style={{
                    flex: 1,
                    padding: '11px',
                    borderRadius: '12px',
                    background: '#f1f5f9',
                    border: 'none',
                    color: '#475569',
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={twoFALoading || twoFACode.length < 6}
                  style={{
                    flex: 2,
                    padding: '11px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #582be8 0%, #4b22ce 100%)',
                    border: 'none',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    cursor: (twoFALoading || twoFACode.length < 6) ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    boxShadow: '0 4px 14px rgba(88, 43, 232, 0.35)'
                  }}
                >
                  {twoFALoading && <Loader2 size={16} className="animate-spin" />}
                  <span>Verify & Enable</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    
      {/* ── HARDWARE CATALOG & STORE MODAL ─────────────────────────────── */}
      {showOrderModal && (
        <div className="modal-overlay" onClick={() => setShowOrderModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{
            maxWidth: '560px',
            borderRadius: '24px',
            padding: '28px',
            border: '1.5px solid #ede9fe',
            boxShadow: '0 24px 48px rgba(20, 13, 58, 0.16)',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>

            {orderSuccess ? (
              <div style={{ textAlign: 'center', padding: '30px 10px' }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: '#f0fdf4',
                  border: '2px solid #86efac',
                  color: '#16a34a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  boxShadow: '0 6px 18px rgba(22, 163, 74, 0.2)'
                }}>
                  <PackageCheck size={34} />
                </div>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#140d3a', margin: '0 0 8px' }}>
                  Hardware Request Confirmed!
                </h3>
                <p style={{ fontSize: '0.86rem', color: '#64748b', maxWidth: '380px', margin: '0 auto 20px', lineHeight: 1.5 }}>
                  Your order for <strong>{quantity}x {selectedHardware === 'wristband' ? 'Silicone Safety Wristband' : selectedHardware === 'backpack' ? 'Backpack Charm Tag' : 'Shoe Anchor Tag'}</strong> ({selectedColor}) has been scheduled for priority dispatch.
                </p>
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '10px 16px', display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#334155', fontWeight: 700, marginBottom: '22px' }}>
                  <Truck size={15} style={{ color: '#582be8' }} />
                  <span>Tracking ID: #{trackingId} • Arriving in 2–3 Days</span>
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowOrderModal(false);
                      setOrderToast(true);
                      setTimeout(() => setOrderToast(false), 4000);
                    }}
                    style={{
                      padding: '10px 24px',
                      borderRadius: '12px',
                      background: '#582be8',
                      color: '#ffffff',
                      border: 'none',
                      fontWeight: 700,
                      fontSize: '0.88rem',
                      cursor: 'pointer'
                    }}
                  >
                    Done & Return to Settings
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '46px', height: '46px', borderRadius: '14px', background: '#f4f0ff', color: '#582be8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <ShoppingBag size={24} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#140d3a', margin: '0 0 2px' }}>
                        Order Hardware Tags
                      </h3>
                      <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                        Official IP68 waterproof NFC & Laser QR safety wearables
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowOrderModal(false)}
                    style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* 1. Device Type Selector */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#1e293b', marginBottom: '10px' }}>
                    1. Select Wearable Form Factor:
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                    {[
                      { id: 'wristband', name: 'Silicone Band', price: '$8.99', badge: 'Most Popular', desc: 'Skin-soft & waterproof' },
                      { id: 'backpack', name: 'Backpack Clip', price: '$6.99', badge: 'Durable', desc: 'Metal ring carabiner' },
                      { id: 'shoe', name: 'Shoe Tag', price: '$5.49', badge: 'Active Toddler', desc: 'Lace anchor clip' }
                    ].map((item) => {
                      const isSelected = selectedHardware === item.id;
                      return (
                        <div
                          key={item.id}
                          onClick={() => setSelectedHardware(item.id as any)}
                          style={{
                            padding: '12px',
                            borderRadius: '14px',
                            border: isSelected ? '2px solid #582be8' : '1.5px solid #e2e8f0',
                            background: isSelected ? '#faf8ff' : '#ffffff',
                            cursor: 'pointer',
                            textAlign: 'center',
                            transition: 'all 0.15s ease',
                            position: 'relative'
                          }}
                        >
                          <span style={{ fontSize: '0.66rem', fontWeight: 800, color: '#582be8', background: '#ede9fe', padding: '1px 6px', borderRadius: '4px', display: 'inline-block', marginBottom: '4px' }}>
                            {item.badge}
                          </span>
                          <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#140d3a' }}>{item.name}</div>
                          <div style={{ fontSize: '0.74rem', color: '#64748b', margin: '2px 0 6px' }}>{item.desc}</div>
                          <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0ea76b' }}>{item.price}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Color Choice */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#1e293b', marginBottom: '8px' }}>
                    2. Choose Child Color Theme:
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {[
                      { name: 'Lavender Purple', color: '#582be8' },
                      { name: 'Ocean Sky Blue', color: '#0284c7' },
                      { name: 'Bubblegum Pink', color: '#db2777' },
                      { name: 'Midnight Onyx', color: '#1e293b' }
                    ].map((c) => {
                      const isSelected = selectedColor === c.name;
                      return (
                        <button
                          key={c.name}
                          type="button"
                          onClick={() => setSelectedColor(c.name)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '7px 12px',
                            borderRadius: '10px',
                            border: isSelected ? '2px solid #582be8' : '1.5px solid #e2e8f0',
                            background: isSelected ? '#f4f0ff' : '#ffffff',
                            cursor: 'pointer',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            color: '#334155'
                          }}
                        >
                          <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: c.color }} />
                          <span>{c.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Quantity & Pricing */}
                <div style={{
                  background: '#f8fafc',
                  border: '1px solid #ede9fe',
                  borderRadius: '16px',
                  padding: '14px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '22px'
                }}>
                  <div>
                    <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>Quantity</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
                      <button
                        type="button"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        style={{ width: '28px', height: '28px', borderRadius: '8px', background: '#ffffff', border: '1px solid #cbd5e1', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <Minus size={14} />
                      </button>
                      <strong style={{ fontSize: '1rem', color: '#140d3a', minWidth: '20px', textAlign: 'center' }}>{quantity}</strong>
                      <button
                        type="button"
                        onClick={() => setQuantity(quantity + 1)}
                        style={{ width: '28px', height: '28px', borderRadius: '8px', background: '#ffffff', border: '1px solid #cbd5e1', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>Estimated Total</span>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#140d3a', marginTop: '2px' }}>
                      {'$' + (quantity * (selectedHardware === 'wristband' ? 8.99 : selectedHardware === 'backpack' ? 6.99 : 5.49)).toFixed(2)}
                    </div>
                    <span style={{ fontSize: '0.7rem', color: '#0ea76b', fontWeight: 700 }}>Free Caregiver Shipping</span>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setShowOrderModal(false)}
                    style={{
                      flex: 1,
                      padding: '11px',
                      borderRadius: '12px',
                      background: '#f1f5f9',
                      border: 'none',
                      color: '#475569',
                      fontWeight: 700,
                      fontSize: '0.88rem',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
                      const nums = Math.floor(1000 + Math.random() * 9000);
                      const letter = letters[Math.floor(Math.random() * letters.length)];
                      setTrackingId('KT-HW-' + letter + nums);
                      setOrderLoading(true);
                      setTimeout(() => {
                        setOrderLoading(false);
                        setOrderSuccess(true);
                      }, 2000);
                    }}
                    style={{
                      flex: 2,
                      padding: '11px',
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #582be8 0%, #4b22ce 100%)',
                      border: 'none',
                      color: '#ffffff',
                      fontWeight: 700,
                      fontSize: '0.88rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 14px rgba(88, 43, 232, 0.35)'
                    }}
                  >
                    {orderLoading ? (
                      <>
                        <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                        <span>Processing Order...</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag size={16} />
                        <span>Confirm Hardware Order</span>
                      </>
                    )}
                  </button>
                </div>
              </>
            )}

          </div>
        </div>
      )}

      {/* ✅ ORDER SUCCESS TOAST */}
      {orderToast && (
        <div style={{
          position: 'fixed',
          bottom: '28px',
          right: '28px',
          background: '#0f172a',
          color: '#ffffff',
          padding: '14px 20px',
          borderRadius: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          boxShadow: '0 8px 30px rgba(0,0,0,0.25)',
          zIndex: 9999,
          fontSize: '0.88rem',
          fontWeight: 600,
          animation: 'slideInToast 0.35s ease'
        }}>
          <PackageCheck size={18} style={{ color: '#4ade80' }} />
          <div>
            <div style={{ fontWeight: 800 }}>Order Placed Successfully!</div>
            <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '2px' }}>Tracking ID: #{trackingId} • Check your email for details</div>
          </div>
        </div>
      )}

      <style>{'`@keyframes slideInToast { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } } @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`'}</style>

</div>
  );
}
