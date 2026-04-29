import React, { useState, useEffect } from 'react';
import { MapPin, Clock, Users, Zap, AlertCircle, BookOpen, Bell, Calendar, X, Plus, Radio, Megaphone } from 'lucide-react';
import { ALL_DIV_SCHEDULES, SUBJECTS, TEACHERS, DIVISIONS, getScheduleForBatch } from '../data/schoolData';
import { getAcademicYear, getSemester } from '../utils/dateUtils';
import './Dashboard.css';

const DAYS = ['monday','tuesday','wednesday','thursday','friday'];
const DAY_LABELS = ['Mon','Tue','Wed','Thu','Fri'];
const TODAY_IDX = new Date().getDay() - 1; // 0=Mon ... 4=Fri

function getStatus(period) {
  const h = new Date().getHours();
  if (period === 3 && h >= 11 && h < 12) return 'current';
  if (period === 4 && h >= 12 && h < 13) return 'current';
  if (period === 5 && h >= 14 && h < 15) return 'current';
  if (period === 6 && h >= 15 && h < 16) return 'current';
  if (period === 1 && h >= 9 && h < 10) return 'current';
  if (period === 2 && h >= 10 && h < 11) return 'current';
  const periodHours = { 1: 9, 2: 10, 3: 11, 4: 12, 5: 14, 6: 15 };
  return h > periodHours[period] ? 'past' : 'upcoming';
}

function getTimeOfDay() {
  const h = new Date().getHours();
  if (h < 12) return 'Morning';
  if (h < 17) return 'Afternoon';
  return 'Evening';
}

export default function Dashboard({ user, addToast, assignments, broadcasts = [] }) {
  const userDiv = user?.div || 'C';
  const rawUserSchedule = ALL_DIV_SCHEDULES[userDiv] || ALL_DIV_SCHEDULES['C'];
  const userBatch = user?.batch || `${userDiv}1`;
  const userSchedule = getScheduleForBatch(rawUserSchedule, userBatch);
  const dayKey = DAYS[Math.min(Math.max(TODAY_IDX, 0), 4)];
  const scheduleToday = userSchedule[dayKey] || userSchedule['monday'];
  const dayLabel = ['Monday','Tuesday','Wednesday','Thursday','Friday'][Math.min(Math.max(TODAY_IDX, 0), 4)];
  const divInfo = DIVISIONS[userDiv];

  const pendingAssignments = assignments ? assignments.filter(a => a.target_division === userDiv || a.target_division === 'All') : [];
  const myBroadcasts = broadcasts.filter(b => b.target_division === userDiv || b.target_division === 'All');

  const [nextClassInfo, setNextClassInfo] = useState('No more classes today');
  const [showGPACalc, setShowGPACalc] = useState(false);
  const [gpaData, setGpaData] = useState([{ subject: '', marks: '' }]);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const currentDay = DAYS[now.getDay() - 1];
      if (!currentDay) {
        setNextClassInfo('Weekend · Next: Monday 9:00 AM');
        return;
      }

      const todaySchedule = userSchedule[currentDay] || [];
      const upcoming = todaySchedule
        .filter(p => p.subject)
        .map(p => {
          const [start] = p.time.split('–').map(t => t.trim());
          const [h, m] = start.split(':').map(Number);
          const startTime = new Date();
          startTime.setHours(h, m, 0, 0);
          return { ...p, startTime };
        })
        .filter(p => p.startTime > now)
        .sort((a, b) => a.startTime - b.startTime);

      if (upcoming.length > 0) {
        const next = upcoming[0];
        const diffMs = next.startTime - now;
        const diffMins = Math.floor(diffMs / 60000);
        const diffSecs = Math.floor((diffMs % 60000) / 1000);
        setNextClassInfo(`Next: ${next.subject} · starts in ${diffMins}m ${diffSecs}s`);
      } else {
        setNextClassInfo('No more classes today');
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [userSchedule]);

  const showLatestBroadcasts = () => {
    if (myBroadcasts.length === 0) {
      addToast({ type: 'info', title: 'Neural Alerts', msg: 'No active broadcasts at this moment.' });
      return;
    }
    const latest = myBroadcasts[0];
    addToast({ type: 'success', title: `📡 ${latest.teacher_name}`, msg: latest.message });
  };

  return (
    <div className="dashboard">
      <div className="dash-greeting">
        <div>
          <h1 className="page-title">Good {getTimeOfDay()}, {user?.name?.split(' ').slice(-1)[0] || 'Student'} 👋</h1>
          <p className="page-subtitle">FY B.Tech · Division {userDiv} (Batch {user?.batch || `${userDiv}1`}) · Room {divInfo?.room || 'Unknown'} · {dayLabel}</p>
        </div>
        <div className="ai-pill"><Zap size={13} /> Neural Predictive Matrix &middot; {getSemester()} {getAcademicYear()}</div>
      </div>

      {/* Quick Action Bar */}
      <div className="quick-actions-bar">
        <button className="btn btn-ghost glass" onClick={() => window.location.hash = '#schedule'}><Calendar size={14} /> Full Schedule</button>
        <button className="btn btn-ghost glass" onClick={() => setShowGPACalc(true)}><Zap size={14} /> GPA Calculator</button>
        <button className="btn btn-ghost glass" onClick={showLatestBroadcasts}><Bell size={14} /> Neural Alerts</button>
      </div>

      {/* Stats */}
      <div className="stats-row">
        {[
          { label: nextClassInfo.includes('starts in') ? 'Next Class In' : 'Status', value: nextClassInfo.includes('starts in') ? nextClassInfo.split('in ')[1] : 'Finished', subLabel: nextClassInfo.split(' · ')[0], icon: Clock, color: '#8b5cf6' },
          { label: 'Pending Tasks', value: `${pendingAssignments.length}`, icon: AlertCircle, color: '#ef4444' },
          { label: 'Neural Alerts', value: `${myBroadcasts.length}`, icon: Bell, color: '#f59e0b', onClick: showLatestBroadcasts },
          { label: 'Attendance %', value: '91%', icon: Users, color: '#10b981' },
        ].map(s => (
          <div key={s.label} className="stat-card glass glass-hover" onClick={s.onClick} style={{ cursor: s.onClick ? 'pointer' : 'default' }}>
            <div className="stat-icon" style={{ background: s.color + '22', color: s.color }}><s.icon size={18} /></div>
            <div>
              <div className="stat-value" style={{ fontSize: s.subLabel ? '1.1rem' : '1.5rem' }}>{s.value}</div>
              <div className="stat-label">{s.label}</div>
              {s.subLabel && <div style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: '2px' }}>{s.subLabel}</div>}
            </div>
          </div>
        ))}
      </div>

      <div className="dash-cols">
        {/* Timeline */}
        <div className="dash-col-main">
          <div className="section-title">Holographic Timetable – {dayLabel}</div>
          <div className="timeline-wrap">
            <div className="timeline-line" />
            {scheduleToday?.map((cls, i) => {
              const subj = cls.subject ? SUBJECTS[cls.subject] : null;
              const teacher = cls.teacher ? TEACHERS[cls.teacher] : null;
              const status = cls.subject ? getStatus(cls.period) : 'past';
              const color = subj?.color || '#64748b';

              return (
                <div key={i} className={`tl-item ${status}`}>
                  <div className="tl-time" style={{ color: status === 'current' ? color : undefined }}>
                    {cls.time.split('–')[0].trim()}
                  </div>
                  <div className="tl-dot" style={{ background: color, boxShadow: status === 'current' ? `0 0 12px ${color}` : 'none' }} />
                  <div className={`tl-card glass ${status !== 'past' ? 'glass-hover' : ''}`}
                    style={{ opacity: status === 'past' ? 0.5 : 1 }}>
                    {cls.subject ? (
                      <>
                        <div className="tl-card-top">
                          <div className="tl-card-info">
                            <h3 className="tl-subject" style={{ color: status === 'current' ? color : undefined }}>
                              {subj?.name || cls.subject}
                            </h3>
                            <div className="tl-meta-row">
                              <span className="tl-meta"><Clock size={12} />{cls.time}</span>
                              {cls.room && <span className="tl-meta"><MapPin size={12} />Room {cls.room}</span>}
                            </div>
                            {teacher && (
                              <div className="tl-teacher">
                                <div className="tl-teacher-dot" style={{ background: color }} />
                                {teacher.name}
                              </div>
                            )}
                            {cls.note && <div className="tl-alert" style={{marginTop:8}}><AlertCircle size={12}/>{cls.note}</div>}
                          </div>
                          <div className="tl-badge-area">
                            {status === 'current' && <span className="badge-live"><span className="pulse-dot" />LIVE</span>}
                            {status === 'upcoming' && <span className="badge-upcoming" style={{ color: color, background: color + '15', border: `1px solid ${color}33` }}><Clock size={11} />Next</span>}
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="tl-card-info" style={{ opacity: 0.6 }}>
                        <h3 className="tl-subject" style={{ color: '#64748b', fontStyle: 'italic', fontSize: '0.85rem', borderLeft: '2px dashed #64748b33', paddingLeft: '12px' }}>
                          {cls.note || 'Free Period / Buffer Slot'}
                        </h3>
                        <div className="tl-meta-row"><span className="tl-meta"><Clock size={12} />{cls.time}</span></div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Side: assignments + subjects */}
        <div className="dash-col-side">
          <div className="section-title">Assignments & Deadlines</div>
          {pendingAssignments.length === 0 ? (
            <div className="glass" style={{ padding: '24px', textAlign: 'center' }}>
              <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '14px' }}>No pending assignments 🎉</p>
              <button className="btn btn-primary" style={{ width: '100%', fontSize: '0.8rem' }} onClick={() => addToast({ type:'warning', title:'Neural Task', msg:'Custom task creation initializing...' })}>
                <Plus size={14} /> Add Personal Task
              </button>
            </div>
          ) : (
            <div className="task-list-wrap">
              {pendingAssignments.map((a, i) => (
                <div key={i} className="task-item glass glass-hover">
                  <div className="task-item-header">
                    <h4 className="task-item-title">{a.title}</h4>
                    <span style={{ fontSize: '0.72rem', color: SUBJECTS[a.subject]?.color, fontWeight: 700 }}>{a.subject}</span>
                  </div>
                  <p className="task-item-course">{SUBJECTS[a.subject]?.name}</p>
                  <div className="task-item-footer">
                    <span className="task-due urgent"><Clock size={12} />Due: {new Date(a.deadline).toLocaleDateString()}</span>
                    <button className="btn btn-primary" style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                      onClick={() => addToast({ type: 'success', title: 'Submission Portal', msg: `Submitting: ${a.title}` })}>
                      Submit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Broadcasts Section */}
          {myBroadcasts.length > 0 && (
            <>
              <div className="section-title" style={{marginTop: 20}}>Neural Broadcasts</div>
              <div className="glass" style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {myBroadcasts.slice(0, 3).map((b, i) => (
                  <div key={i} className="broadcast-item" style={{ fontSize: '0.82rem', padding: '10px', background: 'rgba(var(--invert-rgb), 0.05)', borderRadius: '8px' }}>
                    <div style={{ fontWeight: 700, color: b.priority === 'urgent' ? '#ef4444' : '#f59e0b', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Radio size={12} /> {b.teacher_name}
                    </div>
                    <p style={{ color: '#f1f5f9', margin: 0 }}>{b.message}</p>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Subjects taught in Div */}
          <div className="section-title" style={{marginTop: 20}}>Subjects – Div {userDiv}</div>
          <div className="glass" style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {Object.keys(SUBJECTS).slice(0, 6).map(code => {
              const s = SUBJECTS[code];
              return (
                <div key={code} 
                  className="subject-mini-card"
                  onClick={() => addToast({ type: 'info', title: s.name, msg: `Faculty: ${TEACHERS[code]?.name || 'Assigned Professor'}. Room: ${DIVISIONS[userDiv]?.room}.` })}
                  style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.82rem', cursor: 'pointer', padding: '4px', borderRadius: '6px' }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: s.color, flexShrink: 0 }} />
                  <span style={{ color: s.color, fontWeight: 700, width: 42, flexShrink: 0 }}>{code}</span>
                  <span style={{ color: '#94a3b8' }}>{s.name}</span>
                </div>
              );
            })}
          </div>

          <div className="ai-insight glass" style={{marginTop: 14}}>
            <div className="ai-insight-header"><Zap size={14} style={{ color: '#a78bfa' }} /> DYPCOEI Quantum Insight</div>
            <p className="ai-insight-text">Your Division {userDiv} Neural Overseer is <strong>{divInfo?.classTeacher || 'Assigned Overseer'}</strong>. Your simulation node is <strong>{divInfo?.room || 'Unknown'}</strong>. Next memory injection starts soon.</p>
          </div>
        </div>
      </div>

      {showGPACalc && (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="glass fade-in" style={{ width: '100%', maxWidth: '450px', borderRadius: '24px', overflow: 'hidden', border: '1px solid rgba(225, 29, 72, 0.2)' }}>
            <div style={{ padding: '20px', background: 'linear-gradient(135deg, #e11d48, #be123c)', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontWeight: 700 }}>Neural GPA Calculator</div>
              <button className="btn-ghost" onClick={() => setShowGPACalc(false)} style={{ color: 'white' }}><X size={20} /></button>
            </div>
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Calculate your academic standing across the neural grid.</p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '250px', overflowY: 'auto', paddingRight: '5px' }}>
                {gpaData.map((row, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '8px' }}>
                    <input 
                      placeholder="Subject" 
                      className="chat-input" 
                      style={{ flex: 2, fontSize: '0.8rem' }}
                      value={row.subject}
                      onChange={e => {
                        const next = [...gpaData];
                        next[idx].subject = e.target.value;
                        setGpaData(next);
                      }}
                    />
                    <input 
                      placeholder="Marks" 
                      type="number" 
                      className="chat-input" 
                      style={{ flex: 1, fontSize: '0.8rem' }}
                      value={row.marks}
                      onChange={e => {
                        const next = [...gpaData];
                        next[idx].marks = e.target.value;
                        setGpaData(next);
                      }}
                    />
                  </div>
                ))}
              </div>
              
              <button className="btn btn-secondary" style={{ width: '100%', fontSize: '0.8rem' }} onClick={() => setGpaData([...gpaData, { subject: '', marks: '' }])}>
                + Add Subject
              </button>

              <div style={{ marginTop: '10px', padding: '16px', background: 'rgba(var(--invert-rgb), 0.05)', borderRadius: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>Estimated SGPA</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#e11d48' }}>
                  {(() => {
                    const valid = gpaData.filter(d => d.marks);
                    if (valid.length === 0) return '0.00';
                    const sum = valid.reduce((a, b) => a + Number(b.marks), 0);
                    const avg = sum / valid.length;
                    return (avg / 10).toFixed(2);
                  })()}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

