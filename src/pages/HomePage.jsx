import React, { useState, useEffect } from 'react';
import { 
  BrainCircuit, 
  ArrowRight, 
  Menu, 
  X, 
  ExternalLink, 
  Calendar, 
  MessageSquare, 
  Bot, 
  TrendingUp, 
  CheckCircle, 
  Zap,
  Globe,
  MapPin,
  Users,
  GraduationCap,
  BookOpen,
  FileText
} from 'lucide-react';
import './HomePage.css';

// ==========================================
// UTILS & COMPONENTS
// ==========================================

function handleTilt(e, el) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const rect = el.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  const centerX = rect.width / 2;
  const centerY = rect.height / 2;
  const rotateX = ((y - centerY) / centerY) * -8;
  const rotateY = ((x - centerX) / centerX) *  8;
  el.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
}

function resetTilt(el) {
  el.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) scale(1)';
}

function SplitText({ text }) {
  return (
    <span className="split-text">
      {text.split('').map((char, i) => (
        <span 
          key={i} 
          className="split-char"
          style={{ display: 'inline-block' }}
        >
          {char === ' ' ? '\u00A0' : char}
        </span>
      ))}
    </span>
  );
}

// ==========================================
// MAIN PAGE
// ==========================================

export default function HomePage({ onLogin }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');

  console.log('HomePage Rendered, checking GSAP:', !!window.gsap);

  // GSAP + Lenis Setup
  useEffect(() => {
    let gsap, ScrollTrigger, Lenis, lenis;
    
    const initAnimations = () => {
      gsap = window.gsap;
      ScrollTrigger = window.ScrollTrigger;
      Lenis = window.Lenis;

      if (!gsap || !ScrollTrigger || !Lenis) return;

      gsap.registerPlugin(ScrollTrigger);

      lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smooth: true,
      });

      function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);

      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((time) => lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);

      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        gsap.globalTimeline.timeScale(0);
        return;
      }

      // ANIMATIONS
      
      // 1. Hero Stagger
      gsap.set(['.hero-badge', '.hero-headline', '.hero-sub', '.hero-btn-group', '.hero-pills'], { opacity: 0, y: 60 });
      gsap.to(['.hero-badge', '.hero-headline', '.hero-sub', '.hero-btn-group', '.hero-pills'], {
        opacity: 1, y: 0, duration: 1, ease: 'power3.out', stagger: 0.15, delay: 0.2
      });
      gsap.from('.hero-mockup-side', { opacity: 0, x: 100, duration: 1.2, ease: 'power3.out', delay: 0.5 });

      // 2. Hero Split Text
      gsap.from('.split-char', {
        opacity: 0, y: 80, rotateX: -90, stagger: 0.03, duration: 0.8, ease: 'back.out(1.7)', delay: 0.3
      });

      // 3. Scroll Progress
      gsap.to('.scroll-progress', {
        scaleX: 1, ease: 'none', scrollTrigger: { trigger: 'body', start: 'top top', end: 'bottom bottom', scrub: true }
      });

      // 4. Stats Counter
      ScrollTrigger.create({
        trigger: '.stats-bar',
        start: 'top 80%',
        once: true,
        onEnter: () => {
          document.querySelectorAll('.stat-number').forEach(el => {
            const target = parseFloat(el.dataset.target);
            const isFloat = el.dataset.float === 'true';
            gsap.to({ val: 0 }, {
              val: target,
              duration: 2,
              ease: 'power2.out',
              onUpdate: function() {
                const val = this.targets()[0].val;
                el.textContent = isFloat ? val.toFixed(1) : Math.round(val).toLocaleString();
              }
            });
          });
        }
      });

      // 5. Feature Cards
      gsap.from('.feature-card', {
        opacity: 0, y: 80, duration: 0.7, ease: 'power3.out', stagger: 0.1,
        scrollTrigger: { trigger: '#features', start: 'top 75%', toggleActions: 'play none none none' }
      });

      // 6. About Section
      gsap.from('.about-left', {
        opacity: 0, x: -80, duration: 1, ease: 'power3.out',
        scrollTrigger: { trigger: '#about', start: 'top 70%' }
      });
      gsap.from('.about-right', {
        opacity: 0, x: 80, duration: 1, ease: 'power3.out',
        scrollTrigger: { trigger: '#about', start: 'top 70%' }
      });

      // 7. Pinned Hero
      ScrollTrigger.create({
        trigger: '#hero', start: 'top top', end: '+=400', pin: true, pinSpacing: false
      });
      gsap.from('.stats-bar', {
        y: 0, scrollTrigger: { trigger: '.stats-bar', start: 'top bottom', end: 'top top', scrub: 1 }
      });

      // 8. Department Cards
      document.querySelectorAll('.dept-card').forEach((card, i) => {
        gsap.from(card, {
          opacity: 0, scale: 0.85, y: 50, duration: 0.8, ease: 'back.out(1.4)',
          scrollTrigger: { trigger: card, start: 'top 85%' }, delay: i * 0.15
        });
      });

      // 9. Heading Mask Reveal
      gsap.from('.heading-inner', {
        y: '100%', duration: 0.9, ease: 'power4.out', stagger: 0.1,
        scrollTrigger: { trigger: '.heading-mask', start: 'top 85%' }
      });

      // 10. Floating Mockup
      gsap.to('.mockup-card-1', { y: -15, duration: 3, ease: 'sine.inOut', yoyo: true, repeat: -1 });
      gsap.to('.mockup-card-2', { y: -10, duration: 2.5, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 0.5 });
      gsap.to('.mockup-card-3', { y: -12, duration: 3.5, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 1 });
    };

    let checkInterval = setInterval(() => {
      if (window.gsap && window.ScrollTrigger && window.Lenis) {
        clearInterval(checkInterval);
        initAnimations();
      }
    }, 100);

    return () => {
      clearInterval(checkInterval);
      if (lenis) lenis.destroy();
      if (ScrollTrigger) ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  // Navbar Scroll State
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Active Section Tracking
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    }, { threshold: 0.4 });

    const sections = ['hero', 'stats', 'features', 'about', 'departments'];
    sections.forEach(id => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setMobileMenuOpen(false);
    }
  };

  const navLinks = [
    { name: 'Home', id: 'hero' },
    { name: 'About', id: 'about' },
    { name: 'Departments', id: 'departments' },
    { name: 'Academics', id: 'features' },
    { name: 'Placements', id: 'stats' },
    { name: 'Contact', id: 'footer' },
  ];

  return (
    <div className="homepage-container" style={{ background: 'var(--bg-color)', color: 'var(--text-primary)' }}>
      {/* SECTION 1 — Top Announcement Bar */}
      <div className="announcement-bar" style={{ 
        height: '36px', 
        background: 'var(--accent-red)', 
        color: 'white', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        padding: '0 20px', 
        fontSize: '0.75rem', 
        fontWeight: '600',
        position: 'relative',
        zIndex: 1001,
        overflow: 'hidden'
      }}>
        <div className="marquee-wrapper" style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          <div className="marquee-content" style={{ whiteSpace: 'nowrap', animation: 'marquee 25s linear infinite' }}>
            🔴 LIVE FY B.Tech Admissions 2025-26 Open · DTE Code: EN6834 · Enquiry: 020-48522561 · Secure your future at DYPCOEI today!
          </div>
        </div>
        <a href="https://www.dypcoei.edu.in" target="_blank" rel="noopener noreferrer" style={{ marginLeft: '20px', whiteSpace: 'nowrap', textDecoration: 'none', color: 'white', opacity: 0.9 }}>
          Contact Us →
        </a>
      </div>

      {/* SECTION 2 — Navbar */}
      <nav className={`homepage-nav ${scrolled ? 'scrolled' : ''}`} style={{
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 40px',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        background: scrolled ? 'var(--bg-color)' : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        borderBottom: scrolled ? '1px solid var(--border-color)' : 'none'
      }}>
        <div className="scroll-progress" />
        
        <div className="nav-logo" style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => scrollToSection('hero')}>
          <div style={{ background: 'white', padding: '4px', borderRadius: '4px', display: 'flex', alignItems: 'center' }}>
            <img src="/logo.jpg" alt="Logo" style={{ height: '24px', width: '24px', objectFit: 'contain' }} />
          </div>
          <div style={{ fontWeight: '800', fontSize: '1.2rem', letterSpacing: '-0.02em' }}>
            DYPCOEI <span style={{ color: 'var(--accent-red)' }}>NEURAL CORE</span>
          </div>
        </div>

        {/* Desktop Links */}
        <div className="nav-links hide-on-mobile" style={{ display: 'flex', gap: '30px' }}>
          {navLinks.map(link => (
            <button 
              key={link.id} 
              onClick={() => scrollToSection(link.id)} 
              className={`nav-link ${activeSection === link.id ? 'active' : ''}`}
              style={{ 
                background: 'transparent', 
                border: 'none', 
                color: activeSection === link.id ? 'var(--accent-red)' : 'var(--text-secondary)', 
                fontWeight: '600', 
                fontSize: '0.9rem',
                transition: 'color 0.2s',
                padding: '4px 0'
              }}
            >
              {link.name}
            </button>
          ))}
        </div>

        <div className="nav-actions hide-on-mobile" style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-primary" onClick={() => window.location.href = '/login'}>
            Login <ArrowRight size={16} />
          </button>
          <button className="btn btn-secondary" onClick={() => window.location.href = '/login?role=admin'}>
            Neural Admin
          </button>
        </div>

        {/* Mobile Toggle */}
        <button className="mobile-toggle" style={{ display: 'none', background: 'transparent', border: 'none', color: 'white' }} onClick={() => setMobileMenuOpen(true)}>
          <Menu size={24} />
        </button>
      </nav>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-nav-drawer" style={{
          position: 'fixed',
          inset: 0,
          zIndex: 2000,
          background: 'var(--bg-color)',
          display: 'flex',
          flexDirection: 'column',
          padding: '20px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px' }}>
            <div style={{ fontWeight: '800', fontSize: '1.2rem' }}>DYPCOEI <span style={{ color: 'var(--accent-red)' }}>NEURAL</span></div>
            <button onClick={() => setMobileMenuOpen(false)} style={{ background: 'transparent', border: 'none', color: 'white' }}><X size={24} /></button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {navLinks.map(link => (
              <button key={link.id} onClick={() => scrollToSection(link.id)} style={{ background: 'transparent', border: 'none', color: activeSection === link.id ? 'var(--accent-red)' : 'var(--text-primary)', fontSize: '1.2rem', textAlign: 'left', fontWeight: '600' }}>
                {link.name}
              </button>
            ))}
            <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '10px 0' }} />
            <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => window.location.href = '/login'}>Login</button>
            <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => window.location.href = '/login?role=admin'}>Neural Admin</button>
          </div>
        </div>
      )}

      {/* SECTION 3 — Hero Section */}
      <section id="hero" className="hero-section" style={{
        minHeight: 'calc(100vh - 100px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 40px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Parallax Background */}
        <div className="hero-bg login-bg" style={{ position: 'absolute', inset: -50, zIndex: -1 }}>
          <div className="blob blob-1" /><div className="blob blob-2" /><div className="blob blob-3" />
          {/* Floating Particles */}
          {[...Array(12)].map((_, i) => (
            <div key={i} className="particle" style={{
              width: `${Math.random() * 4 + 4}px`,
              height: `${Math.random() * 4 + 4}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.3 + 0.2,
              animationDuration: `${Math.random() * 6 + 4}s`,
              animationDelay: `${Math.random() * 5}s`
            }} />
          ))}
        </div>

        <div className="hero-content" style={{
          maxWidth: '1200px',
          width: '100%',
          display: 'grid',
          gridTemplateColumns: '1.2fr 0.8fr',
          gap: '60px',
          alignItems: 'center'
        }}>
          <div className="hero-text-side">
            <div className="hero-badge" style={{ marginBottom: '20px', background: 'rgba(225, 48, 96, 0.1)', color: 'var(--accent-red)', border: '1px solid var(--accent-red)', display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 12px', borderRadius: 'var(--radius-full)', fontWeight: '600', fontSize: '0.75rem' }}>
              <div className="pulse-dot" /> ✦ DYPCOEI · Varale, Talegaon, Pune · Est. 2014
            </div>
            
            <h1 className="hero-headline">
              <SplitText text="The Neural Core" /><br />
              <SplitText text="Academic Platform" />
            </h1>
            
            <p className="hero-sub" style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '35px', maxWidth: '600px', lineHeight: '1.6' }}>
              A unified digital ecosystem for FY B.Tech students and faculty at Dr. D.Y. Patil College of Engineering & Innovation — timetables, messaging, AI assistance, and more, all in one place.
            </p>
            
            <div className="hero-btn-group" style={{ display: 'flex', gap: '15px', marginBottom: '40px' }}>
              <button className="btn btn-primary" style={{ padding: '14px 28px', fontSize: '1rem' }} onClick={() => window.location.href = '/login'}>
                Access Neural Core <ArrowRight size={18} />
              </button>
              <button className="btn btn-secondary" style={{ padding: '14px 28px', fontSize: '1rem' }} onClick={() => scrollToSection('features')}>
                Explore Features <ArrowRight size={18} />
              </button>
            </div>
            
            <div className="hero-pills" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {['📅 Real-Time Timetable', '🤖 AI Assistant Built-in', '📱 Installable Mobile App'].map(pill => (
                <div key={pill} className="glass" style={{ padding: '8px 16px', borderRadius: 'var(--radius-full)', fontSize: '0.8rem', fontWeight: '600' }}>
                  {pill}
                </div>
              ))}
            </div>
          </div>

          <div className="hero-mockup-side hide-on-mobile" style={{ position: 'relative', height: '400px' }}>
            <div className="mockup-card glass mockup-card-1" style={{ 
              position: 'absolute', 
              top: '10%', 
              right: '10%', 
              width: '280px', 
              padding: '20px', 
              zIndex: 3,
              borderLeft: '4px solid var(--accent-red)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--accent-red)' }}>LIVE TIMETABLE</span>
                <div className="pulse-dot" style={{ width: '6px', height: '6px' }} />
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '4px' }}>Engineering Physics</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Room 302 · Dr. S. Patil</div>
              <div style={{ marginTop: '15px', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px' }}>
                <div style={{ width: '65%', height: '100%', background: 'var(--accent-red)', borderRadius: '2px' }} />
              </div>
            </div>

            <div className="mockup-card glass mockup-card-2" style={{ 
              position: 'absolute', 
              top: '40%', 
              left: '0%', 
              width: '260px', 
              padding: '20px', 
              zIndex: 2,
              borderLeft: '4px solid var(--accent-blue)'
            }}>
              <div style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--accent-blue)', marginBottom: '10px' }}>NEURAL ASSISTANT</div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'var(--accent-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Bot size={16} />
                </div>
                <div style={{ flex: 1, background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '10px', fontSize: '0.75rem' }}>
                  The derivation for Bernoulli's...
                </div>
              </div>
            </div>

            <div className="mockup-card glass mockup-card-3" style={{ 
              position: 'absolute', 
              bottom: '0%', 
              right: '0%', 
              width: '240px', 
              padding: '20px', 
              zIndex: 1,
              borderLeft: '4px solid var(--success)'
            }}>
              <div style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--success)', marginBottom: '10px' }}>ATTENDANCE</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{ width: '45px', height: '45px', borderRadius: '50%', border: '4px solid var(--success)', borderTopColor: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '0.9rem' }}>
                  88%
                </div>
                <div style={{ fontSize: '0.8rem' }}>On Track</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4 — College Info Strip */}
      <section id="stats" className="stats-bar" style={{ 
        background: 'var(--bg-color)', 
        borderY: '1px solid var(--border-color)',
        padding: '40px 20px',
        overflowX: 'auto',
        position: 'relative',
        zIndex: 10
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', gap: '40px' }}>
          {[
            { val: 12, suf: '+', lab: 'Years of Education' },
            { val: 5000, suf: '+', lab: 'Students Educated' },
            { val: 3.1, suf: ' CGPA', lab: 'NAAC A Grade', isFloat: true },
            { val: 3, suf: '', lab: 'Engineering Departments' },
            { val: 12, suf: '+ LPA', lab: 'Highest CTC Range' },
            { val: 5000, suf: '+', lab: 'Alumni Across World' }
          ].map((stat, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '40px', flexShrink: 0 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: '800', color: i % 2 === 0 ? 'white' : 'var(--accent-red)' }}>
                  <span className="stat-number" data-target={stat.val} data-float={stat.isFloat}>0</span>{stat.suf}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>{stat.lab}</div>
              </div>
              {i < 5 && <div style={{ width: '1px', height: '40px', background: 'var(--border-color)' }} />}
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 5 — Platform Features */}
      <section id="features" className="features-section" style={{ padding: '100px 40px', maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 10, background: 'var(--bg-color)' }}>
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <div className="heading-mask" style={{ overflow: 'hidden' }}>
            <h2 className="heading-inner" style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '15px' }}>Everything You Need, One Neural Node</h2>
          </div>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '700px', margin: '0 auto' }}>DTIL replaces five disconnected tools with a single campus-specific platform.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '25px' }}>
          {[
            { icon: <Calendar />, title: '🗓 Holographic Timetable', desc: 'Real-time class schedule with live period tracking and countdown to next class. Automatically synced from official timetable PDFs.' },
            { icon: <MessageSquare />, title: '💬 Neural Messaging', desc: 'WhatsApp-style chat with classmates and teachers. Teacher-controlled group permissions and read receipts built in.' },
            { icon: <Bot />, title: '🤖 AI Neural Link', desc: 'Built-in AI academic assistant powered by Claude API. Get subject help, study tips, and task guidance without leaving the platform.' },
            { icon: <TrendingUp />, title: '📊 Attendance Tracker', desc: 'Subject-wise attendance analytics with circular progress charts. Instant alert when attendance drops below 75%.' },
            { icon: <CheckCircle />, title: '🎯 Tasks & Deadlines', desc: 'Smart assignment reminders and task management synced with your timetable. Never miss a submission.' },
            { icon: <Zap />, title: '📱 Installable PWA', desc: 'Install DTIL on your phone like a native app. Works offline for timetable and schedule access anywhere on campus.' }
          ].map((f, i) => (
            <div 
              key={i} 
              className="glass glass-hover feature-card" 
              style={{ padding: '30px', borderTop: '3px solid var(--accent-red)' }}
              onMouseMove={(e) => handleTilt(e, e.currentTarget)}
              onMouseLeave={(e) => resetTilt(e.currentTarget)}
            >
              <div style={{ color: 'var(--accent-red)', marginBottom: '20px' }}>
                {React.cloneElement(f.icon, { size: 32 })}
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '12px' }}>{f.title}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6' }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 6 — About DYPCOEI */}
      <section id="about" className="about-section" style={{ padding: '100px 40px', background: 'rgba(255,255,255,0.01)', overflowX: 'hidden', position: 'relative', zIndex: 10 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '80px', alignItems: 'center' }}>
          <div className="about-left">
            <span style={{ color: 'var(--accent-red)', fontWeight: '700', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>About the Institution</span>
            <div className="heading-mask" style={{ overflow: 'hidden', margin: '15px 0 25px' }}>
              <h2 className="heading-inner" style={{ fontSize: '2.5rem', fontWeight: '800' }}>Dr. D.Y. Patil College of Engineering & Innovation</h2>
            </div>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8', marginBottom: '30px' }}>
              Established in 2014, DYPCOEI is located at Varale, Talegaon, Pune. The college is approved by AICTE, recognized by the Government of Maharashtra, and affiliated to Savitribai Phule Pune University. Accredited by NAAC with 'A' Grade (CGPA 3.1). The campus spreads over 3.5 acres with state-of-the-art laboratories, a dedicated library, and experienced faculty across three engineering departments: Computer Engineering, AI-Data Science, and AI-Machine Learning.
            </p>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '30px' }}>
              {['AICTE Approved', 'NAAC A Grade · CGPA 3.1', 'Affiliated to SPPU'].map(chip => (
                <span key={chip} style={{ background: 'rgba(225, 48, 96, 0.1)', color: 'var(--accent-red)', padding: '6px 14px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '600' }}>{chip}</span>
              ))}
            </div>
            <a href="https://www.dypcoei.edu.in" target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
              Visit Official Website <ArrowRight size={16} />
            </a>
          </div>

          <div className="glass about-right" style={{ padding: '40px', borderLeft: '4px solid var(--accent-red)', position: 'relative' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '25px' }}>Campus Hub</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', gap: '15px' }}>
                <MapPin className="text-red" style={{ color: 'var(--accent-red)', flexShrink: 0 }} />
                <div style={{ fontSize: '0.9rem' }}>SR. No. 27/A/1/2c, Near Eco City, Talegaon, Varale, Pune - 410507</div>
              </div>
              <div style={{ display: 'flex', gap: '15px' }}>
                <Zap style={{ color: 'var(--accent-red)', flexShrink: 0 }} />
                <div style={{ fontSize: '0.9rem' }}>020-48522561</div>
              </div>
              <div style={{ display: 'flex', gap: '15px' }}>
                <FileText style={{ color: 'var(--accent-red)', flexShrink: 0 }} />
                <div style={{ fontSize: '0.9rem' }}>admissions.engineering@dypatilef.com</div>
              </div>
              <div style={{ marginTop: '10px', padding: '15px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', fontSize: '0.8rem' }}>
                <span style={{ fontWeight: '700', color: 'var(--accent-red)' }}>DTE Code:</span> EN6834
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 7 — Departments */}
      <section id="departments" style={{ padding: '100px 40px', maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 10, background: 'var(--bg-color)' }}>
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <div className="heading-mask" style={{ overflow: 'hidden' }}>
            <h2 className="heading-inner" style={{ fontSize: '2.5rem', fontWeight: '800' }}>Our Departments</h2>
          </div>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
          {[
            { 
              abbr: 'CE', 
              name: 'Computer Engineering', 
              color: '#3b82f6', 
              desc: 'B.Tech Computer Engineering — 4 year program focusing on software development, algorithms, computer networks, and system design.',
              link: 'https://www.dypcoei.edu.in/about_comp_engnr/'
            },
            { 
              abbr: 'AI-DS', 
              name: 'AI - Data Science', 
              color: '#8b5cf6', 
              desc: 'B.Tech Artificial Intelligence & Data Science — Covers machine learning, data analytics, neural networks, and AI application development.',
              link: 'https://www.dypcoei.edu.in/artificial-intelligence-ai/'
            },
            { 
              abbr: 'AI-ML', 
              name: 'AI - Machine Learning', 
              color: '#10b981', 
              desc: 'B.Tech Artificial Intelligence & Machine Learning — Deep learning, computer vision, NLP, and real-world AI system engineering.',
              link: 'https://www.dypcoei.edu.in/artificial-intelligence-ai/'
            }
          ].map((dept, i) => (
            <div 
              key={i} 
              className="glass dept-card" 
              style={{ padding: '35px', transition: 'border-color 0.3s', border: '1px solid var(--border-color)' }} 
              onMouseOver={(e) => e.currentTarget.style.borderColor = dept.color} 
              onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
            >
              <div style={{ 
                display: 'inline-block', 
                padding: '4px 12px', 
                borderRadius: '6px', 
                background: dept.color + '20', 
                color: dept.color, 
                fontSize: '0.75rem', 
                fontWeight: '800', 
                marginBottom: '20px' 
              }}>
                {dept.abbr}
              </div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: '700', marginBottom: '15px' }}>{dept.name}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '25px' }}>{dept.desc}</p>
              <a href={dept.link} target="_blank" rel="noopener noreferrer" style={{ color: dept.color, fontWeight: '700', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '5px' }}>
                Learn More <ArrowRight size={16} />
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 8 — Footer */}
      <footer id="footer" style={{ background: '#0a0a0f', borderTop: '1px solid var(--border-color)', padding: '80px 40px 40px', position: 'relative', zIndex: 10 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '60px', marginBottom: '60px' }}>
          {/* Col 1 */}
          <div style={{ gridColumn: 'span 2' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '25px' }}>
              <div style={{ background: 'white', padding: '4px', borderRadius: '4px' }}>
                <img src="/logo.jpg" alt="Logo" style={{ height: '24px', width: '24px' }} />
              </div>
              <div style={{ fontWeight: '800', fontSize: '1.2rem' }}>DYPCOEI <span style={{ color: 'var(--accent-red)' }}>NEURAL CORE</span></div>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.7', marginBottom: '20px', maxWidth: '350px' }}>
              A student-built academic platform for the DYPCOEI community. Built with React, deployed on Vercel.
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
              Developed by: Syed Zaid Syed Nizamoddin · FY B.Tech, Div C
            </p>
            <div style={{ display: 'flex', gap: '15px', marginTop: '25px' }}>
              <a href="#" style={{ color: 'var(--text-secondary)' }}><Globe size={20} /></a>
              <a href="#" style={{ color: 'var(--text-secondary)' }}><Globe size={20} /></a>
              <a href="#" style={{ color: 'var(--text-secondary)' }}><Globe size={20} /></a>
            </div>
          </div>

          {/* Col 2 */}
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '25px' }}>Quick Links</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {navLinks.map(l => (
                <button key={l.id} onClick={() => scrollToSection(l.id)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', textAlign: 'left', fontSize: '0.9rem' }}>{l.name}</button>
              ))}
              <button onClick={() => window.location.href='/login'} style={{ background: 'transparent', border: 'none', color: 'var(--accent-red)', textAlign: 'left', fontSize: '0.9rem', fontWeight: '600' }}>Login to Platform →</button>
            </div>
          </div>

          {/* Col 3 */}
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '25px' }}>Platform</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              <a href="/login" style={{ textDecoration: 'none', color: 'inherit' }}>Student Login</a>
              <a href="/login?role=admin" style={{ textDecoration: 'none', color: 'inherit' }}>Neural Admin Login</a>
              <a href="https://dtil-project.vercel.app" target="_blank" style={{ textDecoration: 'none', color: 'inherit' }}>dtil-project.vercel.app</a>
            </div>
          </div>

          {/* Col 4 */}
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '25px' }}>Contact</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <div>SR. No. 27/A/1/2c, Near Eco City, Talegaon, Varale, Pune - 410507</div>
              <div>020-48522561 | +91 9359004652</div>
              <div>admissions.engineering@dypatilef.com</div>
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            © 2024-25 DYPCOEI Neural Core · DTIL Platform
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Built on React · Deployed on Vercel · Powered by Anthropic AI
          </div>
        </div>
      </footer>
    </div>
  );
}
