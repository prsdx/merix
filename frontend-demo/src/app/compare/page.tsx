"use client";

import { useState } from "react";

const DEMOS = [
  { id: "v1", name: "v1 - Mobbin B2B Density" },
  { id: "v2", name: "v2 - ReactBits Kinetic" },
  { id: "v3", name: "v3 - Landbook SaaS" },
  { id: "v4", name: "v4 - Dribbble Neo-Brutalism" },
  { id: "v5", name: "v5 - Pinterest Masonry" },
  { id: "v6", name: "v6 - Realtime Colors Split" },
  { id: "v7", name: "v7 - Apple Liquid Glass" },
  { id: "v8", name: "v8 - Editorial Magazine" },
  { id: "v9", name: "v9 - Dark Terminal" },
  { id: "v10", name: "v10 - Minimalist Zen" },
];

export default function ComparePage() {
  const [left, setLeft] = useState("v1");
  const [right, setRight] = useState("v10");

  return (
    <div className="flex h-screen flex-col bg-zinc-950 text-white font-sans">
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-zinc-800 px-6">
        <h1 className="text-sm font-semibold tracking-wide text-zinc-300">Merix / Design Comparison</h1>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500 uppercase tracking-widest">Left</span>
            <select 
              value={left} 
              onChange={(e) => setLeft(e.target.value)} 
              className="bg-zinc-900 border border-zinc-700 text-sm rounded-md px-3 py-1.5 focus:outline-none focus:border-zinc-500"
            >
              {DEMOS.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          
          <span className="text-zinc-600 text-sm italic">vs</span>
          
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500 uppercase tracking-widest">Right</span>
            <select 
              value={right} 
              onChange={(e) => setRight(e.target.value)} 
              className="bg-zinc-900 border border-zinc-700 text-sm rounded-md px-3 py-1.5 focus:outline-none focus:border-zinc-500"
            >
              {DEMOS.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
        </div>
      </header>
      
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 border-r border-zinc-800">
          <iframe src={`/demo/${left}`} className="h-full w-full bg-white" />
        </div>
        <div className="flex-1">
          <iframe src={`/demo/${right}`} className="h-full w-full bg-white" />
        </div>
      </div>
    </div>
  );
}
