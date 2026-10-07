import React, { useState } from 'react';
import {
  Scale,
  ShieldCheck,
  FileCheck2,
  RefreshCcw,
  Users,
  Lock,
  CheckCircle2,
} from 'lucide-react';
import {
  TERMS_OF_SERVICE_ITEMS,
  COMMUNITY_GUIDELINES_ITEMS,
  PRIVACY_POLICY_ITEMS,
  REFUND_SLA_POLICY_ITEMS,
} from '../data/areexData';

export const LegalSection: React.FC = () => {
  const [activeDoc, setActiveDoc] = useState<'all' | 'tos' | 'guidelines' | 'privacy' | 'refund'>(
    'all'
  );

  return (
    <section
      id="legal-section"
      className="border-t border-white/10 bg-[#090507] py-14 sm:py-20 overflow-hidden"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Header */}
        <div className="flex flex-col items-start justify-between gap-6 border-b border-white/10 pb-8 lg:flex-row lg:items-end">
          <div className="w-full lg:w-auto">
            <div className="flex items-center gap-2 font-mono text-[11px] sm:text-xs text-red-400">
              <Scale className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">OFFICIAL LEGAL & COMPLIANCE CENTER</span>
            </div>
            <h2
              style={{ textWrap: 'balance' }}
              className="mt-2 font-display text-2xl sm:text-4xl font-bold tracking-tight text-white"
            >
              Terms of Service, Privacy & Community Guidelines
            </h2>
            <p className="mt-2 max-w-2xl text-xs sm:text-sm text-slate-400">
              Clear, fair, and legally binding hosting agreements designed to protect Indian gamers, server owners, and community networks.
            </p>
          </div>

          {/* Filter Tabs for Legal Documents */}
          <div
            role="tablist"
            aria-label="Legal Policy Categories"
            className="flex w-full lg:w-auto flex-wrap items-center gap-1.5 rounded-xl border border-white/10 bg-[#12090e] p-1.5"
          >
            {[
              { id: 'all', label: 'All Policies' },
              { id: 'tos', label: 'Terms of Service' },
              { id: 'guidelines', label: 'Community Guidelines' },
              { id: 'privacy', label: 'Privacy & AES-256' },
              { id: 'refund', label: '24h Refund & SLA' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={activeDoc === tab.id}
                onClick={() =>
                  setActiveDoc(
                    tab.id as 'all' | 'tos' | 'guidelines' | 'privacy' | 'refund'
                  )
                }
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                  activeDoc === tab.id
                    ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.35)]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* 4 Legal Verification & Trust Badges */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-[#11080c] p-4">
            <ShieldCheck className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-bold text-white">Indian IT & DPDP Act Compliant</div>
              <p className="mt-0.5 text-[11px] text-slate-400">
                Operated under Indian cyber law & Digital Personal Data Protection standards.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-[#11080c] p-4">
            <RefreshCcw className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-bold text-white">24-Hour Refund Guarantee</div>
              <p className="mt-0.5 text-[11px] text-slate-400">
                Full 100% refund within 24 hours if promised hardware specs are not met.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-[#11080c] p-4">
            <Lock className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-bold text-white">AES-256-GCM Data Sovereignty</div>
              <p className="mt-0.5 text-[11px] text-slate-400">
                Zero third-party data selling. World files & credentials remain 100% yours.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-[#11080c] p-4">
            <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-bold text-white">99.9% Uptime SLA Backed</div>
              <p className="mt-0.5 text-[11px] text-slate-400">
                Guaranteed network availability across Mumbai, Noida & Singapore nodes.
              </p>
            </div>
          </div>
        </div>

        {/* Legal Cards Grid */}
        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          {/* Card 1: Terms of Service */}
          {(activeDoc === 'all' || activeDoc === 'tos') && (
            <div className="rounded-2xl border border-white/10 bg-[#11090d] p-6 sm:p-8">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <div className="font-mono text-xs text-red-400">LEGAL · SECTION 01</div>
                  <h3 className="mt-1 font-display text-2xl font-bold text-white">
                    Terms of Service
                  </h3>
                </div>
                <FileCheck2 className="h-6 w-6 text-red-500" />
              </div>

              <div className="mt-6 space-y-4">
                {TERMS_OF_SERVICE_ITEMS.map((item, idx) => (
                  <div
                    key={item.title}
                    className="flex items-start gap-3.5 rounded-xl border border-white/5 bg-[#090608]/80 p-4 transition-colors hover:border-red-500/30"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-red-600/20 font-mono text-xs font-bold text-red-400">
                      {idx + 1}
                    </span>
                    <div>
                      <h4 className="text-sm font-semibold text-white">
                        {item.title.replace(/^\d+\.\s*/, '')}
                      </h4>
                      <p className="mt-1 text-xs leading-relaxed text-slate-400">
                        {item.detail}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Card 2: Community Guidelines */}
          {(activeDoc === 'all' || activeDoc === 'guidelines') && (
            <div className="rounded-2xl border border-white/10 bg-[#11090d] p-6 sm:p-8">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <div className="font-mono text-xs text-red-400">
                    DISCORD & PLATFORM · SECTION 02
                  </div>
                  <h3 className="mt-1 font-display text-2xl font-bold text-white">
                    Community Guidelines
                  </h3>
                </div>
                <Users className="h-6 w-6 text-red-500" />
              </div>

              <div className="mt-6 space-y-4">
                {COMMUNITY_GUIDELINES_ITEMS.map((item, idx) => (
                  <div
                    key={item.title}
                    className="flex items-start gap-3.5 rounded-xl border border-white/5 bg-[#090608]/80 p-4 transition-colors hover:border-red-500/30"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-red-600/20 font-mono text-xs font-bold text-red-400">
                      {idx + 1}
                    </span>
                    <div>
                      <h4 className="text-sm font-semibold text-white">
                        {item.title.replace(/^\d+\.\s*/, '')}
                      </h4>
                      <p className="mt-1 text-xs leading-relaxed text-slate-400">
                        {item.detail}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Card 3: Privacy & AES-256 Data Protection Policy */}
          {(activeDoc === 'all' || activeDoc === 'privacy') && (
            <div className="rounded-2xl border border-white/10 bg-[#11090d] p-6 sm:p-8">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <div className="font-mono text-xs text-red-400">
                    DATA PROTECTION · SECTION 03
                  </div>
                  <h3 className="mt-1 font-display text-2xl font-bold text-white">
                    Privacy & AES-256 Data Policy
                  </h3>
                </div>
                <Lock className="h-6 w-6 text-red-500" />
              </div>

              <div className="mt-6 space-y-4">
                {PRIVACY_POLICY_ITEMS.map((item, idx) => (
                  <div
                    key={item.title}
                    className="flex items-start gap-3.5 rounded-xl border border-white/5 bg-[#090608]/80 p-4 transition-colors hover:border-red-500/30"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-red-600/20 font-mono text-xs font-bold text-red-400">
                      {idx + 1}
                    </span>
                    <div>
                      <h4 className="text-sm font-semibold text-white">
                        {item.title.replace(/^\d+\.\s*/, '')}
                      </h4>
                      <p className="mt-1 text-xs leading-relaxed text-slate-400">
                        {item.detail}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Card 4: Refund Policy & 99.9% Uptime SLA */}
          {(activeDoc === 'all' || activeDoc === 'refund') && (
            <div className="rounded-2xl border border-white/10 bg-[#11090d] p-6 sm:p-8">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <div className="font-mono text-xs text-red-400">
                    BILLING & SLA · SECTION 04
                  </div>
                  <h3 className="mt-1 font-display text-2xl font-bold text-white">
                    Refund Policy & Uptime SLA
                  </h3>
                </div>
                <RefreshCcw className="h-6 w-6 text-red-500" />
              </div>

              <div className="mt-6 space-y-4">
                {REFUND_SLA_POLICY_ITEMS.map((item, idx) => (
                  <div
                    key={item.title}
                    className="flex items-start gap-3.5 rounded-xl border border-white/5 bg-[#090608]/80 p-4 transition-colors hover:border-red-500/30"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-red-600/20 font-mono text-xs font-bold text-red-400">
                      {idx + 1}
                    </span>
                    <div>
                      <h4 className="text-sm font-semibold text-white">
                        {item.title.replace(/^\d+\.\s*/, '')}
                      </h4>
                      <p className="mt-1 text-xs leading-relaxed text-slate-400">
                        {item.detail}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
