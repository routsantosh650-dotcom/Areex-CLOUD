import React, { useEffect, useRef, useState } from 'react';

const INTERACTIVE = 'button, a, input, select, textarea, [data-plan-card]';

const CURSOR_CSS = `
.areex-cursor-layer{pointer-events:none;position:fixed;inset:0;z-index:9999;contain:layout style paint}
.areex-cursor-dot,.areex-cursor-ring{position:fixed;left:0;top:0;border-radius:9999px;opacity:0;pointer-events:none;will-change:transform;transition:opacity .15s ease}
.areex-cursor-dot{width:12px;height:12px;margin:-6px 0 0 -6px;background:#ef4444;box-shadow:0 0 14px rgba(239,68,68,.95)}
.areex-cursor-ring{width:40px;height:40px;margin:-20px 0 0 -20px;border:1px solid rgba(239,68,68,.6)}
.areex-cursor-dot::after,.areex-cursor-ring::after{content:'';position:absolute;inset:-1px;border-radius:inherit;transition:transform .15s ease,background-color .15s ease,box-shadow .15s ease,border-color .15s ease}
.areex-cursor-dot.is-hover::after{background:#fff;transform:scale(1.25)}
.areex-cursor-ring.is-hover::after{transform:scale(1.5);background:rgba(220,38,38,.15);box-shadow:0 0 25px rgba(220,38,38,.45);border:1px solid #ef4444}
html.has-custom-cursor,html.has-custom-cursor *{cursor:none !important}
`;

/**
 * Smooth custom cursor: same look as before (red dot + trailing ring),
 * but driven by one requestAnimationFrame loop using transform only.
 * No React re-renders on mouse move and no CSS transitions on the moving element.
 */
export const CustomCursor: React.FC = () => {
  const dotRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    setEnabled(finePointer && navigator.webdriver !== true);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    document.documentElement.classList.add('has-custom-cursor');

    let targetX = -100;
    let targetY = -100;
    let ringX = -100;
    let ringY = -100;
    let hovered = false;
    let visible = false;
    let raf = 0;

    const render = () => {
      ringX += (targetX - ringX) * 0.22;
      ringY += (targetY - ringY) * 0.22;
      dot.style.transform = `translate3d(${targetX}px, ${targetY}px, 0)`;
      ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
      const settled = Math.abs(targetX - ringX) < 0.1 && Math.abs(targetY - ringY) < 0.1;
      raf = settled ? 0 : requestAnimationFrame(render);
    };

    const setVisible = (v: boolean) => {
      if (v === visible) return;
      visible = v;
      dot.style.opacity = v ? '1' : '0';
      ring.style.opacity = v ? '1' : '0';
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      if (!visible) {
        ringX = e.clientX;
        ringY = e.clientY;
        setVisible(true);
      }
      targetX = e.clientX;
      targetY = e.clientY;
      if (!raf) raf = requestAnimationFrame(render);
    };

    const onOver = (e: MouseEvent) => {
      const isInteractive = Boolean((e.target as HTMLElement | null)?.closest?.(INTERACTIVE));
      if (isInteractive === hovered) return;
      hovered = isInteractive;
      dot.classList.toggle('is-hover', hovered);
      ring.classList.toggle('is-hover', hovered);
    };

    const onLeave = () => setVisible(false);

    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('mouseover', onOver, { passive: true });
    document.documentElement.addEventListener('mouseleave', onLeave);

    return () => {
      cancelAnimationFrame(raf);
      document.documentElement.classList.remove('has-custom-cursor');
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('mouseover', onOver);
      document.documentElement.removeEventListener('mouseleave', onLeave);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div aria-hidden="true" className="areex-cursor-layer">
      <style>{CURSOR_CSS}</style>
      <div ref={ringRef} className="areex-cursor-ring" />
      <div ref={dotRef} className="areex-cursor-dot" />
    </div>
  );
};
