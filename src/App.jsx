import React, { useState, useEffect, useRef, useMemo } from 'react';
import { WifiOff } from 'lucide-react';
import HomePage from './pages/HomePage';
import LoginPage from './components/LoginPage';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import SchedulePage from './components/SchedulePage';
import TasksPage from './components/TasksPage';
import MessagesPage from './components/MessagesPage';
import SettingsPage from './components/SettingsPage';
import TeacherPortal from './components/TeacherPortal';
import AttendancePage from './components/AttendancePage';
import AIChat from './components/AIChat';
import ToastContainer from './components/ToastContainer';
import { ALL_STUDENTS, TEACHERS } from './data/schoolData';
import { supabase } from './lib/supabase';

export default function App() {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('DYPCOEI_USER')) || null; } catch { return null; }
  });
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [activePage, setActivePage] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  // Profile data (keeping in localStorage for now)
  const [profilePics, setProfilePics] = useState(() => {
    try { return JSON.parse(localStorage.getItem('DYPCOEI_PROFILE_PICS')) || {}; } catch { return {}; }
  });
  const [profilePrivacy, setProfilePrivacy] = useState(() => {
    try { return JSON.parse(localStorage.getItem('DYPCOEI_PROFILE_PRIVACY')) || {}; } catch { return {}; }
  });
  const [groups, setGroups] = useState(() => {
    try { return JSON.parse(localStorage.getItem('DYPCOEI_GROUPS')) || []; } catch { return []; }
  });
  const [blockedUsers, setBlockedUsers] = useState(() => {
    try { return JSON.parse(localStorage.getItem('DYPCOEI_BLOCKED')) || {}; } catch { return {}; }
  });

  // Supabase Backend State
  const [assignments, setAssignments] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [broadcasts, setBroadcasts] = useState([]);
  const [submissions, setSubmissions] = useState({});
  const [reminders, setReminders] = useState(() => {
    try { return JSON.parse(localStorage.getItem('DYPCOEI_REMINDERS') || '[]'); } catch { return []; }
  });

  // Gamification state
  const [gamification, setGamification] = useState(() => {
    const saved = localStorage.getItem('DYPCOEI_GAMIFICATION');
    return saved ? JSON.parse(saved) : { streak: 0, xp: 0, lastLogin: null, rank: 'Cadet' };
  });

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // PERSISTENCE EFFECT (localStorage as cache)
  useEffect(() => { localStorage.setItem('DYPCOEI_GAMIFICATION', JSON.stringify(gamification)); }, [gamification]);
  useEffect(() => { localStorage.setItem('DYPCOEI_PROFILE_PICS', JSON.stringify(profilePics)); }, [profilePics]);
  useEffect(() => { localStorage.setItem('DYPCOEI_PROFILE_PRIVACY', JSON.stringify(profilePrivacy)); }, [profilePrivacy]);
  useEffect(() => { localStorage.setItem('DYPCOEI_GROUPS', JSON.stringify(groups)); }, [groups]);
  useEffect(() => { localStorage.setItem('DYPCOEI_BLOCKED', JSON.stringify(blockedUsers)); }, [blockedUsers]);
  useEffect(() => { localStorage.setItem('DYPCOEI_REMINDERS', JSON.stringify(reminders)); }, [reminders]);
  useEffect(() => { 
    if (user) localStorage.setItem('DYPCOEI_USER', JSON.stringify(user));
    else localStorage.removeItem('DYPCOEI_USER');
  }, [user]);

  // INITIAL SUPABASE FETCH
  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        // Fetch assignments
        const { data: assignData } = await supabase.from('assignments').select('*').order('created_at', { ascending: false });
        if (assignData) setAssignments(assignData);

        // Fetch broadcasts
        const { data: broadData } = await supabase.from('broadcasts').select('*').eq('is_active', true).order('created_at', { ascending: false });
        if (broadData) setBroadcasts(broadData);

        // Fetch attendance (simplified for demo)
        const { data: attData } = await supabase.from('attendance').select('*').eq('student_id', user.id);
        if (attData) {
          const formatted = {};
          attData.forEach(a => {
            if (!formatted[a.date]) formatted[a.date] = {};
            formatted[a.date][a.student_id] = a.status;
          });
          setAttendance(formatted);
        }

        // Fetch submissions
        const { data: subData } = await supabase.from('submissions').select('*').eq('student_id', user.id);
        if (subData) {
          const formatted = {};
          subData.forEach(s => formatted[s.assignment_id] = s);
          setSubmissions(formatted);
        }
      } catch (err) {
        console.error('Fetch error:', err);
      }
    };

    fetchData();

    // REAL-TIME SUBSCRIPTIONS
    const assignChannel = supabase.channel('assignments-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'assignments' }, payload => {
        const newA = payload.new;
        if (newA.target_division === 'All' || newA.target_division === user.div) {
          setAssignments(prev => [newA, ...prev]);
          if (user.role === 'student') {
            addToast({ type: 'danger', title: '🆕 New Assignment!', msg: `${newA.title} (${newA.subject}) posted. Due: ${new Date(newA.deadline).toLocaleDateString('en-IN')}` });
          }
        }
      })
      .subscribe();

    const broadChannel = supabase.channel('broadcasts-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'broadcasts' }, payload => {
        const newB = payload.new;
        if (newB.target_division === 'All' || newB.target_division === user.div) {
          setBroadcasts(prev => [newB, ...prev]);
          addToast({ type: 'success', title: '📡 Neural Broadcast', msg: `${newB.teacher_name}: ${newB.message}` });
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(assignChannel);
      supabase.removeChannel(broadChannel);
    };
  }, [user?.id]);

  // Manual Routing
  useEffect(() => {
    const handlePopState = () => setCurrentPath(window.location.pathname);
    window.addEventListener('popstate', handlePopState);
    const path = window.location.pathname;
    if (user && (path === '/' || path === '/login')) {
      window.history.pushState({}, '', '/dashboard');
      setCurrentPath('/dashboard');
    } else if (!user && path === '/dashboard') {
      window.history.pushState({}, '', '/login');
      setCurrentPath('/login');
    }
    return () => window.removeEventListener('popstate', handlePopState);
  }, [user]);

  const navigate = (path) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
  };

  const addToast = (toast) => {
    const uid = Date.now() + Math.random();
    setToasts(prev => [...prev, { ...toast, uid }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.uid !== uid)), 5000);
  };

  const removeToast = (uid) => setToasts(prev => prev.filter(t => t.uid !== uid));

  useEffect(() => {
    if (!user) return;
    const today = new Date().toDateString();
    setGamification(prev => {
      const newXP = prev.xp + 10;
      let newStreak = prev.streak;
      if (prev.lastLogin !== today) {
        newStreak = (prev.lastLogin === new Date(Date.now() - 86400000).toDateString()) ? prev.streak + 1 : 1;
        addToast({ type: 'success', title: '🔥 Daily Streak', msg: `Login streak: ${newStreak} days! +10 XP earned.` });
      }
      let newRank = 'Cadet';
      if (newXP >= 500) newRank = 'Neural Elite';
      else if (newXP >= 250) newRank = 'Specialist';
      else if (newXP >= 100) newRank = 'Operative';
      return { ...prev, streak: newStreak, xp: newXP, lastLogin: today, rank: newRank };
    });
    setActivePage('dashboard');
  }, [user?.id]);

  const unreadBroadcastCount = broadcasts.length; // Simplified for bell icon

  if (!user) {
    if (currentPath === '/') return <HomePage onLogin={() => navigate('/login')} />;
    return <LoginPage onLogin={setUser} />;
  }

  const isTeacher = user.role === 'teacher';

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return isTeacher
          ? <TeacherPortal user={user} addToast={addToast} assignments={assignments} setAssignments={setAssignments} attendance={attendance} setAttendance={setAttendance} />
          : <Dashboard user={user} addToast={addToast} assignments={assignments} broadcasts={broadcasts} gamification={gamification} />;
      case 'schedule':    return <SchedulePage user={user} />;
      case 'tasks':       return <TasksPage addToast={addToast} assignments={assignments} user={user} submissions={submissions} setSubmissions={setSubmissions} reminders={reminders} setReminders={setReminders} />;
      case 'messages':    return <MessagesPage user={user} addToast={addToast} profilePics={profilePics} profilePrivacy={profilePrivacy} groups={groups} setGroups={setGroups} blockedUsers={blockedUsers} setBlockedUsers={setBlockedUsers} />;
      case 'attendance':  return <AttendancePage user={user} />;
      case 'settings':    return <SettingsPage user={user} profilePics={profilePics} setProfilePics={setProfilePics} profilePrivacy={profilePrivacy} setProfilePrivacy={setProfilePrivacy} gamification={gamification} addToast={addToast} />;
      default:            return <Dashboard user={user} addToast={addToast} assignments={assignments} broadcasts={broadcasts} gamification={gamification} />;
    }
  };

  return (
    <>
      <div className="app-shell">
        {isOffline && (
          <div className="offline-top-banner">
            <WifiOff size={14} /> Neural Sync Offline — showing cached data
          </div>
        )}
        {mobileMenuOpen && (
          <div className="mobile-overlay" onClick={() => setMobileMenuOpen(false)} />
        )}
        <Sidebar 
          activePage={activePage} 
          setActivePage={(page) => { setActivePage(page); setMobileMenuOpen(false); }} 
          user={user} 
          onLogout={() => { setUser(null); setActivePage('dashboard'); navigate('/'); }} 
          isTeacher={isTeacher} 
          profilePics={profilePics} 
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
        />
        <div className="main-area">
          <Header 
            user={user} 
            addToast={addToast} 
            profilePics={profilePics} 
            mobileMenuOpen={mobileMenuOpen}
            setMobileMenuOpen={setMobileMenuOpen}
            broadcastCount={unreadBroadcastCount}
          />
          <div className="page-content fade-in" key={activePage}>{renderPage()}</div>
        </div>
      </div>
      <AIChat userContext={user} />
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </>
  );
}

