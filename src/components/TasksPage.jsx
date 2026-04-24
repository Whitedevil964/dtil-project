import React, { useState } from 'react';
import { Clock, CheckCircle, Filter } from 'lucide-react';
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

export default function TasksPage({ addToast, assignments = [], user }) {
  const [filter, setFilter] = useState('all');

  const myDivAssignments = [...STATIC_TASKS, ...assignments.filter(a => a.divTarget === (user?.div || 'C'))];

  const filtered = filter === 'all'
    ? myDivAssignments
    : myDivAssignments.filter(a => URGENCY(a.deadline) === filter);
/*  */
  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      <h1 className="page-title">Tasks & Deadlines</h1>
      <p className="page-subtitle">Division {user?.div || 'C'} – All assignments and submissions from your teachers.</p>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {[['all', 'All Tasks'], ['urgent', '🔴 Due Today'], ['warning', '🟡 Due Soon'], ['normal', '🔵 Upcoming']].map(([key, label]) => (
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
            return (
              <div key={task.id} className="task-full-card glass glass-hover" style={{ borderLeft: `4px solid ${color}` }}>
                <div className="task-tag" style={{ background: color + '22', color }}>
                  {URGENCY_LABELS[urg]}
                </div>
                <h3 className="task-full-title">{task.title}</h3>
                <p className="task-full-course" style={{ color: subj?.color }}>
                  {task.subject} – {subj?.name}
                </p>
                <p style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '14px' }}>
                  Posted by: {task.postedBy}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', marginBottom: 16, color }}>
                  <Clock size={13} />
                  Due: {dueDate.toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </div>
                <div className="task-actions">
                  <button className="btn btn-primary"
                    onClick={() => addToast({ type: 'success', title: '📤 Submission Portal', msg: `Submitting: ${task.title}` })}>
                    Submit Work
                  </button>
                  <button className="btn btn-secondary"
                    onClick={() => addToast({ type: 'info', title: '⏰ Reminder Set!', msg: `You'll be reminded 1 hour before deadline for "${task.title}".` })}>
                    <Clock size={14} /> Set Reminder
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
