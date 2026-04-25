import React, { useState, useEffect } from 'react';
import { Bell, Moon, Shield, User, Globe } from 'lucide-react';

const SECTIONS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'appearance', label: 'Appearance', icon: Moon },
  { id: 'privacy', label: 'Privacy & Security', icon: Shield },
];

export default function SettingsPage({ user, profilePics, setProfilePics, profilePrivacy, setProfilePrivacy, addToast }) {
  const [activeSection, setActiveSection] = useState('profile');
  const [toggles, setToggles] = useState({
    emailNotif: true,
    pushNotif: true,
    assignmentReminders: true,
    classAlerts: true,
    showProfilePic: profilePrivacy?.[user?.id] !== false,
  });

  const [theme, setTheme] = useState(() => localStorage.getItem('DYPCOEI_THEME') || 'dark-neural');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('DYPCOEI_THEME', theme);
  }, [theme]);

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target.result;
        setProfilePics(p => ({ ...p, [user.id]: base64 }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePhotoDelete = () => {
    setProfilePics(p => {
      const newPics = { ...p };
      delete newPics[user.id];
      return newPics;
    });
  };

  const toggle = (key) => {
    if (key === 'showProfilePic') {
      const newVal = !toggles.showProfilePic;
      setToggles(p => ({ ...p, showProfilePic: newVal }));
      setProfilePrivacy(p => ({ ...p, [user.id]: newVal }));
    } else {
      setToggles(p => ({ ...p, [key]: !p[key] }));
    }
  };

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      <h1 className="page-title">Settings</h1>
      <p className="page-subtitle">Customise your DYPCOEI AI platform experience.</p>

      <div className="settings-grid">
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

        <div className="glass" style={{ padding: '24px' }}>
          {activeSection === 'profile' && (
            <div>
              <h3 className="settings-section-title" style={{ marginBottom: 20, fontSize: '1.05rem', fontWeight: 700 }}>Profile Information</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px' }}>
                <div className="header-avatar" style={{ width: 70, height: 70, fontSize: '2rem', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(var(--primary-rgb), 0.1)', color: 'var(--primary)', borderRadius: '50%' }}>
                  {profilePics?.[user?.id] ? (
                    <img src={profilePics[user.id]} alt="Profile" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                  ) : (user?.name?.[0] ?? 'U')}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  <label style={{ display: 'inline-block', padding: '8px 16px', background: 'rgba(var(--primary-rgb), 0.2)', color: 'var(--primary)', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' }}>
                    Upload Photo
                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoUpload} />
                  </label>
                  {profilePics?.[user?.id] && (
                    <button 
                      onClick={handlePhotoDelete}
                      style={{ padding: '8px 16px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' }}
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {[
                  { label: 'Full Name', value: user?.name, id: 'name' },
                  { label: 'Email', value: user?.email, id: 'email' },
                  { label: 'Department', value: user?.dept, id: 'dept' },
                  { label: 'Phone Number', value: '+91 98765 43210', id: 'phone', editable: true },
                  { label: 'Neural ID (Roll No)', value: 'FY-2024-C32', id: 'roll', editable: true },
                ].map(f => (
                  <div key={f.label}>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#64748b', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {f.label}
                    </label>
                    <input
                      style={{ width: '100%', background: 'rgba(var(--invert-rgb),0.05)', border: '1px solid rgba(var(--invert-rgb),0.1)', color: '#f1f5f9', padding: '10px 14px', borderRadius: '10px', fontSize: '0.9rem', outline: 'none' }}
                      defaultValue={f.value ?? ''}
                      readOnly={!f.editable}
                    />
                  </div>
                ))}
                <button 
                  className="btn btn-primary" 
                  style={{ marginTop: '10px', width: 'fit-content', alignSelf: 'flex-start' }}
                  onClick={() => addToast({ type: 'success', title: 'Neural Record', msg: 'Profile information synchronized successfully.' })}
                >
                  Save Changes
                </button>
              </div>

              {/* Digital ID Card */}
              <div style={{ marginTop: '30px' }}>
                <h4 style={{ fontSize: '0.9rem', marginBottom: '16px' }}>Student Digital ID</h4>
                <div className="id-card-wrap glass" style={{ padding: '20px', borderRadius: '16px', background: 'linear-gradient(135deg, rgba(225, 29, 72, 0.1), rgba(139, 92, 246, 0.05))', border: '1px solid rgba(225, 29, 72, 0.2)', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ display: 'flex', gap: '20px' }}>
                    <div style={{ width: '80px', height: '80px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {profilePics?.[user?.id] ? <img src={profilePics[user.id]} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <User size={40} color="#64748b" />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#f1f5f9' }}>{user?.name}</div>
                      <div style={{ fontSize: '0.7rem', color: '#e11d48', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>Neural Academic Node</div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.65rem' }}>
                        <div>
                          <div style={{ color: '#64748b' }}>ROLL NUMBER</div>
                          <div style={{ color: '#94a3b8', fontWeight: 600 }}>FY-2024-C32</div>
                        </div>
                        <div>
                          <div style={{ color: '#64748b' }}>DEPARTMENT</div>
                          <div style={{ color: '#94a3b8', fontWeight: 600 }}>B.TECH (DS)</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <button className="btn btn-secondary" style={{ marginTop: '12px', fontSize: '0.8rem' }} onClick={() => addToast({ type:'info', title:'Neural ID', msg:'ID synchronization initializing for download...' })}>
                  Generate & Download ID
                </button>
              </div>
            </div>
          )}

          {activeSection === 'notifications' && (
            <div>
              <h3 style={{ marginBottom: 20, fontSize: '1.05rem', fontWeight: 700 }}>Notification Preferences</h3>
              <div className="settings-group">
                {[
                  { key: 'emailNotif', label: 'Email Alerts', desc: 'Summary reports to your college email' },
                  { key: 'pushNotif', label: 'Push Notifications', desc: 'Real-time updates to your device' },
                  { key: 'assignmentReminders', label: 'Assignment Deadlines', desc: 'Alerts 24h before submission' },
                  { key: 'classAlerts', label: 'Class Schedules', desc: '15-minute pre-lecture notifications' },
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
              <h3 style={{ marginBottom: 20, fontSize: '1.05rem', fontWeight: 700 }}>Appearance & Themes</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '24px' }}>
                {[
                  { id: 'dark-neural', label: 'Dark Neural', color: '#e11d48' },
                  { id: 'arctic-core', label: 'Arctic Core', color: '#3b82f6' },
                  { id: 'neon-pulse', label: 'Neon Pulse', color: '#10b981' },
                ].map(t => (
                  <div key={t.id} 
                    className={`theme-card glass ${theme === t.id ? 'active' : ''}`}
                    onClick={() => setTheme(t.id)}
                    style={{ padding: '16px', borderRadius: '12px', cursor: 'pointer', textAlign: 'center', border: theme === t.id ? `2px solid ${t.color}` : '1px solid rgba(var(--invert-rgb),0.05)' }}>
                    <div style={{ width: '40px', height: '40px', background: t.color, borderRadius: '50%', margin: '0 auto 10px', boxShadow: theme === t.id ? `0 0 15px ${t.color}` : 'none' }} />
                    <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>{t.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

           {activeSection === 'privacy' && (
            <div>
              <h3 style={{ marginBottom: 20, fontSize: '1.05rem', fontWeight: 700 }}>Privacy & Security</h3>
              <div className="settings-row glass" style={{ borderRadius: 10, marginBottom: 16 }}>
                <div>
                  <div className="settings-row-label">Public Profile Photo</div>
                  <div className="settings-row-desc">Allow other users to see your uploaded profile picture</div>
                </div>
                <label className="toggle">
                  <input type="checkbox" checked={toggles.showProfilePic} onChange={() => toggle('showProfilePic')} />
                  <span className="toggle-slider" />
                </label>
              </div>

              {/* Change Password */}
              <div className="glass" style={{ padding: '20px', borderRadius: 12, marginBottom: 16 }}>
                <h4 style={{ fontSize: '0.9rem', marginBottom: '16px' }}>Reset Security Protocol (Change Password)</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <input type="password" placeholder="Current Neural Key" className="chat-input" style={{ width: '100%', borderRadius: 8 }} />
                  <input type="password" placeholder="New Neural Key" className="chat-input" style={{ width: '100%', borderRadius: 8 }} />
                  <input type="password" placeholder="Confirm New Key" className="chat-input" style={{ width: '100%', borderRadius: 8 }} />
                  <button className="btn btn-secondary" style={{ width: 'fit-content' }} onClick={() => addToast({ type:'success', title:'Security Protocol', msg:'Password updated successfully.' })}>Update Password</button>
                </div>
              </div>

              <div style={{ padding: '16px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 10, color: '#10b981', fontSize: '0.85rem', marginBottom: 16 }}>
                🔒 Your account is secured with DYPCOEI College SSO. All data is stored on campus servers only.
              </div>
              
              <div style={{ padding: '14px', background: 'rgba(239, 68, 68, 0.05)', borderRadius: 10, border: '1px solid rgba(239, 68, 68, 0.1)' }}>
                <div className="settings-row-label" style={{ color: '#ef4444' }}>Danger Zone</div>
                <div className="settings-row-desc" style={{ marginBottom: 10 }}>Once you delete your node, there is no going back.</div>
                <button className="btn btn-secondary" style={{ color: '#ef4444' }} onClick={() => addToast({ type: 'danger', title: 'System Warning', msg: 'Account deletion requires physical presence at IT Dept.' })}>Terminate Node</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
