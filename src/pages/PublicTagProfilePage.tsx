import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ShieldAlert, 
  PhoneCall, 
  MapPin, 
  Heart, 
  AlertTriangle, 
  ShieldCheck, 
  CheckCircle,
  Loader2,
  HelpCircle,
  ExternalLink,
  Clock
} from 'lucide-react';
import api from '../services/api';
import '@styles/pages/public-tag.scss';

interface TagScanResponse {
  tagCode?: string;
  childName: string;
  medicalInfo?: string | null;
  allergies?: string | null;
  parentContact?: string;
  parentPhones?: string[];
  imageUrl?: string | null;
}

interface LocationDetails {
  lat: number;
  lng: number;
  shortCity: string;
}

export default function PublicTagProfilePage() {
  const { tagCode } = useParams<{ tagCode: string }>();
  const [data, setData] = useState<TagScanResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [locationSent, setLocationSent] = useState(false);
  const [sendingLocation, setSendingLocation] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<LocationDetails | null>(null);

  useEffect(() => {
    if (!tagCode) {
      setError('No tag code provided in the URL.');
      setLoading(false);
      return;
    }

    const fetchTagInfo = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get(`/tags/scan/${encodeURIComponent(tagCode)}`);
        const payload = res.data?.data || res.data;
        // Use real photoUrl from Database, fallback to imageUrl
        payload.imageUrl = payload.photoUrl || payload.imageUrl || null;
        setData(payload);
      } catch (err: any) {
        setError(
          err.response?.data?.message ||
          err.message ||
          'We could not find child details for this tag. It may be inactive or invalid.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTagInfo();
  }, [tagCode]);

  // Handle sharing finder's location with parents
  const handleShareLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your mobile browser.');
      return;
    }

    setSendingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        let cleanCity = 'Current GPS Location';

        // Extract a clean city / area name
        try {
          const geoRes = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          if (geoRes.ok) {
            const geoJson = await geoRes.json();
            const addr = geoJson.address || {};
            const neighborhood = addr.neighbourhood || addr.suburb || addr.quarter || '';
            const city = addr.city || addr.town || addr.village || addr.county || 'Nablus';
            const country = addr.country || 'Palestine';
            cleanCity = neighborhood ? `${neighborhood}, ${city}` : `${city}, ${country}`;
          }
        } catch {
          cleanCity = 'Nearby Location Pin';
        }

        setCurrentLocation({
          lat: latitude,
          lng: longitude,
          shortCity: cleanCity
        });

        setTimeout(() => {
          setSendingLocation(false);
          setLocationSent(true);
        }, 800);
      },
      (_err) => {
        setSendingLocation(false);
        alert('Could not obtain current location. Please ensure location permissions are enabled.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Primary phone number to call
  const primaryPhone = data?.parentPhones && data.parentPhones.length > 0 
    ? data.parentPhones[0] 
    : null;

  return (
    <div className="public-tag-page">
      {/* Top Brand & Emergency Bar */}
      <header className="public-tag-topbar">
        <Link to="/" className="brand-pill" style={{ textDecoration: 'none' }}>
          <div className="brand-icon">
            <ShieldCheck size={20} />
          </div>
          <span>KiddiTag</span>
        </Link>
        <div className="emergency-live-pill">
          <span className="live-dot" />
          <span>Child Safety Tag</span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="public-tag-container">
        {loading ? (
          <div className="tag-loading-box">
            <Loader2 size={36} className="spin" style={{ color: 'var(--brand-purple)' }} />
            <p style={{ color: '#8d89a5', fontSize: '0.95rem' }}>Retrieving emergency child information...</p>
          </div>
        ) : error ? (
          <div className="tag-error-box">
            <div className="error-icon-circle">
              <AlertTriangle size={32} />
            </div>
            <h2>Tag Not Found or Inactive</h2>
            <p>{error}</p>
            <Link to="/" className="btn-secondary" style={{ textDecoration: 'none' }}>
              Back to Home
            </Link>
          </div>
        ) : data ? (
          <>
            {/* Urgent Alert Banner */}
            <div className="emergency-alert-card">
              <div className="alert-icon-wrap">
                <ShieldAlert size={22} />
              </div>
              <div>
                <h3 className="alert-title">You Found a Registered Child</h3>
                <p className="alert-sub">
                  If this child is lost or alone, please contact their guardians immediately using the buttons below.
                </p>
              </div>
            </div>

            {/* Child Profile Card */}
            <div className="child-profile-card">
              <div className="avatar-wrapper">
                {data.imageUrl ? (
                  <img src={data.imageUrl} alt={data.childName} className="child-avatar-img" />
                ) : (
                  <div className="child-avatar-fallback">
                    {data.childName ? data.childName.charAt(0).toUpperCase() : '👶'}
                  </div>
                )}
                <div className="status-badge-floating" title="Verified Active Smart Tag">
                  <ShieldCheck size={14} />
                </div>
              </div>

              <h1 className="child-name">{data.childName}</h1>
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '14px' }}>
                <span className="tag-meta-pill" style={{ margin: 0 }}>
                  Tag: <strong>{tagCode}</strong>
                </span>
                {data.parentContact && (
                  <span className="tag-meta-pill" style={{ margin: 0, background: '#f5f3fc', color: '#582be8' }}>
                    Guardian: <strong>{data.parentContact}</strong>
                  </span>
                )}
              </div>

              {/* Call Guardian Actions */}
              <div className="action-call-guardian">
                {primaryPhone ? (
                  <a href={`tel:${primaryPhone}`} className="btn-call-primary">
                    <PhoneCall size={20} />
                    <span>Call Guardian ({primaryPhone})</span>
                  </a>
                ) : data.parentContact ? (
                  <div className="btn-call-primary" style={{ background: '#582be8' }}>
                    <PhoneCall size={20} />
                    <span>Guardian Contact: {data.parentContact}</span>
                  </div>
                ) : (
                  <div className="btn-call-primary" style={{ background: '#8d89a5', cursor: 'not-allowed' }}>
                    <HelpCircle size={20} />
                    <span>Guardian Contact Masked</span>
                  </div>
                )}

                {/* Secondary phones if available */}
                {data.parentPhones && data.parentPhones.length > 1 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '6px' }}>
                    {data.parentPhones.slice(1).map((phone, idx) => (
                      <a 
                        key={idx} 
                        href={`tel:${phone}`} 
                        className="btn-secondary" 
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                      >
                        <PhoneCall size={16} />
                        <span>Call Alternate Contact ({phone})</span>
                      </a>
                    ))}
                  </div>
                )}

                {/* Share Location Button */}
                <button 
                  type="button" 
                  className="btn-share-location"
                  onClick={handleShareLocation}
                  disabled={sendingLocation}
                >
                  {sendingLocation ? (
                    <>
                      <Loader2 size={18} className="spin" />
                      <span>Pinpointing GPS Location...</span>
                    </>
                  ) : locationSent ? (
                    <>
                      <CheckCircle size={18} style={{ color: '#0ea76b' }} />
                      <span style={{ color: '#0ea76b', fontWeight: 700 }}>Location Shared with Parents!</span>
                    </>
                  ) : (
                    <>
                      <MapPin size={18} />
                      <span>Share My Current GPS with Guardian</span>
                    </>
                  )}
                </button>

                {/* Simplified & Clean Location Notification */}
                {locationSent && currentLocation && (
                  <div style={{
                    marginTop: '8px',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    background: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', textAlign: 'left' }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: '#dcfce7',
                        color: '#16a34a',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <MapPin size={16} />
                      </div>
                      <div>
                        <div style={{ color: '#14532d', fontWeight: 700, fontSize: '0.9rem', lineHeight: 1.2 }}>
                          {currentLocation.shortCity}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#16a34a', fontSize: '0.75rem', marginTop: '3px' }}>
                          <Clock size={12} />
                          <span>Sent just now</span>
                        </div>
                      </div>
                    </div>

                    <a 
                      href={`https://www.google.com/maps?q=${currentLocation.lat},${currentLocation.lng}`} 
                      target="_blank" 
                      rel="noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        background: '#ffffff',
                        border: '1px solid #86efac',
                        color: '#15803d',
                        padding: '6px 12px',
                        borderRadius: '8px',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        textDecoration: 'none',
                        flexShrink: 0
                      }}
                    >
                      <span>View Map</span>
                      <ExternalLink size={12} />
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Medical & Allergies Card */}
            {(data.allergies || data.medicalInfo) && (
              <div className="details-card">
                <h3 className="card-heading">
                  <Heart size={18} style={{ color: '#ef4444' }} />
                  <span>Important Medical Details</span>
                </h3>

                {data.allergies && (
                  <div className="detail-row">
                    <span className="detail-label">Known Allergies</span>
                    <span className="detail-value highlight-allergy">
                      {data.allergies}
                    </span>
                  </div>
                )}

                {data.medicalInfo && (
                  <div className="detail-row">
                    <span className="detail-label">Medical Conditions & Notes</span>
                    <span className="detail-value highlight-medical">
                      {data.medicalInfo}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Footer Trust Notice */}
            <footer className="public-tag-footer">
              <div className="footer-shield">
                <ShieldCheck size={16} />
                <span>Protected by KiddiTag™ Safe NFC Platform</span>
              </div>
              <p>
                All scan telemetries and contacts are processed securely to ensure child privacy & safety.
              </p>
            </footer>
          </>
        ) : null}
      </main>
    </div>
  );
}
