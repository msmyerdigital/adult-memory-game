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
  const [gameState, setGameState] = useState<'showing' | 'playing' | 'gameover' | 'won'>('showing');

  const [currentTileCount, setCurrentTileCount] = useState<number>(2);

  const [confettiPieces, setConfettiPieces] = useState<ConfettiPiece[]>([]);
  const [timeLeft, setTimeLeft] = useState<number>(300);
  const [sessionWon, setSessionWon] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const audioCtxRef = useRef<AudioContext | null>(null);

  const sequenceRef = useRef<number[]>([]);
  const currentIndexRef = useRef<number>(0);
  const gameStateRef = useRef<string>('showing');
  const currentTileCountRef = useRef<number>(2);
  const currentLevelRef = useRef<number>(1);

  sequenceRef.current = sequence;
  currentIndexRef.current = currentIndex;
  gameStateRef.current = gameState;
  currentTileCountRef.current = currentTileCount;
  currentLevelRef.current = currentLevel;

  const tiles: ColorTile[] = [
    { id: 0, name: 'Red', color: 'bg-rose-600', activeColor: 'bg-rose-300 brightness-125', positionClass: 'top-0 left-0 rounded-tl-full', freq: 329.63 },
    { id: 1, name: 'Blue', color: 'bg-sky-600', activeColor: 'bg-sky-300 brightness-125', positionClass: 'top-0 right-0 rounded-tr-full', freq: 261.63 },
    { id: 2, name: 'Green', color: 'bg-emerald-600', activeColor: 'bg-emerald-300 brightness-125', positionClass: 'bottom-0 left-0 rounded-bl-full', freq: 392.00 },
    { id: 3, name: 'Amber', color: 'bg-amber-500', activeColor: 'bg-amber-200 brightness-125', positionClass: 'bottom-0 right-0 rounded-br-full', freq: 523.25 },
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

  useEffect(() => {
    initLevel(1);
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
      const colors = ['#f43f5e', '#38bdf8', '#34d399', '#fbbf24', '#a855f7'];
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

  const initLevel = (targetLevel: number) => {
    setCurrentLevel(targetLevel);
    const newSeq: number[] = [];
    for (let i = 0; i < 10; i++) {
      let nextTile: number;
      do {
        nextTile = Math.floor(Math.random() * tiles.length);
      } while (i > 0 && nextTile === newSeq[i - 1]); // Ensure no tile repeats consecutively in a row
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
    <main className="h-[100dvh] w-screen bg-[#F7F6F3] text-[#1E293B] p-2 flex flex-col justify-between overflow-hidden select-none relative box-border">
      
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

      {/* Top Header & Navigation */}
      <nav className="w-full max-w-4xl mx-auto flex justify-between items-center bg-white px-3 py-1 rounded-md shadow-sm border border-stone-200 text-stone-900 shrink-0">
        <h1 className="text-xs sm:text-base font-bold tracking-tight text-stone-900">Color Memory — Level {currentLevel} / 3</h1>
        <div className="flex gap-1.5">
          <Link href="/games" className="px-2 py-0.5 bg-black text-white rounded-md text-[11px] font-semibold transition-colors">Games</Link>
          <Link href="/journal" className="px-2 py-0.5 bg-white text-stone-400 hover:text-stone-700 rounded-md text-[11px] font-semibold transition-colors">Journal</Link>
        </div>
      </nav>

      {/* Status Bar */}
      <section className="w-full max-w-4xl mx-auto bg-white px-3 py-1 rounded-md shadow-sm border border-stone-200 flex justify-between items-center text-center shrink-0">
        <p className="text-[11px] sm:text-xs text-stone-600 font-normal">Goal: {targetGoal} tiles</p>
        <p className="text-[11px] sm:text-xs text-stone-600 font-normal">
          Progress: <span className="text-stone-900 font-bold">{score}/{activeSubsetLen}</span>
        </p>
        <p className="text-[11px] sm:text-xs text-stone-600 font-normal">Time: <span className="text-stone-900">{formatTime(timeLeft)}</span></p>
      </section>

      {/* Main Container */}
      <section className="w-full max-w-4xl mx-auto flex flex-col justify-center items-center gap-2 px-1 my-auto shrink-0">
        
        {/* Instruction Text at Top */}
        <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-stone-200 flex flex-col items-center justify-center w-full max-w-sm text-center transition-all duration-300 shrink-0">
          {gameState === 'showing' ? (
            <div className="text-xs sm:text-sm font-bold text-amber-700 animate-pulse">
              Watch and repeat
            </div>
          ) : gameState === 'playing' ? (
            <div className="text-xs sm:text-sm font-bold text-stone-800">
              Watch and repeat
            </div>
          ) : gameState === 'won' ? (
            <div className="flex flex-col items-center gap-1 animate-in fade-in zoom-in duration-300">
              <div className="text-xs sm:text-base font-extrabold text-emerald-700">🎉 Congratulations! Level {currentLevel} Completed! 🎉</div>
              <button
                onClick={handleNextLevelTransition}
                className="mt-1 px-3 py-1 bg-stone-900 hover:bg-stone-800 text-white rounded-md text-xs font-medium shadow-sm transition-all active:scale-95 cursor-pointer"
              >
                {currentLevel === 3 ? 'FINISH & VIEW JOURNAL' : `GO TO LEVEL ${currentLevel + 1}`}
              </button>
            </div>
          ) : (
            <div className="text-xs sm:text-sm font-bold text-rose-600 animate-pulse">
              ❌ Mistake! Resetting back to 2 tiles...
            </div>
          )}
        </div>

        {/* Responsive Fluid Simon Board */}
        <div className="relative w-[min(70vw,280px)] h-[min(70vw,280px)] sm:w-[340px] sm:h-[340px] rounded-full shadow-2xl border-4 border-stone-300 overflow-hidden bg-stone-200 my-1">
          {tiles.map((tile) => {
            const isActive = activeTileId === tile.id;

            return (
              <button
                key={tile.id}
                onPointerDown={(e) => handleTilePress(tile.id, e)}
                className={`absolute w-1/2 h-1/2 transition-all shadow-inner border border-stone-400 cursor-pointer touch-none flex items-center justify-center ${tile.positionClass} ${
                  isActive ? tile.activeColor + ' scale-[0.97] ring-4 ring-white z-20' : tile.color
                }`}
              >
                <span className="text-xs sm:text-base font-black text-white opacity-95 drop-shadow-md">{tile.name}</span>
              </button>
            );
          })}
          {/* Center decorative hub */}
          <div className="absolute inset-[30%] rounded-full bg-white shadow-md border-2 border-stone-300 flex items-center justify-center pointer-events-none z-30">
            <span className="text-xs sm:text-sm font-extrabold text-stone-700">{activeSubsetLen}/{targetGoal}</span>
          </div>
        </div>

      </section>

      {/* Footer Info */}
      <div className="w-full max-w-4xl mx-auto flex flex-col items-center justify-center shrink-0 pb-1">
        <div className="text-[10px] sm:text-[11px] text-stone-500 font-light text-center">
          {sessionWon ? 'Take a rest. You won.' : 'Complete 3 levels to finish your session.'}
        </div>
      </div>

    </main>
  );
}