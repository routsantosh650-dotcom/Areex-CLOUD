import React, { useEffect, useState } from 'react';
import { RotateCcw, Terminal } from 'lucide-react';

const TERMINAL_STEPS = [
  { text: '→ Allocating NVMe node [IN-MUM-01]...', color: 'text-slate-400' },
  { text: '→ Assigning 8GB DDR5 RAM, 250% CPU...', color: 'text-slate-400' },
  { text: '→ Installing Java 21 + Paper 1.21.1...', color: 'text-slate-400' },
  { text: '→ Configuring Pterodactyl panel...', color: 'text-slate-400' },
  { text: '→ Activating DDoS shield layer...', color: 'text-slate-400' },
  {
    text: '→ Sending login to ',
    highlight: 'you@email.com',
    suffix: '...',
    color: 'text-slate-400',
  },
  {
    text: '✓ Server ONLINE — play.areexcloud.site',
    color: 'text-emerald-400 font-bold',
  },
  {
    text: '→ Total time: ',
    highlight: '52 seconds',
    suffix: '',
    color: 'text-slate-400',
  },
];

const PROCESS_STEPS = [
  {
    num: '01',
    title: 'Pick a Plan',
    desc: 'Choose from Budget, Premium, Exclusive, Bot, VPS, or Domain — whatever fits your community size and goals.',
  },
  {
    num: '02',
    title: 'Pay via Razorpay',
    desc: 'Direct checkout with Razorpay UPI (GPay, PhonePe, Paytm), cards, net banking & promo codes.',
  },
  {
    num: '03',
    title: 'Server Goes Live',
    desc: 'Pterodactyl panel login lands in your inbox instantly. Your server is already online.',
  },
  {
    num: '04',
    title: 'Play & Build',
    desc: 'Share your IP, install plugins, invite friends. We handle uptime — you handle the fun.',
  },
];

export const LiveUnder60SecondsSection: React.FC = () => {
  const [visibleLines, setVisibleLines] = useState<number>(TERMINAL_STEPS.length);
  const [activePlanCmd, setActivePlanCmd] = useState<'pro' | 'elite-plus' | 'vps-macro'>(
    'pro'
  );

  const runDeploySimulation = (planFlag: 'pro' | 'elite-plus' | 'vps-macro') => {
    setActivePlanCmd(planFlag);
    setVisibleLines(0);
  };

  useEffect(() => {
    if (visibleLines >= TERMINAL_STEPS.length) return;
    const timer = setTimeout(() => {
      setVisibleLines((prev) => prev + 1);
    }, 220);
    return () => clearTimeout(timer);
  }, [visibleLines]);

  return (
    <section
      id="process-section"
      className="border-b border-white/10 bg-[#070508] py-14 sm:py-24 overflow-hidden"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Centered Header Matching Screenshot 856 */}
        <div className="text-center">
          <div className="inline-flex items-center gap-3 font-mono text-xs font-bold tracking-[0.2em] text-red-400 uppercase">
            <span className="h-px w-8 bg-red-500/50" />
            <span>PROCESS</span>
            <span className="h-px w-8 bg-red-500/50" />
          </div>
          <h2 className="mt-3 font-display text-2xl sm:text-5xl font-extrabold tracking-tight text-white">
            Live in Under 60 Seconds
          </h2>
        </div>

        {/* 2-Column Layout: Left = 4 Numbered Steps | Right = Live Bash Terminal */}
        <div className="mt-10 sm:mt-14 grid grid-cols-1 items-center gap-8 sm:gap-12 lg:grid-cols-12">
          {/* Left Column: 01 - 04 Steps */}
          <div className="divide-y divide-white/10 lg:col-span-6">
            {PROCESS_STEPS.map((step) => (
              <div
                key={step.num}
                className="flex items-start gap-3.5 sm:gap-4 py-4 sm:py-5 first:pt-0 last:pb-0"
              >
                <div className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl border border-red-500/40 bg-red-600/15 font-mono text-xs sm:text-sm font-extrabold text-red-400 shadow-[0_0_20px_rgba(220,38,38,0.2)]">
                  {step.num}
                </div>
                <div className="min-w-0">
                  <h3 className="font-display text-base font-bold text-white">
                    {step.title}
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-slate-400">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Right Column: Interactive Bash Terminal Window (Matching Screenshot 856) */}
          <div className="w-full min-w-0 lg:col-span-6">
            <div className="overflow-hidden rounded-2xl border border-white/15 bg-[#050507] shadow-[0_25px_70px_rgba(0,0,0,0.9)]">
              {/* macOS Window Title Bar */}
              <div className="flex items-center justify-between gap-2 border-b border-white/10 bg-[#0d0b10] px-3 sm:px-4 py-3">
                <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                  <span className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-[#ff5f56]" />
                  <span className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-[#ffbd2e]" />
                  <span className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-[#27c93f]" />
                </div>

                <div className="flex items-center gap-1.5 font-mono text-[10px] sm:text-[11px] text-slate-400 truncate">
                  <Terminal className="h-3.5 w-3.5 text-red-400 shrink-0" />
                  <span className="truncate">areex-deploy — bash</span>
                </div>

                <button
                  type="button"
                  onClick={() => runDeploySimulation(activePlanCmd)}
                  title="Replay deployment terminal"
                  className="flex items-center gap-1 rounded-md border border-white/10 bg-white/5 px-2 py-0.5 font-mono text-[10px] text-slate-300 hover:border-red-500/50 hover:text-white shrink-0"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>Replay</span>
                </button>
              </div>

              {/* Terminal Body */}
              <div className="min-h-[260px] sm:min-h-[300px] p-4 sm:p-6 font-mono text-[11px] sm:text-xs leading-6 sm:leading-7 break-words">
                <div className="text-emerald-400 font-semibold break-all">
                  areex@cloud:~$ <span className="text-white">./launch.sh --plan {activePlanCmd}</span>
                </div>

                <div className="mt-2 space-y-1">
                  {TERMINAL_STEPS.slice(0, visibleLines).map((line, i) => (
                    <div key={i} className={`${line.color} break-words`}>
                      {line.text}
                      {line.highlight && (
                        <span className="font-bold text-amber-400">
                          {line.highlight}
                        </span>
                      )}
                      {line.suffix || ''}
                    </div>
                  ))}
                </div>

                {visibleLines >= TERMINAL_STEPS.length && (
                  <div className="mt-2 flex items-center gap-1 text-emerald-400 font-semibold">
                    <span>areex@cloud:~$</span>
                    <span className="inline-block h-4 w-2 animate-pulse bg-emerald-400" />
                  </div>
                )}
              </div>

              {/* Quick Plan Flag Switcher inside Terminal Footer */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/10 bg-[#0a080d] px-3 sm:px-4 py-2.5 font-mono text-[10px] text-slate-400">
                <span>Test live deploy command:</span>
                <div className="flex flex-wrap items-center gap-1.5">
                  {(['pro', 'elite-plus', 'vps-macro'] as const).map((flag) => (
                    <button
                      key={flag}
                      type="button"
                      onClick={() => runDeploySimulation(flag)}
                      className={`rounded px-2 py-0.5 transition-colors whitespace-nowrap ${
                        activePlanCmd === flag
                          ? 'bg-red-600 text-white font-bold'
                          : 'bg-white/5 text-slate-400 hover:text-white'
                      }`}
                    >
                      --plan {flag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
