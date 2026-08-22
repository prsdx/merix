"use client";

import React, { useState, useEffect } from "react";
import { MOCK_CANDIDATES, MOCK_JD, Candidate, getScoreLabel } from "@/lib/mock-data";

export default function TerminalDashboard() {
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  const [bootSequence, setBootSequence] = useState<number>(0);

  // Subtle initial terminal boot sequence
  useEffect(() => {
    if (bootSequence < 4) {
      const timer = setTimeout(() => setBootSequence(prev => prev + 1), 300 + Math.random() * 400);
      return () => clearTimeout(timer);
    }
  }, [bootSequence]);

  const selected = MOCK_CANDIDATES.find(c => c.id === selectedCandidateId) || null;

  if (bootSequence < 4) {
    return (
      <div className="min-h-screen bg-black text-[#00ff41] font-mono p-8 text-sm selection:bg-[#00ff41]/30">
        <div className="space-y-2 opacity-80">
          {bootSequence >= 0 && <div>{">"} Initialize match_engine v2.0... <span className="text-[#00ff41]">OK</span></div>}
          {bootSequence >= 1 && <div>{">"} Loading target profile: {MOCK_JD.title}... <span className="text-[#00ff41]">OK</span></div>}
          {bootSequence >= 2 && <div>{">"} Parsing candidate data stream ({MOCK_CANDIDATES.length} records)... <span className="text-[#00ff41]">OK</span></div>}
          {bootSequence >= 3 && <div>{">"} Executing vector comparison... <span className="text-[#00ff41]">OK</span></div>}
          <div className="animate-pulse mt-4">_</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020202] text-[#00ff41] font-mono p-4 md:p-8 text-sm selection:bg-[#00ff41]/30 selection:text-white uppercase relative">
      {/* CRT Scanline Overlay */}
      <div className="pointer-events-none fixed inset-0 z-50 h-full w-full bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] opacity-20 mix-blend-overlay"></div>

      <header className="mb-6 border-b border-[#00ff41]/30 pb-4 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <div className="text-xs text-[#00ff41]/50 mb-1">USER: root | TTY: tty1 | SESSION: 49X2</div>
            <div className="text-xl md:text-2xl font-bold tracking-widest drop-shadow-[0_0_8px_rgba(0,255,65,0.8)]">
              RECRUIT_OS // CANDIDATE_MATCH
            </div>
          </div>
          <div className="text-left md:text-right text-xs text-[#00ff41]/60">
            <div>TARGET: {MOCK_JD.title}</div>
            <div>STATUS: {MOCK_CANDIDATES.length} PROFILES LOADED</div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
        
        {/* Left Column: JD & List */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Target Profile Box */}
          <div className="border border-[#00ff41]/50 bg-black p-4 shadow-[0_0_15px_rgba(0,255,65,0.1)]">
            <div className="text-[#00ff41]/70 border-b border-[#00ff41]/30 pb-2 mb-3 text-xs flex justify-between items-center">
              <span>TARGET_PARAMS.YML</span>
              <span className="bg-[#00ff41]/20 px-1">RO</span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="grid grid-cols-3 gap-2">
                <span className="text-[#00ff41]/50">ROLE:</span>
                <span className="col-span-2 text-[#00ff41]">{MOCK_JD.title}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-[#00ff41]/50">DEPT:</span>
                <span className="col-span-2 text-[#00ff41]">{MOCK_JD.department}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-[#00ff41]/50">LOC:</span>
                <span className="col-span-2 text-[#00ff41]">{MOCK_JD.location}</span>
              </div>
            </div>
          </div>

          {/* Candidates List */}
          <div className="border border-[#00ff41]/50 bg-black flex-1 flex flex-col shadow-[0_0_15px_rgba(0,255,65,0.1)] min-h-[400px]">
            <div className="p-2 border-b border-[#00ff41]/30 bg-[#00ff41]/10 text-xs font-bold flex justify-between">
              <span>CANDIDATE_INDEX</span>
              <span>SCORE</span>
            </div>
            <div className="overflow-y-auto p-2 space-y-1 flex-1">
              {MOCK_CANDIDATES.map((c, i) => (
                <button 
                  key={c.id} 
                  onClick={() => setSelectedCandidateId(c.id)}
                  className={`w-full text-left px-2 py-2 flex justify-between items-center text-xs transition-colors group
                    ${selectedCandidateId === c.id 
                      ? 'bg-[#00ff41] text-black font-bold' 
                      : 'hover:bg-[#00ff41]/20 text-[#00ff41]'
                    }`}
                >
                  <span className="flex gap-2 truncate pr-2">
                    <span className={selectedCandidateId === c.id ? "text-black" : "text-[#00ff41]/50"}>
                      [{String(i + 1).padStart(2, '0')}]
                    </span>
                    <span className="truncate">{c.name}</span>
                  </span>
                  <span className={`shrink-0
                    ${selectedCandidateId === c.id ? "text-black" : ""}
                    ${!selectedCandidateId || selectedCandidateId !== c.id ? (c.score >= 75 ? "text-[#00ff41]" : c.score >= 50 ? "text-[#ffb000]" : "text-[#ff3333]") : ""}
                  `}>
                    {c.score}%
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Detailed View */}
        <div className="lg:col-span-8">
          {selected ? (
            <CandidateDetail candidate={selected} />
          ) : (
            <div className="border border-[#00ff41]/30 bg-black h-full min-h-[600px] flex items-center justify-center text-[#00ff41]/50 relative overflow-hidden shadow-[0_0_15px_rgba(0,255,65,0.05)]">
               <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,255,65,0.05)_0%,transparent_70%)]"></div>
               <span className="animate-pulse flex items-center gap-2">
                 <span className="w-2 h-4 bg-[#00ff41]/50 block"></span>
                 AWAITING INPUT...
               </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CandidateDetail({ candidate }: { candidate: Candidate }) {
  // Compute theme variables based on score for neon accents
  const getThemeVars = (score: number) => {
    if (score >= 75) return { 
      text: "text-[#00ff41]", 
      border: "border-[#00ff41]", 
      borderDim: "border-[#00ff41]/30",
      bgSubtle: "bg-[#00ff41]/5",
      shadow: "shadow-[0_0_15px_rgba(0,255,65,0.2)]" 
    };
    if (score >= 50) return { 
      text: "text-[#ffb000]", 
      border: "border-[#ffb000]",
      borderDim: "border-[#ffb000]/30",
      bgSubtle: "bg-[#ffb000]/5", 
      shadow: "shadow-[0_0_15px_rgba(255,176,0,0.2)]" 
    };
    return { 
      text: "text-[#ff3333]", 
      border: "border-[#ff3333]",
      borderDim: "border-[#ff3333]/30",
      bgSubtle: "bg-[#ff3333]/5", 
      shadow: "shadow-[0_0_15px_rgba(255,51,51,0.2)]" 
    };
  };

  const theme = getThemeVars(candidate.score);

  const getProgressBar = (score: number) => {
    const filled = Math.round(score / 5);
    const empty = Math.max(0, 20 - filled);
    return `[${'#'.repeat(filled)}${'.'.repeat(empty)}]`;
  };

  return (
    <div className={`border ${theme.border} bg-black h-full p-4 md:p-6 flex flex-col ${theme.text} ${theme.shadow} animate-in fade-in duration-300`}>
      
      {/* Header Info */}
      <div className={`border-b ${theme.borderDim} pb-4 mb-6 flex flex-wrap justify-between items-start gap-4`}>
        <div>
          <div className="text-xs opacity-70 mb-1 flex items-center gap-2">
            ID: {candidate.id.padStart(4, '0')} <span className="opacity-50">|</span> FILE: {candidate.filename}
          </div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-wider uppercase drop-shadow-[0_0_5px_currentColor]">
            {candidate.name}
          </h2>
        </div>
        <div className="text-right">
          <div className="text-3xl md:text-4xl font-bold drop-shadow-[0_0_8px_currentColor] mb-1">
            {candidate.score}%
          </div>
          <div className="text-xs opacity-80 tracking-widest">
            {getScoreLabel(candidate.score)}
          </div>
        </div>
      </div>

      {/* Rationale Terminal Log */}
      <div className="mb-8">
        <div className="text-xs opacity-60 mb-2">{">>"} SYSTEM_EVALUATION_LOG</div>
        <div className={`bg-[#0a0a0a] border ${theme.borderDim} border-l-4 ${theme.border} p-4 text-sm leading-relaxed`}>
          <span className="opacity-50 mr-2">{'>'}</span> 
          {candidate.rationale}
        </div>
      </div>

      {/* Skills Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 flex-1">
        
        {/* Matched Skills */}
        <div className="flex flex-col">
          <div className={`text-xs mb-3 border-b ${theme.borderDim} pb-1 flex justify-between`}>
            <span className="opacity-80">{">>"} POSITIVE_VECTORS ({candidate.matched_skills.length})</span>
          </div>
          <div className="space-y-3 overflow-y-auto pr-2">
            {candidate.matched_skills.map((skill, idx) => (
              <div key={idx} className={`border ${theme.borderDim} p-3 ${theme.bgSubtle}`}>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold">{skill.skill}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 border ${skill.required ? `border-current bg-current text-black` : `border-current opacity-70`}`}>
                    {skill.required ? 'REQ' : 'OPT'}
                  </span>
                </div>
                <div className={`text-xs opacity-80 pl-2 border-l ${theme.borderDim} mt-2`}>
                  {skill.evidence}
                </div>
              </div>
            ))}
            {candidate.matched_skills.length === 0 && (
              <div className="opacity-50 text-xs italic">NO_POSITIVE_VECTORS_DETECTED</div>
            )}
          </div>
        </div>

        {/* Missing Skills */}
        <div className="flex flex-col">
          <div className="text-xs mb-3 border-b border-[#ff3333]/30 pb-1 text-[#ff3333]">
            <span className="opacity-80">{">>"} NEGATIVE_VECTORS ({candidate.missing_skills.length})</span>
          </div>
          <div className="space-y-2">
            {candidate.missing_skills.map((skill, idx) => (
              <div key={idx} className="flex justify-between items-center p-2 border border-[#ff3333]/30 bg-[#ff3333]/10 text-[#ff3333]">
                <span className="font-bold flex items-center gap-2">
                  <span className="opacity-50">!</span>
                  {skill.skill}
                </span>
                <span className="text-[10px] opacity-80">
                  {skill.required ? 'CRITICAL_GAP' : 'MINOR_GAP'}
                </span>
              </div>
            ))}
            {candidate.missing_skills.length === 0 && (
              <div className={`border ${theme.borderDim} p-3 ${theme.bgSubtle} opacity-70 text-xs`}>
                ALL_REQUIRED_VECTORS_PRESENT
              </div>
            )}
          </div>
          
          <div className="mt-auto pt-6">
            <div className="text-xs opacity-50 mb-1">CONFIDENCE_METER:</div>
            <div className="font-mono text-sm tracking-widest break-all whitespace-pre-wrap">
              {getProgressBar(candidate.score)}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
