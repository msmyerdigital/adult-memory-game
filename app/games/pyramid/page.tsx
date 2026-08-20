'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import confetti from 'canvas-confetti';

export default function MathPyramidGame() {
  const router = useRouter();
  const [currentGlobalLevel, setCurrentGlobalLevel] = useState<number>(1);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  
  const [pyramid, setPyramid] = useState<number[][]>([]);
  const [hiddenMask, setHiddenMask] = useState<boolean[][]>([]);
  const [userInput, setUserInput] = useState<string>('');
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [isWon, setIsWon] = useState<boolean>(false);
  const [isCompletedState, setIsCompletedState] = useState<boolean>(false);
  const [showJournalPrompt, setShowJournalPrompt] = useState<boolean>(false);

  // Statistics state
  const [totalPoints, setTotalPoints] = useState<number>(0);
  const [gamesPlayed, setGamesPlayed] = useState<number>(0);
  const [gamesWon, setGamesWon] = useState<number>(0);

  // Load saved global level and stats from localStorage safely on mount
  useEffect(() => {
    const savedLevel = localStorage.getItem('pyramid_global_level');
    if (savedLevel) {
      const parsed = parseInt(savedLevel, 10);
      if (!isNaN(parsed) && parsed >= 1 && parsed <= 100) {
        setCurrentGlobalLevel(parsed);
      }
    }

    const savedPoints = localStorage.getItem('pyramid_total_points');
    if (savedPoints) setTotalPoints(parseInt(savedPoints, 10) || 0);

    const savedPlayed = localStorage.getItem('pyramid_games_played');
    if (savedPlayed) setGamesPlayed(parseInt(savedPlayed, 10) || 0);

    const savedWon = localStorage.getItem('pyramid_games_won');
    if (savedWon) setGamesWon(parseInt(savedWon, 10) || 0);

    setIsInitialized(true);
  }, []);

  // Setup Math Pyramid board with tougher, longer strings / larger layouts
  const setupBoard = (lvlNum: number) => {
    const useMultiplication = lvlNum > 5;
    
    // Increased pyramid height for a longer, more challenging string of blocks
    const rows = lvlNum <= 5 ? 4 : 5;

    const bottomRowSize = rows;
    const bottomRow: number[] = [];
    
    for (let i = 0; i < bottomRowSize; i++) {
      let maxVal = 8 + Math.floor(lvlNum / 10);
      bottomRow.push(Math.floor(Math.random() * maxVal) + 2);
    }

    const fullPyramid: number[][] = [bottomRow];

    for (let r = 0; r < rows - 1; r++) {
      const currentRow = fullPyramid[r];
      const nextRow: number[] = [];
      for (let i = 0; i < currentRow.length - 1; i++) {
        const isMult = useMultiplication && (i + r) % 2 === 0;
        const val = isMult ? currentRow[i] * currentRow[i + 1] : currentRow[i] + currentRow[i + 1];
        nextRow.push(val);
      }
      fullPyramid.push(nextRow);
    }

    const solvedPyramid = fullPyramid.reverse();

    const mask = solvedPyramid.map((row) => row.map(() => true));
    let hiddenCount = 0;
    
    // Hide more blocks to make it significantly more challenging
    let targetHidden = lvlNum <= 5 ? 4 : 7;

    while (hiddenCount < targetHidden) {
      const r = Math.floor(Math.random() * solvedPyramid.length);
      const c = Math.floor(Math.random() * solvedPyramid[r].length);
      if (mask[r][c]) {
        mask[r][c] = false;
        hiddenCount++;
      }
    }

    setPyramid(solvedPyramid);
    setHiddenMask(mask);
    setSelectedCell(null);
    setUserInput('');
    setIsWon(false);
    setIsCompletedState(false);
  };

  useEffect(() => {
    if (isInitialized) {
      setupBoard(currentGlobalLevel);
    }
  }, [currentGlobalLevel, isInitialized]);

  const playSuccessJingle = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof window.AudioContext }).webkitAudioContext;
      const ctx = new AudioContextClass();

      const notes = [
        { freq: 523.25, time: 0.00, duration: 0.15 },
        { freq: 659.25, time: 0.12, duration: 0.15 },
        { freq: 783.99, time: 0.24, duration: 0.15 },
        { freq: 1046.50, time: 0.36, duration: 0.25 },
        { freq: 1318.51, time: 0.50, duration: 0.40 },
      ];

      notes.forEach((note) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(note.freq, ctx.currentTime + note.time);

        gain.gain.setValueAtTime(0.2, ctx.currentTime + note.time);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + note.time + note.duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + note.time);
        osc.stop(ctx.currentTime + note.time + note.duration);
      });
    } catch {
      // Audio context fallback
    }
  };

  const fireRealisticConfetti = () => {
    const duration = 3.5 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 1000 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval: NodeJS.Timeout = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: ['#2563EB', '#059669', '#D97706', '#DC2626', '#7C3AED']
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: ['#2563EB', '#059669', '#D97706', '#DC2626', '#7C3AED']
      });
    }, 250);
  };

  const revealBoardCascading = (finalMask: boolean[][]) => {
    const coords: { r: number; c: number }[] = [];
    finalMask.forEach((row, r) => {
      row.forEach((cell, c) => {
        if (!hiddenMask[r][c]) {
          coords.push({ r, c });
        }
      });
    });

    coords.sort((a, b) => a.r - b.r);

    coords.forEach((item, index) => {
      setTimeout(() => {
        setHiddenMask((prev) => {
          const updated = prev.map((row) => [...row]);
          updated[item.r][item.c] = true;
          return updated;
        });
      }, index * 120);
    });

    const totalCascadeTime = coords.length * 120 + 300;

    setTimeout(() => {
      setIsCompletedState(true);
      playSuccessJingle();
      fireRealisticConfetti();

      setTimeout(() => {
        setIsWon(true);

        setGamesPlayed((prev) => {
          const updated = prev + 1;
          localStorage.setItem('pyramid_games_played', updated.toString());
          return updated;
        });

        setGamesWon((prev) => {
          const updated = prev + 1;
          localStorage.setItem('pyramid_games_won', updated.toString());
          return updated;
        });

        const levelBonus = currentGlobalLevel * 10;
        const earnedPoints = Math.max(10, levelBonus + 50);

        setTotalPoints((prev) => {
          const updated = prev + earnedPoints;
          localStorage.setItem('pyramid_total_points', updated.toString());
          return updated;
        });

        setTimeout(() => {
          const remainderInBatch = currentGlobalLevel % 4; // Trigger every 4 games
          const isEndOfBatch = remainderInBatch === 0 || currentGlobalLevel === 100;

          const nextLevel = currentGlobalLevel < 100 ? currentGlobalLevel + 1 : 1;
          localStorage.setItem('pyramid_global_level', nextLevel.toString());

          if (isEndOfBatch) {
            setShowJournalPrompt(true);
          } else {
            setCurrentGlobalLevel(nextLevel);
          }
        }, 3500);
      }, 3500);
    }, totalCascadeTime);
  };

  const handleKeyPress = (key: string) => {
    if (!selectedCell || isWon || isCompletedState || showJournalPrompt) return;

    if (/^[0-9]$/.test(key)) {
      const nextInput = userInput + key;
      setUserInput(nextInput);

      const enteredNum = parseInt(nextInput, 10);
      const correctVal = pyramid[selectedCell.row][selectedCell.col];

      if (enteredNum === correctVal) {
        const newMask = hiddenMask.map((row) => [...row]);
        newMask[selectedCell.row][selectedCell.col] = true;
        setHiddenMask(newMask);
        setSelectedCell(null);
        setUserInput('');

        const allRevealed = newMask.every((row) => row.every((cell) => cell));
        if (allRevealed && !isCompletedState) {
          revealBoardCascading(newMask);
        }
      } else if (enteredNum * 10 > correctVal && enteredNum > correctVal) {
        setUserInput('');
      }
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        handleKeyPress(e.key);
      } else if (e.key === 'Backspace' || e.key === 'Delete') {
        if (selectedCell && !isWon && !isCompletedState && !showJournalPrompt) {
          setUserInput((prev) => prev.slice(0, -1));
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedCell, userInput, pyramid, hiddenMask, isWon, isCompletedState, showJournalPrompt]);

  const handleCellClick = (r: number, c: number) => {
    if (isWon || isCompletedState || hiddenMask[r][c] || showJournalPrompt) return;
    setSelectedCell({ row: r, col: c });
    setUserInput('');
  };

  const handlePopupResponse = (responseYes: boolean) => {
    setShowJournalPrompt(false);
    if (responseYes) {
      router.push('/journal');
    } else {
      const nextLevel = currentGlobalLevel < 100 ? currentGlobalLevel + 1 : 1;
      setCurrentGlobalLevel(nextLevel);
    }
  };

  if (!isInitialized) return null;

  const successRate = gamesPlayed > 0 ? Math.round((gamesWon / gamesPlayed) * 100) : 0;

  return (
    <main className="h-dvh w-screen bg-[#F8FAFC] text-[#0F172A] font-sans selection:bg-[#2563EB] selection:text-[#FFFFFF] flex flex-col justify-between overflow-hidden box-border select-none relative p-3">
      
      {/* Pop-up Modal after 4 games */}
      {showJournalPrompt && (
        <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-md w-full text-center shadow-2xl flex flex-col gap-6">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
              You did great today. Do you want to go to your journal or continue the games?
            </h2>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => handlePopupResponse(true)}
                className="flex-1 py-3 bg-[#0284C7] hover:bg-[#0369A1] text-white font-extrabold text-sm uppercase tracking-wider rounded-xl transition shadow-lg"
              >
                Yes
              </button>
              <button
                onClick={() => handlePopupResponse(false)}
                className="flex-1 py-3 bg-slate-200 hover:bg-slate-300 text-slate-800 font-extrabold text-sm uppercase tracking-wider rounded-xl transition shadow-lg border border-slate-300"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating HUD / Overlay Header */}
      <header className="absolute top-0 left-0 right-0 z-30 px-4 py-2 bg-gradient-to-b from-[#F8FAFC] via-[#F8FAFC]/90 to-transparent flex justify-between items-center pointer-events-auto">
        <div className="flex items-center gap-3">
          <Link href="https://freebraingain.vercel.app/" className="flex items-center gap-2 bg-white backdrop-blur-md px-3 py-1 rounded-full border border-slate-200 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#059669]"></span>
            <span className="font-extrabold text-xs tracking-tight text-slate-900">
              Free Brain Gain
            </span>
          </Link>
          <div className="hidden sm:flex items-center gap-2 bg-white backdrop-blur-md px-3 py-1 rounded-full border border-slate-200 text-xs font-bold shadow-sm">
            <span>Level {currentGlobalLevel} / 100</span>
            <span className="text-slate-300">|</span>
            <span>Points: <strong className="text-[#059669]">{totalPoints}</strong></span>
            <span className="text-slate-300">|</span>
            <span>Success: <strong className="text-[#2563EB]">{successRate}%</strong></span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="sm:hidden flex items-center gap-2 bg-white backdrop-blur-md px-2.5 py-1 rounded-full border border-slate-200 text-[11px] font-bold shadow-sm">
            <span>Pts: <strong className="text-[#059669]">{totalPoints}</strong></span>
          </div>
          <Link 
            href="/games" 
            className="px-3 py-1 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-extrabold text-xs uppercase tracking-wider rounded-full transition shadow-md"
          >
            Games
          </Link>
        </div>
      </header>

      {/* Main Game Section */}
      <section className="absolute inset-0 w-full h-full pt-14 pb-36 px-4 z-10 flex flex-col items-center justify-center">
        
        {/* Win Notification Banner Overlay */}
        {isWon && !showJournalPrompt && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-40 bg-white/90 backdrop-blur-md px-6 py-2 rounded-full border border-[#059669]/50 shadow-2xl animate-bounce">
            <span className="text-xs sm:text-sm font-black text-[#059669]">
              🎉 Congratulations! Level complete! Loading next level...
            </span>
          </div>
        )}

        {/* Pyramid Board Container */}
        <div className={`flex flex-col items-center justify-center gap-1.5 w-full max-w-sm bg-white/80 backdrop-blur-xl p-3 sm:p-4 rounded-3xl border border-slate-200 shadow-xl ${isCompletedState ? 'animate-pulse scale-105 transition-transform duration-500' : ''}`}>
          
          <div className="text-center mb-1">
            <h2 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">Math Pyramid (Challenging)</h2>
            <p className="text-[10px] text-slate-500">Adjacent blocks add or multiply to form the block above.</p>
          </div>

          {pyramid.map((row, rIdx) => (
            <div key={rIdx} className="flex gap-1.5 justify-center w-full">
              {row.map((val, cIdx) => {
                const isVisible = hiddenMask[rIdx][cIdx];
                const isSelected = selectedCell?.row === rIdx && selectedCell?.col === cIdx;

                return (
                  <button
                    key={cIdx}
                    onClick={() => handleCellClick(rIdx, cIdx)}
                    className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center font-black text-lg transition-all shadow-sm ${
                      isVisible
                        ? `${isCompletedState ? 'animate-bounce text-white bg-[#059669] border border-[#059669]/50' : 'bg-slate-100 text-slate-800 border border-slate-200'} cursor-default`
                        : isSelected
                        ? 'bg-[#2563EB] text-white ring-4 ring-[#2563EB]/40 scale-105 z-10 shadow-lg animate-bounce'
                        : 'bg-white hover:bg-slate-50 text-slate-900 border-2 border-[#2563EB] cursor-pointer animate-pulse shadow-md'
                    }`}
                  >
                    {isVisible ? val : isSelected && userInput ? userInput : '?'}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

      </section>

      {/* Universal Number Keypad & Footer */}
      <footer className="absolute bottom-0 left-0 right-0 z-30 p-3 bg-gradient-to-t from-[#F8FAFC] via-[#F8FAFC]/90 to-transparent flex flex-col items-center gap-2 pointer-events-auto">
        <div className="w-full max-w-xs grid grid-cols-5 gap-1.5">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((num) => (
            <button
              key={num}
              onClick={() => handleKeyPress(num.toString())}
              disabled={!selectedCell || isWon || isCompletedState || showJournalPrompt}
              className="bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-800 font-extrabold text-base py-2 rounded-xl border border-slate-200 shadow-md transition-all disabled:opacity-30 cursor-pointer"
            >
              {num}
            </button>
          ))}
        </div>

        <div className="flex justify-between items-center w-full max-w-xs px-1 text-[11px] font-bold text-slate-600">
          <span>{isCompletedState ? '✨ Wonderful! Reviewing...' : selectedCell ? 'Type via keypad' : 'Select a cell'}</span>
          <Link href="/games" className="text-[#2563EB] hover:text-blue-700 transition">
            ← Games
          </Link>
        </div>
      </footer>

    </main>
  );
}