import React from 'react';
import { LayoutDashboard, Calendar, CheckSquare, MessageSquare, Settings, BrainCircuit, LogOut, ShieldCheck, X } from 'lucide-react';
import './Sidebar.css';

export default function Sidebar({ activePage, setActivePage, user, onLogout, isTeacher, unreadMessageCount = 0, profilePics, mobileMenuOpen, setMobileMenuOpen }) {
  const NAV_ITEMS = [
    { id: 'dashboard', label: isTeacher ? 'Teacher Portal' : 'Dashboard', icon: isTeacher ? ShieldCheck : LayoutDashboard },
    { id: 'schedule',  label: 'Schedule',           icon: Calendar },
    { id: 'tasks',     label: isTeacher ? 'Student Tasks' : 'Tasks & Deadlines', icon: CheckSquare },
    { id: 'attendance', label: 'Attendance',        icon: ShieldCheck },
    { id: 'messages',  label: 'Messages',            icon: MessageSquare },
    { id: 'settings',  label: 'Settings',            icon: Settings },
  ];
  return (
    <aside className={`sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`}>
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon" style={{ background: 'transparent', padding: 0 }}>
          <img src="/logo.jpg" alt="DYPCOEI Logo" style={{ width: '36px', height: '36px', objectFit: 'contain', borderRadius: '4px' }} />
        </div>
        <span className="sidebar-brand-name gradient-text-red">DYPCOEI</span>
        
        {mobileMenuOpen && (
          <button className="mobile-close-btn" onClick={() => setMobileMenuOpen(false)}>
            <X size={20} />
          </button>
        )}
      </div>

      <nav className="sidebar-nav">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            className={`nav-item ${activePage === id ? 'active' : ''}`}
            onClick={() => setActivePage(id)}
            style={{ position: 'relative' }}
          >
            <Icon size={18} />
            <span>{label}</span>
            {id === 'messages' && unreadMessageCount > 0 && (
              <span style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: '#ef4444',
                color: 'white',
                fontSize: '0.65rem',
                fontWeight: 'bold',
                padding: '2px 6px',
                borderRadius: '10px',
                minWidth: '18px',
                textAlign: 'center'
              }}>
                {unreadMessageCount}
              </span>
            )}
          </button>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <div className="sidebar-user-info">
          <div className="sidebar-avatar" style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {profilePics?.[user?.id] ? (
              <img src={profilePics[user.id]} alt="Profile" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
            ) : (user?.name?.[0] ?? 'U')}
          </div>
          <div className="sidebar-user-text">
            <p className="sidebar-user-name">{user?.name ?? 'User'}</p>
            <p className="sidebar-user-role">{user?.role === 'teacher' ? 'Teacher' : 'Student'}</p>
          </div>
        </div>
        <button className="logout-btn" onClick={onLogout} title="Sign out">
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  );
}
