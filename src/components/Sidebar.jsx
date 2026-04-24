import React from 'react';
import { LayoutDashboard, Calendar, CheckSquare, MessageSquare, Settings, BrainCircuit, LogOut, ShieldCheck } from 'lucide-react';
import './Sidebar.css';

export default function Sidebar({ activePage, setActivePage, user, onLogout, isTeacher }) {
  const NAV_ITEMS = [
    { id: 'dashboard', label: isTeacher ? 'Teacher Portal' : 'Dashboard', icon: isTeacher ? ShieldCheck : LayoutDashboard },
    { id: 'schedule',  label: 'Schedule',           icon: Calendar },
    { id: 'tasks',     label: isTeacher ? 'Student Tasks' : 'Tasks & Deadlines', icon: CheckSquare },
    { id: 'messages',  label: 'Messages',            icon: MessageSquare },
    { id: 'settings',  label: 'Settings',            icon: Settings },
  ];
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon">
          <BrainCircuit size={20} color="#fff" />
        </div>
        <span className="sidebar-brand-name gradient-text-red">DYPCOEI</span>
      </div>

      <nav className="sidebar-nav">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            className={`nav-item ${activePage === id ? 'active' : ''}`}
            onClick={() => setActivePage(id)}
          >
            <Icon size={18} />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <div className="sidebar-user-info">
          <div className="sidebar-avatar">
            {user?.name?.[0] ?? 'U'}
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
