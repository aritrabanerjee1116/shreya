import { useEffect, useRef, useState, useCallback } from 'react'
import './index.css'
import './App.css'

// ─── Types ─────────────────────────────────────────
interface CountdownState {
  days: number; hours: number; minutes: number; seconds: number;
  passed: boolean;
}

// ─── Lily SVG Component ───────────────────────────
const LilyPetal = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg
    className={className}
    style={style}
    viewBox="0 0 60 120"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <defs>
      <linearGradient id="lilyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fff0f8" />
        <stop offset="40%" stopColor="#ffb3d9" />
        <stop offset="100%" stopColor="#ff69b4" />
      </linearGradient>
      <linearGradient id="lilyGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ffe0f0" />
        <stop offset="50%" stopColor="#ff85c0" />
        <stop offset="100%" stopColor="#e040a0" />
      </linearGradient>
    </defs>
    {/* Main petal shape */}
    <ellipse cx="30" cy="65" rx="18" ry="55" fill="url(#lilyGrad)" opacity="0.92" />
    {/* Veins */}
    <line x1="30" y1="15" x2="30" y2="115" stroke="rgba(220,60,130,0.3)" strokeWidth="1.5" />
    <line x1="30" y1="40" x2="18" y2="80" stroke="rgba(220,60,130,0.2)" strokeWidth="1" />
    <line x1="30" y1="40" x2="42" y2="80" stroke="rgba(220,60,130,0.2)" strokeWidth="1" />
    {/* Highlight */}
    <ellipse cx="22" cy="50" rx="6" ry="20" fill="rgba(255,255,255,0.35)" />
  </svg>
);

// ─── Floating Lilies (CSS-only, no per-frame JS) ───
const FloatingLilies = () => {
  const lilies = Array.from({ length: 7 }, (_, i) => ({
    left: `${(i * 14.5 + 3) % 100}%`,
    animDuration: `${14 + (i % 4) * 3}s`,
    animDelay: `${-(i * 2.8)}s`,
    size: 26 + (i % 3) * 12,
    rotation: (i % 2 === 0) ? 0 : 180,
  }));

  return (
    <div className="lily-container" aria-hidden="true">
      {lilies.map((lily, i) => (
        <LilyPetal
          key={i}
          className="lily-fall"
          style={{
            left: lily.left,
            width: `${lily.size}px`,
            height: `${lily.size * 2}px`,
            animationDuration: lily.animDuration,
            animationDelay: lily.animDelay,
            transform: `rotate(${lily.rotation}deg)`,
          }}
        />
      ))}
    </div>
  );
};

// Custom cursor removed — was causing paint on every mousemove

// ─── Constellation Canvas (pauses when off-screen) ──
const ConstellationCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false })!;
    let rafId: number;
    let visible = false;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize, { passive: true });

    // Only run animation when visible
    const visObs = new IntersectionObserver((entries) => {
      visible = entries[0].isIntersecting;
      if (visible) rafId = requestAnimationFrame(animate);
      else cancelAnimationFrame(rafId);
    }, { threshold: 0.1 });
    visObs.observe(canvas);

    const stars: { x: number; y: number; r: number; opacity: number; speed: number; angle: number }[] = [];
    for (let i = 0; i < 60; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.2 + 0.4,
        opacity: Math.random(),
        speed: Math.random() * 0.012 + 0.003,
        angle: Math.random() * Math.PI * 2,
      });
    }
    const shreyaPoints = [
      {x:0.1,y:0.35},{x:0.12,y:0.3},{x:0.17,y:0.28},{x:0.22,y:0.3},{x:0.22,y:0.37},{x:0.17,y:0.42},{x:0.12,y:0.46},{x:0.1,y:0.52},{x:0.12,y:0.58},{x:0.17,y:0.62},{x:0.22,y:0.6},
      {x:0.28,y:0.28},{x:0.28,y:0.62},{x:0.36,y:0.28},{x:0.36,y:0.62},{x:0.28,y:0.45},{x:0.36,y:0.45},
      {x:0.42,y:0.28},{x:0.42,y:0.62},{x:0.42,y:0.28},{x:0.5,y:0.3},{x:0.52,y:0.35},{x:0.5,y:0.42},{x:0.42,y:0.44},{x:0.5,y:0.42},{x:0.52,y:0.62},
      {x:0.58,y:0.28},{x:0.58,y:0.62},{x:0.58,y:0.28},{x:0.66,y:0.28},{x:0.58,y:0.45},{x:0.65,y:0.45},{x:0.58,y:0.62},{x:0.66,y:0.62},
      {x:0.72,y:0.28},{x:0.78,y:0.45},{x:0.84,y:0.28},{x:0.78,y:0.45},{x:0.78,y:0.62},
      {x:0.88,y:0.62},{x:0.92,y:0.28},{x:0.96,y:0.62},{x:0.9,y:0.48},{x:0.94,y:0.48},
    ];

    let frame = 0;
    // Pre-compute line connections once
    const connections: [number, number][] = [];
    for (let i = 0; i < shreyaPoints.length - 1; i++) {
      connections.push([i, i + 1]);
    }

    const animate = () => {
      if (!visible) return;
      ctx.fillStyle = '#0a0118';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Stars — batch same color to reduce state changes
      stars.forEach(s => {
        s.angle += s.speed;
        s.opacity = 0.3 + 0.7 * Math.abs(Math.sin(s.angle));
        ctx.globalAlpha = s.opacity;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;

      const w = canvas.width, h = canvas.height;
      const scaledPts = shreyaPoints.map(p => ({ x: p.x * w, y: p.y * h }));

      // Lines
      const linePulse = 0.25 + 0.1 * Math.sin(frame * 0.02);
      ctx.strokeStyle = `rgba(245,200,66,${linePulse})`;
      ctx.lineWidth = 1;
      connections.forEach(([a, b]) => {
        const pa = scaledPts[a], pb = scaledPts[b];
        if (Math.hypot(pb.x - pa.x, pb.y - pa.y) < w * 0.12) {
          ctx.beginPath();
          ctx.moveTo(pa.x, pa.y);
          ctx.lineTo(pb.x, pb.y);
          ctx.stroke();
        }
      });

      // Constellation points — reuse one gradient style
      const pulse = 0.5 + 0.5 * Math.sin(frame * 0.03);
      const r = 2 + pulse * 2;
      scaledPts.forEach(pt => {
        ctx.fillStyle = `rgba(245,200,66,${0.7 + pulse * 0.3})`;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, r * 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, r * 0.6, 0, Math.PI * 2);
        ctx.fill();
      });

      frame++;
      rafId = requestAnimationFrame(animate);
    };

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(rafId);
      visObs.disconnect();
    };
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
    <circle cx="50" cy="50" r="20" fill="#5c3317" />
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

// ─── Teasing messages for scratch card ──────────────
const TEASE_MSGS = [
  "Noo! I don't wanna reveal so soon! 😩",
  "Have a little patience, Shreya... 🙊",
  "Stop scratching so fast!! 🤭",
  "I'm not ready yet... please! 🙏",
  "The card is fighting back! 😤",
  "Nooo not yet, just a little more... 😭",
  "Hmm ok fine, keep going! 😏",
  "You're SO close but I'm still shy! 💛",
];

// ─── Scratch to Reveal Section ──────────────────────
const ScratchReveal = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [revealed, setRevealed] = useState(false);
  const [scratchProgress, setScratchProgress] = useState(0);
  const [teasingMsg, setTeasingMsg] = useState('');
  const isDrawing = useRef(false);
  const rafPending = useRef(false);
  const msgIdxRef = useRef(0);
  const lastMsgTime = useRef(0);
  const revealedRef = useRef(false);
  const latestPctRef = useRef(0);
  const hasStartedPlaying = useRef(false);

  const tryPlayVideo = () => {
    if (!hasStartedPlaying.current) {
      hasStartedPlaying.current = true;
      const iframe = document.getElementById('scratch-youtube') as HTMLIFrameElement;
      if (iframe && iframe.contentWindow) {
        iframe.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'playVideo', args: [] }), '*');
      }
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    // Make canvas exact size of wrapper
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
    const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    grad.addColorStop(0, '#2d0952');
    grad.addColorStop(0.35, '#c8960c');
    grad.addColorStop(0.65, '#2d0952');
    grad.addColorStop(1, '#ff6b8a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = 'rgba(255,255,255,0.95)';
    ctx.font = `bold ${Math.min(canvas.width / 11, 26)}px Inter, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('❆ Scratch Here ❆', canvas.width / 2, canvas.height / 2 - 10);
    ctx.font = `${Math.min(canvas.width / 17, 17)}px Inter, sans-serif`;
    ctx.fillStyle = 'rgba(255,220,100,0.95)';
    ctx.fillText('A special message awaits you...', canvas.width / 2, canvas.height / 2 + 24);
  }, []);

  const doScratch = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas || revealedRef.current || !isDrawing.current) return;
    const ctx = canvas.getContext('2d')!;
    const rect = canvas.getBoundingClientRect();
    const x = (clientX - rect.left) * (canvas.width / rect.width);
    const y = (clientY - rect.top) * (canvas.height / rect.height);

    ctx.globalCompositeOperation = 'destination-out';
    ctx.globalAlpha = 1;
    ctx.beginPath();
    ctx.arc(x, y, 40, 0, Math.PI * 2);
    ctx.fill();

    // Show teasing msg slowly (max once every 3 seconds)
    const now = Date.now();
    if (now - lastMsgTime.current > 3000) {
      setTeasingMsg(TEASE_MSGS[msgIdxRef.current % TEASE_MSGS.length]);
      msgIdxRef.current++;
      lastMsgTime.current = now;
      setTimeout(() => setTeasingMsg(''), 2000);
    }

    if (!rafPending.current) {
      rafPending.current = true;
      requestAnimationFrame(() => {
        if (revealedRef.current || !canvas) { rafPending.current = false; return; }
        const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
        let transparent = 0;
        for (let i = 3; i < data.data.length; i += 16) {
          if (data.data[i] < 20) transparent++;
        }
        const total = data.data.length / 4 / 4;
        const pct = Math.min(100, Math.round((transparent / total) * 100));
        setScratchProgress(pct);
        latestPctRef.current = pct;
        if (pct > 75 && !revealedRef.current) {
          revealedRef.current = true;
          setRevealed(true);
          setTeasingMsg('');
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
        rafPending.current = false;
      });
    }
  };

  const onMouseDown = (e: React.MouseEvent) => {
    if (revealedRef.current && latestPctRef.current > 75) tryPlayVideo();
    if (revealedRef.current) return;
    isDrawing.current = true;
    doScratch(e.clientX, e.clientY);
  };
  const onMouseMove = (e: React.MouseEvent) => doScratch(e.clientX, e.clientY);
  const onMouseUp = () => { 
    if (latestPctRef.current > 75) tryPlayVideo();
    isDrawing.current = false; 
  };

  const onTouchStart = (e: React.TouchEvent) => {
    if (revealedRef.current && latestPctRef.current > 75) tryPlayVideo();
    if (revealedRef.current) return;
    isDrawing.current = true;
    doScratch(e.touches[0].clientX, e.touches[0].clientY);
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (e.cancelable) e.preventDefault(); // Prevent scrolling while scratching
    doScratch(e.touches[0].clientX, e.touches[0].clientY);
  };
  const onTouchEnd = () => { 
    if (latestPctRef.current > 75) tryPlayVideo();
    isDrawing.current = false; 
  };

  return (
    <section className="section scratch-section" id="scratch">
      <div className="container">
        <h2 className="section-title reveal">🎵 There's a Message For You</h2>
        <p className="section-subtitle reveal">Scratch to hear it, Shreya... 💛</p>

        {/* Teasing message — appears slowly while scratching */}
        <div className={`scratch-tease-bubble ${teasingMsg && !revealed ? 'tease-visible' : ''}`} aria-live="polite">
          {teasingMsg}
        </div>

        <div className="scratch-wrapper reveal">
          {!revealed && (
            <div className="scratch-behind-hint">
              <div className="scratch-lily-bg" aria-hidden="true">🌸</div>
              <p>Your surprise is hiding here...</p>
            </div>
          )}
          <div className={`scratch-video-container ${revealed ? 'video-visible' : ''}`}>
            <div className="video-reveal-text">
              <span className="video-reveal-title">🌸 I Found YOU, Shreya 🌸</span>
              <span className="video-reveal-sub">— Aritra 💛</span>
            </div>
            <div className="youtube-embed-wrapper">
              <iframe
                id="scratch-youtube"
                src="https://www.youtube.com/embed/COna6qKOCug?enablejsapi=1&autoplay=0&controls=1&rel=0&modestbranding=1&playsinline=1&iv_load_policy=3"
                title="I Found You - Shreya"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>

          {!revealed && (
            <canvas
              ref={canvasRef}
              className="scratch-canvas"
              onMouseDown={onMouseDown}
              onMouseMove={onMouseMove}
              onMouseUp={onMouseUp}
              onMouseLeave={onMouseUp}
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
              onTouchCancel={onTouchEnd}
            />
          )}

          {!revealed && scratchProgress > 4 && (
            <div className="scratch-progress-bar">
              <div className="scratch-progress-fill" style={{ width: `${scratchProgress}%` }} />
            </div>
          )}
        </div>

        {revealed && (
          <p className="scratch-revealed-msg">
            ✨ You did it! This song is for you, always and forever... 💛
          </p>
        )}
      </div>
    </section>
  );
};

// ─── Order Delivery Popup (4-step story) ────────────
const OrderPopup = ({ onClose }: { onClose: () => void }) => {
  const [step, setStep] = useState(0);
  return (
    <div className="order-overlay" onClick={e => { if (e.target === e.currentTarget && step === 3) onClose(); }}>
      <div className="order-popup">

        {/* Step 0: Order delivered — only deny button */}
        {step === 0 && (
          <>
            <div className="order-icon">📦</div>
            <div className="order-badge">Delivery Notification</div>
            <h3 className="order-title">Order Delivered Successfully!</h3>
            <p className="order-sub">A very special package just arrived for you 🌸</p>
            <div className="order-track">
              <span className="order-track-dot done" />
              <span className="order-track-line" />
              <span className="order-track-dot done" />
              <span className="order-track-line" />
              <span className="order-track-dot done active" />
            </div>
            <p className="order-track-label">Placed → Packed → Delivered ✓</p>
            <div className="order-btns">
              <button className="order-btn-deny" onClick={() => setStep(1)}>
                🤔 I didn't order anything
              </button>
            </div>
          </>
        )}

        {/* Step 1: You DID order — no item reveal, just playful */}
        {step === 1 && (
          <>
            <div className="order-icon">🙄</div>
            <h3 className="order-title">You DID place this order!</h3>
            <p className="order-sub">Our records clearly show a delivery addressed to Shreya... 🌸</p>
            <div className="order-btns">
              <button className="order-btn-deny" onClick={() => setStep(2)}>
                🤔 There must be some mistake, it's not my order
              </button>
            </div>
          </>
        )}

        {/* Step 2: I am built by Aritra, I don't do mistakes */}
        {step === 2 && (
          <>
            <div className="order-icon">🤖</div>
            <h3 className="order-title">I am built by Aritra.</h3>
            <p className="order-sub">Shreya... I don't do mistakes. 😏</p>
            <p className="order-ai-note">
              Every line of my code was written with one purpose — to make you smile. 💛
            </p>
            <div className="order-btns">
              <button className="order-btn-accept" onClick={() => setStep(3)}>
                🎁 Fine... show me what I ordered
              </button>
            </div>
          </>
        )}

        {/* Step 3: Rose reveal + Aritra's heart delivered */}
        {step === 3 && (
          <>
            <div className="order-rose-anim" aria-hidden="true">
              {['🌹','🌸','🌹','🌸','🌹'].map((r, i) => (
                <span key={i} className="order-rose" style={{ animationDelay: `${i * 0.18}s`, left: `${8 + i * 18}%` }}>{r}</span>
              ))}
            </div>
            <div className="order-icon order-icon-pulse">❤️</div>
            <h3 className="order-title">You ordered...</h3>
            <div className="order-item-card">
              <div className="order-item-hearts">
                {['❤️','💛','❤️','💛','❤️'].map((h, i) => (
                  <span key={i} className="order-heart-float" style={{ animationDelay: `${i * 0.2}s` }}>{h}</span>
                ))}
              </div>
              <p className="order-item-name">Aritra's Heart</p>
              <p className="order-item-desc">100% genuine • Lifetime warranty • No returns • No refunds 💛</p>
            </div>
            <h4 className="order-delivered-final">Delivered Successfully! 💛</h4>
            <p className="order-sub">It belongs to you now — handle with infinite care. 🌸</p>
            <div className="order-btns">
              <button className="order-btn-accept" onClick={onClose}>
                🌸 I'll keep it forever
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// ─── Main App ─────────────────────────────────────
export default function App() {
  const [countdown, setCountdown] = useState<CountdownState>({ days: 0, hours: 0, minutes: 0, seconds: 0, passed: false });
  const [secretRevealed, setSecretRevealed] = useState(false);
  const [secretMessages] = useState([
    "You are my sunshine, my only sunshine... 🌻",
    "Every heartbeat of mine whispers your name... 💛",
    "In a field of lilies, you'd be my most beautiful bloom! 🌸",
    "You make my world bloom every single day... ✨",
    "My heart chose you before my mind even understood why... 💫",
  ]);
  const [currentSecret, setCurrentSecret] = useState(0);
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);
  const [wish, setWish] = useState('');
  const [wishes, setWishes] = useState(['You are absolutely magical ✨', 'Happy birthday, sunflower! 🌻', 'The world is brighter with you 💛']);
  const [navOpen, setNavOpen] = useState(false);
  const [showOrderPopup, setShowOrderPopup] = useState(false);
  const orderShownRef = useRef(false);

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const target = new Date(now.getFullYear(), 6, 25, 0, 0, 0);
      if (now > target) target.setFullYear(target.getFullYear() + 1);
      const diff = target.getTime() - now.getTime();
      if (diff <= 0) { setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0, passed: true }); return; }
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

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('revealed'); }),
      { threshold: 0.1 }
    );
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Show order popup once when user scrolls PAST the countdown section
  useEffect(() => {
    const el = document.getElementById('countdown');
    if (!el) return;
    const obs = new IntersectionObserver((entries) => {
      const entry = entries[0];
      if (!entry.isIntersecting && entry.boundingClientRect.bottom < 0 && !orderShownRef.current) {
        orderShownRef.current = true;
        setShowOrderPopup(true);
        obs.disconnect();
      }
    }, { threshold: 0 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const nextSecret = useCallback(() => {
    setSecretRevealed(true);
    setCurrentSecret(prev => (prev + 1) % secretMessages.length);
  }, [secretMessages.length]);

  const addWish = () => {
    if (wish.trim()) { setWishes(prev => [wish.trim(), ...prev]); setWish(''); }
  };

  const photos = [
    { src: '/shreya1.jpg', caption: "That smile that lights up every room 🌟" },
    { src: '/shreya2.jpg', caption: "Beautiful & brilliant, always 💛" },
    { src: '/shreya3.jpg', caption: "The most genuine soul I know ✨" },
    { src: '/shreya4.jpg', caption: "My sunflower, always facing the light 🌻" },
    { src: '/shreya5.jpg', caption: "A smile that speaks a thousand words 🌸" },
    { src: '/shreya6.jpg', caption: "Even in silence, you're everything 💫" },
  ];

  const worthCards = [
    { icon: '🌟', title: 'You Are My Universe', text: 'In the vast cosmos, you are the brightest star that guides me home every single time.' },
    { icon: '💛', title: 'Pure Gold Heart', text: 'Your kindness, your warmth — you have a heart made of pure, rare, beautiful gold.' },
    { icon: '🌸', title: 'My Lily', text: 'Like a lily in full bloom, you are graceful, rare, and impossibly beautiful inside and out.' },
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
      <FloatingLilies />
      {showOrderPopup && <OrderPopup onClose={() => setShowOrderPopup(false)} />}

      {/* ── NAV ── */}
      <nav className="nav">
        
        <div className={`nav-overlay ${navOpen ? 'open' : ''}`} onClick={() => setNavOpen(false)} />
        <ul className={`nav-links ${navOpen ? 'nav-open' : ''}`}>
          {['#hero', '#scratch', '#countdown', '#gallery', '#love-letter', '#worth'].map(href => (
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
              My lily, my calm, my everything —<br />
              you make this life infinitely worth living. 🌸
            </p>
            <a href="#scratch" className="hero-btn">
              🎵 A Surprise Awaits You
            </a>
          </div>
          <div className="hero-photo-wrapper">
            <div className="hero-photo-ring hero-photo-ring-1" />
            <div className="hero-photo-ring hero-photo-ring-2" />
            <img src="/shreya5.jpg" alt="Shreya Ghosh" className="hero-photo" />
            <div className="hero-floating-emojis">
              {['🌸', '💛', '✨', '🌺', '💫', '🌼'].map((e, i) => (
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

      {/* ── SCRATCH REVEAL ── */}
      <ScratchReveal />

      {/* ── COUNTDOWN ── */}
      <section className="section countdown-section" id="countdown">
        <div className="container">
          <h2 className="section-title reveal">⏳ Birthday Countdown</h2>
          <p className="section-subtitle reveal">Every second brings us closer to celebrating YOU</p>
          {countdown.passed ? (
            <p className="birthday-passed">🎉 Happy Birthday, Shreya! Today is YOUR day! 🌸🎂💛</p>
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
            🌸 July 25th — The day the universe gifted us you 🌸
          </p>
        </div>
      </section>

      {/* ── SUNFLOWER GARDEN ── */}
      <section className="section sunflower-section">
        <div className="container">
          <h2 className="section-title reveal">🌸 Your Lily Garden</h2>
          <p className="section-subtitle reveal">Click on the sunflowers — they love you too!</p>
          <div className="sunflower-field reveal">
            {[80, 100, 120, 100, 80, 110, 90].map((size, i) => (
              <Sunflower key={i} size={size} animDelay={i * 0.5} />
            ))}
          </div>
          <div className="sunflower-love-note reveal">
            <p>
              "Like a lily that blooms in perfect elegance, you grace every space you enter
              with effortless beauty and warmth. You are rare, delicate, and extraordinary —
              just like the most precious lily in full bloom. 🌸"
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
                style={{ animationDelay: `${i * 0.1}s` }}
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
              You are worth more than every star in the sky, more than every lily in
              every garden, more than every word I could ever write. You are, simply put,
              everything. And I am the luckiest person alive because I get to know you. 🌸
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
              <div key={i} className="worth-card reveal" style={{ animationDelay: `${i * 0.1}s` }}>
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
            {secretRevealed && <p className="secret-hint">Click the heart for another secret 💫</p>}
            {!secretRevealed && <p className="secret-hint">Click the lock to reveal...</p>}
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
              placeholder="Write a wish for Shreya... 🌸"
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
          July 25, 2004 — The Universe's Greatest Gift 🌸
        </p>
        <p className="footer-sub">Every pixel on this page is a piece of my heart. — Aritra</p>
        <p className="footer-sub" style={{ marginTop: '0.5rem' }}>
          {Array.from({ length: 7 }).map((_, i) => <span key={i} style={{ margin: '0 2px' }}>🌸</span>)}
        </p>
      </footer>
    </div>
  );
}
