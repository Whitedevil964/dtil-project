import React, { useState, useEffect } from 'react';
import LoginPage from './components/LoginPage';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import SchedulePage from './components/SchedulePage';
import TasksPage from './components/TasksPage';
import MessagesPage from './components/MessagesPage';
import SettingsPage from './components/SettingsPage';
import TeacherPortal from './components/TeacherPortal';
import ToastContainer from './components/ToastContainer';
import SystemLock from './components/SystemLock';

const INITIAL_NOTIFICATIONS = [
  { id: 1, type: 'info',    title: '🗓️ Hologram Loaded', msg: 'Your Div C simulation matrix (FY Sem II) has been synced.' },
  { id: 2, type: 'warning', title: '⏰ Imminent Deadline', msg: 'AEC Data Upload due Friday. Check Tasks portal.' },
  { id: 3, type: 'info',    title: '📍 Neural Overseer', msg: 'Your class overseer is Mr. Ramchandra Popale – Node A026.' },
  { id: 4, type: 'success', title: '✅ Quantum Synthesized', msg: 'Schedule has been Quantum-optimised for this week.' },
];

export default function App() {
  const [user, setUser] = useState(null);
  const [activePage, setActivePage] = useState('dashboard');
  const [toasts, setToasts] = useState([]);

  // Shared state across teacher → student
  const [assignments, setAssignments] = useState([]);
  const [attendance, setAttendance] = useState({});

  // Super Admin Lock
  const [isUnlocked, setIsUnlocked] = useState(
    localStorage.getItem('MASTER_ACCESS_GRANTED') === 'true'
  );

  const addToast = (toast) => {
    const uid = Date.now() + Math.random();
    setToasts(prev => [...prev, { ...toast, uid }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.uid !== uid)), 5000);
  };

  const removeToast = (uid) => setToasts(prev => prev.filter(t => t.uid !== uid));

  // Auto-notifications on login
  useEffect(() => {
    if (!user) return;
    let delay = 1200;
    INITIAL_NOTIFICATIONS.forEach(n => {
      setTimeout(() => addToast(n), delay);
      delay += 2200;
    });
    // Reset to dashboard on login
    setActivePage('dashboard');
  }, [user]);

  // Auto deadline reminders when new assignment posted
  useEffect(() => {
    if (assignments.length === 0) return;
    const latest = assignments[0];
    if (user?.role === 'student') {
      addToast({ type: 'danger', title: '🆕 New Assignment!', msg: `${latest.title} (${latest.subject}) posted by ${latest.postedBy}. Due: ${new Date(latest.deadline).toLocaleDateString('en-IN')}` });
    }
  }, [assignments]);

  // If the system is locked, show the lock screen
  if (!isUnlocked) {
    return <SystemLock onUnlock={() => setIsUnlocked(true)} />;
  }

  if (!user) return <LoginPage onLogin={setUser} />;

  const isTeacher = user.role === 'teacher';

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return isTeacher
          ? <TeacherPortal user={user} addToast={addToast} assignments={assignments} setAssignments={setAssignments} attendance={attendance} setAttendance={setAttendance} />
          : <Dashboard user={user} addToast={addToast} assignments={assignments} />;
      case 'schedule':    return <SchedulePage />;
      case 'tasks':       return <TasksPage addToast={addToast} assignments={assignments} user={user} />;
      case 'messages':    return <MessagesPage user={user} />;
      case 'settings':    return <SettingsPage user={user} />;
      default:            return <Dashboard user={user} addToast={addToast} assignments={assignments} />;
    }
  };

  return (
    <>
      <div className="app-shell">
        <Sidebar activePage={activePage} setActivePage={setActivePage} user={user} onLogout={() => { setUser(null); setActivePage('dashboard'); }} isTeacher={isTeacher} />
        <div className="main-area">
          <Header user={user} addToast={addToast} />
          <div className="page-content">{renderPage()}</div>
        </div>
      </div>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </>
  );
}
