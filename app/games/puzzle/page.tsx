'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import confetti from 'canvas-confetti';

interface LevelConfig {
  levelNumber: number;
  piecesCount: number;
  gridClass: string;
  cols: number;
  imageUrl: string;
  title: string;
}

const allLevelsData: LevelConfig[] = Array.from({ length: 100 }, (_, i) => {
  const lvl = i + 1;
  let piecesCount = 6;
  let gridClass = 'grid-cols-3 grid-rows-2';
  let cols = 3;

  if (lvl === 1) {
    piecesCount = 6;
    gridClass = 'grid-cols-3 grid-rows-2';
    cols = 3;
  } else {
    const progressiveCount = 6 + Math.floor(((lvl - 1) / 99) * 6);
    piecesCount = Math.min(progressiveCount, 12);
    
    if (piecesCount <= 6) {
      cols = 3;
      gridClass = 'grid-cols-3 grid-rows-2';
    } else if (piecesCount === 8) {
      cols = 4;
      gridClass = 'grid-cols-4 grid-rows-2';
    } else if (piecesCount === 9) {
      cols = 3;
      gridClass = 'grid-cols-3 grid-rows-3';
    } else if (piecesCount === 10) {
      cols = 5;
      gridClass = 'grid-cols-5 grid-rows-2';
    } else if (piecesCount === 12) {
      cols = 4;
      gridClass = 'grid-cols-4 grid-rows-3';
    } else {
      cols = 4;
      const rows = Math.ceil(piecesCount / cols);
      gridClass = `grid-cols-4 grid-rows-${rows}`;
    }
  }

  // Curated Unsplash IDs featuring animals, nature, and people/families/crowds
  const imageIds = [
    1025, 1074, 582, 659, 824, // Animals (dogs, wildlife)
    1015, 1041, 1084, 119, 133, 177, 219, // Nature (landscapes, forests, mountains)
    64, 433, 517, 888, 912, 1043, 1062, // People, families, crowds
  ];
  const imageId = imageIds[(lvl - 1) % imageIds.length];

  return {
    levelNumber: lvl,
    piecesCount,
    gridClass,
    cols,
    imageUrl: `https://picsum.photos/id/${imageId}/800/500`,
    title: `Level ${lvl} of 100`,
  };
});

export default function PuzzleGame() {
  const router = useRouter();
  const [currentGlobalLevel, setCurrentGlobalLevel] = useState<number>(1);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [grid, setGrid] = useState<number[]>([]);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [moves, setMoves] = useState<number>(0);
  const [isWon, setIsWon] = useState<boolean>(false);
  
  const [secondsElapsed, setSecondsElapsed] = useState<number>(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const savedLevel = localStorage.getItem('puzzle_global_level');
    if (savedLevel) {
      const parsed = parseInt(savedLevel, 10);
      if (!isNaN(parsed) && parsed >= 1 && parsed <= 100) {
        setCurrentGlobalLevel(parsed);
      }
    }
    setIsInitialized(true);

    return () => {
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

  const setupBoard = useCallback((lvlNum: number) => {
    const config = allLevelsData[lvlNum - 1];
    let initial = Array.from({ length: config.piecesCount }, (_, i) => i);
    
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
      // Audio context fallback or blocked user gesture
    }
  };

  const handleWinSequence = useCallback((newGrid: number[]) => {
    const hasWon = newGrid.every((val, idx) => val === idx);
    if (hasWon) {
      setIsWon(true);
      playSuccessJingle();
      
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

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
  const totalRows = Math.ceil(config.piecesCount / totalCols);

  return (
    <main className="h-screen w-screen bg-[#F7F6F3] text-[#1E293B] p-2 md:p-3 flex flex-col justify-between overflow-hidden select-none relative">
      
      <nav className="w-full max-w-5xl mx-auto flex justify-between items-center bg-white px-5 py-2.5 rounded-2xl shadow-sm border border-stone-200 text-stone-900">
        <h1 className="text-lg font-bold tracking-tight text-stone-900">Picture Puzzle — Level {currentGlobalLevel}</h1>
        <div className="flex gap-2">
          <Link href="/games" className="px-4 py-1.5 bg-black text-white rounded-xl text-sm font-semibold transition-colors">Games</Link>
          <Link href="/journal" className="px-4 py-1.5 bg-white text-stone-400 hover:text-stone-700 rounded-xl text-sm font-semibold transition-colors">Journal</Link>
        </div>
      </nav>

      <section className="w-full max-w-5xl mx-auto bg-[#FFFFFF] px-5 py-2.5 rounded-2xl shadow-sm border border-stone-200 flex justify-between items-center text-center">
        <h2 className="text-base md:text-lg font-extrabold text-[#0F172A]">{config.title}</h2>
        <p className="text-xs md:text-sm text-[#475569] font-normal">
          Moves: <span className="font-bold text-[#0F172A]">{moves}</span>
        </p>
        <p className="text-xs md:text-sm text-[#475569] font-normal">
          Time: <span className="font-bold text-[#0F172A]">{formatTimer(secondsElapsed)}</span>
        </p>
      </section>

      {/* Scaled down container by 10% */}
      <section className="w-full max-w-4xl mx-auto flex flex-col justify-center items-center my-auto px-2">
        <div 
          className={`grid ${config.gridClass} gap-0 w-[90%] max-w-[calc(100vh*1.6*0.75)] aspect-[16/10] bg-[#FFFFFF] rounded-2xl border-2 border-[#0F172A] overflow-hidden shadow-md`}
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
                className={`relative w-full h-full cursor-grab active:cursor-grabbing transition-opacity duration-100 ${
                  isSelected ? 'opacity-90 ring-2 ring-[#0F172A] z-10' : 'opacity-100'
                }`}
              >
                <div
                  className="w-full h-full"
                  style={{
                    backgroundImage: `url(${config.imageUrl})`,
                    backgroundSize: `${backgroundSizeX}% ${backgroundSizeY}%`,
                    backgroundPosition: `${backgroundPositionX}% ${backgroundPositionY}%`,
                  }}
                />
              </div>
            );
          })}
        </div>
      </section>

      <div className="w-full max-w-5xl mx-auto flex flex-col items-center justify-center pb-1">
        {isWon ? (
          <div className="text-[#0F172A] font-bold text-sm bg-[#FFFFFF] px-6 py-2.5 rounded-2xl shadow-sm border border-stone-200 animate-bounce">
            🎉 Congratulations! {currentGlobalLevel % 3 === 0 || currentGlobalLevel === 100 
              ? 'Level complete! Taking you to Journal...' 
              : 'Moving to the next level...'}
          </div>
        ) : (
          <div className="text-xs text-stone-500 font-light">
            Drag and drop pieces anywhere, or tap two pieces to swap them
          </div>
        )}
      </div>

    </main>
  );
}