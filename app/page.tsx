'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function HomeLandingPage() {
  const [dateTime, setDateTime] = useState<string>('');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      setDateTime(now.toLocaleDateString(undefined, { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }));
    };
    
    updateDateTime();
    const timer = setInterval(updateDateTime, 60000);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => {
      clearInterval(timer);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      alert("To save this app, simply use your browser menu or press Ctrl+D (Cmd+D on Mac) to bookmark it!");
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F5FA] text-[#0F172A] text-sm font-sans selection:bg-[#1D4ED8] selection:text-[#FFFFFF]">
      
      {/* Top Header / Navigation Bar */}
      <header className="sticky top-0 z-50 bg-[#FFFFFF]/95 backdrop-blur-md border-b border-[#CBD5E1] shadow-2xs">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-base font-bold tracking-tight text-[#1E3A8A] uppercase">Free Brain Gain</span>
          </div>
          
          <nav className="hidden md:flex items-center space-x-6 text-xs font-semibold text-[#334155]">
            <a href="#how-it-works" className="hover:text-[#1D4ED8] transition">How it Works</a>
            <a href="#games-preview" className="hover:text-[#1D4ED8] transition">The Games</a>
            <a href="#benefits" className="hover:text-[#1D4ED8] transition">Benefits</a>
            <a href="#pricing" className="hover:text-[#1D4ED8] transition">Pricing</a>
            <a href="#contact" className="hover:text-[#1D4ED8] transition">Contact</a>
          </nav>

          <div className="flex items-center space-x-2">
            {!isInstalled && (
              <button 
                onClick={handleInstallClick}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F8FAFC] text-[#334155] hover:bg-[#E2E8F0] rounded-lg font-semibold text-xs transition border border-[#CBD5E1]"
              >
                <span>📲</span> Save App
              </button>
            )}

            <Link 
              href="/games" 
              className="px-3.5 py-1.5 bg-[#1D4ED8] text-[#FFFFFF] rounded-lg font-semibold text-xs hover:bg-[#1E40AF] transition shadow-xs"
            >
              Launch App
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-12 px-6 text-[#FFFFFF] text-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1531983412531-1f49a365ffed?auto=format&fit=crop&w=1600&q=80" 
            alt="Older adult connecting with family" 
            className="w-full h-full object-cover object-center filter brightness-[0.22]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#1E3A8A]/92 via-[#1D4ED8]/90 to-[#0F172A]"></div>
        </div>

        <div className="max-w-3xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFFFFF]/15 backdrop-blur-md border border-[#FFFFFF]/30 text-xs mb-4 text-[#F8FAFC] font-medium tracking-wide shadow-xs">
            <span>📅 {dateTime || 'Loading date...'}</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-3 leading-tight text-[#FFFFFF]">
            The Professional Daily Cognitive Routine
          </h1>
          
          <p className="text-sm sm:text-base text-[#E2E8F0] mb-6 max-w-xl mx-auto font-normal leading-relaxed">
            Scientifically curated memory exercises and temporal orientation tools designed to support cognitive wellness in older adults.
          </p>

          <div className="flex justify-center items-center gap-3">
            <Link 
              href="/games" 
              className="px-5 py-2.5 bg-[#FFFFFF] text-[#1E3A8A] font-bold rounded-xl text-sm hover:bg-[#F8FAFC] transition shadow-md"
            >
              Start Cognitive Exercises →
            </Link>
          </div>
        </div>
      </section>

      {/* 1-Click Save Section */}
      {!isInstalled && (
        <section className="py-6 bg-[#E2E8F0] px-6 border-y border-[#CBD5E1] text-center">
          <div className="max-w-lg mx-auto bg-[#FFFFFF] p-4 rounded-xl shadow-xs border border-[#CBD5E1]">
            <span className="text-[10px] font-bold uppercase tracking-widest bg-[#E0F2FE] text-[#0369A1] px-2 py-0.5 rounded-md border border-[#BAE6FD]">Quick Access</span>
            <h2 className="text-base font-bold text-[#0F172A] mt-1.5 mb-0.5">Save to Your Home Screen</h2>
            <p className="text-[#475569] text-xs mb-3">
              Add Free Brain Gain directly to your device for single-tap daily entry.
            </p>
            <button 
              onClick={handleInstallClick}
              className="px-4 py-2 bg-[#1D4ED8] text-[#FFFFFF] font-semibold rounded-lg text-xs hover:bg-[#1E40AF] transition shadow-2xs inline-flex items-center gap-1.5"
            >
              <span>📲</span> Save App to Device
            </button>
          </div>
        </section>
      )}

      {/* Core Features Preview */}
      <section id="how-it-works" className="py-10 px-6 max-w-5xl mx-auto">
        <div className="text-center max-w-xl mx-auto mb-8">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#0F172A] mb-1">Platform Overview</h2>
          <p className="text-[#475569] text-xs sm:text-sm">Structured tools for mental acuity and seamless family transparency.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-[#FFFFFF] p-4 rounded-xl border border-[#CBD5E1] shadow-2xs">
            <div className="w-7 h-7 bg-[#E0F2FE] text-[#0369A1] rounded-lg flex items-center justify-center font-bold mb-2 text-xs">01</div>
            <h3 className="text-sm font-bold text-[#0F172A] mb-1">Cognitive Exercises</h3>
            <p className="text-[#475569] text-xs leading-relaxed">
              Targeted games designed to stimulate active recall, visual pairing, and rapid pattern processing.
            </p>
          </div>

          <div className="bg-[#FFFFFF] p-4 rounded-xl border border-[#CBD5E1] shadow-2xs">
            <div className="w-7 h-7 bg-[#E0F2FE] text-[#0369A1] rounded-lg flex items-center justify-center font-bold mb-2 text-xs">02</div>
            <h3 className="text-sm font-bold text-[#0F172A] mb-1">Daily Journaling</h3>
            <p className="text-[#475569] text-xs leading-relaxed">
              Reflective daily writing prompts that capture mood and thought patterns for loved ones to review.
            </p>
          </div>

          <div className="bg-[#FFFFFF] p-4 rounded-xl border border-[#CBD5E1] shadow-2xs">
            <div className="w-7 h-7 bg-[#E0F2FE] text-[#0369A1] rounded-lg flex items-center justify-center font-bold mb-2 text-xs">03</div>
            <h3 className="text-sm font-bold text-[#0F172A] mb-1">Temporal Orientation</h3>
            <p className="text-[#475569] text-xs leading-relaxed">
              Persistent live display of the precise current date and time to support structural grounding.
            </p>
          </div>
        </div>
      </section>

      {/* The Games Showcase with Custom Pictures */}
      <section id="games-preview" className="py-10 bg-[#E2E8F0]/50 px-6 border-y border-[#CBD5E1]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-8">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#0F172A] mb-1">Featured Mental Workouts</h2>
            <p className="text-[#475569] text-xs sm:text-sm">Explore the 4 foundational games built into the platform.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            
            {/* Game 1: Pyramid */}
            <div className="bg-[#FFFFFF] rounded-xl overflow-hidden border border-[#CBD5E1] shadow-xs flex flex-col">
              <div className="h-36 overflow-hidden bg-[#F8FAFC] flex items-center justify-center p-4 border-b border-[#CBD5E1]">
                <img 
                  src="/pyramid.png" 
                  alt="Pyramid Memory Game" 
                  className="max-h-full max-w-full object-contain hover:scale-105 transition duration-300"
                />
              </div>
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-[#E0F2FE] text-[#0369A1] px-2 py-0.5 rounded-md">Visual Recall</span>
                  <h3 className="text-base font-bold text-[#0F172A] mt-1.5 mb-1">Pyramid Memory</h3>
                  <p className="text-[#475569] text-xs leading-relaxed mb-3">
                    Test short-term memory by remembering tiered card layouts and uncovering matches.
                  </p>
                </div>
                <Link href="/games" className="text-xs font-bold text-[#1D4ED8] hover:underline inline-flex items-center gap-1">
                  Play Pyramid Game →
                </Link>
              </div>
            </div>

            {/* Game 2: Word */}
            <div className="bg-[#FFFFFF] rounded-xl overflow-hidden border border-[#CBD5E1] shadow-xs flex flex-col">
              <div className="h-36 overflow-hidden bg-[#F8FAFC] flex items-center justify-center p-4 border-b border-[#CBD5E1]">
                <img 
                  src="/word.png" 
                  alt="Word Association Game" 
                  className="max-h-full max-w-full object-contain hover:scale-105 transition duration-300"
                />
              </div>
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-[#E0F2FE] text-[#0369A1] px-2 py-0.5 rounded-md">Vocabulary & Fluency</span>
                  <h3 className="text-base font-bold text-[#0F172A] mt-1.5 mb-1">Word Association</h3>
                  <p className="text-[#475569] text-xs leading-relaxed mb-3">
                    Connect related concepts and retrieve vocabulary sets to maintain semantic fluency.
                  </p>
                </div>
                <Link href="/games" className="text-xs font-bold text-[#1D4ED8] hover:underline inline-flex items-center gap-1">
                  Play Word Game →
                </Link>
              </div>
            </div>

            {/* Game 3: Puzzle */}
            <div className="bg-[#FFFFFF] rounded-xl overflow-hidden border border-[#CBD5E1] shadow-xs flex flex-col">
              <div className="h-36 overflow-hidden bg-[#F8FAFC] flex items-center justify-center p-4 border-b border-[#CBD5E1]">
                <img 
                  src="/puzzle.png" 
                  alt="Spatial Grid Puzzle" 
                  className="max-h-full max-w-full object-contain hover:scale-105 transition duration-300"
                />
              </div>
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-[#E0F2FE] text-[#0369A1] px-2 py-0.5 rounded-md">Spatial Reasoning</span>
                  <h3 className="text-base font-bold text-[#0F172A] mt-1.5 mb-1">Spatial Grid Puzzle</h3>
                  <p className="text-[#475569] text-xs leading-relaxed mb-3">
                    Navigate topological cues and grid layouts to preserve spatial awareness and orientation.
                  </p>
                </div>
                <Link href="/games" className="text-xs font-bold text-[#1D4ED8] hover:underline inline-flex items-center gap-1">
                  Play Spatial Puzzle →
                </Link>
              </div>
            </div>

            {/* Game 4: Piano */}
            <div className="bg-[#FFFFFF] rounded-xl overflow-hidden border border-[#CBD5E1] shadow-xs flex flex-col">
              <div className="h-36 overflow-hidden bg-[#F8FAFC] flex items-center justify-center p-4 border-b border-[#CBD5E1]">
                <img 
                  src="/piano.png" 
                  alt="Piano Sequence Challenge" 
                  className="max-h-full max-w-full object-contain hover:scale-105 transition duration-300"
                />
              </div>
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-[#E0F2FE] text-[#0369A1] px-2 py-0.5 rounded-md">Sequential Logic</span>
                  <h3 className="text-base font-bold text-[#0F172A] mt-1.5 mb-1">Piano Sequence</h3>
                  <p className="text-[#475569] text-xs leading-relaxed mb-3">
                    Observe and reproduce melodic sequences to strengthen auditory-motor span.
                  </p>
                </div>
                <Link href="/games" className="text-xs font-bold text-[#1D4ED8] hover:underline inline-flex items-center gap-1">
                  Play Piano Game →
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Why Is It Useful */}
      <section id="benefits" className="py-10 px-6 max-w-5xl mx-auto">
        <div className="text-center max-w-xl mx-auto mb-8">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#0F172A] mb-1">Clinical & Practical Value</h2>
          <p className="text-[#475569] text-xs sm:text-sm">Designed with accessibility and routine sustainability in mind.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-[#FFFFFF] p-4 rounded-xl shadow-2xs border border-[#CBD5E1]">
            <h3 className="font-bold text-xs text-[#1E3A8A] uppercase tracking-wide mb-1.5">Routine Stability</h3>
            <p className="text-xs text-[#475569] leading-relaxed">Consistent daily interactions help ground users, lessening temporal confusion.</p>
          </div>
          <div className="bg-[#FFFFFF] p-4 rounded-xl shadow-2xs border border-[#CBD5E1]">
            <h3 className="font-bold text-xs text-[#1E3A8A] uppercase tracking-wide mb-1.5">Neuroplastic Stimulation</h3>
            <p className="text-xs text-[#475569] leading-relaxed">Targeted memory games encourage ongoing neural connectivity and active focus.</p>
          </div>
          <div className="bg-[#FFFFFF] p-4 rounded-xl shadow-2xs border border-[#CBD5E1]">
            <h3 className="font-bold text-xs text-[#1E3A8A] uppercase tracking-wide mb-1.5">Family Oversight</h3>
            <p className="text-xs text-[#475569] leading-relaxed">Automated journal notes bridge communication loops without high-pressure calls.</p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-10 bg-[#E2E8F0]/50 px-6 border-t border-[#CBD5E1] text-center">
        <div className="max-w-md mx-auto">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#0F172A] mb-1">Accessible to All</h2>
          <p className="text-[#475569] text-xs sm:text-sm mb-6">Completely free community tier with full platform capabilities.</p>
          
          <div className="bg-[#FFFFFF] border-2 border-[#1D4ED8] p-6 rounded-2xl shadow-sm text-left">
            <div className="flex justify-between items-center mb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-[#E0F2FE] text-[#0369A1] px-2 py-0.5 rounded-md">Open Access</span>
              <span className="text-2xl font-extrabold text-[#0F172A]">$0</span>
            </div>
            <p className="text-xs text-[#475569] leading-relaxed mb-4">
              Full access to all four mental exercise modules, real-time temporal orientation display, and secure daily journal deliveries.
            </p>
            <Link 
              href="/games" 
              className="block w-full py-2.5 bg-[#1D4ED8] text-[#FFFFFF] rounded-xl font-bold text-xs tracking-wide text-center hover:bg-[#1E40AF] transition shadow-xs"
            >
              Launch Platform Now
            </Link>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-10 bg-[#1E3A8A] text-[#FFFFFF] px-6">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight mb-2">Professional Support</h2>
          <p className="text-[#E2E8F0] text-xs sm:text-sm mb-4 leading-relaxed">
            Reach out for feature suggestions, accessibility inquiries, or deployment assistance.
          </p>
          <div className="inline-block bg-[#1D4ED8] border border-[#60A5FA] px-4 py-3 rounded-xl shadow-xs">
            <p className="text-[10px] text-[#E2E8F0] font-medium mb-0.5">Direct Support Contact</p>
            <a href="mailto:freebraingain@gmail.com" className="text-[#FDE047] font-bold text-xs sm:text-sm hover:underline">
              freebraingain@gmail.com
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-4 bg-[#0F172A] text-[#94A3B8] text-[10px] text-center border-t border-[#1E3A8A]">
        <p>© {new Date().getFullYear()} Free Brain Gain. Designed for cognitive health and family connectivity.</p>
      </footer>

    </div>
  );
}