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
    { time: 'Now', temp: 14, condition: 'Cloudy' },
    { time: '11 AM', temp: 15, condition: 'Cloudy' },
    { time: '12 PM', temp: 16, condition: 'Sunny' },
    { time: '1 PM', temp: 16, condition: 'Sunny' },
    { time: '2 PM', temp: 15, condition: 'Showers' },
    { time: '3 PM', temp: 14, condition: 'Showers' },
  ]);
  const [dailyForecast, setDailyForecast] = useState<DailyForecast[]>([
    { day: 'Today', maxTemp: 16, minTemp: 9, condition: 'Showers' },
    { day: 'Sat', maxTemp: 15, minTemp: 8, condition: 'Sunny' },
    { day: 'Sun', maxTemp: 17, minTemp: 10, condition: 'Cloudy' },
    { day: 'Mon', maxTemp: 14, minTemp: 8, condition: 'Rainy' },
    { day: 'Tue', maxTemp: 16, minTemp: 9, condition: 'Sunny' },
    { day: 'Wed', maxTemp: 18, minTemp: 11, condition: 'Sunny' },
    { day: 'Thu', maxTemp: 15, minTemp: 9, condition: 'Cloudy' },
  ]);

  const gamesList = [
    {
      title: 'Piano Memory',
      description: 'Follow the melody and repeat the sequence.',
      badge: 'Focus',
      image: '/piano.png',
      link: '/games/memory',
    },
    {
      title: 'Word Search',
      description: 'Discover hidden words in the puzzle grid.',
      badge: 'Language',
      image: '/word.png',
      link: '/games/word',
    },
    {
      title: 'Numbers Pyramid',
      description: 'Solve mathematical number pyramids.',
      badge: 'Logic',
      image: '/pyramid.png',
      link: '/games/pyramid',
    },
    {
      title: 'Jigsaw Puzzle',
      description: 'Piece the scattered images back together.',
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
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
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

        const nowIndex = data.hourly.time.findIndex((t: string) => new Date(t).getTime() >= Date.now()) || 0;
        const sliceStart = Math.max(0, nowIndex);
        const nextHours = data.hourly.time.slice(sliceStart, sliceStart + 6).map((timeStr: string, idx: number) => {
          const actualIdx = sliceStart + idx;
          const dateObj = new Date(timeStr);
          const timeLabel = idx === 0 ? 'Now' : dateObj.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });
          return {
            time: timeLabel,
            temp: Math.round(data.hourly.temperature_2m[actualIdx]),
            condition: getWeatherDescription(data.hourly.weather_code[actualIdx]),
          };
        });

        const nextDays = data.daily.time.map((timeStr: string, idx: number) => {
          const dateObj = new Date(timeStr);
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
        // Fallback silently if API fails
      }
    };

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          try {
            const geoRes = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
            const geoData = await geoRes.json();
            const city = geoData.city || geoData.locality || geoData.principalSubdivision || 'Melbourne';
            fetchWeather(latitude, longitude, city);
          } catch {
            fetchWeather(-37.8136, 144.9631, 'Melbourne');
          }
        },
        () => fetchWeather(-37.8136, 144.9631, 'Melbourne'),
        { timeout: 5000 }
      );
    } else {
      fetchWeather(-37.8136, 144.9631, 'Melbourne');
    }
  }, []);

  return (
    <main className="h-dvh w-screen bg-[#F4F1EA] text-[#1C1917] p-2 md:p-3 flex flex-col justify-between overflow-hidden box-border font-serif select-none">
      
      {/* Top Header container */}
      <header className="w-full max-w-[92rem] mx-auto bg-[#FDFAF6] rounded-2xl shadow-sm border border-[#D6CFC7] overflow-hidden flex flex-col shrink-0">
        
        {/* Main Navigation */}
        <nav className="flex justify-between items-center px-4 md:px-6 py-2.5 border-b border-[#E6E0D5] bg-[#FDFAF6]">
          <h1 className="text-xl md:text-2xl font-normal tracking-wide text-[#1C1917] uppercase">Games Hub</h1>
          <div className="flex gap-2">
            <Link href="/games" className="px-5 py-2 bg-[#1C1917] text-[#FAF8F5] rounded-xl text-base md:text-lg font-normal tracking-wide shadow-2xs">Games</Link>
            <Link href="/journal" className="px-5 py-2 bg-[#FDFAF6] border border-[#D6CFC7] text-[#44403C] hover:text-[#1C1917] rounded-xl text-base md:text-lg font-normal tracking-wide shadow-2xs">Journal</Link>
          </div>
        </nav>

        {/* Date Sub-bar */}
        <section className="bg-[#F5EFEB] px-4 md:px-6 py-2 flex items-center justify-between border-t border-[#E6E0D5]">
          <div className="flex items-center gap-3">
            <span className="bg-[#292524] text-[#FAF8F5] px-3 py-1 rounded-xl font-normal text-sm md:text-base tracking-wider shadow-2xs border border-[#44403C]">📍 {locationName}</span>
            <span className="text-sm md:text-base font-normal tracking-wider text-[#1C1917] uppercase">TODAY IS {currentDate}</span>
          </div>
        </section>

      </header>

      {/* Main Two-Column Layout */}
      <section className="w-full max-w-[92rem] mx-auto flex-1 grid grid-cols-1 md:grid-cols-12 gap-3 my-2 min-h-0">
        
        {/* Column 1: Thinner Weather Widget (3 cols) */}
        <div className="md:col-span-3 bg-[#FDFAF6] rounded-2xl shadow-sm border border-[#D6CFC7] p-2.5 flex flex-col justify-start overflow-y-auto text-xs">
          
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xs font-normal text-[#78716C] uppercase tracking-wider">{locationName}</h2>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="text-2xl md:text-3xl font-light text-[#1C1917]">{currentTemp}°</span>
                  <div className="flex flex-col">
                    <span className="text-xs md:text-sm font-normal text-[#44403C]">{currentCondition}</span>
                    <span className="text-[11px] text-[#78716C]">H: {highLow.high}° • L: {highLow.low}°</span>
                  </div>
                </div>
              </div>
              <span className="text-2xl">{getWeatherEmoji(currentCondition)}</span>
            </div>

            {/* Hourly Forecast Strip */}
            <div className="pt-1.5 border-t border-[#E6E0D5]">
              <p className="text-[10px] font-normal text-[#78716C] uppercase tracking-wider mb-1">Hourly Forecast</p>
              <div className="grid grid-cols-6 gap-0.5 bg-[#F5EFEB] p-1 rounded-xl border border-[#E6E0D5]">
                {hourlyForecast.map((hour, idx) => (
                  <div key={idx} className="flex flex-col items-center justify-center text-center">
                    <span className="text-[10px] text-[#78716C] font-normal">{hour.time}</span>
                    <span className="text-xs my-0.5">{getWeatherEmoji(hour.condition)}</span>
                    <span className="text-[11px] font-normal text-[#1C1917]">{hour.temp}°</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 7-Day Forecast */}
          <div className="pt-1.5 border-t border-[#E6E0D5] mt-1.5">
            <p className="text-[10px] font-normal text-[#78716C] uppercase tracking-wider mb-1">7-Day Forecast</p>
            <div className="flex flex-col gap-1">
              {dailyForecast.map((day, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs px-2 py-0.5 rounded-lg bg-[#F5EFEB] border border-[#E6E0D5]">
                  <span className="font-normal text-[#1C1917] w-10">{day.day}</span>
                  <div className="flex items-center gap-1">
                    <span>{getWeatherEmoji(day.condition)}</span>
                    <span className="text-[11px] text-[#44403C]">{day.condition}</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-normal">
                    <span className="text-[#1C1917]">{day.maxTemp}°</span>
                    <span className="text-[#8C857B]">{day.minTemp}°</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Column 2: Mind Sharpness Intro & Larger Games Grid (9 cols) */}
        <div className="md:col-span-9 flex flex-col justify-between gap-3">
          
          {/* Welcome / Mind Sharpness Text Card */}
          <div className="bg-[#FDFAF6] rounded-2xl shadow-sm border border-[#D6CFC7] px-4 py-2.5 flex items-center justify-between shrink-0">
            <div>
              <h2 className="text-lg md:text-xl font-normal text-[#1C1917]">Keep your mind sharp and agile</h2>
              <p className="text-sm md:text-base text-[#44403C] font-normal mt-0.5">Regular cognitive exercises boost memory, focus, and mental wellness. Pick a game below to begin!</p>
            </div>
          </div>

          {/* 4 Games Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1 min-h-0">
            {gamesList.map((game, i) => (
              <Link 
                key={i} 
                href={game.link}
                className="bg-[#FDFAF6] rounded-2xl shadow-sm border border-[#D6CFC7] overflow-hidden flex flex-col justify-between hover:border-[#1C1917] hover:shadow-md transition-all duration-200 group cursor-pointer"
              >
                
                {/* Card Content Layout */}
                <div className="flex p-4 gap-4 items-center flex-1">
                  
                  {/* Picture Preview Container */}
                  <div className="relative w-28 h-20 md:w-32 md:h-24 rounded-xl overflow-hidden bg-[#F5EFEB] border border-[#D6CFC7] shrink-0 shadow-2xs group-hover:scale-[1.02] transition-transform">
                    <Image 
                      src={game.image} 
                      alt={game.title} 
                      fill 
                      sizes="144px"
                      className="object-cover" 
                    />
                  </div>

                  {/* Text & Details */}
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <span className="inline-block bg-[#E7E2D8] text-[#1C1917] px-2 py-0.5 rounded-md text-xs font-normal tracking-wider uppercase border border-[#D6CFC7] mb-1 w-fit">
                      {game.badge}
                    </span>
                    <h3 className="text-lg md:text-xl font-normal tracking-wide text-[#1C1917] truncate">{game.title}</h3>
                    <p className="text-sm md:text-base text-[#44403C] font-normal leading-snug line-clamp-2 mt-0.5">
                      {game.description}
                    </p>
                  </div>
                </div>

                {/* Action Footer */}
                <div className="px-4 py-2 bg-[#F5EFEB] border-t border-[#E6E0D5] flex items-center justify-end">
                  <span className="px-4 py-1 bg-[#1C1917] group-hover:bg-[#292524] text-[#FAF8F5] font-normal text-sm md:text-base tracking-wide rounded-xl transition-all shadow-2xs flex items-center gap-1.5">
                    <span>Play Now</span>
                    <span className="text-xs">➔</span>
                  </span>
                </div>

              </Link>
            ))}
          </div>

        </div>

      </section>

    </main>
  );
}