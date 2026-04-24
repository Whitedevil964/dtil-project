import React, { useState } from 'react';
import { Bell, Moon, Shield, User, Globe } from 'lucide-react';

const SECTIONS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'appearance', label: 'Appearance', icon: Moon },
  { id: 'privacy', label: 'Privacy & Security', icon: Shield },
];

export default function SettingsPage({ user }) {
  const [activeSection, setActiveSection] = useState('profile');
  const [toggles, setToggles] = useState({
    deadlineReminder: true, classAlert: true, roomChange: true,
    newAssignment: true, email: false, darkMode: true,
  });

  const toggle = (key) => {
    if (key === 'darkMode') {
      const newMode = !toggles.darkMode;
      setToggles(p => ({ ...p, darkMode: newMode }));
      if (newMode) {
        document.body.classList.remove('light-mode');
      } else {
        document.body.classList.add('light-mode');
      }
    } else {
      setToggles(p => ({ ...p, [key]: !p[key] }));
    }
  };

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      <h1 className="page-title">Settings</h1>
      <p className="page-subtitle">Customise your DYPCOEI AI platform experience.</p>

      <div className="settings-grid">
        {/* Nav */}
        <div className="settings-nav glass" style={{ padding: '12px', alignSelf: 'start' }}>
          {SECTIONS.map(({ id, label, icon: Icon }) => (
            <div
              key={id}
              className={`settings-nav-item ${activeSection === id ? 'active' : ''}`}
              onClick={() => setActiveSection(id)}
            >
              <Icon size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} />
              {label}
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="glass" style={{ padding: '24px' }}>
          {activeSection === 'profile' && (
            <div>
              <h3 className="settings-section-title" style={{ marginBottom: 20, fontSize: '1.05rem', fontWeight: 700 }}>Profile Information</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {[
                  { label: 'Full Name', value: user?.name },
                  { label: 'Email', value: user?.email },
                  { label: 'Department', value: user?.dept },
                  { label: 'Role', value: user?.role === 'teacher' ? 'Faculty' : 'Student' },
                ].map(f => (
                  <div key={f.label}>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#64748b', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {f.label}
                    </label>
                    <input
                      style={{ width: '100%', background: 'rgba(var(--invert-rgb),0.05)', border: '1px solid rgba(var(--invert-rgb),0.1)', color: '#f1f5f9', padding: '10px 14px', borderRadius: '10px', fontSize: '0.9rem', outline: 'none' }}
                      defaultValue={f.value ?? ''}
                      readOnly
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'notifications' && (
            <div>
              <h3 style={{ marginBottom: 20, fontSize: '1.05rem', fontWeight: 700 }}>Notification Preferences</h3>
              <div className="settings-group">
                {[
                  { key: 'deadlineReminder', label: 'Deadline Reminders', desc: 'Automated alerts 24h, 1h before each deadline' },
                  { key: 'classAlert', label: 'Class Alerts', desc: 'Reminder 15 minutes before each lecture' },
                  { key: 'roomChange', label: 'Room Change Alerts', desc: 'Instant notification when AI detects room change' },
                  { key: 'newAssignment', label: 'New Assignments', desc: 'When a teacher posts a new task or submission' },
                  { key: 'email', label: 'Email Notifications', desc: 'Send summary to your college email daily' },
                ].map(item => (
                  <div key={item.key} className="settings-row glass" style={{ borderRadius: 10 }}>
                    <div>
                      <div className="settings-row-label">{item.label}</div>
                      <div className="settings-row-desc">{item.desc}</div>
                    </div>
                    <label className="toggle">
                      <input type="checkbox" checked={toggles[item.key]} onChange={() => toggle(item.key)} />
                      <span className="toggle-slider" />
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'appearance' && (
            <div>
              <h3 style={{ marginBottom: 20, fontSize: '1.05rem', fontWeight: 700 }}>Appearance</h3>
              <div className="settings-group">
                <div className="settings-row glass" style={{ borderRadius: 10 }}>
                  <div>
                    <div className="settings-row-label">Dark Mode</div>
                    <div className="settings-row-desc">Use dark theme across the platform</div>
                  </div>
                  <label className="toggle">
                    <input type="checkbox" checked={toggles.darkMode} onChange={() => toggle('darkMode')} />
                    <span className="toggle-slider" />
                  </label>
                </div>
                <div style={{ padding: '14px', color: '#64748b', fontSize: '0.85rem', background: 'rgba(var(--invert-rgb),0.03)', borderRadius: 10 }}>
                  More appearance options coming soon.
                </div>
              </div>
            </div>
          )}

          {activeSection === 'privacy' && (
            <div>
              <h3 style={{ marginBottom: 20, fontSize: '1.05rem', fontWeight: 700 }}>Privacy & Security</h3>
              <div style={{ padding: '16px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 10, color: '#10b981', fontSize: '0.85rem', marginBottom: 16 }}>
                🔒 Your account is secured with DYPCOEI College SSO. All data is stored on campus servers only.
              </div>
              <div style={{ padding: '14px', color: '#64748b', fontSize: '0.85rem', background: 'rgba(var(--invert-rgb),0.03)', borderRadius: 10 }}>
                Contact IT support: it@dypcoei.edu.in for security-related requests.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
