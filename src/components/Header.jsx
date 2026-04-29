import React, { useState } from 'react';
import { Search, Bell, X, Menu } from 'lucide-react';
import './Header.css';

export default function Header({ user, addToast, profilePics, mobileMenuOpen, setMobileMenuOpen, broadcastCount = 0 }) {
  const [notifOpen, setNotifOpen] = useState(false);
  const [searchVal, setSearchVal] = useState('');

  const NOTIFS = [
    { id: 1, icon: '⚠️', text: 'Neural Network assignment due tonight at 11:59 PM', time: '5m ago', type: 'danger' },
    { id: 2, icon: '📍', text: 'Room change: Quantum Computing → Physics Block 102', time: '20m ago', type: 'info' },
    { id: 3, icon: '📋', text: 'New assignment posted in Data Structures', time: '1h ago', type: 'warning' },
    { id: 4, icon: '✅', text: 'Your AI timetable has been optimized for this week', time: '3h ago', type: 'success' },
  ];

  return (
    <header className="header">
      <div className="header-left-mobile">
        <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(true)}>
          <Menu size={24} />
        </button>
      </div>

      <div className="header-search">
        <Search size={16} />
        <input
          type="text"
          placeholder="Search classes, assignments, teachers..."
          value={searchVal}
          onChange={e => {
            setSearchVal(e.target.value);
            if (e.target.value.length > 2) {
              addToast({ type: 'info', title: 'Neural Search', msg: `Searching across indices for: "${e.target.value}"` });
            }
          }}
        />
        {searchVal && (
          <button className="search-clear" onClick={() => setSearchVal('')}><X size={14} /></button>
        )}
      </div>

      <div className="header-right">
        <div className="header-date">
          {new Date().toLocaleDateString('en-IN', { weekday:'long', month:'short', day:'numeric' })}
        </div>

        <div className="notif-wrapper">
          <button
            className={`notif-btn ${notifOpen ? 'active' : ''}`}
            onClick={() => setNotifOpen(!notifOpen)}
          >
            <Bell size={20} />
            {broadcastCount > 0 && <span className="notif-badge">{broadcastCount}</span>}
          </button>

          {notifOpen && (
            <div className="notif-dropdown glass">
              <div className="notif-dropdown-header">
                <span>Notifications</span>
                <button className="btn-ghost" onClick={() => addToast({ type:'success', title:'All Cleared', msg:'Notifications marked as read.' })}>
                  Mark all read
                </button>
              </div>
              {NOTIFS.map(n => (
                <div key={n.id} className={`notif-item notif-${n.type}`}>
                  <span className="notif-icon">{n.icon}</span>
                  <div className="notif-content">
                    <p className="notif-text">{n.text}</p>
                    <span className="notif-time">{n.time}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="header-user">
          <div className="header-avatar">
            {profilePics?.[user?.id] ? (
              <img src={profilePics[user.id]} alt="Profile" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
            ) : (user?.name?.[0] ?? 'U')}
          </div>
          <div className="header-user-info">
            <span className="header-user-name">{user?.name}</span>
            <span className="header-user-role">{user?.dept}</span>
          </div>
        </div>
      </div>
    </header>
  );
}

