'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import confetti from 'canvas-confetti';

const targetWordsList = [
  'TIGER', 'OCEAN', 'PIANO', 'TRAIN', 'MONEY', 
  'GHOST', 'PLUTO', 'NIGHT', 'RADIO', 'BRICK', 
  'STORM', 'CHESS', 'LASER', 'CORAL', 'APPLE',
  'BEACH', 'BREAD', 'CHAIR', 'HOUSE', 'LIGHT',
  'PLANT', 'SMILE', 'WATER', 'SPACE', 'EARTH',
  'CLOUD', 'DANCE', 'FLAME', 'GRAPE', 'HEART',
  'JUICE', 'KLEIN', 'LEMON', 'MAGIC', 'NOBLE',
  'PEARL', 'QUEEN', 'ROBOT', 'SMILE', 'TRAIN',
  'UPPER', 'VIVID', 'WHEAT', 'YOUTH', 'ZEBRA',
  'BRAVE', 'CRISP', 'DREAM', 'EAGLE', 'FROST',
  'GIANT', 'HONEY', 'IVORY', 'JOLLY', 'KARMA',
  'LUNAR', 'MAPLE', 'NOVEL', 'ORBIT', 'PULSE',
  'QUILT', 'RADAR', 'SOLAR', 'TULIP', 'ULTRA',
  'VALOR', 'WHIRL', 'XEROX', 'YACHT', 'ZENITH',
  'AMBER', 'BLAZO', 'CORAL', 'DELTA', 'ELFIN',
  'FERRN', 'GLINT', 'HAVEN', 'INLET', 'JUMBO',
  'KNEEL', 'LATCH', 'MANGO', 'NAVAL', 'OASIS',
  'PIVOT', 'QUARK', 'RIVER', 'SCOUT', 'TANGY',
  'UNITE', 'VAPOR', 'WAGON', 'XENON', 'YIELD',
  'ZONAL', 'BLIMP', 'CANDY', 'DOWRY', 'EPOXY'
];

const isValidEnglishWord = async (word: string): Promise<boolean> => {
  const cleanWord = word.trim().toLowerCase();
  if (cleanWord.length !== 5) return false;

  try {
    const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${cleanWord}`);
    if (response.ok) {
      return true;
    }
  } catch {
    // Fallback if network request fails
  }

  const localThesaurus = new Set([
    'TIGER', 'OCEAN', 'PIANO', 'TRAIN', 'MONEY', 'GHOST', 'PLUTO', 'NIGHT', 'RADIO', 'BRICK', 
    'STORM', 'CHESS', 'LASER', 'CORAL', 'APPLE', 'BEACH', 'BREAD', 'CHAIR', 'HOUSE', 'LIGHT',
    'PLANT', 'SMILE', 'WATER', 'SPACE', 'EARTH', 'CLOUD', 'DANCE', 'FLAME', 'GRAPE', 'HEART',
    'JUICE', 'LEMON', 'MAGIC', 'NOBLE', 'PEARL', 'QUEEN', 'ROBOT', 'UPPER', 'VIVID', 'WHEAT', 
    'YOUTH', 'ZEBRA', 'BRAVE', 'CRISP', 'DREAM', 'EAGLE', 'FROST', 'GIANT', 'HONEY', 'IVORY', 
    'JOLLY', 'KARMA', 'LUNAR', 'MAPLE', 'NOVEL', 'ORBIT', 'PULSE', 'QUILT', 'RADAR', 'SOLAR', 
    'TULIP', 'ULTRA', 'VALOR', 'WHIRL', 'YACHT', 'ZENITH', 'AMBER', 'DELTA', 'ELFIN', 'GLINT', 
    'HAVEN', 'INLET', 'JUMBO', 'KNEEL', 'LATCH', 'MANGO', 'NAVAL', 'OASIS', 'PIVOT', 'QUARK', 
    'RIVER', 'SCOUT', 'TANGY', 'UNITE', 'VAPOR', 'WAGON', 'XENON', 'YIELD', 'ZONAL', 'BLIMP', 
    'CANDY', 'DOWRY', 'EPOXY', 'CRANE', 'SLATE', 'STARE', 'GUIDE', 'MOUSE', 'BOARD', 'SHIRT', 
    'SHARK', 'SMART', 'CLEAN', 'FRESH', 'GREEN', 'SMOKE', 'STONE', 'BRIGHT', 'SHINE', 'POWER', 
    'TABLE', 'PAPER', 'TOWER', 'SCOPE', 'FIELD', 'BLOOM', 'FLUTE', 'SPEAK', 'SENSE', 'SOUND'
  ]);

  return localThesaurus.has(word.toUpperCase());
};

export default function WordGuesserGame() {
  const router = useRouter();
  const [currentGlobalLevel, setCurrentGlobalLevel] = useState<number>(1);
  const [sessionLevelsPlayed, setSessionLevelsPlayed] = useState<number>(0);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  
  const [activeWord, setActiveWord] = useState<string>('TIGER');
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState<string>('');
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost'>('playing');
  const [message, setMessage] = useState<string | null>(null);
  const [isCompletedState, setIsCompletedState] = useState<boolean>(false);
  const [activeColIndex, setActiveColIndex] = useState<number>(0);
  const [shakingRow, setShakingRow] = useState<number | null>(null);

  const [totalPoints, setTotalPoints] = useState<number>(0);
  const [gamesPlayed, setGamesPlayed] = useState<number>(0);
  const [gamesWon, setGamesWon] = useState<number>(0);

  const hiddenInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedLevel = localStorage.getItem('word_guesser_global_level');
    let parsedLevel = 1;
    if (savedLevel) {
      const parsed = parseInt(savedLevel, 10);
      if (!isNaN(parsed) && parsed >= 1 && parsed <= 100) {
        parsedLevel = parsed;
      }
    }
    setCurrentGlobalLevel(parsedLevel);

    const savedPoints = localStorage.getItem('wordle_total_points');
    if (savedPoints) setTotalPoints(parseInt(savedPoints, 10) || 0);

    const savedPlayed = localStorage.getItem('wordle_games_played');
    if (savedPlayed) setGamesPlayed(parseInt(savedPlayed, 10) || 0);

    const savedWon = localStorage.getItem('wordle_games_won');
    if (savedWon) setGamesWon(parseInt(savedWon, 10) || 0);

    setIsInitialized(true);
  }, []);

  const setupBoard = (lvlNum: number, previousWrongGuesses: string[] = []) => {
    const correctWord = targetWordsList[(lvlNum - 1) % targetWordsList.length];
    
    setActiveWord(correctWord);
    setGuesses(previousWrongGuesses);
    setCurrentGuess('');
    setGameStatus('playing');
    setMessage(null);
    setIsCompletedState(false);
    setActiveColIndex(0);
    setShakingRow(null);
    if (hiddenInputRef.current) {
      hiddenInputRef.current.focus();
    }
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
      // Audio fallback
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
        colors: ['#2563EB', '#059669', '#D97706', '#3B82F6', '#10B981', '#F59E0B']
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: ['#2563EB', '#059669', '#D97706', '#3B82F6', '#10B981', '#F59E0B']
      });
    }, 250);
  };

  const triggerShake = (rowIndex: number) => {
    setShakingRow(rowIndex);
    setTimeout(() => setShakingRow(null), 500);
  };

  const recordGamePlayed = (isWin: boolean) => {
    const newSessionCount = sessionLevelsPlayed + 1;
    setSessionLevelsPlayed(newSessionCount);

    setGamesPlayed((prev) => {
      const updated = prev + 1;
      localStorage.setItem('wordle_games_played', updated.toString());
      return updated;
    });

    if (isWin) {
      setGamesWon((prev) => {
        const updated = prev + 1;
        localStorage.setItem('wordle_games_won', updated.toString());
        return updated;
      });

      const levelBonus = currentGlobalLevel * 10;
      const earnedPoints = Math.max(10, levelBonus + 50);

      setTotalPoints((prev) => {
        const updated = prev + earnedPoints;
        localStorage.setItem('wordle_total_points', updated.toString());
        return updated;
      });
    }

    return newSessionCount;
  };

  const handleKeyPress = async (key: string) => {
    if (gameStatus !== 'playing' || isCompletedState) return;

    const currentRowIndex = guesses.length;

    if (key === 'BACKSPACE') {
      if (currentGuess.length > 0) {
        const newLen = currentGuess.length - 1;
        setCurrentGuess((prev) => prev.slice(0, -1));
        setActiveColIndex(newLen);
        setMessage(null);
      }
      return;
    }

    if (key === 'ENTER') {
      if (currentGuess.length !== 5) {
        setMessage('Not enough letters');
        triggerShake(currentRowIndex);
        return;
      }

      const isValid = await isValidEnglishWord(currentGuess);
      if (!isValid) {
        setMessage('Misspelled word');
        triggerShake(currentRowIndex);
        setCurrentGuess(''); // Erases misspelled word so it doesn't get logged as a row attempt
        setActiveColIndex(0);
        return;
      }

      if (guesses.includes(currentGuess)) {
        setMessage('Word already guessed');
        triggerShake(currentRowIndex);
        return;
      }

      const newGuesses = [...guesses, currentGuess];
      setGuesses(newGuesses);
      setCurrentGuess('');
      setActiveColIndex(0);
      setMessage(null);

      if (currentGuess === activeWord) {
        setGameStatus('won');
        setIsCompletedState(true);
        playSuccessJingle();
        fireRealisticConfetti();

        const updatedCount = recordGamePlayed(true);

        setTimeout(() => {
          setTimeout(() => {
            if (updatedCount >= 3) {
              router.push('/journal');
              return;
            }

            const nextLevel = currentGlobalLevel < 100 ? currentGlobalLevel + 1 : 1;
            setCurrentGlobalLevel(nextLevel);
            localStorage.setItem('word_guesser_global_level', nextLevel.toString());
          }, 3500);
        }, 1000);

        return;
      } else if (newGuesses.length >= 6) {
        setGameStatus('lost');
        setIsCompletedState(true);
        setMessage(`Out of tries! The word was ${activeWord}`);
        
        const updatedCount = recordGamePlayed(false);

        setTimeout(() => {
          setTimeout(() => {
            if (updatedCount >= 3) {
              router.push('/journal');
              return;
            }

            const lastTry = newGuesses[newGuesses.length - 1];
            setupBoard(currentGlobalLevel, [lastTry]);
          }, 3500);
        }, 1000);

        return;
      }
      return;
    }

    if (/^[A-Z]$/.test(key) && currentGuess.length < 5) {
      const nextLen = currentGuess.length + 1;
      setCurrentGuess((prev) => prev + key);
      setActiveColIndex(nextLen < 5 ? nextLen : 4);
      setMessage(null);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toUpperCase();
    if (val.length === 0) {
      handleKeyPress('BACKSPACE');
    } else {
      const lastChar = val[val.length - 1];
      if (/^[A-Z]$/.test(lastChar)) {
        handleKeyPress(lastChar);
      }
    }
    if (hiddenInputRef.current) {
      hiddenInputRef.current.value = '';
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleKeyPress('ENTER');
    } else if (e.key === 'Backspace') {
      handleKeyPress('BACKSPACE');
    }
  };

  const triggerFocusKeyboard = () => {
    if (hiddenInputRef.current) {
      hiddenInputRef.current.focus();
    }
  };

  const getLetterStatus = (letter: string, index: number, guess: string, target: string) => {
    if (target[index] === letter) {
      return 'bg-[#059669] text-white border-[#059669] shadow-sm';
    }

    let targetCount = 0;
    let guessIndexMatchCount = 0;

    for (let i = 0; i < target.length; i++) {
      if (target[i] === letter) targetCount++;
      if (guess[i] === letter && target[i] === letter) guessIndexMatchCount++;
    }

    let precedingInstancesInGuess = 0;
    for (let i = 0; i < index; i++) {
      if (guess[i] === letter) precedingInstancesInGuess++;
    }

    const availableYellowsCount = targetCount - guessIndexMatchCount;

    if (target.includes(letter) && precedingInstancesInGuess < availableYellowsCount) {
      return 'bg-[#D97706] text-white border-[#D97706] shadow-sm';
    }

    return 'bg-[#94A3B8] text-white border-[#94A3B8] shadow-sm';
  };

  if (!isInitialized) return null;

  const successRate = gamesPlayed > 0 ? Math.round((gamesWon / gamesPlayed) * 100) : 0;

  return (
    <main 
      className="min-h-dvh w-full bg-[#F8FAFC] text-[#0F172A] font-sans selection:bg-[#2563EB] selection:text-[#FFFFFF] flex flex-col justify-between box-border select-none relative p-4 cursor-text overflow-y-auto"
      onClick={triggerFocusKeyboard}
    >
      
      {/* Hidden input to trigger native mobile keyboard */}
      <input
        ref={hiddenInputRef}
        type="text"
        className="absolute opacity-0 pointer-events-none h-0 w-0"
        onChange={handleInputChange}
        onKeyDown={handleInputKeyDown}
        autoFocus
        autoComplete="off"
        autoCorrect="off"
        spellCheck="false"
      />

      {/* Responsive Header */}
      <header className="w-full px-2 sm:px-6 py-3 flex justify-between items-center z-30 shrink-0">
        <div className="flex items-center gap-3">
          <Link href="https://freebraingain.vercel.app/" className="flex items-center gap-2 bg-white backdrop-blur-md px-3.5 py-1.5 rounded-full border border-slate-200 shadow-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-[#059669]"></span>
            <span className="font-extrabold text-xs tracking-tight text-slate-900">
              Free Brain Gain
            </span>
          </Link>
          <div className="hidden sm:flex items-center gap-2.5 bg-white backdrop-blur-md px-3.5 py-1.5 rounded-full border border-slate-200 text-xs font-bold shadow-sm">
            <span>Level {currentGlobalLevel} / 100</span>
            <span className="text-slate-300">|</span>
            <span>Points: <strong className="text-[#059669]">{totalPoints}</strong></span>
            <span className="text-slate-300">|</span>
            <span>Success: <strong className="text-[#2563EB]">{successRate}%</strong></span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="sm:hidden flex items-center gap-2 bg-white backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-200 text-xs font-bold shadow-sm">
            <span>Pts: <strong className="text-[#059669]">{totalPoints}</strong></span>
          </div>
          <Link 
            href="/games" 
            className="px-3.5 py-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-extrabold text-xs uppercase tracking-wider rounded-full transition shadow-md"
          >
            Games
          </Link>
        </div>
      </header>

      {/* Main Game Content Centered with flexible margins to avoid mobile keyboard overlaps */}
      <section className="w-full max-w-md mx-auto my-auto py-6 px-2 z-10 flex flex-col items-center justify-center relative">
        
        {/* Win / Feedback Banner Overlay */}
        {isCompletedState && (
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-40 bg-white/95 backdrop-blur-md px-6 py-2.5 rounded-full border border-[#059669]/50 shadow-2xl animate-bounce whitespace-nowrap">
            <span className="text-xs sm:text-sm font-black text-[#059669]">
              {gameStatus === 'won' ? '🎉 Word guessed! Loading next level...' : `The word was ${activeWord}`}
            </span>
          </div>
        )}

        {/* Wordle Board Container */}
        <div className={`flex flex-col items-center justify-center gap-2.5 w-full max-w-[340px] sm:max-w-[390px] bg-white/90 backdrop-blur-xl p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-2xl ${isCompletedState ? 'animate-pulse scale-105 transition-transform duration-500' : ''}`}>
          
          <div className="text-center mb-1">
            <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">Word Guesser</h2>
            <p className="text-xs text-slate-500">Tap anywhere to type with your keyboard</p>
          </div>

          <div className="grid grid-rows-6 gap-2 w-full">
            {Array.from({ length: 6 }).map((_, rIdx) => {
              const isSubmitted = rIdx < guesses.length;
              const isCurrent = rIdx === guesses.length;
              const guessWord = isSubmitted ? guesses[rIdx] : isCurrent ? currentGuess : '';
              const isWinningRow = gameStatus === 'won' && guesses[rIdx] === activeWord;
              const isRowShaking = shakingRow === rIdx;

              return (
                <div 
                  key={rIdx} 
                  className={`grid grid-cols-5 gap-2 ${isRowShaking ? 'animate-[shake_0.4s_ease-in-out]' : ''}`}
                >
                  {Array.from({ length: 5 }).map((_, cIdx) => {
                    const letter = guessWord[cIdx] || '';
                    let tileStyle = 'bg-white text-slate-900 border-2 border-slate-300 shadow-sm';

                    if (isSubmitted) {
                      tileStyle = getLetterStatus(letter, cIdx, guesses[rIdx], activeWord);
                    } else if (letter) {
                      tileStyle = 'bg-white text-slate-900 border-2 border-[#2563EB] shadow-md scale-105';
                    }

                    const isCursorActive = isCurrent && activeColIndex === cIdx;

                    return (
                      <div
                        key={cIdx}
                        className={`h-12 w-12 sm:h-14 sm:w-14 rounded-2xl flex items-center justify-center font-black text-2xl sm:text-3xl transition-all mx-auto ${tileStyle} ${
                          isCursorActive ? 'border-2 border-[#2563EB] ring-4 ring-[#2563EB]/20' : ''
                        } ${isWinningRow && isCompletedState ? 'animate-bounce opacity-95 scale-105' : ''}`}
                      >
                        {letter}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>

        </div>

      </section>

      {/* Footer / Status bar */}
      <footer className="w-full max-w-md mx-auto p-4 z-30 flex justify-between items-center text-xs font-bold text-slate-600 shrink-0">
        <span>{message || `Session Level: ${sessionLevelsPlayed + 1} / 3`}</span>
        <Link href="/games" className="text-[#2563EB] hover:text-blue-700 transition">
          ← Games
        </Link>
      </footer>

      {/* Tailwind keyframes for error shake animation */}
      <style jsx global>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-6px); }
          40%, 80% { transform: translateX(6px); }
        }
      `}</style>

    </main>
  );
}