'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface ForecastDay {
  date: string;
  maxTemp: number;
  minTemp: number;
  condition: string;
}

export default function GamesPage() {
  const [currentDate, setCurrentDate] = useState('');
  const [weatherInfo, setWeatherInfo] = useState('Rainy, 12°C');
  const [locationName, setLocationName] = useState('Melbourne');
  const [weeklyForecast, setWeeklyForecast] = useState<ForecastDay[]>([
    { date: 'Today', maxTemp: 13, minTemp: 8, condition: 'Rainy' },
    { date: 'Tue', maxTemp: 14, minTemp: 9, condition: 'Showers' },
    { date: 'Wed', maxTemp: 12, minTemp: 7, condition: 'Rainy' },
    { date: 'Thu', maxTemp: 15, minTemp: 8, condition: 'Cloudy' },
    { date: 'Fri', maxTemp: 13, minTemp: 8, condition: 'Showers' },
    { date: 'Sat', maxTemp: 14, minTemp: 9, condition: 'Cloudy' },
    { date: 'Sun', maxTemp: 16, minTemp: 10, condition: 'Sunny' },
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
    if (code >= 1 && code <= 3) return 'Cloudy';
    if (code >= 45 && code <= 48) return 'Foggy';
    if (code >= 51 && code <= 67) return 'Rainy';
    if (code >= 71 && code <= 77) return 'Snowy';
    if (code >= 80 && code <= 82) return 'Showers';
    if (code >= 95) return 'Storm';
    return 'Rainy';
  };

  const getWeatherEmoji = (condition: string) => {
    switch (condition) {
      case 'Sunny': return '☀️';
      case 'Cloudy': return '☁️';
      case 'Foggy': return '🌫️';
      case 'Rainy': return '🌧️';
      case 'Snowy': return '❄️';
      case 'Showers': return '🌦️';
      case 'Storm': return '⛈️';
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
        const weatherRes = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,time&timezone=auto`
        );
        
        if (!weatherRes.ok) throw new Error('Network response failed');
        
        const weatherData = await weatherRes.json();
        const temp = Math.round(weatherData.current.temperature_2m);
        const code = weatherData.current.weather_code;

        const condition = getWeatherDescription(code);
        const shortLocation = placeName.split(',')[0].trim();
        const dailyTimes = weatherData.daily.time;
        const maxTemps = weatherData.daily.temperature_2m_max;
        const minTemps = weatherData.daily.temperature_2m_min;
        const codes = weatherData.daily.weather_code;

        const forecast: ForecastDay[] = dailyTimes.map((timeStr: string, index: number) => {
          const dateObj = new Date(timeStr);
          const dayName = index === 0 ? 'Today' : dateObj.toLocaleDateString('en-US', { weekday: 'short' });
          return {
            date: dayName,
            maxTemp: Math.round(maxTemps[index] || 14),
            minTemp: Math.round(minTemps[index] || 8),
            condition: getWeatherDescription(codes[index] || 61),
          };
        });

        setWeeklyForecast(forecast);
        setLocationName(shortLocation);
        setWeatherInfo(`${condition}, ${temp}°C`);
      } catch {
        // Keeps default fallback data
      }
    };

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const geoRes = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
            const geoData = await geoRes.json();
            const city = geoData.city || geoData.locality || geoData.principalSubdivision || 'Melbourne';
            fetchWeather(latitude, longitude, city);
          } catch {
            fetchWeather(-37.8136, 144.9631, 'Melbourne');
          }
        },
        () => {
          fetchWeather(-37.8136, 144.9631, 'Melbourne');
        },
        { timeout: 5000 }
      );
    } else {
      fetchWeather(-37.8136, 144.9631, 'Melbourne');
    }
  }, []);

  return (
    <main className="h-dvh w-screen bg-[#F4F1EA] text-[#1C1917] p-2 md:p-3 flex flex-col justify-between overflow-hidden box-border font-serif select-none">
      
      {/* Top Header container */}
      <header className="w-full max-w-5xl mx-auto bg-[#FDFAF6] rounded-2xl shadow-sm border border-[#D6CFC7] overflow-hidden flex flex-col">
        
        {/* Main Navigation */}
        <nav className="flex justify-between items-center px-6 py-2.5 border-b border-[#E6E0D5] bg-[#FDFAF6]">
          <h1 className="text-xl font-normal tracking-wide text-[#1C1917] uppercase">Games Hub</h1>
          <div className="flex gap-2">
            <Link href="/games" className="px-4 py-1.5 bg-[#1C1917] text-[#FAF8F5] rounded-xl text-sm font-medium tracking-wide shadow-2xs">Games</Link>
            <Link href="/journal" className="px-4 py-1.5 bg-[#FDFAF6] border border-[#D6CFC7] text-[#44403C] hover:text-[#1C1917] rounded-xl text-sm font-medium tracking-wide shadow-2xs">Journal</Link>
          </div>
        </nav>

        {/* Weather Submenu */}
        <section className="bg-[#F5EFEB] px-5 py-2.5 flex flex-col gap-2 border-t border-[#E6E0D5]">
          <div className="flex flex-wrap justify-between items-center gap-2">
            <div className="flex items-center gap-2.5">
              <span className="bg-[#292524] text-[#FDE047] px-3 py-1 rounded-xl font-semibold text-xs tracking-wider shadow-2xs border border-[#44403C]">📍 {locationName}</span>
              <span className="text-sm md:text-base font-medium tracking-wider text-[#1C1917]">TODAY IS {currentDate.toUpperCase()}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-[#B45309] text-[#FFFBEB] px-3 py-1 rounded-xl font-semibold text-sm tracking-wide shadow-2xs border border-[#92400E]">
              <span className="text-base">⛅</span>
              <span>{weatherInfo}</span>
            </div>
          </div>

          {/* 7-Day Forecast Grid */}
          <div className="grid grid-cols-7 gap-1 bg-[#E7E2D8] p-1 rounded-xl border border-[#D6CFC7]">
            {weeklyForecast.map((day, idx) => (
              <div key={idx} className="flex flex-col items-center justify-center bg-[#FFFFFF] py-1 px-0.5 rounded-lg text-center border border-[#D6CFC7] shadow-2xs">
                <span className="text-[11px] font-semibold text-[#1C1917] mb-0.5 tracking-tight leading-none truncate w-full">{day.date}</span>
                <div className="flex items-center justify-center gap-0.5 leading-none">
                  <span className="text-xs">{getWeatherEmoji(day.condition)}</span>
                  <span className="text-[11px] font-bold text-[#1C1917]">{day.maxTemp}°</span>
                </div>
              </div>
            ))}
          </div>
        </section>

      </header>

      {/* Games List Grid */}
      <section className="w-full max-w-5xl mx-auto flex-1 flex flex-col justify-center my-1.5">
        <div className="grid grid-cols-2 gap-2.5">
          {gamesList.map((game, i) => (
            <Link 
              key={i} 
              href={game.link}
              className="bg-[#FDFAF6] rounded-2xl shadow-sm border border-[#D6CFC7] overflow-hidden flex flex-col justify-between hover:border-[#1C1917] hover:shadow-md transition-all duration-200 group cursor-pointer"
            >
              
              {/* Card Content Layout */}
              <div className="flex p-3.5 gap-3.5 items-center">
                
                {/* Picture Preview Container */}
                <div className="relative w-24 h-20 md:w-28 md:h-20 rounded-xl overflow-hidden bg-[#F5EFEB] border border-[#D6CFC7] shrink-0 shadow-2xs group-hover:scale-[1.02] transition-transform">
                  <Image 
                    src={game.image} 
                    alt={game.title} 
                    fill 
                    sizes="112px"
                    className="object-cover" 
                  />
                </div>

                {/* Text & Details */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <span className="inline-block bg-[#E7E2D8] text-[#1C1917] px-2 py-0.5 rounded-md text-[10px] font-semibold tracking-wider uppercase border border-[#D6CFC7] mb-1">
                      {game.badge}
                    </span>
                    <h3 className="text-base md:text-lg font-normal tracking-wide text-[#1C1917] truncate">{game.title}</h3>
                  </div>
                  <p className="text-xs text-[#44403C] font-normal leading-relaxed line-clamp-2">
                    {game.description}
                  </p>
                </div>
              </div>

              {/* Action Footer */}
              <div className="px-3.5 py-2 bg-[#F5EFEB] border-t border-[#E6E0D5] flex items-center justify-end">
                <span className="px-4 py-1.5 bg-[#1C1917] group-hover:bg-[#292524] text-[#FAF8F5] font-medium text-xs md:text-sm tracking-wide rounded-xl transition-all shadow-2xs flex items-center gap-1.5">
                  <span>Play Game</span>
                  <span className="text-sm font-normal">➔</span>
                </span>
              </div>

            </Link>
          ))}
        </div>
      </section>

    </main>
  );
}