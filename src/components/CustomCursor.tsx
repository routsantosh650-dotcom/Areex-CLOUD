import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

export const CustomCursor: React.FC = () => {
  const dotRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);
  const [hovered, setHovered] = useState(false);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const isWebdriver = navigator.webdriver === true;
    if (isTouch || isWebdriver) {
      setEnabled(false);
      return;
    }
    setEnabled(true);
  }, []);

  useEffect(() => {
    if (!enabled || !dotRef.current || !ringRef.current) return;

    const xDot = gsap.quickTo(dotRef.current, 'x', { duration: 0.06, ease: 'power3.out' });
    const yDot = gsap.quickTo(dotRef.current, 'y', { duration: 0.06, ease: 'power3.out' });
    const xRing = gsap.quickTo(ringRef.current, 'x', { duration: 0.22, ease: 'power3.out' });
    const yRing = gsap.quickTo(ringRef.current, 'y', { duration: 0.22, ease: 'power3.out' });

    const handleMove = (e: MouseEvent) => {
      xDot(e.clientX);
      yDot(e.clientY);
      xRing(e.clientX);
      yRing(e.clientY);

      const target = e.target as HTMLElement | null;
      const isInteractive = Boolean(
        target?.closest('button, a, input, select, textarea, [data-plan-card]')
      );
      setHovered(isInteractive);
    };

    window.addEventListener('mousemove', handleMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMove);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden">
      {/* Precision Inner Crimson Core */}
      <div
        ref={dotRef}
        className={`fixed left-0 top-0 -ml-1.5 -mt-1.5 h-3 w-3 rounded-full bg-red-500 shadow-[0_0_14px_rgba(239,68,68,0.95)] transition-transform duration-150 ${
          hovered ? 'scale-125 bg-white' : 'scale-100'
        }`}
      />
      {/* Fluid Trailing Crimson Ring */}
      <div
        ref={ringRef}
        className={`fixed left-0 top-0 -ml-5 -mt-5 h-10 w-10 rounded-full border transition-all duration-150 ${
          hovered
            ? 'scale-150 border-red-500 bg-red-600/15 shadow-[0_0_25px_rgba(220,38,38,0.45)]'
            : 'scale-100 border-red-500/60 bg-transparent'
        }`}
      />
    </div>
  );
};
