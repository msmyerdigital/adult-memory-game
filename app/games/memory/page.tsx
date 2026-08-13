'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Note {
  label: string;
  keyName: string;
  freq: number;
  color: string;
  activeColor: string;
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

export default function PianoMemoryGame() {
  const router = useRouter();
  
  const [currentLevel, setCurrentLevel] = useState<number>(1);
  const [sequence, setSequence] = useState<number[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [activeNoteIndex, setActiveNoteIndex] = useState<number | null>(null);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'gameover' | 'won'>('idle');

  const [confettiPieces, setConfettiPieces] = useState<ConfettiPiece[]>([]);

  const [timeLeft, setTimeLeft] = useState<number>(300);
  const [sessionWon, setSessionWon] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync refs for handlers to avoid stale closures in touch events
  const sequenceRef = useRef<number[]>([]);
  const currentIndexRef = useRef<number>(0);
  const gameStateRef = useRef<'idle' | 'playing' | 'gameover' | 'won'>('idle');

  sequenceRef.current = sequence;
  currentIndexRef.current = currentIndex;
  gameStateRef.current = gameState;

  const notes: Note[] = [
    { label: 'Do', keyName: 'C', freq: 261.63, color: 'bg-rose-600 active:bg-rose-700', activeColor: 'bg-rose-300' },
    { label: 'Re', keyName: 'D', freq: 293.66, color: 'bg-amber-600 active:bg-amber-700', activeColor: 'bg-amber-300' },
    { label: 'Mi', keyName: 'E', freq: 329.63, color: 'bg-emerald-600 active:bg-emerald-700', activeColor: 'bg-emerald-300' },
    { label: 'Fa', keyName: 'F', freq: 349.23, color: 'bg-sky-600 active:bg-sky-700', activeColor: 'bg-sky-300' },
    { label: 'Sol', keyName: 'G', freq: 392.00, color: 'bg-indigo-600 active:bg-indigo-700', activeColor: 'bg-indigo-300' },
    { label: 'La', keyName: 'A', freq: 440.00, color: 'bg-purple-600 active:bg-purple-700', activeColor: 'bg-purple-300' },
  ];

  // Load saved level and auto-start game on mount
  useEffect(() => {
    const savedLevel = localStorage.getItem('piano_global_level');
    let lvl = 1;
    if (savedLevel) {
      const parsed = parseInt(savedLevel, 10);
      if (!isNaN(parsed) && parsed >= 1 && parsed <= 100) {
        lvl = parsed;
        setCurrentLevel(parsed);
      }
    }
    startLevel(lvl);
  }, []);

  useEffect(() => {
    if (gameState === 'playing' && !sessionWon) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setSessionWon(true);
            setTimeout(() => {
              router.push('/journal');
            }, 3500);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState, sessionWon, router]);

  // Confetti effect trigger whenever game state is 'won'
  useEffect(() => {
    if (gameState === 'won') {
      const colors = ['#f43f5e', '#fbbf24', '#34d399', '#38bdf8', '#818cf8', '#f472b6'];
      const pieces: ConfettiPiece[] = Array.from({ length: 80 }).map((_, i) => ({
        id: i,
        x: Math.random() * window.innerWidth,
        y: -20 - Math.random() * 50,
        size: Math.floor(Math.random() * 10) + 6,
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

  const playSound = (freq: number) => {
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof window.AudioContext }).webkitAudioContext;
      const ctx = new AudioContextClass();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(0.8, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch {
      // Audio fallback
    }
  };

  const startLevel = (targetLevel: number) => {
    setScore(0);
    setCurrentIndex(0);
    setGameState('playing');
    
    // First 3 levels have 6 notes. Each level after adds 2 extra notes, capping at 60 notes.
    const sequenceLength = targetLevel <= 3 ? 6 : Math.min(60, 6 + (targetLevel - 3) * 2);

    const lullabyTemplates = [
      [0, 0, 4, 4, 5, 5, 4], // Twinkle Twinkle Little Star Motif
      [2, 4, 2, 4, 2, 5, 4, 3], // Brahms Lullaby Motif
      [0, 2, 4, 5, 4, 2, 0, 1], // Gentle Scale Lullaby Motif
    ];

    const template = lullabyTemplates[(targetLevel - 1) % lullabyTemplates.length];
    const newSeq: number[] = [];
    for (let i = 0; i < sequenceLength; i++) {
      newSeq.push(template[i % template.length]);
    }
    setSequence(newSeq);
  };

  const handleKeyInteraction = (noteIndex: number, e: React.UIEvent) => {
    e.preventDefault(); // Stop mobile ghost clicks / double triggering
    if (gameStateRef.current !== 'playing') return;

    const currentSeq = sequenceRef.current;
    const targetIdx = currentIndexRef.current;

    if (noteIndex === currentSeq[targetIdx]) {
      setActiveNoteIndex(noteIndex);
      playSound(notes[noteIndex].freq);
      setTimeout(() => setActiveNoteIndex(null), 180);

      const nextTarget = targetIdx + 1;
      setScore(nextTarget);

      if (nextTarget >= currentSeq.length) {
        setGameState('won');
      } else {
        setCurrentIndex(nextTarget);
      }
    } else {
      setActiveNoteIndex(noteIndex);
      playSound(notes[noteIndex].freq);
      setTimeout(() => setActiveNoteIndex(null), 180);
      setGameState('gameover');
    }
  };

  const handleNextLevelTransition = () => {
    const nextLvl = currentLevel + 1;
    const remainder = currentLevel % 3;
    const isEndOfBatch = remainder === 0 || currentLevel === 100;

    if (nextLvl <= 100) {
      setCurrentLevel(nextLvl);
      localStorage.setItem('piano_global_level', nextLvl.toString());
    }

    if (isEndOfBatch || nextLvl > 100) {
      router.push('/journal');
    } else {
      startLevel(nextLvl);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const currentSeqLen = sequence.length > 0 ? sequence.length : (currentLevel <= 3 ? 6 : Math.min(60, 6 + (currentLevel - 3) * 2));

  return (
    <main className="h-[100dvh] w-screen bg-[#F7F6F3] text-[#1E293B] p-1 flex flex-col justify-between overflow-hidden select-none relative box-border">
      
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
            opacity: 0.85,
          }}
        />
      ))}

      {/* Top Header & Navigation */}
      <nav className="w-full max-w-4xl mx-auto flex justify-between items-center bg-white px-2.5 py-0.5 rounded-md shadow-sm border border-stone-200 text-stone-900 shrink-0">
        <h1 className="text-xs sm:text-base font-bold tracking-tight text-stone-900">Piano Memory — Level {currentLevel} / 100</h1>
        <div className="flex gap-1.5">
          <Link href="/games" className="px-2 py-0.5 bg-black text-white rounded-md text-[11px] font-semibold transition-colors">Games</Link>
          <Link href="/journal" className="px-2 py-0.5 bg-white text-stone-400 hover:text-stone-700 rounded-md text-[11px] font-semibold transition-colors">Journal</Link>
        </div>
      </nav>

      {/* Sound Instruction Banner at Top */}
      <div className="w-full max-w-4xl mx-auto text-center text-[10px] sm:text-[11px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 shrink-0 font-semibold">
        🔊 Please make sure the sound is on!
      </div>

      {/* Status Bar */}
      <section className="w-full max-w-4xl mx-auto bg-white px-3 py-0.5 rounded-md shadow-sm border border-stone-200 flex justify-between items-center text-center shrink-0">
        <p className="text-[10px] sm:text-xs text-stone-600 font-normal">Level {currentLevel}</p>
        <p className="text-[10px] sm:text-xs text-stone-600 font-normal">
          Progress: <span className="text-stone-900 font-bold">{score}/{currentSeqLen}</span>
        </p>
        <p className="text-[10px] sm:text-xs text-stone-600 font-normal">Time: <span className="text-stone-900">{formatTime(timeLeft)}</span></p>
      </section>

      {/* Main Container */}
      <section className="w-full max-w-4xl mx-auto flex flex-col justify-center items-center gap-1.5 px-0.5 my-auto shrink-0">
        
        {/* Dynamic Controls / Feedback Box */}
        <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-stone-200 flex flex-col items-center justify-center w-full max-w-md text-center transition-all duration-300 shrink-0">
          {gameState === 'won' ? (
            <div className="flex flex-col items-center gap-1 animate-in fade-in zoom-in duration-300">
              <div className="text-xs sm:text-base font-extrabold text-emerald-700">🎉 Congratulations! Level {currentLevel} Completed!</div>
              <div className="text-[11px] text-stone-600">You played the sequence flawlessly.</div>
              <button
                onClick={handleNextLevelTransition}
                className="mt-1 px-3 py-1 bg-stone-900 hover:bg-stone-800 text-white rounded-md text-[11px] font-medium shadow-sm transition-all active:scale-95 cursor-pointer"
              >
                {currentLevel % 3 === 0 || currentLevel === 100 ? 'FINISH & VIEW JOURNAL' : `GO TO LEVEL ${currentLevel + 1}`}
              </button>
            </div>
          ) : gameState === 'gameover' ? (
            <div className="flex flex-col items-center gap-0.5 animate-in fade-in zoom-in duration-300">
              <div className="text-xs sm:text-sm font-bold text-stone-900">Wrong note! Try again. 🎵</div>
              <button
                onClick={() => startLevel(currentLevel)}
                className="mt-0.5 px-3 py-1 bg-stone-900 hover:bg-stone-800 text-white rounded-md text-[11px] font-medium shadow-sm transition-all active:scale-95 cursor-pointer"
              >
                RETRY LEVEL
              </button>
            </div>
          ) : (
            <div className="text-xs sm:text-sm font-medium text-stone-800">
              🎹 Follow the sequence ({currentSeqLen} notes)!
            </div>
          )}
        </div>

        {/* Piano Keyboard Tiles - Using PointerDown to reliably handle mobile touch & desktop click uniformly */}
        <div className="bg-white p-2 sm:p-4 rounded-xl shadow-sm border border-stone-200 flex flex-row gap-1 sm:gap-2.5 w-full justify-center">
          {notes.map((note, index) => {
            const isTargetActive = gameState === 'playing' && sequence[currentIndex] === index;

            return (
              <button
                key={note.keyName}
                onPointerDown={(e) => handleKeyInteraction(index, e)}
                className={`flex-1 h-[22vh] sm:h-72 rounded-lg sm:rounded-2xl flex flex-col justify-between items-center pb-2 sm:pb-6 pt-2 sm:pt-5 transition-all shadow-md border-2 border-stone-300 text-white cursor-pointer touch-none relative ${
                  activeNoteIndex === index 
                    ? `${note.activeColor} scale-95 shadow-inner brightness-110` 
                    : `${note.color}`
                } ${isTargetActive && gameState === 'playing' ? 'ring-4 ring-amber-400 ring-offset-1' : ''}`}
              >
                <span className="text-[10px] sm:text-base opacity-95 font-medium">{note.keyName}</span>
                <span className="text-[11px] sm:text-2xl font-black">{note.label}</span>
              </button>
            );
          })}
        </div>

      </section>

      {/* Footer Info */}
      <div className="w-full max-w-4xl mx-auto flex flex-col items-center justify-center shrink-0 pb-0.5">
        {sessionWon ? (
          <div className="text-emerald-600 font-normal text-[10px] sm:text-xs bg-white px-2 py-0.5 rounded-md shadow-sm border border-stone-200 animate-bounce">
            Take a rest. You won. Redirecting to Journal...
          </div>
        ) : (
          <div className="text-[10px] sm:text-[11px] text-stone-500 font-light text-center">
            {gameState !== 'playing' ? 'Complete 3 levels in this session before taking a journal break.' : 'Listen and repeat the notes!'}
          </div>
        )}
      </div>

    </main>
  );
}