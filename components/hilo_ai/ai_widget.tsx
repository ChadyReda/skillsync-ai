"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { motion, AnimatePresence, useMotionValue, animate } from "framer-motion";
import { Mic } from "lucide-react";
import { CallModal } from "./call_modal";

// Approximate rendered size of the widget (button + label)
const WIDGET_W = 56;
const WIDGET_H = 74;
const MARGIN = 24;

export function AiWidget() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const hasDragged = useRef(false);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Initialize at right edge, vertically centred — runs client-side only
  useEffect(() => {
    x.set(window.innerWidth - WIDGET_W - MARGIN);
    y.set(window.innerHeight / 2 - WIDGET_H / 2);
    setMounted(true);
  }, [x, y]);

  // On release, spring-snap the widget to the nearest viewport edge
  const snapToEdge = useCallback(() => {
    const W = window.innerWidth;
    const H = window.innerHeight;
    const cx = x.get();
    const cy = y.get();

    const dLeft   = cx - MARGIN;
    const dRight  = W - WIDGET_W - MARGIN - cx;
    const dTop    = cy - MARGIN;
    const dBottom = H - WIDGET_H - MARGIN - cy;

    const min = Math.min(dLeft, dRight, dTop, dBottom);
    const spring = { type: "spring" as const, stiffness: 600, damping: 38 };

    if (min === dLeft)       animate(x, MARGIN, spring);
    else if (min === dRight) animate(x, W - WIDGET_W - MARGIN, spring);
    else if (min === dTop)   animate(y, MARGIN, spring);
    else                     animate(y, H - WIDGET_H - MARGIN, spring);
  }, [x, y]);

  // Don't render during SSR — position depends on viewport
  if (!mounted) return null;

  return (
    <>
      <CallModal open={open} onClose={() => setOpen(false)} />

      <AnimatePresence>
        {!open && (
          <motion.button
            key="widget"
            // Position entirely via motion values from (0, 0)
            style={{ x, y, position: "fixed", left: 0, top: 0, zIndex: 40 }}
            drag
            dragMomentum={false}
            dragElastic={0}
            dragConstraints={{
              left:   MARGIN,
              top:    MARGIN,
              right:  window.innerWidth  - WIDGET_W - MARGIN,
              bottom: window.innerHeight - WIDGET_H - MARGIN,
            }}
            onDragStart={() => { hasDragged.current = false; }}
            onDrag={() => { hasDragged.current = true; }}
            onDragEnd={snapToEdge}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => {
              if (!hasDragged.current) setOpen(true);
              hasDragged.current = false;
            }}
            className="cursor-grab font-mono active:cursor-grabbing"
            aria-label="Open Hilo AI voice assistant"
          >
            <div className="relative flex h-14 w-14 items-center justify-center border border-zinc-700 bg-black transition-colors hover:border-zinc-500">
              {/* Corner brackets */}
              <span className="absolute left-0 top-0 h-3 w-3 border-l border-t border-white/25" />
              <span className="absolute right-0 top-0 h-3 w-3 border-r border-t border-white/25" />
              <span className="absolute bottom-0 left-0 h-3 w-3 border-b border-l border-white/25" />
              <span className="absolute bottom-0 right-0 h-3 w-3 border-b border-r border-white/25" />

              <Mic className="h-5 w-5 text-white" />

              {/* Live status dot */}
              <span className="absolute -right-1 -top-1 flex h-3 w-3 items-center justify-center">
                <span className="absolute inline-flex h-full w-full animate-ping bg-emerald-400 opacity-50" />
                <span className="relative inline-flex h-2 w-2 bg-emerald-500" />
              </span>
            </div>

            <p className="mt-1.5 text-center text-[8px] uppercase tracking-[0.3em] text-zinc-600">
              HILO
            </p>
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}
