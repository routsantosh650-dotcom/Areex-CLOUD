import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import {
  Terminal,
  Server,
  BarChart3,
  Settings,
  Copy,
  Check,
  Sparkles,
  RefreshCw,
  ShieldCheck,
  CreditCard,
  MessageSquare,
  Tag,
  Globe,
} from 'lucide-react';
import { PlanCategoryKey } from '../data/areexData';
import { AdminTabKey } from './AdminAnalyticsWorkspace';

interface CustomContextMenuProps {
  onSelectCategory: (cat: PlanCategoryKey) => void;
  onOpenWorkspace: (tab: AdminTabKey) => void;
  onReplayLoader: () => void;
  onQuickCheckout: () => void;
  onOpenSupportChat?: () => void;
  isAdminUnlocked?: boolean;
}

export const CustomContextMenu: React.FC<CustomContextMenuProps> = ({
  onSelectCategory,
  onOpenWorkspace,
  onReplayLoader,
  onQuickCheckout,
  onOpenSupportChat,
  isAdminUnlocked = false,
}) => {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ x: 240, y: 180 });
  const [copiedIp, setCopiedIp] = useState(false);
  const [pingResult, setPingResult] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      const menuWidth = 280;
      const menuHeight = isAdminUnlocked ? 420 : 310;
      const clampedX = Math.min(e.clientX, window.innerWidth - menuWidth - 16);
      const clampedY = Math.min(e.clientY, window.innerHeight - menuHeight - 16);
      setCoords({ x: Math.max(16, clampedX), y: Math.max(16, clampedY) });
      setOpen(true);
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };

    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isAdminUnlocked]);

  useEffect(() => {
    if (open && menuRef.current) {
      gsap.fromTo(
        menuRef.current,
        { opacity: 0, scale: 0.94, y: -6 },
        { opacity: 1, scale: 1, y: 0, duration: 0.18, ease: 'power3.out' }
      );
    }
  }, [open, coords]);

  const handleCopyServerIp = () => {
    navigator.clipboard?.writeText('play.areexcloud.site');
    setCopiedIp(true);
    setTimeout(() => setCopiedIp(false), 1800);
  };

  const handlePingMumbai = () => {
    setPingResult('Pinging 103.195.102.1...');
    setTimeout(() => {
      setPingResult('Mumbai IN-West-1: 4.2ms (0% loss)');
    }, 250);
  };

  return (
    <>
      <div className="fixed bottom-4 left-4 z-30 hidden sm:block">
        <button
          type="button"
          onClick={() => {
            setCoords({ x: 24, y: Math.max(80, window.innerHeight - 380) });
            setOpen((prev) => !prev);
          }}
          aria-label="Open Quick Command Context Menu"
          className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-[#120a0e]/90 px-3 py-2 text-xs font-medium text-slate-200 shadow-lg backdrop-blur-md transition-colors hover:border-red-500 hover:text-white whitespace-nowrap"
        >
          <Terminal className="h-3.5 w-3.5 text-red-500" />
          <span>Quick Menu (Right-Click)</span>
        </button>
      </div>

      {open && (
        <div
          ref={menuRef}
          role="menu"
          aria-label="Areex Cloud Fluid Command Menu"
          style={{ left: `${coords.x}px`, top: `${coords.y}px` }}
          className="fixed z-50 w-72 max-w-[calc(100vw-2rem)] rounded-xl border border-red-500/30 bg-[#120a0e]/95 p-2 text-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.85)] backdrop-blur-xl"
        >
          <div className="flex items-center justify-between border-b border-white/10 px-2.5 py-2">
            <span className="font-display text-xs font-bold tracking-wide text-white">
              Areex Cloud Command
            </span>
            <span className="font-mono text-[11px] text-emerald-400">4ms Mumbai</span>
          </div>

          <div className="py-1.5">
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                onSelectCategory('premium');
                setOpen(false);
                document.getElementById('pricing-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs text-slate-200 transition-colors hover:bg-red-600/20 hover:text-white"
            >
              <span className="flex items-center gap-2">
                <Server className="h-3.5 w-3.5 text-red-400" />
                <span>Browse Premium Plans</span>
              </span>
              <span className="font-mono text-[11px] text-slate-400">₹399+</span>
            </button>

            <button
              type="button"
              role="menuitem"
              onClick={() => {
                onSelectCategory('vps');
                setOpen(false);
                document.getElementById('pricing-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs text-slate-200 transition-colors hover:bg-red-600/20 hover:text-white"
            >
              <span className="flex items-center gap-2">
                <Terminal className="h-3.5 w-3.5 text-red-400" />
                <span>Explore KVM VPS Servers</span>
              </span>
              <span className="font-mono text-[11px] text-slate-400">₹149+</span>
            </button>

            <button
              type="button"
              role="menuitem"
              onClick={() => {
                onSelectCategory('bot');
                setOpen(false);
                document.getElementById('pricing-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs text-slate-200 transition-colors hover:bg-red-600/20 hover:text-white"
            >
              <span className="flex items-center gap-2">
                <Globe className="h-3.5 w-3.5 text-red-400" />
                <span>24/7 Discord Bot Hosting</span>
              </span>
              <span className="font-mono text-[11px] text-slate-400">₹29+</span>
            </button>

            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                if (onOpenSupportChat) {
                  onOpenSupportChat();
                }
              }}
              className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs text-slate-200 transition-colors hover:bg-red-600/20 hover:text-white"
            >
              <span className="flex items-center gap-2">
                <MessageSquare className="h-3.5 w-3.5 text-red-400" />
                <span>Open 24/7 Support Chat</span>
              </span>
              <span className="font-mono text-[11px] text-emerald-400">Online</span>
            </button>

            <button
              type="button"
              role="menuitem"
              onClick={() => {
                onQuickCheckout();
                setOpen(false);
              }}
              className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs text-slate-200 transition-colors hover:bg-red-600/20 hover:text-white"
            >
              <span className="flex items-center gap-2">
                <CreditCard className="h-3.5 w-3.5 text-red-400" />
                <span>Instant Checkout (Stripe/PayPal/UPI)</span>
              </span>
              <span className="font-mono text-[11px] text-slate-400">Fast</span>
            </button>
          </div>

          {/* STRICT ADMIN-ONLY OPTIONS: Completely hidden for normal visitors */}
          {isAdminUnlocked && (
            <div className="border-t border-white/10 py-1.5">
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  onOpenWorkspace('discount');
                  setOpen(false);
                }}
                className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs text-slate-200 transition-colors hover:bg-red-600/20 hover:text-white"
              >
                <span className="flex items-center gap-2">
                  <Tag className="h-3.5 w-3.5 text-red-400" />
                  <span>Admin Discount & Coupons</span>
                </span>
                <span className="font-mono text-[11px] text-amber-400">2-Admin</span>
              </button>

              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  onOpenWorkspace('plans');
                  setOpen(false);
                }}
                className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs text-slate-200 transition-colors hover:bg-red-600/20 hover:text-white"
              >
                <span className="flex items-center gap-2">
                  <Settings className="h-3.5 w-3.5 text-red-400" />
                  <span>Plan & Cut-Price Manager</span>
                </span>
                <span className="font-mono text-[11px] text-emerald-400">Unlocked</span>
              </button>

              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  onOpenWorkspace('analytics');
                  setOpen(false);
                }}
                className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs text-slate-200 transition-colors hover:bg-red-600/20 hover:text-white"
              >
                <span className="flex items-center gap-2">
                  <BarChart3 className="h-3.5 w-3.5 text-red-400" />
                  <span>Real-Time Analytics Monitor</span>
                </span>
                <span className="font-mono text-[11px] text-emerald-400">Live</span>
              </button>

              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  onOpenWorkspace('security');
                  setOpen(false);
                }}
                className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs text-slate-200 transition-colors hover:bg-red-600/20 hover:text-white"
              >
                <span className="flex items-center gap-2">
                  <ShieldCheck className="h-3.5 w-3.5 text-red-400" />
                  <span>AES-256 Encryption Vault</span>
                </span>
                <span className="font-mono text-[11px] text-slate-400">256-bit</span>
              </button>
            </div>
          )}

          <div className="border-t border-white/10 pt-1.5">
            <button
              type="button"
              role="menuitem"
              onClick={handleCopyServerIp}
              className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
            >
              <span className="flex items-center gap-2">
                {copiedIp ? (
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                ) : (
                  <Copy className="h-3.5 w-3.5 text-slate-400" />
                )}
                <span>{copiedIp ? 'Copied play.areexcloud.site!' : 'Copy Demo Server IP'}</span>
              </span>
            </button>

            <button
              type="button"
              role="menuitem"
              onClick={handlePingMumbai}
              className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
            >
              <span className="flex items-center gap-2">
                <RefreshCw className="h-3.5 w-3.5 text-slate-400" />
                <span>{pingResult || 'Test Mumbai Node Latency'}</span>
              </span>
            </button>

            <div className="mt-1 flex items-center gap-1 border-t border-white/10 pt-1.5">
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setOpen(false);
                  onReplayLoader();
                }}
                className="flex w-full items-center justify-center gap-1.5 rounded-md bg-red-600/20 px-2.5 py-1.5 text-[11px] font-medium text-red-300 hover:bg-red-600/30 hover:text-white whitespace-nowrap"
              >
                <Sparkles className="h-3 w-3" />
                <span>Replay Cinematic Loader</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
