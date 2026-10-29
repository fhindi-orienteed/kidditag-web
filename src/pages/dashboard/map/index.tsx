import { useState, useEffect } from 'react';
import { MapPin, ExternalLink, Radio, Loader2, Compass, RotateCcw } from 'lucide-react';
import { useChildren } from '../../../hooks/useChildren';
import { useScans } from '../../../hooks/useScans';

export default function MapPage() {
  const { children, loading: childrenLoading } = useChildren();
  const [selectedChildId, setSelectedChildId] = useState<number | null>(null);
  const [activeScanId, setActiveScanId] = useState<number | null>(null);
  const { scans, loading: scansLoading, error, fetchScans } = useScans();

  // Auto-select first child
  useEffect(() => {
    if (children.length > 0 && !selectedChildId) {
      setSelectedChildId(children[0].id);
    }
  }, [children, selectedChildId]);

  // Fetch scans whenever selected child changes
  useEffect(() => {
    if (selectedChildId) {
      fetchScans(selectedChildId);
      setActiveScanId(null); // Reset to latest scan on child change
    }
  }, [selectedChildId, fetchScans]);

  const selectedChild = children.find(c => c.id === selectedChildId);
  const latestScan = scans.length > 0 ? scans[0] : null;
  const activeScan = scans.find(s => s.id === activeScanId) || latestScan;
  const isViewingPastScan = activeScan && latestScan && activeScan.id !== latestScan.id;

  return (
    <div className="dash-view-container">
      <div className="dash-card">
        {/* Header */}
        <div className="dash-card-header">
          <div>
            <h2 className="dash-card-title">
              Live GPS Scan Radar {selectedChild ? `for ${selectedChild.name}` : ''}
            </h2>
            <p className="dash-card-sub">
              High-precision coordinates triggered whenever this child's physical tags are scanned.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {isViewingPastScan && (
              <button
                type="button"
                onClick={() => setActiveScanId(null)}
                className="btn-secondary"
                style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 6, borderColor: '#7c3aed', color: '#7c3aed' }}
              >
                <RotateCcw size={13} />
                <span>Return to Latest Pin</span>
              </button>
            )}
            <span className="badge-save" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', display: 'inline-block' }}></span>
              Live Radar Active
            </span>
          </div>
        </div>

        {/* Child Selector Tabs */}
        {!childrenLoading && children.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
              Select child to track:
            </label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {children.map(child => (
                <button
                  key={child.id}
                  onClick={() => setSelectedChildId(child.id)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 20,
                    border: '2px solid',
                    borderColor: selectedChildId === child.id ? '#7c3aed' : 'var(--border-light)',
                    background: selectedChildId === child.id ? '#f3effe' : 'transparent',
                    color: selectedChildId === child.id ? '#7c3aed' : 'var(--text-muted)',
                    fontWeight: 600,
                    fontSize: '0.83rem',
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

        {/* Loading State */}
        {scansLoading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 320, gap: 10, color: 'var(--text-muted)' }}>
            <Loader2 size={24} className="spin" />
            <span>Scanning cloud telemetry...</span>
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', color: '#dc2626', padding: '40px 0' }}>
            ⚠️ {error}
          </div>
        ) : activeScan ? (
          <>
            {/* Interactive OpenStreetMap Embed */}
            <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', border: '1.5px solid var(--border-light)', height: 380, background: '#f8fafc' }}>
              <iframe
                key={activeScan.id}
                title="Live Child Location Map"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${activeScan.longitude - 0.008}%2C${activeScan.latitude - 0.005}%2C${activeScan.longitude + 0.008}%2C${activeScan.latitude + 0.005}&layer=mapnik&marker=${activeScan.latitude}%2C${activeScan.longitude}`}
              />

              {/* Floating Live Badge Overlay */}
              <div
                style={{
                  position: 'absolute',
                  top: 14,
                  left: 14,
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(6px)',
                  padding: '8px 14px',
                  borderRadius: 10,
                  boxShadow: '0 4px 14px rgba(0,0,0,0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  color: '#1e293b'
                }}
              >
                <MapPin size={16} color="#7c3aed" />
                <span>{activeScan.locationName || 'GPS Incident'}</span>
                <span style={{ fontSize: '0.75rem', color: isViewingPastScan ? '#d97706' : '#10b981', fontWeight: 700 }}>
                  {isViewingPastScan ? '⏱️ Past Incident' : '● Current Active Pin'}
                </span>
                <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>
                  ({activeScan.latitude.toFixed(4)}, {activeScan.longitude.toFixed(4)})
                </span>
              </div>

              {/* External Google Maps Button */}
              <a
                href={`https://www.google.com/maps?q=${activeScan.latitude},${activeScan.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  position: 'absolute',
                  bottom: 14,
                  right: 14,
                  background: '#7c3aed',
                  color: '#fff',
                  padding: '8px 14px',
                  borderRadius: 8,
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  textDecoration: 'none',
                  boxShadow: '0 4px 14px rgba(124, 58, 237, 0.35)'
                }}
              >
                <span>Navigate in Google Maps</span>
                <ExternalLink size={14} />
              </a>
            </div>
          </>
        ) : (
          /* Empty Radar State */
          <div
            style={{
              height: 300,
              background: 'radial-gradient(circle at center, #f5f3ff 0%, #ffffff 80%)',
              border: '2px dashed #ddd6fe',
              borderRadius: 12,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 24,
              textAlign: 'center'
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                background: '#ede9fe',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 12,
                color: '#7c3aed'
              }}
            >
              <Radio size={28} />
            </div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 4 }}>
              Radar is Active & Listening
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: 440 }}>
              No scan incidents logged yet for {selectedChild?.name || 'this child'}. As soon as someone scans the child's tag and shares their location, it will appear here in real time.
            </p>
          </div>
        )}

        {/* Scan Incident History Timeline */}
        <div style={{ marginTop: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>
              Scan Incident Log {scans.length > 0 ? `(${scans.length})` : ''}
            </h3>
            {selectedChild && (
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Click any incident to inspect on map
              </span>
            )}
          </div>

          {scans.length === 0 ? (
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
              No scan history records found.
            </p>
          ) : (
            <div className="dash-timeline-list">
              {scans.map((scan, idx) => {
                const scanDate = new Date(scan.createdAt);
                const timeFormatted = scanDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                const dateFormatted = scanDate.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
                const isSelected = activeScan?.id === scan.id;
                const isLatest = idx === 0;

                return (
                  <div
                    key={scan.id}
                    onClick={() => setActiveScanId(scan.id)}
                    className="dash-timeline-item"
                    style={{
                      cursor: 'pointer',
                      borderRadius: 10,
                      padding: '12px 14px',
                      marginBottom: 8,
                      border: isSelected ? '2px solid #7c3aed' : '1px solid var(--border-light)',
                      background: isSelected ? '#faf8ff' : 'transparent',
                      transition: 'all 0.2s',
                    }}
                  >
                    <div className="dash-timeline-bullet" style={{ background: isSelected ? '#7c3aed' : '#cbd5e1' }}></div>
                    <div className="dash-timeline-content" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10, flex: 1 }}>
                      <div>
                        <div className="dash-timeline-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span>📍 {scan.locationName || 'GPS Location Captured'}</span>
                          {isLatest && (
                            <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: 12, background: '#ecfdf5', color: '#059669', fontWeight: 700 }}>
                              ● Latest Pin
                            </span>
                          )}
                          {isSelected && !isLatest && (
                            <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: 12, background: '#f3e8ff', color: '#7c3aed', fontWeight: 700 }}>
                              👁️ Active on Map
                            </span>
                          )}
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>
                            ({scan.latitude.toFixed(5)}, {scan.longitude.toFixed(5)})
                          </span>
                        </div>
                        <div className="dash-timeline-meta" style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
                          <span>Tag: <strong>{scan.tagCode}</strong></span>
                          {scan.accuracy && <span>Accuracy: &plusmn;{Math.round(scan.accuracy)}m</span>}
                          <span>Finder: Good Samaritan</span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ textAlign: 'right' }}>
                          <div className="dash-timeline-time" style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                            {timeFormatted}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {dateFormatted}
                          </div>
                        </div>
                        <a
                          href={`https://www.google.com/maps?q=${scan.latitude},${scan.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="btn-secondary"
                          style={{ padding: '6px 10px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: 4 }}
                          title="Open Google Maps in new tab"
                        >
                          <Compass size={14} />
                          <span>Maps</span>
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
