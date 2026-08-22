"use client";

import { useState } from "react";
import { MOCK_CANDIDATES, MOCK_JD, getScoreColor, getScoreLabel } from "@/lib/mock-data";

export default function CandidateDashboard() {
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);

  // High-converting SaaS aesthetic:
  // - Pristine white/zinc palette
  // - Crisp borders
  // - Strong typography hierarchy
  // - Minimal noise, high contrast for data
  
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950 font-sans selection:bg-zinc-200">
      <div className="max-w-7xl mx-auto px-6 py-16 md:py-24 lg:px-8">
        
        {/* Header - SaaS Marketing Style */}
        <header className="mb-20 grid grid-cols-1 lg:grid-cols-12 gap-12 items-end">
          <div className="lg:col-span-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="flex h-2 w-2 items-center justify-center">
                <div className="h-1.5 w-1.5 bg-zinc-950 rounded-full" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
                Active Requisition
              </span>
            </div>
            <h1 className="text-5xl md:text-7xl font-semibold tracking-tighter text-zinc-950 leading-[1.05] mb-6">
              {MOCK_JD.title}
            </h1>
            <p className="text-xl md:text-2xl text-zinc-500 leading-relaxed max-w-2xl font-light tracking-tight">
              {MOCK_JD.company} &mdash; {MOCK_JD.location}
            </p>
          </div>
          
          <div className="lg:col-span-4 bg-white p-8 rounded-2xl border border-zinc-200 shadow-sm relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-5">
               <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24">
                 <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
               </svg>
             </div>
             <h3 className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-3">Context</h3>
             <p className="text-sm text-zinc-600 leading-relaxed relative z-10">
               {MOCK_JD.summary}
             </p>
          </div>
        </header>

        <main className="border-t border-zinc-200 pt-16">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
            <div>
              <h2 className="text-3xl font-semibold tracking-tight text-zinc-900 mb-1">
                Top Matches
              </h2>
              <p className="text-sm font-medium text-zinc-500">
                Found {MOCK_CANDIDATES.length} candidates in the pipeline
              </p>
            </div>
            <div className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
              Ranked by algorithm
            </div>
          </div>
          
          {/* Candidates List */}
          <div className="flex flex-col gap-6">
            {MOCK_CANDIDATES.map((candidate, index) => {
              const scoreColor = getScoreColor(candidate.score);
              const scoreLabel = getScoreLabel(candidate.score);
              const isSelected = selectedCandidate === candidate.id;
              
              const colorMap = {
                green: "text-emerald-700 bg-emerald-50 border-emerald-200",
                amber: "text-amber-700 bg-amber-50 border-amber-200",
                red: "text-rose-700 bg-rose-50 border-rose-200"
              };
              
              return (
                <article 
                  key={candidate.id}
                  onClick={() => setSelectedCandidate(isSelected ? null : candidate.id)}
                  className={`group relative bg-white border rounded-2xl transition-all duration-300 cursor-pointer overflow-hidden ${
                    isSelected ? 'border-zinc-950 shadow-[0_8px_40px_rgb(0,0,0,0.08)]' : 'border-zinc-200 hover:border-zinc-300 hover:shadow-sm'
                  }`}
                >
                  <div className="p-6 md:p-8 flex flex-col md:flex-row gap-8 items-start">
                    {/* Rank & Score Section */}
                    <div className="flex flex-row md:flex-col items-center md:items-start justify-between w-full md:w-48 shrink-0 border-b md:border-b-0 md:border-r border-zinc-100 pb-6 md:pb-0 md:pr-8">
                      <div className="text-zinc-300 font-mono text-sm mb-4 hidden md:block tracking-widest">
                        {(index + 1).toString().padStart(2, '0')}
                      </div>
                      <div className="flex md:flex-col items-center md:items-start gap-4 md:gap-0">
                        <div className="text-4xl md:text-5xl font-semibold tracking-tighter text-zinc-900 md:mb-2">
                          {candidate.score}<span className="text-xl md:text-2xl text-zinc-300 font-light">/100</span>
                        </div>
                        <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide border ${colorMap[scoreColor]}`}>
                          {scoreLabel}
                        </div>
                      </div>
                    </div>
                    
                    {/* Main Content */}
                    <div className="flex-1 w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                      <div className="lg:col-span-5 flex flex-col justify-between">
                         <div>
                           <h3 className="text-2xl font-semibold tracking-tight text-zinc-950 mb-2 group-hover:text-zinc-600 transition-colors">
                             {candidate.name}
                           </h3>
                           <div className="text-sm font-medium text-zinc-400 mb-6 flex items-center gap-2">
                             <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                             </svg>
                             {candidate.filename}
                           </div>
                         </div>
                         
                         {/* Social proof style quote for rationale */}
                         <div className="bg-zinc-50/50 p-4 rounded-xl border border-zinc-100">
                           <blockquote className="border-l-2 border-zinc-900 pl-4">
                             <p className="text-sm text-zinc-700 font-medium italic leading-relaxed">
                               "{candidate.rationale}"
                             </p>
                           </blockquote>
                         </div>
                      </div>
                      
                      <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-8">
                        {/* Skills Overview */}
                        <div>
                          <div className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-4">
                            Matched Skills
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {candidate.matched_skills.map((skill, i) => (
                              <span key={i} className="inline-flex items-center px-3 py-1.5 rounded-lg bg-zinc-100/80 text-zinc-700 text-xs font-medium border border-zinc-200">
                                {skill.skill}
                                {skill.required && <span className="ml-1 text-zinc-400 opacity-70">*</span>}
                              </span>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <div className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-4">
                            Missing Skills
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {candidate.missing_skills.length > 0 ? (
                              candidate.missing_skills.map((skill, i) => (
                                <span key={i} className="inline-flex items-center px-3 py-1.5 rounded-lg bg-white text-zinc-500 text-xs font-medium border border-dashed border-zinc-300">
                                  {skill.skill}
                                </span>
                              ))
                            ) : (
                              <span className="text-sm font-medium text-zinc-400">No major gaps</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Expanded Evidence View (View Transition effect visually) */}
                  {isSelected && (
                    <div className="bg-zinc-950 border-t border-zinc-900 p-6 md:p-10 text-zinc-300 mt-2">
                      <div className="flex items-center justify-between mb-8">
                        <h4 className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
                          Evidence & Context
                        </h4>
                        <button 
                          onClick={(e) => { e.stopPropagation(); setSelectedCandidate(null); }}
                          className="text-xs font-semibold uppercase tracking-widest text-zinc-500 hover:text-white transition-colors"
                        >
                          Close Details
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-16 gap-y-8">
                        {candidate.matched_skills.filter(s => s.evidence).map((skill, i) => (
                          <div key={i} className="flex gap-5">
                             <div className="mt-1.5 h-1.5 w-1.5 bg-zinc-600 rounded-full shrink-0 shadow-[0_0_8px_rgba(255,255,255,0.3)]" />
                             <div>
                               <div className="font-medium text-white text-sm mb-2 tracking-wide">{skill.skill}</div>
                               <div className="text-zinc-400 text-sm leading-relaxed">{skill.evidence}</div>
                             </div>
                          </div>
                        ))}
                        {candidate.matched_skills.filter(s => s.evidence).length === 0 && (
                          <div className="text-sm text-zinc-500 italic">No specific evidence provided.</div>
                        )}
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </main>
      </div>
    </div>
  );
}
