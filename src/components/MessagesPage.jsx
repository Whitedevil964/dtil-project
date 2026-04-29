import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Send, Search, Plus, X, Users, Check, Settings, Image as ImageIcon, ShieldAlert, UserPlus, UserMinus, ShieldCheck, Trash2, MoreVertical, Eraser, UserX, Ban, ChevronLeft, WifiOff } from 'lucide-react';
import { ALL_STUDENTS, TEACHERS } from '../data/schoolData';
import { supabase } from '../lib/supabase';


const INITIAL_CONTACTS = [];

function getUserInfo(id) {
  const t = Object.values(TEACHERS || {}).find(t => String(t?.id) === String(id));
  if (t) return { id: t.id, name: t.name, role: `Teacher`, avatar: t.abbr || t.name[0], color: '#3b82f6' };
  
  const s = (ALL_STUDENTS || []).find(s => String(s?.id) === String(id));
  if (s) return { id: s.id, name: s.name, role: s.dept, avatar: s.name[0], color: '#10b981' };
  
  return { id, name: 'Unknown User', role: 'User', avatar: 'U', color: '#64748b' };
}

export default function MessagesPage({ user, addToast, profilePics, profilePrivacy, groups = [], setGroups, blockedUsers = {}, setBlockedUsers }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [inputVal, setInputVal] = useState('');
  const [mobileChatOpen, setMobileChatOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  
  // Supabase messages state
  const [supabaseMessages, setSupabaseMessages] = useState([]);
  
  // Group creation state
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [selectedMembers, setSelectedMembers] = useState([]);

  // Group settings state (for editing)
  const [isEditingGroup, setIsEditingGroup] = useState(false);
  const [editName, setEditName] = useState('');
  const [editOnlyAdmins, setEditOnlyAdmins] = useState(false);
  
  // Track manually opened chats that might not have messages yet
  const [activeChatIds, setActiveChatIds] = useState([]);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

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

  // Initial load and real-time subscription
  useEffect(() => {
    if (!user?.id) return;

    loadMessages();

    // Real-time subscription
    const channel = supabase
      .channel('messages-all')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          const newMsg = payload.new;
          // Check if message is relevant to user
          if (
            newMsg.receiver_id === String(user.id) || 
            newMsg.sender_id === String(user.id) ||
            (newMsg.group_id && groups.some(g => g.id === newMsg.group_id))
          ) {
            setSupabaseMessages(prev => {
              // Avoid duplicates
              if (prev.some(m => m.id === newMsg.id)) return prev;
              const updated = [...prev, newMsg];
              // Cache to localStorage
              localStorage.setItem(`neural_cache_msgs_${user.id}`, JSON.stringify(updated.slice(-100)));
              return updated;
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  useEffect(() => {
    scrollToBottom();
  }, [supabaseMessages]);

  async function loadMessages() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id},group_id.neq.null`)
        .order('created_at', { ascending: true });

      if (error) throw error;

      if (data) {
        setSupabaseMessages(data);
        localStorage.setItem(`neural_cache_msgs_${user.id}`, JSON.stringify(data.slice(-100)));
      }
    } catch (err) {
      console.error('Failed to load messages:', err);
      // Fallback to cache
      const cached = localStorage.getItem(`neural_cache_msgs_${user.id}`);
      if (cached) setSupabaseMessages(JSON.parse(cached));
    } finally {
      setLoading(false);
    }
  }

  const renderAvatar = (personId, defaultAvatar, isGroup = false, groupLogo = null) => {
    if (isGroup) {
      if (groupLogo) return <img src={groupLogo} alt="Group" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />;
      return <Users size={18} />;
    }
    const hasPic = profilePics?.[personId];
    const isPublic = profilePrivacy?.[personId] !== false;
    if (hasPic && isPublic) {
      return <img src={hasPic} alt="Profile" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />;
    }
    return defaultAvatar;
  };
  
  // Derive ALL contacts and their unread counts
  const contacts = useMemo(() => {
    if (!user) return INITIAL_CONTACTS;
    
    const userContactsMap = new Map();
    
    // Process all messages to find distinct conversations
    supabaseMessages.forEach(msg => {
      let contactId = null;
      let isGroupMsg = false;

      if (msg.group_id) {
        contactId = msg.group_id;
        isGroupMsg = true;
      } else {
        contactId = msg.sender_id === String(user.id) ? msg.receiver_id : msg.sender_id;
      }

      if (!contactId) return;

      const existing = userContactsMap.get(String(contactId));
      const unreadCount = (!existing ? 0 : existing.unreadCount) + 
                          (msg.sender_id !== String(user.id) && !msg.is_read ? 1 : 0);

      const info = isGroupMsg 
        ? groups.find(g => g.id === contactId) || { name: 'Unknown Group', id: contactId, isGroup: true }
        : getUserInfo(contactId);

      userContactsMap.set(String(contactId), {
        ...info,
        lastMsg: msg.content,
        lastMsgTime: msg.created_at,
        unreadCount: unreadCount,
        isGroup: isGroupMsg
      });
    });

    // Add manually opened chats that haven't had messages yet
    activeChatIds.forEach(id => {
      if (!userContactsMap.has(String(id))) {
        userContactsMap.set(String(id), { ...getUserInfo(id), lastMsg: 'New conversation', lastMsgTime: new Date().toISOString(), unreadCount: 0 });
      }
    });

    // Add groups the user is in that might not have messages yet
    groups.forEach(g => {
      if (g.members.includes(user.id) && !userContactsMap.has(g.id)) {
        userContactsMap.set(g.id, {
          ...g,
          lastMsg: 'New group created',
          lastMsgTime: new Date().toISOString(),
          unreadCount: 0,
          isGroup: true
        });
      }
    });
    
    return Array.from(userContactsMap.values()).sort((a, b) => new Date(b.lastMsgTime) - new Date(a.lastMsgTime));
  }, [supabaseMessages, user, activeChatIds, groups]);

  const [selected, setSelected] = useState(() => contacts[0] || null);

  const activeSelected = useMemo(() => {
    if (!selected) return null;
    return contacts.find(c => String(c.id) === String(selected.id)) || selected;
  }, [contacts, selected]);

  const selectedMessages = useMemo(() => {
    if (!activeSelected || !user) return [];
    if (activeSelected.isGroup) {
      return supabaseMessages.filter(m => m.group_id === activeSelected.id);
    }
    return supabaseMessages.filter(m => 
      !m.group_id && 
      ((m.sender_id === String(user.id) && m.receiver_id === String(activeSelected.id)) ||
       (m.sender_id === String(activeSelected.id) && m.receiver_id === String(user.id)))
    );
  }, [activeSelected, supabaseMessages, user]);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    
    const matchedTeachers = Object.values(TEACHERS || {}).filter(t => t.name.toLowerCase().includes(q)).map(t => ({
      id: t.id, name: t.name, role: `Teacher`, avatar: t.abbr || t.name[0], color: '#3b82f6'
    }));

    const matchedStudents = (ALL_STUDENTS || []).filter(s => s.name.toLowerCase().includes(q) && s.id !== user?.id).slice(0, 15).map(s => ({
      id: s.id, name: s.name, role: s.dept, avatar: s.name[0], color: '#10b981'
    }));
    
    return [...matchedTeachers, ...matchedStudents];
  }, [searchQuery, user]);

  const startChat = (person) => {
    if (!activeChatIds.includes(person.id)) {
      setActiveChatIds(prev => [person.id, ...prev]);
    }
    setSelected(person);
    setSearchQuery('');
    setIsSearching(false);
    setMobileChatOpen(true);
  };

  const sendMsg = async () => {
    if (!inputVal.trim() || !activeSelected || !user) return;
    
    const tempVal = inputVal.trim();
    setInputVal('');

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: String(user.id),
          sender_name: user.name,
          sender_role: user.role,
          receiver_id: activeSelected.isGroup ? null : String(activeSelected.id),
          receiver_name: activeSelected.isGroup ? null : activeSelected.name,
          group_id: activeSelected.isGroup ? activeSelected.id : null,
          content: tempVal,
          message_type: activeSelected.isGroup ? 'group' : 'direct'
        });

      if (error) throw error;
    } catch (err) {
      console.error('Send failed:', err);
      addToast({ type: 'error', title: 'Send Failed', msg: 'Neural sync lost. Try again later.' });
      setInputVal(tempVal);
    }
  };

  const markAsRead = async (contactId, isGroup) => {
    if (!user || isOffline) return;
    const unreadIds = supabaseMessages
      .filter(m => 
        m.sender_id === String(contactId) && 
        !m.is_read && 
        (isGroup ? m.group_id === contactId : !m.group_id)
      )
      .map(m => m.id);

    if (unreadIds.length === 0) return;

    await supabase
      .from('messages')
      .update({ is_read: true })
      .in('id', unreadIds);
    
    setSupabaseMessages(prev => prev.map(m => unreadIds.includes(m.id) ? { ...m, is_read: true } : m));
  };

  useEffect(() => {
    if (activeSelected && mobileChatOpen) {
      markAsRead(activeSelected.id, activeSelected.isGroup);
    }
  }, [activeSelected, mobileChatOpen, supabaseMessages.length]);

  const handleCreateGroup = () => {
    if (!groupName.trim() || selectedMembers.length === 0) return;
    const newGroup = {
      id: `group_${Date.now()}`,
      name: groupName.trim(),
      members: [user.id, ...selectedMembers],
      admins: [user.id],
      settings: {
        onlyAdminsCanMessage: false,
        groupLogo: null
      },
      createdBy: user.id,
      color: '#8b5cf6'
    };
    setGroups(prev => [...prev, newGroup]);
    setIsCreatingGroup(false);
    setGroupName('');
    setSelectedMembers([]);
    setSelected(newGroup);
    setMobileChatOpen(true);
  };

  const handleUpdateGroup = () => {
    if (!activeSelected || !activeSelected.isGroup) return;
    const updatedGroups = groups.map(g => {
      if (g.id === activeSelected.id) {
        return { 
          ...g, 
          name: editName.trim() || g.name,
          settings: { ...g.settings, onlyAdminsCanMessage: editOnlyAdmins }
        };
      }
      return g;
    });
    setGroups(updatedGroups);
    setIsEditingGroup(false);
  };

  const handleClearChat = async () => {
    if (!activeSelected || !user) return;
    if (!window.confirm("Are you sure you want to clear all messages in this chat?")) return;
    
    // In a real app, we'd probably delete or mark as hidden for this user
    // For this demo, we'll just delete from Supabase if we have permission
    const { error } = await supabase
      .from('messages')
      .delete()
      .or(`and(sender_id.eq.${user.id},receiver_id.eq.${activeSelected.id}),and(sender_id.eq.${activeSelected.id},receiver_id.eq.${user.id})`);
    
    if (!error) loadMessages();
  };

  const isAdmin = activeSelected?.isGroup && activeSelected.admins?.some(a => String(a) === String(user?.id));
  const isBlocked = activeSelected && !activeSelected.isGroup && (blockedUsers[user?.id] || []).includes(activeSelected.id);
  const hasBlockedMe = activeSelected && !activeSelected.isGroup && (blockedUsers[activeSelected.id] || []).includes(user?.id);
  
  const canMessage = !activeSelected?.isGroup 
    ? (!isBlocked && !hasBlockedMe) 
    : (!activeSelected.settings?.onlyAdminsCanMessage || isAdmin);

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      {isOffline && (
        <div className="offline-banner" style={{ background: '#f59e0b', color: '#fff', padding: '8px', textAlign: 'center', borderRadius: '8px', marginBottom: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 600 }}>
          <WifiOff size={16} /> Neural Sync Offline — showing cached data
        </div>
      )}
      <h1 className="page-title">Messages</h1>
      <p className="page-subtitle">Chat with teachers and classmates.</p>

      <div className="messages-layout glass" style={{ padding: 0 }}>
        {/* Contacts Area */}
        <div className={`contacts-list ${mobileChatOpen ? 'hide-on-mobile' : ''}`} style={{ borderRight: '1px solid rgba(var(--invert-rgb),0.06)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '15px', borderBottom: '1px solid rgba(var(--invert-rgb),0.06)' }}>
            {!isSearching && !isCreatingGroup ? (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn btn-secondary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '0.8rem' }} onClick={() => setIsSearching(true)}>
                  <Plus size={14} /> New Chat
                </button>
                <button className="btn btn-secondary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '0.8rem' }} onClick={() => { setIsCreatingGroup(true); setSearchQuery(''); }}>
                  <Users size={14} /> New Group
                </button>
              </div>
            ) : isSearching ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ flex: 1, position: 'relative' }}>
                  <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                  <input 
                    autoFocus
                    placeholder="Search name..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="chat-input"
                    style={{ width: '100%', paddingLeft: 30, paddingRight: 10, paddingTop: 6, paddingBottom: 6, fontSize: '0.85rem' }}
                  />
                </div>
                <button className="btn btn-secondary" onClick={() => { setIsSearching(false); setSearchQuery(''); }} style={{ padding: '6px' }}>
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input 
                    autoFocus
                    placeholder="Group name..."
                    value={groupName}
                    onChange={e => setGroupName(e.target.value)}
                    className="chat-input"
                    style={{ flex: 1, paddingTop: 6, paddingBottom: 6, fontSize: '0.85rem' }}
                  />
                  <button className="btn btn-secondary" onClick={() => { setIsCreatingGroup(false); setGroupName(''); setSelectedMembers([]); setSearchQuery(''); }} style={{ padding: '6px' }}>
                    <X size={16} />
                  </button>
                </div>
                <button 
                  className="btn btn-primary" 
                  disabled={!groupName.trim() || selectedMembers.length === 0}
                  onClick={handleCreateGroup}
                  style={{ width: '100%', fontSize: '0.8rem', padding: '6px' }}
                >
                  Create Group ({selectedMembers.length})
                </button>
              </div>
            )}
          </div>

          <div style={{ flex: 1, overflowY: 'auto' }}>
            {loading ? (
              <div style={{ padding: 20 }}>
                {[1,2,3,4].map(i => (
                  <div key={i} className="skeleton-pulse" style={{ height: 60, borderRadius: 12, marginBottom: 10, background: 'rgba(var(--invert-rgb), 0.05)' }} />
                ))}
              </div>
            ) : isCreatingGroup ? (
              [...Object.values(TEACHERS), ...ALL_STUDENTS]
                .filter(p => p.id !== user.id)
                .filter(p => !searchQuery.trim() || p.name.toLowerCase().includes(searchQuery.toLowerCase()))
                .map(p => (
                <div key={p.id} className="contact-item" onClick={() => setSelectedMembers(prev => prev.includes(p.id) ? prev.filter(m => m !== p.id) : [...prev, p.id])} style={{ padding: '10px 15px' }}>
                  <div className="contact-avatar" style={{ background: (getUserInfo(p.id).color || '#ccc') + '33', color: getUserInfo(p.id).color || '#ccc', width: 32, height: 32, fontSize: '0.8rem', overflow: 'hidden' }}>
                    {renderAvatar(p.id, getUserInfo(p.id).avatar)}
                  </div>
                  <div className="contact-info">
                    <div className="contact-name" style={{ fontSize: '0.85rem' }}>{p.name}</div>
                    <div className="contact-preview" style={{ fontSize: '0.7rem' }}>{p.dept || 'Teacher'}</div>
                  </div>
                  {selectedMembers.includes(p.id) && <Check size={16} style={{ color: 'var(--primary)' }} />}
                </div>
              ))
            ) : isSearching && searchQuery.trim() !== '' ? (
              searchResults.length > 0 ? (
                searchResults.map(c => (
                  <div key={c.id} className="contact-item" onClick={() => startChat(c)}>
                    <div className="contact-avatar" style={{ background: (c.color || '#ccc') + '33', color: c.color || '#ccc', fontWeight: 700, overflow: 'hidden' }}>
                      {renderAvatar(c.id, c.avatar || 'U')}
                    </div>
                    <div className="contact-info">
                      <div className="contact-name">{c.name}</div>
                      <div className="contact-preview">{c.role}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ padding: 20, textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>No users found.</div>
              )
            ) : (
              contacts.length > 0 ? contacts.map(c => (
                <div key={c.id} className={`contact-item ${String(activeSelected?.id) === String(c.id) ? 'active' : ''}`} onClick={() => { setSelected(c); setMobileChatOpen(true); }}>
                  <div className="contact-avatar" style={{ background: (c.color || '#ccc') + '33', color: c.color || '#ccc', fontWeight: 700, overflow: 'hidden' }}>
                    {renderAvatar(c.id, c.avatar || 'U', c.isGroup, c.groupLogo)}
                  </div>
                  <div className="contact-info">
                    <div className="contact-name">{c.name}</div>
                    <div className="contact-preview" style={{ fontWeight: c.unreadCount > 0 ? 700 : 400, color: c.unreadCount > 0 ? 'var(--text-primary)' : 'var(--text-muted)' }}>{c.lastMsg || ''}</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                    <div className="contact-time">{c.lastMsgTime ? new Date(c.lastMsgTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</div>
                    {c.unreadCount > 0 && (
                      <div style={{ background: 'var(--primary)', color: '#fff', borderRadius: '10px', minWidth: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 700, padding: '0 5px' }}>
                        {c.unreadCount}
                      </div>
                    )}
                  </div>
                </div>
              )) : (
                <div style={{ padding: 30, textAlign: 'center', color: '#64748b', fontSize: '0.9rem' }}>
                  Your inbox is empty.<br/><br/>Click "New Chat" to start a conversation.
                </div>
              )
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className={`chat-area ${!mobileChatOpen ? 'hide-on-mobile' : ''}`} style={{ display: 'flex', flexDirection: 'column' }}>
          {activeSelected ? (
            <>
              <div className="chat-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <button className="mobile-back-btn" onClick={() => setMobileChatOpen(false)}>
                    <ChevronLeft size={24} />
                  </button>
                  <div className="contact-avatar" style={{ background: (activeSelected.color || '#ccc') + '33', color: activeSelected.color || '#ccc', width: 36, height: 36, fontSize: '0.9rem', overflow: 'hidden' }}>
                    {renderAvatar(activeSelected.id, activeSelected.avatar || 'U', activeSelected.isGroup, activeSelected.settings?.groupLogo)}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600 }}>{activeSelected.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{activeSelected.role}</div>
                  </div>
                </div>
                {!activeSelected.isGroup && (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn btn-secondary" title="Clear Chat" style={{ padding: '6px 10px', color: '#64748b' }} onClick={handleClearChat}>
                      <Eraser size={16} />
                    </button>
                  </div>
                )}
              </div>

              <div className="chat-messages" style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
                {loading && selectedMessages.length === 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {[1,2,3].map(i => (
                      <div key={i} className="skeleton-pulse" style={{ width: '60%', height: 40, borderRadius: 16, alignSelf: i%2===0?'flex-end':'flex-start', background: 'rgba(var(--invert-rgb), 0.05)' }} />
                    ))}
                  </div>
                ) : selectedMessages.map((m, i) => {
                  const isMe = String(m.sender_id) === String(user?.id);
                  const senderInfo = !isMe ? getUserInfo(m.sender_id) : null;
                  return (
                    <div key={m.id || i} className={`msg-row ${isMe ? 'sent' : ''}`} style={{ marginBottom: '10px', display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start', gap: '8px' }}>
                      {!isMe && (
                        <div className="contact-avatar" style={{ width: 28, height: 28, fontSize: '0.7rem', overflow: 'hidden', marginTop: '4px' }}>
                          {renderAvatar(m.sender_id, senderInfo.avatar)}
                        </div>
                      )}
                      <div className={`bubble ${isMe ? 'bubble-sent' : 'bubble-received'}`} style={{ 
                        maxWidth: '70%', 
                        padding: '10px 14px', 
                        borderRadius: '18px', 
                        position: 'relative', 
                        paddingBottom: '20px',
                        background: isMe ? 'var(--primary)' : 'rgba(var(--invert-rgb), 0.05)',
                        color: isMe ? '#fff' : 'var(--text-primary)',
                        boxShadow: isMe ? '0 4px 15px rgba(var(--primary-rgb), 0.3)' : 'none',
                        alignSelf: 'flex-start'
                      }}>
                        {activeSelected.isGroup && !isMe && (
                          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: senderInfo.color, marginBottom: '4px' }}>
                            {senderInfo.name}
                          </div>
                        )}
                        <div style={{ fontSize: '0.9rem', lineHeight: '1.4' }}>{m.content}</div>
                        <div style={{ 
                          position: 'absolute', 
                          bottom: '6px', 
                          right: '12px', 
                          fontSize: '0.6rem', 
                          opacity: 0.7, 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '4px' 
                        }}>
                          {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          {isMe && <Check size={10} />}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              <div className="chat-input-row" style={{ padding: '15px', borderTop: '1px solid rgba(var(--invert-rgb), 0.06)', display: 'flex', gap: '10px' }}>
                {canMessage ? (
                  <>
                    <input 
                      className="chat-input" 
                      placeholder="Type a message..." 
                      value={inputVal} 
                      onChange={e => setInputVal(e.target.value)} 
                      onKeyDown={e => e.key === 'Enter' && sendMsg()} 
                      style={{ flex: 1, padding: '10px 15px', borderRadius: '12px', background: 'rgba(var(--invert-rgb), 0.04)', border: 'none', outline: 'none' }}
                    />
                    <button className="btn btn-primary" onClick={sendMsg} style={{ width: '42px', height: '42px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}><Send size={18} /></button>
                  </>
                ) : (
                  <div style={{ flex: 1, padding: '12px', background: 'rgba(var(--invert-rgb), 0.05)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#64748b', fontSize: '0.85rem' }}>
                    <ShieldAlert size={14} /> 
                    {activeSelected.isGroup ? "Only admins can send messages." : "Cannot message this user."}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#64748b', gap: '15px' }}>
              <div className="w-16 h-16 rounded-3xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-center">
                <Send size={32} className="opacity-20" />
              </div>
              <p className="text-sm">Select a chat or start a new conversation</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

