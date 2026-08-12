'use client';

import { useState, useEffect } from 'react';
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
]; // Total 100 words

// Comprehensive English language dictionary/thesaurus validation function
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

  // Fallback comprehensive list of common 5-letter English words/thesaurus entries
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

  // Statistics state
  const [totalPoints, setTotalPoints] = useState<number>(0);
  const [gamesPlayed, setGamesPlayed] = useState<number>(0);
  const [gamesWon, setGamesWon] = useState<number>(0);

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

  // Physical keyboard listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isCompletedState) return;
      if (e.key === 'Enter') {
        handleKeyPress('ENTER');
      } else if (e.key === 'Backspace') {
        handleKeyPress('BACKSPACE');
      } else if (/^[a-zA-Z]$/.test(e.key)) {
        handleKeyPress(e.key.toUpperCase());
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentGuess, guesses, gameStatus, activeWord, isCompletedState]);

  const getLetterStatus = (letter: string, index: number, guess: string, target: string) => {
    if (target[index] === letter) {
      return 'bg-[#059669] text-white border-[#059669] shadow-sm'; // Rich accessible green
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
      return 'bg-[#D97706] text-white border-[#D97706] shadow-sm'; // Warm high-contrast amber/orange
    }

    return 'bg-[#475569] text-white border-[#475569] shadow-sm'; // Clean slate grey
  };

  if (!isInitialized) return null;

  const successRate = gamesPlayed > 0 ? Math.round((gamesWon / gamesPlayed) * 100) : 0;
  const showInstructions = currentGlobalLevel <= 5;

  return (
    <main className="h-screen w-screen bg-[#FDFBF7] text-[#0F172A] p-3 md:p-4 flex flex-col justify-between overflow-hidden select-none relative">
      
      {/* Top Header & Navigation - Left Unchanged */}
      <nav className="w-full max-w-4xl mx-auto flex justify-between items-center bg-white px-5 py-2.5 rounded-2xl shadow-sm border border-stone-200 text-stone-900">
        <h1 className="text-lg font-bold tracking-tight text-stone-900">Picture Puzzle — Level {currentGlobalLevel}</h1>
        <div className="flex gap-2">
          <Link href="/games" className="px-4 py-1.5 bg-black text-white rounded-xl text-sm font-semibold transition-colors">Games</Link>
          <Link href="/journal" className="px-4 py-1.5 bg-white text-stone-400 hover:text-stone-700 rounded-xl text-sm font-semibold transition-colors">Journal</Link>
        </div>
      </nav>

      {/* Header & Stats Bar */}
      <section className="w-full max-w-5xl mx-auto bg-white p-3 rounded-2xl shadow-sm border border-[#CBD5E1] grid grid-cols-4 gap-2 text-center">
        <div>
          <p className="text-[11px] uppercase tracking-wider text-[#475569] font-bold">Level</p>
          <h2 className="text-base md:text-lg font-extrabold text-[#0F172A]">{currentGlobalLevel} / 100</h2>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-wider text-[#475569] font-bold">Points</p>
          <p className="text-base md:text-lg font-extrabold text-[#0F172A]">{totalPoints}</p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-wider text-[#475569] font-bold">Wins</p>
          <p className="text-base md:text-lg font-extrabold text-[#0F172A]">{gamesWon}</p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-wider text-[#475569] font-bold">Success Rate</p>
          <p className="text-base md:text-lg font-extrabold text-[#0F172A]">{successRate}%</p>
        </div>
      </section>

      {/* Game Grid Container with Optional Instructions Side-by-Side */}
      <section className={`w-full mx-auto flex flex-col md:flex-row items-center justify-center gap-6 my-auto ${showInstructions ? 'max-w-2xl' : 'max-w-sm'}`}>
        
        {/* Compact Instructions / Legend Panel (Only shown for levels 1 to 5) */}
        {showInstructions && (
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-[#CBD5E1] flex flex-col gap-3 text-xs md:text-sm font-bold text-[#334155] w-full md:w-56 shrink-0 animate-in fade-in duration-200">
            <p className="text-[#0F172A] font-extrabold text-sm border-b border-[#E2E8F0] pb-1.5">How To Play</p>
            <p className="text-xs font-semibold leading-relaxed text-[#1E293B]">Guess the 5-letter word in 6 tries.</p>
            <div className="flex flex-col gap-2.5 pt-1">
              <span className="flex items-center gap-2"><span className="w-4 h-4 rounded-md bg-[#059669] shrink-0"></span>Correct letter & spot</span>
              <span className="flex items-center gap-2"><span className="w-4 h-4 rounded-md bg-[#D97706] shrink-0"></span>Right letter, wrong spot</span>
              <span className="flex items-center gap-2"><span className="w-4 h-4 rounded-md bg-[#475569] shrink-0"></span>Letter not in word</span>
            </div>
          </div>
        )}

        {/* Wordle Board */}
        <div className={`grid grid-rows-6 gap-2 w-full max-w-[280px] md:max-w-[310px] ${isCompletedState ? 'animate-pulse scale-105 transition-transform duration-500' : ''}`}>
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
                  let tileStyle = 'bg-white text-[#0F172A] border-2 border-[#94A3B8] shadow-sm';

                  if (isSubmitted) {
                    tileStyle = getLetterStatus(letter, cIdx, guesses[rIdx], activeWord);
                  } else if (letter) {
                    tileStyle = 'bg-white text-[#0F172A] border-2 border-[#0284C7] shadow-md scale-105';
                  }

                  const isCursorActive = isCurrent && activeColIndex === cIdx;

                  return (
                    <div
                      key={cIdx}
                      className={`h-12 md:h-14 rounded-xl flex items-center justify-center font-black text-xl md:text-2xl transition-all ${tileStyle} ${
                        isCursorActive ? 'border-2 border-[#0284C7] ring-4 ring-[#0284C7]/20' : ''
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

      </section>

      {/* Feedback Message Footer */}
      <div className="w-full max-w-md mx-auto flex flex-col items-center justify-center pb-2 h-10">
        {message ? (
          <div className="text-sm font-bold text-[#0F172A] bg-white px-6 py-2 rounded-xl shadow-sm border border-[#CBD5E1] animate-in fade-in duration-150">
            {message}
          </div>
        ) : (
          <div className="text-xs text-[#334155] font-bold">
            Session Level: <span className="text-[#059669] font-extrabold">{sessionLevelsPlayed + 1} / 3</span>
          </div>
        )}
      </div>

      {/* Success Modal Overlay */}
      {isCompletedState && (
        <div className="absolute inset-0 bg-[#0F172A]/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl border border-[#CBD5E1] flex flex-col items-center text-center animate-in fade-in zoom-in duration-200">
            <h3 className="text-2xl font-bold tracking-tight text-[#0F172A] mb-3">
              {gameStatus === 'won' ? 'Congratulations!' : 'Game Over'}
            </h3>
            
            <p className="text-base font-semibold text-[#334155] mb-6">
              {gameStatus === 'won' ? 'Word guessed successfully!' : `The word was ${activeWord}`}
            </p>

            <div className="text-sm text-[#0F172A] font-bold bg-[#F1F5F9] px-5 py-3 rounded-2xl w-full border border-[#E2E8F0]">
              {gameStatus === 'lost' 
                ? 'Retrying with your last guess carried over...' 
                : sessionLevelsPlayed >= 3 
                  ? 'Session complete! Taking you to Journal...' 
                  : 'Loading next level...'}
            </div>
          </div>
        </div>
      )}

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