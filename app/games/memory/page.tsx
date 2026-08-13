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
  const [playerSequence, setPlayerSequence] = useState<number[]>([]);
  const [score, setScore] = useState<number>(0);
  const [isPlayingSequence, setIsPlayingSequence] = useState<boolean>(false);
  const [activeNoteIndex, setActiveNoteIndex] = useState<number | null>(null);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'gameover' | 'won'>('idle');

  const [confettiPieces, setConfettiPieces] = useState<ConfettiPiece[]>([]);

  const [timeLeft, setTimeLeft] = useState<number>(300);
  const [sessionWon, setSessionWon] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const notes: Note[] = [
    { label: 'Do', keyName: 'C', freq: 261.63, color: 'bg-rose-600 active:bg-rose-700', activeColor: 'bg-rose-300' },
    { label: 'Re', keyName: 'D', freq: 293.66, color: 'bg-amber-600 active:bg-amber-700', activeColor: 'bg-amber-300' },
    { label: 'Mi', keyName: 'E', freq: 329.63, color: 'bg-emerald-600 active:bg-emerald-700', activeColor: 'bg-emerald-300' },
    { label: 'Fa', keyName: 'F', freq: 349.23, color: 'bg-sky-600 active:bg-sky-700', activeColor: 'bg-sky-300' },
    { label: 'Sol', keyName: 'G', freq: 392.00, color: 'bg-indigo-600 active:bg-indigo-700', activeColor: 'bg-indigo-300' },
    { label: 'La', keyName: 'A', freq: 440.00, color: 'bg-purple-600 active:bg-purple-700', activeColor: 'bg-purple-300' },
  ];

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

  useEffect(() => {
    if (gameState === 'won') {
      const colors = ['#f43f5e', '#fbbf24', '#34d399', '#38bdf8', '#818cf8', '#f472b6'];
      const pieces: ConfettiPiece[] = Array.from({ length: 60 }).map((_, i) => ({
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
    if (currentSeq.length >= 10) {
      setGameState('won');
      return;
    }

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
        }, 350);
      }, (index + 1) * 700);
    });

    setTimeout(() => {
      setIsPlayingSequence(false);
    }, (seq.length + 1) * 700);
  };

  const handleKeyClick = (noteIndex: number) => {
    if (isPlayingSequence || gameState !== 'playing') return;

    setActiveNoteIndex(noteIndex);
    playSound(notes[noteIndex].freq);
    setTimeout(() => setActiveNoteIndex(null), 250);

    const updatedPlayerSeq = [...playerSequence, noteIndex];
    setPlayerSequence(updatedPlayerSeq);

    const currentIndex = updatedPlayerSeq.length - 1;

    if (updatedPlayerSeq[currentIndex] !== sequence[currentIndex]) {
      setGameState('gameover');
      return;
    }

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
      <nav className="w-full max-w-4xl mx-auto flex justify-between items-center bg-white px-2.5 py-1 rounded-md shadow-sm border border-stone-200 text-stone-900 shrink-0">
        <h1 className="text-xs sm:text-base font-bold tracking-tight text-stone-900">Piano Memory — Level {currentLevel}</h1>
        <div className="flex gap-1.5">
          <Link href="/games" className="px-2.5 py-0.5 bg-black text-white rounded-md text-[11px] font-semibold transition-colors">Games</Link>
          <Link href="/journal" className="px-2.5 py-0.5 bg-white text-stone-400 hover:text-stone-700 rounded-md text-[11px] font-semibold transition-colors">Journal</Link>
        </div>
      </nav>

      {/* Sound Instruction Banner at Top */}
      <div className="w-full max-w-4xl mx-auto text-center text-[10px] sm:text-[11px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 shrink-0">
        🔊 Make sure your device volume/sound is turned on!
      </div>

      {/* Status Bar */}
      <section className="w-full max-w-4xl mx-auto bg-white px-3 py-0.5 rounded-md shadow-sm border border-stone-200 flex justify-between items-center text-center shrink-0">
        <p className="text-[10px] sm:text-xs text-stone-600 font-normal">Level {currentLevel} of 3</p>
        <p className="text-[10px] sm:text-xs text-stone-600 font-normal">
          Round: <span className="text-stone-900 font-bold">{sequence.length > 0 && gameState === 'playing' ? sequence.length : 0}/10</span>
        </p>
        <p className="text-[10px] sm:text-xs text-stone-600 font-normal">Time: <span className="text-stone-900">{formatTime(timeLeft)}</span></p>
      </section>

      {/* Main Piano Center Container (Takes available space flexibly, no scrolling) */}
      <section className="w-full max-w-4xl mx-auto flex flex-col justify-center items-center gap-1.5 px-0.5 my-auto shrink-0">
        
        {/* Dynamic Controls / Start / Feedback Box */}
        <div className="bg-white px-3 py-1.5 rounded-md shadow-sm border border-stone-200 flex flex-col items-center justify-center w-full max-w-md text-center transition-all duration-300 shrink-0">
          {gameState === 'won' ? (
            <div className="flex flex-col items-center gap-0.5 animate-in fade-in zoom-in duration-300">
              <div className="text-xs sm:text-base font-bold text-stone-900">🎉 Fantastic! You completed 10 rounds!</div>
              <button
                onClick={handleNextLevelTransition}
                className="mt-1 px-3 py-1 bg-stone-900 hover:bg-stone-800 text-white rounded-md text-[11px] font-medium shadow-sm transition-all active:scale-95 cursor-pointer"
              >
                {currentLevel < 3 ? `GO TO LEVEL ${currentLevel + 1}` : 'FINISH & VIEW JOURNAL'}
              </button>
            </div>
          ) : gameState === 'gameover' ? (
            <div className="flex flex-col items-center gap-0.5 animate-in fade-in zoom-in duration-300">
              <div className="text-xs sm:text-sm font-bold text-stone-900">Oh, oh... try again! 🎵</div>
              <button
                onClick={startGame}
                className="mt-1 px-3 py-1 bg-stone-900 hover:bg-stone-800 text-white rounded-md text-[11px] font-medium shadow-sm transition-all active:scale-95 cursor-pointer"
              >
                RETRY LEVEL
              </button>
            </div>
          ) : gameState === 'playing' ? (
            <div className="text-[11px] sm:text-sm font-medium text-stone-800">
              {isPlayingSequence ? '🎵 Listen to the melody...' : '🎹 Your turn! Repeat the melody up to 10 rounds.'}
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <button
                onClick={startGame}
                className="px-4 py-1.5 bg-stone-900 text-white hover:bg-stone-800 rounded-md text-xs sm:text-sm font-medium shadow-sm transition-all active:scale-95 cursor-pointer"
              >
                START LEVEL {currentLevel}
              </button>
            </div>
          )}
        </div>

        {/* Perfectly Fitted Piano Keyboard (Fills exact viewport space without overflowing) */}
        <div className="bg-white p-2 sm:p-4 rounded-xl shadow-sm border border-stone-200 flex gap-1 sm:gap-2.5 w-full justify-center">
          {notes.map((note, index) => (
            <button
              key={note.keyName}
              onClick={() => handleKeyClick(index)}
              className={`flex-1 h-[48vh] sm:h-80 rounded-lg sm:rounded-2xl flex flex-col justify-between items-center pb-2 sm:pb-6 pt-2 sm:pt-5 transition-all shadow-md border-2 border-stone-300 text-white cursor-pointer ${
                activeNoteIndex === index ? `${note.activeColor} scale-95 shadow-inner brightness-110` : `${note.color}`
              }`}
            >
              <span className="text-[11px] sm:text-base opacity-95 font-medium">{note.keyName}</span>
              <span className="text-xs sm:text-2xl font-black">{note.label}</span>
            </button>
          ))}
        </div>

      </section>

      {/* Footer Info */}
      <div className="w-full max-w-4xl mx-auto flex flex-col items-center justify-center shrink-0">
        {sessionWon ? (
          <div className="text-emerald-600 font-normal text-[10px] sm:text-xs bg-white px-2 py-0.5 rounded-md shadow-sm border border-stone-200 animate-bounce">
            Take a rest. You won. Redirecting to Journal...
          </div>
        ) : (
          <div className="text-[10px] sm:text-[11px] text-stone-500 font-light text-center">
            {gameState !== 'playing' ? 'Reach 10 successful rounds to clear the level.' : 'Focus and follow the pattern!'}
          </div>
        )}
      </div>

    </main>
  );
}