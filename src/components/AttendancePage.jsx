import React from 'react';
import { BookOpen, AlertTriangle, TrendingUp, Calendar } from 'lucide-react';

export default function AttendancePage({ user }) {
  const MOCK_ATTENDANCE = [
    { subject: 'AEC', code: 'AEC 101', attended: 28, total: 30, color: '#8b5cf6' },
    { subject: 'MEC', code: 'MEC 102', attended: 22, total: 25, color: '#3b82f6' },
    { subject: 'MEE', code: 'MEE 103', attended: 15, total: 20, color: '#3b82f6' },
    { subject: 'OOP', code: 'OOP 104', attended: 25, total: 26, color: '#ef4444' },
    { subject: 'DTIL', code: 'DTIL 105', attended: 12, total: 18, color: '#10b981' },
  ];

  const overallAttended = MOCK_ATTENDANCE.reduce((acc, curr) => acc + curr.attended, 0);
  const overallTotal = MOCK_ATTENDANCE.reduce((acc, curr) => acc + curr.total, 0);
  const overallPercentage = Math.round((overallAttended / overallTotal) * 100);

  const lowAttendance = MOCK_ATTENDANCE.filter(s => (s.attended / s.total) < 0.75);

  return (
    <div className="fade-in" style={{ maxWidth: 1000, margin: '0 auto' }}>
      <h1 className="page-title">Attendance Analytics</h1>
      <p className="page-subtitle">Real-time biometric synchronization from Neural Campus Nodes.</p>

      {lowAttendance.length > 0 && (
        <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '14px 20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '24px', color: '#fca5a5' }}>
          <AlertTriangle size={24} />
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Neural Warning: Attendance Threshold Breach</div>
            <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>Your attendance in {lowAttendance.map(s => s.subject).join(', ')} is below 75%. Imminent deregistration risk.</div>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '24px', marginBottom: '24px' }}>
        <div className="glass" style={{ padding: '30px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
          <div style={{ position: 'relative', width: 160, height: 160, marginBottom: '20px' }}>
            <svg style={{ transform: 'rotate(-90deg)', width: 160, height: 160 }}>
              <circle cx="80" cy="80" r="70" fill="none" stroke="rgba(var(--invert-rgb), 0.05)" strokeWidth="12" />
              <circle cx="80" cy="80" r="70" fill="none" stroke="#e11d48" strokeWidth="12" strokeDasharray="440" strokeDashoffset={440 - (440 * overallPercentage) / 100} strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s ease-out' }} />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '2.2rem', fontWeight: 800, color: '#f1f5f9' }}>{overallPercentage}%</span>
              <span style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Overall</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '20px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f1f5f9' }}>{overallAttended}</div>
              <div style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase' }}>Present</div>
            </div>
            <div style={{ width: 1, background: 'rgba(var(--invert-rgb), 0.1)' }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f1f5f9' }}>{overallTotal}</div>
              <div style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase' }}>Total</div>
            </div>
          </div>
        </div>

        <div className="glass" style={{ padding: '24px' }}>
          <div style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <TrendingUp size={16} color="#e11d48" /> Subject-wise Performance
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {MOCK_ATTENDANCE.map(s => {
              const perc = Math.round((s.attended / s.total) * 100);
              return (
                <div key={s.subject}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '6px' }}>
                    <span style={{ fontWeight: 600, color: '#94a3b8' }}>{s.subject} ({s.code})</span>
                    <span style={{ color: perc < 75 ? '#ef4444' : '#10b981', fontWeight: 700 }}>{perc}%</span>
                  </div>
                  <div style={{ height: '6px', background: 'rgba(var(--invert-rgb), 0.05)', borderRadius: '10px', overflow: 'hidden' }}>
                    <div style={{ width: `${perc}%`, height: '100%', background: perc < 75 ? '#ef4444' : s.color, borderRadius: '10px', transition: 'width 1s ease-out' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="section-title">Detailed Attendance Log</div>
      <div className="glass" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(var(--invert-rgb), 0.08)' }}>
              <th style={{ padding: '12px 16px', textAlign: 'left', color: '#64748b' }}>Subject</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', color: '#64748b' }}>Status</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', color: '#64748b' }}>Classes Attended</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', color: '#64748b' }}>Required to 75%</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_ATTENDANCE.map(s => {
              const perc = (s.attended / s.total) * 100;
              const req = Math.max(0, Math.ceil((0.75 * s.total - s.attended) / 0.25));
              return (
                <tr key={s.subject} style={{ borderBottom: '1px solid rgba(var(--invert-rgb), 0.05)' }}>
                  <td style={{ padding: '12px 16px', color: '#f1f5f9', fontWeight: 600 }}>{s.subject}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 700, background: perc < 75 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)', color: perc < 75 ? '#ef4444' : '#10b981' }}>
                      {perc < 75 ? 'BELOW CRITICAL' : 'OPTIMAL'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', color: '#94a3b8' }}>{s.attended} / {s.total}</td>
                  <td style={{ padding: '12px 16px', color: perc < 75 ? '#ef4444' : '#64748b' }}>
                    {perc < 75 ? `Attend ${req} more classes` : 'Target achieved'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
