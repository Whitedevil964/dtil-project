import React, { useState } from 'react';
import { BrainCircuit, GraduationCap, BookOpen, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { ALL_STUDENTS, TEACHERS } from '../data/schoolData';
import { getAcademicYear } from '../utils/dateUtils';
import './LoginPage.css';

export default function LoginPage({ onLogin }) {
  const [tab, setTab] = useState('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (tab === 'student') {
        const found = ALL_STUDENTS.find(
          u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
        );
        if (!found) { setError('Invalid credentials. Check your generated PDF.'); return; }
        onLogin({ ...found, role: 'student', dept: `FY B.Tech \u2013 Division ${found.div}` });
      } else {
        const teacher = Object.values(TEACHERS).find(
          t => t.email.toLowerCase() === email.toLowerCase() && t.password === password
        );
        if (!teacher) { setError('Invalid credentials.'); return; }
        onLogin({ ...teacher, role: 'teacher', dept: teacher.subjects.join(', ') });
      }
    }, 1000);
  };

  return (
    <div className="login-bg">
      <div className="blob blob-1" /><div className="blob blob-2" /><div className="blob blob-3" />
      <div className="login-card">
        <div className="login-brand">
          <div className="login-brand-icon" style={{ background: 'transparent', padding: 0 }}>
            <img src="/logo.jpg" alt="DYPCOEI Logo" style={{ width: '48px', height: '48px', objectFit: 'contain', borderRadius: '6px', background: '#fff' }} />
          </div>
          <div>
            <h1 className="login-brand-name">DYPCOEI<span className="login-brand-ai"> NEURAL CORE</span></h1>
            <p className="login-brand-tagline">Quantum Synthetic Construct &middot; FY {getAcademicYear()}</p>
          </div>
        </div>

        <div className="role-tabs">
          <button className={`role-tab ${tab === 'student' ? 'active' : ''}`}
            onClick={() => { setTab('student'); setEmail(''); setPassword(''); setError(''); }}>
            <GraduationCap size={16} /> Student
          </button>
          <button className={`role-tab ${tab === 'teacher' ? 'active' : ''}`}
            onClick={() => { setTab('teacher'); setEmail(''); setPassword(''); setError(''); }}>
            <BookOpen size={16} /> Neural Admin
          </button>
        </div>

        <p className="login-welcome">Initializing neural handshake... {tab === 'student' ? 'Student Unit' : 'Admin Node'} recognized.</p>

        <form className="login-form" onSubmit={handleLogin}>
          <div className="input-group">
            <label>Quantum Identity (Email)</label>
            <input type="email" placeholder="you@dypcoei.edu.in" value={email}
              onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="input-group">
            <label>Password</label>
            <div className="pass-wrapper">
              <input type={showPass ? 'text' : 'password'} placeholder="Enter your password"
                value={password} onChange={e => setPassword(e.target.value)} required />
              <button type="button" className="eye-btn" onClick={() => setShowPass(!showPass)}>
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          {error && <div className="login-error">{error}</div>}
          <div style={{ textAlign: 'right', marginTop: '-8px' }}>
            <button type="button" className="demo-fill-btn" style={{ fontSize: '0.75rem', textDecoration: 'none' }} onClick={() => setError('Neural recovery system initializing... Check your institutional email.')}>
              Forgot Password?
            </button>
          </div>
          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? <span className="login-spinner" /> : <><ArrowRight size={16} /> Establish Link</>}
          </button>
        </form>

        <div className="login-footer">
          Dr. D. Y. Patil Automated Neural Campus<br />
          <span>Holographic Node · Talegaon, Sector 4 · 2078 Standards</span>
        </div>
      </div>
    </div>
  );
}
