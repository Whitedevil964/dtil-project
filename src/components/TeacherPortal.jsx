import React, { useState } from 'react';
import { Send, Clock, CheckCircle, BookOpen, Users, Plus, X, AlertCircle, Radio, BarChart, Download, MessageSquare, Loader2 } from 'lucide-react';
import { SUBJECTS, ALL_STUDENTS, TEACHERS } from '../data/schoolData';
import { supabase } from '../lib/supabase';
import './TeacherPortal.css';

export default function TeacherPortal({ user, addToast, assignments, setAssignments, attendance, setAttendance }) {
  const [activeTab, setActiveTab] = useState('assignments');
  const [form, setForm] = useState({ title: '', subject: '', deadline: '', description: '', divTarget: 'C' });
  const [attDate, setAttDate] = useState(new Date().toISOString().split('T')[0]);
  const [attDiv, setAttDiv] = useState('C');
  const [broadcastForm, setBroadcastForm] = useState({ message: '', priority: 'normal', target: 'C' });
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [expandedAssignmentId, setExpandedAssignmentId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  
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

  const saveAttendance = async () => {
    setIsSaving(true);
    try {
      const records = Object.entries(attRecord).filter(([_, status]) => status !== null).map(([studentId, status]) => ({
        student_id: studentId,
        date: attDate,
        status,
        teacher_id: user.id,
        division: attDiv
      }));

      if (records.length === 0) {
        addToast({ type: 'warning', title: '⚠️ No Attendance', msg: 'Please mark at least one student.' });
        return;
      }

      const { error } = await supabase.from('attendance').upsert(records);
      
      if (error) throw error;

      setAttendance(prev => ({ ...prev, [attDate]: { ...attRecord } }));
      addToast({ type: 'success', title: '✅ Attendance Saved', msg: `Attendance for ${attDate} has been recorded in Neural Cloud.` });
    } catch (err) {
      console.error('Attendance error:', err);
      addToast({ type: 'danger', title: '❌ Sync Error', msg: 'Failed to save attendance to backend.' });
    } finally {
      setIsSaving(false);
    }
  };

  const sendAssignment = async (e) => {
    e.preventDefault();
    if (!form.title || !form.subject || !form.deadline) return;
    
    setIsSaving(true);
    try {
      const newA = {
        title: form.title,
        subject: form.subject,
        deadline: form.deadline,
        description: form.description,
        target_division: form.divTarget,
        posted_by: user.id,
        teacher_name: user.name
      };

      const { data, error } = await supabase.from('assignments').insert([newA]).select();
      
      if (error) throw error;

      if (data) {
        setAssignments(prev => [data[0], ...prev]);
        addToast({ type: 'success', title: '📋 Assignment Sent!', msg: `"${form.title}" sent to Division ${form.divTarget}` });
        setForm({ title: '', subject: '', deadline: '', description: '', divTarget: 'C' });
      }
    } catch (err) {
      console.error('Assignment error:', err);
      addToast({ type: 'danger', title: '❌ Sync Error', msg: 'Failed to post assignment.' });
    } finally {
      setIsSaving(false);
    }
  };

  const sendBroadcast = async (e) => {
    e.preventDefault();
    if (!broadcastForm.message.trim()) return;

    setIsSaving(true);
    try {
      const newB = {
        message: broadcastForm.message,
        priority: broadcastForm.priority,
        target_division: broadcastForm.target,
        teacher_id: user.id,
        teacher_name: user.name
      };

      const { error } = await supabase.from('broadcasts').insert([newB]);
      
      if (error) throw error;

      addToast({ type: 'success', title: '📡 Broadcast Sent', msg: `Broadcast sent to ${broadcastForm.target} in real-time.` });
      setBroadcastForm({ message: '', priority: 'normal', target: 'C' });
    } catch (err) {
      console.error('Broadcast error:', err);
      addToast({ type: 'danger', title: '❌ Sync Error', msg: 'Failed to send broadcast.' });
    } finally {
      setIsSaving(false);
    }
  };

  const myAssignments = assignments.filter(a => a.posted_by === user.id || a.teacher_name === user.name);
  const teacherSubjects = user.subjects || [];

  // --- ANALYTICS MOCK DATA ---
  const analyticsData = currentStudents.map(s => {
    const pct = 65 + (parseInt(s.rollNo) * 13) % 35; // Deterministic mock 65-99%
    let status = 'critical';
    if (pct >= 85) status = 'on-track';
    else if (pct >= 75) status = 'warning';
    return { ...s, pct, status };
  }).sort((a, b) => b.pct - a.pct);

  const onTrackCount = analyticsData.filter(s => s.status === 'on-track').length;
  const warningCount = analyticsData.filter(s => s.status === 'warning').length;
  const criticalCount = analyticsData.filter(s => s.status === 'critical').length;
  const overallPct = analyticsData.length ? Math.round(analyticsData.reduce((acc, s) => acc + s.pct, 0) / analyticsData.length) : 0;

  const handleMessageStudent = (studentName) => {
    localStorage.setItem('preSelectedChat', studentName);
    window.location.href = '/messages';
  };

  return (
    <div className="teacher-portal">
      <div className="tp-header">
        <div>
          <h1 className="page-title">Teacher Portal</h1>
          <p className="page-subtitle">Welcome, {user.name} — Manage assignments and attendance</p>
        </div>
        <div className="tp-stats">
          <div className="tp-stat glass" style={{ flexDirection: 'column', alignItems: 'flex-start', padding: '14px 20px', gap: 6, minWidth: 140 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#8b5cf6', fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase' }}>
              <BookOpen size={14} /> Assignments
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f8fafc' }}>{myAssignments.length}</div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Total Sent</div>
          </div>
          
          <div className="tp-stat glass" style={{ flexDirection: 'column', alignItems: 'flex-start', padding: '14px 20px', gap: 6, minWidth: 140 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#10b981', fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase' }}>
              <BarChart size={14} /> Attendance
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f8fafc' }}>{overallPct}%</div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Division Average</div>
          </div>

          <div className="tp-stat glass" style={{ flexDirection: 'column', alignItems: 'flex-start', padding: '14px 20px', gap: 6, minWidth: 140 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#ef4444', fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase' }}>
              <AlertCircle size={14} /> Critical
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f8fafc' }}>{criticalCount}</div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Students at Risk</div>
          </div>

          <div className="tp-stat glass" style={{ flexDirection: 'column', alignItems: 'flex-start', padding: '14px 20px', gap: 6, minWidth: 140 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#3b82f6', fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase' }}>
              <MessageSquare size={14} /> Messages
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f8fafc' }}>12</div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Unread Student DMs</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tp-tabs">
        {[
          { id: 'assignments', label: '📋 Send Assignment', icon: Send },
          { id: 'attendance',  label: '✅ Mark Attendance', icon: Users },
          { id: 'history',     label: '📂 Assignment History', icon: BookOpen },
          { id: 'broadcast',   label: '📡 Broadcast', icon: Radio },
          { id: 'analytics',   label: '📊 Analytics', icon: BarChart },
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
              <button type="submit" className="btn btn-primary" disabled={isSaving} style={{ width: '100%', justifyContent: 'center', padding: '12px' }}>
                {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />} 
                {isSaving ? ' Sending...' : ` Send to Division ${form.divTarget}`}
              </button>
            </form>
          </div>

          {/* Students list preview */}
          <div className="glass" style={{ padding: '20px', alignSelf: 'start', maxHeight: '500px', overflowY: 'auto' }}>
            <h3 className="tp-section-title">Division {form.divTarget} Students</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {ALL_STUDENTS.filter(s => s.div === form.divTarget).map(s => (
                <div key={s.id} 
                  onClick={() => setSelectedStudent(s)}
                  style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', background: 'rgba(var(--invert-rgb),0.04)', borderRadius: 10, cursor: 'pointer', transition: 'background 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(var(--invert-rgb),0.08)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(var(--invert-rgb),0.04)'}>
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
            <button className="btn btn-primary" disabled={isSaving} style={{ marginLeft: 'auto' }} onClick={saveAttendance}>
              {isSaving ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle size={16} />}
              {isSaving ? ' Saving...' : ' Save Attendance'}
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
                const isExpanded = expandedAssignmentId === a.id;
                
                // Deterministic mock data for submissions
                const targetStudents = ALL_STUDENTS.filter(s => s.div === a.target_division);
                const submittedStudents = [];
                const pendingStudents = [];
                // Simplified for now, in a real app you'd fetch submissions
                targetStudents.forEach(s => {
                   pendingStudents.push(s);
                });

                return (
                  <div key={a.id} className="glass glass-hover" style={{ padding: '18px 20px', borderLeft: `4px solid ${subj?.color || '#64748b'}`, cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 12 }}
                    onClick={() => setExpandedAssignmentId(isExpanded ? null : a.id)}>
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
                        <div style={{ fontSize: '0.72rem', color: '#64748b', marginBottom: 6 }}>Division {a.target_division} · Posted {new Date(a.created_at).toLocaleDateString()}</div>
                        
                        <div className={`status-badge warning`}>
                          0/{targetStudents.length} Submitted
                        </div>
                      </div>
                    </div>

                    {isExpanded && (
                      <div style={{ marginTop: 10, paddingTop: 16, borderTop: '1px solid rgba(var(--invert-rgb), 0.1)', cursor: 'default' }} onClick={e => e.stopPropagation()}>
                        <div style={{ textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>
                          Real-time submission tracking active. Waiting for student uploads...
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ======================= BROADCAST ======================= */}
      {activeTab === 'broadcast' && (
        <div className="tp-grid" style={{ gridTemplateColumns: '1fr' }}>
          <div className="glass" style={{ padding: '24px' }}>
            <h3 className="tp-section-title">Quick Broadcast Banner</h3>
            <form className="tp-form" onSubmit={sendBroadcast}>
              <div className="tp-field">
                <label>Message Content (Max 280 chars)</label>
                <textarea rows={3} placeholder="Type your broadcast message here..."
                  maxLength={280} required
                  value={broadcastForm.message} 
                  onChange={e => setBroadcastForm({...broadcastForm, message: e.target.value})} />
                <div style={{ textAlign: 'right', fontSize: '0.75rem', color: '#64748b', marginTop: '-10px' }}>
                  {broadcastForm.message.length}/280
                </div>
              </div>
              <div className="tp-form-row">
                <div className="tp-field">
                  <label>Priority</label>
                  <select value={broadcastForm.priority} onChange={e => setBroadcastForm({...broadcastForm, priority: e.target.value})}>
                    <option value="normal">Normal (Yellow)</option>
                    <option value="urgent">Urgent (Red)</option>
                  </select>
                </div>
                <div className="tp-field">
                  <label>Target Audience</label>
                  <select value={broadcastForm.target} onChange={e => setBroadcastForm({...broadcastForm, target: e.target.value})}>
                    <option value="C">Division C</option>
                    <option value="All">All Divisions</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="btn btn-primary" disabled={isSaving} style={{ marginTop: '10px', padding: '12px', justifyContent: 'center' }}>
                {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Radio size={16} />}
                {isSaving ? ' Broadcasting...' : ' Broadcast Now'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ======================= ANALYTICS ======================= */}
      {activeTab === 'analytics' && (
        <div className="tp-analytics">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 className="tp-section-title" style={{ margin: 0 }}>Division C Attendance Report</h3>
            <button className="btn btn-secondary" onClick={() => window.print()} style={{ display: 'flex', gap: 6 }}>
              <Download size={16} /> Download Report PDF
            </button>
          </div>

          <div className="glass" style={{ padding: '30px', textAlign: 'center', marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 30, marginBottom: 20, flexWrap: 'wrap' }}>
              <div className="status-badge on-track" style={{ fontSize: '1rem', padding: '10px 20px' }}>✅ {onTrackCount} On Track</div>
              <div className="status-badge warning" style={{ fontSize: '1rem', padding: '10px 20px' }}>⚠ {warningCount} Warning</div>
              <div className="status-badge critical" style={{ fontSize: '1rem', padding: '10px 20px' }}>🚨 {criticalCount} Critical</div>
            </div>
            
            <div className="att-ring-container">
              <div className="attendance-ring" style={{ '--pct': `${overallPct}%` }}>
                <span className="ring-text">{overallPct}%</span>
              </div>
            </div>
            <div style={{ color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Overall Division Attendance</div>
          </div>

          <div className="glass" style={{ padding: 0, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'rgba(var(--invert-rgb),0.04)' }}>
                  <th style={{ padding: '14px 16px', color: '#64748b', fontSize: '0.8rem' }}>Student</th>
                  <th style={{ padding: '14px 16px', color: '#64748b', fontSize: '0.8rem' }}>Roll No</th>
                  <th style={{ padding: '14px 16px', color: '#64748b', fontSize: '0.8rem' }}>Attendance %</th>
                  <th style={{ padding: '14px 16px', color: '#64748b', fontSize: '0.8rem' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {analyticsData.map(s => (
                  <tr key={s.id} style={{ borderTop: '1px solid rgba(var(--invert-rgb),0.05)' }}>
                    <td style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:700, fontSize:'0.8rem' }}>
                        {s.name[0]}
                      </div>
                      <span style={{ fontWeight: 600 }}>{s.name}</span>
                    </td>
                    <td style={{ padding: '14px 16px', color: '#94a3b8' }}>{s.rollNo}</td>
                    <td style={{ padding: '14px 16px', fontWeight: 700, color: '#f1f5f9' }}>{s.pct}%</td>
                    <td style={{ padding: '14px 16px' }}>
                      {s.status === 'on-track' && <span className="status-badge on-track">On Track</span>}
                      {s.status === 'warning' && <span className="status-badge warning">Warning</span>}
                      {s.status === 'critical' && <span className="status-badge critical">Critical</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================= DRAWER ======================= */}
      {selectedStudent && (
        <>
          <div className="tp-backdrop" onClick={() => setSelectedStudent(null)} />
          <div className="tp-drawer">
            <div className="drawer-header">
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Student Overview</h3>
              <button className="drawer-close" onClick={() => setSelectedStudent(null)}><X size={20} /></button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: 20 }}>
              <div className="drawer-avatar">{selectedStudent.name[0]}</div>
              <div className="drawer-name">{selectedStudent.name}</div>
              <div className="drawer-roll">Roll No: {selectedStudent.rollNo} · Division {selectedStudent.div}</div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
              <div className="attendance-ring" style={{ width: 80, height: 80, '--ring-inset': '8px', '--pct': `${65 + (parseInt(selectedStudent.rollNo) * 13) % 35}%` }}>
                <span className="ring-text" style={{ fontSize: '1.2rem', color: 'white' }}>{65 + (parseInt(selectedStudent.rollNo) * 13) % 35}%</span>
              </div>
            </div>

            <div className="drawer-section-title">Recent Assignments</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 30 }}>
              {[1, 2, 3, 4, 5].map(i => {
                const isSub = Math.random() > 0.3;
                return (
                  <div key={i} className="mock-assignment">
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#f8fafc', marginBottom: 2 }}>Assignment {i}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{['AEC', 'MEC', 'OOP', 'DTIL', 'GUI'][i-1]}</div>
                    </div>
                    <div>
                      {isSub ? <span style={{ color: '#10b981', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}><CheckCircle size={14}/> Submitted</span> 
                             : <span style={{ color: '#f59e0b', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={14}/> Pending</span>}
                    </div>
                  </div>
                )
              })}
            </div>

            <button className="btn btn-primary" style={{ marginTop: 'auto', width: '100%', justifyContent: 'center', padding: '14px' }}
              onClick={() => handleMessageStudent(selectedStudent.name)}>
              <MessageSquare size={18} /> Message Student
            </button>
          </div>
        </>
      )}
    </div>
  );
}

  const teacherSubjects = user.subjects || [];

  // --- ANALYTICS MOCK DATA ---
  const analyticsData = currentStudents.map(s => {
    const pct = 65 + (parseInt(s.rollNo) * 13) % 35; // Deterministic mock 65-99%
    let status = 'critical';
    if (pct >= 85) status = 'on-track';
    else if (pct >= 75) status = 'warning';
    return { ...s, pct, status };
  }).sort((a, b) => b.pct - a.pct);

  const onTrackCount = analyticsData.filter(s => s.status === 'on-track').length;
  const warningCount = analyticsData.filter(s => s.status === 'warning').length;
  const criticalCount = analyticsData.filter(s => s.status === 'critical').length;
  const overallPct = analyticsData.length ? Math.round(analyticsData.reduce((acc, s) => acc + s.pct, 0) / analyticsData.length) : 0;

  const handleMessageStudent = (studentName) => {
    localStorage.setItem('preSelectedChat', studentName);
    window.location.href = '/messages';
  };

  return (
    <div className="teacher-portal">
      <div className="tp-header">
        <div>
          <h1 className="page-title">Teacher Portal</h1>
          <p className="page-subtitle">Welcome, {user.name} — Manage assignments and attendance</p>
        </div>
        <div className="tp-stats">
          <div className="tp-stat glass" style={{ flexDirection: 'column', alignItems: 'flex-start', padding: '14px 20px', gap: 6, minWidth: 140 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#8b5cf6', fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase' }}>
              <BookOpen size={14} /> Assignments
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f8fafc' }}>{myAssignments.length}</div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Total Sent</div>
          </div>
          
          <div className="tp-stat glass" style={{ flexDirection: 'column', alignItems: 'flex-start', padding: '14px 20px', gap: 6, minWidth: 140 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#10b981', fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase' }}>
              <BarChart size={14} /> Attendance
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f8fafc' }}>{overallPct}%</div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Division Average</div>
          </div>

          <div className="tp-stat glass" style={{ flexDirection: 'column', alignItems: 'flex-start', padding: '14px 20px', gap: 6, minWidth: 140 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#ef4444', fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase' }}>
              <AlertCircle size={14} /> Critical
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f8fafc' }}>{criticalCount}</div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Students at Risk</div>
          </div>

          <div className="tp-stat glass" style={{ flexDirection: 'column', alignItems: 'flex-start', padding: '14px 20px', gap: 6, minWidth: 140 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#3b82f6', fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase' }}>
              <MessageSquare size={14} /> Messages
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f8fafc' }}>12</div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Unread Student DMs</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tp-tabs">
        {[
          { id: 'assignments', label: '📋 Send Assignment', icon: Send },
          { id: 'attendance',  label: '✅ Mark Attendance', icon: Users },
          { id: 'history',     label: '📂 Assignment History', icon: BookOpen },
          { id: 'broadcast',   label: '📡 Broadcast', icon: Radio },
          { id: 'analytics',   label: '📊 Analytics', icon: BarChart },
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
                <div key={s.id} 
                  onClick={() => setSelectedStudent(s)}
                  style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', background: 'rgba(var(--invert-rgb),0.04)', borderRadius: 10, cursor: 'pointer', transition: 'background 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(var(--invert-rgb),0.08)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(var(--invert-rgb),0.04)'}>
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
                const isExpanded = expandedAssignmentId === a.id;
                
                // Deterministic mock data for submissions
                const targetStudents = ALL_STUDENTS.filter(s => s.div === a.divTarget);
                const seedId = a.id.split('_')[1] ? parseInt(a.id.split('_')[1]) : 0;
                const submittedStudents = [];
                const pendingStudents = [];
                targetStudents.forEach(s => {
                  const hasSub = (parseInt(s.rollNo) + seedId) % 100 < 65; // ~65% submission rate
                  if (hasSub) submittedStudents.push(s);
                  else pendingStudents.push(s);
                });

                return (
                  <div key={a.id} className="glass glass-hover" style={{ padding: '18px 20px', borderLeft: `4px solid ${subj?.color || '#64748b'}`, cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 12 }}
                    onClick={() => setExpandedAssignmentId(isExpanded ? null : a.id)}>
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
                        <div style={{ fontSize: '0.72rem', color: '#64748b', marginBottom: 6 }}>Division {a.divTarget} · Posted {a.postedAt}</div>
                        
                        <div className={`status-badge ${submittedStudents.length === targetStudents.length ? 'on-track' : 'warning'}`}>
                          {submittedStudents.length}/{targetStudents.length} Submitted
                        </div>
                      </div>
                    </div>

                    {isExpanded && (
                      <div style={{ marginTop: 10, paddingTop: 16, borderTop: '1px solid rgba(var(--invert-rgb), 0.1)', cursor: 'default' }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                          <div>
                            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#10b981', marginBottom: 10, textTransform: 'uppercase' }}>
                              Submitted ({submittedStudents.length})
                            </div>
                            <div style={{ maxHeight: 150, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
                              {submittedStudents.map(s => (
                                <div key={s.id} style={{ fontSize: '0.85rem', color: '#f1f5f9', display: 'flex', justifyContent: 'space-between' }}>
                                  <span>{s.name}</span>
                                  <span style={{ color: '#64748b' }}>{s.rollNo}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div>
                            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#f59e0b', marginBottom: 10, textTransform: 'uppercase' }}>
                              Pending ({pendingStudents.length})
                            </div>
                            <div style={{ maxHeight: 150, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
                              {pendingStudents.map(s => (
                                <div key={s.id} style={{ fontSize: '0.85rem', color: '#f1f5f9', display: 'flex', justifyContent: 'space-between' }}>
                                  <span>{s.name}</span>
                                  <span style={{ color: '#64748b' }}>{s.rollNo}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ======================= BROADCAST ======================= */}
      {activeTab === 'broadcast' && (
        <div className="tp-grid" style={{ gridTemplateColumns: '1fr' }}>
          <div className="glass" style={{ padding: '24px' }}>
            <h3 className="tp-section-title">Quick Broadcast Banner</h3>
            <form className="tp-form" onSubmit={sendBroadcast}>
              <div className="tp-field">
                <label>Message Content (Max 280 chars)</label>
                <textarea rows={3} placeholder="Type your broadcast message here..."
                  maxLength={280} required
                  value={broadcastForm.message} 
                  onChange={e => setBroadcastForm({...broadcastForm, message: e.target.value})} />
                <div style={{ textAlign: 'right', fontSize: '0.75rem', color: '#64748b', marginTop: '-10px' }}>
                  {broadcastForm.message.length}/280
                </div>
              </div>
              <div className="tp-form-row">
                <div className="tp-field">
                  <label>Priority</label>
                  <select value={broadcastForm.priority} onChange={e => setBroadcastForm({...broadcastForm, priority: e.target.value})}>
                    <option value="normal">Normal (Yellow)</option>
                    <option value="urgent">Urgent (Red)</option>
                  </select>
                </div>
                <div className="tp-field">
                  <label>Target Audience</label>
                  <select value={broadcastForm.target} onChange={e => setBroadcastForm({...broadcastForm, target: e.target.value})}>
                    <option value="C">Division C</option>
                    <option value="All">All Divisions</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="btn btn-primary" style={{ marginTop: '10px', padding: '12px', justifyContent: 'center' }}>
                <Radio size={16} /> Broadcast Now
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ======================= ANALYTICS ======================= */}
      {activeTab === 'analytics' && (
        <div className="tp-analytics">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 className="tp-section-title" style={{ margin: 0 }}>Division C Attendance Report</h3>
            <button className="btn btn-secondary" onClick={() => window.print()} style={{ display: 'flex', gap: 6 }}>
              <Download size={16} /> Download Report PDF
            </button>
          </div>

          <div className="glass" style={{ padding: '30px', textAlign: 'center', marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 30, marginBottom: 20, flexWrap: 'wrap' }}>
              <div className="status-badge on-track" style={{ fontSize: '1rem', padding: '10px 20px' }}>✅ {onTrackCount} On Track</div>
              <div className="status-badge warning" style={{ fontSize: '1rem', padding: '10px 20px' }}>⚠ {warningCount} Warning</div>
              <div className="status-badge critical" style={{ fontSize: '1rem', padding: '10px 20px' }}>🚨 {criticalCount} Critical</div>
            </div>
            
            <div className="att-ring-container">
              <div className="attendance-ring" style={{ '--pct': `${overallPct}%` }}>
                <span className="ring-text">{overallPct}%</span>
              </div>
            </div>
            <div style={{ color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Overall Division Attendance</div>
          </div>

          <div className="glass" style={{ padding: 0, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'rgba(var(--invert-rgb),0.04)' }}>
                  <th style={{ padding: '14px 16px', color: '#64748b', fontSize: '0.8rem' }}>Student</th>
                  <th style={{ padding: '14px 16px', color: '#64748b', fontSize: '0.8rem' }}>Roll No</th>
                  <th style={{ padding: '14px 16px', color: '#64748b', fontSize: '0.8rem' }}>Attendance %</th>
                  <th style={{ padding: '14px 16px', color: '#64748b', fontSize: '0.8rem' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {analyticsData.map(s => (
                  <tr key={s.id} style={{ borderTop: '1px solid rgba(var(--invert-rgb),0.05)' }}>
                    <td style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:700, fontSize:'0.8rem' }}>
                        {s.name[0]}
                      </div>
                      <span style={{ fontWeight: 600 }}>{s.name}</span>
                    </td>
                    <td style={{ padding: '14px 16px', color: '#94a3b8' }}>{s.rollNo}</td>
                    <td style={{ padding: '14px 16px', fontWeight: 700, color: '#f1f5f9' }}>{s.pct}%</td>
                    <td style={{ padding: '14px 16px' }}>
                      {s.status === 'on-track' && <span className="status-badge on-track">On Track</span>}
                      {s.status === 'warning' && <span className="status-badge warning">Warning</span>}
                      {s.status === 'critical' && <span className="status-badge critical">Critical</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================= DRAWER ======================= */}
      {selectedStudent && (
        <>
          <div className="tp-backdrop" onClick={() => setSelectedStudent(null)} />
          <div className="tp-drawer">
            <div className="drawer-header">
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Student Overview</h3>
              <button className="drawer-close" onClick={() => setSelectedStudent(null)}><X size={20} /></button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: 20 }}>
              <div className="drawer-avatar">{selectedStudent.name[0]}</div>
              <div className="drawer-name">{selectedStudent.name}</div>
              <div className="drawer-roll">Roll No: {selectedStudent.rollNo} · Division {selectedStudent.div}</div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
              <div className="attendance-ring" style={{ width: 80, height: 80, '--ring-inset': '8px', '--pct': `${65 + (parseInt(selectedStudent.rollNo) * 13) % 35}%` }}>
                <span className="ring-text" style={{ fontSize: '1.2rem', color: 'white' }}>{65 + (parseInt(selectedStudent.rollNo) * 13) % 35}%</span>
              </div>
            </div>

            <div className="drawer-section-title">Recent Assignments</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 30 }}>
              {[1, 2, 3, 4, 5].map(i => {
                const isSub = Math.random() > 0.3;
                return (
                  <div key={i} className="mock-assignment">
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#f8fafc', marginBottom: 2 }}>Assignment {i}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{['AEC', 'MEC', 'OOP', 'DTIL', 'GUI'][i-1]}</div>
                    </div>
                    <div>
                      {isSub ? <span style={{ color: '#10b981', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}><CheckCircle size={14}/> Submitted</span> 
                             : <span style={{ color: '#f59e0b', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={14}/> Pending</span>}
                    </div>
                  </div>
                )
              })}
            </div>

            <button className="btn btn-primary" style={{ marginTop: 'auto', width: '100%', justifyContent: 'center', padding: '14px' }}
              onClick={() => handleMessageStudent(selectedStudent.name)}>
              <MessageSquare size={18} /> Message Student
            </button>
          </div>
        </>
      )}
    </div>
  );
}
