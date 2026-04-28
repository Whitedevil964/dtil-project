import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, User, Sparkles, Image as ImageIcon, Loader2, Key, Trash2 } from 'lucide-react';

// ─── SAFE API KEY SETUP ───────────────────────────────────────────────────────
// NEVER hardcode your API key here if you use GitHub!
// Instead create a .env file in your project root with:
//   VITE_GEMINI_API_KEY=AIzaSy...yourkey...
// Then add .env to your .gitignore file!
// This reads the key safely from environment variables:
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// ─── SCHOOL CONTEXT ───────────────────────────────────────────────────────────
const SCHOOL_CONTEXT = {
  subjects: [
    'Advanced Engineering Calculus (AEC)',
    'Modern Engineering Chemistry (MEC)',
    'Modern Electrical Engineering (MEE)',
    'Graphical User Interface (GUI)',
    'Object Oriented Programming C++ (OOP)',
    'Analog & Digital Electronics (ADE)',
    'Design Thinking & Idea Lab (DTIL)',
    'Indian Knowledge System (IKS)'
  ],
  teachers: [
    'Mr. Ramchandra Popale (RAP)',
    'Mrs. Priyanka Bikkad (PNB)',
    'Mr. Ashok Patil',
    'Mr. Yogesh Nagvekar'
  ],
  college: 'Dr. D.Y. Patil College of Engineering & Innovation, Varale, Talegaon, Pune',
  year: 'FY B.Tech 2024-25'
};

const buildSystemPrompt = (userContext) => `
You are the "Neural Assistant" — the AI core of the DYPCOEI Academic Portal.
You are an expert academic guide for FY B.Tech students.

PERSONALITY: Futuristic, professional, warm, and encouraging.
Use terms like "Neural Link", "Academic Node", "Core Sync" to match the sci-fi theme.

COLLEGE: ${SCHOOL_CONTEXT.college} | ${SCHOOL_CONTEXT.year}
SUBJECTS: ${SCHOOL_CONTEXT.subjects.join(', ')}
TEACHERS: ${SCHOOL_CONTEXT.teachers.join(', ')}
USER: ${JSON.stringify(userContext || { role: 'Student' })}

HELP WITH: Subject explanations, study tips, exam prep, platform features,
academic planning, image analysis of notes/diagrams.

Always be encouraging, concise, and clear. If unsure about real-time data, say so.
`;

// ─── FILE TO BASE64 ───────────────────────────────────────────────────────────
const fileToBase64 = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onloadend = () => resolve({ base64: reader.result.split(',')[1], mimeType: file.type });
  reader.onerror = reject;
  reader.readAsDataURL(file);
});

// ─── GEMINI API CALL ──────────────────────────────────────────────────────────
const callGemini = async (apiKey, messages, userContext, imageFile = null) => {
  const contents = [];

  // History (all except last message)
  for (const m of messages.slice(0, -1)) {
    if (!m.text) continue;
    contents.push({ role: m.role === 'user' ? 'user' : 'model', parts: [{ text: m.text }] });
  }

  // Current message parts
  const currentMsg = messages[messages.length - 1];
  const parts = [];

  if (imageFile) {
    const { base64, mimeType } = await fileToBase64(imageFile);
    parts.push({ inlineData: { data: base64, mimeType } });
  }
  parts.push({ text: currentMsg?.text || 'Analyze this image in an academic context.' });
  contents.push({ role: 'user', parts });

  const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: {
        parts: [{ text: buildSystemPrompt(userContext) }]
      },
      contents,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024
      }
    })
  });

  const data = await response.json();

  if (!response.ok) {
    const msg = data?.error?.message || `Error ${response.status}`;
    if (response.status === 400 || msg.includes('API_KEY_INVALID'))
      throw new Error('Invalid API Key. Get a free key at aistudio.google.com');
    if (response.status === 429)
      throw new Error('⏳ Neural Core cooling down... Wait 30 seconds and try again. (Free tier: 15 requests/minute)');
    throw new Error(msg);
  }

  if (data.candidates?.[0]?.finishReason === 'SAFETY')
    throw new Error('Response blocked by safety filter. Please rephrase.');

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Empty response. Please try again.');
  return text;
};

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function AIChat({ userContext }) {
  const [isOpen, setIsOpen] = useState(false);
  const [apiKey, setApiKey] = useState(
    () => API_KEY || localStorage.getItem('GEMINI_API_KEY') || ''
  );
  const [showKeyInput, setShowKeyInput] = useState(
    () => !API_KEY && !localStorage.getItem('GEMINI_API_KEY')
  );
  const [messages, setMessages] = useState([{
    role: 'model',
    text: 'Hello! I am your DYPCOEI Neural Assistant ✦\n\nI can help with subjects, study tips, platform features, and even analyze images of your notes. How can I assist you today?'
  }]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [cooldown, setCooldown] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [keyError, setKeyError] = useState('');
  const scrollRef = useRef(null);
  const fileRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current)
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen) setTimeout(() => textareaRef.current?.focus(), 150);
  }, [isOpen]);

  const clearImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith('image/')) return;
    setSelectedImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSaveKey = (e) => {
    e.preventDefault();
    const key = e.target.elements.apiKey.value.trim();
    if (!key) { setKeyError('Please enter an API key.'); return; }
    if (!key.startsWith('AIza')) { setKeyError('Gemini keys start with "AIza..." — check your key.'); return; }
    localStorage.setItem('GEMINI_API_KEY', key);
    setApiKey(key);
    setShowKeyInput(false);
    setKeyError('');
  };

  const handleClearChat = () => setMessages([{
    role: 'model', text: 'Neural Link reset ✦ How can I assist you?'
  }]);

  const handleSend = async () => {
    if (isTyping || cooldown) return;
    if (!input.trim() && !selectedImage) return;
    if (!apiKey) { setShowKeyInput(true); return; }

    const userMsg = { role: 'user', text: input.trim(), image: imagePreview };
    const imgFile = selectedImage;

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    clearImage();
    setIsTyping(true);
    setCooldown(true);
    setTimeout(() => setCooldown(false), 3000);
    if (textareaRef.current) textareaRef.current.style.height = 'auto';

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      const text = await callGemini(apiKey, [...messages, userMsg], userContext, imgFile);
      setMessages(prev => [...prev, { role: 'model', text }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'model', text: `⚠ Neural Sync Failure: ${err.message}` }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  // ── Shared styles ──
  const S = {
    surface: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' },
    red: 'linear-gradient(135deg,#e11d48,#be123c)'
  };

  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999 }}>

      {/* Floating button */}
      {!isOpen && (
        <button onClick={() => setIsOpen(true)}
          style={{
            width: 60, height: 60, borderRadius: '50%', border: 'none',
            background: S.red, color: 'white', cursor: 'pointer', position: 'relative',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 32px rgba(225,29,72,0.45)',
            transition: 'transform .3s cubic-bezier(.175,.885,.32,1.275)'
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.12)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          <Bot size={26} />
          <span style={{
            position: 'absolute', top: 2, right: 2, width: 13, height: 13,
            background: '#10b981', borderRadius: '50%', border: '2px solid #0a0a0f',
            animation: 'ai-pulse 2s infinite'
          }} />
        </button>
      )}

      {/* Chat panel */}
      {isOpen && (
        <div style={{
          width: 400, height: 600, maxHeight: '85vh',
          display: 'flex', flexDirection: 'column', borderRadius: 20, overflow: 'hidden',
          background: 'rgba(8,8,14,0.97)', backdropFilter: 'blur(24px)',
          border: '1px solid rgba(225,29,72,0.2)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.8),inset 0 1px 0 rgba(255,255,255,0.04)',
          animation: 'ai-up .3s cubic-bezier(.22,1,.36,1)'
        }}>

          {/* Header */}
          <div style={{
            padding: '14px 16px', flexShrink: 0, background: S.red,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ background: 'rgba(255,255,255,0.18)', padding: 6, borderRadius: 8, display: 'flex' }}>
                <Sparkles size={16} color="white" />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '.95rem', color: 'white' }}>Neural Assistant</div>
                <div style={{ fontSize: '.6rem', color: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
                  <span style={{ width: 6, height: 6, background: '#10b981', borderRadius: '50%', display: 'inline-block' }} />
                  Gemini 2.0 Flash · Free
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              <Btn onClick={handleClearChat} title="Clear"><Trash2 size={14} /></Btn>
              <Btn onClick={() => setShowKeyInput(v => !v)} title="API Key"><Key size={14} /></Btn>
              <Btn onClick={() => setIsOpen(false)} title="Close"><X size={16} /></Btn>
            </div>
          </div>

          {/* Key input */}
          {showKeyInput && (
            <div style={{ padding: '14px 16px', flexShrink: 0, background: 'rgba(225,29,72,0.06)', borderBottom: '1px solid rgba(225,29,72,0.15)' }}>
              <div style={{ fontSize: '.68rem', color: '#94a3b8', marginBottom: 8, letterSpacing: '.06em', fontWeight: 600 }}>
                FREE GEMINI API KEY
              </div>
              <form onSubmit={handleSaveKey}>
                <div style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                  <input name="apiKey" type="password" placeholder="AIzaSy..."
                    defaultValue={apiKey} autoComplete="off"
                    style={{
                      flex: 1, background: 'rgba(255,255,255,0.05)',
                      border: `1px solid ${keyError ? '#ef4444' : 'rgba(255,255,255,0.1)'}`,
                      borderRadius: 8, padding: '8px 12px', color: 'white', fontSize: '.82rem', outline: 'none'
                    }}
                  />
                  <button type="submit" style={{
                    padding: '8px 14px', borderRadius: 8, border: 'none',
                    background: '#e11d48', color: 'white', fontSize: '.8rem', fontWeight: 600, cursor: 'pointer'
                  }}>Save</button>
                </div>
                {keyError && <div style={{ fontSize: '.68rem', color: '#ef4444', marginBottom: 4 }}>⚠ {keyError}</div>}
                <div style={{ fontSize: '.62rem', color: '#475569' }}>
                  Get free key →{' '}
                  <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" style={{ color: '#e11d48' }}>
                    aistudio.google.com
                  </a>
                  {' '}· Saved only in your browser
                </div>
              </form>
            </div>
          )}

          {/* Messages */}
          <div ref={scrollRef} style={{
            flex: 1, overflowY: 'auto', padding: 16,
            display: 'flex', flexDirection: 'column', gap: 12,
            scrollbarWidth: 'thin', scrollbarColor: 'rgba(225,29,72,0.2) transparent'
          }}>
            {messages.map((m, i) => (
              <div key={i} style={{
                display: 'flex', gap: 8,
                flexDirection: m.role === 'user' ? 'row-reverse' : 'row',
                alignItems: 'flex-start', animation: 'ai-in .25s ease'
              }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                  background: m.role === 'user' ? 'rgba(255,255,255,0.07)' : 'rgba(225,29,72,0.12)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  {m.role === 'user' ? <User size={13} color="#94a3b8" /> : <Bot size={13} color="#e11d48" />}
                </div>
                <div style={{
                  maxWidth: '80%', display: 'flex', flexDirection: 'column', gap: 4,
                  alignItems: m.role === 'user' ? 'flex-end' : 'flex-start'
                }}>
                  {m.image && (
                    <img src={m.image} alt="img"
                      style={{ maxWidth: 150, borderRadius: 10, border: '1px solid rgba(225,29,72,0.25)', marginBottom: 2 }}
                    />
                  )}
                  <div style={{
                    padding: '10px 14px',
                    borderRadius: m.role === 'user' ? '14px 4px 14px 14px' : '4px 14px 14px 14px',
                    fontSize: '.875rem', lineHeight: 1.65,
                    background: m.role === 'user' ? S.red : 'rgba(255,255,255,0.04)',
                    color: m.role === 'user' ? 'white' : '#e2e8f0',
                    border: m.role === 'user' ? 'none' : '1px solid rgba(255,255,255,0.07)',
                    boxShadow: m.role === 'user' ? '0 4px 16px rgba(225,29,72,0.2)' : 'none',
                    whiteSpace: 'pre-wrap', wordBreak: 'break-word'
                  }}>
                    {m.text}
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', animation: 'ai-in .25s ease' }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 8,
                  background: 'rgba(225,29,72,0.12)', border: '1px solid rgba(255,255,255,0.06)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <Loader2 size={13} color="#e11d48" style={{ animation: 'ai-spin 1s linear infinite' }} />
                </div>
                <div style={{ padding: '10px 14px', borderRadius: '4px 14px 14px 14px', ...S.surface, display: 'flex', gap: 5, alignItems: 'center' }}>
                  {[0, 1, 2].map(i => (
                    <span key={i} style={{
                      width: 6, height: 6, borderRadius: '50%', background: '#e11d48', display: 'inline-block',
                      animation: `ai-dot 1s ${i * 0.18}s infinite ease-in-out`
                    }} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div style={{ padding: '12px 14px', flexShrink: 0, background: 'rgba(0,0,0,0.25)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            {imagePreview && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10,
                padding: '8px 10px', background: 'rgba(225,29,72,0.08)',
                borderRadius: 10, border: '1px solid rgba(225,29,72,0.2)'
              }}>
                <img src={imagePreview} alt="preview"
                  style={{ width: 36, height: 36, borderRadius: 6, objectFit: 'cover' }} />
                <span style={{ fontSize: '.72rem', color: '#94a3b8', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {selectedImage?.name}
                </span>
                <button onClick={clearImage} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}>
                  <X size={14} />
                </button>
              </div>
            )}
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
              <input type="file" ref={fileRef} style={{ display: 'none' }} accept="image/*" onChange={handleImageSelect} />
              <button onClick={() => fileRef.current?.click()} title="Attach image"
                style={{
                  padding: 9, borderRadius: 10, flexShrink: 0, cursor: 'pointer', display: 'flex',
                  background: imagePreview ? 'rgba(225,29,72,0.2)' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${imagePreview ? 'rgba(225,29,72,0.4)' : 'rgba(255,255,255,0.1)'}`,
                  color: imagePreview ? '#e11d48' : '#64748b', transition: 'all .2s'
                }}>
                <ImageIcon size={17} />
              </button>

              <textarea
                ref={textareaRef}
                placeholder="Message Neural Assistant... (Enter to send)"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                style={{
                  flex: 1, resize: 'none', overflow: 'hidden', maxHeight: 100,
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 12, padding: '9px 13px', color: 'white',
                  fontSize: '.875rem', lineHeight: 1.5, outline: 'none', fontFamily: 'inherit',
                  transition: 'border-color .2s'
                }}
                onFocus={e => e.target.style.borderColor = 'rgba(225,29,72,0.45)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                onInput={e => { e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px'; }}
              />

              <button onClick={handleSend}
                disabled={isTyping || cooldown || (!input.trim() && !selectedImage)}
                style={{
                  width: 40, height: 40, borderRadius: 12, border: 'none', flexShrink: 0,
                  background: (isTyping || cooldown || (!input.trim() && !selectedImage)) ? 'rgba(225,29,72,0.25)' : S.red,
                  color: 'white', cursor: (isTyping || cooldown) ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(225,29,72,0.25)', transition: 'all .2s'
                }}>
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes ai-up  { from{opacity:0;transform:translateY(16px) scale(.97)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes ai-in  { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        @keyframes ai-dot { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-7px)} }
        @keyframes ai-spin{ from{transform:rotate(0)} to{transform:rotate(360deg)} }
        @keyframes ai-pulse{ 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.4);opacity:.6} }
      `}</style>
    </div>
  );
}

function Btn({ onClick, title, children }) {
  return (
    <button onClick={onClick} title={title} style={{
      background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 6,
      color: 'white', cursor: 'pointer', width: 28, height: 28,
      display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background .2s'
    }}
      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.28)'}
      onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
    >{children}</button>
  );
}
