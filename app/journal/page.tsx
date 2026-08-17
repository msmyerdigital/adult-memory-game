'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface JournalEntry {
  id: string;
  date: string;
  mood: string;
  pain: string;
  note: string;
}

export default function JournalHistoryPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);

  useEffect(() => {
    const savedEntries = localStorage.getItem('journalEntries');
    if (savedEntries) {
      setEntries(JSON.parse(savedEntries));
    }
  }, []);

  const clearHistory = () => {
    if (confirm('Are you sure you want to delete all local entries? This cannot be undone.')) {
      localStorage.removeItem('journalEntries');
      setEntries([]);
    }
  };

  return (
    <main className="min-h-dvh w-screen bg-[#F8FAFC] text-[#0F172A] font-sans p-3 md:p-6 flex flex-col justify-between">
      <div className="w-full max-w-2xl mx-auto flex flex-col gap-6">
        
        {/* Navigation */}
        <div className="flex justify-between items-center bg-white px-4 py-3 rounded-2xl shadow-sm border border-slate-200">
          <Link href="/journal" className="text-xs font-extrabold text-[#2563EB] hover:underline">
            ← Back to Journal Entry
          </Link>
          <span className="text-xs font-bold text-slate-500">Private Local History</span>
        </div>

        {/* Header & Clear Option */}
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-black text-slate-900">Your Journal Archive</h1>
            <p className="text-xs text-slate-500 mt-1">Stored securely and privately on your device.</p>
          </div>
          {entries.length > 0 && (
            <button 
              onClick={clearHistory}
              className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl text-xs font-bold transition-colors border border-red-200"
            >
              Clear History
            </button>
          )}
        </div>

        {/* Blog Entries Feed */}
        <div className="flex flex-col gap-4">
          {entries.length === 0 ? (
            <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center text-slate-400 text-sm font-medium">
              No journal entries found yet. Write your first entry to see it here!
            </div>
          ) : (
            entries.map((entry) => (
              <article key={entry.id} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col gap-3">
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <span className="text-xs font-extrabold text-slate-400">{entry.date}</span>
                  <div className="flex gap-2">
                    <span className="px-2.5 py-0.5 bg-slate-100 text-slate-800 rounded-full text-xs font-bold">
                      {entry.mood}
                    </span>
                    <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs font-bold">
                      {entry.pain}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
                  {entry.note || <span className="italic text-slate-400">No notes written for this entry.</span>}
                </p>
              </article>
            ))
          )}
        </div>

      </div>
    </main>
  );
}