import React from 'react';
import { Clock } from 'lucide-react';
import { DIV_C_SCHEDULE, SUBJECTS, TEACHERS } from '../data/schoolData';
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

export default function SchedulePage() {
  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <h1 className="page-title">Weekly Timetable – Division C</h1>
      <p className="page-subtitle">FY B.Tech · {getSemester()} {getAcademicYear()} · Room A026 · Class Teacher: Mr. Ramchandra Popale</p>

      {/* Weekly grid */}
      <div className="schedule-weekly-grid">
        {DAYS.map((day, di) => (
          <div key={day} className="day-column">
            <div className={`day-header ${di === Math.min(Math.max(TODAY_IDX,0),4) ? 'today' : 'other'}`}>
              {DAY_LABELS[di].slice(0,3).toUpperCase()}
              {di === Math.min(Math.max(TODAY_IDX,0),4) && <div style={{ fontSize: '0.6rem', marginTop: 2 }}>TODAY</div>}
            </div>
            {(DIV_C_SCHEDULE[day] || []).map((slot, si) => {
              const subj = slot.subject ? SUBJECTS[slot.subject] : null;
              const teacher = slot.teacher ? TEACHERS[slot.teacher] : null;
              if (!slot.subject) return (
                <div key={si} className="slot-empty" title={slot.note || 'Free'} />
              );
              const cssClass = SUBJECT_COLORS[slot.subject] || 'slot-purple';
              return (
                <div key={si} className={`schedule-slot ${cssClass}`} title={subj?.name}>
                  <div className="slot-subject">{slot.subject}</div>
                  <div className="slot-room">{slot.room}</div>
                  <div className="slot-room" style={{ marginTop: 2, display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Clock size={9} />{slot.time.split('–')[0].trim()}
                  </div>
                  {teacher && <div className="slot-room" style={{ marginTop: 1, fontSize: '0.65rem' }}>{teacher.abbr}</div>}
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
      <div className="section-title">Faculty Reference – Div C Subjects</div>
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
            {[
              { code: 'AEC', teacher: 'RAP', room: 'A026' },
              { code: 'MEC', teacher: 'MSA', room: 'A107' },
              { code: 'MEE', teacher: 'VS',  room: 'B001' },
              { code: 'GUI', teacher: 'AV',  room: 'A110' },
              { code: 'OOP', teacher: 'PNB', room: 'A028' },
              { code: 'DTIL',teacher: 'AP',  room: 'A026' },
            ].map(row => {
              const s = SUBJECTS[row.code];
              const t = TEACHERS[row.teacher];
              return (
                <tr key={row.code} style={{ borderBottom: '1px solid rgba(var(--invert-rgb),0.05)' }}>
                  <td style={{ padding: '10px 14px', color: s.color, fontWeight: 700 }}>{row.code}</td>
                  <td style={{ padding: '10px 14px', color: '#f1f5f9' }}>{s.name}</td>
                  <td style={{ padding: '10px 14px', color: '#94a3b8' }}>{t?.name}</td>
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
