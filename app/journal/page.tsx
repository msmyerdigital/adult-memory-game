'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface JournalEntry {
  id: string;
  dateStr: string;
  mood: string;
  painLevel: number;
  exerciseStatus: string;
  socialStatus: string;
  content: string;
}

export default function JournalPage() {
  const [currentView, setCurrentView] = useState<'form' | 'history'>('form');

  const [mood, setMood] = useState('Happy');
  const [painLevel, setPainLevel] = useState(0);
  const [exerciseStatus, setExerciseStatus] = useState('Yes');
  const [socialStatus, setSocialStatus] = useState('Yes');
  const [content, setContent] = useState('');

  const [pastEntries, setPastEntries] = useState<JournalEntry[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Greeting based on time of day
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Good morning' : currentHour < 18 ? 'Good afternoon' : 'Good evening';

  // Dynamic date string for the header
  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

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

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    const newEntry: JournalEntry = {
      id: Date.now().toString(),
      dateStr: new Date().toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      mood,
      painLevel,
      exerciseStatus,
      socialStatus,
      content,
    };

    const updatedEntries = [newEntry, ...pastEntries];
    setPastEntries(updatedEntries);
    localStorage.setItem('brain_gain_journal_entries', JSON.stringify(updatedEntries));

    setContent('');
    setMood('Happy');
    setPainLevel(0);
    setExerciseStatus('Yes');
    setSocialStatus('Yes');

    setCurrentView('history');
  };

  const handleDownloadPDF = () => {
    setIsGenerating(true);
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text('Journal History Report', 14, 22);
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
    
    let yPos = 40;
    
    pastEntries.forEach((entry, index) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(`Entry #${index + 1}: ${entry.dateStr}`, 14, yPos);
      yPos += 8;
      
      const tableData = [
        ['Mood', entry.mood, 'Pain Level', `${entry.painLevel}/10`],
        ['Activity', entry.exerciseStatus, 'Social', entry.socialStatus]
      ];
      
      autoTable(doc, {
        startY: yPos,
        body: tableData,
        theme: 'grid',
        styles: { fontSize: 10, cellPadding: 2 },
        columnStyles: { 0: { fontStyle: 'bold', cellWidth: 30 }, 2: { fontStyle: 'bold', cellWidth: 30 } },
        margin: { left: 14 }
      });
      
      yPos = (doc as any).lastAutoTable.finalY + 6;
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const splitContent = doc.splitTextToSize(entry.content, 180);
      doc.text(splitContent, 14, yPos);
      yPos += (splitContent.length * 6) + 10;
    });
    
    doc.save('journal-history.pdf');
    setIsGenerating(false);
  };

  return (
    <main className="h-dvh w-screen bg-[#FFFFFF] text-[#000000] font-sans flex flex-col justify-between overflow-hidden box-border">
      
      <header className="border-b border-[#E2E8F0] bg-[#FFFFFF] px-4 py-2.5 flex justify-between items-center shrink-0 shadow-xs">
        <span className="font-bold text-xs tracking-wider text-[#000000] uppercase">
          {currentView === 'form' ? 'Wellness Journal' : 'Journal History & Results'}
        </span>

        <div className="flex items-center gap-2">
          <Link 
            href="/games" 
            className="px-3 py-1 bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#000000] border border-[#CBD5E1] font-semibold text-[11px] uppercase tracking-wider rounded transition"
          >
            Games
          </Link>
          
          {currentView === 'form' ? (
            <button 
              onClick={() => setCurrentView('history')}
              className="px-3 py-1 bg-[#0284C7] text-[#FFFFFF] font-bold text-[11px] uppercase tracking-wider rounded transition shadow-xs"
            >
              View Past ({pastEntries.length})
            </button>
          ) : (
            <button 
              onClick={() => setCurrentView('form')}
              className="px-3 py-1 bg-[#0284C7] text-[#FFFFFF] font-bold text-[11px] uppercase tracking-wider rounded transition shadow-xs"
            >
              + New Journal
            </button>
          )}
        </div>
      </header>

      {currentView === 'form' ? (
        <section className="max-w-4xl w-full mx-auto px-6 py-4 flex-1 flex flex-col justify-center overflow-y-auto">
          
          {/* Greeting & Date Header */}
          <div className="mb-4 text-center">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[#000000]">
              {greeting}! Today is {todayFormatted}.
            </h1>
            <p className="text-sm md:text-base font-semibold text-[#555555] mt-1">
              Keep track of your day.
            </p>
          </div>

          <form onSubmit={handleSave} className="bg-[#FAFAFA] border border-[#000000] rounded-xl p-6 flex flex-col gap-5 shadow-xs">
            <h2 className="text-xs uppercase tracking-widest font-bold border-b border-[#000000] pb-2">
              Daily Wellness Journal
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-bold">
              <div className="flex flex-col gap-1">
                <label className="text-[#2563EB]">Mood</label>
                <select 
                  value={mood} 
                  onChange={(e) => setMood(e.target.value)}
                  className="p-2 border border-[#000000] rounded bg-[#FFFFFF] text-[#000000] focus:outline-none"
                >
                  <option value="Happy">Happy</option>
                  <option value="Calm">Calm</option>
                  <option value="Neutral">Neutral</option>
                  <option value="Anxious">Anxious</option>
                  <option value="Sad">Sad</option>
                  <option value="Stressed">Stressed</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[#DC2626]">Pain Level ({painLevel}/10)</label>
                <input 
                  type="range" 
                  min="0" 
                  max="10" 
                  value={painLevel} 
                  onChange={(e) => setPainLevel(Number(e.target.value))}
                  className="accent-[#DC2626] mt-2 cursor-pointer"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[#16A34A]">Activity</label>
                <select 
                  value={exerciseStatus} 
                  onChange={(e) => setExerciseStatus(e.target.value)}
                  className="p-2 border border-[#000000] rounded bg-[#FFFFFF] text-[#000000] focus:outline-none"
                >
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                  <option value="Light">Light</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[#9333EA]">Social</label>
                <select 
                  value={socialStatus} 
                  onChange={(e) => setSocialStatus(e.target.value)}
                  className="p-2 border border-[#000000] rounded bg-[#FFFFFF] text-[#000000] focus:outline-none"
                >
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                  <option value="Limited">Limited</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold uppercase tracking-wider">Journal Entry</label>
              <textarea 
                rows={5}
                required
                placeholder="Write your thoughts or notes here..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="p-3 text-sm font-bold border border-[#000000] rounded bg-[#FFFFFF] text-[#000000] placeholder:text-[#666666] focus:outline-none resize-none"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button 
                type="submit"
                className="px-6 py-2.5 bg-[#0284C7] hover:bg-[#0369A1] text-[#FFFFFF] font-bold text-xs uppercase tracking-wider rounded transition shadow-xs"
              >
                Save Entry
              </button>
            </div>
          </form>
        </section>
      ) : (
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
                  <div className="flex justify-between items-center border-b border-[#000000] pb-2 font-bold text-xs text-[#000000]">
                    <span className="text-sm text-[#000000]">{entry.dateStr}</span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs font-bold text-[#000000] bg-[#FFFFFF] p-3 rounded border border-[#000000]">
                    <div className="text-[#2563EB]">Mood: {entry.mood}</div>
                    <div className="text-[#DC2626]">Pain Level: {entry.painLevel}/10</div>
                    <div className="text-[#16A34A]">Activity: {entry.exerciseStatus}</div>
                    <div className="text-[#9333EA]">Social: {entry.socialStatus}</div>
                  </div>

                  <p className="text-base text-[#000000] whitespace-pre-wrap leading-relaxed font-bold mt-1">
                    {entry.content}
                  </p>
                </div>
              ))
            )}
          </div>

          <div className="pt-4 shrink-0">
            {pastEntries.length > 0 && (
              <button
                onClick={handleDownloadPDF}
                disabled={isGenerating}
                className="w-full py-2.5 bg-[#059669] hover:bg-[#047857] text-[#FFFFFF] font-bold text-xs uppercase tracking-wider rounded transition shadow-xs disabled:opacity-50"
              >
                {isGenerating ? 'Generating PDF...' : 'Download All Records as PDF'}
              </button>
            )}
          </div>
        </section>
      )}

      <footer className="border-t border-[#E2E8F0] bg-[#FFFFFF] px-4 py-2 text-center text-[10px] text-[#000000] flex justify-between items-center shrink-0">
        <p className="uppercase tracking-widest font-bold">Wellness Tracking System</p>
        <p className="font-mono font-bold">© {new Date().getFullYear()}</p>
      </footer>

    </main>
  );
}