import {
  ArrowLeft,
  HeartPulse,
  LayoutDashboard,
  LogOut,
  MapPin,
  PhoneCall,
  Plus,
  Settings,
  ShieldCheck,
  Tag,
  Users,
  X
} from 'lucide-react';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface Props {
  onOpenActivation?: () => void;
}

export default function Sidebar({ onOpenActivation }: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Read current logged-in user from localStorage
  const storedUser = localStorage.getItem('user');
  let displayName = 'Sarah Sinclair';
  let initials = 'SS';
  if (storedUser) {
    try {
      const parsed = JSON.parse(storedUser);
      const name = parsed.userName || parsed.name || parsed.email;
      if (name) {
        displayName = name.replace(/_/g, ' ');
        const parts = displayName.trim().split(/\s+/);
        if (parts.length >= 2) {
          initials = (parts[0][0] + parts[1][0]).toUpperCase();
        } else if (parts[0]) {
          initials = parts[0].substring(0, 2).toUpperCase();
        }
      }
    } catch {
      // fallback to default
    }
  }

  const navItems = [
    { id: 'overview', path: '/dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'tags', path: '/dashboard/tags', label: 'Smart Tags', icon: Tag },
    { id: 'children', path: '/dashboard/children', label: 'Children Profiles', icon: Users, count: 2 },
    { id: 'map', path: '/dashboard/map', label: 'Live Scan Map', icon: MapPin, badge: 'Live' },
    { id: 'contacts', path: '/dashboard/contacts', label: 'Emergency Contacts', icon: PhoneCall },
    { id: 'medical', path: '/dashboard/medical', label: 'Medical & Allergy', icon: HeartPulse },
    { id: 'settings', path: '/dashboard/settings', label: 'Safety & Settings', icon: Settings }
  ];

  return (
    <aside className={`dash-sidebar ${mobileSidebarOpen ? 'open' : ''}`}>
      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div
          className="dash-sidebar-overlay"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar Brand Header */}
      <div className="dash-sidebar-header">
        <div className="dash-sidebar-brand" onClick={() => navigate('/')}>
          <div className="brand-icon-box">
            <ShieldCheck size={22} strokeWidth={2.4} />
          </div>
          <div>
            <div className="dash-brand-title">KiddieTag</div>
            <span className="dash-brand-badge">CAREGIVER HUB</span>
          </div>
        </div>

        <button
          className="dash-sidebar-close-btn"
          onClick={() => setMobileSidebarOpen(false)}
          aria-label="Close sidebar"
        >
          <X size={20} />
        </button>
      </div>


      {/* Sidebar Navigation Items */}
      <nav className="dash-sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.path === '/dashboard'
            ? location.pathname === '/dashboard'
            : location.pathname.startsWith(item.path);

          return (
            <button
              key={item.id}
              className={`dash-nav-btn ${isActive ? 'active' : ''}`}
              onClick={() => {
                navigate(item.path);
                setMobileSidebarOpen(false);
              }}
            >
              <div className="dash-nav-btn-left">
                <Icon size={19} className="dash-nav-icon" />
                <span className="dash-nav-label">{item.label}</span>
              </div>
              {item.count !== undefined && (
                <span className="dash-nav-count">{item.count}</span>
              )}
              {item.badge && (
                <span className="dash-nav-live-pill">{item.badge}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Sidebar Bottom / Footer Actions */}
      <div className="dash-sidebar-footer">
        <button
          className="dash-activate-tag-btn"
          onClick={() => onOpenActivation?.()}
        >
          <Plus size={16} />
          <span>Activate New Tag ⚡</span>
        </button>

        {/* User Profile Snippet */}
        <div className="dash-user-card">
          <div className="dash-user-avatar">{initials}</div>
          <div className="dash-user-info">
            <div className="dash-user-name">{displayName}</div>
            <div className="dash-user-plan">Family Care • Active</div>
          </div>
        </div>

        {/* Back & Sign Out */}
        <div className="dash-footer-nav-row">
          <button className="dash-footer-link" onClick={() => navigate('/')}>
            <ArrowLeft size={15} />
            <span>Back to Site</span>
          </button>
          <button 
            className="dash-footer-link danger" 
            onClick={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              navigate('/auth/login');
            }}
          >
            <LogOut size={15} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
