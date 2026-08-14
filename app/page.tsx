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
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] text-base font-sans selection:bg-[#2563EB]/20 selection:text-[#0F172A]">
      
      {/* Top Header / Navigation Bar */}
      <header className="sticky top-0 z-50 bg-[#FFFFFF]/90 backdrop-blur-xl border-b border-[#E2E8F0] transition-all">
        <div className="max-w-6xl mx-auto px-6 h-24 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-xl font-bold tracking-tight text-[#1E3A8A] flex items-center gap-2.5">
              <span className="w-3.5 h-3.5 rounded-full bg-[#2563EB] inline-block animate-pulse"></span>
              Free Brain Gain
            </span>
          </div>
          
          <nav className="hidden md:flex items-center space-x-8 text-base font-medium text-[#334155]">
            <a href="#how-it-works" className="hover:text-[#2563EB] transition">Philosophy</a>
            <a href="#games-preview" className="hover:text-[#2563EB] transition">Sanctuary Games</a>
            <a href="#benefits" className="hover:text-[#2563EB] transition">Benefits</a>
            <a href="#pricing" className="hover:text-[#2563EB] transition">Access</a>
            <a href="#contact" className="hover:text-[#2563EB] transition">Support</a>
          </nav>

          <div className="flex items-center space-x-4">
            {!isInstalled && (
              <button 
                onClick={handleInstallClick}
                className="hidden sm:inline-flex items-center gap-2 px-5 py-3 bg-[#F1F5F9] text-[#334155] hover:bg-[#E2E8F0] rounded-2xl font-medium text-sm transition border border-[#CBD5E1]"
              >
                <span>✨</span> Save App
              </button>
            )}

            <Link 
              href="/games" 
              className="px-6 py-3.5 bg-[#2563EB] text-[#FFFFFF] rounded-2xl font-semibold text-sm tracking-wide hover:bg-[#1D4ED8] transition shadow-lg shadow-[#2563EB]/15"
            >
              Enter Sanctuary →
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-24 px-6 text-[#FFFFFF] text-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1531983412531-1f49a365ffed?auto=format&fit=crop&w=1600&q=80" 
            alt="Mindful moment outdoors" 
            className="w-full h-full object-cover object-center filter brightness-[0.3] saturate-[0.9]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#1E3A8A]/80 via-[#2563EB]/85 to-[#0F172A]"></div>
        </div>

        <div className="max-w-4xl mx-auto relative z-10 py-10">
          <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-[#FFFFFF]/15 backdrop-blur-md border border-[#FFFFFF]/30 text-sm mb-8 text-[#F8FAFC] font-medium tracking-wide shadow-inner">
            <span>🌿 {dateTime || 'Gathering the moment...'}</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-6 leading-tight text-[#FFFFFF]">
            A Gentle Daily Ritual For Your Mind
          </h1>
          
          <p className="text-lg sm:text-xl text-[#E2E8F0] mb-10 max-w-2xl mx-auto font-normal leading-relaxed">
            Thoughtfully crafted mental exercises, quiet reflection prompts, and temporal grounding designed for active minds seeking clarity and balance.
          </p>

          <div className="flex justify-center items-center gap-4">
            <Link 
              href="/games" 
              className="px-9 py-4 bg-[#FFFFFF] text-[#1E3A8A] font-bold rounded-2xl text-base hover:bg-[#F8FAFC] transition shadow-xl shadow-black/10"
            >
              Begin Your Daily Session ✨
            </Link>
          </div>
        </div>
      </section>

      {/* 1-Click Save Section */}
      {!isInstalled && (
        <section className="py-10 bg-[#E2E8F0]/60 px-6 border-y border-[#CBD5E1] text-center">
          <div className="max-w-xl mx-auto bg-[#FFFFFF] p-8 rounded-3xl shadow-sm border border-[#CBD5E1]">
            <span className="text-xs font-bold uppercase tracking-widest bg-[#EFF6FF] text-[#1D4ED8] px-3.5 py-1.5 rounded-full border border-[#BFDBFE]">Quick Companion Access</span>
            <h2 className="text-xl font-bold text-[#0F172A] mt-4 mb-2">Keep This Sanctuary Close</h2>
            <p className="text-[#475569] text-sm mb-6 leading-relaxed">
              Add Free Brain Gain to your device home screen for a peaceful, single-tap routine every morning.
            </p>
            <button 
              onClick={handleInstallClick}
              className="px-6 py-3.5 bg-[#2563EB] text-[#FFFFFF] font-semibold rounded-2xl text-sm hover:bg-[#1D4ED8] transition shadow-sm inline-flex items-center gap-2.5"
            >
              <span>✨</span> Save App to Device
            </button>
          </div>
        </section>
      )}

      {/* Core Features Preview */}
      <section id="how-it-works" className="py-24 px-6 max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#0F172A] mb-3">Designed With Care</h2>
          <p className="text-[#475569] text-base">Harmonizing mental sharpness with emotional peace of mind.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-[#FFFFFF] p-10 rounded-3xl border border-[#CBD5E1] shadow-sm hover:shadow-md transition duration-300">
            <div className="w-12 h-12 bg-[#EFF6FF] text-[#2563EB] rounded-2xl flex items-center justify-center font-bold mb-6 text-base">I</div>
            <h3 className="text-lg font-bold text-[#0F172A] mb-3">Cognitive Harmony</h3>
            <p className="text-[#475569] text-sm leading-relaxed">
              Targeted workouts built to nurture active recall, clear focus, and joyful mental agility without the stress.
            </p>
          </div>

          <div className="bg-[#FFFFFF] p-10 rounded-3xl border border-[#CBD5E1] shadow-sm hover:shadow-md transition duration-300">
            <div className="w-12 h-12 bg-[#EFF6FF] text-[#2563EB] rounded-2xl flex items-center justify-center font-bold mb-6 text-base">II</div>
            <h3 className="text-lg font-bold text-[#0F172A] mb-3">Mindful Journaling</h3>
            <p className="text-[#475569] text-sm leading-relaxed">
              Quiet moments of daily expression that capture your thoughts, moods, and reflections for personal clarity.
            </p>
          </div>

          <div className="bg-[#FFFFFF] p-10 rounded-3xl border border-[#CBD5E1] shadow-sm hover:shadow-md transition duration-300">
            <div className="w-12 h-12 bg-[#EFF6FF] text-[#2563EB] rounded-2xl flex items-center justify-center font-bold mb-6 text-base">III</div>
            <h3 className="text-lg font-bold text-[#0F172A] mb-3">Temporal Grounding</h3>
            <p className="text-[#475569] text-sm leading-relaxed">
              A serene, real-time reflection of time and date, providing a comforting anchor for your daily rhythms.
            </p>
          </div>
        </div>
      </section>

      {/* The Games Showcase with Custom Pictures */}
      <section id="games-preview" className="py-24 bg-[#E2E8F0]/40 px-6 border-y border-[#CBD5E1]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#0F172A] mb-3">The Sanctuary Collection</h2>
            <p className="text-[#475569] text-base">Four immersive exercises tailored for balance, focus, and joy.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            
            {/* Game 1: Pyramid */}
            <div className="bg-[#FFFFFF] rounded-3xl overflow-hidden border border-[#CBD5E1] shadow-sm flex flex-col group hover:shadow-md transition">
              <div className="h-56 overflow-hidden bg-[#F8FAFC] flex items-center justify-center p-8 border-b border-[#CBD5E1]">
                <img 
                  src="/pyramid.png" 
                  alt="Pyramid Memory Game" 
                  className="max-h-full max-w-full object-contain group-hover:scale-105 transition duration-500"
                />
              </div>
              <div className="p-8 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider bg-[#EFF6FF] text-[#1D4ED8] px-3.5 py-1.5 rounded-full border border-[#BFDBFE]">Visual Recall</span>
                  <h3 className="text-xl font-bold text-[#0F172A] mt-4 mb-2">Pyramid Memory</h3>
                  <p className="text-[#475569] text-sm leading-relaxed mb-6">
                    Gently engage your short-term memory by uncovering tiered patterns and delightful visual pairs.
                  </p>
                </div>
                <Link href="/games" className="text-sm font-bold text-[#2563EB] hover:text-[#1D4ED8] transition inline-flex items-center gap-1.5">
                  Explore Pyramid Experience →
                </Link>
              </div>
            </div>

            {/* Game 2: Word */}
            <div className="bg-[#FFFFFF] rounded-3xl overflow-hidden border border-[#CBD5E1] shadow-sm flex flex-col group hover:shadow-md transition">
              <div className="h-56 overflow-hidden bg-[#F8FAFC] flex items-center justify-center p-8 border-b border-[#CBD5E1]">
                <img 
                  src="/word.png" 
                  alt="Word Association Game" 
                  className="max-h-full max-w-full object-contain group-hover:scale-105 transition duration-500"
                />
              </div>
              <div className="p-8 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider bg-[#EFF6FF] text-[#1D4ED8] px-3.5 py-1.5 rounded-full border border-[#BFDBFE]">Vocabulary & Fluency</span>
                  <h3 className="text-xl font-bold text-[#0F172A] mt-4 mb-2">Word Association</h3>
                  <p className="text-[#475569] text-sm leading-relaxed mb-6">
                    Connect meaningful concepts and uncover rich semantic threads to keep language flowing effortlessly.
                  </p>
                </div>
                <Link href="/games" className="text-sm font-bold text-[#2563EB] hover:text-[#1D4ED8] transition inline-flex items-center gap-1.5">
                  Explore Word Experience →
                </Link>
              </div>
            </div>

            {/* Game 3: Puzzle */}
            <div className="bg-[#FFFFFF] rounded-3xl overflow-hidden border border-[#CBD5E1] shadow-sm flex flex-col group hover:shadow-md transition">
              <div className="h-56 overflow-hidden bg-[#F8FAFC] flex items-center justify-center p-8 border-b border-[#CBD5E1]">
                <img 
                  src="/puzzle.png" 
                  alt="Spatial Grid Puzzle" 
                  className="max-h-full max-w-full object-contain group-hover:scale-105 transition duration-500"
                />
              </div>
              <div className="p-8 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider bg-[#EFF6FF] text-[#1D4ED8] px-3.5 py-1.5 rounded-full border border-[#BFDBFE]">Spatial Reasoning</span>
                  <h3 className="text-xl font-bold text-[#0F172A] mt-4 mb-2">Spatial Grid Puzzle</h3>
                  <p className="text-[#475569] text-sm leading-relaxed mb-6">
                    Navigate soothing spatial layouts and structural relationships at your own comfortable pace.
                  </p>
                </div>
                <Link href="/games" className="text-sm font-bold text-[#2563EB] hover:text-[#1D4ED8] transition inline-flex items-center gap-1.5">
                  Explore Spatial Puzzle →
                </Link>
              </div>
            </div>

            {/* Game 4: Piano */}
            <div className="bg-[#FFFFFF] rounded-3xl overflow-hidden border border-[#CBD5E1] shadow-sm flex flex-col group hover:shadow-md transition">
              <div className="h-56 overflow-hidden bg-[#F8FAFC] flex items-center justify-center p-8 border-b border-[#CBD5E1]">
                <img 
                  src="/piano.png" 
                  alt="Piano Sequence Challenge" 
                  className="max-h-full max-w-full object-contain group-hover:scale-105 transition duration-500"
                />
              </div>
              <div className="p-8 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider bg-[#EFF6FF] text-[#1D4ED8] px-3.5 py-1.5 rounded-full border border-[#BFDBFE]">Sequential Logic</span>
                  <h3 className="text-xl font-bold text-[#0F172A] mt-4 mb-2">Piano Sequence</h3>
                  <p className="text-[#475569] text-sm leading-relaxed mb-6">
                    Listen to gentle notes and recreate melodic sequences to nourish auditory and motor coordination.
                  </p>
                </div>
                <Link href="/games" className="text-sm font-bold text-[#2563EB] hover:text-[#1D4ED8] transition inline-flex items-center gap-1.5">
                  Explore Piano Sequence →
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Why Is It Useful */}
      <section id="benefits" className="py-24 px-6 max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#0F172A] mb-3">Created For Your Well-Being</h2>
          <p className="text-[#475569] text-base">Thoughtfully designed for everyday calm and lifelong cognitive vitality.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-[#FFFFFF] p-10 rounded-3xl shadow-sm border border-[#CBD5E1]">
            <h3 className="font-bold text-base text-[#1E3A8A] mb-3">Steady Rhythms</h3>
            <p className="text-sm text-[#475569] leading-relaxed">Daily touches help center your mind, creating a peaceful cadence to your morning or evening routine.</p>
          </div>
          <div className="bg-[#FFFFFF] p-10 rounded-3xl shadow-sm border border-[#CBD5E1]">
            <h3 className="font-bold text-base text-[#1E3A8A] mb-3">Active Vitality</h3>
            <p className="text-sm text-[#475569] leading-relaxed">Meaningful challenges encourage ongoing neural resilience and deep, focused presence.</p>
          </div>
          <div className="bg-[#FFFFFF] p-10 rounded-3xl shadow-sm border border-[#CBD5E1]">
            <h3 className="font-bold text-base text-[#1E3A8A] mb-3">Connected Peace</h3>
            <p className="text-sm text-[#475569] leading-relaxed">Quietly share your reflections with loved ones without any high-pressure demands.</p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-[#E2E8F0]/40 px-6 border-t border-[#CBD5E1] text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#0F172A] mb-3">A Gift To Our Community</h2>
          <p className="text-[#475569] text-base mb-10">Completely free, open access with zero distractions or commercial tracking.</p>
          
          <div className="bg-[#FFFFFF] border-2 border-[#2563EB] p-10 rounded-3xl shadow-sm text-left">
            <div className="flex justify-between items-center mb-6">
              <span className="text-xs font-bold uppercase tracking-wider bg-[#EFF6FF] text-[#1D4ED8] px-3.5 py-1.5 rounded-full border border-[#BFDBFE]">Open Sanctuary</span>
              <span className="text-4xl font-extrabold text-[#0F172A]">$0</span>
            </div>
            <p className="text-sm text-[#475569] leading-relaxed mb-8">
              Complete, unlimited access to all four mental exercise modules, real-time temporal grounding, and secure daily reflection notes.
            </p>
            <Link 
              href="/games" 
              className="block w-full py-4 bg-[#2563EB] text-[#FFFFFF] rounded-2xl font-bold text-base tracking-wide text-center hover:bg-[#1D4ED8] transition shadow-lg shadow-[#2563EB]/15"
            >
              Enter Sanctuary Now ✨
            </Link>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 bg-[#1E3A8A] text-[#FFFFFF] px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">We Are Here For You</h2>
          <p className="text-[#E2E8F0] text-base sm:text-lg mb-8 leading-relaxed">
            Reach out with any feedback, accessibility questions, or thoughts on how we can improve your sanctuary experience.
          </p>
          <div className="inline-block bg-[#1D4ED8] border border-[#60A5FA] px-8 py-5 rounded-3xl shadow-md">
            <p className="text-xs text-[#E2E8F0] font-medium mb-1">Direct Support Correspondence</p>
            <a href="mailto:freebraingain@gmail.com" className="text-[#FEF08A] font-bold text-base sm:text-lg hover:underline tracking-wide">
              freebraingain@gmail.com
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-[#0F172A] text-[#94A3B8] text-xs text-center border-t border-[#1E3A8A]">
        <p>© {new Date().getFullYear()} Free Brain Gain. Crafted with care for mental wellness and gentle connection.</p>
      </footer>

    </div>
  );
}