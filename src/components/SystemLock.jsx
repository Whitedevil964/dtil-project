import React, { useState } from 'react';
import { ShieldAlert, Lock, Unlock, Zap, Terminal } from 'lucide-react';
import './SystemLock.css';

export default function SystemLock({ onUnlock }) {
  const [key, setKey] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const MASTER_KEY = "2982";

  const handleUnlock = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      if (key === MASTER_KEY) {
        localStorage.setItem('MASTER_ACCESS_GRANTED', 'true');
        onUnlock();
      } else {
        setError('ACCESS DENIED. UNAUTHORIZED ATTEMPT LOGGED.');
        setLoading(false);
      }
    }, 800);
  };

  return (
    <div className="sys-lock-bg">
      <div className="sys-overlay"></div>
      <div className="sys-lock-card">
        <div className="sys-icon-ring">
          <ShieldAlert size={48} color="#ef4444" className="pulse-alert" />
        </div>
        
        <h1 className="sys-title">SYSTEM SECURED</h1>
        <p className="sys-subtitle">DYPCOEI Platform is currently locked by the Super Admin.</p>
        
        <div className="sys-terminal">
          <div className="sys-term-header">
            <span><Terminal size={12}/> admin@root:~</span>
            <span>RESTRICTED</span>
          </div>
          <form className="sys-form" onSubmit={handleUnlock}>
            <p className="sys-prompt">Waiting for Master Access Key...</p>
            <div className="sys-input-wrapper">
              <span className="sys-cursor">{'>'}</span>
              <input 
                type="password" 
                autoFocus
                value={key}
                onChange={e => setKey(e.target.value)}
                placeholder="ENTER KEY" 
                className="sys-input"
              />
            </div>
            
            {error && <div className="sys-error">{error}</div>}
            
            <button type="submit" className="sys-btn" disabled={loading}>
              {loading ? <span className="login-spinner" /> : <><Lock size={16} /> VERIFY ACCESS</>}
            </button>
          </form>
        </div>

        <div className="sys-footer">
          <Lock size={12} /> Only authorized creator (Zaid) holds the master key.
        </div>
      </div>
    </div>
  );
}
