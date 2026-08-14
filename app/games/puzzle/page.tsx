'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface LevelConfig {
  levelNumber: number;
  piecesCount: number;
  gridClass: string;
  cols: number;
  rows: number;
  title: string;
  landscapeUrl: string;
  portraitUrl: string;
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

const allLevelsData: LevelConfig[] = Array.from({ length: 100 }, (_, i) => {
  const lvl = i + 1;
  let piecesCount = 6;
  let gridClass = 'grid-cols-3 grid-rows-2';
  let cols = 3;
  let rows = 2;

  if (lvl === 1) {
    piecesCount = 6;
    gridClass = 'grid-cols-3 grid-rows-2';
    cols = 3;
    rows = 2;
  } else {
    const progressiveCount = 6 + Math.floor(((lvl - 1) / 99) * 6);
    piecesCount = Math.min(progressiveCount, 12);
    
    if (piecesCount <= 6) {
      cols = 3;
      rows = 2;
      gridClass = 'grid-cols-3 grid-rows-2';
    } else if (piecesCount === 8) {
      cols = 4;
      rows = 2;
      gridClass = 'grid-cols-4 grid-rows-2';
    } else if (piecesCount === 9) {
      cols = 3;
      rows = 3;
      gridClass = 'grid-cols-3 grid-rows-3';
    } else if (piecesCount === 10) {
      cols = 5;
      rows = 2;
      gridClass = 'grid-cols-5 grid-rows-2';
    } else if (piecesCount === 12) {
      cols = 4;
      rows = 3;
      gridClass = 'grid-cols-4 grid-rows-3';
    } else {
      cols = 4;
      rows = Math.ceil(piecesCount / cols);
      gridClass = `grid-cols-4 grid-rows-${rows}`;
    }
  }

  const imageIds = [
    1025, 1074, 582, 659, 824, 
    1015, 1041, 1084, 119, 133, 177, 219, 
    64, 433, 517, 888, 912, 1043, 1062, 
  ];
  const imageId = imageIds[(lvl - 1) % imageIds.length];

  return {
    levelNumber: lvl,
    piecesCount,
    gridClass,
    cols,
    rows,
    title: `Level ${lvl} of 100`,
    landscapeUrl: `https://picsum.photos/id/${imageId}/1400/900`,
    portraitUrl: `https://picsum.photos/id/${imageId}/900/1400`,
  };
});

export default function PuzzleGame() {
  const router = useRouter();
  const [currentGlobalLevel, setCurrentGlobalLevel] = useState<number>(1);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [grid, setGrid] = useState<number[]>([]);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [moves, setMoves] = useState<number>(0);
  const [isWon, setIsWon] = useState<boolean>(false);
  
  const [secondsElapsed, setSecondsElapsed] = useState<number>(0);
  const [confettiPieces, setConfettiPieces] = useState<ConfettiPiece[]>([]);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    const savedLevel = localStorage.getItem('puzzle_global_level');
    if (savedLevel) {
      const parsed = parseInt(savedLevel, 10);
      if (!isNaN(parsed) && parsed >= 1 && parsed <= 100) {
        setCurrentGlobalLevel(parsed);
      }
    }
    setIsInitialized(true);

    return () => {
      window.removeEventListener('resize', checkScreenSize);
      if (timerRef.current) clearTimeout(timerRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  useEffect(() => {
    if (isInitialized && !isWon) {
      intervalRef.current = setInterval(() => {
        setSecondsElapsed((prev) => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isInitialized, isWon]);

  useEffect(() => {
    if (isWon) {
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
  }, [isWon]);

  const setupBoard = useCallback((lvlNum: number) => {
    const config = allLevelsData[lvlNum - 1];
    const totalSlots = config.cols * config.rows;
    let initial = Array.from({ length: totalSlots }, (_, i) => i);
    
    for (let i = initial.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [initial[i], initial[j]] = [initial[j], initial[i]];
    }

    if (initial.every((val, idx) => val === idx)) {
      [initial[0], initial[1]] = [initial[1], initial[0]];
    }

    setGrid(initial);
    setSelectedIdx(null);
    setMoves(0);
    setSecondsElapsed(0);
    setIsWon(false);
  }, []);

  useEffect(() => {
    if (isInitialized) {
      setupBoard(currentGlobalLevel);
    }
  }, [currentGlobalLevel, isInitialized, setupBoard]);

  const playSuccessJingle = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof window.AudioContext }).webkitAudioContext;
      const ctx = new AudioContextClass();

      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.12);

        gain.gain.setValueAtTime(0.15, ctx.currentTime + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.12 + 0.3);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + idx * 0.12);
        osc.stop(ctx.currentTime + idx * 0.12 + 0.3);
      });
    } catch {
      // Audio fallback
    }
  };

  const handleWinSequence = useCallback((newGrid: number[]) => {
    const hasWon = newGrid.every((val, idx) => val === idx);
    if (hasWon) {
      setIsWon(true);
      playSuccessJingle();

      timerRef.current = setTimeout(() => {
        const remainderInBatch = currentGlobalLevel % 3;
        const isEndOfBatch = remainderInBatch === 0 || currentGlobalLevel === 100;

        if (isEndOfBatch) {
          const nextLevel = currentGlobalLevel < 100 ? currentGlobalLevel + 1 : 1;
          localStorage.setItem('puzzle_global_level', nextLevel.toString());
          router.push('/journal');
        } else {
          const nextLevel = currentGlobalLevel + 1;
          setCurrentGlobalLevel(nextLevel);
          localStorage.setItem('puzzle_global_level', nextLevel.toString());
        }
      }, 2200);
    }
  }, [currentGlobalLevel, router]);

  const handlePieceClick = (clickedIdx: number) => {
    if (isWon) return;

    if (selectedIdx === null) {
      setSelectedIdx(clickedIdx);
    } else {
      const newGrid = [...grid];
      [newGrid[selectedIdx], newGrid[clickedIdx]] = [newGrid[clickedIdx], newGrid[selectedIdx]];
      
      setGrid(newGrid);
      setSelectedIdx(null);
      setMoves((prev) => prev + 1);

      handleWinSequence(newGrid);
    }
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetIdx: number) => {
    e.preventDefault();
    if (isWon) return;
    const sourceIdxStr = e.dataTransfer.getData('text/plain');
    if (sourceIdxStr === '') return;
    const sourceIdx = parseInt(sourceIdxStr, 10);

    if (sourceIdx === targetIdx) return;

    const newGrid = [...grid];
    [newGrid[sourceIdx], newGrid[targetIdx]] = [newGrid[targetIdx], newGrid[sourceIdx]];
    
    setGrid(newGrid);
    setSelectedIdx(null);
    setMoves((prev) => prev + 1);

    handleWinSequence(newGrid);
  };

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (!isInitialized) return null;

  const config = allLevelsData[currentGlobalLevel - 1];
  const totalCols = config.cols;
  const totalRows = config.rows;
  const activeImageUrl = isMobile ? config.portraitUrl : config.landscapeUrl;

  return (
    <main className="h-dvh w-screen bg-[#0F172A] text-[#F8FAFC] font-sans selection:bg-[#2563EB] selection:text-[#FFFFFF] flex flex-col justify-between overflow-hidden box-border select-none relative">
      
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

      {/* Floating HUD / Overlay Header */}
      <header className="absolute top-0 left-0 right-0 z-30 px-4 py-2 bg-gradient-to-b from-black/80 via-black/40 to-transparent flex justify-between items-center pointer-events-auto">
        <div className="flex items-center gap-3">
          <Link href="https://freebraingain.vercel.app/" className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
            <span className="w-2 h-2 rounded-full bg-[#059669]"></span>
            <span className="font-extrabold text-xs tracking-tight text-white">
              Free Brain Gain
            </span>
          </Link>
          <div className="hidden sm:flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-xs font-bold">
            <span>Level {currentGlobalLevel} / 100</span>
            <span className="text-white/40">|</span>
            <span>Moves: <strong className="text-[#059669]">{moves}</strong></span>
            <span className="text-white/40">|</span>
            <span>Time: <strong className="text-[#DC2626]">{formatTimer(secondsElapsed)}</strong></span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="sm:hidden flex items-center gap-2 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10 text-[11px] font-bold">
            <span>M: <strong className="text-[#059669]">{moves}</strong></span>
            <span>T: <strong className="text-[#DC2626]">{formatTimer(secondsElapsed)}</strong></span>
          </div>
          <Link 
            href="/games" 
            className="px-3 py-1 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-extrabold text-xs uppercase tracking-wider rounded-full transition shadow-lg"
          >
            Games
          </Link>
        </div>
      </header>

      {/* Fullscreen Puzzle Board Grid taking 100% of the screen width and height */}
      <section className="absolute inset-0 w-full h-full p-0 m-0 z-10 flex flex-col">
        
        {/* Win Notification Banner Overlay */}
        {isWon && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-40 bg-black/80 backdrop-blur-md px-6 py-2 rounded-full border border-[#059669]/50 shadow-2xl animate-bounce">
            <span className="text-xs sm:text-sm font-black text-[#059669]">
              🎉 Congratulations! Level complete! Loading next level...
            </span>
          </div>
        )}

        {/* Edge-to-edge Grid Layout */}
        <div 
          className={`grid ${config.gridClass} w-full h-full gap-0 bg-transparent overflow-hidden`}
        >
          {grid.map((correctIndexForThisTile, currentIndexOnBoard) => {
            const isSelected = selectedIdx === currentIndexOnBoard;
            
            const col = correctIndexForThisTile % totalCols;
            const row = Math.floor(correctIndexForThisTile / totalCols);
            
            const backgroundSizeX = totalCols * 100;
            const backgroundSizeY = totalRows * 100;

            const backgroundPositionX = totalCols > 1 ? (col / (totalCols - 1)) * 100 : 0;
            const backgroundPositionY = totalRows > 1 ? (row / (totalRows - 1)) * 100 : 0;

            return (
              <div
                key={currentIndexOnBoard}
                draggable={!isWon}
                onDragStart={(e) => handleDragStart(e, currentIndexOnBoard)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, currentIndexOnBoard)}
                onClick={() => handlePieceClick(currentIndexOnBoard)}
                className={`relative w-full h-full cursor-grab active:cursor-grabbing transition-all overflow-hidden ${
                  isSelected ? 'ring-4 ring-[#2563EB] z-30 scale-[0.98] shadow-2xl' : ''
                }`}
                style={{
                  backgroundImage: `url(${activeImageUrl})`,
                  backgroundSize: `${backgroundSizeX}% ${backgroundSizeY}%`,
                  backgroundPosition: `${backgroundPositionX}% ${backgroundPositionY}%`,
                  backgroundRepeat: 'no-repeat',
                }}
              />
            );
          })}
        </div>

      </section>

      {/* Floating Bottom Instruction Footer Bar */}
      <footer className="absolute bottom-0 left-0 right-0 z-30 px-4 py-2 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex justify-between items-center pointer-events-none text-[11px] font-bold text-white/80">
        <span className="bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 pointer-events-auto">
          {isWon ? 'Level Complete!' : 'Drag pieces or tap two to swap them'}
        </span>
        <Link href="/games" className="bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 pointer-events-auto hover:text-white text-[#2563EB]">
          ← Back to Games
        </Link>
      </footer>

    </main>
  );
}