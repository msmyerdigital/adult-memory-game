'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface HourlyForecast {
  time: string;
  temp: number;
  condition: string;
}

interface DailyForecast {
  day: string;
  maxTemp: number;
  minTemp: number;
  condition: string;
}

export default function GamesPage() {
  const [currentDate, setCurrentDate] = useState('');
  const [locationName, setLocationName] = useState('Melbourne');
  const [currentTemp, setCurrentTemp] = useState(14);
  const [currentCondition, setCurrentCondition] = useState('Mostly cloudy');
  const [highLow, setHighLow] = useState({ high: 16, low: 9 });
  const [hourlyForecast, setHourlyForecast] = useState<HourlyForecast[]>([
    { time: 'Now', temp: 14, condition: 'Mostly cloudy' },
    { time: '1 PM', temp: 15, condition: 'Partly cloudy' },
    { time: '2 PM', temp: 16, condition: 'Sunny' },
    { time: '3 PM', temp: 15, condition: 'Sunny' },
    { time: '4 PM', temp: 14, condition: 'Cloudy' },
  ]);
  const [dailyForecast, setDailyForecast] = useState<DailyForecast[]>([
    { day: 'Today', maxTemp: 16, minTemp: 9, condition: 'Partly cloudy' },
    { day: 'Tue', maxTemp: 18, minTemp: 10, condition: 'Sunny' },
    { day: 'Wed', maxTemp: 15, minTemp: 11, condition: 'Rainy' },
    { day: 'Thu', maxTemp: 14, minTemp: 8, condition: 'Showers' },
    { day: 'Fri', maxTemp: 17, minTemp: 9, condition: 'Sunny' },
  ]);

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
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      month: 'short', 
      day: 'numeric'
    };
    setCurrentDate(new Date().toLocaleDateString('en-US', options));

    const fetchWeather = async (lat: number, lon: number, placeName: string) => {
      try {
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&hourly=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,time&timezone=auto`
        );
        if (!res.ok) throw new Error('Weather fetch failed');
        const data = await res.json();

        const currentT = Math.round(data.current.temperature_2m);
        const currentC = getWeatherDescription(data.current.weather_code);
        const shortLoc = placeName.split(',')[0].trim();

        const maxT = Math.round(data.daily.temperature_2m_max[0] || 16);
        const minT = Math.round(data.daily.temperature_2m_min[0] || 9);

        const hourlyTimes: string[] = data.hourly.time;
        const currentTimeMs = new Date().getTime();
        
        let nowIndex = hourlyTimes.findIndex((t: string) => new Date(t).getTime() >= currentTimeMs);
        if (nowIndex === -1) nowIndex = 0;

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

        const nextDays = data.daily.time.slice(0, 5).map((timeStr: string, idx: number) => {
          const dateObj = new Date(timeStr + 'T00:00:00');
          const dayLabel = idx === 0 ? 'Today' : dateObj.toLocaleDateString('en-US', { weekday: 'short' });
          return {
            day: dayLabel,
            maxTemp: Math.round(data.daily.temperature_2m_max[idx]),
            minTemp: Math.round(data.daily.temperature_2m_min[idx]),
            condition: getWeatherDescription(data.daily.weather_code[idx]),
          };
        });

        setLocationName(shortLoc);
        setCurrentTemp(currentT);
        setCurrentCondition(currentC);
        setHighLow({ high: maxT, low: minT });
        if (nextHours.length > 0) setHourlyForecast(nextHours);
        if (nextDays.length > 0) setDailyForecast(nextDays);
      } catch {
        // Keeps built-in default weather state values seamlessly if offline/blocked
      }
    };

    fetchWeather(-37.8136, 144.9631, 'Melbourne');
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

      {/* Main Responsive Grid Layout */}
      <section className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-4 flex-1 grid md:grid-cols-12 gap-4 items-start">
        
        {/* Column 2 (Games Section) */}
        <div className="md:col-span-8 order-1 md:order-2 flex flex-col gap-3 min-h-0">
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

        {/* Column 1 (Weather Widget) */}
        <aside aria-label="Weather Forecast" className="md:col-span-4 order-2 md:order-1 bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl p-3.5 shadow-xs flex flex-col justify-between overflow-hidden text-xs">
          <div>
            <div className="flex justify-between items-center pb-2 border-b border-[#E2E8F0]">
              <span className="font-bold text-[#059669] text-xs">📍 {locationName}</span>
              <span className="text-[11px] font-semibold text-[#64748B]">{currentDate}</span>
            </div>

            <div className="flex justify-between items-center my-2.5">
              <div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-black text-[#0F172A]">{currentTemp}°</span>
                  <span className="text-xs font-bold text-[#334155]">{currentCondition}</span>
                </div>
                <span className="text-[10px] text-[#64748B]">High: {highLow.high}° / Low: {highLow.low}°</span>
              </div>
              <span className="text-3xl">{getWeatherEmoji(currentCondition)}</span>
            </div>

            {/* Hourly Strip */}
            <div className="pt-2 border-t border-[#E2E8F0]">
              <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-1">Hourly</p>
              <div className="grid grid-cols-5 gap-1 bg-[#F8FAFC] p-1 rounded-lg border border-[#E2E8F0] text-center">
                {hourlyForecast.map((hour, idx) => (
                  <div key={idx} className="flex flex-col items-center justify-center">
                    <span className="text-[9px] font-bold text-[#64748B]">{hour.time}</span>
                    <span className="text-[11px] my-0.5">{getWeatherEmoji(hour.condition)}</span>
                    <span className="text-[10px] font-bold text-[#0F172A]">{hour.temp}°</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 5-Day Forecast */}
          <div className="pt-2 mt-2 border-t border-[#E2E8F0]">
            <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-1">5-Day Outlook</p>
            <div className="space-y-1">
              {dailyForecast.map((day, idx) => (
                <div key={idx} className="flex items-center justify-between text-[11px] px-2 py-0.5 rounded bg-[#F8FAFC] border border-[#E2E8F0]">
                  <span className="font-bold text-[#0F172A] w-10">{day.day}</span>
                  <div className="flex items-center gap-1">
                    <span>{getWeatherEmoji(day.condition)}</span>
                    <span className="text-[#475569]">{day.condition}</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-bold">
                    <span className="text-[#0F172A]">{day.maxTemp}°</span>
                    <span className="text-[#94A3B8]">{day.minTemp}°</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>

      </section>

      {/* Footer */}
      <footer className="border-t border-[#E2E8F0] bg-[#FFFFFF] px-4 sm:px-6 py-2.5 text-center text-[10px] text-[#64748B] flex justify-between items-center shrink-0 mt-4">
        <p className="uppercase tracking-widest font-semibold">Free Brain Gain Portal</p>
        <p className="font-mono text-[#94A3B8]">© {new Date().getFullYear()}</p>
      </footer>

    </main>
  );
}