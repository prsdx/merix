"use client";

import { MOCK_CANDIDATES, MOCK_JD, getScoreColor, Candidate } from '@/lib/mock-data';
import React from 'react';

export default function CandidateDashboard() {
  return (
    <div className="flex min-h-screen bg-[#F4F1EA] text-[#1C1917] selection:bg-[#D94532] selection:text-white font-sans">
      {/* Left Panel: Fixed Job Context */}
      <aside className="w-full lg:w-[38%] lg:fixed h-screen overflow-y-auto border-r border-[#1C1917]/20 bg-[#F4F1EA] p-8 lg:p-14 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 mb-10">
            <div className="w-3 h-3 bg-[#D94532] rounded-full animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#1C1917]/60">Active Pipeline</span>
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-serif leading-[0.9] tracking-tighter text-[#1C1917] mb-12">
            {MOCK_JD.title}
          </h1>
          
          <div className="flex flex-col border-t border-[#1C1917]/20">
            <div className="flex justify-between items-center py-4 border-b border-[#1C1917]/20">
              <span className="text-xs font-bold uppercase tracking-widest text-[#1C1917]/60">Company</span>
              <span className="text-sm font-medium text-[#1C1917]">{MOCK_JD.company}</span>
            </div>
            <div className="flex justify-between items-center py-4 border-b border-[#1C1917]/20">
              <span className="text-xs font-bold uppercase tracking-widest text-[#1C1917]/60">Department</span>
              <span className="text-sm font-medium text-[#1C1917]">{MOCK_JD.department}</span>
            </div>
            <div className="flex justify-between items-center py-4 border-b border-[#1C1917]/20">
              <span className="text-xs font-bold uppercase tracking-widest text-[#1C1917]/60">Location</span>
              <span className="text-sm font-medium text-[#1C1917]">{MOCK_JD.location}</span>
            </div>
          </div>

          <div className="mt-12">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#1C1917]/60 mb-5">Role Summary</h2>
            <p className="text-base leading-relaxed text-[#1C1917]/80">
              {MOCK_JD.summary}
            </p>
          </div>
        </div>

        <div className="mt-16 bg-[#D94532] text-[#F4F1EA] p-8 -mx-8 lg:-mx-14 -mb-8 lg:-mb-14">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.15em] mb-3 opacity-80">Task</h3>
          <p className="text-sm leading-relaxed font-medium">
            Review the candidates scored against this profile. Select the strongest matches to advance to the technical screen phase.
          </p>
        </div>
      </aside>

      {/* Right Panel: Scrolling Candidate List */}
      <main className="w-full lg:w-[62%] lg:ml-[38%] min-h-screen bg-[#FDFCFB] p-8 lg:p-14">
        <header className="mb-14 flex flex-col md:flex-row md:items-end justify-between border-b border-[#1C1917]/20 pb-6 gap-4">
          <h2 className="text-3xl font-serif tracking-tight text-[#1C1917]">Candidate Roster</h2>
          <div className="md:text-right flex items-baseline gap-2 md:block">
             <span className="text-3xl font-serif">{MOCK_CANDIDATES.length}</span>
             <span className="text-xs font-bold uppercase tracking-widest text-[#1C1917]/60 md:ml-2 md:block">Evaluated</span>
          </div>
        </header>

        <div className="space-y-12">
          {MOCK_CANDIDATES.map((candidate, i) => (
            <CandidateCard key={candidate.id} candidate={candidate} rank={i + 1} />
          ))}
        </div>
      </main>
    </div>
  );
}

function CandidateCard({ candidate, rank }: { candidate: Candidate; rank: number }) {
  const scoreColor = getScoreColor(candidate.score);
  
  const scoreTheme = {
    green: {
      text: "text-[#2D5A27]",
    },
    amber: {
      text: "text-[#B47015]",
    },
    red: {
      text: "text-[#C44D3A]",
    }
  }[scoreColor];

  return (
    <article className="group relative border border-[#1C1917]/20 bg-white hover:border-[#1C1917] transition-all duration-300">
      <div className="flex flex-col sm:flex-row items-stretch border-b border-[#1C1917]/10">
        {/* Rank / Index Indicator */}
        <div className="sm:w-16 flex-shrink-0 flex sm:flex-col items-center justify-center border-b sm:border-b-0 sm:border-r border-[#1C1917]/10 bg-[#F4F1EA] text-[#1C1917]/40 font-serif text-2xl group-hover:bg-[#1C1917] group-hover:text-[#F4F1EA] transition-colors duration-300 py-3 sm:py-0">
          <span className="text-[10px] font-sans font-bold uppercase tracking-widest opacity-50 sm:mb-1 mr-2 sm:mr-0">No.</span>
          {String(rank).padStart(2, '0')}
        </div>
        
        {/* Header Info */}
        <div className="flex-1 p-6 md:p-8 flex justify-between items-start md:items-center flex-col md:flex-row gap-6">
          <div>
            <h3 className="text-2xl font-serif text-[#1C1917] mb-3">{candidate.name}</h3>
            <div className="flex items-center gap-3">
              <span className="px-2 py-1 bg-[#F4F1EA] text-[#1C1917]/60 text-[10px] font-mono border border-[#1C1917]/10">
                {candidate.filename}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-5 md:text-right">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1C1917]/50 mb-1">Match Score</div>
              <div className={`text-4xl font-serif ${scoreTheme.text}`}>{candidate.score}</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Detail Grid */}
      <div className="p-6 md:p-8 grid grid-cols-1 xl:grid-cols-2 gap-10 md:gap-14">
        {/* Rationale */}
        <div>
          <h4 className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#1C1917]/60 mb-5 flex items-center gap-3">
            <div className="w-4 h-[1px] bg-[#1C1917]/20"></div>
            AI Analysis
          </h4>
          <p className="text-sm leading-relaxed text-[#1C1917]/80">
            {candidate.rationale}
          </p>

          {candidate.missing_skills.length > 0 && (
            <div className="mt-8 pt-6 border-t border-dashed border-[#1C1917]/10">
              <h5 className="text-[10px] font-bold uppercase tracking-widest text-[#1C1917]/40 mb-3">Identified Gaps</h5>
              <div className="flex flex-wrap gap-2">
                {candidate.missing_skills.map((skill) => (
                  <span 
                    key={skill.skill} 
                    className="px-2 py-1 text-[10px] uppercase tracking-wider border border-dashed border-[#C44D3A]/40 text-[#C44D3A] bg-[#C44D3A]/5 font-bold line-through decoration-[#C44D3A]/30"
                  >
                    {skill.skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Skills */}
        <div>
           <h4 className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#1C1917]/60 mb-5 flex items-center gap-3">
            <div className="w-4 h-[1px] bg-[#1C1917]/20"></div>
            Skill Evidence
          </h4>
          
          <div className="flex flex-col gap-0 border-y border-[#1C1917]/10">
            {candidate.matched_skills.map((skill, index) => (
              <div key={skill.skill} className={`py-4 ${index !== candidate.matched_skills.length - 1 ? 'border-b border-[#1C1917]/10' : ''}`}>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#1C1917]">{skill.skill}</span>
                  {skill.required && (
                    <span className="text-[9px] font-bold uppercase tracking-widest text-[#D94532] border border-[#D94532]/30 px-1.5 py-0.5">
                      Required
                    </span>
                  )}
                </div>
                {skill.evidence && (
                  <p className="text-xs leading-relaxed text-[#1C1917]/70">{skill.evidence}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Hover Action Strip */}
      <div className="absolute top-0 right-0 h-full w-1.5 bg-[#D94532] scale-y-0 origin-top group-hover:scale-y-100 transition-transform duration-300 ease-out hidden md:block" />
    </article>
  );
}
