'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface JournalEntry {
  id: string;
  dateStr: string;
  mood: string;
  painLevel: number;
  exerciseStatus: string;
  socialStatus: string;
  content: string;
}

export default function JournalHistoryPage() {
  const [pastEntries, setPastEntries] = useState<JournalEntry[]>([]);
  const [showEmailBox, setShowEmailBox] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('brain_gain_journal_entries');
    if (stored) {
      try {
        setPastEntries(JSON.parse(stored));
      } catch {
        setPastEntries([]);
      }
    }
  }, []);

  const handleSendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;
    
    // Construct email content from entries
    const journalSummary = pastEntries.map(entry => 
      `Date: ${entry.dateStr}\nMood: ${entry.mood} | Pain: ${entry.painLevel}/10 | Activity: ${entry.exerciseStatus} | Social: ${entry.socialStatus}\n\nContent:\n${entry.content}\n-------------------\n`
    ).join('\n');

    const subject = encodeURIComponent('My Journal History & Questionnaire Results');
    const body = encodeURIComponent(journalSummary);
    
    // Open user's default email client pre-populated with the entries
    window.location.href = `mailto:${emailInput}?subject=${subject}&body=${body}`;
    setEmailSent(true);
  };

  return (
    <main className="h-dvh w-screen bg-[#FFFFFF] text-[#000000] font-sans flex flex-col justify-between overflow-hidden box-border">
      
      {/* Top Header */}
      <header className="border-b border-[#E2E8F0] bg-[#FFFFFF] px-4 py-2.5 flex justify-between items-center shrink-0 shadow-xs">
        <span className="font-bold text-xs tracking-wider text-[#000000] uppercase">
          Journal History & Results
        </span>

        <div className="flex items-center gap-2">
          <Link 
            href="/games" 
            className="px-3 py-1 bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#000000] border border-[#CBD5E1] font-semibold text-[11px] uppercase tracking-wider rounded transition"
          >
            Games
          </Link>
          <Link 
            href="/journal" 
            className="px-3 py-1 bg-[#0284C7] text-[#FFFFFF] font-bold text-[11px] uppercase tracking-wider rounded transition shadow-xs"
          >
            Journal
          </Link>
        </div>
      </header>

      {/* Single Column Layout for Entries */}
      <section className="max-w-4xl w-full mx-auto px-6 py-6 flex-1 flex flex-col min-h-0">
        
        <div className="flex justify-between items-center pb-4 border-b border-[#000000] shrink-0 mb-4">
          <span className="text-xs uppercase tracking-widest text-[#000000] font-bold">
            Archived Records ({pastEntries.length})
          </span>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 flex flex-col gap-4">
          {pastEntries.length === 0 ? (
            <div className="text-center py-20 text-sm text-[#000000] font-bold">
              No journal records found.
            </div>
          ) : (
            pastEntries.map((entry) => (
              <div key={entry.id} className="bg-[#FAFAFA] border border-[#000000] rounded-lg p-5 flex flex-col gap-3 shrink-0 shadow-xs">
                
                {/* Header row with date */}
                <div className="flex justify-between items-center border-b border-[#000000] pb-2 font-bold text-xs text-[#000000]">
                  <span className="text-sm text-[#000000]">{entry.dateStr}</span>
                </div>

                {/* Combined Questionnaire Box (Mood, Pain, Activity, Social) */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs font-bold text-[#000000] bg-[#FFFFFF] p-3 rounded border border-[#000000]">
                  <div className="text-[#2563EB]">Mood: {entry.mood}</div>
                  <div className="text-[#DC2626]">Pain Level: {entry.painLevel}/10</div>
                  <div className="text-[#16A34A]">Activity: {entry.exerciseStatus}</div>
                  <div className="text-[#9333EA]">Social: {entry.socialStatus}</div>
                </div>

                {/* Journal text content */}
                <p className="text-base text-[#000000] whitespace-pre-wrap leading-relaxed font-bold mt-1">
                  {entry.content}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Email Sharing Section */}
        <div className="pt-4 shrink-0">
          {!showEmailBox ? (
            <button
              onClick={() => setShowEmailBox(true)}
              className="w-full py-2.5 bg-[#0284C7] hover:bg-[#0369A1] text-[#FFFFFF] font-bold text-xs uppercase tracking-wider rounded transition shadow-xs"
            >
              Do you want to email this journal to someone?
            </button>
          ) : (
            <form onSubmit={handleSendEmail} className="bg-[#FAFAFA] border border-[#000000] rounded-lg p-4 flex flex-col gap-3 shadow-xs">
              <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-[#000000]">
                <span>Enter recipient email address</span>
                <button 
                  type="button" 
                  onClick={() => setShowEmailBox(false)}
                  className="text-xs text-[#000000] hover:underline font-bold"
                >
                  Cancel
                </button>
              </div>
              <div className="flex gap-2">
                <input 
                  type="email" 
                  required
                  placeholder="recipient@example.com"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs font-bold border border-[#000000] rounded bg-[#FFFFFF] text-[#000000] placeholder:text-[#666666] focus:outline-none"
                />
                <button 
                  type="submit"
                  className="px-4 py-1.5 bg-[#0284C7] hover:bg-[#0369A1] text-[#FFFFFF] font-bold text-xs uppercase tracking-wider rounded transition shadow-xs"
                >
                  Send Email
                </button>
              </div>
              {emailSent && (
                <p className="text-[11px] font-bold text-[#16A34A]">Email client opened with your journal history!</p>
              )}
            </form>
          )}
        </div>

      </section>

      {/* Footer */}
      <footer className="border-t border-[#E2E8F0] bg-[#FFFFFF] px-4 py-2 text-center text-[10px] text-[#000000] flex justify-between items-center shrink-0">
        <p className="uppercase tracking-widest font-bold">Clinical Wellness Tracking System</p>
        <p className="font-mono font-bold">© {new Date().getFullYear()}</p>
      </footer>

    </main>
  );
}