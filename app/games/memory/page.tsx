'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface ColorTile {
  id: number;
  name: string;
  color: string;
  activeColor: string;
  positionClass: string;
  freq: number;
}

interface ConfettiPiece {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  speedX: number;
  speedY: number;
  rotation: number;
  rotationSpeed: number;
}

export default function ColorMemoryGame() {
  const router = useRouter();
  
  const [currentLevel, setCurrentLevel] = useState<number>(1);
  const [sequence, setSequence] = useState<number[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [activeTileId, setActiveTileId] = useState<number | null>(null);
  
  // States: 'idle', 'showing', 'playing', 'gameover', 'won'
  const [gameState, setGameState] = useState<'idle' | 'showing' | 'playing' | 'gameover' | 'won'>('idle');

  const [currentTileCount, setCurrentTileCount] = useState<number>(2);

  const [confettiPieces, setConfettiPieces] = useState<ConfettiPiece[]>([]);
  const [timeLeft, setTimeLeft] = useState<number>(300);
  const [sessionWon, setSessionWon] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const audioCtxRef = useRef<AudioContext | null>(null);

  const sequenceRef = useRef<number[]>([]);
  const currentIndexRef = useRef<number>(0);
  const gameStateRef = useRef<string>('idle');
  const currentTileCountRef = useRef<number>(2);
  const currentLevelRef = useRef<number>(1);

  sequenceRef.current = sequence;
  currentIndexRef.current = currentIndex;
  gameStateRef.current = gameState;
  currentTileCountRef.current = currentTileCount;
  currentLevelRef.current = currentLevel;

  const tiles: ColorTile[] = [
    { id: 0, name: 'Red', color: 'bg-[#DC2626]', activeColor: 'bg-rose-300 brightness-125', positionClass: 'top-0 left-0 rounded-tl-full', freq: 329.63 },
    { id: 1, name: 'Blue', color: 'bg-[#2563EB]', activeColor: 'bg-sky-300 brightness-125', positionClass: 'top-0 right-0 rounded-tr-full', freq: 261.63 },
    { id: 2, name: 'Green', color: 'bg-[#059669]', activeColor: 'bg-emerald-300 brightness-125', positionClass: 'bottom-0 left-0 rounded-bl-full', freq: 392.00 },
    { id: 3, name: 'Amber', color: 'bg-[#D97706]', activeColor: 'bg-amber-200 brightness-125', positionClass: 'bottom-0 right-0 rounded-br-full', freq: 523.25 },
  ];

  const playTileSound = (tileId: number) => {
    try {
      if (!audioCtxRef.current) {
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioCtxRef.current = new AudioContextClass();
      }

      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }

      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(tiles[tileId].freq, ctx.currentTime);

      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } catch {
      // Ignore audio failure fallback
    }
  };

  const getLevelGoal = (lvl: number) => {
    if (lvl === 1) return 5;
    if (lvl === 2) return 7;
    return 10;
  };

  // Generate sequence silently on mount without playing automatically
  useEffect(() => {
    const newSeq: number[] = [];
    for (let i = 0; i < 10; i++) {
      let nextTile: number;
      do {
        nextTile = Math.floor(Math.random() * tiles.length);
      } while (i > 0 && nextTile === newSeq[i - 1]);
      newSeq.push(nextTile);
    }
    setSequence(newSeq);
    setCurrentTileCount(2);
    setGameState('idle');
  }, []);

  useEffect(() => {
    if (!sessionWon) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setSessionWon(true);
            setTimeout(() => router.push('/journal'), 3500);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [sessionWon, router]);

  useEffect(() => {
    if (gameState === 'won') {
      const colors = ['#2563EB', '#059669', '#D97706', '#DC2626', '#7C3AED'];
      const pieces: ConfettiPiece[] = Array.from({ length: 110 }).map((_, i) => ({
        id: i,
        x: Math.random() * window.innerWidth,
        y: -20 - Math.random() * 50,
        size: Math.floor(Math.random() * 8) + 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        speedX: (Math.random() - 0.5) * 3,
        speedY: Math.random() * 3 + 2,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
      }));
      setConfettiPieces(pieces);

      const interval = setInterval(() => {
        setConfettiPieces((prev) =>
          prev
            .map((p) => ({
              ...p,
              x: p.x + p.speedX,
              y: p.y + p.speedY,
              rotation: p.rotation + p.rotationSpeed,
            }))
            .filter((p) => p.y < window.innerHeight + 20)
        );
      }, 25);

      return () => clearInterval(interval);
    } else {
      setConfettiPieces([]);
    }
  }, [gameState]);

  const playSequenceForCount = (fullSeq: number[], count: number) => {
    setGameState('showing');
    setCurrentIndex(0);
    setScore(0);

    const activeSubset = fullSeq.slice(0, count);

    activeSubset.forEach((tileId, index) => {
      setTimeout(() => {
        setActiveTileId(tileId);
        playTileSound(tileId);
        setTimeout(() => {
          setActiveTileId(null);
          if (index === activeSubset.length - 1) {
            setGameState('playing');
          }
        }, 500);
      }, (index + 1) * 950);
    });
  };

  const startLevelOne = () => {
    playSequenceForCount(sequence, currentTileCount);
  };

  const initLevel = (targetLevel: number) => {
    setCurrentLevel(targetLevel);
    const newSeq: number[] = [];
    for (let i = 0; i < 10; i++) {
      let nextTile: number;
      do {
        nextTile = Math.floor(Math.random() * tiles.length);
      } while (i > 0 && nextTile === newSeq[i - 1]);
      newSeq.push(nextTile);
    }
    setSequence(newSeq);
    setCurrentTileCount(2);
    playSequenceForCount(newSeq, 2);
  };

  const handleTilePress = (tileId: number, e: React.UIEvent) => {
    e.preventDefault();
    if (gameStateRef.current !== 'playing') return;

    playTileSound(tileId);

    const fullSeq = sequenceRef.current;
    const targetIdx = currentIndexRef.current;
    const activeCount = currentTileCountRef.current;
    const lvl = currentLevelRef.current;
    const targetGoal = getLevelGoal(lvl);
    const activeSubset = fullSeq.slice(0, activeCount);

    setActiveTileId(tileId);
    setTimeout(() => setActiveTileId(null), 200);

    if (tileId === activeSubset[targetIdx]) {
      const nextTarget = targetIdx + 1;
      setScore(nextTarget);

      if (nextTarget >= activeSubset.length) {
        if (activeCount >= targetGoal) {
          setGameState('won');
        } else {
          const nextCount = activeCount + 1;
          setCurrentTileCount(nextCount);
          setTimeout(() => {
            playSequenceForCount(fullSeq, nextCount);
          }, 800);
        }
      } else {
        setCurrentIndex(nextTarget);
      }
    } else {
      setGameState('gameover');
      setTimeout(() => {
        setCurrentTileCount(2);
        playSequenceForCount(fullSeq, 2);
      }, 1400);
    }
  };

  const handleNextLevelTransition = () => {
    const nextLvl = currentLevel + 1;
    if (nextLvl <= 3) {
      initLevel(nextLvl);
    } else {
      router.push('/journal');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const targetGoal = getLevelGoal(currentLevel);
  const activeSubsetLen = Math.min(targetGoal, currentTileCount);

  return (
    <main className="h-dvh w-screen bg-[#F8FAFC] text-[#0F172A] font-sans selection:bg-[#2563EB] selection:text-[#FFFFFF] flex flex-col justify-between overflow-hidden box-border select-none relative">
      
      {/* Confetti Layer */}
      {confettiPieces.map((p) => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            left: `${p.x}px`,
            top: `${p.y}px`,
            width: `${p.size}px`,
            height: `${p.size * 0.6}px`,
            backgroundColor: p.color,
            transform: `rotate(${p.rotation}deg)`,
            borderRadius: '2px',
            pointerEvents: 'none',
            zIndex: 50,
            opacity: 0.9,
          }}
        />
      ))}

      {/* Top Professional Navigation Header */}
      <header className="border-b border-[#E2E8F0] bg-[#FFFFFF] px-4 sm:px-6 py-2.5 flex justify-between items-center shrink-0 shadow-xs">
        <Link href="https://freebraingain.vercel.app/" className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#059669]"></span>
          <span className="font-extrabold text-sm tracking-tight text-[#0F172A]">
            Free Brain Gain <span className="text-[#2563EB]">Portal</span>
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <Link 
            href="/games" 
            className="px-3.5 py-1.5 bg-[#2563EB] text-[#FFFFFF] font-extrabold text-xs uppercase tracking-wider rounded transition shadow-xs"
          >
            Games
          </Link>
          <Link 
            href="/journal" 
            className="px-3.5 py-1.5 bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#334155] border border-[#CBD5E1] font-bold text-xs uppercase tracking-wider rounded transition"
          >
            Journal
          </Link>
        </div>
      </header>

      {/* Main Single-Screen Game Layout */}
      <section className="max-w-4xl w-full mx-auto px-4 sm:px-6 py-3 flex-1 flex flex-col justify-between items-stretch min-h-0">
        
        {/* Title & Status Bar Container */}
        <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl px-4 py-2 shadow-xs shrink-0 flex items-center justify-between mb-2">
          <div>
            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#2563EB] bg-[#EFF6FF] px-2 py-0.5 rounded">
              Memory & Focus Training
            </span>
            <h1 className="text-sm sm:text-base font-black text-[#0F172A] mt-0.5">
              Color Memory — Level {currentLevel} / 3
            </h1>
          </div>
          <div className="flex items-center gap-3 text-xs font-bold text-[#334155]">
            <span>Goal: <strong className="text-[#059669]">{targetGoal}</strong></span>
            <span>Progress: <strong className="text-[#2563EB]">{score}/{activeSubsetLen}</strong></span>
            <span>Time: <strong className="text-[#DC2626]">{formatTime(timeLeft)}</strong></span>
          </div>
        </div>

        {/* Game Canvas Area */}
        <div className="bg-[#FFFFFF] border-2 border-[#CBD5E1] rounded-xl p-3 shadow-sm flex-1 relative overflow-hidden flex flex-col items-center justify-between bg-gradient-to-br from-[#FFFFFF] to-[#F8FAFC]">
          
          {/* Instruction / Action Banner */}
          <div className="bg-[#F8FAFC] px-4 py-1.5 rounded-lg border border-[#E2E8F0] flex flex-col items-center justify-center w-full max-w-xs text-center shrink-0">
            {gameState === 'idle' ? (
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-[#0F172A]">Ready to play Level 1?</span>
                <button
                  onClick={startLevelOne}
                  className="px-4 py-1 bg-[#2563EB] hover:bg-blue-700 text-white rounded-md text-xs font-extrabold uppercase tracking-wider shadow-sm transition active:scale-95 cursor-pointer"
                >
                  Play
                </button>
              </div>
            ) : gameState === 'showing' ? (
              <span className="text-xs font-bold text-[#D97706] animate-pulse">
                Watch and repeat...
              </span>
            ) : gameState === 'playing' ? (
              <span className="text-xs font-bold text-[#0F172A]">
                Your turn! Repeat the sequence
              </span>
            ) : gameState === 'won' ? (
              <div className="flex items-center gap-2 animate-in fade-in zoom-in duration-300">
                <span className="text-xs font-black text-[#059669]">🎉 Level {currentLevel} Completed!</span>
                <button
                  onClick={handleNextLevelTransition}
                  className="px-3 py-1 bg-[#2563EB] hover:bg-blue-700 text-white rounded-md text-xs font-extrabold uppercase tracking-wider shadow-sm transition active:scale-95 cursor-pointer"
                >
                  {currentLevel === 3 ? 'Finish' : `Next Level`}
                </button>
              </div>
            ) : (
              <span className="text-xs font-bold text-[#DC2626] animate-pulse">
                ❌ Mistake! Resetting back to 2 tiles...
              </span>
            )}
          </div>

          {/* Larger Simon Board */}
          <div className="relative w-[min(72vw,300px)] h-[min(72vw,300px)] sm:w-[330px] sm:h-[330px] rounded-full shadow-2xl border-4 border-[#CBD5E1] overflow-hidden bg-[#F1F5F9] my-auto flex items-center justify-center">
            {tiles.map((tile) => {
              const isActive = activeTileId === tile.id;

              return (
                <button
                  key={tile.id}
                  onPointerDown={(e) => handleTilePress(tile.id, e)}
                  className={`absolute w-1/2 h-1/2 transition-all shadow-inner border border-white/20 cursor-pointer touch-none flex items-center justify-center ${tile.positionClass} ${
                    isActive ? tile.activeColor + ' scale-[0.97] ring-4 ring-white z-20' : tile.color
                  }`}
                >
                  <span className="text-xs sm:text-base font-black text-white opacity-95 drop-shadow-md">{tile.name}</span>
                </button>
              );
            })}
            
            {/* Center Hub */}
            <div className="absolute inset-[32%] rounded-full bg-[#FFFFFF] shadow-md border-2 border-[#CBD5E1] flex items-center justify-center pointer-events-none z-30">
              <span className="text-xs sm:text-sm font-extrabold text-[#0F172A]">{activeSubsetLen}/{targetGoal}</span>
            </div>
          </div>

          {/* Bottom Bar inside game box */}
          <div className="w-full flex justify-between items-center z-20">
            <Link href="/games" className="text-xs font-extrabold text-[#2563EB] hover:underline">
              ← Back to Games
            </Link>
            <span className="text-[11px] font-bold text-[#64748B]">
              {sessionWon ? 'Session completed.' : 'Complete 3 levels to finish.'}
            </span>
          </div>

        </div>

      </section>

      {/* Footer */}
      <footer className="border-t border-[#E2E8F0] bg-[#FFFFFF] px-4 sm:px-6 py-2 text-center text-[10px] text-[#64748B] flex justify-between items-center shrink-0">
        <p className="uppercase tracking-widest font-semibold">Free Brain Gain Portal</p>
        <p className="font-mono text-[#94A3B8]">© {new Date().getFullYear()}</p>
      </footer>

    </main>
  );
}