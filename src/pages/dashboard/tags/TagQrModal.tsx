import { useState } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  ExternalLink, 
  Download, 
  Radio
} from 'lucide-react';
import type { Tag } from '../../../types';
import { getTagColorTheme, getTagFormFactorMeta } from './tagUtils';

interface TagQrModalProps {
  tag: Tag | null;
  childName?: string;
  childAvatar?: string;
  onClose: () => void;
  onSimulateScan: (tag: Tag) => void;
}

export default function TagQrModal({
  tag,
  childName = 'Child',
  childAvatar = '👧',
  onClose,
  onSimulateScan
}: TagQrModalProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!tag) return null;

  const colorTheme = getTagColorTheme(tag.color);
  const formFactor = getTagFormFactorMeta(tag.type);
  const publicUrl = `https://kidditag.com/scan/${tag.id}`;

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(publicUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleDownload = () => {
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2500);
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div 
        className="modal-content-card tag-qr-modal-card" 
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div className="tag-qr-modal-header">
          <div className="tag-qr-tech-badge">
            <Radio size={14} className="nfc-pulse-anim" />
            <span>Passive NFC (13.56MHz) + Instant QR</span>
          </div>
          <h2 className="tag-qr-title">Physical Smart Tag #{tag.id}</h2>
          <p className="tag-qr-subtitle">
            Linked to <strong>{childAvatar} {childName}</strong> • {tag.type}
          </p>
        </div>

        {/* QR Code Presentation Box */}
        <div className="tag-qr-canvas-box" style={{ borderColor: colorTheme.borderLight }}>
          <div className="tag-qr-nfc-glow" style={{ background: colorTheme.glow }} />
          
          <div className="tag-qr-graphic-wrapper">
            {/* High-res SVG QR Graphic with KiddieTag Shield in center */}
            <svg 
              className="tag-qr-svg" 
              viewBox="0 0 200 200" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect width="200" height="200" rx="16" fill="#ffffff" />
              {/* Corner position markers */}
              {/* Top-Left */}
              <rect x="16" y="16" width="46" height="46" rx="8" fill="#140d3a" />
              <rect x="23" y="23" width="32" height="32" rx="4" fill="#ffffff" />
              <rect x="29" y="29" width="20" height="20" rx="3" fill={colorTheme.accent} />
              
              {/* Top-Right */}
              <rect x="138" y="16" width="46" height="46" rx="8" fill="#140d3a" />
              <rect x="145" y="23" width="32" height="32" rx="4" fill="#ffffff" />
              <rect x="151" y="29" width="20" height="20" rx="3" fill={colorTheme.accent} />

              {/* Bottom-Left */}
              <rect x="16" y="138" width="46" height="46" rx="8" fill="#140d3a" />
              <rect x="23" y="145" width="32" height="32" rx="4" fill="#ffffff" />
              <rect x="29" y="151" width="20" height="20" rx="3" fill={colorTheme.accent} />

              {/* Pattern Blocks */}
              <rect x="70" y="20" width="10" height="10" rx="2" fill="#140d3a" />
              <rect x="88" y="20" width="10" height="10" rx="2" fill="#140d3a" />
              <rect x="106" y="20" width="10" height="10" rx="2" fill="#140d3a" />
              <rect x="124" y="20" width="6" height="10" rx="2" fill="#140d3a" />

              <rect x="70" y="38" width="10" height="10" rx="2" fill="#140d3a" />
              <rect x="88" y="38" width="28" height="10" rx="2" fill="#140d3a" />
              <rect x="124" y="38" width="6" height="10" rx="2" fill="#140d3a" />

              <rect x="70" y="56" width="10" height="10" rx="2" fill="#140d3a" />
              <rect x="106" y="56" width="10" height="10" rx="2" fill="#140d3a" />

              {/* Middle Row Bits */}
              <rect x="20" y="70" width="10" height="10" rx="2" fill="#140d3a" />
              <rect x="38" y="70" width="10" height="10" rx="2" fill="#140d3a" />
              <rect x="56" y="70" width="10" height="10" rx="2" fill="#140d3a" />
              <rect x="138" y="70" width="10" height="10" rx="2" fill="#140d3a" />
              <rect x="156" y="70" width="10" height="10" rx="2" fill="#140d3a" />
              <rect x="174" y="70" width="6" height="10" rx="2" fill="#140d3a" />

              <rect x="20" y="88" width="10" height="10" rx="2" fill="#140d3a" />
              <rect x="46" y="88" width="20" height="10" rx="2" fill="#140d3a" />
              <rect x="138" y="88" width="28" height="10" rx="2" fill="#140d3a" />
              <rect x="174" y="88" width="6" height="10" rx="2" fill="#140d3a" />

              <rect x="20" y="106" width="10" height="10" rx="2" fill="#140d3a" />
              <rect x="38" y="106" width="10" height="10" rx="2" fill="#140d3a" />
              <rect x="56" y="106" width="10" height="10" rx="2" fill="#140d3a" />
              <rect x="138" y="106" width="10" height="10" rx="2" fill="#140d3a" />
              <rect x="156" y="106" width="10" height="10" rx="2" fill="#140d3a" />
              <rect x="174" y="106" width="6" height="10" rx="2" fill="#140d3a" />

              <rect x="20" y="124" width="10" height="6" rx="2" fill="#140d3a" />
              <rect x="38" y="124" width="28" height="6" rx="2" fill="#140d3a" />

              {/* Bottom Right Area */}
              <rect x="70" y="138" width="10" height="10" rx="2" fill="#140d3a" />
              <rect x="88" y="138" width="10" height="10" rx="2" fill="#140d3a" />
              <rect x="106" y="138" width="10" height="10" rx="2" fill="#140d3a" />
              <rect x="124" y="138" width="10" height="10" rx="2" fill="#140d3a" />
              <rect x="142" y="138" width="10" height="10" rx="2" fill="#140d3a" />
              <rect x="160" y="138" width="20" height="10" rx="2" fill="#140d3a" />

              <rect x="70" y="156" width="28" height="10" rx="2" fill="#140d3a" />
              <rect x="106" y="156" width="10" height="10" rx="2" fill="#140d3a" />
              <rect x="124" y="156" width="28" height="10" rx="2" fill="#140d3a" />
              <rect x="160" y="156" width="20" height="10" rx="2" fill="#140d3a" />

              <rect x="70" y="174" width="10" height="6" rx="2" fill="#140d3a" />
              <rect x="88" y="174" width="28" height="6" rx="2" fill="#140d3a" />
              <rect x="124" y="174" width="10" height="6" rx="2" fill="#140d3a" />
              <rect x="142" y="174" width="20" height="6" rx="2" fill="#140d3a" />
              <rect x="170" y="174" width="10" height="6" rx="2" fill="#140d3a" />

              {/* Center Logo Shield Pill */}
              <rect x="76" y="76" width="48" height="48" rx="12" fill="#ffffff" stroke={colorTheme.accent} strokeWidth="2.5" />
              <circle cx="100" cy="100" r="16" fill={colorTheme.accent} />
              <path d="M100 91L107 94.5V101.5C107 105.8 104 109.8 100 111C96 109.8 93 105.8 93 101.5V94.5L100 91Z" fill="#ffffff" />
            </svg>

            {/* Corner Viewfinder Reticles */}
            <div className="qr-reticle top-left" />
            <div className="qr-reticle top-right" />
            <div className="qr-reticle bottom-left" />
            <div className="qr-reticle bottom-right" />
          </div>

          <div className="tag-qr-footer-hint">
            <Radio size={14} style={{ color: colorTheme.accent }} />
            <span>NFC Tap: Hold phone within 2 cm • QR: Point camera</span>
          </div>
        </div>

        {/* Hardware & Spec Pills */}
        <div className="tag-qr-spec-pills">
          <div className="tag-spec-item">
            <span className="tag-spec-label">Tag Code</span>
            <span className="tag-spec-value tag-code-mono">{tag.id}</span>
          </div>
          <div className="tag-spec-item">
            <span className="tag-spec-label">Material</span>
            <span className="tag-spec-value">{formFactor.material}</span>
          </div>
          <div className="tag-spec-item">
            <span className="tag-spec-label">Protection</span>
            <span className="tag-spec-value">{formFactor.durability}</span>
          </div>
        </div>

        {/* Public Scan URL Copy Row */}
        <div className="tag-qr-url-box">
          <div className="tag-qr-url-text">{publicUrl}</div>
          <button 
            className="btn-secondary tag-qr-copy-btn" 
            onClick={handleCopyLink}
            title="Copy Public Scan Link"
          >
            {copiedLink ? <Check size={14} className="green" /> : <Copy size={14} />}
            <span>{copiedLink ? 'Copied URL!' : 'Copy Link'}</span>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="tag-qr-modal-actions">
          <button 
            className="btn-primary tag-qr-simulate-btn"
            onClick={() => {
              onClose();
              onSimulateScan(tag);
            }}
          >
            <ExternalLink size={15} />
            <span>Simulate Finder Scan</span>
          </button>

          <button 
            className="btn-secondary tag-qr-download-btn"
            onClick={handleDownload}
          >
            {downloadSuccess ? <Check size={15} className="green" /> : <Download size={15} />}
            <span>{downloadSuccess ? 'Downloaded Tag Label!' : 'Download Printable Label'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
