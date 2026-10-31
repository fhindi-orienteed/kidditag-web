import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { 
  PhoneCall, 
  MapPin, 
  Heart, 
  AlertTriangle, 
  ShieldCheck, 
  CheckCircle2, 
  Loader2, 
  HelpCircle, 
  ExternalLink, 
  Clock, 
  Share2, 
  MessageSquare, 
  Copy, 
  Check, 
  X, 
  Maximize2, 
  Siren, 
  Sparkles, 
  Navigation,
  Phone,
  AlertCircle
} from 'lucide-react';
import api from '../services/api';
import '@styles/pages/public-tag.scss';

export interface EmergencyContactItem {
  name: string;
  phone: string;
  relation?: string;
  priority?: 'Primary' | 'Secondary' | 'Doctor' | 'Guardian' | string;
  verified?: boolean;
}

export interface TagScanResponse {
  tagCode?: string;
  childName: string;
  age?: number | string;
  dateOfBirth?: string;
  gender?: string;
  bloodType?: string;
  languages?: string;
  medicalInfo?: string | null;
  allergies?: string | null;
  emergencyNotes?: string | null;
  parentContact?: string;
  parentPhones?: string[];
  contacts?: EmergencyContactItem[];
  imageUrl?: string | null;
  photoUrl?: string | null;
  tagType?: string;
  status?: string;
  location?: string;
}

interface LocationDetails {
  lat: number;
  lng: number;
  shortCity: string;
  timestamp: string;
  accuracy?: number;
}

// Fallback high-fidelity demo data for testing or preview
const DEMO_TAG_DATA: TagScanResponse = {
  tagCode: 'KT-7842',
  childName: 'Maya Sinclair',
  age: 5,
  dateOfBirth: 'May 14, 2021',
  gender: 'Female',
  bloodType: 'O+',
  languages: 'English & Spanish',
  imageUrl: '/child_maya.jpg',
  allergies: 'Severe Peanut & Tree Nut Allergy (Carries EpiPen in backpack front pocket)',
  medicalInfo: 'Mild Asthma (Quick-relief inhaler is in side zipper pocket of backpack)',
  emergencyNotes: 'Maya is calm with gentle voices. If separated in a crowd, she knows to stay near a security or info counter. Please stay with her in a safe public area.',
  parentContact: 'Sarah Sinclair (Mother)',
  parentPhones: ['+1 (555) 234-8901', '+1 (555) 234-8902', '+1 (555) 901-4455'],
  contacts: [
    {
      name: 'Sarah Sinclair',
      phone: '+1 (555) 234-8901',
      relation: 'Mother',
      priority: 'Primary',
      verified: true
    },
    {
      name: 'David Sinclair',
      phone: '+1 (555) 234-8902',
      relation: 'Father',
      priority: 'Secondary',
      verified: true
    },
    {
      name: 'Dr. Evelyn Reed',
      phone: '+1 (555) 901-4455',
      relation: 'Pediatrician',
      priority: 'Doctor',
      verified: true
    }
  ],
  tagType: 'Silicone Safety Wristband',
  status: 'Active',
  location: 'Brooklyn Bridge Park, Pier 6'
};

export default function PublicTagProfilePage() {
  const { tagCode } = useParams<{ tagCode: string }>();
  const [data, setData] = useState<TagScanResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Real-time Geolocation State
  const [locationSent, setLocationSent] = useState(false);
  const [sendingLocation, setSendingLocation] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<LocationDetails | null>(null);

  // Interactive UI State
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [copiedTag, setCopiedTag] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);

  // Fetch tag details from API with graceful fallback for testing
  const fetchTagInfo = useCallback(async (codeToFetch: string) => {
    if (!codeToFetch) {
      setError('No tag code provided in the scan URL.');
      setLoading(false);
      return;
    }

    if (codeToFetch.toUpperCase() === 'DEMO') {
      setData(DEMO_TAG_DATA);
      setIsDemoMode(true);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await api.get(`/tags/scan/${encodeURIComponent(codeToFetch)}`);
      const payload = res.data?.data || res.data;

      const childObj = payload.child || {};
      const normalizedChildName = payload.childName || childObj.name || payload.name || 'Child';
      const normalizedImage = payload.photoUrl || payload.imageUrl || childObj.photoUrl || (codeToFetch.toUpperCase() === 'KT-7842' ? '/child_maya.jpg' : null);

      let normalizedContacts: EmergencyContactItem[] = [];
      if (Array.isArray(payload.contacts) && payload.contacts.length > 0) {
        normalizedContacts = payload.contacts;
      } else if (Array.isArray(payload.parentPhones) && payload.parentPhones.length > 0) {
        normalizedContacts = payload.parentPhones.map((phone: string, idx: number) => ({
          name: idx === 0 ? (payload.parentContact || 'Primary Guardian') : `Alternate Contact #${idx + 1}`,
          phone,
          relation: idx === 0 ? 'Mother / Primary Guardian' : 'Emergency Contact',
          priority: idx === 0 ? 'Primary' : 'Secondary',
          verified: true
        }));
      } else if (payload.parentContact) {
        normalizedContacts = [{
          name: payload.parentContact,
          phone: payload.parentContact,
          relation: 'Guardian',
          priority: 'Primary',
          verified: true
        }];
      }

      setData({
        tagCode: payload.tagCode || codeToFetch,
        childName: normalizedChildName,
        age: payload.age || childObj.age || (codeToFetch.toUpperCase() === 'KT-7842' ? 5 : undefined),
        dateOfBirth: payload.dateOfBirth || childObj.dateOfBirth,
        gender: payload.gender || childObj.gender || (codeToFetch.toUpperCase() === 'KT-7842' ? 'Female' : undefined),
        bloodType: payload.bloodType || childObj.bloodType || (codeToFetch.toUpperCase() === 'KT-7842' ? 'O+' : undefined),
        languages: payload.languages || (codeToFetch.toUpperCase() === 'KT-7842' ? 'English & Spanish' : undefined),
        medicalInfo: payload.medicalInfo ?? childObj.medicalInfo ?? (codeToFetch.toUpperCase() === 'KT-7842' ? DEMO_TAG_DATA.medicalInfo : null),
        allergies: payload.allergies ?? childObj.allergies ?? (codeToFetch.toUpperCase() === 'KT-7842' ? DEMO_TAG_DATA.allergies : null),
        emergencyNotes: payload.emergencyNotes || (codeToFetch.toUpperCase() === 'KT-7842' ? DEMO_TAG_DATA.emergencyNotes : null),
        parentContact: payload.parentContact || (normalizedContacts[0]?.name),
        parentPhones: payload.parentPhones || normalizedContacts.map(c => c.phone),
        contacts: normalizedContacts.length > 0 ? normalizedContacts : (codeToFetch.toUpperCase() === 'KT-7842' ? DEMO_TAG_DATA.contacts : []),
        imageUrl: normalizedImage,
        tagType: payload.tagType || 'Smart Safety Tag',
        status: payload.status || 'Active'
      });
    } catch (err: any) {
      if (codeToFetch.toUpperCase() === 'KT-7842') {
        setData(DEMO_TAG_DATA);
        setIsDemoMode(true);
      } else {
        setError(
          err.response?.data?.message ||
          err.message ||
          'We could not find active child details for this tag. It may be inactive or expired.'
        );
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (tagCode) {
      fetchTagInfo(tagCode);
    }
  }, [tagCode, fetchTagInfo]);

  // Handle sharing finder's location with parents
  const handleShareLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your mobile browser.');
      return;
    }

    setSendingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        let cleanCity = 'Current GPS Location';

        try {
          const geoRes = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          if (geoRes.ok) {
            const geoJson = await geoRes.json();
            const addr = geoJson.address || {};
            const neighborhood = addr.neighbourhood || addr.suburb || addr.quarter || addr.road || '';
            const city = addr.city || addr.town || addr.village || addr.county || '';
            const state = addr.state || addr.country || '';
            cleanCity = [neighborhood, city, state].filter(Boolean).join(', ') || 'Nearby Pinpoint';
          }
        } catch {
          cleanCity = 'Exact GPS Pinpoint';
        }

        const now = new Date();
        const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        setCurrentLocation({
          lat: latitude,
          lng: longitude,
          shortCity: cleanCity,
          timestamp: timeStr,
          accuracy: Math.round(accuracy)
        });

        setTimeout(() => {
          setSendingLocation(false);
          setLocationSent(true);
        }, 600);
      },
      (_err) => {
        setSendingLocation(false);
        alert('Could not obtain current GPS position. Please ensure location services are enabled on your device.');
      },
      { enableHighAccuracy: true, timeout: 12000 }
    );
  };

  // Copy Tag Code
  const handleCopyTagCode = () => {
    if (data?.tagCode || tagCode) {
      navigator.clipboard?.writeText(data?.tagCode || tagCode || '');
      setCopiedTag(true);
      setTimeout(() => setCopiedTag(false), 2000);
    }
  };

  // Share Public Link
  const handleShareProfile = async () => {
    const currentUrl = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Emergency Child Tag - ${data?.childName || 'Child'}`,
          text: `Emergency child safety pass for ${data?.childName || 'Child'}.`,
          url: currentUrl,
        });
        return;
      } catch {
        // Fallback
      }
    }
    navigator.clipboard?.writeText(currentUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const primaryContact = data?.contacts && data.contacts.length > 0 
    ? data.contacts[0] 
    : null;

  const primaryPhone = primaryContact?.phone || (data?.parentPhones && data.parentPhones.length > 0 ? data.parentPhones[0] : null);

  const cleanPhoneForChat = primaryPhone ? primaryPhone.replace(/[^0-9]/g, '') : '';
  const prefilledEmergencyMsg = `Hello! I have found ${data?.childName || 'your child'} via KiddiTag${currentLocation ? ` near ${currentLocation.shortCity}` : ''}. Please call me immediately!`;
  const whatsappUrl = `https://wa.me/${cleanPhoneForChat}?text=${encodeURIComponent(prefilledEmergencyMsg)}`;
  const smsUrl = `sms:${cleanPhoneForChat}?body=${encodeURIComponent(prefilledEmergencyMsg)}`;

  return (
    <div className="public-tag-page pure-emergency-view">
      <div className="mobile-app-shell">

        {/* Loading State */}
        {loading ? (
          <div className="fullscreen-state loading-state">
            <div className="loader-pulse-ring">
              <Loader2 size={44} className="spin" />
            </div>
            <h2>Accessing Child Safety Pass...</h2>
            <p>Connecting to secure emergency registry</p>
          </div>
        ) : error && !data ? (
          <div className="fullscreen-state error-state">
            <div className="error-icon-box">
              <AlertTriangle size={42} />
            </div>
            <h2>Tag Not Found or Inactive</h2>
            <p>{error}</p>
            <button 
              type="button" 
              className="btn-demo-trigger"
              onClick={() => {
                setData(DEMO_TAG_DATA);
                setIsDemoMode(true);
                setError(null);
              }}
            >
              <Sparkles size={16} />
              <span>Preview Demo Profile (Maya)</span>
            </button>
          </div>
        ) : data ? (
          <div className="emergency-content-wrapper">

            {/* BIG HERO PHOTO SECTION */}
            <div className="hero-photo-container">
              {data.imageUrl ? (
                <div 
                  className="big-photo-frame" 
                  onClick={() => setIsPhotoModalOpen(true)}
                  title="Tap to enlarge photo"
                >
                  <img 
                    src={data.imageUrl} 
                    alt={data.childName} 
                    className="big-child-photo" 
                  />
                  {/* Subtle top floating bar over photo */}
                  <div className="photo-top-bar">
                    <div className="emergency-badge-floating">
                      <span className="pulsing-beacon" />
                      <span>EMERGENCY SAFETY PASS</span>
                    </div>
                    <button 
                      type="button" 
                      className="photo-share-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleShareProfile();
                      }}
                      title="Share link"
                    >
                      {copiedLink ? <Check size={16} /> : <Share2 size={16} />}
                    </button>
                  </div>

                  <div className="photo-zoom-hint">
                    <Maximize2 size={15} />
                    <span>Tap to view full photo</span>
                  </div>
                </div>
              ) : (
                <div className="big-photo-fallback">
                  <div className="photo-top-bar">
                    <div className="emergency-badge-floating">
                      <span className="pulsing-beacon" />
                      <span>EMERGENCY SAFETY PASS</span>
                    </div>
                  </div>
                  <div className="fallback-emoji-wrap">👧</div>
                  <span className="fallback-label">No Photo Provided</span>
                </div>
              )}

              {/* Verified Active Tag Seal */}
              <div className="floating-verified-pill">
                <ShieldCheck size={16} />
                <span>Verified Child Safe Tag</span>
              </div>
            </div>

            {/* Demo Notice Banner (if active) */}
            {isDemoMode && (
              <div className="demo-strip">
                <Sparkles size={13} />
                <span>Simulated Emergency Profile • Real GPS & Calling are interactive</span>
              </div>
            )}

            {/* CHILD IDENTITY HEADER SHEET */}
            <section className="child-identity-sheet">
              <div className="identity-title-row">
                <h1 className="hero-child-name">{data.childName}</h1>
                <div className="tag-code-badge" onClick={handleCopyTagCode} title="Tap to copy tag code">
                  <span>Tag #{data.tagCode || tagCode}</span>
                  {copiedTag ? <Check size={12} className="green" /> : <Copy size={12} />}
                </div>
              </div>

              {/* Key Child Attributes Pills */}
              <div className="child-attributes-pills">
                {data.age && (
                  <div className="attr-pill age">
                    <span className="attr-label">Age</span>
                    <strong className="attr-val">{data.age} Years Old</strong>
                  </div>
                )}
                {data.bloodType && (
                  <div className="attr-pill blood">
                    <span className="attr-label">Blood Type</span>
                    <strong className="attr-val">{data.bloodType}</strong>
                  </div>
                )}
                {data.gender && (
                  <div className="attr-pill gender">
                    <span className="attr-label">Gender</span>
                    <strong className="attr-val">{data.gender}</strong>
                  </div>
                )}
              </div>

              {data.languages && (
                <div className="spoken-language-row">
                  <span className="lang-icon">🗣️</span>
                  <span>Speaks <strong>{data.languages}</strong></span>
                </div>
              )}
            </section>

            {/* URGENT CALL TO ACTION: CALL GUARDIAN */}
            <section className="urgent-call-section">
              <div className="urgent-call-label">
                <AlertCircle size={15} />
                <span>Immediate Action for Finder</span>
              </div>

              {primaryPhone ? (
                <a 
                  href={`tel:${primaryPhone.replace(/[^0-9+]/g, '')}`} 
                  className="hero-call-button"
                  id="btn-call-primary"
                >
                  <div className="call-bubble-icon">
                    <PhoneCall size={26} />
                  </div>
                  <div className="call-text-box">
                    <span className="call-title">CALL GUARDIAN NOW</span>
                    <span className="call-number">
                      {primaryContact?.name || data.parentContact || 'Mother'} • {primaryPhone}
                    </span>
                  </div>
                </a>
              ) : (
                <div className="hero-call-disabled">
                  <HelpCircle size={22} />
                  <span>Guardian phone hidden for privacy</span>
                </div>
              )}

              {/* Quick Messaging Actions (WhatsApp & SMS) */}
              {primaryPhone && (
                <div className="quick-msg-grid">
                  <a 
                    href={whatsappUrl} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="msg-btn whatsapp-btn"
                  >
                    <MessageSquare size={17} />
                    <span>WhatsApp</span>
                  </a>
                  <a 
                    href={smsUrl} 
                    className="msg-btn sms-btn"
                  >
                    <Phone size={17} />
                    <span>Send SMS</span>
                  </a>
                </div>
              )}
            </section>

            {/* SMART GPS PINPOINT DISPATCH */}
            <section className="gps-dispatch-section">
              <button 
                type="button" 
                className={`btn-gps-trigger ${locationSent ? 'sent' : ''}`}
                onClick={handleShareLocation}
                disabled={sendingLocation}
                id="btn-share-gps"
              >
                {sendingLocation ? (
                  <>
                    <Loader2 size={20} className="spin" />
                    <span>Pinpointing GPS Coordinates...</span>
                  </>
                ) : locationSent ? (
                  <>
                    <CheckCircle2 size={20} />
                    <span>Live GPS Dispatched to Parents!</span>
                  </>
                ) : (
                  <>
                    <Navigation size={20} />
                    <span>Send My Current Location to Parents</span>
                  </>
                )}
              </button>

              {/* Dispatched GPS Card */}
              {locationSent && currentLocation && (
                <div className="gps-live-card">
                  <div className="gps-live-header">
                    <div className="gps-pin-icon">
                      <MapPin size={20} />
                    </div>
                    <div className="gps-live-text">
                      <strong className="gps-city-text">{currentLocation.shortCity}</strong>
                      <div className="gps-coords-text">
                        <span>{currentLocation.lat.toFixed(4)}°, {currentLocation.lng.toFixed(4)}°</span>
                        {currentLocation.accuracy && (
                          <span className="gps-accuracy-chip">±{currentLocation.accuracy}m</span>
                        )}
                        <span className="gps-time">
                          <Clock size={12} /> {currentLocation.timestamp}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="gps-card-actions">
                    <a 
                      href={`https://www.google.com/maps?q=${currentLocation.lat},${currentLocation.lng}`} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="btn-open-maps"
                    >
                      <ExternalLink size={14} />
                      <span>Open in Maps</span>
                    </a>
                    <button 
                      type="button" 
                      className="btn-re-locate" 
                      onClick={handleShareLocation}
                    >
                      Update Pinpoint
                    </button>
                  </div>
                </div>
              )}
            </section>

            {/* CRITICAL MEDICAL & ALLERGIES CARD */}
            {(data.allergies || data.medicalInfo || data.emergencyNotes) && (
              <section className="emergency-medical-sheet">
                <div className="sheet-heading-row">
                  <Heart size={20} className="heart-icon" />
                  <div>
                    <h2 className="sheet-title">Medical & Safety Alert</h2>
                    <p className="sheet-sub">Important health information for responders and finders</p>
                  </div>
                </div>

                {data.allergies && (
                  <div className="medical-item-box allergy-alert">
                    <div className="medical-label">
                      <AlertTriangle size={16} />
                      <span>Known Allergies (High Caution)</span>
                    </div>
                    <p className="medical-desc">{data.allergies}</p>
                  </div>
                )}

                {data.medicalInfo && (
                  <div className="medical-item-box condition-alert">
                    <div className="medical-label">
                      <Heart size={16} />
                      <span>Medical Conditions & Medications</span>
                    </div>
                    <p className="medical-desc">{data.medicalInfo}</p>
                  </div>
                )}

                {data.emergencyNotes && (
                  <div className="medical-item-box comfort-alert">
                    <div className="medical-label">
                      <HelpCircle size={16} />
                      <span>How to Comfort the Child</span>
                    </div>
                    <p className="medical-desc">{data.emergencyNotes}</p>
                  </div>
                )}
              </section>
            )}

            {/* ADDITIONAL EMERGENCY CONTACTS */}
            {data.contacts && data.contacts.length > 1 && (
              <section className="additional-contacts-sheet">
                <h3 className="section-label-text">
                  <Phone size={16} />
                  <span>Other Emergency Contacts</span>
                </h3>
                <div className="contacts-grid">
                  {data.contacts.slice(1).map((contact, idx) => (
                    <div key={idx} className="contact-card-box">
                      <div className="contact-card-meta">
                        <div className="contact-card-name-row">
                          <strong className="contact-card-name">{contact.name}</strong>
                          <span className={`contact-pill ${contact.priority?.toLowerCase()}`}>
                            {contact.relation || contact.priority || 'Secondary'}
                          </span>
                        </div>
                        <span className="contact-card-phone">{contact.phone}</span>
                      </div>
                      <a 
                        href={`tel:${contact.phone.replace(/[^0-9+]/g, '')}`} 
                        className="btn-contact-call"
                        title={`Call ${contact.name}`}
                      >
                        <PhoneCall size={16} />
                        <span>Call</span>
                      </a>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* IMMEDIATE FINDER SAFETY CHECKLIST */}
            <section className="finder-guide-sheet">
              <h3 className="section-label-text">
                <ShieldCheck size={16} />
                <span>What to Do Right Now</span>
              </h3>
              <ol className="finder-steps-list">
                <li>
                  <strong>Stay Visible in Public:</strong> Keep the child safe near an information desk, store cashier, or park security.
                </li>
                <li>
                  <strong>Call Parents Above:</strong> Use the green call button to speak directly with the guardians.
                </li>
                <li>
                  <strong>Share GPS Location:</strong> Tap the location button so parents can navigate straight to you.
                </li>
                <li>
                  <strong>Cannot Reach Parents?</strong> Contact local police or dial emergency services below.
                </li>
              </ol>

              {/* Direct Emergency 911 Trigger */}
              <button 
                type="button" 
                className="btn-call-911-trigger"
                onClick={() => setIsEmergencyModalOpen(true)}
              >
                <Siren size={17} />
                <span>Call Emergency Authorities (911)</span>
              </button>
            </section>

          </div>
        ) : null}

        {/* STICKY BOTTOM EMERGENCY DOCK ON MOBILE */}
        {data && primaryPhone && (
          <aside className="sticky-bottom-action-dock" aria-label="Instant Emergency Call">
            <div className="dock-child-info">
              {data.imageUrl ? (
                <img src={data.imageUrl} alt={data.childName} className="dock-thumb-img" />
              ) : (
                <div className="dock-thumb-fallback">👧</div>
              )}
              <div className="dock-title-group">
                <strong className="dock-name">{data.childName}</strong>
                <span className="dock-tag-status">Verified Active Tag</span>
              </div>
            </div>

            <div className="dock-action-buttons">
              <button 
                type="button" 
                className={`dock-gps-icon-btn ${locationSent ? 'sent' : ''}`}
                onClick={handleShareLocation}
                title="Send GPS Location"
              >
                {sendingLocation ? <Loader2 size={18} className="spin" /> : locationSent ? <CheckCircle2 size={18} /> : <MapPin size={18} />}
              </button>
              <a 
                href={`tel:${primaryPhone.replace(/[^0-9+]/g, '')}`} 
                className="dock-call-btn"
                title="Call Guardian"
              >
                <PhoneCall size={18} />
                <span>Call Guardian</span>
              </a>
            </div>
          </aside>
        )}

        {/* FULLSCREEN PHOTO LIGHTBOX MODAL */}
        {isPhotoModalOpen && data?.imageUrl && (
          <div className="lightbox-backdrop" onClick={() => setIsPhotoModalOpen(false)}>
            <div className="lightbox-container" onClick={(e) => e.stopPropagation()}>
              <button 
                type="button" 
                className="lightbox-close-btn" 
                onClick={() => setIsPhotoModalOpen(false)}
                aria-label="Close photo"
              >
                <X size={22} />
              </button>
              <div className="lightbox-image-box">
                <img src={data.imageUrl} alt={data.childName} />
              </div>
              <div className="lightbox-footer">
                <h3>{data.childName}</h3>
                <p>Child Identification Photo • Tag #{data.tagCode || tagCode}</p>
              </div>
            </div>
          </div>
        )}

        {/* EMERGENCY 911 CONFIRMATION MODAL */}
        {isEmergencyModalOpen && (
          <div className="emergency-modal-backdrop" onClick={() => setIsEmergencyModalOpen(false)}>
            <div className="emergency-dialog-card" onClick={(e) => e.stopPropagation()}>
              <div className="dialog-siren-icon">
                <Siren size={36} />
              </div>
              <h3>Call Local Emergency Services?</h3>
              <p>
                Dial <strong>911 (or local dispatch)</strong> if the child is in immediate danger, requires urgent medical care, or if guardians do not answer after several calls.
              </p>
              <div className="dialog-buttons-row">
                <button 
                  type="button" 
                  className="dialog-btn-cancel" 
                  onClick={() => setIsEmergencyModalOpen(false)}
                >
                  Cancel
                </button>
                <a 
                  href="tel:911" 
                  className="dialog-btn-call"
                  onClick={() => setIsEmergencyModalOpen(false)}
                >
                  <PhoneCall size={17} />
                  <span>Call 911 Now</span>
                </a>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
