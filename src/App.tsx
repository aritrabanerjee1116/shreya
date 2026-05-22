import { useEffect, useRef, useState, useCallback } from 'react'
import './index.css'
import './App.css'

// ─── Types ─────────────────────────────────────────
interface CountdownState {
  days: number; hours: number; minutes: number; seconds: number;
  passed: boolean;
}

// ─── Sunflower SVG Component ──────────────────────
const Sunflower = ({ size = 100, animDelay = 0 }: { size?: number; animDelay?: number }) => (
  <svg
    className="sunflower-svg"
    width={size}
    height={size}
    viewBox="0 0 100 100"
    style={{ animationDelay: `${animDelay}s` }}
    onClick={(e) => {
      const el = e.currentTarget;
      el.style.transform = 'scale(1.3) rotate(360deg)';
      el.style.transition = 'transform 0.6s ease';
      setTimeout(() => {
        el.style.transform = '';
        el.style.transition = 'transform 0.3s ease';
      }, 700);
    }}
  >
    <defs>
      <radialGradient id={`petalGrad${animDelay}`} cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#ffdd00" />
        <stop offset="100%" stopColor="#ff9900" />
      </radialGradient>
    </defs>
    <g className="sunflower-petals" style={{ transformOrigin: '50px 50px' }}>
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i * 30) * Math.PI / 180;
        const x1 = 50 + 28 * Math.cos(angle);
        const y1 = 50 + 28 * Math.sin(angle);
        const x2 = 50 + 46 * Math.cos(angle);
        const y2 = 50 + 46 * Math.sin(angle);
        return (
          <ellipse
            key={i}
            cx={(x1 + x2) / 2}
            cy={(y1 + y2) / 2}
            rx="7"
            ry="10"
            fill={`url(#petalGrad${animDelay})`}
            transform={`rotate(${i * 30 + 90}, ${(x1 + x2) / 2}, ${(y1 + y2) / 2})`}
            opacity="0.9"
          />
        );
      })}
    </g>
    {/* Center dark brown */}
    <circle cx="50" cy="50" r="20" fill="#5c3317" />
    {/* Center pattern */}
    {Array.from({ length: 16 }).map((_, i) => {
      const angle = (i * 22.5) * Math.PI / 180;
      return (
        <circle
          key={i}
          cx={50 + 12 * Math.cos(angle)}
          cy={50 + 12 * Math.sin(angle)}
          r="2.5"
          fill="#3d2210"
          opacity="0.8"
        />
      );
    })}
    <circle cx="50" cy="50" r="6" fill="#3d2210" />
  </svg>
);

// ─── Custom Cursor ──────────────────────────────────
const CustomCursor = () => {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (dotRef.current) { dotRef.current.style.left = `${e.clientX}px`; dotRef.current.style.top = `${e.clientY}px`; }
      if (ringRef.current) { ringRef.current.style.left = `${e.clientX}px`; ringRef.current.style.top = `${e.clientY}px`; }
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);
  return (
    <>
      <div className="cursor-dot" ref={dotRef} />
      <div className="cursor-ring" ref={ringRef} />
    </>
  );
};

// ─── Floating Petals ────────────────────────────────
const FloatingPetals = () => {
  const petals = ['🌻', '🌸', '✨', '💛', '🌼', '💫'];
  return (
    <>
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={i}
          className="petal"
          style={{
            left: `${(i * 8.5) % 100}%`,
            top: `-${Math.random() * 50}px`,
            animationDuration: `${8 + (i % 5) * 2}s`,
            animationDelay: `${i * 0.7}s`,
            fontSize: `${1.2 + (i % 3) * 0.4}rem`,
          }}
        >
          {petals[i % petals.length]}
        </div>
      ))}
    </>
  );
};

// ─── Constellation Canvas ───────────────────────────
const ConstellationCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);
    const stars: { x: number; y: number; r: number; opacity: number; speed: number; angle: number }[] = [];
    for (let i = 0; i < 120; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 2 + 0.5,
        opacity: Math.random(),
        speed: Math.random() * 0.02 + 0.005,
        angle: Math.random() * Math.PI * 2,
      });
    }
    // Letters of SHREYA as constellation
    const shreyaPoints = [
      // S
      {x:0.1,y:0.35},{x:0.12,y:0.3},{x:0.17,y:0.28},{x:0.22,y:0.3},{x:0.22,y:0.37},{x:0.17,y:0.42},{x:0.12,y:0.46},{x:0.1,y:0.52},{x:0.12,y:0.58},{x:0.17,y:0.62},{x:0.22,y:0.6},
      // H
      {x:0.28,y:0.28},{x:0.28,y:0.62},{x:0.36,y:0.28},{x:0.36,y:0.62},{x:0.28,y:0.45},{x:0.36,y:0.45},
      // R
      {x:0.42,y:0.28},{x:0.42,y:0.62},{x:0.42,y:0.28},{x:0.5,y:0.3},{x:0.52,y:0.35},{x:0.5,y:0.42},{x:0.42,y:0.44},{x:0.5,y:0.42},{x:0.52,y:0.62},
      // E
      {x:0.58,y:0.28},{x:0.58,y:0.62},{x:0.58,y:0.28},{x:0.66,y:0.28},{x:0.58,y:0.45},{x:0.65,y:0.45},{x:0.58,y:0.62},{x:0.66,y:0.62},
      // Y
      {x:0.72,y:0.28},{x:0.78,y:0.45},{x:0.84,y:0.28},{x:0.78,y:0.45},{x:0.78,y:0.62},
      // A
      {x:0.88,y:0.62},{x:0.92,y:0.28},{x:0.96,y:0.62},{x:0.9,y:0.48},{x:0.94,y:0.48},
    ];
    let frame = 0;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      stars.forEach(s => {
        s.angle += s.speed;
        s.opacity = 0.3 + 0.7 * Math.abs(Math.sin(s.angle));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${s.opacity})`;
        ctx.fill();
      });
      // Draw constellation
      const scaledPts = shreyaPoints.map(p => ({
        x: p.x * canvas.width,
        y: p.y * canvas.height,
      }));
      // Glowing stars at constellation points
      scaledPts.forEach((pt, i) => {
        const pulse = 0.5 + 0.5 * Math.sin(frame * 0.03 + i * 0.5);
        const r = 2 + pulse * 2;
        const gradient = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, r * 3);
        gradient.addColorStop(0, `rgba(245,200,66,${0.8 + pulse * 0.2})`);
        gradient.addColorStop(1, 'transparent');
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, r * 3, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, r, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.fill();
      });
      // Lines between nearby points
      for (let i = 0; i < scaledPts.length - 1; i++) {
        const a = scaledPts[i]; const b = scaledPts[i + 1];
        const dist = Math.hypot(b.x - a.x, b.y - a.y);
        if (dist < canvas.width * 0.12) {
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          const pulse = 0.2 + 0.2 * Math.sin(frame * 0.02 + i);
          ctx.strokeStyle = `rgba(245,200,66,${pulse})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
      frame++;
      requestAnimationFrame(animate);
    };
    animate();
    return () => window.removeEventListener('resize', resize);
  }, []);
  return <canvas ref={canvasRef} className="constellation-canvas" />;
};

// ─── Music Visualizer ───────────────────────────────
const MusicVisualizer = () => {
  const heights = [30, 50, 70, 55, 80, 40, 65, 75, 45, 60, 70, 55, 40, 75, 60, 50, 35, 65, 55, 70];
  const durations = [0.6, 0.8, 0.7, 0.9, 0.5, 0.8, 0.6, 0.7, 0.9, 0.6, 0.8, 0.7, 0.5, 0.9, 0.6, 0.8, 0.7, 0.6, 0.9, 0.5];
  return (
    <div className="music-visualizer">
      {heights.map((h, i) => (
        <div
          key={i}
          className="music-bar"
          style={{ '--h': `${h}px`, '--dur': `${durations[i]}s` } as React.CSSProperties}
        />
      ))}
    </div>
  );
};

// ─── Main App ─────────────────────────────────────
export default function App() {
  // Countdown
  const [countdown, setCountdown] = useState<CountdownState>({ days: 0, hours: 0, minutes: 0, seconds: 0, passed: false });
  // Secret
  const [secretRevealed, setSecretRevealed] = useState(false);
  const [secretMessages] = useState([
    "You are my sunshine, my only sunshine... 🌻",
    "Every heartbeat of mine whispers your name... 💛",
    "In a field of roses, you'd be my sunflower! 🌸",
    "You make my world bloom every single day... ✨",
    "My heart chose you before my mind even understood why... 💫",
  ]);
  const [currentSecret, setCurrentSecret] = useState(0);
  // Lightbox
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);
  // Wishes
  const [wish, setWish] = useState('');
  const [wishes, setWishes] = useState(['You are absolutely magical ✨', 'Happy birthday, sunflower! 🌻', 'The world is brighter with you 💛']);
  // Mobile nav
  const [navOpen, setNavOpen] = useState(false);

  // Countdown logic
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const target = new Date(now.getFullYear(), 6, 25, 0, 0, 0); // July 25
      if (now > target) target.setFullYear(target.getFullYear() + 1);
      const diff = target.getTime() - now.getTime();
      if (diff <= 0) {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0, passed: true });
        return;
      }
      const days = Math.floor(diff / 86400000);
      const hours = Math.floor((diff % 86400000) / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setCountdown({ days, hours, minutes, seconds, passed: false });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // Scroll reveal
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('revealed'); }),
      { threshold: 0.1 }
    );
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const nextSecret = useCallback(() => {
    setSecretRevealed(true);
    setCurrentSecret(prev => (prev + 1) % secretMessages.length);
  }, [secretMessages.length]);

  const addWish = () => {
    if (wish.trim()) {
      setWishes(prev => [wish.trim(), ...prev]);
      setWish('');
    }
  };

  const photos = [
    { src: '/shreya1.jpg', caption: "That smile that lights up every room 🌟" },
    { src: '/shreya2.jpg', caption: "Beautiful & brilliant, always 💛" },
    { src: '/shreya3.jpg', caption: "The most genuine soul I know ✨" },
    { src: '/shreya4.jpg', caption: "My sunflower, always facing the light 🌻" },
  ];

  const worthCards = [
    { icon: '🌟', title: 'You Are My Universe', text: 'In the vast cosmos, you are the brightest star that guides me home every single time.' },
    { icon: '💛', title: 'Pure Gold Heart', text: 'Your kindness, your warmth — you have a heart made of pure, rare, beautiful gold.' },
    { icon: '🌻', title: 'My Sunflower', text: 'Like a sunflower, you always find the light and bring it to everyone around you.' },
    { icon: '🌊', title: 'My Calm in Storms', text: 'When the world feels chaotic, your presence is my anchor, my peace, my home.' },
    { icon: '✨', title: 'Irreplaceable', text: 'There is no one like you — your laugh, your soul, your spirit is truly one of a kind.' },
    { icon: '🦋', title: 'You Make Me Better', text: 'Every day with you is a day I grow, I smile more, and I believe in the beautiful things of life.' },
  ];

  const reasons = [
    "Because your smile can literally cure any bad day I have ever had.",
    "Because the way you laugh makes me forget every single worry.",
    "Because you care so deeply — for everything, for everyone around you.",
    "Because your eyes hold a universe I never want to stop exploring.",
    "Because you make even the simplest moments feel like magic.",
    "Because you push me to be better without even trying.",
    "Because when you're around, the world feels a hundred times warmer.",
    "Because you are the reason I believe love is the most beautiful thing.",
    "Because your voice is the most soothing sound in the world to me.",
    "Because you exist, and that itself is enough to make me the luckiest person alive.",
  ];

  const timeline = [
    { date: "The Beginning", text: "The day I first saw you, something in my universe shifted forever. ✨" },
    { date: "First Conversation", text: "We talked and I realized — this person is special. Someone rare and real. 💬" },
    { date: "The Feeling", text: "Without realizing it, you became my favorite thought every single day. 💛" },
    { date: "Growing Together", text: "Every shared laugh, every shared silence made us closer than words can say. 🌸" },
    { date: "Today & Always", text: "Today, I know with certainty: you are the one who makes everything make sense. 🌻" },
    { date: "July 25, 2004", text: "The day the universe decided to gift the world the most wonderful person — Shreya Ghosh. 🎂" },
  ];

  const musicQuotes = [
    { icon: '🎵', text: '"You are the melody that plays in my heart even when the world is silent..."' },
    { icon: '🎶', text: '"Every love song makes sense now because I found you..."' },
    { icon: '🎸', text: '"You are my favorite song on repeat — I never get tired of you..."' },
    { icon: '🎹', text: '"Life with you is music — unpredictable, beautiful, and perfectly tuned..."' },
  ];

  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      <CustomCursor />
      <FloatingPetals />

      {/* ── NAV ── */}
      <nav className="nav">
        <div className="nav-logo">💛 Shreya</div>
        <ul className="nav-links" style={{ display: navOpen ? 'flex' : undefined }}>
          {['#hero', '#countdown', '#gallery', '#love-letter', '#worth'].map(href => (
            <li key={href}>
              <a href={href} onClick={() => setNavOpen(false)}>
                {href.slice(1).replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
              </a>
            </li>
          ))}
        </ul>
        <span className="nav-heart" title="Made with love">❤️</span>
        <button className="nav-mobile-toggle" onClick={() => setNavOpen(o => !o)} aria-label="Toggle menu">☰</button>
      </nav>

      {/* ── HERO ── */}
      <section className="hero" id="hero">
        <div className="grid-bg" />
        <div className="hero-stars" />
        <div className="hero-content">
          <div className="hero-text">
            <div className="hero-badge">✦ A World Made Just For You ✦</div>
            <h1 className="hero-title">
              For the one who is
              <span className="hero-subtitle-name">Shreya Ghosh</span>
            </h1>
            <p className="hero-tagline">
              My sunflower, my calm, my everything —<br />
              you make this life infinitely worth living. 🌻
            </p>
            <a href="#countdown" className="hero-btn">
              🎂 Count Down to Your Day
            </a>
          </div>
          <div className="hero-photo-wrapper">
            <div className="hero-photo-ring hero-photo-ring-1" />
            <div className="hero-photo-ring hero-photo-ring-2" />
            <img src="/shreya4.jpg" alt="Shreya Ghosh" className="hero-photo" />
            <div className="hero-floating-emojis">
              {['🌻', '💛', '✨', '🌸', '💫', '🌼'].map((e, i) => (
                <span
                  key={i}
                  className="hero-emoji"
                  style={{
                    left: `${[10, 85, 5, 90, 15, 80][i]}%`,
                    top: `${[20, 15, 60, 65, 80, 45][i]}%`,
                    animationDuration: `${3 + i * 0.5}s`,
                    animationDelay: `${i * 0.4}s`,
                  }}
                >{e}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── COUNTDOWN ── */}
      <section className="section countdown-section" id="countdown">
        <div className="container">
          <h2 className="section-title reveal">⏳ Birthday Countdown</h2>
          <p className="section-subtitle reveal">Every second brings us closer to celebrating YOU</p>
          {countdown.passed ? (
            <p className="birthday-passed">🎉 Happy Birthday, Shreya! Today is YOUR day! 🌻🎂💛</p>
          ) : (
            <div className="countdown-grid reveal">
              {[
                { value: countdown.days, label: 'Days' },
                { value: countdown.hours, label: 'Hours' },
                { value: countdown.minutes, label: 'Minutes' },
                { value: countdown.seconds, label: 'Seconds' },
              ].map(({ value, label }) => (
                <div key={label} className="countdown-card">
                  <span className="countdown-number">{String(value).padStart(2, '0')}</span>
                  <span className="countdown-label">{label}</span>
                </div>
              ))}
            </div>
          )}
          <p className="countdown-message reveal">
            🌻 July 25th — The day the universe gifted us you 🌻
          </p>
        </div>
      </section>

      {/* ── SUNFLOWER GARDEN ── */}
      <section className="section sunflower-section">
        <div className="container">
          <h2 className="section-title reveal">🌻 Your Sunflower Garden</h2>
          <p className="section-subtitle reveal">Click on the sunflowers — they love you too!</p>
          <div className="sunflower-field reveal">
            {[80, 100, 120, 100, 80, 110, 90].map((size, i) => (
              <Sunflower key={i} size={size} animDelay={i * 0.5} />
            ))}
          </div>
          <div className="sunflower-love-note reveal">
            <p>
              "Just like a sunflower always turns toward the sun, I always find myself
              turning toward you — drawn to your warmth, your light, your extraordinary smile.
              You are my sunflower and my sun, all at once. 🌻"
            </p>
          </div>
        </div>
      </section>

      {/* ── GALLERY ── */}
      <section className="section gallery-section" id="gallery">
        <div className="container">
          <h2 className="section-title reveal">📸 Moments of You</h2>
          <p className="section-subtitle reveal">Every photo tells the story of someone extraordinary</p>
          <div className="gallery-grid">
            {photos.map((photo, i) => (
              <div
                key={i}
                className="gallery-card reveal"
                onClick={() => setLightboxImg(photo.src)}
                style={{ animationDelay: `${i * 0.15}s` }}
              >
                <img src={photo.src} alt={`Shreya ${i + 1}`} loading="lazy" />
                <div className="gallery-card-overlay">
                  <span className="gallery-card-text">{photo.caption}</span>
                </div>
                <div className="gallery-card-border" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox */}
      {lightboxImg && (
        <div className="lightbox" onClick={() => setLightboxImg(null)}>
          <img src={lightboxImg} alt="Shreya" onClick={e => e.stopPropagation()} />
          <button className="lightbox-close" onClick={() => setLightboxImg(null)}>✕</button>
        </div>
      )}

      {/* ── LOVE LETTER ── */}
      <section className="section love-section" id="love-letter">
        <div className="container">
          <h2 className="section-title reveal">💌 A Letter From My Heart</h2>
          <div className="love-letter reveal">
            <div className="love-letter-stamp">💛</div>
            <p className="love-letter-header">Dear Shreya,</p>
            <p>
              I don't know how you do it — how you walk into a room and make everything feel
              lighter, warmer, and more alive. You don't even try. It's just... you.
              The way you smile, the way you speak, the way your eyes light up when you talk
              about something you care about — it's the most beautiful thing I have ever seen.
            </p>
            <p>
              You make my life so easy to live. On the days when everything feels heavy,
              just the thought of you is enough to carry me through. You are my calm when
              the storms get too loud. You are my home when I feel lost. You are my reason
              when nothing makes sense.
            </p>
            <p>
              The world doesn't deserve someone like you — someone so genuine, so caring,
              so deeply real in a world full of masks. But here you are, existing, breathing,
              laughing, being — and somehow, incredibly, being a part of my life.
            </p>
            <p>
              You are worth more than every star in the sky, more than every sunflower in
              every field, more than every word I could ever write. You are, simply put,
              everything. And I am the luckiest person alive because I get to know you. 🌻
            </p>
            <div className="love-letter-signature">With all my heart, always. — Aritra 💛</div>
          </div>
        </div>
      </section>

      {/* ── YOUR WORTH ── */}
      <section className="section worth-section" id="worth">
        <div className="container">
          <h2 className="section-title reveal">💎 Know Your Worth</h2>
          <p className="section-subtitle reveal">What you mean to me, written in the stars</p>
          <div className="worth-grid">
            {worthCards.map((card, i) => (
              <div
                key={i}
                className="worth-card reveal"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <span className="worth-icon" style={{ animationDelay: `${i * 0.3}s` }}>{card.icon}</span>
                <h3 className="worth-title">{card.title}</h3>
                <p className="worth-text">{card.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── LOVE METER ── */}
      <section className="section love-meter-section">
        <div className="container">
          <h2 className="section-title reveal">💓 Love Measurement</h2>
          <p className="section-subtitle reveal">Scientifically calculated (it's infinite, but let's see...)</p>
          <div className="love-meter-ring reveal">
            <svg viewBox="0 0 200 200" width="200" height="200">
              <defs>
                <linearGradient id="loveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#f5c842" />
                  <stop offset="50%" stopColor="#ff6b8a" />
                  <stop offset="100%" stopColor="#f5c842" />
                </linearGradient>
              </defs>
              <circle className="love-meter-bg" cx="100" cy="100" r="90" strokeWidth="12" />
              <circle
                className="love-meter-fill"
                cx="100" cy="100" r="90"
                strokeWidth="12"
                stroke="url(#loveGradient)"
                strokeDasharray="565"
                strokeDashoffset="0"
                fill="none"
                strokeLinecap="round"
                style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }}
              />
            </svg>
            <div className="love-meter-text">
              <span className="love-meter-percent">∞</span>
              <span className="love-meter-label">My love for you</span>
            </div>
          </div>
          <p style={{ textAlign: 'center', fontFamily: "'Dancing Script', cursive", fontSize: '1.4rem', color: 'var(--pink-soft)', marginTop: '1rem' }}>
            Beyond measurement, beyond infinity — that's how much you mean to me 💛
          </p>
        </div>
      </section>

      {/* ── 10 REASONS ── */}
      <section className="section reasons-section">
        <div className="container">
          <h2 className="section-title reveal">💫 10 Reasons I Love You</h2>
          <p className="section-subtitle reveal">Just ten of the infinite reasons you're my favorite</p>
          <div className="reasons-list">
            {reasons.map((reason, i) => (
              <div key={i} className="reason-item reveal" style={{ animationDelay: `${i * 0.08}s` }}>
                <span className="reason-number">0{i + 1}</span>
                <span className="reason-text">{reason}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONSTELLATION ── */}
      <section className="section constellation-section">
        <ConstellationCanvas />
        <div className="constellation-content">
          <h2 className="section-title">✨ Your Name in the Stars</h2>
          <p className="section-subtitle">Written across the cosmos, forever and always</p>
          <p style={{
            fontFamily: "'Dancing Script', cursive",
            fontSize: 'clamp(1.1rem, 2.5vw, 1.6rem)',
            color: 'rgba(255,255,255,0.7)',
            marginTop: '1rem',
            maxWidth: '500px',
            margin: '1rem auto 0',
            lineHeight: '1.7',
          }}>
            "If I could write your name across the sky, I'd write it in stars —
            so every single person, everywhere, would know how extraordinary you truly are." 💛
          </p>
        </div>
      </section>

      {/* ── MUSIC VIBES ── */}
      <section className="section music-section">
        <div className="container">
          <h2 className="section-title reveal">🎵 The Music of My Heart</h2>
          <p className="section-subtitle reveal">Every song I hear reminds me of you</p>
          <MusicVisualizer />
          <div className="music-quotes">
            {musicQuotes.map((q, i) => (
              <div key={i} className="music-quote-card reveal" style={{ animationDelay: `${i * 0.15}s` }}>
                <span className="music-quote-icon">{q.icon}</span>
                <p className="music-quote-text">{q.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TIMELINE ── */}
      <section className="section timeline-section">
        <div className="container">
          <h2 className="section-title reveal">🕰️ Our Story</h2>
          <p className="section-subtitle reveal">Every chapter written by two hearts</p>
          <div className="timeline">
            {timeline.map((item, i) => (
              <div key={i} className="timeline-item reveal" style={{ animationDelay: `${i * 0.15}s` }}>
                <div className="timeline-dot" />
                <div className="timeline-card">
                  <div className="timeline-date">{item.date}</div>
                  <p className="timeline-text">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECRET MESSAGE ── */}
      <section className="section secret-section">
        <div className="container">
          <h2 className="section-title reveal">🔐 A Secret Just For You</h2>
          <p className="section-subtitle reveal">Click to unlock a message from my heart</p>
          <div className="secret-box reveal">
            <span
              className={`secret-lock ${secretRevealed ? 'unlocked' : ''}`}
              onClick={nextSecret}
            >
              {secretRevealed ? '💛' : '🔒'}
            </span>
            <p className={`secret-message ${secretRevealed ? 'revealed' : ''}`}>
              {secretMessages[currentSecret]}
            </p>
            {secretRevealed && (
              <p className="secret-hint">Click the heart for another secret 💫</p>
            )}
            {!secretRevealed && (
              <p className="secret-hint">Click the lock to reveal...</p>
            )}
            <button className="secret-btn" onClick={nextSecret}>
              {secretRevealed ? '💛 Next Secret' : '🔓 Unlock My Heart'}
            </button>
          </div>
        </div>
      </section>

      {/* ── WISH FOUNTAIN ── */}
      <section className="section wish-section">
        <div className="container">
          <h2 className="section-title reveal">🌊 Birthday Wish Fountain</h2>
          <p className="section-subtitle reveal">Leave a birthday wish for Shreya — they'll float forever</p>
          <div className="wish-input-wrapper reveal">
            <input
              className="wish-input"
              type="text"
              placeholder="Write a wish for Shreya... 🌻"
              value={wish}
              onChange={e => setWish(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addWish()}
              maxLength={80}
            />
            <br />
            <button className="wish-btn" onClick={addWish}>Send My Wish 💫</button>
          </div>
          <div className="wishes-display">
            {wishes.map((w, i) => (
              <div
                key={i}
                className="wish-bubble"
                style={{ '--delay': `${i * 0.3}s` } as React.CSSProperties}
              >
                {w}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="footer">
        <span className="footer-heart">💛</span>
        <p className="footer-text">Made with infinite love for Shreya Ghosh</p>
        <p className="footer-text" style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
          July 25, 2004 — The Universe's Greatest Gift 🌻
        </p>
        <p className="footer-sub">Every pixel on this page is a piece of my heart. — Aritra</p>
        <p className="footer-sub" style={{ marginTop: '0.5rem' }}>
          {Array.from({ length: 7 }).map((_, i) => <span key={i} style={{ margin: '0 2px' }}>🌻</span>)}
        </p>
      </footer>
    </div>
  );
}
