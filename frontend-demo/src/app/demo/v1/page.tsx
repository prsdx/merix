"use client";

import { MOCK_CANDIDATES, MOCK_JD, getScoreColor, getScoreLabel } from "@/lib/mock-data";
import { useState } from "react";
import { CheckCircle2, XCircle, FileText, Building, MapPin, Search, Filter } from "lucide-react";

export default function CandidateDashboard() {
  const [selectedCandidate, setSelectedCandidate] = useState(MOCK_CANDIDATES[0].id);

  const candidate = MOCK_CANDIDATES.find((c) => c.id === selectedCandidate) || MOCK_CANDIDATES[0];

  return (
    <div className="flex h-screen w-full bg-white text-neutral-900 font-sans selection:bg-neutral-200 overflow-hidden antialiased text-sm">
      {/* Sidebar: Job Description */}
      <aside className="w-[320px] flex-shrink-0 border-r border-neutral-200 bg-neutral-50/50 flex flex-col h-full">
        <div className="px-5 py-4 border-b border-neutral-200 flex items-center justify-between bg-white">
          <div className="font-medium text-neutral-900">Job Profile</div>
          <span className="text-[10px] px-1.5 py-0.5 bg-neutral-100 text-neutral-600 rounded-[2px] font-medium tracking-wide border border-neutral-200">
            ACTIVE
          </span>
        </div>
        <div className="p-5 flex-1 overflow-y-auto">
          <h1 className="text-lg font-semibold tracking-tight text-neutral-950 mb-1">{MOCK_JD.title}</h1>
          <div className="flex items-center gap-3 text-neutral-500 text-xs mb-8">
            <span className="flex items-center gap-1">
              <Building className="w-3.5 h-3.5" /> {MOCK_JD.company}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" /> {MOCK_JD.location}
            </span>
          </div>

          <div className="space-y-6">
            <div>
              <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-2">
                Department
              </div>
              <div className="text-sm text-neutral-800">{MOCK_JD.department}</div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-2">
                Summary
              </div>
              <div className="text-sm text-neutral-700 leading-relaxed">{MOCK_JD.summary}</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content: Candidate List & Details */}
      <main className="flex-1 flex flex-col min-w-0 bg-white h-full">
        {/* Top Navbar */}
        <header className="px-5 py-3 border-b border-neutral-200 flex items-center justify-between shrink-0 bg-white">
          <div className="flex items-center gap-6">
            <h2 className="text-sm font-medium text-neutral-900">Candidates ({MOCK_CANDIDATES.length})</h2>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-neutral-50 border border-neutral-200 rounded-[2px] text-xs text-neutral-500 w-64 focus-within:border-neutral-400 focus-within:bg-white transition-colors">
              <Search className="w-3.5 h-3.5" />
              <input
                type="text"
                placeholder="Search candidates..."
                className="bg-transparent border-none outline-none w-full placeholder:text-neutral-400 text-neutral-900"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 border border-neutral-200 hover:bg-neutral-50 text-xs font-medium text-neutral-700 rounded-[2px] transition-colors bg-white shadow-sm">
              <Filter className="w-3.5 h-3.5" />
              Filter
            </button>
          </div>
        </header>

        {/* Split View */}
        <div className="flex-1 flex overflow-hidden">
          {/* Middle Column: Candidate List */}
          <div className="w-[360px] border-r border-neutral-200 overflow-y-auto flex-shrink-0 bg-white h-full">
            {MOCK_CANDIDATES.map((c) => {
              const isSelected = c.id === selectedCandidate;
              const scoreColor = getScoreColor(c.score);
              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedCandidate(c.id)}
                  className={`w-full text-left p-4 border-b border-neutral-200 hover:bg-neutral-50 transition-colors flex flex-col gap-2 ${
                    isSelected ? "bg-neutral-50 relative" : "bg-white"
                  }`}
                >
                  {isSelected && (
                    <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-neutral-900" />
                  )}
                  <div className="flex justify-between items-start w-full">
                    <div className="font-medium text-neutral-900 text-sm truncate pr-2">{c.name}</div>
                    <div
                      className={`text-xs font-semibold px-1.5 py-0.5 rounded-[2px] ${
                        scoreColor === "green"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : scoreColor === "amber"
                          ? "bg-amber-50 text-amber-700 border border-amber-200"
                          : "bg-rose-50 text-rose-700 border border-rose-200"
                      }`}
                    >
                      {c.score}
                    </div>
                  </div>
                  <div className="text-[11px] text-neutral-500 truncate flex items-center gap-1.5 w-full">
                    <FileText className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{c.filename}</span>
                  </div>
                  <div className="flex gap-2 text-[11px] mt-1.5 items-center">
                    <span className="text-emerald-700 font-medium bg-emerald-50 px-1.5 py-0.5 rounded-[2px] border border-emerald-100">
                      {c.matched_skills.length} matched
                    </span>
                    <span className="text-rose-700 font-medium bg-rose-50 px-1.5 py-0.5 rounded-[2px] border border-rose-100">
                      {c.missing_skills.length} missing
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Column: Detail View */}
          <div className="flex-1 overflow-y-auto bg-white p-10">
            <div className="max-w-3xl">
              <div className="flex items-start justify-between mb-10 pb-6 border-b border-neutral-200">
                <div>
                  <h2 className="text-2xl font-semibold tracking-tight text-neutral-950 mb-2">
                    {candidate.name}
                  </h2>
                  <div className="flex items-center gap-3 text-sm text-neutral-500">
                    <div className="flex items-center gap-1.5 bg-neutral-100 px-2 py-1 rounded-[2px] border border-neutral-200">
                      <FileText className="w-3.5 h-3.5 text-neutral-600" />
                      <span className="font-mono text-xs">{candidate.filename}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right flex flex-col items-end">
                  <div
                    className={`text-4xl font-light tabular-nums tracking-tighter ${
                      getScoreColor(candidate.score) === "green"
                        ? "text-emerald-600"
                        : getScoreColor(candidate.score) === "amber"
                        ? "text-amber-600"
                        : "text-rose-600"
                    }`}
                  >
                    {candidate.score}
                    <span className="text-neutral-400 text-xl font-normal">/100</span>
                  </div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mt-1.5">
                    {getScoreLabel(candidate.score)}
                  </div>
                </div>
              </div>

              <div className="mb-10">
                <h3 className="text-[10px] font-bold text-neutral-800 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-neutral-800 rounded-full"></span>
                  AI Rationale
                </h3>
                <div className="text-sm text-neutral-700 leading-relaxed bg-neutral-50/80 p-5 border border-neutral-200 rounded-[2px]">
                  {candidate.rationale}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-x-12 gap-y-10">
                <div>
                  <h3 className="text-[10px] font-bold text-neutral-800 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    Matched Skills ({candidate.matched_skills.length})
                  </h3>
                  <div className="space-y-5">
                    {candidate.matched_skills.map((skill, i) => (
                      <div key={i} className="group flex flex-col gap-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-neutral-900">{skill.skill}</span>
                          {skill.required && (
                            <span className="text-[9px] font-semibold uppercase tracking-wider bg-neutral-100 text-neutral-600 px-1 py-0.5 rounded-[2px] border border-neutral-200">
                              Required
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-neutral-600 leading-relaxed pl-3 border-l-2 border-neutral-200 group-hover:border-neutral-400 transition-colors">
                          {skill.evidence}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-[10px] font-bold text-neutral-800 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <XCircle className="w-3.5 h-3.5 text-rose-500" />
                    Missing Skills ({candidate.missing_skills.length})
                  </h3>
                  <div className="flex flex-col gap-2.5">
                    {candidate.missing_skills.map((skill, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-3 bg-rose-50/50 border border-rose-100 rounded-[2px]"
                      >
                        <span className="text-sm text-rose-950 font-medium">{skill.skill}</span>
                        {skill.required ? (
                          <span className="text-[9px] font-semibold uppercase tracking-wider text-rose-600 bg-rose-100/50 px-1.5 py-0.5 rounded-[2px] border border-rose-200/50">
                            Required
                          </span>
                        ) : (
                          <span className="text-[9px] font-semibold uppercase tracking-wider text-neutral-500 bg-neutral-100 px-1.5 py-0.5 rounded-[2px] border border-neutral-200">
                            Optional
                          </span>
                        )}
                      </div>
                    ))}
                    {candidate.missing_skills.length === 0 && (
                      <div className="text-sm text-neutral-500 italic py-2">
                        No missing skills detected.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
