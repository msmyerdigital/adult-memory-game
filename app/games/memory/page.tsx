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
  
  // Level tracking (Level 1, Level 2, Level 3)
  const [currentLevel, setCurrentLevel] = useState<number>(1);
  
  // Game state
  const [sequence, setSequence] = useState<number[]>([]);
  const [playerSequence, setPlayerSequence] = useState<number[]>([]);
  const [score, setScore] = useState<number>(0);
  const [isPlayingSequence, setIsPlayingSequence] = useState<boolean>(false);
  const [activeNoteIndex, setActiveNoteIndex] = useState<number | null>(null);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'gameover' | 'won'>('idle');

  // Confetti state
  const [confettiPieces, setConfettiPieces] = useState<ConfettiPiece[]>([]);

  // 5-minute timer tracking
  const [timeLeft, setTimeLeft] = useState<number>(300); // 5 minutes = 300 seconds
  const [sessionWon, setSessionWon] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const notes: Note[] = [
    { label: 'Do', keyName: 'C', freq: 261.63, color: 'bg-rose-600 hover:bg-rose-500', activeColor: 'bg-rose-300' },
    { label: 'Re', keyName: 'D', freq: 293.66, color: 'bg-amber-600 hover:bg-amber-500', activeColor: 'bg-amber-300' },
    { label: 'Mi', keyName: 'E', freq: 329.63, color: 'bg-emerald-600 hover:bg-emerald-500', activeColor: 'bg-emerald-300' },
    { label: 'Fa', keyName: 'F', freq: 349.23, color: 'bg-sky-600 hover:bg-sky-500', activeColor: 'bg-sky-300' },
    { label: 'Sol', keyName: 'G', freq: 392.00, color: 'bg-indigo-600 hover:bg-indigo-500', activeColor: 'bg-indigo-300' },
    { label: 'La', keyName: 'A', freq: 440.00, color: 'bg-purple-600 hover:bg-purple-500', activeColor: 'bg-purple-300' },
  ];

  // 5-minute countdown timer effect
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

  // Elegant Confetti Animation Loop
  useEffect(() => {
    if (gameState === 'gameover') {
      const colors = ['#f43f5e', '#fbbf24', '#34d399', '#38bdf8', '#818cf8', '#f472b6'];
      const pieces: ConfettiPiece[] = Array.from({ length: 45 }).map((_, i) => ({
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

  const playSound = (freq: number) => {
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof window.AudioContext }).webkitAudioContext;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(0.8, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch {
      // Audio fallback
    }
  };

  const startGame = () => {
    setScore(0);
    setPlayerSequence([]);
    setGameState('playing');
    const randomNoteIndex = Math.floor(Math.random() * notes.length);
    const newSeq = [randomNoteIndex];
    setSequence(newSeq);
    playSequence(newSeq);
  };

  const nextRound = (currentSeq: number[]) => {
    setPlayerSequence([]);
    const randomNoteIndex = Math.floor(Math.random() * notes.length);
    const updatedSeq = [...currentSeq, randomNoteIndex];
    setSequence(updatedSeq);
    playSequence(updatedSeq);
  };

  const playSequence = (seq: number[]) => {
    setIsPlayingSequence(true);
    seq.forEach((noteIndex, index) => {
      setTimeout(() => {
        setActiveNoteIndex(noteIndex);
        playSound(notes[noteIndex].freq);

        setTimeout(() => {
          setActiveNoteIndex(null);
        }, 300);
      }, (index + 1) * 600);
    });

    setTimeout(() => {
      setIsPlayingSequence(false);
    }, (seq.length + 1) * 600);
  };

  const handleKeyClick = (noteIndex: number) => {
    if (isPlayingSequence || gameState !== 'playing') return;

    setActiveNoteIndex(noteIndex);
    playSound(notes[noteIndex].freq);
    setTimeout(() => setActiveNoteIndex(null), 250);

    const updatedPlayerSeq = [...playerSequence, noteIndex];
    setPlayerSequence(updatedPlayerSeq);

    const currentIndex = updatedPlayerSeq.length - 1;

    // Check if player clicked wrong note (Game Over / Fail trigger)
    if (updatedPlayerSeq[currentIndex] !== sequence[currentIndex]) {
      setGameState('gameover');
      return;
    }

    // Correct note clicked: +1 point per correct note
    const newScore = score + 1;
    setScore(newScore);

    if (updatedPlayerSeq.length === sequence.length) {
      setTimeout(() => {
        nextRound(sequence);
      }, 1000);
    }
  };

  const handleNextLevelTransition = () => {
    if (currentLevel < 3) {
      setCurrentLevel((prev) => prev + 1);
      setGameState('idle');
      setScore(0);
      setSequence([]);
      setPlayerSequence([]);
    } else {
      router.push('/journal');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <main className="h-screen w-screen bg-[#F7F6F3] text-[#1E293B] p-2 md:p-3 flex flex-col justify-between overflow-hidden select-none relative">
      
      {/* Elegant Confetti Rendering Layer */}
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

      {/* Top Header & Navigation - Black, White & Grey Theme */}
      <nav className="w-full max-w-4xl mx-auto flex justify-between items-center bg-white px-5 py-2.5 rounded-2xl shadow-sm border border-stone-200 text-stone-900">
        <h1 className="text-lg font-bold tracking-tight text-stone-900">Piano Memory — Level {currentLevel}</h1>
        <div className="flex gap-2">
          <Link href="/games" className="px-4 py-1.5 bg-black text-white rounded-xl text-sm font-semibold transition-colors">Games</Link>
          <Link href="/journal" className="px-4 py-1.5 bg-white text-stone-400 hover:text-stone-700 rounded-xl text-sm font-semibold transition-colors">Journal</Link>
        </div>
      </nav>

      {/* Clean Status Bar */}
      <section className="w-full max-w-4xl mx-auto bg-white px-5 py-2.5 rounded-2xl shadow-sm border border-stone-200 flex justify-between items-center text-center">
        <p className="text-xs text-stone-600 font-normal">
          Level {currentLevel} of 3
        </p>
        <p className="text-xs text-stone-600 font-normal">
          Score: <span className="text-stone-900">{score} pts</span>
        </p>
        <p className="text-xs text-stone-600 font-normal">
          Time Left: <span className="text-stone-900">{formatTime(timeLeft)}</span>
        </p>
      </section>

      {/* Game Center Dashboard & Extra Large Piano Keyboard Container */}
      <section className="w-full max-w-4xl mx-auto flex flex-col justify-center items-center my-auto gap-3.5 px-2">
        
        {/* Dynamic Dashboard Box (Hidden completely when actively playing) */}
        {gameState !== 'playing' && (
          <div className="bg-white px-6 py-4 rounded-2xl shadow-sm border border-stone-200 flex flex-col items-center justify-center w-full max-w-md text-center transition-all duration-300">
            {gameState === 'gameover' ? (
              <div className="flex flex-col items-center gap-2 animate-in fade-in zoom-in duration-300">
                <div className="text-lg font-normal text-stone-900"> Wonderful Job! </div>
                <p className="text-xs font-normal text-stone-600">
                  You scored <span className="text-stone-900">{score} points</span>. Let&apos;s try something else.
                </p>
                <button
                  onClick={handleNextLevelTransition}
                  className="mt-2 px-6 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-medium shadow-sm transition-all active:scale-95 cursor-pointer"
                >
                  {currentLevel < 3 ? `GO TO LEVEL ${currentLevel + 1}` : 'FINISH & VIEW JOURNAL'}
                </button>
              </div>
            ) : (
              <button
                onClick={startGame}
                className="px-6 py-2 bg-stone-900 text-white hover:bg-stone-800 rounded-xl text-sm font-medium shadow-sm transition-all active:scale-95 cursor-pointer"
              >
                {gameState === 'idle' ? `START LEVEL ${currentLevel}` : 'RETRY LEVEL'}
              </button>
            )}
          </div>
        )}

        {/* Extra Large Piano Keyboard (Optimized for 6 keys: C, D, E, F, G, A) */}
        <div className="bg-white p-4 md:p-6 rounded-3xl shadow-sm border border-stone-200 flex gap-2.5 w-full justify-center">
          {notes.map((note, index) => (
            <button
              key={note.keyName}
              onClick={() => handleKeyClick(index)}
              className={`flex-1 h-72 md:h-80 rounded-2xl flex flex-col justify-between items-center pb-8 pt-6 transition-all shadow-md border-2 border-stone-300 text-white cursor-pointer ${
                activeNoteIndex === index ? `${note.activeColor} scale-95 shadow-inner brightness-110` : `${note.color} hover:-translate-y-1`
              }`}
            >
              <span className="text-sm md:text-base opacity-95">{note.keyName}</span>
              <span className="text-lg md:text-2xl font-black">{note.label}</span>
            </button>
          ))}
        </div>

      </section>

      {/* Footer Status Message */}
      <div className="w-full max-w-4xl mx-auto flex flex-col items-center justify-center pb-1">
        {sessionWon ? (
          <div className="text-emerald-600 font-normal text-xs bg-white px-4 py-2 rounded-2xl shadow-sm border border-stone-200 animate-bounce">
            take a rest. you won. Redirecting to Journal...
          </div>
        ) : (
          <div className="text-[11px] text-stone-500 font-light">
            {gameState === 'playing'
              ? (isPlayingSequence ? '🎵 Listen to the melody...' : '🎹 Your turn! Repeat the melody.')
              : 'Play through Levels 1, 2, and 3 sequentially.'}
          </div>
        )}
      </div>

    </main>
  );
}