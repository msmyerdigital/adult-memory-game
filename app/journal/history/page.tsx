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

export default function JournalHistoryPage() {
  const [pastEntries, setPastEntries] = useState<JournalEntry[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

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

  const handleDownloadPDF = () => {
    setIsGenerating(true);
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(18);
    doc.text('Journal History Report', 14, 22);
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
    
    let yPos = 40;
    
    pastEntries.forEach((entry, index) => {
      // Check for page break
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
      
      // Header for each entry
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(`Entry #${index + 1}: ${entry.dateStr}`, 14, yPos);
      yPos += 8;
      
      // Details Table
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
      
      // Get final Y position from the document instance safely
      yPos = (doc as any).lastAutoTable.finalY + 6;
      
      // Content
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

        {/* PDF Download Section */}
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

      {/* Footer */}
      <footer className="border-t border-[#E2E8F0] bg-[#FFFFFF] px-4 py-2 text-center text-[10px] text-[#000000] flex justify-between items-center shrink-0">
        <p className="uppercase tracking-widest font-bold">Clinical Wellness Tracking System</p>
        <p className="font-mono font-bold">© {new Date().getFullYear()}</p>
      </footer>

    </main>
  );
}