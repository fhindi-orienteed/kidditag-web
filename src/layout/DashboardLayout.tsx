import {
  AlertTriangle,
  Bell,
  HeartPulse,
  LayoutDashboard,
  MapPin,
  Menu,
  PhoneCall,
  Radio,
  Search,
  Settings,
  Tag,
  Users
} from 'lucide-react';
import { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import type { DashboardContextType } from '../pages/dashboard/context';
import { initialChildrenData } from '../pages/dashboard/mockData';
import type { ChildProfile } from '../types';
import Sidebar from '../components/Sidebar';
import HeaderDashboard from '../components/HeaderDashboard';

interface DashboardLayoutProps {
  onOpenActivation?: () => void;
}

export default function DashboardLayout({ onOpenActivation }: DashboardLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const [childrenData] = useState<Record<string, ChildProfile>>(initialChildrenData);
  const [selectedChild, setSelectedChild] = useState<string>('maya');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [lostModeActive, setLostModeActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [acknowledgedAlert, setAcknowledgedAlert] = useState(false);

  const currentChild = childrenData[selectedChild] || childrenData.maya;

  const navItems = [
    { id: 'overview', path: '/dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'tags', path: '/dashboard/tags', label: 'Smart Tags', icon: Tag, count: currentChild.tags.length },
    { id: 'children', path: '/dashboard/children', label: 'Children Profiles', icon: Users, count: 2 },
    { id: 'map', path: '/dashboard/map', label: 'Live Scan Map', icon: MapPin, badge: 'Live' },
    { id: 'contacts', path: '/dashboard/contacts', label: 'Emergency Contacts', icon: PhoneCall },
    { id: 'medical', path: '/dashboard/medical', label: 'Medical & Allergy', icon: HeartPulse },
    { id: 'settings', path: '/dashboard/settings', label: 'Safety & Settings', icon: Settings }
  ];

  const getPageTitle = () => {
    if (location.pathname === '/dashboard/tags') return 'Smart Tags Manager';
    if (location.pathname === '/dashboard/children') return 'Child Profiles';
    if (location.pathname === '/dashboard/map') return 'Live GPS Scan Radar';
    if (location.pathname === '/dashboard/contacts') return 'Emergency Contacts';
    if (location.pathname === '/dashboard/medical') return 'Medical & Allergy Protocol';
    if (location.pathname === '/dashboard/settings') return 'Safety & Privacy Settings';
    return 'Caregiver Overview';
  };

  const contextValue: DashboardContextType = {
    selectedChild,
    setSelectedChild,
    currentChild,
    childrenData,
    searchQuery,
    setSearchQuery,
    lostModeActive,
    setLostModeActive,
    onOpenActivation
  };

  return (
    <div className="full-dashboard-app">
      {/* -----------------------------------------------------------
          LEFT SIDEBAR
          ----------------------------------------------------------- */}
      <Sidebar onOpenActivation={onOpenActivation} />

      {/* -----------------------------------------------------------
          MAIN CONTENT AREA
          ----------------------------------------------------------- */}
      <div className="dash-main-area">
        {/* Top App Bar */}
        <HeaderDashboard onOpenActivation={onOpenActivation} />

        {/* Scrollable View Content with Outlet */}
        <main className="dash-content-scroll">
          {/* Emergency Alert Banner */}
          {!acknowledgedAlert && currentChild.scanHistory.length > 0 && (
            <div className="dash-alert-strip">
              <div className="dash-alert-strip-left">
                <Radio size={20} className="dash-alert-pulse-icon" />
                <div>
                  <strong>Live Tag Scan:</strong> {currentChild.name}'s tag was scanned at <strong>{currentChild.scanHistory[0].location}</strong> ({currentChild.tags[0]?.lastScan || 'Recently'}).
                </div>
              </div>
              <div className="dash-alert-strip-actions">
                <button
                  className="btn-primary"
                  style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                  onClick={() => alert('Calling Good Samaritan via Safe Proxy: Proxy connecting...')}
                >
                  <PhoneCall size={14} />
                  <span>Call Finder (Proxy)</span>
                </button>
                <button
                  className="dash-alert-dismiss"
                  onClick={() => setAcknowledgedAlert(true)}
                >
                  Acknowledge
                </button>
              </div>
            </div>
          )}

          {/* Child Route View */}
          <Outlet context={contextValue} />
        </main>
      </div>
    </div>
  );
}
