import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User, Sparkles } from 'lucide-react';

export default function AIChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Hello! I am your DYPCOEI Neural Assistant. How can I help with your B.Tech studies today?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isTyping]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Mock AI Response (Simulation)
    setTimeout(() => {
      let response = "I'm analyzing your request via the Neural Core...";
      if (input.toLowerCase().includes('schedule')) response = "Your next class is Physics in Block 102. Would you like me to set a reminder?";
      else if (input.toLowerCase().includes('attendance')) response = "Your overall attendance is 91%. You're in the safe zone!";
      else if (input.toLowerCase().includes('task')) response = "You have 2 pending assignments. The AEC assignment is due tonight.";
      else response = "That's a great question about FY B.Tech. I recommend focusing on your foundational Engineering Mathematics and Mechanics this week.";

      setMessages(prev => [...prev, { role: 'assistant', text: response }]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="ai-assistant-wrapper" style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 1000 }}>
      {!isOpen && (
        <button 
          className="ai-toggle-btn"
          onClick={() => setIsOpen(true)}
          style={{ 
            width: '60px', 
            height: '60px', 
            borderRadius: '50%', 
            background: '#e11d48', 
            color: 'white', 
            border: 'none', 
            boxShadow: '0 8px 32px rgba(225, 29, 72, 0.4)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          <Bot size={28} />
          <div className="ai-ping" style={{ position: 'absolute', top: 0, right: 0, width: 14, height: 14, background: '#10b981', borderRadius: '50%', border: '2px solid #050508' }} />
        </button>
      )}

      {isOpen && (
        <div className="ai-chat-panel glass fade-in" style={{ 
          width: '360px', 
          height: '500px', 
          maxHeight: '80vh',
          display: 'flex', 
          flexDirection: 'column',
          borderRadius: '20px',
          overflow: 'hidden',
          boxShadow: '0 20px 80px rgba(0,0,0,0.5)',
          border: '1px solid rgba(225, 29, 72, 0.2)'
        }}>
          <div style={{ 
            padding: '16px 20px', 
            background: 'linear-gradient(135deg, #e11d48, #be123c)', 
            color: 'white', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between' 
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ background: 'rgba(255,255,255,0.2)', padding: '6px', borderRadius: '8px' }}><Sparkles size={18} /></div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Neural Assistant</div>
                <div style={{ fontSize: '0.65rem', opacity: 0.8 }}>Claude-3 Sonnet Node</div>
              </div>
            </div>
            <button className="btn-ghost" onClick={() => setIsOpen(false)} style={{ color: 'white', padding: '4px' }}><X size={20} /></button>
          </div>

          <div 
            ref={scrollRef}
            style={{ 
              flex: 1, 
              overflowY: 'auto', 
              padding: '20px', 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '16px',
              background: 'rgba(5, 5, 8, 0.4)'
            }}
          >
            {messages.map((m, i) => (
              <div key={i} style={{ 
                alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '85%',
                display: 'flex',
                gap: '8px',
                flexDirection: m.role === 'user' ? 'row-reverse' : 'row'
              }}>
                <div style={{ 
                  width: '28px', 
                  height: '28px', 
                  borderRadius: '50%', 
                  background: m.role === 'user' ? 'rgba(var(--invert-rgb), 0.1)' : 'rgba(225, 29, 72, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: '4px'
                }}>
                  {m.role === 'user' ? <User size={14} /> : <Bot size={14} color="#e11d48" />}
                </div>
                <div style={{ 
                  padding: '10px 14px', 
                  borderRadius: '14px', 
                  fontSize: '0.82rem',
                  lineHeight: '1.5',
                  background: m.role === 'user' ? 'linear-gradient(135deg, #e11d48, #be123c)' : 'rgba(var(--invert-rgb), 0.05)',
                  color: m.role === 'user' ? 'white' : '#f1f5f9',
                  border: m.role === 'user' ? 'none' : '1px solid rgba(var(--invert-rgb), 0.05)'
                }}>
                  {m.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div style={{ alignSelf: 'flex-start', display: 'flex', gap: '8px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(225, 29, 72, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Bot size={14} color="#e11d48" />
                </div>
                <div className="typing-indicator" style={{ padding: '10px 14px', borderRadius: '14px', background: 'rgba(var(--invert-rgb), 0.05)' }}>
                  <span>.</span><span>.</span><span>.</span>
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSend} style={{ padding: '16px', borderTop: '1px solid rgba(var(--invert-rgb), 0.06)', display: 'flex', gap: '10px' }}>
            <input 
              placeholder="Ask me anything..." 
              value={input}
              onChange={e => setInput(e.target.value)}
              style={{ 
                flex: 1, 
                background: 'rgba(var(--invert-rgb), 0.05)', 
                border: '1px solid rgba(var(--invert-rgb), 0.1)', 
                borderRadius: '10px', 
                padding: '8px 14px', 
                fontSize: '0.85rem',
                color: 'white',
                outline: 'none'
              }}
            />
            <button type="submit" className="btn btn-primary" style={{ padding: '8px', borderRadius: '10px' }}><Send size={18} /></button>
          </form>
        </div>
      )}
    </div>
  );
}
