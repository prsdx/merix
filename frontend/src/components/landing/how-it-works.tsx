export function HowItWorks() {
  return (
    <section id="how-it-works" className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-16 scroll-mt-20">
      <div className="space-y-4 text-center max-w-2xl mx-auto mb-12">
        <div className="inline-block text-xs font-mono font-bold uppercase tracking-widest text-[var(--brand-primary)]">
          How It Works
        </div>
        <h2 className="font-display text-3xl sm:text-4xl text-[var(--text-primary)]">
          Three deliberate steps to your verified shortlist.
        </h2>
        <p className="text-sm sm:text-base text-[var(--text-secondary)]">
          No complex setup. From raw job description to ranked candidate leaderboard with verbatim evidence citations in minutes.
        </p>
      </div>

      {/* 3 Step Cards with Embedded UI Mockups */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Step 1: Define Rubric */}
        <div className="merix-card merix-card-hover p-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="text-sm font-mono font-bold gradient-text">STEP 01</div>
            <h3 className="font-bold text-base text-[var(--text-primary)]">
              Paste JD &amp; Set 70/20/10 Rubric
            </h3>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              Merix automatically extracts mandatory technical skills (70%), preferred competencies (20%), and verified experience (10%).
            </p>
          </div>

          {/* Embedded Mini UI Mockup */}
          <div className="p-3 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-hairline)] space-y-2 text-xs font-mono">
            <div className="flex justify-between text-xs text-[var(--text-muted)] uppercase">
              <span>Extracted Rubric</span>
              <span className="text-[var(--accent-evidence)] font-bold">100% Deterministic</span>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span>Required (70%):</span>
                <span className="font-bold text-[var(--text-primary)]">FastAPI, SQL, pgvector</span>
              </div>
              <div className="flex justify-between">
                <span>Preferred (20%):</span>
                <span className="font-bold text-[var(--text-primary)]">Docker, Redis, CI/CD</span>
              </div>
              <div className="flex justify-between">
                <span>Experience (10%):</span>
                <span className="font-bold text-[var(--text-primary)]">2+ Years</span>
              </div>
            </div>
          </div>
        </div>

        {/* Step 2: Batch Ingestion */}
        <div className="merix-card merix-card-hover p-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="text-sm font-mono font-bold gradient-text">STEP 02</div>
            <h3 className="font-bold text-base text-[var(--text-primary)]">
              Batch Drop 100 Resumes with DPDP Gate
            </h3>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              Drop your entire PDF candidate pile at once. Magic bytes are validated, candidate PII is scrubbed, and consent is logged server-side.
            </p>
          </div>

          {/* Embedded Mini UI Mockup */}
          <div className="p-3 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-hairline)] space-y-2 text-xs font-mono">
            <div className="flex justify-between text-xs text-[var(--text-muted)] uppercase">
              <span>Batch Processing</span>
              <span className="text-[var(--brand-primary)] font-bold">Parallel Async</span>
            </div>
            <div className="p-2 rounded bg-[var(--bg-surface)] border border-[var(--border-hairline)] space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span>Aditya_Sharma_IITB.pdf</span>
                <span className="text-[var(--accent-evidence)] font-bold">✓ PII Redacted</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span>Priya_Nair_NITK.pdf</span>
                <span className="text-[var(--accent-evidence)] font-bold">✓ PII Redacted</span>
              </div>
            </div>
          </div>
        </div>

        {/* Step 3: Inspect & Advance */}
        <div className="merix-card merix-card-hover p-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="text-sm font-mono font-bold gradient-text">STEP 03</div>
            <h3 className="font-bold text-base text-[var(--text-primary)]">
              Inspect Evidence &amp; Export Shortlist
            </h3>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              Review ranked candidates with verbatim proof citations for every claim. Advance the best directly or export clean CSV reports.
            </p>
          </div>

          {/* Embedded Mini UI Mockup */}
          <div className="p-3 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-hairline)] space-y-2 text-xs font-mono">
            <div className="flex justify-between text-xs text-[var(--text-muted)] uppercase">
              <span>Ranked Leaderboard</span>
              <span className="text-[var(--text-primary)] font-bold">CSV Ready</span>
            </div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between items-center">
                <span>#1 Aditya S.</span>
                <span className="verd-strong">94% Strong</span>
              </div>
              <div className="flex justify-between items-center">
                <span>#2 Priya N.</span>
                <span className="verd-mixed">72% Mixed</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
