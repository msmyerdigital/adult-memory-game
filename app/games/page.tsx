'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface HourlyForecast {
  time: string;
  temp: number;
  condition: string;
}

export default function GamesPage() {
  const [currentDateTime, setCurrentDateTime] = useState('');
  const [locationName, setLocationName] = useState('Detecting location...');
  const [currentWeather, setCurrentWeather] = useState({ temp: 15, condition: 'Mostly cloudy' });
  const [hourlyForecast, setHourlyForecast] = useState<HourlyForecast[]>([]);
  const [sunriseTime, setSunriseTime] = useState('6:42 AM');
  const [sunsetTime, setSunsetTime] = useState('5:55 PM');

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

  const getWeatherDescription = (code: number) => {
    if (code === 0) return 'Sunny';
    if (code >= 1 && code <= 3) return 'Partly cloudy';
    if (code >= 45 && code <= 48) return 'Foggy';
    if (code >= 51 && code <= 67) return 'Rainy';
    if (code >= 71 && code <= 77) return 'Snowy';
    if (code >= 80 && code <= 82) return 'Showers';
    if (code >= 95) return 'Thunderstorm';
    return 'Cloudy';
  };

  const getWeatherEmoji = (condition: string) => {
    switch (condition) {
      case 'Sunny': return '☀️';
      case 'Partly cloudy': return '⛅';
      case 'Cloudy': return '☁️';
      case 'Foggy': return '🌫️';
      case 'Rainy': return '🌧️';
      case 'Snowy': return '❄️';
      case 'Showers': return '🌦️';
      case 'Thunderstorm': return '⛈️';
      default: return '☁️';
    }
  };

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

    const fetchWeatherData = async (lat: number, lon: number, placeName: string) => {
      try {
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&hourly=temperature_2m,weather_code&daily=sunrise,sunset&timezone=auto`
        );
        if (!res.ok) throw new Error('Weather fetch failed');
        const data = await res.json();

        const currentT = Math.round(data.current.temperature_2m);
        const currentC = getWeatherDescription(data.current.weather_code);
        setCurrentWeather({ temp: currentT, condition: currentC });

        if (data.daily && data.daily.sunrise && data.daily.sunset) {
          const sunriseDate = new Date(data.daily.sunrise[0]);
          const sunsetDate = new Date(data.daily.sunset[0]);
          setSunriseTime(sunriseDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }));
          setSunsetTime(sunsetDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }));
        }

        const hourlyTimes: string[] = data.hourly.time;
        const nowMs = new Date().getTime();
        
        let nowIndex = hourlyTimes.findIndex((t: string) => new Date(t).getTime() >= nowMs);
        if (nowIndex === -1) nowIndex = 0;
        if (nowIndex > 0 && Math.abs(new Date(hourlyTimes[nowIndex - 1]).getTime() - nowMs) < 3600000) {
          nowIndex -= 1;
        }

        const nextHours = [];
        for (let idx = 0; idx < 5; idx++) {
          const actualIdx = nowIndex + idx;
          if (actualIdx < hourlyTimes.length) {
            const timeStr = hourlyTimes[actualIdx];
            const dateObj = new Date(timeStr);
            const timeLabel = idx === 0 ? 'Now' : dateObj.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });
            nextHours.push({
              time: timeLabel,
              temp: Math.round(data.hourly.temperature_2m[actualIdx]),
              condition: getWeatherDescription(data.hourly.weather_code[actualIdx]),
            });
          }
        }

        if (nextHours.length > 0) setHourlyForecast(nextHours);
        setLocationName(placeName);
      } catch {
        setHourlyForecast([
          { time: 'Now', temp: 15, condition: 'Partly cloudy' },
          { time: '6 PM', temp: 14, condition: 'Cloudy' },
          { time: '7 PM', temp: 13, condition: 'Cloudy' },
          { time: '8 PM', temp: 12, condition: 'Clear' },
          { time: '9 PM', temp: 11, condition: 'Clear' },
        ]);
      }
    };

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
            const place = country ? `${city}, ${country}` : city;
            fetchWeatherData(latitude, longitude, place);
          } catch {
            fetchWeatherData(-37.8136, 144.9631, 'Melbourne');
          }
        },
        () => {
          fetchWeatherData(-37.8136, 144.9631, 'Melbourne');
        },
        { timeout: 10000 }
      );
    } else {
      fetchWeatherData(-37.8136, 144.9631, 'Melbourne');
    }

    return () => clearInterval(interval);
  }, []);

  const weatherContent = (
    <div className="flex flex-col gap-3">
      {/* Right now the weather outside is: */}
      <div>
        <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block mb-1.5">
          Right now the weather outside is:
        </span>
        <div className="flex items-center justify-between bg-[#F8FAFC] p-2.5 rounded-lg border border-[#E2E8F0]">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{getWeatherEmoji(currentWeather.condition)}</span>
            <span className="font-bold text-[#0F172A]">{currentWeather.condition}</span>
          </div>
          <span className="text-base font-black text-[#2563EB]">{currentWeather.temp}°C</span>
        </div>
      </div>

      {/* Forecast for the rest of the day */}
      <div>
        <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block mb-1.5">
          Forecast for the rest of the day:
        </span>
        <div className="grid grid-cols-5 gap-1 bg-[#F8FAFC] p-1.5 rounded-lg border border-[#E2E8F0] text-center">
          {hourlyForecast.map((hour, idx) => (
            <div key={idx} className="flex flex-col items-center justify-center">
              <span className="text-[9px] font-bold text-[#64748B] truncate w-full">{hour.time}</span>
              <span className="text-[11px] my-0.5">{getWeatherEmoji(hour.condition)}</span>
              <span className="text-[10px] font-bold text-[#0F172A]">{hour.temp}°</span>
            </div>
          ))}
        </div>
      </div>

      {/* Sunrise and Sunset Info */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-[#F8FAFC] p-2.5 rounded-lg border border-[#E2E8F0] flex items-center gap-2.5">
          <span className="text-lg">🌅</span>
          <div>
            <span className="text-[9px] font-bold text-[#64748B] uppercase tracking-wider block">Sunrise</span>
            <span className="text-xs font-black text-[#0F172A]">{sunriseTime}</span>
          </div>
        </div>

        <div className="bg-[#F8FAFC] p-2.5 rounded-lg border border-[#E2E8F0] flex items-center gap-2.5">
          <span className="text-lg">🌇</span>
          <div>
            <span className="text-[9px] font-bold text-[#64748B] uppercase tracking-wider block">Sunset</span>
            <span className="text-xs font-black text-[#0F172A]">{sunsetTime}</span>
          </div>
        </div>
      </div>
    </div>
  );

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

      {/* Two Parallel Columns Layout */}
      <section className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-4 flex-1 grid md:grid-cols-12 gap-4 items-start">
        
        {/* Left Column: Date, Time & Weather Forecast (Desktop/Tablet) */}
        <aside aria-label="Current Date, Location and Weather" className="hidden md:flex md:col-span-5 lg:col-span-4 bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl p-4 shadow-xs flex-col justify-between overflow-hidden text-xs">
          <div className="flex flex-col gap-3.5">
            {/* Location */}
            <div className="flex justify-between items-center pb-2 border-b border-[#E2E8F0]">
              <span className="font-extrabold text-[#059669] text-xs flex items-center gap-1">
                <span>📍</span> {locationName}
              </span>
              <span className="text-[9px] font-bold uppercase tracking-widest bg-[#EFF6FF] text-[#2563EB] px-2 py-0.5 rounded">
                Live
              </span>
            </div>

            {/* Today is: Date and Time */}
            <div>
              <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block mb-1">
                Today is:
              </span>
              <p className="text-sm sm:text-base font-black text-[#0F172A] leading-snug">
                {currentDateTime || 'Loading time...'}
              </p>
            </div>

            <div className="pt-2 border-t border-[#E2E8F0]">
              {weatherContent}
            </div>
          </div>
        </aside>

        {/* Right Column: Games Hub */}
        <div className="w-full md:col-span-7 lg:col-span-8 flex flex-col gap-3 min-h-0">
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

          {/* Mobile view: Date, Location & Weather panel placed below the games list, allowing full scrolling */}
          <div className="md:hidden bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl p-4 shadow-xs flex flex-col justify-between text-xs mt-1">
            <div className="flex flex-col gap-3.5">
              <div className="flex justify-between items-center pb-2 border-b border-[#E2E8F0]">
                <span className="font-extrabold text-[#059669] text-xs flex items-center gap-1">
                  <span>📍</span> {locationName}
                </span>
                <span className="text-[9px] font-bold uppercase tracking-widest bg-[#EFF6FF] text-[#2563EB] px-2 py-0.5 rounded">
                  Live
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block mb-1">
                  Today is:
                </span>
                <p className="text-sm font-black text-[#0F172A] leading-snug">
                  {currentDateTime || 'Loading time...'}
                </p>
              </div>

              <div className="pt-2 border-t border-[#E2E8F0]">
                {weatherContent}
              </div>
            </div>
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