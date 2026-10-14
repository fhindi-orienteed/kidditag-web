import { useState } from 'react';
import { 
  QrCode, 
  Radio, 
  MapPin, 
  Clock, 
  ExternalLink, 
  Copy, 
  Check, 
  Droplets, 
  Zap, 
  Search,
  Trash2,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import type { Tag } from '../../../types';
import { getTagColorTheme, getTagFormFactorMeta } from './tagUtils';

interface TagsCardProps {
  tag: Tag & { apiId?: number };
  childName?: string;
  childAvatar?: string;
  onSimulateScan?: (tag: Tag) => void;
  onInspectQr?: (tag: Tag) => void;
  onDelete?: (id: number | string) => void;
  onToggleActive?: (id: number | string, isActive: boolean) => void;
}

export default function TagsCard({ 
  tag, 
  childName = 'Child', 
  childAvatar = '👧',
  onSimulateScan,
  onInspectQr,
  onDelete,
  onToggleActive
}: TagsCardProps) {
  const [copied, setCopied] = useState(false);

  const colorTheme = getTagColorTheme(tag.color || 'purple');
  const meta = getTagFormFactorMeta(tag.type || 'wristband');

  const handleCopyCode = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(tag.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isRecentScan = (tag.lastScan || '').includes('min') || (tag.lastScan || '').includes('hour') || (tag.lastScan || '').includes('Today');
  const isActive = tag.status === 'Active';

  return (
    <div 
      className="dash-tag-card-full upgraded-tag-card"
      style={{
        '--tag-accent': colorTheme.accent,
        '--tag-glow': colorTheme.glow,
        '--tag-border-light': colorTheme.borderLight,
      } as React.CSSProperties}
    >
      {/* Top Accent Strip */}
      <div 
        className="tag-card-accent-strip" 
        style={{ background: colorTheme.gradient }} 
      />

      {/* Card Header Row */}
      <div className="dash-tag-card-top upgraded-card-header">
        {/* Interactive QR Mini Preview */}
        <div 
          className="upgraded-qr-box"
          onClick={() => onInspectQr?.(tag)}
          title="Click to inspect high-resolution QR & NFC code"
        >
          <div className="qr-mini-inner">
            <QrCode size={34} style={{ color: colorTheme.accent }} />
          </div>
          <div className="qr-hover-peek">
            <Search size={14} />
            <span>QR</span>
          </div>
        </div>

        {/* Right Badges: Status + Child Assignment */}
        <div className="tag-card-top-right">
          <div className="tag-child-chip" title={`Assigned to ${childName}`}>
            <span className="tag-child-avatar">{childAvatar}</span>
            <span className="tag-child-name">{childName.split(' ')[0]}</span>
          </div>

          <div className={`tag-status-pill ${tag.status.toLowerCase()}`}>
            <span className={`status-pulse-dot ${isActive ? 'active-pulse' : ''}`} />
            <span>{tag.status}</span>
          </div>
        </div>
      </div>

      {/* Card Title & Hardware Spec */}
      <div className="tag-card-title-section">
        <div className="tag-type-row">
          <h3 className="dash-tag-card-name tag-main-title">{tag.type || 'Smart Tag'}</h3>
          <span className="tag-category-pill" style={{ background: colorTheme.bgLight, color: colorTheme.text, borderColor: colorTheme.borderLight }}>
            {meta.category}
          </span>
        </div>

        {/* Tag ID with 1-Click Copy */}
        <div className="tag-id-code-row">
          <span className="tag-code-prefix">ID:</span>
          <code className="tag-code-chip">{tag.id}</code>
          <button 
            type="button"
            className={`tag-code-copy-btn ${copied ? 'copied' : ''}`}
            onClick={handleCopyCode}
            title="Copy Tag Code"
            aria-label={`Copy Tag Code ${tag.id}`}
          >
            {copied ? <Check size={13} className="green" /> : <Copy size={13} />}
            <span className="copy-tooltip">{copied ? 'Copied!' : 'Copy'}</span>
          </button>
        </div>

        {/* Color Swatch & Durability */}
        <div className="tag-hardware-specs">
          <span className="tag-color-swatch-badge">
            <span className="color-swatch-dot" style={{ background: colorTheme.dotColor }} />
            <span className="color-name">{tag.color || 'Standard'}</span>
          </span>
          <span className="tag-spec-dot">•</span>
          <span className="tag-material-text">{meta.material}</span>
        </div>
      </div>

      {/* Feature Pills */}
      <div className="tag-feature-pills-row">
        <span className="feature-pill" title="Passive contactless RF chip">
          <Radio size={12} className="feature-pill-icon purple" />
          <span>NFC Tap</span>
        </span>
        <span className="feature-pill" title="Instant optical finder scan">
          <QrCode size={12} className="feature-pill-icon blue" />
          <span>Micro QR</span>
        </span>
        <span className="feature-pill" title="100% Waterproof submersible">
          <Droplets size={12} className="feature-pill-icon teal" />
          <span>IP68 Proof</span>
        </span>
        <span className="feature-pill" title="Zero charging required">
          <Zap size={12} className="feature-pill-icon amber" />
          <span>Zero Battery</span>
        </span>
      </div>

      {/* Live Telemetry & Activity Stats */}
      <div className="dash-tag-card-stats upgraded-stats-box">
        <div className="tag-stat-col">
          <div className="stat-label-row">
            <span className="stat-label">Total Scans</span>
          </div>
          <div className="stat-value-row">
            <span className="stat-scans-number">{tag.scans || 0}</span>
            <span className="stat-scans-unit">{(tag.scans || 0) === 1 ? 'scan' : 'scans'}</span>
          </div>
        </div>

        <div className="tag-stat-divider" />

        <div className="tag-stat-col tag-stat-location-col">
          <div className="stat-label-row">
            <Clock size={11} className="stat-icon-muted" />
            <span className="stat-label">Last Activity</span>
          </div>
          <div className={`stat-last-time ${isRecentScan ? 'recent-highlight' : ''}`}>
            {tag.lastScan || 'Never scanned'}
          </div>
          <div className="stat-location-row" title={tag.location || 'Location ready'}>
            <MapPin size={11} className="stat-pin-icon" />
            <span className="stat-location-text">{tag.location || 'Location ready'}</span>
          </div>
        </div>
      </div>

      {/* Card Action Buttons */}
      <div className="tag-card-actions-grid">
        <button 
          type="button"
          className="btn-primary tag-action-simulate-btn"
          onClick={() => onSimulateScan?.(tag)}
          title="Simulate what happens when a finder scans this tag"
        >
          <ExternalLink size={14} />
          <span>Simulate Scan</span>
        </button>

        <button 
          type="button"
          className="btn-secondary tag-action-qr-btn"
          onClick={() => onInspectQr?.(tag)}
          title="View full-size QR code and NFC details"
        >
          <QrCode size={14} />
          <span>View QR</span>
        </button>

        {onToggleActive && (
          <button
            type="button"
            className="btn-secondary"
            onClick={() => onToggleActive(tag.apiId || tag.id, !isActive)}
            title={isActive ? 'Deactivate tag' : 'Activate tag'}
            style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '0 10px' }}
          >
            {isActive ? <ToggleRight size={18} color="#059669" /> : <ToggleLeft size={18} color="#94a3b8" />}
            <span style={{ fontSize: 12 }}>{isActive ? 'Active' : 'Paused'}</span>
          </button>
        )}

        {onDelete && (
          <button
            type="button"
            className="btn-secondary"
            onClick={() => onDelete(tag.apiId || tag.id)}
            title="Delete tag"
            style={{ color: '#ef4444', borderColor: '#fecaca', padding: '0 10px' }}
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
