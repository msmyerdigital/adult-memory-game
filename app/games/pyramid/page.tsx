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

  // Setup Math Pyramid board
  const setupBoard = (lvlNum: number) => {
    const isFirstFour = lvlNum <= 4;
    const useMultiplication = lvlNum > 10;
    
    const rows = lvlNum <= 10 ? 3 : 4;

    const bottomRowSize = rows;
    const bottomRow: number[] = [];
    
    for (let i = 0; i < bottomRowSize; i++) {
      let maxVal = 5;
      if (isFirstFour) {
        maxVal = 3 + lvlNum;
      } else if (lvlNum <= 10) {
        maxVal = 6;
      } else if (lvlNum <= 40) {
        maxVal = 7;
      } else {
        maxVal = 9;
      }
      bottomRow.push(Math.floor(Math.random() * maxVal) + 1);
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
    
    let targetHidden = 2;
    if (lvlNum > 4 && lvlNum <= 10) targetHidden = 3;
    else if (lvlNum > 10 && lvlNum <= 40) targetHidden = 4;
    else if (lvlNum > 40) targetHidden = 5;

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
        colors: ['#0F172A', '#0284C7', '#059669', '#3B82F6', '#10B981', '#F59E0B']
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: ['#0F172A', '#0284C7', '#059669', '#3B82F6', '#10B981', '#F59E0B']
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
          const remainderInBatch = currentGlobalLevel % 3;
          const isEndOfBatch = remainderInBatch === 0 || currentGlobalLevel === 100;

          if (isEndOfBatch) {
            const nextLevel = currentGlobalLevel < 100 ? currentGlobalLevel + 1 : 1;
            localStorage.setItem('pyramid_global_level', nextLevel.toString());
            router.push('/journal');
          } else {
            const nextLevel = currentGlobalLevel + 1;
            setCurrentGlobalLevel(nextLevel);
            localStorage.setItem('pyramid_global_level', nextLevel.toString());
          }
        }, 3500);
      }, 3500);
    }, totalCascadeTime);
  };

  const handleKeyPress = (key: string) => {
    if (!selectedCell || isWon || isCompletedState) return;

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
        if (selectedCell && !isWon && !isCompletedState) {
          setUserInput((prev) => prev.slice(0, -1));
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedCell, userInput, pyramid, hiddenMask, isWon, isCompletedState]);

  const handleCellClick = (r: number, c: number) => {
    if (isWon || isCompletedState || hiddenMask[r][c]) return;
    setSelectedCell({ row: r, col: c });
    setUserInput('');
  };

  if (!isInitialized) return null;

  const successRate = gamesPlayed > 0 ? Math.round((gamesWon / gamesPlayed) * 100) : 0;

  return (
    <main className="h-[100dvh] w-screen max-w-[430px] mx-auto bg-[#FDFBF7] text-[#0F172A] p-2 flex flex-col justify-between overflow-hidden select-none relative box-border">
      
      {/* Top Header & Navigation */}
      <nav className="w-full flex justify-between items-center bg-white px-3 py-1.5 rounded-xl shadow-sm border border-stone-200 text-stone-900 shrink-0">
        <h1 className="text-xs font-normal tracking-tight text-stone-900">Math Pyramid - Level {currentGlobalLevel}</h1>
        <div className="flex gap-1.5">
          <Link href="/games" className="px-2.5 py-0.5 bg-black text-white rounded-lg text-xs font-normal transition-colors">Games</Link>
          <Link href="/journal" className="px-2.5 py-0.5 bg-white text-stone-400 hover:text-stone-700 rounded-lg text-xs font-normal transition-colors">Journal</Link>
        </div>
      </nav>

      {/* Header & Stats Bar */}
      <section className="w-full bg-white p-2 rounded-xl shadow-sm border border-[#CBD5E1] grid grid-cols-4 gap-1 text-center shrink-0">
        <div>
          <p className="text-[9px] uppercase tracking-wider text-[#475569] font-normal">Level</p>
          <h2 className="text-xs font-normal text-[#0F172A]">{currentGlobalLevel} / 100</h2>
        </div>
        <div>
          <p className="text-[9px] uppercase tracking-wider text-[#475569] font-normal">Points</p>
          <p className="text-xs font-normal text-[#0F172A]">{totalPoints}</p>
        </div>
        <div>
          <p className="text-[9px] uppercase tracking-wider text-[#475569] font-normal">Wins</p>
          <p className="text-xs font-normal text-[#0F172A]">{gamesWon}</p>
        </div>
        <div>
          <p className="text-[9px] uppercase tracking-wider text-[#475569] font-normal">Success</p>
          <p className="text-xs font-normal text-[#0F172A]">{successRate}%</p>
        </div>
      </section>

      {/* Pyramid Container - Expanded for Mobile Portrait */}
      <section className="w-full flex-1 flex flex-col items-center justify-center my-1 shrink-0">
        <div className={`flex flex-col items-center justify-center gap-3 w-full h-full bg-white p-4 rounded-2xl border border-[#CBD5E1] shadow-sm ${isCompletedState ? 'animate-pulse scale-105 transition-transform duration-500' : ''}`}>
          {pyramid.map((row, rIdx) => (
            <div key={rIdx} className="flex gap-3 justify-center w-full">
              {row.map((val, cIdx) => {
                const isVisible = hiddenMask[rIdx][cIdx];
                const isSelected = selectedCell?.row === rIdx && selectedCell?.col === cIdx;

                return (
                  <button
                    key={cIdx}
                    onClick={() => handleCellClick(rIdx, cIdx)}
                    className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center font-normal text-2xl sm:text-3xl transition-all shadow-sm ${
                      isVisible
                        ? `${isCompletedState ? 'animate-bounce text-white bg-[#059669] border-[#059669]' : 'bg-[#F1F5F9] text-[#0F172A] border border-[#CBD5E1]'} cursor-default`
                        : isSelected
                        ? 'bg-[#0F172A] text-white ring-4 ring-[#0F172A]/25 scale-105 z-10 shadow-md animate-bounce'
                        : 'bg-white text-[#0F172A] border-2 border-[#0284C7] hover:bg-stone-50 cursor-pointer animate-pulse shadow-sm'
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

      {/* Universal Number Keypad */}
      <section className="w-full grid grid-cols-5 gap-1.5 shrink-0 my-1">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((num) => (
          <button
            key={num}
            onClick={() => handleKeyPress(num.toString())}
            disabled={!selectedCell || isWon || isCompletedState}
            className="bg-white hover:bg-stone-100 active:bg-stone-200 text-[#0F172A] font-normal text-lg py-2.5 rounded-xl border border-[#CBD5E1] shadow-sm transition-all disabled:opacity-40 cursor-pointer"
          >
            {num}
          </button>
        ))}
      </section>

      {/* Footer Status Message */}
      <div className="w-full flex flex-col items-center justify-center pb-1 shrink-0">
        <div className="text-[11px] font-normal text-[#0F172A] bg-white px-3 py-1 rounded-xl shadow-sm border border-[#CBD5E1] text-center w-full">
          {isCompletedState ? '✨ Wonderful! Reviewing completed board...' : selectedCell ? 'Type a number using the keypad below' : 'Use addition and multiplication to solve the pyramid!'}
        </div>
      </div>

      {/* Success Modal Overlay */}
      {isWon && (
        <div className="absolute inset-0 bg-[#0F172A]/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl border border-[#CBD5E1] flex flex-col items-center text-center animate-in fade-in zoom-in duration-200">
            <h3 className="text-2xl font-normal tracking-tight text-[#0F172A] mb-3">Congratulations!</h3>
            
            <p className="text-base font-normal text-[#334155] mb-6">
              Pyramid solved successfully!
            </p>

            <div className="text-sm text-[#0F172A] font-normal bg-[#F1F5F9] px-5 py-3 rounded-2xl w-full border border-[#E2E8F0]">
              {currentGlobalLevel % 3 === 0 || currentGlobalLevel === 100 
                ? 'Session complete! Taking you to Journal...' 
                : 'Loading next level...'}
            </div>
          </div>
        </div>
      )}

    </main>
  );
}