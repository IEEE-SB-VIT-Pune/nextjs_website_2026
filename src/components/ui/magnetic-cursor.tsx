"use client";

import { useEffect, useRef } from "react";

const CURSOR_SIZE = 30;
const DOT_SIZE = 7;

const lerp = (start: number, end: number, amt: number) => start + (end - start) * amt;

const MagneticCursor = () => {
  const cursorRef = useRef<HTMLDivElement | null>(null);
  const dotRef = useRef<HTMLDivElement | null>(null);
  const targetRef = useRef<HTMLElement | null>(null);
  const isOverTarget = useRef(false);
  const rafRef = useRef<number | null>(null);

  const mouse = useRef({ x: 0, y: 0 });
  const cursor = useRef({ x: 0, y: 0 });
  const dot = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      return;
    }

    const cursorEl = cursorRef.current;
    const dotEl = dotRef.current;
    if (!cursorEl || !dotEl) {
      return;
    }

    const showCursor = () => {
      cursorEl.style.opacity = "1";
      dotEl.style.opacity = "1";
    };

    const handleMove = (event: MouseEvent) => {
      mouse.current.x = event.clientX;
      mouse.current.y = event.clientY;
      showCursor();
    };

    const handleEnter = (event: Event) => {
      targetRef.current = event.currentTarget as HTMLElement;
      isOverTarget.current = true;
    };

    const handleLeave = () => {
      targetRef.current = null;
      isOverTarget.current = false;
    };

    const attachTargets = () => {
      const elements = document.querySelectorAll<HTMLElement>(
        "a, button, [data-magnetic]"
      );
      elements.forEach((el) => {
        el.addEventListener("mouseenter", handleEnter);
        el.addEventListener("mouseleave", handleLeave);
      });
      return () => {
        elements.forEach((el) => {
          el.removeEventListener("mouseenter", handleEnter);
          el.removeEventListener("mouseleave", handleLeave);
        });
      };
    };

    const detachTargets = attachTargets();

    const tick = () => {
      const target = targetRef.current;
      let targetX = mouse.current.x;
      let targetY = mouse.current.y;
      let scale = 1;
      let width = CURSOR_SIZE;
      let height = CURSOR_SIZE;

      if (isOverTarget.current && target) {
        const rect = target.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const dx = mouse.current.x - centerX;
        const dy = mouse.current.y - centerY;
        targetX = centerX + dx * 0.15;
        targetY = centerY + dy * 0.15;
        width = rect.width + 12;
        height = rect.height + 12;
        scale = 1;
      }

      cursor.current.x = lerp(cursor.current.x, targetX, 0.18);
      cursor.current.y = lerp(cursor.current.y, targetY, 0.18);
      dot.current.x = lerp(dot.current.x, mouse.current.x, 0.35);
      dot.current.y = lerp(dot.current.y, mouse.current.y, 0.35);

      cursorEl.style.width = `${width}px`;
      cursorEl.style.height = `${height}px`;
      cursorEl.style.transform = `translate3d(${cursor.current.x - width / 2}px, ${cursor.current.y - height / 2}px, 0) scale(${scale})`;
      dotEl.style.transform = `translate3d(${dot.current.x - DOT_SIZE / 2}px, ${dot.current.y - DOT_SIZE / 2}px, 0)`;

      rafRef.current = window.requestAnimationFrame(tick);
    };

    rafRef.current = window.requestAnimationFrame(tick);
    window.addEventListener("mousemove", handleMove);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      detachTargets();
      if (rafRef.current) {
        window.cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  return (
    <>
      <div id="cursor" ref={cursorRef} aria-hidden="true" />
      <div id="cursorPt" ref={dotRef} aria-hidden="true" />
    </>
  );
};

export default MagneticCursor;
