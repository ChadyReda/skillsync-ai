"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, PhoneOff } from "lucide-react";
import { useVoiceCall, type CallPhase } from "./use_voice_call";

// ─── Phase config ─────────────────────────────────────────────────────────────

const PHASE: Record<CallPhase, { label: string; color: string; spin: string }> = {
  idle:       { label: "STANDBY",    color: "#3f3f46", spin: "14s"  },
  connecting: { label: "CONNECTING", color: "#a1a1aa", spin: "2s"   },
  listening:  { label: "LISTENING",  color: "#34d399", spin: "5s"   },
  processing: { label: "PROCESSING", color: "#d4d4d8", spin: "0.9s" },
  speaking:   { label: "SPEAKING",   color: "#ffffff", spin: "2.5s" },
  error:      { label: "ERROR",      color: "#f87171", spin: "20s"  },
};

// ─── Mini 3D cube ─────────────────────────────────────────────────────────────

const CUBE_SIZE = 56;
const CUBE_HALF = CUBE_SIZE / 2;

function MiniCube({ phase }: { phase: CallPhase }) {
  const { color, spin } = PHASE[phase];

  const face = (t: string): React.CSSProperties => ({
    position: "absolute",
    width: CUBE_SIZE,
    height: CUBE_SIZE,
    transform: t,
    border: `1px solid ${color}`,
    background: "#09090b",
    transition: "border-color 0.7s ease",
  });

  return (
    <>
      <style>{`
        @keyframes hilo-modal-cube-spin {
          from { transform: rotateX(-22deg) rotateY(0deg); }
          to   { transform: rotateX(-22deg) rotateY(360deg); }
        }
        .hilo-modal-cube {
          width: ${CUBE_SIZE}px;
          height: ${CUBE_SIZE}px;
          position: relative;
          transform-style: preserve-3d;
          animation: hilo-modal-cube-spin linear infinite;
        }
      `}</style>
      <div style={{ perspective: 400 }}>
        <div className="hilo-modal-cube" style={{ animationDuration: spin }}>
          <div style={face(`translateZ(${CUBE_HALF}px)`)}>
            <div style={{ position: "absolute", inset: 6, border: `0.5px solid ${color}25`, transition: "border-color 0.7s" }} />
            <span style={{ position: "absolute", bottom: 4, right: 4, width: 2, height: 2, background: `${color}60`, transition: "background 0.7s" }} />
          </div>
          <div style={face(`rotateY(180deg) translateZ(${CUBE_HALF}px)`)} />
          <div style={face(`rotateY(-90deg) translateZ(${CUBE_HALF}px)`)} />
          <div style={face(`rotateY( 90deg) translateZ(${CUBE_HALF}px)`)} />
          <div style={face(`rotateX( 90deg) translateZ(${CUBE_HALF}px)`)} />
          <div style={face(`rotateX(-90deg) translateZ(${CUBE_HALF}px)`)} />
        </div>
      </div>
    </>
  );
}

// ─── Waveform bars ────────────────────────────────────────────────────────────

const BAR_RATIOS = [0.25, 0.55, 0.8, 1, 0.7, 0.45, 0.9, 0.6, 1, 0.35, 0.65, 0.85, 0.4];
const MAX_BAR_H = 20;

function Waveform({ active, color }: { active: boolean; color: string }) {
  return (
    <div className="flex items-end gap-[2px]" style={{ height: MAX_BAR_H }}>
      <style>{`
        @keyframes hilo-modal-wave {
          0%, 100% { height: 2px; }
          50%       { height: var(--mxh); }
        }
        .hilo-modal-bar { transition: background-color 0.5s; }
      `}</style>
      {BAR_RATIOS.map((r, i) => (
        <div
          key={i}
          className="hilo-modal-bar"
          style={
            {
              width: 2,
              height: active ? undefined : 2,
              background: active ? color : "#27272a",
              animation: active
                ? `hilo-modal-wave ${0.48 + (i % 5) * 0.09}s ease-in-out ${i * 0.045}s infinite`
                : "none",
              "--mxh": `${Math.round(r * MAX_BAR_H)}px`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}

// ─── Corner brackets ──────────────────────────────────────────────────────────

function Corners({ color }: { color: string }) {
  const corners = [
    { cls: "top-0 left-0",     bt: true,  bb: false, bl: true,  br: false },
    { cls: "top-0 right-0",    bt: true,  bb: false, bl: false, br: true  },
    { cls: "bottom-0 left-0",  bt: false, bb: true,  bl: true,  br: false },
    { cls: "bottom-0 right-0", bt: false, bb: true,  bl: false, br: true  },
  ];
  return (
    <>
      {corners.map(({ cls, bt, bb, bl, br }, i) => (
        <span
          key={i}
          className={`absolute ${cls} h-4 w-4`}
          style={{
            borderTop:    bt ? `1px solid ${color}60` : undefined,
            borderBottom: bb ? `1px solid ${color}60` : undefined,
            borderLeft:   bl ? `1px solid ${color}60` : undefined,
            borderRight:  br ? `1px solid ${color}60` : undefined,
            transition: "border-color 0.7s",
          }}
        />
      ))}
    </>
  );
}

// ─── Clamped text row ─────────────────────────────────────────────────────────

function TextRow({
  label,
  text,
  color,
  accent = false,
  cursor = false,
  dim = false,
}: {
  label: string;
  text: string;
  color: string;
  accent?: boolean;
  cursor?: boolean;
  dim?: boolean;
}) {
  return (
    <div
      className="flex items-start gap-3 py-3"
      style={accent ? { borderLeft: `1.5px solid ${color}50`, paddingLeft: 12 } : { paddingLeft: 0 }}
    >
      <span
        className="shrink-0 pt-px text-[8px] tracking-[0.25em]"
        style={{ color: dim ? "#3f3f46" : accent ? color : "#52525b", transition: "color 0.7s", minWidth: 28 }}
      >
        {label}
      </span>

      {/* Fade mask on overflow — gradient cuts off long text gracefully */}
      <div className="relative min-w-0 flex-1" style={{ maxHeight: 38, overflow: "hidden" }}>
        <p
          className="text-[11px] leading-[1.55]"
          style={{ color: dim ? "#3f3f46" : accent ? "#e4e4e7" : "#71717a", transition: "color 0.7s" }}
        >
          {text}
          {cursor && (
            <motion.span
              className="ml-0.5 inline-block h-2.5 w-0.5 align-middle"
              style={{ background: color }}
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.5, repeat: Infinity }}
            />
          )}
        </p>
        {/* Bottom fade — hides runaway text softly */}
        <div
          className="pointer-events-none absolute bottom-0 left-0 right-0 h-4"
          style={{ background: "linear-gradient(to bottom, transparent, #09090b)" }}
        />
      </div>
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────

interface Props {
  open: boolean;
  onClose: () => void;
}

export function CallModal({ open, onClose }: Props) {
  const { phase, transcript, reply, error, history, startCall, endCall } = useVoiceCall();

  useEffect(() => {
    if (open) startCall();
    else endCall();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleClose = () => { endCall(); onClose(); };

  const { label, color } = PHASE[phase];
  const isActive = phase !== "idle" && phase !== "error";
  const waveActive = phase === "listening" || phase === "speaking";

  // Last known user/AI texts — prefer live over history
  const lastUser = transcript || [...history].reverse().find(m => m.role === "user")?.content;
  const lastAI   = reply     || [...history].reverse().find(m => m.role === "assistant")?.content;
  const exchanges = Math.ceil(history.length / 2);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="bd"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Panel */}
          <motion.div
            key="panel"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 40 }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
            className="fixed right-6 top-1/2 z-50 flex w-[340px] -translate-y-1/2 flex-col overflow-hidden border border-zinc-800 bg-[#09090b] font-mono"
          >
            <Corners color={color} />

            {/* ── Header ─────────────────────────────────────────────── */}
            <div className="flex shrink-0 items-center justify-between border-b border-zinc-900 px-5 py-4">
              <div className="space-y-0.5">
                <p className="text-[11px] tracking-[0.35em] text-white">HILO</p>
                <p className="text-[9px] tracking-[0.25em] text-zinc-700">AI VOICE COACH</p>
              </div>

              <div className="flex items-center gap-3">
                <div
                  className="flex items-center gap-2 border px-2.5 py-1"
                  style={{ borderColor: `${color}40`, transition: "border-color 0.7s" }}
                >
                  <span
                    style={{
                      display: "inline-block", width: 5, height: 5,
                      background: color,
                      boxShadow: isActive ? `0 0 5px ${color}` : "none",
                      transition: "background 0.7s, box-shadow 0.7s",
                    }}
                  />
                  <span className="text-[9px] tracking-[0.2em]" style={{ color, transition: "color 0.7s" }}>
                    {label}
                  </span>
                </div>

                <button
                  onClick={handleClose}
                  className="flex h-6 w-6 items-center justify-center border border-zinc-800 text-zinc-600 transition-colors hover:border-zinc-600 hover:text-white"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            </div>

            {/* ── Cube + waveform ─────────────────────────────────────── */}
            <div className="flex shrink-0 flex-col items-center gap-4 py-7">
              <div
                className="relative flex items-center justify-center p-6"
                style={{ border: `1px solid ${color}18`, transition: "border-color 0.7s" }}
              >
                <Corners color={color} />
                <MiniCube phase={phase} />
              </div>
              <Waveform active={waveActive} color={color} />
            </div>

            {/* ── Last exchange — compact, never scrolls ──────────────── */}
            <div className="mx-5 shrink-0 divide-y divide-zinc-900 border-t border-zinc-900">
              {lastUser ? (
                <TextRow label="YOU" text={lastUser} color={color} dim={!!lastAI} />
              ) : phase === "listening" ? (
                <div className="flex items-center gap-3 py-3">
                  <span className="text-[8px] tracking-[0.25em] text-zinc-700" style={{ minWidth: 28 }}>YOU</span>
                  <motion.span
                    className="text-[11px] text-zinc-700"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.8, repeat: Infinity }}
                  >
                    listening...
                  </motion.span>
                </div>
              ) : null}

              {lastAI && (
                <TextRow
                  label="AI"
                  text={lastAI}
                  color={color}
                  accent
                  cursor={phase === "speaking"}
                />
              )}

              {/* Exchange counter — only shows after first turn */}
              {exchanges > 0 && (
                <div className="flex justify-end py-2">
                  <span className="text-[8px] tracking-[0.2em] text-zinc-800">
                    {exchanges} {exchanges === 1 ? "EXCHANGE" : "EXCHANGES"}
                  </span>
                </div>
              )}
            </div>

            {/* ── Error ──────────────────────────────────────────────── */}
            {error && (
              <div className="mx-5 mt-2 shrink-0 border-l-2 border-red-900 pl-3 py-2">
                <p className="text-[9px] tracking-[0.25em] text-red-700 mb-0.5">ERROR</p>
                <p className="text-[11px] text-red-500 line-clamp-2">{error}</p>
              </div>
            )}

            {/* ── Footer ─────────────────────────────────────────────── */}
            <div className="shrink-0 border-t border-zinc-900 px-5 py-4">
              <button
                onClick={handleClose}
                className="flex w-full items-center justify-center gap-2.5 border border-zinc-800 py-3 text-[10px] uppercase tracking-[0.3em] text-zinc-500 transition-colors hover:border-red-900/60 hover:text-red-500"
              >
                <PhoneOff className="h-3.5 w-3.5" />
                End Call
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
