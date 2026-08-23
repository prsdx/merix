export function HowItWorks() {
  return (
    <section id="how-it-works" className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-16 scroll-mt-20">
      <div className="space-y-4 text-center max-w-2xl mx-auto mb-12">
        <div className="inline-block text-[11px] font-mono font-bold uppercase tracking-widest text-[var(--brand-primary)]">
          How It Works
        </div>
        <h2 className="font-display text-3xl sm:text-4xl text-[var(--text-primary)]">
          Three deliberate steps to your verified shortlist.
        </h2>
        <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
          No complex setup. From raw job description to ranked candidate leaderboard with verbatim evidence citations in minutes.
        </p>
      </div>

      {/* 3 Step Cards with Embedded UI Mockups */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* __STEP_CARDS__ */}
      </div>
    </section>
  );
}
