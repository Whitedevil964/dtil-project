import React, { useState, useMemo, useEffect } from 'react';
import { Send, Search, Plus, X, Users, Check, Settings, Image as ImageIcon, ShieldAlert, UserPlus, UserMinus, ShieldCheck, Trash2, MoreVertical, Eraser, UserX, Ban, ChevronLeft } from 'lucide-react';
import { ALL_STUDENTS, TEACHERS } from '../data/schoolData';

const INITIAL_CONTACTS = [];

function getUserInfo(id) {
  const t = Object.values(TEACHERS || {}).find(t => String(t?.id) === String(id));
  if (t) return { id: t.id, name: t.name, role: `Teacher`, avatar: t.abbr || t.name[0], color: '#3b82f6' };
  
  const s = (ALL_STUDENTS || []).find(s => String(s?.id) === String(id));
  if (s) return { id: s.id, name: s.name, role: s.dept, avatar: s.name[0], color: '#10b981' };
  
  return { id, name: 'Unknown User', role: 'User', avatar: 'U', color: '#64748b' };
}

export default function MessagesPage({ user, globalChats = {}, setGlobalChats, profilePics, profilePrivacy, groups = [], setGroups, blockedUsers = {}, setBlockedUsers }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [inputVal, setInputVal] = useState('');
  const [mobileChatOpen, setMobileChatOpen] = useState(false);
  
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
  
  const getChatKey = (otherId) => {
    if (!user?.id || !otherId) return null;
    if (String(otherId).startsWith('group_')) return String(otherId);
    return [String(user.id), String(otherId)].sort().join('_chat_');
  };

  // Derive ALL contacts that the user has a chat history with
  const contacts = useMemo(() => {
    if (!user) return INITIAL_CONTACTS;
    
    const userContactsMap = new Map();
    
    // First add any manually opened chats (even if empty)
    activeChatIds.forEach(id => {
      userContactsMap.set(String(id), { ...getUserInfo(id), messages: [], lastMsg: 'New conversation', time: 'Just now' });
    });
    
    // Then process global history
    Object.keys(globalChats).forEach(key => {
      if (key.includes('_chat_')) {
        const ids = key.split('_chat_');
        if (ids.includes(String(user.id))) {
          const otherId = ids[0] === String(user.id) ? ids[1] : ids[0];
          const msgs = globalChats[key] || [];
          const lastMsg = msgs.length > 0 ? msgs[msgs.length - 1] : null;
          
          const info = getUserInfo(otherId);
          info.messages = msgs;
          info.lastMsg = lastMsg ? (lastMsg.from === user.id ? `You: ${lastMsg.text}` : lastMsg.text) : 'New conversation';
          info.time = 'Recently';
          userContactsMap.set(String(otherId), info);
        }
      }
    });

    // Add groups
    groups.forEach(g => {
      if (g.members.includes(user.id)) {
        const msgs = globalChats[g.id] || [];
        const lastMsg = msgs.length > 0 ? msgs[msgs.length - 1] : null;
        userContactsMap.set(g.id, {
          id: g.id,
          name: g.name,
          role: `${g.members.length} members`,
          members: g.members,
          avatar: <Users size={18} />,
          groupLogo: g.settings?.groupLogo,
          color: g.color || '#8b5cf6',
          isGroup: true,
          admins: g.admins || [g.createdBy],
          settings: g.settings || { onlyAdminsCanMessage: false, groupLogo: null },
          messages: msgs,
          lastMsg: lastMsg ? `${getUserInfo(lastMsg.from).name}: ${lastMsg.text}` : 'New group created',
          time: 'Recently'
        });
      }
    });
    
    const finalContacts = Array.from(userContactsMap.values());
    return finalContacts;
  }, [globalChats, user, activeChatIds, groups]);

  const [selected, setSelected] = useState(() => contacts[0] || null);

  // Derive the active selected contact data from the current contacts list
  const activeSelected = useMemo(() => {
    if (!selected) return null;
    return contacts.find(c => String(c.id) === String(selected.id)) || selected;
  }, [contacts, selected]);

  // If selected contact isn't in the list for some reason, select first
  if (selected && !contacts.find(c => String(c.id) === String(selected.id))) {
    if (contacts.length > 0) setSelected(contacts[0]);
  }

  const selectedMessages = useMemo(() => {
    if (!activeSelected || !user) return activeSelected?.messages || [];
    const key = getChatKey(activeSelected.id);
    return globalChats[key] || activeSelected.messages || [];
  }, [activeSelected, globalChats, user]);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    
    const matchedTeachers = Object.values(TEACHERS || {}).filter(t => t.name.toLowerCase().includes(q)).map(t => ({
      id: t.id, name: t.name, role: `Teacher`, avatar: t.abbr || t.name[0], color: '#8b5cf6'
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
    setSelected({ ...person, lastMsg: 'New conversation', time: 'Just now', messages: [] });
    setSearchQuery('');
    setIsSearching(false);
    setMobileChatOpen(true);
  };

  useEffect(() => {
    const preSelected = localStorage.getItem('preSelectedChat');
    if (preSelected) {
      const student = (ALL_STUDENTS || []).find(s => s.name === preSelected);
      if (student) {
        startChat({
          id: student.id,
          name: student.name,
          role: student.dept,
          avatar: student.name[0],
          color: '#10b981'
        });
      }
      localStorage.removeItem('preSelectedChat');
    }
  }, [activeChatIds]);

  const sendMsg = () => {
    if (!inputVal.trim() || !activeSelected || !user || !setGlobalChats) return;
    
    const chatKey = getChatKey(activeSelected.id);
    const newMsg = { from: user.id, text: inputVal.trim(), timestamp: Date.now() };
    
    setGlobalChats(prev => ({
      ...prev,
      [chatKey]: [...(prev[chatKey] || []), newMsg]
    }));
    
    setInputVal('');
  };

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
    setSelected({ ...newGroup, role: `${newGroup.members.length} members`, members: newGroup.members, isGroup: true, messages: [] });
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
    setSelected(prev => ({ 
      ...prev, 
      name: editName.trim() || prev.name, 
      settings: { ...prev.settings, onlyAdminsCanMessage: editOnlyAdmins },
      members: prev.members // Ensure members persist
    }));
  };

  const handleGroupLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file && activeSelected && activeSelected.isGroup) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target.result;
        const updatedGroups = groups.map(g => {
          if (g.id === activeSelected.id) {
            return { ...g, settings: { ...g.settings, groupLogo: base64 } };
          }
          return g;
        });
        setGroups(updatedGroups);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteGroupLogo = () => {
    if (!activeSelected || !activeSelected.isGroup || !isAdmin) return;
    const updatedGroups = groups.map(g => {
      if (g.id === activeSelected.id) {
        return { ...g, settings: { ...g.settings, groupLogo: null } };
      }
      return g;
    });
    setGroups(updatedGroups);
  };

  const handleMakeAdmin = (memberId) => {
    if (!activeSelected || !activeSelected.isGroup || !isAdmin) return;
    const updatedGroups = groups.map(g => {
      if (g.id === activeSelected.id) {
        return { ...g, admins: [...(g.admins || []), memberId] };
      }
      return g;
    });
    setGroups(updatedGroups);
  };

  const handleRemoveMember = (memberId) => {
    if (!activeSelected || !activeSelected.isGroup || !isAdmin) return;
    if (memberId === user.id) return;
    
    const updatedGroups = groups.map(g => {
      if (g.id === activeSelected.id) {
        return { 
          ...g, 
          members: g.members.filter(m => m !== memberId),
          admins: (g.admins || []).filter(a => a !== memberId)
        };
      }
      return g;
    });
    setGroups(updatedGroups);
  };

  const handleDeleteGroup = () => {
    if (!activeSelected || !activeSelected.isGroup || !isAdmin) return;
    if (!window.confirm(`Are you sure you want to delete the group "${activeSelected.name}"? This action cannot be undone.`)) return;

    const updatedGroups = groups.filter(g => g.id !== activeSelected.id);
    setGroups(updatedGroups);
    setSelected(null);
    setIsEditingGroup(false);
  };

  const handleClearChat = () => {
    if (!activeSelected || !user || !setGlobalChats) return;
    if (!window.confirm("Are you sure you want to clear all messages in this chat?")) return;
    
    const chatKey = getChatKey(activeSelected.id);
    setGlobalChats(prev => ({
      ...prev,
      [chatKey]: []
    }));
  };

  const handleRemoveConversation = () => {
    if (!activeSelected || !user || !setGlobalChats) return;
    if (activeSelected.isGroup) return; 
    if (!window.confirm("Remove this conversation and its history?")) return;
    
    const chatKey = getChatKey(activeSelected.id);
    
    // Clear history
    setGlobalChats(prev => {
      const updated = { ...prev };
      delete updated[chatKey];
      return updated;
    });

    // Clear from active IDs
    setActiveChatIds(prev => prev.filter(id => String(id) !== String(activeSelected.id)));
    setSelected(null);
  };

  const handleToggleBlock = () => {
    if (!activeSelected || activeSelected.isGroup || !user) return;
    const currentBlocked = blockedUsers[user.id] || [];
    const isNowBlocked = currentBlocked.includes(activeSelected.id);
    
    let newBlockedList;
    if (isNowBlocked) {
      newBlockedList = currentBlocked.filter(id => id !== activeSelected.id);
    } else {
      if (!window.confirm(`Block ${activeSelected.name}? You will no longer be able to message each other.`)) return;
      newBlockedList = [...currentBlocked, activeSelected.id];
    }
    
    setBlockedUsers(prev => ({
      ...prev,
      [user.id]: newBlockedList
    }));
  };

  const handleDeleteMessage = (index) => {
    if (!activeSelected || !user || !setGlobalChats) return;
    const chatKey = getChatKey(activeSelected.id);
    const msgs = globalChats[chatKey] || [];
    const msg = msgs[index];
    if (!msg) return;

    const isMyMsg = String(msg.from) === String(user.id);
    if (!isMyMsg && !isAdmin) return;

    if (!window.confirm("Delete this message for everyone?")) return;

    const updatedMsgs = [...msgs];
    updatedMsgs.splice(index, 1);
    
    setGlobalChats(prev => ({
      ...prev,
      [chatKey]: updatedMsgs
    }));
  };

  const toggleMember = (id) => {
    setSelectedMembers(prev => prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]);
  };

  const isAdmin = activeSelected?.isGroup && activeSelected.admins?.some(a => String(a) === String(user?.id));
  const isBlocked = activeSelected && !activeSelected.isGroup && (blockedUsers[user?.id] || []).includes(activeSelected.id);
  const hasBlockedMe = activeSelected && !activeSelected.isGroup && (blockedUsers[activeSelected.id] || []).includes(user?.id);
  
  const canMessage = !activeSelected?.isGroup 
    ? (!isBlocked && !hasBlockedMe) 
    : (!activeSelected.settings?.onlyAdminsCanMessage || isAdmin);

  if (!contacts) {
    return <div style={{ padding: 40, textAlign: 'center' }}>Loading messages...</div>;
  }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
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
                <div style={{ position: 'relative' }}>
                  <Search size={12} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                  <input 
                    placeholder="Search members..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="chat-input"
                    style={{ width: '100%', paddingLeft: 28, paddingRight: 10, paddingTop: 5, paddingBottom: 5, fontSize: '0.75rem' }}
                  />
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
            {isCreatingGroup ? (
              // ... list creation ...
              [...Object.values(TEACHERS), ...ALL_STUDENTS]
                .filter(p => p.id !== user.id)
                .filter(p => !searchQuery.trim() || p.name.toLowerCase().includes(searchQuery.toLowerCase()))
                .map(p => (
                <div key={p.id} className="contact-item" onClick={() => toggleMember(p.id)} style={{ padding: '10px 15px' }}>
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
              // ... search results ...
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
                    <div className="contact-preview">{c.lastMsg || ''}</div>
                  </div>
                  <div className="contact-time">{c.time || ''}</div>
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
                {isAdmin && (
                  <button className="btn btn-secondary" style={{ padding: '6px 10px' }} onClick={() => { setIsEditingGroup(true); setEditName(activeSelected.name); setEditOnlyAdmins(activeSelected.settings?.onlyAdminsCanMessage); }}>
                    <Settings size={16} />
                  </button>
                )}
                {!activeSelected.isGroup && (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn btn-secondary" title="Clear Chat" style={{ padding: '6px 10px', color: '#64748b' }} onClick={handleClearChat}>
                      <Eraser size={16} />
                    </button>
                    <button className="btn btn-secondary" title="Remove Conversation" style={{ padding: '6px 10px', color: '#ef4444' }} onClick={handleRemoveConversation}>
                      <UserX size={16} />
                    </button>
                    <button className="btn btn-secondary" title={isBlocked ? "Unblock User" : "Block User"} style={{ padding: '6px 10px', color: isBlocked ? 'var(--primary)' : '#ef4444' }} onClick={handleToggleBlock}>
                      <Ban size={16} />
                    </button>
                  </div>
                )}
              </div>

              {isEditingGroup && (
                <div style={{ padding: '15px', borderBottom: '1px solid rgba(var(--invert-rgb),0.06)', background: 'rgba(var(--invert-rgb),0.02)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <h4 style={{ margin: 0, fontSize: '0.9rem' }}>Group Settings</h4>
                    <button className="btn btn-ghost" onClick={() => setIsEditingGroup(false)}><X size={16} /></button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div className="contact-avatar" style={{ width: 45, height: 45, fontSize: '1.2rem', overflow: 'hidden', flexShrink: 0 }}>
                        {renderAvatar(activeSelected.id, activeSelected.avatar || 'U', true, activeSelected.settings?.groupLogo)}
                      </div>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <label style={{ cursor: 'pointer', color: 'var(--primary)', fontSize: '0.8rem', fontWeight: 600, background: 'rgba(var(--primary-rgb), 0.1)', padding: '4px 10px', borderRadius: '6px' }}>
                          Change
                          <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleGroupLogoUpload} />
                        </label>
                        {activeSelected.settings?.groupLogo && (
                          <button onClick={handleDeleteGroupLogo} style={{ color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', border: 'none', padding: '4px 10px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                    <input 
                      className="chat-input" 
                      placeholder="Group name" 
                      value={editName} 
                      onChange={e => setEditName(e.target.value)} 
                    />
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px', background: 'rgba(var(--invert-rgb), 0.05)', borderRadius: '8px' }}>
                      <span style={{ fontSize: '0.85rem' }}>Only admins can send messages</span>
                      <label className="toggle">
                        <input type="checkbox" checked={editOnlyAdmins} onChange={() => setEditOnlyAdmins(!editOnlyAdmins)} />
                        <span className="toggle-slider" />
                      </label>
                    </div>

                    <div style={{ marginTop: '10px' }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', marginBottom: '8px', textTransform: 'uppercase' }}>
                        Members ({activeSelected.members?.length})
                      </div>
                      <div style={{ maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {activeSelected.members?.map(mid => {
                          const minfo = getUserInfo(mid);
                          const isMemAdmin = activeSelected.admins?.some(a => String(a) === String(mid));
                          return (
                            <div key={mid} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 8px', background: 'rgba(var(--invert-rgb), 0.03)', borderRadius: '8px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div className="contact-avatar" style={{ width: 28, height: 28, fontSize: '0.7rem', overflow: 'hidden' }}>
                                  {renderAvatar(mid, minfo.avatar)}
                                </div>
                                <div>
                                  <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                                    {minfo.name} {String(mid) === String(user.id) && '(You)'}
                                  </div>
                                  {isMemAdmin && <span style={{ fontSize: '0.65rem', color: 'var(--primary)', fontWeight: 700 }}>Group Admin</span>}
                                </div>
                              </div>
                              {isAdmin && String(mid) !== String(user.id) && (
                                <div style={{ display: 'flex', gap: '6px' }}>
                                  {!isMemAdmin && (
                                    <button onClick={() => handleMakeAdmin(mid)} title="Make Admin" style={{ background: 'none', border: 'none', color: '#10b981', cursor: 'pointer', padding: '4px' }}>
                                      <ShieldCheck size={16} />
                                    </button>
                                  )}
                                  <button onClick={() => handleRemoveMember(mid)} title="Remove from Group" style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}>
                                    <UserMinus size={16} />
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                      <button className="btn btn-primary" style={{ flex: 2 }} onClick={handleUpdateGroup}>Save Changes</button>
                      <button className="btn" style={{ flex: 1, background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)' }} onClick={handleDeleteGroup}>Delete Group</button>
                    </div>
                  </div>
                </div>
              )}

              <div className="chat-messages" style={{ flex: 1 }}>
                {Array.isArray(selectedMessages) && selectedMessages.map((m, i) => {
                  const isMe = String(m.from) === String(user?.id) || m.from === 'me';
                  const senderInfo = !isMe ? getUserInfo(m.from) : null;
                  const canDelete = isMe || isAdmin;
                  return (
                    <div key={i} className={`msg-row ${isMe ? 'sent' : ''}`}>
                      {!isMe && (
                        <div className="contact-avatar" style={{ width: 28, height: 28, fontSize: '0.7rem', overflow: 'hidden', marginTop: '4px' }}>
                          {renderAvatar(m.from, senderInfo.avatar)}
                        </div>
                      )}
                      <div className={`bubble ${isMe ? 'bubble-sent' : 'bubble-received'}`} style={{ position: 'relative', paddingBottom: '18px' }}>
                        {activeSelected.isGroup && !isMe && (
                          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: senderInfo.color, marginBottom: '4px' }}>
                            {senderInfo.name}
                          </div>
                        )}
                        {m.text}
                        <div style={{ 
                          position: 'absolute', 
                          bottom: '4px', 
                          right: '8px', 
                          fontSize: '0.65rem', 
                          opacity: 0.7, 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '4px' 
                        }}>
                          {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          {isMe && (
                            <span title="Neural Read Receipt">
                              <Check size={10} style={{ color: '#fff' }} />
                              <Check size={10} style={{ color: '#fff', marginLeft: '-6px' }} />
                            </span>
                          )}
                        </div>
                        {isMe && (
                          <button 
                            className="btn-ghost msg-delete-btn" 
                            style={{ 
                              position: 'absolute', 
                              color: '#ef4444',
                              cursor: 'pointer',
                              padding: '4px',
                              opacity: 0.6,
                              transition: 'opacity 0.2s'
                            }}
                            title="Delete for everyone"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="chat-input-row">
                {canMessage ? (
                  <>
                    <input className="chat-input" placeholder="Type a message..." value={inputVal} onChange={e => setInputVal(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMsg()} />
                    <button className="btn btn-primary" onClick={sendMsg} style={{ padding: '9px 16px' }}><Send size={16} /></button>
                  </>
                ) : (
                  <div style={{ flex: 1, padding: '10px', background: 'rgba(var(--invert-rgb), 0.05)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#64748b', fontSize: '0.85rem' }}>
                    <ShieldAlert size={14} /> 
                    {activeSelected.isGroup 
                      ? "Only admins can send messages to this group." 
                      : (isBlocked ? "You have blocked this user." : "This user has blocked you.")
                    }
                  </div>
                )}
              </div>
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
              Select a chat or start a new conversation
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
