import React from 'react';
import { Clock } from 'lucide-react';
import { ALL_DIV_SCHEDULES, SUBJECTS, TEACHERS, DIVISIONS, getScheduleForBatch } from '../data/schoolData';
import { getAcademicYear, getSemester } from '../utils/dateUtils';

const DAYS = ['monday','tuesday','wednesday','thursday','friday'];
const DAY_LABELS = ['Monday','Tuesday','Wednesday','Thursday','Friday'];
const TODAY_IDX = new Date().getDay() - 1;

const COLOR_MAP = ['slot-purple','slot-red','slot-blue','slot-green','slot-red','slot-purple','slot-green','slot-blue'];
const SUBJECT_COLORS = {
  AEC: 'slot-purple', MEC: 'slot-blue', MEE: 'slot-blue',
  GUI: 'slot-green', OOP: 'slot-red', DTIL: 'slot-green',
  ADE: 'slot-blue', MEP: 'slot-purple', MR: 'slot-red',
  IKS: 'slot-red', MPW: 'slot-green', PCS: 'slot-purple',
};

export default function SchedulePage({ user }) {
  let finalSchedule = {};
  let titleStr = '';
  let subtitleStr = `FY B.Tech · ${getSemester()} ${getAcademicYear()}`;
  let referenceTitle = '';

  if (user?.role === 'teacher') {
    const teacherInfo = Object.values(TEACHERS).find(t => t.id === user.id) || Object.values(TEACHERS)[0];
    titleStr = `Weekly Timetable – ${teacherInfo.name}`;
    subtitleStr = `Faculty Schedule · ${teacherInfo.subjects.join(', ')}`;
    referenceTitle = `Faculty Reference – ${teacherInfo.abbr} Subjects`;
    
    DAYS.forEach(day => {
      finalSchedule[day] = [];
      for (let p = 1; p <= 6; p++) {
        let foundSlot = null;
        for (const div of Object.keys(ALL_DIV_SCHEDULES)) {
          const slot = (ALL_DIV_SCHEDULES[div][day] || []).find(s => s.period === p);
          if (slot && slot.teacher === teacherInfo.abbr) {
            foundSlot = { ...slot, room: `${slot.room} (Div ${div})` };
            break;
          }
        }
        if (foundSlot) {
          finalSchedule[day].push(foundSlot);
        } else {
          const timeRef = ALL_DIV_SCHEDULES['A'][day].find(s => s.period === p)?.time || '';
          finalSchedule[day].push({ period: p, time: timeRef, subject: null, note: 'Free' });
        }
      }
    });
  } else {
    const userDiv = user?.div || 'C';
    const rawUserSchedule = ALL_DIV_SCHEDULES[userDiv] || ALL_DIV_SCHEDULES['C'];
    const userBatch = user?.batch || `${userDiv}1`;
    finalSchedule = getScheduleForBatch(rawUserSchedule, userBatch);
    const divInfo = DIVISIONS[userDiv];
    titleStr = `Weekly Timetable – Division ${userDiv} (Batch ${userBatch})`;
    subtitleStr += ` · Room ${divInfo?.room || 'Unknown'}`;
    referenceTitle = `Faculty Reference – Div ${userDiv} Subjects`;
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h1 className="page-title">{titleStr}</h1>
          <p className="page-subtitle">{subtitleStr}</p>
        </div>
        <button className="btn btn-primary" onClick={() => window.print()} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Clock size={16} /> Export PDF
        </button>
      </div>

      {/* Color Legend */}
      <div className="glass" style={{ padding: '12px 16px', marginBottom: 20, display: 'flex', flexWrap: 'wrap', gap: 14, alignItems: 'center' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Color Key:</span>
        {Object.entries(SUBJECT_COLORS).slice(0, 8).map(([code, css]) => (
          <div key={code} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem' }}>
            <div className={`legend-dot ${css}`} style={{ width: 10, height: 10, borderRadius: 2 }} />
            <span style={{ color: '#94a3b8' }}>{code}</span>
          </div>
        ))}
      </div>

      {/* Weekly grid */}
      <div className="schedule-weekly-grid">
        {DAYS.map((day, di) => (
          <div key={day} className="day-column">
            <div className={`day-header ${di === Math.min(Math.max(TODAY_IDX,0),4) ? 'today' : 'other'}`}>
              {DAY_LABELS[di].slice(0,3).toUpperCase()}
              {di === Math.min(Math.max(TODAY_IDX,0),4) && <div style={{ fontSize: '0.6rem', marginTop: 2 }}>TODAY</div>}
            </div>
            {(finalSchedule[day] || []).map((slot, si) => {
              const subj = slot.subject ? SUBJECTS[slot.subject] : null;
              const teacher = slot.teacher ? TEACHERS[slot.teacher] : null;
              if (!slot.subject) return (
                <div key={si} className="slot-empty" style={{ opacity: 0.3 }} title={slot.note || 'Buffer / Free'} />
              );
              
              // Highlighting logic for current period
              const now = new Date();
              const [hStart, mStart] = slot.time.split('–')[0].split(':').map(Number);
              const [hEnd, mEnd] = slot.time.split('–')[1].trim().split(' ')[0].split(':').map(Number);
              const isPM = slot.time.includes('PM') && hEnd !== 12;
              const endTimeH = isPM ? hEnd + 12 : hEnd;
              
              const startTime = new Date(); startTime.setHours(hStart, mStart, 0);
              const endTime = new Date(); endTime.setHours(endTimeH, mEnd, 0);
              const isCurrentPeriod = di === TODAY_IDX && now >= startTime && now <= endTime;
              const cssClass = SUBJECT_COLORS[slot.subject] || 'slot-purple';
              return (
                <div key={si} 
                  className={`schedule-slot ${cssClass} ${isCurrentPeriod ? 'current-period' : ''}`} 
                  title={`${subj?.name || slot.subject}\nFaculty: ${teacher?.name || slot.teacher}\nRoom: ${slot.room}\nTime: ${slot.time}`}
                >
                  <div className="slot-subject">{slot.subject}</div>
                  <div className="slot-room">{slot.room}</div>
                  <div className="slot-room" style={{ marginTop: 2, display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Clock size={9} />{slot.time.split('–')[0].trim()}
                  </div>
                  {teacher && <div className="slot-room" style={{ marginTop: 1, fontSize: '0.65rem' }}>{teacher.abbr}</div>}
                  {isCurrentPeriod && <div className="live-period-indicator" />}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Full period reference table */}
      <div className="section-title" style={{ marginTop: 28 }}>Period Timings</div>
      <div className="glass" style={{ padding: '16px', marginBottom: 20 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px', fontSize: '0.82rem' }}>
          {[
            { p: '1', t: '9:15 – 10:15 AM' },
            { p: '2', t: '10:15 – 11:15 AM' },
            { p: 'Short Break', t: '11:15 – 11:30 AM' },
            { p: '3', t: '11:30 – 12:30 PM' },
            { p: '4', t: '12:30 – 1:30 PM' },
            { p: 'Lunch Break', t: '1:30 – 2:15 PM' },
            { p: '5', t: '2:15 – 3:15 PM' },
            { p: '6', t: '3:15 – 4:15 PM' },
          ].map(row => (
            <div key={row.p} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '6px 10px', background: 'rgba(var(--invert-rgb),0.03)', borderRadius: 6 }}>
              <span style={{ fontWeight: 700, color: '#94a3b8', minWidth: 60 }}>Period {row.p}</span>
              <span style={{ color: '#64748b' }}>{row.t}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Subject–Faculty reference */}
      <div className="section-title">{referenceTitle}</div>
      <div className="glass" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(var(--invert-rgb),0.08)' }}>
              {['Abbr', 'Subject', 'Teacher', 'Room'].map(h => (
                <th key={h} style={{ padding: '10px 14px', textAlign: 'left', color: '#64748b', fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(() => {
              const subjectsSet = new Set();
              const facultyData = [];
              Object.values(finalSchedule).flat().forEach(slot => {
                if (slot.subject && slot.subject !== 'PRACTICAL' && !subjectsSet.has(slot.subject)) {
                  subjectsSet.add(slot.subject);
                  facultyData.push({ code: slot.subject, teacher: slot.teacher, room: slot.room });
                }
              });
              return facultyData;
            })().map(row => {
              const s = SUBJECTS[row.code];
              const t = TEACHERS[row.teacher];
              return (
                <tr key={row.code} style={{ borderBottom: '1px solid rgba(var(--invert-rgb),0.05)' }}>
                  <td style={{ padding: '10px 14px', color: s?.color || '#f1f5f9', fontWeight: 700 }}>{row.code}</td>
                  <td style={{ padding: '10px 14px', color: '#f1f5f9' }}>{s?.name || row.code}</td>
                  <td style={{ padding: '10px 14px', color: '#94a3b8' }}>{t?.name || row.teacher}</td>
                  <td style={{ padding: '10px 14px', color: '#64748b' }}>{row.room}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
