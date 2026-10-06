import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { Shield, Server, Zap } from 'lucide-react';

interface CinematicLoaderProps {
  visible: boolean;
  onComplete: () => void;
}

export const CinematicLoader: React.FC<CinematicLoaderProps> = ({ visible, onComplete }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const progressRef = useRef<HTMLDivElement | null>(null);
  const [percent, setPercent] = useState(0);
  const [stageText, setStageText] = useState('Initializing Mumbai IN-West-1 Ryzen 9 9950X Nodes...');

  useEffect(() => {
    if (!visible) return;

    setPercent(0);
    const stages = [
      'Initializing Mumbai IN-West-1 Ryzen 9 9950X Nodes...',
      'Verifying AES-256-GCM Cryptographic Vault & DDoS Shield...',
      'Mounting Pterodactyl Game Panel & NVMe Gen5 Clusters...',
      'Areex Cloud Ready.',
    ];

    const counter = { val: 0 };
    const tl = gsap.timeline({
      onComplete: () => {
        if (containerRef.current) {
          gsap.to(containerRef.current, {
            opacity: 0,
            duration: 0.35,
            ease: 'power2.out',
            onComplete,
          });
        } else {
          onComplete();
        }
      },
    });

    tl.to(counter, {
      val: 100,
      duration: 1.15,
      ease: 'power2.inOut',
      onUpdate: () => {
        const current = Math.round(counter.val);
        setPercent(current);
        if (current < 35) setStageText(stages[0]);
        else if (current < 70) setStageText(stages[1]);
        else if (current < 95) setStageText(stages[2]);
        else setStageText(stages[3]);
      },
    });

    if (progressRef.current) {
      gsap.fromTo(
        progressRef.current,
        { scaleX: 0 },
        { scaleX: 1, duration: 1.15, ease: 'power2.inOut', transformOrigin: 'left center' }
      );
    }

    return () => {
      tl.kill();
    };
  }, [visible, onComplete]);

  if (!visible) return null;

  return (
    <div
      ref={containerRef}
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-[#090608] px-6 py-10 text-slate-100"
    >
      <div className="flex w-full max-w-5xl items-center justify-between border-b border-white/10 pb-4">
        <span className="font-display text-lg font-bold tracking-tight text-white">
          Areex Cloud
        </span>
        <button
          type="button"
          onClick={onComplete}
          className="rounded-md border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:border-red-500/50 hover:text-white whitespace-nowrap"
        >
          Skip Intro
        </button>
      </div>

      <div className="my-auto flex w-full max-w-xl flex-col items-center text-center">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-red-500/30 bg-red-600/10 text-red-500 shadow-[0_0_40px_rgba(220,38,38,0.25)]">
          <Server className="h-8 w-8" />
        </div>

        <h2 className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Deploying High-Frequency Cloud Fabric
        </h2>
        <p className="mt-2 font-mono text-xs text-slate-400">{stageText}</p>

        <div className="mt-8 w-full overflow-hidden rounded-full bg-white/10 h-1.5">
          <div
            ref={progressRef}
            className="h-full w-full origin-left bg-gradient-to-r from-red-700 via-red-500 to-amber-500"
          />
        </div>

        <div className="mt-4 flex w-full items-center justify-between font-mono text-xs text-slate-400 tabular-nums">
          <span>AES-256-GCM VAULT VERIFIED</span>
          <span className="text-red-400 font-semibold">{percent}%</span>
        </div>
      </div>

      <div className="flex w-full max-w-5xl flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-4 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <Shield className="h-3.5 w-3.5 text-red-500" />
          <span>17.2 Tbps DDoS Mitigation</span>
          <span aria-hidden="true">·</span>
          <span>Mumbai & Noida Low-Latency Peering</span>
        </div>
        <div className="flex items-center gap-2 font-mono">
          <Zap className="h-3.5 w-3.5 text-red-500" />
          <span>Right-click anywhere for Quick Command Menu</span>
        </div>
      </div>
    </div>
  );
};
