import React, { useEffect, useRef, useState } from 'react';

const INTERACTIVE =
  'button, a, input, select, textarea, [data-plan-card]';

const CURSOR_CSS = `
.areex-cursor-layer {
  pointer-events: none;
  position: fixed;
  inset: 0;
  z-index: 9999;
}

.areex-cursor-dot,
.areex-cursor-ring {
  position: fixed;
  left: 0;
  top: 0;
  pointer-events: none;
  border-radius: 9999px;
  will-change: transform;
}

.areex-cursor-dot {
  width: 12px;
  height: 12px;
  margin-left: -6px;
  margin-top: -6px;
  background: #ef4444;
  box-shadow: 0 0 14px rgba(239, 68, 68, 0.95);
}

.areex-cursor-ring {
  width: 40px;
  height: 40px;
  margin-left: -20px;
  margin-top: -20px;
  border: 1px solid rgba(239, 68, 68, 0.6);
}

.areex-cursor-dot.is-hover {
  transform: scale(1.25);
  background: #fff;
}

.areex-cursor-ring.is-hover {
  transform: scale(1.5);
  background: rgba(220, 38, 38, 0.15);
  border-color: #ef4444;
  box-shadow: 0 0 25px rgba(220, 38, 38, 0.45);
}

html.has-custom-cursor,
html.has-custom-cursor * {
  cursor: none !important;
}
`;

export const CustomCursor: React.FC = () => {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const finePointer = window.matchMedia(
      '(hover: hover) and (pointer: fine)'
    ).matches;

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
    let raf = 0;

    const render = () => {
      ringX += (targetX - ringX) * 0.22;
      ringY += (targetY - ringY) * 0.22;

      dot.style.transform =
        `translate3d(${targetX}px, ${targetY}px, 0)`;

      ring.style.transform =
        `translate3d(${ringX}px, ${ringY}px, 0)`;

      if (
        Math.abs(targetX - ringX) > 0.1 ||
        Math.abs(targetY - ringY) > 0.1
      ) {
        raf = requestAnimationFrame(render);
      } else {
        raf = 0;
      }
    };

    const onMove = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return;

      targetX = event.clientX;
      targetY = event.clientY;

      if (!raf) {
        raf = requestAnimationFrame(render);
      }
    };

    const onOver = (event: MouseEvent) => {
      const target = event.target;

      if (!(target instanceof Element)) return;

      const interactive = Boolean(
        target.closest(INTERACTIVE)
      );

      dot.classList.toggle('is-hover', interactive);
      ring.classList.toggle('is-hover', interactive);
    };

    const onLeave = () => {
      dot.style.opacity = '0';
      ring.style.opacity = '0';
    };

    const onEnter = () => {
      dot.style.opacity = '1';
      ring.style.opacity = '1';
    };

    window.addEventListener('pointermove', onMove, {
      passive: true,
    });

    document.addEventListener('mouseover', onOver, {
      passive: true,
    });

    document.documentElement.addEventListener(
      'mouseleave',
      onLeave
    );

    document.documentElement.addEventListener(
      'mouseenter',
      onEnter
    );

    return () => {
      cancelAnimationFrame(raf);

      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('mouseover', onOver);

      document.documentElement.removeEventListener(
        'mouseleave',
        onLeave
      );

      document.documentElement.removeEventListener(
        'mouseenter',
        onEnter
      );

      document.documentElement.classList.remove(
        'has-custom-cursor'
      );
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      aria-hidden="true"
      className="areex-cursor-layer"
    >
      <style>{CURSOR_CSS}</style>

      <div
        ref={ringRef}
        className="areex-cursor-ring"
      />

      <div
        ref={dotRef}
        className="areex-cursor-dot"
      />
    </div>
  );
};
