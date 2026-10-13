import { useState } from 'react';
import { 
  QrCode, 
  MapPin, 
  Clock, 
  ExternalLink, 
  Copy, 
  Check, 
  Radio, 
  Droplets, 
  Zap, 
  Activity
} from 'lucide-react';
import type { Tag } from '../../../types';
import { getTagColorTheme, getTagFormFactorMeta, type TagWithChild } from './tagUtils';

interface TagTableProps {
  tags: TagWithChild[];
  onSimulateScan: (tag: Tag) => void;
  onInspectQr: (tag: Tag) => void;
}

export default function TagTable({
  tags,
  onSimulateScan,
  onInspectQr
}: TagTableProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="dash-tags-table-wrapper">
      <div className="dash-tags-table-scroll">
        <table className="dash-tags-table">
          <thead>
            <tr>
              <th className="th-tag-info">Hardware & Model</th>
              <th className="th-tag-id">Tag ID</th>
              <th className="th-child">Assigned Child</th>
              <th className="th-status">Status</th>
              <th className="th-scans">Activity & Scans</th>
              <th className="th-location">Last Known Location</th>
              <th className="th-specs">Technology</th>
              <th className="th-actions text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tags.map((tag) => {
              const colorTheme = getTagColorTheme(tag.color);
              const meta = getTagFormFactorMeta(tag.type);
              const isRecent = tag.lastScan.includes('min') || tag.lastScan.includes('hour') || tag.lastScan.includes('Today');

              return (
                <tr key={tag.id} className="dash-tag-table-row">
                  {/* Hardware & Model */}
                  <td className="td-tag-info">
                    <div className="table-hardware-cell">
                      <div 
                        className="table-qr-mini-btn"
                        onClick={() => onInspectQr(tag)}
                        title="Click to inspect QR & NFC"
                        style={{ borderColor: colorTheme.borderLight, background: colorTheme.bgLight }}
                      >
                        <QrCode size={22} style={{ color: colorTheme.accent }} />
                      </div>
                      <div className="table-hardware-meta">
                        <span className="table-tag-name">{tag.type}</span>
                        <div className="table-tag-sub">
                          <span 
                            className="table-color-dot" 
                            style={{ background: colorTheme.dotColor }} 
                          />
                          <span className="table-color-name">{tag.color}</span>
                          <span className="table-divider">•</span>
                          <span className="table-category-label">{meta.category}</span>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Tag ID with 1-click copy */}
                  <td className="td-tag-id">
                    <div className="table-code-cell">
                      <code className="tag-code-chip">{tag.id}</code>
                      <button 
                        type="button"
                        className={`table-copy-icon-btn ${copiedId === tag.id ? 'copied' : ''}`}
                        onClick={(e) => handleCopy(tag.id, e)}
                        title="Copy Tag Code"
                      >
                        {copiedId === tag.id ? (
                          <Check size={12} className="green" />
                        ) : (
                          <Copy size={12} />
                        )}
                        <span className="copy-tooltip">{copiedId === tag.id ? 'Copied!' : 'Copy'}</span>
                      </button>
                    </div>
                  </td>

                  {/* Assigned Child */}
                  <td className="td-child">
                    <div className="table-child-cell">
                      <span className="table-child-avatar">{tag.childAvatar}</span>
                      <span className="table-child-name">{tag.childName}</span>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="td-status">
                    <div className={`tag-status-pill ${tag.status.toLowerCase()}`}>
                      <span className={`status-pulse-dot ${tag.status === 'Active' ? 'active-pulse' : ''}`} />
                      <span>{tag.status}</span>
                    </div>
                  </td>

                  {/* Activity & Scans */}
                  <td className="td-scans">
                    <div className="table-scans-cell">
                      <div className="table-scans-counter">
                        <Activity size={13} className="scans-icon-activity" />
                        <strong>{tag.scans}</strong>
                        <span className="scans-label">{tag.scans === 1 ? 'scan' : 'scans'}</span>
                      </div>
                      {tag.scans > 0 && (
                        <div className="table-scans-meter">
                          <div 
                            className="table-scans-meter-bar" 
                            style={{ 
                              width: `${Math.min(100, Math.max(20, tag.scans * 25))}%`,
                              background: colorTheme.accent 
                            }} 
                          />
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Last Known Location */}
                  <td className="td-location">
                    <div className="table-location-cell">
                      <div className="table-location-title" title={tag.location}>
                        <MapPin size={13} className="stat-pin-icon" />
                        <span className="truncate-text">{tag.location || 'Location ready'}</span>
                      </div>
                      <div className={`table-location-time ${isRecent ? 'recent-highlight' : ''}`}>
                        <Clock size={11} />
                        <span>{tag.lastScan}</span>
                      </div>
                    </div>
                  </td>

                  {/* Technology */}
                  <td className="td-specs">
                    <div className="table-tech-badges">
                      <span className="table-tech-pill" title="Passive contactless NFC">
                        <Radio size={11} style={{ color: '#7c3aed' }} />
                        <span>NFC</span>
                      </span>
                      <span className="table-tech-pill" title="Submersible IP68">
                        <Droplets size={11} style={{ color: '#0d9488' }} />
                        <span>IP68</span>
                      </span>
                      <span className="table-tech-pill" title="Passive energy (Zero battery needed)">
                        <Zap size={11} style={{ color: '#d97706' }} />
                        <span>0% Bat</span>
                      </span>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="td-actions text-right">
                    <div className="table-actions-cell">
                      <button 
                        type="button"
                        className="btn-primary table-btn-simulate"
                        onClick={() => onSimulateScan(tag)}
                        title="Simulate a Good Samaritan scanning this tag"
                      >
                        <ExternalLink size={13} />
                        <span>Simulate</span>
                      </button>

                      <button 
                        type="button"
                        className="btn-secondary table-btn-qr"
                        onClick={() => onInspectQr(tag)}
                        title="View Full QR Code"
                      >
                        <QrCode size={13} />
                        <span>QR</span>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
