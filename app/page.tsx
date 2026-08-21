'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function HomeLandingPage() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  useEffect(() => {
    setIsMounted(true);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => {
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
      alert("To save this app, use your browser menu or press Ctrl+D (Cmd+D on Mac) to bookmark it!");
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] font-sans selection:bg-[#2563EB] selection:text-[#FFFFFF] flex flex-col justify-between">
      
      {/* Top Professional Navigation Header with SVG Logo */}
      <header className="border-b border-[#E2E8F0] bg-[#FFFFFF]/90 backdrop-blur-md px-4 sm:px-8 py-4 flex justify-between items-center sticky top-0 z-50 shadow-xs">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5 group">
            <img 
              src="/logo.svg" 
              alt="Free Brain Gain Logo" 
              className="w-8 h-8 rounded-lg shadow-sm group-hover:scale-105 transition" 
            />
            <span className="font-extrabold text-sm sm:text-base tracking-tight text-[#0F172A]">
              Free Brain Gain <span className="text-[#2563EB]">Portal</span>
            </span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-6 text-xs font-bold uppercase tracking-widest text-[#64748B]">
          <a href="#games" className="hover:text-[#2563EB] transition">Games</a>
          <a href="#samples" className="hover:text-[#2563EB] transition">Previews</a>
          <a href="#benefits" className="hover:text-[#2563EB] transition">Why It's Good</a>
          <a href="#free" className="hover:text-[#059669] transition">100% Free</a>
          <a href="#contact" className="hover:text-[#2563EB] transition">Contact</a>
        </nav>

        {/* Buttons Group: Save App with Triangle icon placed before Play Now */}
        <div className="flex items-center gap-2 sm:gap-3">
          {isMounted && !isInstalled && (
            <button 
              onClick={handleInstallClick}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#334155] border border-[#CBD5E1] font-extrabold text-xs uppercase tracking-wider rounded transition shadow-2xs"
            >
              <span>▲</span> Save App
            </button>
          )}

          <Link 
            href="/games" 
            className="px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-[#FFFFFF] font-extrabold text-xs uppercase tracking-widest rounded transition shadow-sm"
          >
            Play Now ➔
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-6xl w-full mx-auto px-4 sm:px-8 pt-16 pb-16">
        <div className="grid md:grid-cols-12 gap-8 items-center">
          
          <div className="md:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 bg-[#EFF6FF] border border-[#BFDBFE] px-3 py-1 rounded-full text-xs font-bold text-[#2563EB] uppercase tracking-widest">
              <span>Your Cognitive Fitness Hub</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-[#0F172A] uppercase leading-none font-sans">
              Train Your Mind. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2563EB] to-[#0D9488]">
                Elevate Focus.
              </span>
            </h1>

            <p className="text-[#475569] text-sm sm:text-base leading-relaxed max-w-xl">
              Access high-contrast, zero-distraction mini-games scientifically crafted to enhance memory, vocabulary, logic, and cognitive reflexes. Completely free, open-access, and optimized for daily enrichment.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Link 
                href="/games" 
                className="flex-1 py-4 px-8 bg-[#2563EB] hover:bg-[#1D4ED8] text-[#FFFFFF] font-extrabold text-xs uppercase tracking-[0.2em] text-center rounded-lg shadow-md transition"
              >
                Launch Game Hub ➔
              </Link>
            </div>
          </div>

          {/* Quick Hub Grid */}
          <div id="games" className="md:col-span-5 grid grid-cols-2 gap-4">
            <Link href="/games" className="bg-[#FFFFFF] border border-[#E2E8F0] p-4 rounded-xl shadow-xs hover:border-[#2563EB] hover:shadow-md transition group block">
              <h3 className="font-bold text-sm text-[#0F172A] group-hover:text-[#2563EB] transition">Piano Memory</h3>
              <p className="text-[11px] text-[#64748B] mt-1">Test your pitch & recall sequence.</p>
            </Link>

            <Link href="/games" className="bg-[#FFFFFF] border border-[#E2E8F0] p-4 rounded-xl shadow-xs hover:border-[#2563EB] hover:shadow-md transition group block">
              <h3 className="font-bold text-sm text-[#0F172A] group-hover:text-[#2563EB] transition">Word Search</h3>
              <p className="text-[11px] text-[#64748B] mt-1">High-contrast lexical discovery.</p>
            </Link>

            <Link href="/games" className="bg-[#FFFFFF] border border-[#E2E8F0] p-4 rounded-xl shadow-xs hover:border-[#2563EB] hover:shadow-md transition group block">
              <h3 className="font-bold text-sm text-[#0F172A] group-hover:text-[#2563EB] transition">Number Pyramid</h3>
              <p className="text-[11px] text-[#64748B] mt-1">Logical arithmetic sequencing.</p>
            </Link>

            <Link href="/games" className="bg-[#FFFFFF] border border-[#E2E8F0] p-4 rounded-xl shadow-xs hover:border-[#2563EB] hover:shadow-md transition group block">
              <h3 className="font-bold text-sm text-[#0F172A] group-hover:text-[#2563EB] transition">Jigsaw Assembly</h3>
              <p className="text-[11px] text-[#64748B] mt-1">Spatial-relational problem solving.</p>
            </Link>
          </div>

        </div>
      </section>

      {/* Visual Game Samples Section */}
      <section id="samples" className="py-16 bg-[#F1F5F9] border-y border-[#E2E8F0] px-4 sm:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#2563EB]">Visual Preview</span>
            <h2 className="text-3xl font-black text-[#0F172A] mt-2">What The Games Look Like</h2>
            <p className="text-[#475569] text-sm mt-1">Clean, high-contrast layouts designed with large typography for comfortable viewing.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            
            <Link href="/games" className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl p-6 shadow-xs hover:border-[#2563EB] hover:shadow-md transition flex flex-col justify-between group block">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs uppercase font-bold bg-[#EFF6FF] text-[#2563EB] px-3 py-1 rounded">Sample 01</span>
                  <span className="text-xs text-[#64748B]">Sound & Audio</span>
                </div>
                <h3 className="text-xl font-bold text-[#0F172A] mb-2 group-hover:text-[#2563EB] transition">Piano Memory Interface</h3>
                <p className="text-sm text-[#475569] mb-6">Large interactive tiles that highlight sequential musical notes to stimulate auditory memory and recall.</p>
              </div>

              <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg p-6 flex justify-center items-center gap-3">
                <div className="w-12 h-24 bg-[#2563EB] rounded-md flex items-end justify-center pb-2 text-xs font-bold text-white shadow-xs">Do</div>
                <div className="w-12 h-24 bg-[#0D9488] rounded-md flex items-end justify-center pb-2 text-xs font-bold text-white shadow-xs">Re</div>
                <div className="w-12 h-24 bg-[#D97706] rounded-md flex items-end justify-center pb-2 text-xs font-bold text-white shadow-xs">Mi</div>
                <div className="w-12 h-24 bg-[#7C3AED] rounded-md flex items-end justify-center pb-2 text-xs font-bold text-white shadow-xs">Fa</div>
              </div>
            </Link>

            <Link href="/games" className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl p-6 shadow-xs hover:border-[#2563EB] hover:shadow-md transition flex flex-col justify-between group block">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs uppercase font-bold bg-[#ECFDF5] text-[#059669] px-3 py-1 rounded">Sample 02</span>
                  <span className="text-xs text-[#64748B]">Lexical Grid</span>
                </div>
                <h3 className="text-xl font-bold text-[#0F172A] mb-2 group-hover:text-[#2563EB] transition">Word Search Grid</h3>
                <p className="text-sm text-[#475569] mb-6">Spacious letter matrices with clear bold typography designed to eliminate eye strain during puzzles.</p>
              </div>

              <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg p-4 flex justify-center">
                <div className="grid grid-cols-5 gap-2 font-mono text-sm font-bold text-center">
                  <span className="bg-[#FFFFFF] border border-[#E2E8F0] p-2 rounded text-[#2563EB]">B</span>
                  <span className="bg-[#FFFFFF] border border-[#E2E8F0] p-2 rounded text-[#0F172A]">R</span>
                  <span className="bg-[#FFFFFF] border border-[#E2E8F0] p-2 rounded text-[#0F172A]">A</span>
                  <span className="bg-[#FFFFFF] border border-[#E2E8F0] p-2 rounded text-[#0F172A]">I</span>
                  <span className="bg-[#FFFFFF] border border-[#E2E8F0] p-2 rounded text-[#0F172A]">N</span>
                  <span className="bg-[#FFFFFF] border border-[#E2E8F0] p-2 rounded text-[#0F172A]">M</span>
                  <span className="bg-[#FFFFFF] border border-[#E2E8F0] p-2 rounded text-[#059669]">G</span>
                  <span className="bg-[#FFFFFF] border border-[#E2E8F0] p-2 rounded text-[#0F172A]">A</span>
                  <span className="bg-[#FFFFFF] border border-[#E2E8F0] p-2 rounded text-[#0F172A]">M</span>
                  <span className="bg-[#FFFFFF] border border-[#E2E8F0] p-2 rounded text-[#0F172A]">E</span>
                </div>
              </div>
            </Link>

          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-16 px-4 sm:px-8 max-w-4xl mx-auto">
        <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-8 sm:p-12 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#059669] bg-[#ECFDF5] px-3 py-1 rounded-full">
            Cognitive Wellness
          </span>

          <h2 className="text-2xl sm:text-4xl font-black text-[#0F172A] mt-4 mb-6 leading-tight">
            Why Daily Brain Games Are Excellent For Your Mental Health
          </h2>

          <div className="space-y-4 text-[#475569] text-sm sm:text-base leading-relaxed">
            <p>
              Engaging in short, structured cognitive activities each day provides an ideal workout for your mind. Much like physical exercise keeps your body limber, brief sessions of pattern recognition, vocabulary retrieval, and logic puzzles stimulate neuroplasticity.
            </p>
            <p>
              Furthermore, playing games without timers or competitive pressure offers a wonderful psychological break. It helps lower cortisol levels, encourages mindfulness, and builds a comforting, positive daily routine you can look forward to every morning with your coffee.
            </p>
          </div>
        </div>
      </section>

      {/* Free Guarantee Section */}
      <section id="free" className="py-16 bg-[#ECFDF5]/60 border-y border-[#A7F3D0] px-4 sm:px-8 text-center">
        <div className="max-w-2xl mx-auto space-y-4">
          <span className="text-xs font-bold uppercase tracking-[0.2em] bg-[#059669] text-[#FFFFFF] px-3 py-1 rounded-full">
            100% Free Guarantee
          </span>

          <h2 className="text-3xl sm:text-4xl font-black text-[#0F172A]">
            Always Free. No Paywalls. No Ads.
          </h2>

          <p className="text-[#334155] text-sm sm:text-base leading-relaxed">
            We believe mental stimulation and joyful play should be accessible to everyone. There are zero subscriptions, no hidden in-app purchases, and no annoying advertisements interrupting your games.
          </p>

          <div className="pt-4">
            <Link 
              href="/games" 
              className="inline-block px-8 py-3.5 bg-[#059669] hover:bg-[#047857] text-[#FFFFFF] font-extrabold text-xs uppercase tracking-[0.2em] rounded-lg shadow-sm transition"
            >
              Start Playing For Free Now ➔
            </Link>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 px-4 sm:px-8 max-w-3xl mx-auto text-center">
        <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-8 shadow-sm space-y-4">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#2563EB]">Get In Touch</span>
          <h2 className="text-2xl font-bold text-[#0F172A]">We Love Hearing From Players</h2>
          <p className="text-[#475569] text-sm max-w-lg mx-auto">
            Have a suggestion for a new game, feedback on the design, or just want to say hello? Drop us a line anytime!
          </p>
          
          <div className="pt-2">
            <a 
              href="mailto:freebraingain@gmail.com" 
              className="inline-block bg-[#F8FAFC] hover:bg-[#F1F5F9] text-[#2563EB] font-bold text-sm px-6 py-3 rounded-lg border border-[#CBD5E1] transition"
            >
              freebraingain@gmail.com
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#E2E8F0] bg-[#FFFFFF] px-4 sm:px-8 py-6 text-center text-xs text-[#64748B] flex flex-col sm:flex-row justify-between items-center gap-3">
        <p className="uppercase tracking-widest font-semibold">Free Brain Gain Portal &bull; All Rights Reserved</p>
        <p className="font-mono text-[11px] text-[#94A3B8]">© {new Date().getFullYear()} Free Brain Gain</p>
      </footer>

    </div>
  );
}