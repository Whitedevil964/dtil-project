import React, { useState } from 'react';
import { Send } from 'lucide-react';

const CONTACTS = [
  { id: 1, name: 'Prof. S. Jenkins', role: 'AI & ML Teacher', avatar: 'J', color: '#8b5cf6', lastMsg: 'Please submit the assignment by tonight.', time: '10m', messages: [
    { from: 'them', text: 'Hello! Please submit the Neural Network assignment by 11:59 PM tonight.' },
    { from: 'me', text: 'Yes Prof, I will submit it before the deadline. I am 70% done.' },
    { from: 'them', text: 'Great! Let me know if you need any help.' },
  ]},
  { id: 2, name: 'Prof. K. Sharma', role: 'Quantum Computing', avatar: 'K', color: '#3b82f6', lastMsg: 'Room changed to 102 today.', time: '25m', messages: [
    { from: 'them', text: 'Important: Today\'s lecture is moved to Physics Block Room 102 due to projector issues.' },
    { from: 'me', text: 'Noted! Thank you for informing.' },
  ]},
  { id: 3, name: 'Zaid (Class Rep)', role: 'Computer Engineering Y2', avatar: 'Z', color: '#10b981', lastMsg: 'Are you attending today?', time: '1h', messages: [
    { from: 'them', text: 'Hey, are you attending the 3:30 PM math lecture?' },
  ]},
];

export default function MessagesPage({ user }) {
  const [selected, setSelected] = useState(CONTACTS[0]);
  const [inputVal, setInputVal] = useState('');
  const [chats, setChats] = useState(
    Object.fromEntries(CONTACTS.map(c => [c.id, c.messages]))
  );

  const sendMsg = () => {
    if (!inputVal.trim()) return;
    setChats(prev => ({
      ...prev,
      [selected.id]: [...(prev[selected.id] || []), { from: 'me', text: inputVal.trim() }],
    }));
    setInputVal('');
  };

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      <h1 className="page-title">Messages</h1>
      <p className="page-subtitle">Chat with teachers and classmates.</p>

      <div className="messages-layout glass" style={{ padding: 0 }}>
        {/* Contacts */}
        <div className="contacts-list" style={{ borderRight: '1px solid rgba(var(--invert-rgb),0.06)' }}>
          {CONTACTS.map(c => (
            <div
              key={c.id}
              className={`contact-item ${selected.id === c.id ? 'active' : ''}`}
              onClick={() => setSelected(c)}
            >
              <div className="contact-avatar" style={{ background: c.color + '33', color: c.color, fontWeight: 700 }}>
                {c.avatar}
              </div>
              <div className="contact-info">
                <div className="contact-name">{c.name}</div>
                <div className="contact-preview">{c.lastMsg}</div>
              </div>
              <div className="contact-time">{c.time}</div>
            </div>
          ))}
        </div>

        {/* Chat area */}
        <div className="chat-area">
          <div className="chat-header">
            <div className="contact-avatar" style={{ background: selected.color + '33', color: selected.color, width: 36, height: 36, fontSize: '0.9rem' }}>
              {selected.avatar}
            </div>
            <div>
              <div style={{ fontWeight: 600 }}>{selected.name}</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{selected.role}</div>
            </div>
          </div>

          <div className="chat-messages">
            {(chats[selected.id] || []).map((m, i) => (
              <div key={i} className={`msg-row ${m.from === 'me' ? 'sent' : ''}`}>
                {m.from !== 'me' && (
                  <div className="contact-avatar" style={{ background: selected.color + '33', color: selected.color, width: 30, height: 30, fontSize: '0.8rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {selected.avatar}
                  </div>
                )}
                <div className={`bubble ${m.from === 'me' ? 'bubble-sent' : 'bubble-received'}`}>
                  {m.text}
                </div>
              </div>
            ))}
          </div>

          <div className="chat-input-row">
            <input
              className="chat-input"
              placeholder="Type a message..."
              value={inputVal}
              onChange={e => setInputVal(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMsg()}
            />
            <button className="btn btn-primary" onClick={sendMsg} style={{ padding: '9px 16px' }}>
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
