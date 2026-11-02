import {
  AlertTriangle,
  Bell,
  Menu,
  Search,
  X,
  PhoneCall,
  MapPin,
  MessageSquare,
  Shield,
  Siren,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useChildren } from '../hooks/useChildren';

interface HeaderDashboardProps {
  onOpenActivation?: () => void;
}

export default function HeaderDashboard({ onOpenActivation }: HeaderDashboardProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { children } = useChildren();

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [lostModeActive, setLostModeActive] = useState(false);
  const [showLostModal, setShowLostModal] = useState(false);
  const [lostActivatedAt, setLostActivatedAt] = useState<Date | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const getPageTitle = () => {
    if (location.pathname === '/dashboard/tags') return 'Smart Tags Manager';
    if (location.pathname === '/dashboard/children') return 'Child Profiles';
    if (location.pathname === '/dashboard/map') return 'Live GPS Scan Radar';
    if (location.pathname === '/dashboard/contacts') return 'Emergency Contacts';
    if (location.pathname === '/dashboard/medical') return 'Medical & Allergy Protocol';
    if (location.pathname === '/dashboard/settings') return 'Safety & Privacy Settings';
    return 'Caregiver Overview';
  };

  const handleActivateLostMode = () => {
    setLostModeActive(true);
    setLostActivatedAt(new Date());
    setShowLostModal(false);
  };

  const handleDeactivateLostMode = () => {
    setLostModeActive(false);
    setLostActivatedAt(null);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      <header className="dash-topbar">
        <div className="dash-topbar-left">
          <button
            className="dash-hamburger-btn"
            onClick={() => setMobileSidebarOpen(true)}
            aria-label="Open mobile menu"
          >
            <Menu size={22} />
          </button>

          <div>
            <h1 className="dash-topbar-title">{getPageTitle()}</h1>
            <div className="dash-topbar-status">
              <span className="dash-pulse-dot"></span>
            </div>
          </div>
        </div>

        <div className="dash-topbar-right">
          {/* Search Input */}
          <div className="dash-search-box">
            <Search size={16} className="dash-search-icon" />
            <input
              type="text"
              placeholder="Search tags, contacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Lost Child Mode Button */}
          {lostModeActive ? (
            <button
              className="dash-lost-mode-btn active"
              onClick={handleDeactivateLostMode}
              title="Click to deactivate Lost Child Mode"
            >
              <span className="lost-pulse-ring" />
              <Siren size={16} />
              <span>LOST MODE ACTIVE</span>
            </button>
          ) : (
            <button
              className="dash-lost-mode-btn"
              onClick={() => setShowLostModal(true)}
              title="Activate emergency Lost Child Mode"
            >
              <AlertTriangle size={16} />
              <span>Lost Child Mode</span>
            </button>
          )}

          {/* Notification Bell */}
          <button
            className="dash-bell-btn"
            onClick={() => navigate('/dashboard/map')}
            title="View Scan Alerts"
          >
            <Bell size={18} />
            <span className="dash-bell-count">1</span>
          </button>
        </div>
      </header>

      {/* ── Lost Child Mode Active Banner ── */}
      {lostModeActive && (
        <div className="lost-mode-banner">
          <div className="lost-mode-banner-left">
            <Siren size={18} className="lost-banner-siren" />
            <div>
              <strong>LOST CHILD MODE ACTIVE</strong>
              <span>
                Emergency contacts have been alerted
                {lostActivatedAt ? ` · Activated at ${formatTime(lostActivatedAt)}` : ''}
              </span>
            </div>
          </div>
          <div className="lost-mode-banner-actions">
            <button
              className="lost-banner-map-btn"
              onClick={() => navigate('/dashboard/map')}
            >
              <MapPin size={13} />
              <span>Live Map</span>
            </button>
            <button
              className="lost-banner-deactivate-btn"
              onClick={handleDeactivateLostMode}
            >
              <CheckCircle2 size={13} />
              <span>Child Found — Deactivate</span>
            </button>
          </div>
        </div>
      )}

      {/* ── Lost Child Mode Confirmation Modal ── */}
      {showLostModal && (
        <div className="modal-overlay" onClick={() => setShowLostModal(false)}>
          <div className="modal-card lost-mode-modal" onClick={(e) => e.stopPropagation()}>

            {/* Modal Header */}
            <div className="lost-modal-header">
              <div className="lost-modal-header-icon">
                <Siren size={28} />
              </div>
              <button className="modal-close-btn lost-close" onClick={() => setShowLostModal(false)}>
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="lost-modal-body">
              <h2>Activate Lost Child Mode?</h2>
              <p className="lost-modal-subtitle">
                This will immediately trigger emergency protocols for all linked children.
              </p>

              {/* What happens section */}
              <div className="lost-modal-actions-list">
                <div className="lost-action-item">
                  <div className="lost-action-icon phone">
                    <PhoneCall size={16} />
                  </div>
                  <div>
                    <strong>Alert Emergency Contacts</strong>
                    <span>All {children.length > 0 ? children.length : ''} linked contact{children.length !== 1 ? 's' : ''} will receive an immediate alert</span>
                  </div>
                </div>
                <div className="lost-action-item">
                  <div className="lost-action-icon map">
                    <MapPin size={16} />
                  </div>
                  <div>
                    <strong>Enable Live GPS Tracking</strong>
                    <span>Tag scan locations will be updated in real-time on your map</span>
                  </div>
                </div>
                <div className="lost-action-item">
                  <div className="lost-action-icon msg">
                    <MessageSquare size={16} />
                  </div>
                  <div>
                    <strong>Finder Alert Mode</strong>
                    <span>Anyone who scans the tag will see a high-priority emergency screen</span>
                  </div>
                </div>
                <div className="lost-action-item">
                  <div className="lost-action-icon shield">
                    <Shield size={16} />
                  </div>
                  <div>
                    <strong>Medical Info Highlighted</strong>
                    <span>Critical medical and allergy info shown prominently to finders</span>
                  </div>
                </div>
              </div>

              {/* Child list */}
              {children.length > 0 && (
                <div className="lost-modal-children">
                  <span className="lost-modal-children-label">
                    <Clock size={13} />
                    Affected children:
                  </span>
                  <div className="lost-modal-children-list">
                    {children.map((child) => (
                      <div key={child.id} className="lost-child-pill">
                        <div className="lost-child-avatar">
                          {child.photoUrl ? (
                            <img src={child.photoUrl} alt={child.name} />
                          ) : (
                            <span>{child.name.charAt(0).toUpperCase()}</span>
                          )}
                        </div>
                        <span>{child.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="lost-modal-footer">
              <button className="lost-cancel-btn" onClick={() => setShowLostModal(false)}>
                Cancel
              </button>
              <button className="lost-activate-btn" onClick={handleActivateLostMode}>
                <Siren size={16} />
                <span>Activate Lost Child Mode</span>
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
