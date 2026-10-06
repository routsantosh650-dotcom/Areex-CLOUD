import React, { useRef, useState } from 'react';
import gsap from 'gsap';
import { Check, ArrowRight, Flame } from 'lucide-react';
import {
  HostingPlanItem,
  CurrencyCode,
  formatPriceInCurrency,
  getPlanCutPriceInr,
} from '../data/areexData';
import { CurrencySlidebar } from './CurrencySlidebar';

interface InteractivePlanCardProps {
  plan: HostingPlanItem;
  categoryName: string;
  currency: CurrencyCode;
  onCurrencyChange: (currency: CurrencyCode) => void;
  onSelectPlan: (plan: HostingPlanItem) => void;
  hasDiscountOffer?: boolean;
  discountPercent?: number;
}

export const InteractivePlanCard: React.FC<InteractivePlanCardProps> = ({
  plan,
  categoryName,
  currency,
  onCurrencyChange,
  onSelectPlan,
  hasDiscountOffer = false,
  discountPercent = 20,
}) => {
  const cardRef = useRef<HTMLElement | null>(null);
  const [glowPos, setGlowPos] = useState({ x: 50, y: 50, active: false });

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const relX = e.clientX - rect.left;
    const relY = e.clientY - rect.top;
    const pctX = (relX / rect.width) * 100;
    const pctY = (relY / rect.height) * 100;

    setGlowPos({ x: pctX, y: pctY, active: true });

    const rotateY = (relX / rect.width - 0.5) * 10;
    const rotateX = (0.5 - relY / rect.height) * 10;

    gsap.to(el, {
      rotateX,
      rotateY,
      y: -6,
      scale: 1.015,
      duration: 0.18,
      ease: 'power2.out',
      transformPerspective: 900,
    });
  };

  const handleMouseLeave = () => {
    setGlowPos((prev) => ({ ...prev, active: false }));
    if (!cardRef.current) return;
    gsap.to(cardRef.current, {
      rotateX: 0,
      rotateY: 0,
      y: 0,
      scale: 1,
      duration: 0.25,
      ease: 'power2.out',
    });
  };

  // Cut/Strikethrough price is ONLY calculated and displayed when Discount Offer Board has text
  const cutPriceInr = hasDiscountOffer
    ? getPlanCutPriceInr(plan, discountPercent)
    : null;

  const savedPercent =
    hasDiscountOffer && cutPriceInr && cutPriceInr > plan.priceInr
      ? Math.max(
          1,
          Math.round(((cutPriceInr - plan.priceInr) / cutPriceInr) * 100)
        )
      : 0;

  return (
    <article
      ref={cardRef}
      data-plan-card
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        backgroundImage: glowPos.active
          ? `radial-gradient(360px circle at ${glowPos.x}% ${glowPos.y}%, rgba(220, 38, 38, 0.22), transparent 70%)`
          : undefined,
      }}
      className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border p-6 transition-colors ${
        plan.popular
          ? 'border-red-500 bg-[#160a10] shadow-[0_0_35px_rgba(220,38,38,0.18)]'
          : 'border-white/10 bg-[#11080c] hover:border-red-500/60'
      }`}
    >
      {/* Top Animated Crimson Accent Bar on Hover */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-red-700 via-red-500 to-amber-500 transition-opacity duration-200 ${
          plan.popular || glowPos.active ? 'opacity-100' : 'opacity-0'
        }`}
      />

      <div className="relative z-10">
        {/* Quiet 1-line text kicker + Compact Slidebar Currency Selector */}
        <div className="flex items-center justify-between gap-2 font-mono text-[11px]">
          <span className={plan.popular ? 'font-semibold text-red-400' : 'text-slate-400'}>
            {plan.popular ? 'MOST POPULAR TIER' : categoryName.toUpperCase()}
          </span>

          <CurrencySlidebar
            currency={currency}
            onCurrencyChange={onCurrencyChange}
            variant="card"
          />
        </div>

        <h3 className="mt-2.5 font-display text-2xl font-bold text-white transition-colors group-hover:text-red-400">
          {plan.name}
        </h3>
        <p className="mt-1 text-xs text-slate-400">{plan.tagline}</p>

        {/* Tabular Price in Selected Currency (with Conditional Strikethrough Cut Price when Discount Offer is active) */}
        <div className="mt-5 flex items-end justify-between border-b border-white/10 pb-5 font-mono">
          <div>
            {hasDiscountOffer && cutPriceInr && cutPriceInr > plan.priceInr && (
              <div className="mb-1 flex items-center gap-2">
                <span
                  data-testid="plan-cut-price"
                  className="text-sm font-semibold text-slate-400 line-through decoration-red-500 decoration-2 tabular-nums"
                >
                  {formatPriceInCurrency(cutPriceInr, currency)}
                </span>
                <span className="inline-flex items-center gap-1 rounded bg-red-600/20 px-1.5 py-0.5 text-[10px] font-bold text-red-400">
                  <Flame className="h-3 w-3" />
                  <span>SAVE {savedPercent}%</span>
                </span>
              </div>
            )}

            <div className="flex items-baseline">
              <span className="text-3xl font-extrabold text-white tabular-nums">
                {formatPriceInCurrency(plan.priceInr, currency)}
              </span>
              <span className="ml-1 text-xs text-slate-400">{plan.billingPeriod}</span>
            </div>
          </div>
          <span className="text-[11px] text-slate-400">{plan.speed}</span>
        </div>

        {/* Key Specs Summary Line */}
        <div className="mt-4 flex flex-wrap items-center gap-2 font-mono text-xs text-slate-200 tabular-nums">
          <span>{plan.ram}</span>
          <span aria-hidden="true" className="text-red-500">
            ·
          </span>
          <span>{plan.cpu}</span>
          <span aria-hidden="true" className="text-red-500">
            ·
          </span>
          <span>{plan.storage}</span>
        </div>

        {/* Features Checklist */}
        <ul className="mt-5 space-y-2.5 border-t border-white/10 pt-5 text-xs text-slate-300">
          {plan.features.map((feat, idx) => (
            <li key={idx} className="flex items-center gap-2.5">
              <Check className="h-3.5 w-3.5 text-red-500 shrink-0" />
              <span>{feat}</span>
            </li>
          ))}
        </ul>
      </div>

      <button
        type="button"
        onClick={() => onSelectPlan(plan)}
        className={`relative z-10 mt-7 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-xs font-semibold transition-all whitespace-nowrap ${
          plan.popular
            ? 'bg-red-600 text-white shadow-[0_0_25px_rgba(220,38,38,0.4)] hover:bg-red-500'
            : 'border border-red-500/40 bg-red-600/15 text-white group-hover:bg-red-600 group-hover:border-red-500'
        }`}
      >
        <span>Get {plan.name}</span>
        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
      </button>
    </article>
  );
};
