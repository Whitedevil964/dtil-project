import React from 'react';
import { MapPin, Clock, Users, Zap, AlertCircle, BookOpen, Bell, Calendar } from 'lucide-react';
import { DIV_C_SCHEDULE, SUBJECTS, TEACHERS } from '../data/schoolData';
import { getAcademicYear, getSemester } from '../utils/dateUtils';
import './Dashboard.css';

const DAYS = ['monday','tuesday','wednesday','thursday','friday'];
const DAY_LABELS = ['Mon','Tue','Wed','Thu','Fri'];
const TODAY_IDX = new Date().getDay() - 1; // 0=Mon ... 4=Fri

function getTodaySchedule() {
  const dayKey = DAYS[Math.min(Math.max(TODAY_IDX, 0), 4)];
  return DIV_C_SCHEDULE[dayKey] || DIV_C_SCHEDULE['monday'];
}

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

export default function Dashboard({ user, addToast, assignments }) {
  const schedule = getTodaySchedule().filter(p => p.subject);
  const dayLabel = ['Monday','Tuesday','Wednesday','Thursday','Friday'][Math.min(Math.max(TODAY_IDX, 0), 4)];

  const pendingAssignments = assignments ? assignments.filter(a => a.divTarget === 'C') : [];

  return (
    <div className="dashboard">
      <div className="dash-greeting">
        <div>
          <h1 className="page-title">Good {getTimeOfDay()}, {user?.name?.split(' ').slice(-1)[0]} 👋</h1>
          <p className="page-subtitle">FY B.Tech · Division C · Room A026 · {dayLabel}</p>
        </div>
        <div className="ai-pill"><Zap size={13} /> Neural Predictive Matrix &middot; {getSemester()} {getAcademicYear()}</div>
      </div>

      {/* Stats */}
      <div className="stats-row">
        {[
          { label: 'Classes Today', value: `${schedule.length}`, icon: BookOpen, color: '#8b5cf6' },
          { label: 'Pending Tasks', value: `${pendingAssignments.length}`, icon: AlertCircle, color: '#ef4444' },
          { label: 'Neural Alerts', value: '2', icon: Bell, color: '#f59e0b' },
          { label: 'Biometric Log', value: '91%', icon: Users, color: '#10b981' },
        ].map(s => (
          <div key={s.label} className="stat-card glass glass-hover">
            <div className="stat-icon" style={{ background: s.color + '22', color: s.color }}><s.icon size={18} /></div>
            <div><div className="stat-value">{s.value}</div><div className="stat-label">{s.label}</div></div>
          </div>
        ))}
      </div>

      <div className="dash-cols">
        {/* Timeline */}
        <div className="dash-col-main">
          <div className="section-title">Holographic Timetable – {dayLabel}</div>
          <div className="timeline-wrap">
            <div className="timeline-line" />
            {DIV_C_SCHEDULE[DAYS[Math.min(Math.max(TODAY_IDX,0),4)]]?.map((cls, i) => {
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
                            {status === 'upcoming' && <span className="badge-upcoming"><Clock size={11} />Next</span>}
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="tl-card-info">
                        <h3 className="tl-subject" style={{ color: '#64748b', fontStyle: 'italic', fontSize: '0.9rem' }}>{cls.note || 'Free Period'}</h3>
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
            <div className="glass" style={{ padding: '20px', textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>
              No pending assignments 🎉
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
                    <span className="task-due urgent"><Clock size={12} />Due: {a.deadline}</span>
                    <button className="btn btn-primary" style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                      onClick={() => addToast({ type: 'success', title: 'Submission Portal', msg: `Submitting: ${a.title}` })}>
                      Submit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Subjects taught in Div C */}
          <div className="section-title" style={{marginTop: 20}}>Subjects – Div C</div>
          <div className="glass" style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {['AEC','MEC','MEE','GUI','OOP','DTIL'].map(code => {
              const s = SUBJECTS[code];
              return (
                <div key={code} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.82rem' }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: s.color, flexShrink: 0 }} />
                  <span style={{ color: s.color, fontWeight: 700, width: 42, flexShrink: 0 }}>{code}</span>
                  <span style={{ color: '#94a3b8' }}>{s.name}</span>
                </div>
              );
            })}
          </div>

          <div className="ai-insight glass" style={{marginTop: 14}}>
            <div className="ai-insight-header"><Zap size={14} style={{ color: '#a78bfa' }} /> DYPCOEI Quantum Insight</div>
            <p className="ai-insight-text">Your Division C Neural Overseer is <strong>Mr. Ramchandra Popale</strong>. Your simulation node is <strong>A026</strong>. Next AEC memory injection starts at <strong>11:30 AM</strong>.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function getTimeOfDay() {
  const h = new Date().getHours();
  if (h < 12) return 'Morning';
  if (h < 17) return 'Afternoon';
  return 'Evening';
}
