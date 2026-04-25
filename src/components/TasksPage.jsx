import React, { useState } from 'react';
import { Clock, CheckCircle, Filter, FileText, Bell, BellOff, AlertCircle } from 'lucide-react';
import { SUBJECTS } from '../data/schoolData';

const STATIC_TASKS = [
  { id: 0, title: 'AEC – Practice Problems Ch.3', subject: 'AEC', deadline: '2026-04-25T23:59', divTarget: 'C', postedBy: 'Mr. Ramchandra Popale', postedAt: 'Apr 22, 2026', static: true },
  { id: -1, title: 'OOP – Lab Program 5', subject: 'OOP', deadline: '2026-04-28T23:59', divTarget: 'C', postedBy: 'Mrs. Priyanka Bikkad', postedAt: 'Apr 23, 2026', static: true },
];

const URGENCY = (deadline) => {
  const diff = (new Date(deadline) - Date.now()) / (1000 * 60 * 60);
  if (diff < 24) return 'urgent';
  if (diff < 72) return 'warning';
  return 'normal';
};
const URGENCY_COLORS = { urgent: '#ef4444', warning: '#f59e0b', normal: '#3b82f6' };
const URGENCY_LABELS = { urgent: '🔴 Due Today', warning: '🟡 Due Soon', normal: '🔵 Upcoming' };

export default function TasksPage({ addToast, assignments = [], user, submissions = {}, setSubmissions, reminders = [], setReminders }) {
  const [filter, setFilter] = useState('all');

  const handleFileUpload = (taskId, e) => {
    const file = e.target.files[0];
    if (file) {
      setSubmissions(prev => ({
        ...prev,
        [`${user.id}_${taskId}`]: {
          fileName: file.name,
          submittedAt: Date.now()
        }
      }));
      addToast({ type: 'success', title: '✅ Work Submitted', msg: `Successfully uploaded: ${file.name}` });
    }
  };

  const toggleReminder = (taskId) => {
    const reminderId = `${user.id}_${taskId}`;
    const hasReminder = reminders.includes(reminderId);
    
    if (hasReminder) {
      setReminders(prev => prev.filter(id => id !== reminderId));
      addToast({ type: 'info', title: '🔔 Reminder Removed', msg: 'You will no longer receive alerts for this task.' });
    } else {
      setReminders(prev => [...prev, reminderId]);
      addToast({ type: 'success', title: '🔔 Reminder Set!', msg: 'We will notify you before the deadline.' });
    }
  };

  const myDivAssignments = [...STATIC_TASKS, ...assignments.filter(a => a.divTarget === (user?.div || 'C'))];

  const filtered = filter === 'all'
    ? myDivAssignments
    : filter === 'completed'
      ? myDivAssignments.filter(a => submissions[`${user.id}_${a.id}`])
      : filter === 'pending'
        ? myDivAssignments.filter(a => !submissions[`${user.id}_${a.id}`])
        : myDivAssignments.filter(a => URGENCY(a.deadline) === filter);
/*  */
  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      <h1 className="page-title">Tasks & Deadlines</h1>
      <p className="page-subtitle">Division {user?.div || 'C'} – All assignments and submissions from your teachers.</p>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {[['all', 'All Tasks'], ['pending', '⏳ Pending'], ['completed', '✅ Completed'], ['urgent', '🔴 Due Today'], ['warning', '🟡 Due Soon']].map(([key, label]) => (
          <button key={key} onClick={() => setFilter(key)}
            className={filter === key ? 'btn btn-primary' : 'btn btn-secondary'}
            style={{ padding: '7px 16px' }}>
            {label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="glass" style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
          No assignments in this category 🎉
        </div>
      ) : (
        <div className="tasks-page-grid">
          {filtered.map(task => {
            const urg = URGENCY(task.deadline);
            const subj = SUBJECTS[task.subject];
            const color = URGENCY_COLORS[urg];
            const dueDate = new Date(task.deadline);
                const submission = submissions[`${user.id}_${task.id}`];
                const hasReminder = reminders.includes(`${user.id}_${task.id}`);

                return (
                  <div key={task.id} className="task-full-card glass glass-hover" style={{ borderLeft: `4px solid ${submission ? '#10b981' : color}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div className="task-tag" style={{ background: (submission ? '#10b981' : color) + '22', color: submission ? '#10b981' : color }}>
                        {submission ? '✅ Submitted' : URGENCY_LABELS[urg]}
                      </div>
                      {hasReminder && <Bell size={16} style={{ color: 'var(--primary)' }} />}
                    </div>
                    
                    <h3 className="task-full-title">{task.title}</h3>
                    <p className="task-full-course" style={{ color: subj?.color }}>
                      {task.subject} – {subj?.name}
                    </p>
                    <p style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '14px' }}>
                      Posted by: {task.postedBy}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', marginBottom: 16, color: submission ? '#10b981' : color }}>
                      <Clock size={13} />
                      Due: {dueDate.toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>

                    {submission && (
                      <div style={{ marginBottom: '16px', padding: '10px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#059669', fontSize: '0.8rem', fontWeight: 600 }}>
                          <FileText size={14} /> {submission.fileName}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#059669', opacity: 0.8, marginTop: '2px' }}>
                          Submitted on {new Date(submission.submittedAt).toLocaleString('en-IN')}
                        </div>
                      </div>
                    )}

                    <div className="task-actions">
                      <label className={`btn ${submission ? 'btn-secondary' : 'btn-primary'}`} style={{ flex: 1, textAlign: 'center', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        {submission ? 'Resubmit Work' : 'Submit Work'}
                        <input type="file" style={{ display: 'none' }} onChange={(e) => handleFileUpload(task.id, e)} />
                      </label>
                      <button className="btn btn-secondary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} onClick={() => toggleReminder(task.id)}>
                        {hasReminder ? <BellOff size={14} /> : <Clock size={14} />}
                        {hasReminder ? 'Remove' : 'Reminder'}
                      </button>
                    </div>
                  </div>
                );
          })}
        </div>
      )}
    </div>
  );
}
