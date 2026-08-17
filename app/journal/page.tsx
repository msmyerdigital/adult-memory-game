'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

export default function JournalPage() {
  const [selectedMood, setSelectedMood] = useState('Happy');
  const [selectedPain, setSelectedPain] = useState<number | null>(null);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; isError: boolean } | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const moods = [
    { 
      name: 'Happy', 
      activeBg: 'bg-[#059669] text-white border-[#059669] shadow-md scale-[1.02]', 
      defaultBg: 'bg-white text-slate-900 border-slate-300 hover:bg-slate-50' 
    },
    { 
      name: 'Calm', 
      activeBg: 'bg-[#2563EB] text-white border-[#2563EB] shadow-md scale-[1.02]', 
      defaultBg: 'bg-white text-slate-900 border-slate-300 hover:bg-slate-50' 
    },
    { 
      name: 'Thoughtful', 
      activeBg: 'bg-[#D97706] text-white border-[#D97706] shadow-md scale-[1.02]', 
      defaultBg: 'bg-white text-slate-900 border-slate-300 hover:bg-slate-50' 
    },
    { 
      name: 'Tired', 
      activeBg: 'bg-[#94A3B8] text-white border-[#94A3B8] shadow-md scale-[1.02]', 
      defaultBg: 'bg-white text-slate-900 border-slate-300 hover:bg-slate-50' 
    },
  ];

  const medicalPainScale = [
    { level: 0, face: '😊' },
    { level: 2, face: '🙂' },
    { level: 4, face: '😐' },
    { level: 6, face: '🙁' },
    { level: 8, face: '😣' },
    { level: 10, face: '😢' },
  ];

  const handleSaveJournal = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatusMessage(null);

    try {
      const activePainObj = medicalPainScale.find(p => p.level === selectedPain);
      const painDescription = activePainObj !== undefined ? `Pain Level: ${activePainObj.level}/10` : 'Pain Level: Not specified';

      const newEntry = {
        id: Date.now().toString(),
        date: new Date().toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric', 
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        mood: selectedMood,
        pain: painDescription,
        note: note.trim(),
      };

      const existingEntries = JSON.parse(localStorage.getItem('journalEntries') || '[]');
      const updatedEntries = [newEntry, ...existingEntries];
      localStorage.setItem('journalEntries', JSON.stringify(updatedEntries));

      setNote('');
      setStatusMessage({ text: 'Entry saved locally to your journal!', isError: false });
    } catch {
      setStatusMessage({ text: 'Failed to save entry locally.', isError: true });
    } finally {
      setLoading(false);
    }
  };

  const triggerFocusKeyboard = () => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  return (
    <main 
      className="min-h-dvh w-screen bg-[#F8FAFC] text-[#0F172A] font-sans selection:bg-[#2563EB] selection:text-[#FFFFFF] flex flex-col justify-between overflow-x-hidden select-none cursor-text box-border"
      onClick={triggerFocusKeyboard}
    >
      
      {/* Top Professional Navigation Header */}
      <header className="border-b border-[#E2E8F0] bg-[#FFFFFF] px-4 sm:px-6 py-2.5 flex justify-between items-center shrink-0 shadow-xs pointer-events-auto">
        <Link href="https://freebraingain.vercel.app/" className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#059669]"></span>
          <span className="font-extrabold text-sm tracking-tight text-[#0F172A]">
            Free Brain Gain <span className="text-[#2563EB]">Portal</span>
          </span>
        </Link>

        <div className="flex items-center gap-2 flex-wrap justify-end">
          <Link 
            href="/games" 
            className="px-3 py-1.5 bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#334155] border border-[#CBD5E1] font-bold text-[11px] uppercase tracking-wider rounded transition"
          >
            Games
          </Link>
          <Link 
            href="/journal" 
            className="px-3 py-1.5 bg-[#2563EB] text-[#FFFFFF] font-extrabold text-[11px] uppercase tracking-wider rounded transition shadow-xs"
          >
            Journal
          </Link>
          <Link 
            href="/journal/history" 
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[11px] uppercase tracking-wider rounded transition shadow-xs"
          >
            See your journal
          </Link>
        </div>
      </header>

      <div className="w-full max-w-4xl mx-auto bg-white p-4 md:p-6 rounded-3xl shadow-sm border border-slate-200 flex flex-col gap-4 pointer-events-auto my-3">
        
        <div className="bg-slate-50 p-3 px-4 rounded-2xl border border-slate-200 flex justify-between items-center">
          <div>
            <span className="text-[10px] uppercase tracking-widest text-slate-400 font-extrabold block mb-0.5">Private Local Storage</span>
            <span className="text-sm md:text-base text-slate-900 font-bold">
              Your entries stay safe and private on this device.
            </span>
          </div>
        </div>

        <form onSubmit={handleSaveJournal} onClick={(e) => e.stopPropagation()} className="flex flex-col gap-4">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200 flex flex-col justify-between">
              <span className="text-sm font-extrabold text-slate-900 block mb-2.5">How are you feeling right now?</span>
              <div className="grid grid-cols-2 gap-2">
                {moods.map((m) => {
                  const isSelected = selectedMood === m.name;
                  return (
                    <button
                      type="button"
                      key={m.name}
                      onClick={() => setSelectedMood(m.name)}
                      className={`py-3 px-2 rounded-xl text-sm font-bold transition-all border text-center ${
                        isSelected ? m.activeBg : m.defaultBg
                      }`}
                    >
                      {m.name}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200 flex flex-col justify-between">
              <span className="text-sm font-extrabold text-slate-900 block mb-2.5">Medical Pain Scale Assessment</span>
              <div className="grid grid-cols-6 gap-1.5">
                {medicalPainScale.map((p) => {
                  const isSelected = selectedPain === p.level;
                  return (
                    <button
                      type="button"
                      key={p.level}
                      onClick={() => setSelectedPain(p.level)}
                      className={`aspect-square p-1 rounded-xl border transition-all flex flex-col items-center justify-center ${
                        isSelected 
                          ? 'bg-[#2563EB] text-white border-[#2563EB] shadow-sm scale-105' 
                          : 'bg-white text-slate-900 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-lg leading-none mb-1">{p.face}</span>
                      <span className="text-xs font-extrabold leading-none">{p.level}</span>
                    </button>
                  );
                })}
              </div>
              {selectedPain !== null && (
                <span className="text-xs font-bold text-slate-900 mt-2 text-center">
                  Pain Level {selectedPain}
                </span>
              )}
            </div>

          </div>

          <textarea
            ref={textareaRef}
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Type your thoughts or notes here..."
            className="w-full p-3.5 rounded-2xl border border-slate-200 text-sm text-slate-900 outline-none bg-slate-50/50 focus:bg-white focus:border-[#2563EB] transition-colors resize-none shadow-sm"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#2563EB] text-white text-base font-black uppercase tracking-wider rounded-2xl shadow-md hover:bg-[#1D4ED8] transition-all disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save my journal'}
          </button>

          {statusMessage && (
            <div className={`p-3 text-center text-xs font-bold rounded-xl ${statusMessage.isError ? 'bg-red-50 text-red-800 border border-red-200' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'}`}>
              {statusMessage.text}
            </div>
          )}
        </form>
      </div>

      {/* Footer */}
      <footer className="border-t border-[#E2E8F0] bg-[#FFFFFF] px-4 sm:px-6 py-2.5 text-center text-[10px] text-[#64748B] flex justify-between items-center shrink-0 mt-4">
        <p className="uppercase tracking-widest font-semibold">Free Brain Gain Portal</p>
        <p className="font-mono text-[#94A3B8]">© {new Date().getFullYear()}</p>
      </footer>

    </main>
  );
}