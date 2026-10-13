import {
  AlertTriangle,
  Bell,
  Menu,
  Search
} from 'lucide-react';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface HeaderDashboardProps {
  onOpenActivation?: () => void;
}

export default function HeaderDashboard({ onOpenActivation }: HeaderDashboardProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [lostModeActive, setLostModeActive] = useState(false);
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

  return (
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

        {/* Lost Child Broadcast Button */}
        <button
          className={`dash-lost-mode-btn ${lostModeActive ? 'active' : ''}`}
          onClick={() => setLostModeActive(!lostModeActive)}
          title="Click to toggle emergency broadcast"
        >
          <AlertTriangle size={16} />
          <span>{lostModeActive ? '🚨 LOST MODE ACTIVE' : 'Lost Child Mode'}</span>
        </button>

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
  );
}
