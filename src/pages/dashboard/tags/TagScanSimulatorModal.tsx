import { useState } from 'react';
import { 
  X, 
  MapPin, 
  PhoneCall, 
  ShieldCheck, 
  Radio, 
  CheckCircle2, 
  Smartphone, 
  Clock, 
  HeartPulse
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Tag } from '../../../types';
import { getTagColorTheme } from './tagUtils';

interface TagScanSimulatorModalProps {
  tag: Tag | null;
  childName?: string;
  childAvatar?: string;
  onClose: () => void;
}

export default function TagScanSimulatorModal({
  tag,
  childName = 'Child',
  childAvatar = '👧',
  onClose
}: TagScanSimulatorModalProps) {
  const navigate = useNavigate();
  const [callInitiated, setCallInitiated] = useState(false);

  if (!tag) return null;

  const colorTheme = getTagColorTheme(tag.color);

  const handleTestProxyCall = () => {
    setCallInitiated(true);
    setTimeout(() => setCallInitiated(false), 3000);
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div 
        className="modal-content-card tag-simulator-modal-card" 
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
          <X size={18} />
        </button>

        {/* Modal Top Banner */}
        <div className="simulator-banner">
          <div 
            className="simulator-pulse-ring" 
            style={{ background: colorTheme.bgLight, color: colorTheme.accent }}
          >
            <Radio size={22} className="simulator-icon" />
          </div>
          <div>
            <div 
              className="simulator-live-badge" 
              style={{ background: colorTheme.bgLight, color: colorTheme.text }}
            >
              <span className="live-ping-dot" /> LIVE SIMULATION
            </div>
            <h2 className="simulator-title">Scan Telemetry Received!</h2>
            <p className="simulator-sub">
              A Good Samaritan just scanned <strong>{tag.id}</strong> ({tag.type})
            </p>
          </div>
        </div>

        {/* Scanner Details Box */}
        <div className="simulator-details-card">
          <div className="simulator-row">
            <div className="sim-label-group">
              <Smartphone size={16} className="sim-icon" />
              <span>Finder Device</span>
            </div>
            <strong className="sim-val">Mobile Safari • iOS 19 (NFC Tap)</strong>
          </div>

          <div className="simulator-row">
            <div className="sim-label-group">
              <MapPin size={16} className="sim-icon" />
              <span>GPS Pinpoint</span>
            </div>
            <div className="sim-location-val">
              <strong>{tag.location || 'Brooklyn Bridge Park, Pier 6'}</strong>
              <span className="sim-coords">40.6928° N, 73.9997° W (±4m)</span>
            </div>
          </div>

          <div className="simulator-row">
            <div className="sim-label-group">
              <Clock size={16} className="sim-icon" />
              <span>Time of Scan</span>
            </div>
            <strong className="sim-val" style={{ color: 'var(--brand-purple)' }}>Just now (Instant Relay)</strong>
          </div>

          <div className="simulator-row">
            <div className="sim-label-group">
              <ShieldCheck size={16} className="sim-icon green" />
              <span>Privacy Shield</span>
            </div>
            <strong className="sim-val green">Active (Phone Numbers 100% Masked)</strong>
          </div>
        </div>

        {/* Child Safety Emergency Card */}
        <div className="simulator-child-safeguard">
          <div className="sim-child-avatar">{childAvatar}</div>
          <div className="sim-child-info">
            <div className="sim-child-name">{childName} • Emergency Safe Card</div>
            <div className="sim-child-notes">
              <HeartPulse size={13} style={{ color: '#e53e3e', display: 'inline', marginRight: 4 }} />
              Allergy alert & primary guardian contact queued for immediate relay
            </div>
          </div>
        </div>

        {/* Automated Protocols Triggered */}
        <div className="simulator-protocol-list">
          <div className="protocol-item">
            <CheckCircle2 size={16} className="green" />
            <span>Encrypted SMS sent to registered guardian numbers</span>
          </div>
          <div className="protocol-item">
            <CheckCircle2 size={16} className="green" />
            <span>GPS pin registered on Caregiver Live Scan Radar</span>
          </div>
          <div className="protocol-item">
            <CheckCircle2 size={16} className="green" />
            <span>One-tap Safe Proxy audio relay standby enabled</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="simulator-actions">
          <button 
            className="btn-primary simulator-call-btn" 
            onClick={handleTestProxyCall}
          >
            <PhoneCall size={16} />
            <span>{callInitiated ? 'Connecting Proxy Call...' : 'Connect to Finder via Proxy'}</span>
          </button>

          <button 
            className="btn-secondary simulator-map-btn"
            onClick={() => {
              onClose();
              navigate('/dashboard/map');
            }}
          >
            <MapPin size={16} />
            <span>View on Live Radar Map</span>
          </button>
        </div>
      </div>
    </div>
  );
}
