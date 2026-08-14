'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

export default function JournalPage() {
  const [selectedMood, setSelectedMood] = useState('Happy');
  const [selectedPain, setSelectedPain] = useState<number | null>(null);
  const [note, setNote] = useState('');
  const [lovedOneName, setLovedOneName] = useState('');
  const [lovedOnePhone, setLovedOnePhone] = useState('');
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; isError: boolean } | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const savedName = localStorage.getItem('lovedOneName');
    const savedPhone = localStorage.getItem('lovedOnePhone');
    
    if (savedName) setLovedOneName(savedName);
    if (savedPhone) {
      setLovedOnePhone(savedPhone);
    } else {
      setIsEditingContact(true);
    }
  }, []);

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

  const handleSaveContact = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('lovedOneName', lovedOneName);
    localStorage.setItem('lovedOnePhone', lovedOnePhone);
    setIsEditingContact(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lovedOnePhone) {
      setStatusMessage({ text: 'Please set your loved one contact info first.', isError: true });
      setIsEditingContact(true);
      return;
    }

    setLoading(true);
    setStatusMessage(null);

    const activePainObj = medicalPainScale.find(p => p.level === selectedPain);
    const painDescription = activePainObj !== undefined ? `Pain Level: ${activePainObj.level}/10` : 'Pain Level: Not specified';
    const fullNote = `${note}\n\n${painDescription}`.trim();

    try {
      const response = await fetch('/api/send-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          mood: selectedMood, 
          note: fullNote, 
          recipientPhone: lovedOnePhone,
          recipientName: lovedOneName 
        }),
      });

      if (response.ok) {
        setStatusMessage({ text: `Entry saved and sent to ${lovedOneName || 'Loved One'}!`, isError: false });
        setNote('');
      } else {
        throw new Error('Failed to send.');
      }
    } catch {
      setStatusMessage({ text: 'Saved locally.', isError: true });
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
      className="min-h-dvh w-screen bg-[#F8FAFC] text-[#0F172A] font-sans selection:bg-[#2563EB] selection:text-[#FFFFFF] p-3 md:p-4 flex flex-col justify-between overflow-x-hidden select-none cursor-text"
      onClick={triggerFocusKeyboard}
    >
      
      <nav className="w-full max-w-4xl mx-auto flex justify-between items-center bg-white px-4 py-2.5 rounded-2xl shadow-sm border border-slate-200 text-slate-900 pointer-events-auto">
        <div className="flex items-center gap-2">
          <Link href="https://freebraingain.vercel.app/" className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#059669]"></span>
            <span className="font-extrabold text-xs tracking-tight text-slate-900">
              Free Brain Gain
            </span>
          </Link>
        </div>
        <div className="flex gap-2">
          <Link href="/games" className="px-3.5 py-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl text-xs font-extrabold transition-colors shadow-sm">Games</Link>
          <Link href="/journal" className="px-3.5 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-extrabold transition-colors">Journal</Link>
        </div>
      </nav>

      <div className="w-full max-w-4xl mx-auto bg-white p-4 md:p-6 rounded-3xl shadow-sm border border-slate-200 flex flex-col gap-4 pointer-events-auto my-3">
        
        <div className="bg-slate-50 p-3 px-4 rounded-2xl border border-slate-200 flex justify-between items-center">
          <div>
            <span className="text-[10px] uppercase tracking-widest text-slate-400 font-extrabold block mb-0.5">Loved One Contact</span>
            <span className="text-sm md:text-base text-slate-900 font-bold">
              {lovedOneName ? `${lovedOneName} (${lovedOnePhone || 'No phone'})` : (lovedOnePhone || 'Not set yet')}
            </span>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsEditingContact(!isEditingContact);
            }}
            className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-800 rounded-xl text-xs font-bold transition-colors shadow-sm"
          >
            {isEditingContact ? 'Close' : 'Change'}
          </button>
        </div>

        {isEditingContact && (
          <form onSubmit={handleSaveContact} onClick={(e) => e.stopPropagation()} className="flex flex-col gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-700">Loved One's Name</label>
              <input
                type="text"
                value={lovedOneName}
                onChange={(e) => setLovedOneName(e.target.value)}
                placeholder="e.g. Sarah"
                className="p-3 rounded-xl border border-slate-200 text-sm outline-none bg-white text-slate-900 focus:border-[#2563EB]"
                required
              />
            </div>
            
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-700">Loved One's Phone Number</label>
              <input
                type="tel"
                value={lovedOnePhone}
                onChange={(e) => setLovedOnePhone(e.target.value)}
                placeholder="e.g. +1234567890"
                className="p-3 rounded-xl border border-slate-200 text-sm outline-none bg-white text-slate-900 focus:border-[#2563EB]"
                required
              />
            </div>

            <button
              type="submit"
              className="py-2.5 px-4 bg-[#059669] text-white border-none rounded-xl text-sm font-extrabold hover:bg-[#047857] transition-colors mt-1 shadow-sm"
            >
              Save Contact
            </button>
          </form>
        )}

        <form onSubmit={handleSave} onClick={(e) => e.stopPropagation()} className="flex flex-col gap-4">
          
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
            {loading ? 'Sending...' : `Save & Text ${lovedOneName || 'Loved One'}`}
          </button>

          {statusMessage && (
            <div className={`p-3 text-center text-xs font-bold rounded-xl ${statusMessage.isError ? 'bg-red-50 text-red-800 border border-red-200' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'}`}>
              {statusMessage.text}
            </div>
          )}
        </form>
      </div>

      <div className="w-full max-w-4xl mx-auto text-center text-xs font-bold text-slate-500 pb-1">
        Daily Companion Journal
      </div>

    </main>
  );
}