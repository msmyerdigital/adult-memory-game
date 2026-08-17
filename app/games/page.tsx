'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function GamesPage() {
  const [currentDateTime, setCurrentDateTime] = useState('');
  const [locationName, setLocationName] = useState('Detecting location...');

  const gamesList = [
    {
      title: 'Piano Memory',
      description: 'Follow melody sequences.',
      badge: 'Focus',
      image: '/piano.png',
      link: '/games/memory',
    },
    {
      title: 'Word Search',
      description: 'Find hidden vocabulary.',
      badge: 'Language',
      image: '/word.png',
      link: '/games/word',
    },
    {
      title: 'Numbers Pyramid',
      description: 'Solve math sequences.',
      badge: 'Logic',
      image: '/pyramid.png',
      link: '/games/pyramid',
    },
    {
      title: 'Jigsaw Puzzle',
      description: 'Piece images together.',
      badge: 'Visual',
      image: '/puzzle.png',
      link: '/games/puzzle',
    },
  ];

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const dateStr = now.toLocaleDateString('en-US', { 
        weekday: 'long', 
        month: 'short', 
        day: 'numeric' 
      });
      const timeStr = now.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit', 
        hour12: true 
      });
      setCurrentDateTime(`${dateStr}, ${timeStr}`);
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 10000);

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`,
              { headers: { 'Accept-Language': 'en' } }
            );
            const data = await res.json();
            const city = data.address?.city || data.address?.town || data.address?.village || data.address?.state || 'Local Area';
            const country = data.address?.country_code ? data.address.country_code.toUpperCase() : '';
            setLocationName(country ? `${city}, ${country}` : city);
          } catch {
            setLocationName('Melbourne');
          }
        },
        () => {
          setLocationName('Melbourne');
        },
        { timeout: 10000 }
      );
    } else {
      setLocationName('Melbourne');
    }

    return () => clearInterval(interval);
  }, []);

  return (
    <main className="min-h-dvh w-screen bg-[#F8FAFC] text-[#0F172A] font-sans selection:bg-[#2563EB] selection:text-[#FFFFFF] flex flex-col justify-between overflow-y-auto box-border">
      
      {/* Top Professional Navigation Header */}
      <header className="border-b border-[#E2E8F0] bg-[#FFFFFF] px-4 sm:px-6 py-2.5 flex justify-between items-center shrink-0 shadow-xs">
        <Link href="https://freebraingain.vercel.app/" className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#059669]"></span>
          <span className="font-extrabold text-sm tracking-tight text-[#0F172A]">
            Free Brain Gain <span className="text-[#2563EB]">Portal</span>
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <Link 
            href="/games" 
            className="px-3.5 py-1.5 bg-[#2563EB] text-[#FFFFFF] font-extrabold text-xs uppercase tracking-wider rounded transition shadow-xs"
          >
            Games
          </Link>
          <Link 
            href="/journal" 
            className="px-3.5 py-1.5 bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#334155] border border-[#CBD5E1] font-bold text-xs uppercase tracking-wider rounded transition"
          >
            Journal
          </Link>
        </div>
      </header>

      {/* Two Parallel Columns Layout (Left Column = 35%, Right Column = 65%) */}
      <section className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-4 flex-1 grid md:grid-cols-12 gap-4 items-start">
        
        {/* Left Column: Date, Time & Location (35% -> md:col-span-4 or exact proportions, using 4/12 ≈ 33% / 5/12 ≈ 41%) */}
        <aside aria-label="Current Date and Location" className="md:col-span-5 lg:col-span-4 bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl p-4 shadow-xs flex flex-col justify-between overflow-hidden text-xs">
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center pb-2 border-b border-[#E2E8F0]">
              <span className="font-extrabold text-[#059669] text-xs flex items-center gap-1">
                <span>📍</span> {locationName}
              </span>
              <span className="text-[9px] font-bold uppercase tracking-widest bg-[#EFF6FF] text-[#2563EB] px-2 py-0.5 rounded">
                Live
              </span>
            </div>

            <div className="py-2">
              <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block mb-1">
                Today is:
              </span>
              <p className="text-base sm:text-lg font-black text-[#0F172A] leading-snug">
                {currentDateTime || 'Loading time...'}
              </p>
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-[#E2E8F0] text-[10px] text-[#64748B] font-medium">
            Location retrieved securely via browser permissions.
          </div>
        </aside>

        {/* Right Column: Games Hub (65%) */}
        <div className="md:col-span-7 lg:col-span-8 flex flex-col gap-3 min-h-0">
          <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl px-4 py-3 shadow-xs shrink-0 flex items-center justify-between">
            <div>
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#2563EB] bg-[#EFF6FF] px-2 py-0.5 rounded">
                Cognitive Fitness Hub
              </span>
              <h1 className="text-sm sm:text-base font-black text-[#0F172A] mt-0.5">
                Select a game to begin training
              </h1>
            </div>
            <span className="text-xs font-bold text-[#475569] hidden sm:inline">Daily Mental Enrichment</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {gamesList.map((game, i) => (
              <Link 
                key={i} 
                href={game.link}
                className="bg-[#FFFFFF] border-2 border-[#CBD5E1] hover:border-[#2563EB] rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200 group flex flex-col justify-between relative overflow-hidden bg-gradient-to-br from-[#FFFFFF] to-[#F8FAFC]"
              >
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest bg-[#2563EB] text-[#FFFFFF] px-2 py-0.5 rounded shadow-xs">
                      {game.badge}
                    </span>
                  </div>

                  <div className="flex gap-4 items-center my-1">
                    <div className="relative w-20 h-20 sm:w-28 sm:h-28 rounded-xl overflow-hidden border border-[#CBD5E1] shrink-0 bg-[#F1F5F9] shadow-inner">
                      <Image 
                        src={game.image} 
                        alt={game.title} 
                        fill 
                        sizes="140px"
                        className="object-cover group-hover:scale-110 transition-transform duration-300" 
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="text-base sm:text-lg font-black text-[#0F172A] group-hover:text-[#2563EB] transition leading-tight truncate">
                        {game.title}
                      </h2>
                      <p className="text-xs text-[#475569] mt-1 font-medium leading-snug line-clamp-2">
                        {game.description}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#E2E8F0] flex justify-between items-center mt-3">
                  <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Tap to Play</span>
                  <span className="text-xs font-extrabold text-[#2563EB] bg-[#EFF6FF] px-2.5 py-1 rounded group-hover:bg-[#2563EB] group-hover:text-[#FFFFFF] transition">
                    Play ➔
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

      </section>

      {/* Footer */}
      <footer className="border-t border-[#E2E8F0] bg-[#FFFFFF] px-4 sm:px-6 py-2.5 text-center text-[10px] text-[#64748B] flex justify-between items-center shrink-0 mt-4">
        <p className="uppercase tracking-widest font-semibold">Free Brain Gain Portal</p>
        <p className="font-mono text-[#94A3B8]">© {new Date().getFullYear()}</p>
      </footer>

    </main>
  );
}