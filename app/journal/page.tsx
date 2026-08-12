'use client';

import { useState, useEffect } from 'react';
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
      activeBg: 'bg-emerald-600 text-white border-emerald-700 shadow-md scale-[1.02]', 
      defaultBg: 'bg-emerald-50 text-emerald-900 border-emerald-200 hover:bg-emerald-100' 
    },
    { 
      name: 'Calm', 
      activeBg: 'bg-sky-600 text-white border-sky-700 shadow-md scale-[1.02]', 
      defaultBg: 'bg-sky-50 text-sky-900 border-sky-200 hover:bg-sky-100' 
    },
    { 
      name: 'Thoughtful', 
      activeBg: 'bg-amber-600 text-white border-amber-700 shadow-md scale-[1.02]', 
      defaultBg: 'bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100' 
    },
    { 
      name: 'Tired', 
      activeBg: 'bg-indigo-600 text-white border-indigo-700 shadow-md scale-[1.02]', 
      defaultBg: 'bg-indigo-50 text-indigo-900 border-indigo-200 hover:bg-indigo-100' 
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

  return (
    <main className="h-screen w-screen bg-[#F7F6F3] text-[#1E293B] p-2 md:p-3 flex flex-col justify-between overflow-hidden select-none relative">
      
      <nav className="w-full max-w-4xl mx-auto flex justify-between items-center bg-white px-5 py-2.5 rounded-2xl shadow-sm border border-stone-200 text-stone-900">
        <h1 className="text-lg font-bold tracking-tight text-stone-900">Journal Hub</h1>
        <div className="flex gap-2">
          <Link href="/games" className="px-4 py-1.5 bg-white text-stone-400 hover:text-stone-700 rounded-xl text-sm font-semibold transition-colors">Games</Link>
          <Link href="/journal" className="px-4 py-1.5 bg-black text-white rounded-xl text-sm font-semibold transition-colors">Journal</Link>
        </div>
      </nav>

      <div className="w-full max-w-5xl mx-auto bg-white p-5 md:p-6 rounded-3xl shadow-sm border border-stone-300 flex flex-col gap-4">
        
        <div className="bg-stone-50 p-3.5 px-5 rounded-2xl border border-stone-200 flex justify-between items-center">
          <div>
            <span className="text-xs uppercase tracking-widest text-stone-500 block mb-1">Loved One Contact</span>
            <span className="text-base md:text-lg text-slate-900">
              {lovedOneName ? `${lovedOneName} (${lovedOnePhone || 'No phone'})` : (lovedOnePhone || 'Not set yet')}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsEditingContact(!isEditingContact)}
            className="px-4 py-2 bg-white border border-stone-300 hover:bg-stone-100 text-slate-800 rounded-xl text-sm transition-colors shadow-sm"
          >
            {isEditingContact ? 'Close' : 'Change Contact'}
          </button>
        </div>

        {isEditingContact && (
          <form onSubmit={handleSaveContact} className="flex flex-col gap-3 bg-stone-50 p-4 rounded-2xl border border-stone-200">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-stone-700">Loved One's Name</label>
              <input
                type="text"
                value={lovedOneName}
                onChange={(e) => setLovedOneName(e.target.value)}
                placeholder="e.g. Sarah"
                className="p-3 rounded-xl border border-stone-300 text-base outline-none bg-white text-slate-900 focus:border-slate-500"
                required
              />
            </div>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-stone-700">Loved One's Phone Number</label>
              <input
                type="tel"
                value={lovedOnePhone}
                onChange={(e) => setLovedOnePhone(e.target.value)}
                placeholder="e.g. +1234567890"
                className="p-3 rounded-xl border border-stone-300 text-base outline-none bg-white text-slate-900 focus:border-slate-500"
                required
              />
            </div>

            <button
              type="submit"
              className="py-2.5 px-4 bg-slate-800 text-white border-none rounded-xl text-base hover:bg-slate-700 transition-colors mt-1"
            >
              Save Contact
            </button>
          </form>
        )}

        <form onSubmit={handleSave} className="flex flex-col gap-4">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <div className="bg-stone-50/70 p-4 rounded-2xl border border-stone-200 flex flex-col justify-between">
              <span className="text-base text-slate-900 block mb-3">How are you feeling right now?</span>
              <div className="grid grid-cols-2 gap-2.5">
                {moods.map((m) => {
                  const isSelected = selectedMood === m.name;
                  return (
                    <button
                      type="button"
                      key={m.name}
                      onClick={() => setSelectedMood(m.name)}
                      className={`py-3.5 px-3 rounded-xl text-base transition-all border text-center ${
                        isSelected ? m.activeBg : m.defaultBg
                      }`}
                    >
                      {m.name}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="bg-stone-50/70 p-4 rounded-2xl border border-stone-200 flex flex-col justify-between">
              <span className="text-base text-slate-900 block mb-3">Medical Pain Scale Assessment</span>
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
                          ? 'bg-slate-900 text-white border-slate-900 shadow-sm scale-105' 
                          : 'bg-white text-slate-900 border-stone-300 hover:bg-stone-50'
                      }`}
                    >
                      <span className="text-xl md:text-2xl leading-none mb-1">{p.face}</span>
                      <span className="text-sm leading-none">{p.level}</span>
                    </button>
                  );
                })}
              </div>
              {selectedPain !== null && (
                <span className="text-sm text-slate-900 mt-2 text-center">
                  Pain Level {selectedPain}
                </span>
              )}
            </div>

          </div>

          <textarea
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Type your thoughts or notes here..."
            className="w-full p-3.5 rounded-2xl border border-stone-300 text-base text-slate-900 outline-none bg-stone-50/50 focus:bg-white focus:border-slate-500 transition-colors resize-none"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-slate-900 text-white text-lg rounded-2xl shadow-sm hover:bg-slate-800 transition-all disabled:opacity-50"
          >
            {loading ? 'Sending...' : `Save & Text ${lovedOneName || 'Loved One'}`}
          </button>

          {statusMessage && (
            <div className={`p-3 text-center text-sm rounded-xl ${statusMessage.isError ? 'bg-red-50 text-red-800 border border-red-200' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'}`}>
              {statusMessage.text}
            </div>
          )}
        </form>
      </div>

      <div className="w-full max-w-5xl mx-auto text-center text-xs text-stone-500 pb-1">
        Daily Companion Journal
      </div>

    </main>
  );
}