'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import confetti from 'canvas-confetti';

const rawTargetWordsList = [
  'TIGER', 'OCEAN', 'PIANO', 'TRAIN', 'MONEY', 
  'GHOST', 'PLUTO', 'NIGHT', 'RADIO', 'BRICK', 
  'STORM', 'CHESS', 'LASER', 'CORAL', 'APPLE',
  'BEACH', 'BREAD', 'CHAIR', 'HOUSE', 'LIGHT',
  'PLANT', 'SMILE', 'WATER', 'SPACE', 'EARTH',
  'CLOUD', 'DANCE', 'FLAME', 'GRAPE', 'HEART',
  'JUICE', 'LEMON', 'MAGIC', 'NOBLE', 'PEARL', 
  'QUEEN', 'ROBOT', 'UPPER', 'VIVID', 'WHEAT', 
  'YOUTH', 'ZEBRA', 'BRAVE', 'CRISP', 'DREAM', 
  'EAGLE', 'FROST', 'GIANT', 'HONEY', 'IVORY', 
  'JOLLY', 'KARMA', 'LUNAR', 'MAPLE', 'NOVEL', 
  'ORBIT', 'PULSE', 'QUILT', 'RADAR', 'SOLAR', 
  'TULIP', 'ULTRA', 'VALOR', 'WHIRL', 'YACHT', 
  'AMBER', 'DELTA', 'ELFIN', 'GLINT', 
  'HAVEN', 'INLET', 'JUMBO', 'KNEEL', 'LATCH', 
  'MANGO', 'NAVAL', 'OASIS', 'PIVOT', 'QUARK', 
  'RIVER', 'SCOUT', 'TANGY', 'UNITE', 'VAPOR', 
  'WAGON', 'XENON', 'YIELD', 'ZONAL', 'BLIMP', 
  'CANDY', 'DOWRY', 'EPOXY', 'CRANE', 'SLATE', 
  'STARE', 'GUIDE', 'MOUSE', 'BOARD', 'SHIRT', 
  'SHARK', 'SMART', 'CLEAN', 'FRESH', 'GREEN', 
  'SMOKE', 'STONE', 'SHINE', 'POWER', 
  'TABLE', 'PAPER', 'TOWER', 'SCOPE', 'FIELD', 
  'BLOOM', 'FLUTE', 'SPEAK', 'SENSE', 'SOUND',
  'CLAY', 'SANDS', 'DUSTS', 'MUDDY', 'SOILS', 
  'FARMS', 'CROPS', 'GRAINS', 'SEEDS', 'BUDS', 
  'STEMS', 'ROOTS', 'VINES', 'LEAVES', 'FERNS', 
  'MOSS', 'WEEDS', 'BUSHES', 'WEEKS', 'MONTHS', 
  'YEARS', 'HOURS', 'DAYS', 'TIMES', 'AGES', 
  'DATES', 'CLOCKS', 'WATCHES', 'NOTES', 'SONGS', 
  'TUNES', 'VOICES', 'SOUNDS', 'WORDS', 'TALES', 
  'FABLES', 'MYTHS', 'JOKES', 'LAUGHS', 'SMILES', 
  'FROWNS', 'TEARS', 'SIGHS', 'CRIES', 'SHADOW', 
  'SPACES', 'ALIENS', 'ROBOTS', 'TECH', 'CHIPS', 
  'WIRES', 'CODES', 'FILES', 'DATA', 'DISKS', 
  'DRIVES', 'CLOUDS', 'NETS', 'WEB', 'LINKS'
];

const targetWordsList = Array.from(
  new Set(rawTargetWordsList.map(w => w.trim().toUpperCase()).filter(w => w.length === 5))
);

const isValidEnglishWord = async (word: string): Promise<boolean> => {
  const cleanWord = word.trim().toLowerCase();
  if (cleanWord.length !== 5) return false;

  const localThesaurus = new Set(targetWordsList);
  if (localThesaurus.has(word.trim().toUpperCase())) {
    return true;
  }

  try {
    const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${cleanWord}`);
    if (response.ok) {
      return true;
    }
  } catch {
    // Fallback if dictionary request fails
  }

  return false;
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
  const [showInstructions, setShowInstructions] = useState<boolean>(true);

  const [totalPoints, setTotalPoints] = useState<number>(0);
  const [gamesPlayed, setGamesPlayed] = useState<number>(0);
  const [gamesWon, setGamesWon] = useState<number>(0);

  const hiddenInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedLevel = localStorage.getItem('word_guesser_global_level');
    let parsedLevel = 1;
    if (savedLevel) {
      const parsed = parseInt(savedLevel, 10);
      if (!isNaN(parsed) && parsed >= 1) {
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

  const selectUniqueWord = useCallback((levelNum: number): string => {
    let usedWords: string[] = [];
    try {
      const savedUsed = localStorage.getItem('wordle_used_words');
      if (savedUsed) usedWords = JSON.parse(savedUsed);
    } catch {
      usedWords = [];
    }

    let available = targetWordsList.filter((w) => !usedWords.includes(w));
    
    if (available.length === 0) {
      usedWords = [];
      available = targetWordsList;
      localStorage.setItem('wordle_used_words', JSON.stringify([]));
    }

    const chosenWord = available[(levelNum - 1) % available.length];
    
    if (!usedWords.includes(chosenWord)) {
      usedWords.push(chosenWord);
      localStorage.setItem('wordle_used_words', JSON.stringify(usedWords));
    }

    return chosenWord;
  }, []);

  const setupBoard = useCallback((lvlNum: number, previousWrongGuesses: string[] = []) => {
    const correctWord = selectUniqueWord(lvlNum);
    
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
  }, [selectUniqueWord]);

  useEffect(() => {
    if (isInitialized) {
      setupBoard(currentGlobalLevel);
    }
  }, [currentGlobalLevel, isInitialized, setupBoard]);

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
      // Fallback
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
      if (timeLeft <= 0) return clearInterval(interval);

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
        setCurrentGuess('');
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

            const nextLevel = currentGlobalLevel + 1;
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

      <header className="w-full px-2 sm:px-6 py-3 flex justify-between items-center z-30 shrink-0">
        <div className="flex items-center gap-3">
          <Link className="flex items-center gap-2 bg-white backdrop-blur-md px-3.5 py-1.5 rounded-full border border-slate-200 shadow-sm" href="https://freebraingain.vercel.app/">
            <span className="w-2.5 h-2.5 rounded-full bg-[#059669]"></span>
            <span className="font-extrabold text-xs tracking-tight text-slate-900">
              Free Brain Gain
            </span>
          </Link>
          <div className="hidden sm:flex items-center gap-2.5 bg-white backdrop-blur-md px-3.5 py-1.5 rounded-full border border-slate-200 text-xs font-bold shadow-sm">
            <span>Level {currentGlobalLevel}</span>
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
          <Link className="px-3.5 py-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-extrabold text-xs uppercase tracking-wider rounded-full transition shadow-md" href="/games">
            Games
          </Link>
        </div>
      </header>

      <section className="w-full max-w-md mx-auto my-auto py-4 px-2 z-10 flex flex-col items-center justify-center relative">
        {showInstructions && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
            <div className="w-full max-w-[340px] sm:max-w-[390px] bg-white backdrop-blur-xl p-5 rounded-3xl border border-slate-200 shadow-2xl flex flex-col gap-3 text-xs text-slate-700">
              <div className="font-black text-slate-900 text-sm uppercase tracking-tight flex items-center justify-between">
                <span>How to Play</span>
                <span className="text-[10px] font-normal text-slate-500">6 tries</span>
              </div>
              <div className="leading-relaxed">
                Guess the 5 letter word and hit <strong className="text-slate-900">Enter</strong>. <span className="inline-block px-1.5 py-0.5 rounded text-white font-bold bg-[#059669]">Green</span> (correct spot), <span className="inline-block px-1.5 py-0.5 rounded text-white font-bold bg-[#D97706]">Yellow</span> (wrong spot), <span className="inline-block px-1.5 py-0.5 rounded text-white font-bold bg-[#94A3B8]">Gray</span> (not in word).
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowInstructions(false);
                }}
                className="w-full py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-black text-xs uppercase tracking-wider rounded-xl transition shadow-md cursor-pointer mt-1"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {isCompletedState && (
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-40 bg-white/95 backdrop-blur-md px-6 py-2.5 rounded-full border border-[#059669]/50 shadow-2xl animate-bounce whitespace-nowrap">
            <span className="text-xs sm:text-sm font-black text-[#059669]">
              {gameStatus === 'won' ? '🎉 Word guessed! Loading next level...' : `The word was ${activeWord}`}
            </span>
          </div>
        )}

        <div className={`flex flex-col items-center justify-center gap-2.5 w-full max-w-[340px] sm:max-w-[390px] bg-white/90 backdrop-blur-xl p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-2xl ${isCompletedState ? 'animate-pulse scale-105 transition-transform duration-500' : ''}`}>
          
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
                        className={`h-11 w-11 sm:h-13 sm:w-13 rounded-2xl flex items-center justify-center font-black text-xl sm:text-2xl transition-all mx-auto ${tileStyle} ${
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

      <footer className="w-full max-w-md mx-auto p-4 z-30 flex justify-between items-center text-xs font-bold text-slate-600 shrink-0">
        <span>{message || `Session Level: ${sessionLevelsPlayed + 1} / 3`}</span>
        <Link className="text-[#2563EB] hover:text-blue-700 transition" href="/games">
          ← Games
        </Link>
      </footer>

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