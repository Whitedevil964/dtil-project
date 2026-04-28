import React, { useState, useEffect, useRef, useMemo } from 'react';
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

export default function App() {
  // Trigger HMR
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('DYPCOEI_USER')) || null; } catch { return null; }
  });
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [activePage, setActivePage] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [lastSeenMsgs, setLastSeenMsgs] = useState(() => {
    try { return JSON.parse(localStorage.getItem('DYPCOEI_LAST_SEEN_MSGS')) || {}; } catch { return {}; }
  });

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

  // Shared state across teacher → student (Persistent)
  const [assignments, setAssignments] = useState(() => {
    try { return JSON.parse(localStorage.getItem('DYPCOEI_APP_ASSIGNMENTS')) || []; } catch { return []; }
  });
  const [attendance, setAttendance] = useState(() => {
    try { return JSON.parse(localStorage.getItem('DYPCOEI_APP_ATTENDANCE')) || {}; } catch { return {}; }
  });
  const [globalChats, setGlobalChats] = useState(() => {
    try { return JSON.parse(localStorage.getItem('DYPCOEI_APP_CHATS')) || {}; } catch { return {}; }
  });
  const [submissions, setSubmissions] = useState(() => {
    try { return JSON.parse(localStorage.getItem('DYPCOEI_SUBMISSIONS') || '{}'); } catch { return {}; }
  });
  const [reminders, setReminders] = useState(() => {
    try { return JSON.parse(localStorage.getItem('DYPCOEI_REMINDERS') || '[]'); } catch { return []; }
  });

  // Gamification state
  const [gamification, setGamification] = useState(() => {
    const saved = localStorage.getItem('DYPCOEI_GAMIFICATION');
    return saved ? JSON.parse(saved) : { streak: 0, xp: 0, lastLogin: null, rank: 'Cadet' };
  });

  useEffect(() => { localStorage.setItem('DYPCOEI_GAMIFICATION', JSON.stringify(gamification)); }, [gamification]);
  useEffect(() => { localStorage.setItem('DYPCOEI_APP_ASSIGNMENTS', JSON.stringify(assignments)); }, [assignments]);
  useEffect(() => { localStorage.setItem('DYPCOEI_APP_ATTENDANCE', JSON.stringify(attendance)); }, [attendance]);
  useEffect(() => { localStorage.setItem('DYPCOEI_APP_CHATS', JSON.stringify(globalChats)); }, [globalChats]);
  useEffect(() => { localStorage.setItem('DYPCOEI_PROFILE_PICS', JSON.stringify(profilePics)); }, [profilePics]);
  useEffect(() => { localStorage.setItem('DYPCOEI_PROFILE_PRIVACY', JSON.stringify(profilePrivacy)); }, [profilePrivacy]);
  useEffect(() => { localStorage.setItem('DYPCOEI_GROUPS', JSON.stringify(groups)); }, [groups]);
  useEffect(() => { localStorage.setItem('DYPCOEI_BLOCKED', JSON.stringify(blockedUsers)); }, [blockedUsers]);
  useEffect(() => { localStorage.setItem('DYPCOEI_SUBMISSIONS', JSON.stringify(submissions)); }, [submissions]);
  useEffect(() => { localStorage.setItem('DYPCOEI_REMINDERS', JSON.stringify(reminders)); }, [reminders]);
  useEffect(() => { 
    if (user) localStorage.setItem('DYPCOEI_USER', JSON.stringify(user));
    else localStorage.removeItem('DYPCOEI_USER');
  }, [user]);

  // Manual Routing & Redirects
  useEffect(() => {
    const handlePopState = () => setCurrentPath(window.location.pathname);
    window.addEventListener('popstate', handlePopState);
    
    // Initial Redirect Logic
    const path = window.location.pathname;
    if (user && (path === '/' || path === '/login')) {
      window.history.pushState({}, '', '/dashboard');
      setCurrentPath('/dashboard');
    } else if (!user && path === '/dashboard') {
      window.history.pushState({}, '', '/login');
      setCurrentPath('/login');
    }

    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
  };

  useEffect(() => {
    const handleStorage = (e) => {
      try {
        if (e.key === 'DYPCOEI_APP_CHATS' && e.newValue) setGlobalChats(JSON.parse(e.newValue));
        if (e.key === 'DYPCOEI_APP_ASSIGNMENTS' && e.newValue) setAssignments(JSON.parse(e.newValue));
        if (e.key === 'DYPCOEI_APP_ATTENDANCE' && e.newValue) setAttendance(JSON.parse(e.newValue));
        if (e.key === 'DYPCOEI_PROFILE_PICS' && e.newValue) setProfilePics(JSON.parse(e.newValue));
        if (e.key === 'DYPCOEI_PROFILE_PRIVACY' && e.newValue) setProfilePrivacy(JSON.parse(e.newValue));
        if (e.key === 'DYPCOEI_GROUPS' && e.newValue) setGroups(JSON.parse(e.newValue));
        if (e.key === 'DYPCOEI_BLOCKED' && e.newValue) setBlockedUsers(JSON.parse(e.newValue));
        if (e.key === 'DYPCOEI_SUBMISSIONS' && e.newValue) setSubmissions(JSON.parse(e.newValue));
        if (e.key === 'DYPCOEI_REMINDERS' && e.newValue) setReminders(JSON.parse(e.newValue));
      } catch (err) { console.error('Sync error', err); }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

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
    if (window.location.pathname !== '/dashboard') {
      navigate('/dashboard');
    }
  }, [user]);

  useEffect(() => {
    if (assignments.length === 0) return;
    const latest = assignments[0];
    if (user?.role === 'student') {
      addToast({ type: 'danger', title: '🆕 New Assignment!', msg: `${latest.title} (${latest.subject}) posted by ${latest.postedBy}. Due: ${new Date(latest.deadline).toLocaleDateString('en-IN')}` });
    }
  }, [assignments]);

  const prevChatsRef = useRef(globalChats);
  useEffect(() => {
    if (!user) {
      prevChatsRef.current = globalChats;
      return;
    }
    Object.keys(globalChats).forEach(key => {
      const ids = key.split('_chat_');
      if (ids.includes(String(user.id))) {
        const currentMsgs = globalChats[key] || [];
        const prevMsgs = prevChatsRef.current[key] || [];
        if (currentMsgs.length > prevMsgs.length) {
          const latestMsg = currentMsgs[currentMsgs.length - 1];
          if (String(latestMsg.from) !== String(user.id)) {
            const senderId = ids[0] === String(user.id) ? ids[1] : ids[0];
            let senderName = 'Someone';
            const t = Object.values(TEACHERS || {}).find(t => String(t?.id) === String(senderId));
            if (t) senderName = t.name;
            else {
              const s = (ALL_STUDENTS || []).find(s => String(s?.id) === String(senderId));
              if (s) senderName = s.name;
            }
            if (activePage !== 'messages') {
               addToast({ type: 'success', title: `💬 New Message`, msg: `${senderName}: ${latestMsg.text}` });
            }
          }
        }
      }
    });
    prevChatsRef.current = globalChats;
  }, [globalChats, user, activePage]);

  const unreadMessageCount = useMemo(() => {
    if (!user) return 0;
    const lastSeen = lastSeenMsgs[user.id] || 0;
    let count = 0;
    Object.keys(globalChats).forEach(key => {
      const ids = key.split('_chat_');
      if (ids.includes(String(user.id))) {
        const msgs = globalChats[key] || [];
        msgs.forEach(m => {
          if (String(m.from) !== String(user.id) && m.timestamp > lastSeen) count++;
        });
      }
    });
    return count;
  }, [globalChats, user, lastSeenMsgs]);

  useEffect(() => {
    if (activePage === 'messages' && user) {
      const newSeen = { ...lastSeenMsgs, [user.id]: Date.now() };
      setLastSeenMsgs(newSeen);
      localStorage.setItem('DYPCOEI_LAST_SEEN_MSGS', JSON.stringify(newSeen));
    }
  }, [activePage, user, globalChats]);

  useEffect(() => {
    if (user && unreadMessageCount > 0 && activePage !== 'messages') {
       addToast({ type: 'info', title: '💬 Unread Messages', msg: `You have ${unreadMessageCount} new message(s) waiting for you in your inbox.` });
    }
  }, [user]);

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
          : <Dashboard user={user} addToast={addToast} assignments={assignments} gamification={gamification} />;
      case 'schedule':    return <SchedulePage user={user} />;
      case 'tasks':       return <TasksPage addToast={addToast} assignments={assignments} user={user} submissions={submissions} setSubmissions={setSubmissions} reminders={reminders} setReminders={setReminders} />;
      case 'messages':    return <MessagesPage user={user} globalChats={globalChats} setGlobalChats={setGlobalChats} profilePics={profilePics} profilePrivacy={profilePrivacy} groups={groups} setGroups={setGroups} blockedUsers={blockedUsers} setBlockedUsers={setBlockedUsers} />;
      case 'attendance':  return <AttendancePage user={user} />;
      case 'settings':    return <SettingsPage user={user} profilePics={profilePics} setProfilePics={setProfilePics} profilePrivacy={profilePrivacy} setProfilePrivacy={setProfilePrivacy} gamification={gamification} addToast={addToast} />;
      default:            return <Dashboard user={user} addToast={addToast} assignments={assignments} gamification={gamification} />;
    }
  };

  return (
    <>
      <div className="app-shell">
        {mobileMenuOpen && (
          <div className="mobile-overlay" onClick={() => setMobileMenuOpen(false)} />
        )}
        <Sidebar 
          activePage={activePage} 
          setActivePage={(page) => { setActivePage(page); setMobileMenuOpen(false); }} 
          user={user} 
          onLogout={() => { setUser(null); setActivePage('dashboard'); navigate('/'); }} 
          isTeacher={isTeacher} 
          unreadMessageCount={unreadMessageCount} 
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
          />
          <div className="page-content fade-in" key={activePage}>{renderPage()}</div>
        </div>
      </div>
      <AIChat userContext={user} />
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </>
  );
}
