// Next, React
import { FC, useState, useEffect, useRef } from "react";
import pkg from "../../../package.json";

// ❌ DO NOT EDIT ANYTHING ABOVE THIS LINE

export const HomeView: FC = () => {
  return (
    <div className="flex min-h-screen flex-col bg-black text-white">
      {/* HEADER – fake Scrolly feed tabs */}
      <header className="flex items-center justify-center border-b border-white/10 py-3">
        <div className="flex items-center gap-2 rounded-full bg-white/5 px-2 py-1 text-[11px]">
          <button className="rounded-full bg-slate-900 px-3 py-1 font-semibold text-white">
            Feed
          </button>
          <button className="rounded-full px-3 py-1 text-slate-400">
            Casino
          </button>
          <button className="rounded-full px-3 py-1 text-slate-400">
            Kids
          </button>
        </div>
      </header>

      {/* MAIN – central game area (phone frame) */}
      <main className="flex flex-1 items-center justify-center px-4 py-3">
        <div className="relative aspect-[9/16] w-full max-w-sm overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 shadow-[0_0_40px_rgba(56,189,248,0.35)]">
          {/* Fake “feed card” top bar inside the phone */}
          <div className="flex items-center justify-between px-3 py-2 text-[10px] text-slate-400">
            <span className="rounded-full bg-white/5 px-2 py-1 text-[9px] uppercase tracking-wide">
              Scrolly Game
            </span>
            <span className="text-[9px] opacity-70">#NoCodeJam</span>
          </div>

          {/* The game lives INSIDE this phone frame */}
          <div className="flex h-[calc(100%-26px)] flex-col items-center justify-start px-3 pb-3 pt-1">
            <GameSandbox />
          </div>
        </div>
      </main>

      {/* FOOTER – tiny version text */}
      <footer className="flex h-5 items-center justify-center border-t border-white/10 px-2 text-[9px] text-slate-500">
        <span>Scrolly · v{pkg.version}</span>
      </footer>
    </div>
  );
};

// ✅ THIS IS THE ONLY PART YOU EDIT FOR THE JAM
// Replace this entire GameSandbox component with the one AI generates.
// Keep the name `GameSandbox` and the `FC` type.
const GameSandbox: FC = () => {
  // --- Configuration ---
  const CONFIG = {
    START_SPEED: 0.5,
    MAX_SPEED: 2.2,
    WIN_SCORE: 100,
    GRAVITY: 0.25,
  };

  // --- React State (For Rendering) ---
  const [gameState, setGameState] = useState<
    "menu" | "playing" | "gameover" | "victory"
  >("menu");
  const [score, setScore] = useState(0);
  const [health, setHealth] = useState(3);
  const [shake, setShake] = useState(0); // Screen shake intensity

  // --- Refs (Mutable Game Logic - High Performance) ---
  const reqRef = useRef<number>();
  const scoreRef = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDownRef = useRef(false);
  const cursorRef = useRef<{ x: number; y: number } | null>(null);

  // Game Entities
  const enemiesRef = useRef<
    Array<{ id: number; x: number; y: number; type: string; dead: boolean }>
  >([]);
  const particlesRef = useRef<
    Array<{
      id: number;
      x: number;
      y: number;
      vx: number;
      vy: number;
      life: number;
      color: string;
    }>
  >([]);
  const trailRef = useRef<Array<{ x: number; y: number; life: number }>>([]);
  const textsRef = useRef<
    Array<{ id: number; x: number; y: number; text: string; life: number }>
  >([]);

  // --- Rendering State Helpers ---
  // We sync Refs to State periodically to draw, preventing React from choking
  const [renderEnemies, setRenderEnemies] = useState<any[]>([]);
  const [renderParticles, setRenderParticles] = useState<any[]>([]);
  const [renderTrail, setRenderTrail] = useState<any[]>([]);
  const [renderTexts, setRenderTexts] = useState<any[]>([]);

  // --- Visual FX Helpers ---
  const spawnExplosion = (x: number, y: number, color: string) => {
    for (let i = 0; i < 8; i++) {
      particlesRef.current.push({
        id: Math.random(),
        x,
        y,
        vx: (Math.random() - 0.5) * 3,
        vy: (Math.random() - 0.5) * 3,
        life: 1.0,
        color,
      });
    }
  };

  const spawnText = (x: number, y: number, text: string) => {
    textsRef.current.push({ id: Math.random(), x, y, text, life: 1.0 });
  };

  const triggerShake = () => {
    setShake(10);
    setTimeout(() => setShake(0), 300);
  };

  // --- Main Game Loop ---
  const loop = () => {
    if (gameState !== "playing") return;

    // 1. Difficulty Scaling
    let currentSpeed = CONFIG.START_SPEED + scoreRef.current * 0.02;
    if (currentSpeed > CONFIG.MAX_SPEED) currentSpeed = CONFIG.MAX_SPEED;
    const spawnChance = 0.015 + scoreRef.current * 0.0004;

    // 2. Input Trail Logic
    if (isDownRef.current && cursorRef.current) {
      trailRef.current.push({
        x: cursorRef.current.x,
        y: cursorRef.current.y,
        life: 1.0,
      });
    }

    // 3. Spawning
    if (Math.random() < spawnChance) {
      enemiesRef.current.push({
        id: Date.now() + Math.random(),
        x: 10 + Math.random() * 80,
        y: -15,
        type: Math.random() > 0.85 ? "👹" : "👺",
        dead: false,
      });
    }

    // 4. Update Enemies
    let damage = false;
    enemiesRef.current = enemiesRef.current.filter((e) => {
      e.y += currentSpeed;
      if (e.y > 105) {
        if (!e.dead) damage = true;
        return false;
      }
      return true;
    });

    if (damage) {
      triggerShake();
      setHealth((prev) => {
        const next = prev - 1;
        if (next <= 0) {
          setGameState("gameover");
          return 0;
        }
        return next;
      });
    }

    // 5. Update Particles & Text
    particlesRef.current.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.06;
    });
    particlesRef.current = particlesRef.current.filter((p) => p.life > 0);

    textsRef.current.forEach((t) => {
      t.y -= 0.5;
      t.life -= 0.03;
    });
    textsRef.current = textsRef.current.filter((t) => t.life > 0);

    trailRef.current.forEach((t) => (t.life -= 0.15));
    trailRef.current = trailRef.current.filter((t) => t.life > 0);

    // 6. Collision Detection
    if (isDownRef.current && cursorRef.current) {
      const { x: cx, y: cy } = cursorRef.current;
      let hit = false;

      enemiesRef.current.forEach((e) => {
        if (e.dead) return;
        const dist = Math.sqrt(Math.pow(e.x - cx, 2) + Math.pow(e.y - cy, 2));
        if (dist < 10) {
          // Hit!
          e.dead = true;
          hit = true;
          // FX
          spawnExplosion(e.x, e.y, e.type === "👹" ? "#ef4444" : "#22d3ee");
          spawnText(e.x, e.y, e.type === "👹" ? "+5" : "+1");
          scoreRef.current += e.type === "👹" ? 5 : 1;
        }
      });

      if (hit) {
        setScore(scoreRef.current);
        if (scoreRef.current >= CONFIG.WIN_SCORE) setGameState("victory");
      }
    }

    // 7. Render Sync
    setRenderEnemies([...enemiesRef.current]);
    setRenderParticles([...particlesRef.current]);
    setRenderTexts([...textsRef.current]);
    setRenderTrail([...trailRef.current]);

    reqRef.current = requestAnimationFrame(loop);
  };

  // --- Input Handlers ---
  const updateCursor = (clientX: number, clientY: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    cursorRef.current = {
      x: ((clientX - rect.left) / rect.width) * 100,
      y: ((clientY - rect.top) / rect.height) * 100,
    };
  };

  const onDown = (e: any) => {
    isDownRef.current = true;
    updateCursor(
      e.clientX || e.touches[0].clientX,
      e.clientY || e.touches[0].clientY
    );
  };
  const onMove = (e: any) => {
    if (isDownRef.current)
      updateCursor(
        e.clientX || e.touches[0].clientX,
        e.clientY || e.touches[0].clientY
      );
  };
  const onUp = () => {
    isDownRef.current = false;
  };

  // --- Lifecycle ---
  useEffect(() => {
    if (gameState === "playing") reqRef.current = requestAnimationFrame(loop);
    return () => {
      if (reqRef.current) cancelAnimationFrame(reqRef.current);
    };
  }, [gameState]);

  const startGame = () => {
    enemiesRef.current = [];
    particlesRef.current = [];
    textsRef.current = [];
    scoreRef.current = 0;
    setScore(0);
    setHealth(3);
    setGameState("playing");
  };

  // --- Render ---
  return (
    <div className="w-full flex justify-center bg-transparent">
      {/* Game Container (Fixed 350px Height) */}
      <div
        ref={containerRef}
        className="relative w-full h-[280px] bg-slate-950 rounded-xl overflow-hidden border border-slate-700 shadow-2xl touch-none select-none cursor-crosshair"
        style={{
          transform: `translate(${Math.random() * shake - shake / 2}px, ${
            Math.random() * shake - shake / 2
          }px)`,
        }}
        onMouseDown={onDown}
        onMouseMove={onMove}
        onMouseUp={onUp}
        onMouseLeave={onUp}
        onTouchStart={onDown}
        onTouchMove={onMove}
        onTouchEnd={onUp}
      >
        {/* Backgrounds */}
        <div className="absolute inset-0 bg-gradient-to-b from-black via-slate-900 to-slate-900 opacity-95" />
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-800 via-transparent to-transparent" />

        {/* HUD */}
        <div className="absolute top-3 left-4 flex gap-1 z-20">
          {[...Array(3)].map((_, i) => (
            <span
              key={i}
              className={`text-xl transition-all ${
                i < health ? "text-red-500" : "text-slate-800"
              }`}
            >
              ❤
            </span>
          ))}
        </div>
        <div className="absolute top-3 right-4 z-20 text-right">
          <div className="text-4xl font-black text-white italic leading-none drop-shadow-md">
            {score}
          </div>
        </div>

        {/* --- GAME LAYERS --- */}

        {/* 1. Trail */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-30 filter drop-shadow-[0_0_5px_cyan]">
          <polyline
            points={renderTrail.map((p) => `${p.x}%,${p.y}%`).join(" ")}
            fill="none"
            stroke="#22d3ee"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="opacity-80"
          />
        </svg>

        {/* 2. Particles */}
        {renderParticles.map((p) => (
          <div
            key={p.id}
            className="absolute w-1.5 h-1.5 rounded-full pointer-events-none"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              backgroundColor: p.color,
              opacity: p.life,
              transform: `scale(${p.life})`,
            }}
          />
        ))}

        {/* 3. Enemies */}
        {renderEnemies.map((e) => (
          <div
            key={e.id}
            className={`absolute w-12 h-12 transform -translate-x-1/2 -translate-y-1/2 transition-transform duration-75 ${
              e.dead ? "scale-150 opacity-0 rotate-180" : "scale-100"
            }`}
            style={{ left: `${e.x}%`, top: `${e.y}%` }}
          >
            {e.dead ? (
              <div className="text-4xl">💥</div>
            ) : e.type === "👹" ? (
              // RED DEMON SVG
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="w-full h-full drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]"
              >
                <path
                  d="M12 2L4 7V12C4 17.5 7.5 22.5 12 24C16.5 22.5 20 17.5 20 12V7L12 2Z"
                  fill="#7f1d1d"
                  stroke="#ef4444"
                  strokeWidth="2"
                />
                <path
                  d="M9 11L11 13L15 9"
                  stroke="#ef4444"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            ) : (
              // BLUE/GREEN DEMON SVG
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="w-full h-full drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]"
              >
                <path
                  d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                  fill="#164e63"
                  stroke="#22d3ee"
                  strokeWidth="2"
                />
                <path
                  d="M8 10H10M14 10H16"
                  stroke="#22d3ee"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M9 15C9 15 10 17 12 17C14 17 15 15 15 15"
                  stroke="#22d3ee"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            )}
          </div>
        ))}

        {/* 4. Floating Text */}
        {renderTexts.map((t) => (
          <div
            key={t.id}
            className="absolute text-yellow-400 font-bold text-sm pointer-events-none whitespace-nowrap"
            style={{
              left: `${t.x}%`,
              top: `${t.y}%`,
              opacity: t.life,
              transform: `translate(-50%, -100%) scale(${1 + (1 - t.life)})`,
            }}
          >
            {t.text}
          </div>
        ))}

        {/* --- MENUS --- */}
        {gameState === "menu" && (
          <div className="absolute inset-0 z-50 bg-black/80 flex flex-col items-center justify-center text-center p-4 backdrop-blur-sm">
            <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 italic mb-2 tracking-tighter">
              NEON
              <br />
              SLASH
            </h1>
            <p className="text-slate-400 text-xs font-mono mb-6">
              SWIPE TO SURVIVE
            </p>
            <button
              onClick={startGame}
              className="px-8 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-full shadow-[0_0_20px_cyan] active:scale-95 transition-transform"
            >
              START GAME
            </button>
          </div>
        )}

        {gameState === "gameover" && (
          <div className="absolute inset-0 z-50 bg-red-950/90 flex flex-col items-center justify-center text-center backdrop-blur-sm">
            <h2 className="text-3xl font-bold text-white mb-2">GAME OVER</h2>
            <div className="text-xl text-red-200 mb-6 font-mono">
              Final Score: {score}
            </div>
            <button
              onClick={startGame}
              className="px-8 py-2 bg-white text-red-900 font-bold rounded-full shadow-lg active:scale-95"
            >
              RETRY
            </button>
          </div>
        )}

        {gameState === "victory" && (
          <div className="absolute inset-0 z-50 bg-slate-900/90 flex flex-col items-center justify-center text-center backdrop-blur-sm">
            <div className="text-5xl mb-3">🏆</div>
            <h2 className="text-3xl font-bold text-yellow-400 mb-1">
              VICTORY!
            </h2>
            <div className="text-slate-300 text-sm mb-6">
              Resume Worthy Skills
            </div>
            <button
              onClick={startGame}
              className="px-8 py-2 bg-yellow-400 text-black font-bold rounded-full shadow-lg active:scale-95"
            >
              PLAY AGAIN
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
