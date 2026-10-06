import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { SlidersHorizontal, Check, ChevronRight } from 'lucide-react';
import { CURRENCIES, CurrencyCode } from '../data/areexData';

interface CurrencySlidebarProps {
  currency: CurrencyCode;
  onCurrencyChange: (currency: CurrencyCode) => void;
  variant?: 'nav' | 'inline' | 'card';
}

export const CurrencySlidebar: React.FC<CurrencySlidebarProps> = ({
  currency,
  onCurrencyChange,
  variant = 'nav',
}) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const drawerRef = useRef<HTMLDivElement | null>(null);

  const activeMeta = CURRENCIES.find((c) => c.code === currency) || CURRENCIES[0];

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('mousedown', handleOutsideClick);
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('mousedown', handleOutsideClick);
      window.removeEventListener('keydown', handleEsc);
    };
  }, []);

  useEffect(() => {
    if (open && drawerRef.current) {
      gsap.fromTo(
        drawerRef.current,
        { opacity: 0, x: 14, scale: 0.96 },
        { opacity: 1, x: 0, scale: 1, duration: 0.2, ease: 'power3.out' }
      );
    }
  }, [open]);

  if (variant === 'card') {
    return (
      <div ref={containerRef} className="relative inline-block">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setOpen((prev) => !prev);
          }}
          aria-label={`Change card currency, currently ${activeMeta.label}`}
          className="flex items-center gap-1 rounded-lg border border-white/15 bg-black/60 px-2 py-1 font-mono text-[11px] font-semibold text-slate-200 transition-colors hover:border-red-500/60 hover:text-white"
        >
          <span className="text-red-400">{activeMeta.symbol}</span>
          <span>{activeMeta.code}</span>
          <ChevronRight
            className={`h-3 w-3 text-slate-400 transition-transform duration-200 ${
              open ? 'rotate-90 text-red-400' : ''
            }`}
          />
        </button>

        {open && (
          <div
            ref={drawerRef}
            onClick={(e) => e.stopPropagation()}
            className="absolute right-0 top-full z-30 mt-1.5 flex items-center gap-1 rounded-xl border border-red-500/40 bg-[#0d0609]/95 p-1 shadow-[0_10px_30px_rgba(0,0,0,0.85)] backdrop-blur-xl"
          >
            {CURRENCIES.map((c) => {
              const isSelected = c.code === currency;
              return (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => {
                    onCurrencyChange(c.code);
                    setOpen(false);
                  }}
                  className={`rounded-lg px-2 py-1 font-mono text-[10px] font-semibold transition-colors whitespace-nowrap ${
                    isSelected
                      ? 'bg-red-600 text-white'
                      : 'text-slate-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {c.label}
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      {/* Single Compact Currency Trigger Button */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-label="Open Currency Slidebar Selector"
        className="flex items-center gap-2 rounded-xl border border-white/15 bg-[#120a0e] px-3.5 py-2 font-mono text-xs font-semibold text-white transition-all hover:border-red-500/60 hover:bg-[#190d13] whitespace-nowrap"
      >
        <SlidersHorizontal className="h-3.5 w-3.5 text-red-500" />
        <span>Currency:</span>
        <span className="rounded bg-red-600/20 px-1.5 py-0.5 text-red-400">
          {activeMeta.label}
        </span>
      </button>

      {/* Slidebar Drawer / Popover */}
      {open && (
        <div
          ref={drawerRef}
          role="dialog"
          aria-label="Currency Slidebar Selector"
          className="absolute right-0 top-full z-50 mt-2 w-64 rounded-2xl border border-red-500/40 bg-[#11080c]/95 p-3.5 text-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.9)] backdrop-blur-xl"
        >
          <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
            <span className="font-display text-xs font-bold text-white">
              Select Display Currency
            </span>
            <span className="font-mono text-[10px] text-red-400">LIVE FX</span>
          </div>

          {/* Interactive Slidebar Track */}
          <div className="mt-3 grid grid-cols-4 gap-1 rounded-xl border border-white/10 bg-[#090507] p-1">
            {CURRENCIES.map((c) => {
              const active = c.code === currency;
              return (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => {
                    onCurrencyChange(c.code);
                    setOpen(false);
                  }}
                  className={`rounded-lg py-1.5 font-mono text-xs font-bold transition-all ${
                    active
                      ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.4)]'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {c.symbol}
                </button>
              );
            })}
          </div>

          {/* Detailed Currency List */}
          <div className="mt-2.5 space-y-1">
            {CURRENCIES.map((c) => {
              const active = c.code === currency;
              const rateName =
                c.code === 'INR'
                  ? 'Indian Rupee (Base)'
                  : c.code === 'USD'
                    ? 'US Dollar ($)'
                    : c.code === 'EUR'
                      ? 'Euro (€)'
                      : 'British Pound (£)';
              return (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => {
                    onCurrencyChange(c.code);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs transition-colors ${
                    active
                      ? 'border border-red-500/40 bg-red-600/15 text-white'
                      : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <div>
                    <div className="font-mono font-semibold">{c.label}</div>
                    <div className="text-[10px] text-slate-400">{rateName}</div>
                  </div>
                  {active && <Check className="h-4 w-4 text-red-400" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
