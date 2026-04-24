import React, { useState } from 'react';
import { Send, Clock, CheckCircle, BookOpen, Users, Plus, X, AlertCircle } from 'lucide-react';
import { SUBJECTS, ALL_STUDENTS, TEACHERS } from '../data/schoolData';
import './TeacherPortal.css';

export default function TeacherPortal({ user, addToast, assignments, setAssignments, attendance, setAttendance }) {
  const [activeTab, setActiveTab] = useState('assignments');
  const [form, setForm] = useState({ title: '', subject: '', deadline: '', description: '', divTarget: 'C' });
  const [attDate, setAttDate] = useState(new Date().toISOString().split('T')[0]);
  const [attDiv, setAttDiv] = useState('C');
  
  const currentStudents = ALL_STUDENTS.filter(s => s.div === attDiv);
  
  const [attRecord, setAttRecord] = useState(
    Object.fromEntries(currentStudents.map(s => [s.id, attendance?.[attDate]?.[s.id] ?? null]))
  );

  // Sync attendance record when date or div changes
  const handleAttendanceChange = (d, div) => {
    setAttDate(d);
    setAttDiv(div);
    const newStudents = ALL_STUDENTS.filter(s => s.div === div);
    setAttRecord(Object.fromEntries(newStudents.map(s => [s.id, attendance?.[d]?.[s.id] ?? null])));
  };

  const markAll = (status) => {
    setAttRecord(Object.fromEntries(currentStudents.map(s => [s.id, status])));
  };

  const saveAttendance = () => {
    setAttendance(prev => ({ ...prev, [attDate]: { ...attRecord } }));
    addToast({ type: 'success', title: '✅ Attendance Saved', msg: `Attendance for ${attDate} has been recorded.` });
  };

  const sendAssignment = (e) => {
    e.preventDefault();
    if (!form.title || !form.subject || !form.deadline) return;
    const newA = {
      id: Date.now(),
      ...form,
      postedBy: user.name,
      postedAt: new Date().toLocaleString('en-IN'),
    };
    setAssignments(prev => [newA, ...prev]);
    addToast({ type: 'success', title: '📋 Assignment Sent!', msg: `"${form.title}" sent to Division ${form.divTarget}` });
    setForm({ title: '', subject: '', deadline: '', description: '', divTarget: 'C' });
  };

  const myAssignments = assignments.filter(a => a.postedBy === user.name);
  const teacherSubjects = user.subjects || [];

  return (
    <div className="teacher-portal">
      <div className="tp-header">
        <div>
          <h1 className="page-title">Teacher Portal</h1>
          <p className="page-subtitle">Welcome, {user.name} — Manage assignments and attendance</p>
        </div>
        <div className="tp-stats">
          <div className="tp-stat glass">
            <BookOpen size={16} style={{ color: '#8b5cf6' }} />
            <span>{myAssignments.length} assignments sent</span>
          </div>
          <div className="tp-stat glass">
            <Users size={16} style={{ color: '#10b981' }} />
            <span>{ALL_STUDENTS.length} total students</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tp-tabs">
        {[
          { id: 'assignments', label: '📋 Send Assignment', icon: Send },
          { id: 'attendance',  label: '✅ Mark Attendance', icon: Users },
          { id: 'history',     label: '📂 Assignment History', icon: BookOpen },
        ].map(tab => (
          <button key={tab.id}
            className={`tp-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ======================= SEND ASSIGNMENT ======================= */}
      {activeTab === 'assignments' && (
        <div className="tp-grid">
          <div className="glass" style={{ padding: '24px' }}>
            <h3 className="tp-section-title">Post New Assignment / Deadline</h3>
            <form className="tp-form" onSubmit={sendAssignment}>
              <div className="tp-form-row">
                <div className="tp-field">
                  <label>Assignment Title *</label>
                  <input type="text" placeholder="e.g. AEC Unit Test – Chapter 3"
                    value={form.title} onChange={e => setForm({...form, title: e.target.value})} required />
                </div>
                <div className="tp-field">
                  <label>Subject *</label>
                  <select value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} required>
                    <option value="">Select subject</option>
                    {Object.entries(SUBJECTS).map(([k, s]) => (
                      <option key={k} value={k}>{k} – {s.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="tp-form-row">
                <div className="tp-field">
                  <label>Deadline *</label>
                  <input type="datetime-local" value={form.deadline}
                    onChange={e => setForm({...form, deadline: e.target.value})} required />
                </div>
                <div className="tp-field">
                  <label>Target Division</label>
                  <select value={form.divTarget} onChange={e => setForm({...form, divTarget: e.target.value})}>
                    {['A','B','C','D','E','F','G'].map(d => <option key={d} value={d}>Division {d}</option>)}
                  </select>
                </div>
              </div>
              <div className="tp-field">
                <label>Description / Instructions</label>
                <textarea rows={4} placeholder="Assignment details, reference chapters, submission format..."
                  value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px' }}>
                <Send size={16} /> Send to Division {form.divTarget}
              </button>
            </form>
          </div>

          {/* Students list preview */}
          <div className="glass" style={{ padding: '20px', alignSelf: 'start', maxHeight: '500px', overflowY: 'auto' }}>
            <h3 className="tp-section-title">Division {form.divTarget} Students</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {ALL_STUDENTS.filter(s => s.div === form.divTarget).map(s => (
                <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', background: 'rgba(var(--invert-rgb),0.04)', borderRadius: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#e11d48,#8b5cf6)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:'0.85rem', color:'white', flexShrink:0 }}>
                    {s.name[0]}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{s.name}</div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Roll No. {s.rollNo}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ======================= ATTENDANCE ======================= */}
      {activeTab === 'attendance' && (
        <div>
          <div className="glass" style={{ padding: '20px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date</label>
              <input type="date" value={attDate} onChange={e => handleAttendanceChange(e.target.value, attDiv)}
                style={{ background: 'rgba(var(--invert-rgb),0.07)', border: '1px solid rgba(var(--invert-rgb),0.12)', color: '#f1f5f9', padding: '8px 12px', borderRadius: 8, outline: 'none', fontSize: '0.9rem' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Division</label>
              <select value={attDiv} onChange={e => handleAttendanceChange(attDate, e.target.value)}
                style={{ background: 'rgba(var(--invert-rgb),0.07)', border: '1px solid rgba(var(--invert-rgb),0.12)', color: '#f1f5f9', padding: '8px 12px', borderRadius: 8, outline: 'none', fontSize: '0.9rem' }}>
                {['A','B','C','D','E','F','G'].map(d => <option key={d} value={d}>Div {d}</option>)}
              </select>
            </div>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
              <button className="btn btn-secondary" onClick={() => markAll('P')}>Mark All Present</button>
              <button className="btn btn-secondary" onClick={() => markAll('A')}>Mark All Absent</button>
            </div>
          </div>

          <div className="glass" style={{ padding: '0', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ background: 'rgba(var(--invert-rgb),0.04)' }}>
                  {['Roll No', 'Student Name', 'Present', 'Absent', 'Leave'].map(h => (
                    <th key={h} style={{ padding: '14px 16px', textAlign: 'left', color: '#64748b', fontWeight: 600, fontSize: '0.8rem' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {currentStudents.map((s, i) => (
                  <tr key={s.id} style={{ borderTop: '1px solid rgba(var(--invert-rgb),0.05)' }}>
                    <td style={{ padding: '14px 16px', color: '#64748b' }}>{s.rollNo}</td>
                    <td style={{ padding: '14px 16px', fontWeight: 600 }}>{s.name}</td>
                    {['P','A','L'].map(status => (
                      <td key={status} style={{ padding: '14px 16px' }}>
                        <label className="att-radio">
                          <input type="radio" name={`att_${s.id}`} value={status}
                            checked={attRecord[s.id] === status}
                            onChange={() => setAttRecord(r => ({ ...r, [s.id]: status }))} />
                          <span className={`att-radio-label att-${status.toLowerCase()}`}>
                            {status === 'P' ? '✅ Present' : status === 'A' ? '❌ Absent' : '🟡 Leave'}
                          </span>
                        </label>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary */}
          <div style={{ display: 'flex', gap: 12, marginTop: 16, flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {['P','A','L'].map(s => {
                const count = Object.values(attRecord).filter(v => v === s).length;
                const colors = { P: '#10b981', A: '#ef4444', L: '#f59e0b' };
                const labels = { P: 'Present', A: 'Absent', L: 'Leave' };
                return (
                  <div key={s} className="glass" style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ color: colors[s], fontWeight: 700, fontSize: '1.2rem' }}>{count}</span>
                    <span style={{ color: '#64748b', fontSize: '0.82rem' }}>{labels[s]}</span>
                  </div>
                );
              })}
              <div className="glass" style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: '#94a3b8', fontWeight: 700, fontSize: '1.2rem' }}>
                  {Object.values(attRecord).filter(v => v === null).length}
                </span>
                <span style={{ color: '#64748b', fontSize: '0.82rem' }}>Unmarked</span>
              </div>
            </div>
            <button className="btn btn-primary" style={{ marginLeft: 'auto' }} onClick={saveAttendance}>
              <CheckCircle size={16} /> Save Attendance
            </button>
          </div>
        </div>
      )}

      {/* ======================= HISTORY ======================= */}
      {activeTab === 'history' && (
        <div>
          {myAssignments.length === 0 ? (
            <div className="glass" style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
              No assignments posted yet. Use "Send Assignment" tab above.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {myAssignments.map(a => {
                const subj = SUBJECTS[a.subject];
                return (
                  <div key={a.id} className="glass glass-hover" style={{ padding: '18px 20px', borderLeft: `4px solid ${subj?.color || '#64748b'}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 4 }}>{a.title}</div>
                        <div style={{ color: subj?.color, fontSize: '0.8rem', fontWeight: 600, marginBottom: 6 }}>{a.subject} – {subj?.name}</div>
                        {a.description && <div style={{ color: '#64748b', fontSize: '0.82rem', marginBottom: 8 }}>{a.description}</div>}
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: '0.78rem', color: '#ef4444', fontWeight: 600, marginBottom: 4 }}>
                          <Clock size={12} /> Due: {new Date(a.deadline).toLocaleString('en-IN', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' })}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Division {a.divTarget} · Posted {a.postedAt}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
