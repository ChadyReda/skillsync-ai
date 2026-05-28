"use client";

import {
  useVoiceCall,
  type CallPhase,
} from "@/components/hilo_ai/use_voice_call";
import { Phone, PhoneOff } from "lucide-react";

// ─── Phase config ────────────────────────────────────────────────────────────

const PHASE: Record<CallPhase, { label: string; color: string; spin: string }> =
  {
    idle: { label: "STANDBY", color: "#3f3f46", spin: "14s" },
    connecting: { label: "CONNECTING", color: "#a1a1aa", spin: "2s" },
    listening: { label: "LISTENING", color: "#34d399", spin: "5s" },
    processing: { label: "PROCESSING", color: "#d4d4d8", spin: "0.9s" },
    speaking: { label: "SPEAKING", color: "#ffffff", spin: "2.5s" },
    error: { label: "ERROR", color: "#f87171", spin: "20s" },
  };

// ─── Cube ────────────────────────────────────────────────────────────────────

const CUBE_SIZE = 88;
const CUBE_HALF = CUBE_SIZE / 2;

function HiloCube({ phase }: { phase: CallPhase }) {
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

  const inner: React.CSSProperties = {
    position: "absolute",
    inset: 10,
    border: `0.5px solid ${color}25`,
    transition: "border-color 0.7s ease",
  };

  return (
    <>
      <style>{`
        @keyframes hilo-cube-spin {
          from { transform: rotateX(-22deg) rotateY(0deg);   }
          to   { transform: rotateX(-22deg) rotateY(360deg); }
        }
        .hilo-cube {
          width: ${CUBE_SIZE}px;
          height: ${CUBE_SIZE}px;
          position: relative;
          transform-style: preserve-3d;
          transform: rotateX(-22deg) rotateY(0deg);
          animation: hilo-cube-spin linear infinite;
        }
      `}</style>
      <div style={{ perspective: 640 }}>
        <div className="hilo-cube" style={{ animationDuration: spin }}>
          <div style={face(`translateZ(${CUBE_HALF}px)`)}>
            <div style={inner} />
            <span
              style={{
                position: "absolute",
                bottom: 6,
                right: 6,
                width: 3,
                height: 3,
                background: `${color}60`,
                transition: "background 0.7s",
              }}
            />
          </div>
          <div style={face(`rotateY(180deg) translateZ(${CUBE_HALF}px)`)}>
            <div style={inner} />
          </div>
          <div style={face(`rotateY(-90deg) translateZ(${CUBE_HALF}px)`)} />
          <div style={face(`rotateY( 90deg) translateZ(${CUBE_HALF}px)`)} />
          <div style={face(`rotateX( 90deg) translateZ(${CUBE_HALF}px)`)} />
          <div style={face(`rotateX(-90deg) translateZ(${CUBE_HALF}px)`)} />
        </div>
      </div>
    </>
  );
}

// ─── Waveform bars ───────────────────────────────────────────────────────────

const BAR_RATIOS = [
  0.25, 0.55, 0.8, 1, 0.7, 0.45, 0.9, 0.6, 1, 0.35, 0.65, 0.85, 0.4,
];
const MAX_BAR_H = 26;

function Waveform({ active, color }: { active: boolean; color: string }) {
  return (
    <div className="flex items-end gap-[3px]" style={{ height: MAX_BAR_H }}>
      <style>{`
        @keyframes hilo-wave {
          0%, 100% { height: 3px;        }
          50%       { height: var(--mxh); }
        }
        .hilo-bar { transition: background-color 0.5s; }
      `}</style>
      {BAR_RATIOS.map((r, i) => (
        <div
          key={i}
          className="hilo-bar"
          style={
            {
              width: 2,
              height: active ? undefined : 3,
              background: active ? color : "#27272a",
              animation: active
                ? `hilo-wave ${0.48 + (i % 5) * 0.09}s ease-in-out ${i * 0.045}s infinite`
                : "none",
              "--mxh": `${Math.round(r * MAX_BAR_H)}px`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}

// ─── Corner bracket helper ───────────────────────────────────────────────────

function Corners({ color }: { color: string }) {
  return (
    <>
      {(
        [
          { cls: "top-0 left-0", bt: true, bb: false, bl: true, br: false },
          { cls: "top-0 right-0", bt: true, bb: false, bl: false, br: true },
          { cls: "bottom-0 left-0", bt: false, bb: true, bl: true, br: false },
          { cls: "bottom-0 right-0", bt: false, bb: true, bl: false, br: true },
        ] as const
      ).map(({ cls, bt, bb, bl, br }, i) => (
        <span
          key={i}
          className={`absolute ${cls} h-4 w-4`}
          style={{
            borderTop: bt ? `1px solid ${color}70` : undefined,
            borderBottom: bb ? `1px solid ${color}70` : undefined,
            borderLeft: bl ? `1px solid ${color}70` : undefined,
            borderRight: br ? `1px solid ${color}70` : undefined,
            transition: "border-color 0.7s",
          }}
        />
      ))}
    </>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function AICallPage() {
  const { phase, transcript, reply, error, history, startCall, endCall } =
    useVoiceCall();

  const { label, color } = PHASE[phase];
  const isActive = phase !== "idle" && phase !== "error";
  const waveActive = phase === "listening" || phase === "speaking";

  return (
    <div className="min-h-full bg-black font-mono text-white">
      <div className="mx-auto max-w-xl px-6 py-10 space-y-10">
        {/* ── Header ─────────────────────────────────────────────── */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-5">
          <div className="space-y-0.5">
            <p className="text-sm tracking-[0.35em] text-white">HILO</p>
            <p className="text-[10px] tracking-[0.25em] text-zinc-600">
              AI VOICE COACH
            </p>
          </div>

          {/* Status badge */}
          <div
            className="flex items-center gap-2 border px-3 py-1.5"
            style={{
              borderColor: `${color}40`,
              transition: "border-color 0.7s",
            }}
          >
            <span
              style={{
                display: "inline-block",
                width: 6,
                height: 6,
                background: color,
                boxShadow: isActive ? `0 0 6px ${color}` : "none",
                transition: "background 0.7s, box-shadow 0.7s",
              }}
            />
            <span
              className="text-[10px] tracking-[0.25em]"
              style={{ color, transition: "color 0.7s" }}
            >
              {label}
            </span>
          </div>
        </div>

        {/* ── Cube hero ──────────────────────────────────────────── */}
        <div className="flex flex-col items-center gap-7 py-4">
          {/* Framed cube */}
          <div
            className="relative flex items-center justify-center p-10"
            style={{
              border: `1px solid ${color}18`,
              transition: "border-color 0.7s",
            }}
          >
            <Corners color={color} />
            <HiloCube phase={phase} />
          </div>

          {/* Identity text */}
          <div className="text-center space-y-1.5">
            <p className="text-xl tracking-[0.55em] text-white">HILO</p>
            <p className="text-[10px] tracking-[0.3em] text-zinc-700">
              VOICE COACHING ENGINE · 001
            </p>
          </div>

          {/* Waveform */}
          <Waveform active={waveActive} color={color} />
        </div>

        {/* ── Live text ──────────────────────────────────────────── */}
        {(transcript || reply) && (
          <div className="border border-zinc-800 divide-y divide-zinc-800">
            {transcript && (
              <div className="px-5 py-4">
                <p className="text-[10px] tracking-[0.3em] text-zinc-600 mb-2">
                  YOU
                </p>
                <p className="text-sm text-zinc-300 leading-relaxed">
                  &ldquo;{transcript}&rdquo;
                </p>
              </div>
            )}
            {reply && (
              <div
                className="px-5 py-4"
                style={{ borderLeft: `2px solid ${color}` }}
              >
                <p
                  className="text-[10px] tracking-[0.3em] mb-2"
                  style={{ color }}
                >
                  HILO
                </p>
                <p className="text-sm text-white leading-relaxed">{reply}</p>
              </div>
            )}
          </div>
        )}

        {/* ── Error ──────────────────────────────────────────────── */}
        {error && (
          <div className="border border-red-900/40 px-5 py-4">
            <p className="text-[10px] tracking-[0.3em] text-red-600 mb-1.5">
              ERROR
            </p>
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* ── Conversation log ───────────────────────────────────── */}
        {history.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] tracking-[0.3em] text-zinc-600">
                CONVERSATION LOG
              </span>
              <span className="border border-zinc-800 px-2 py-0.5 text-[10px] text-zinc-600">
                {history.length}
              </span>
            </div>

            <div className="border border-zinc-800 divide-y divide-zinc-900 max-h-56 overflow-y-auto">
              {[...history].reverse().map((m, i) => (
                <div
                  key={i}
                  className="flex gap-4 px-5 py-3"
                  style={{
                    borderLeft:
                      m.role === "assistant"
                        ? `2px solid ${color}55`
                        : "2px solid transparent",
                  }}
                >
                  <span
                    className="text-[10px] tracking-[0.2em] shrink-0 pt-0.5 w-7"
                    style={{
                      color: m.role === "assistant" ? color : "#52525b",
                      transition: "color 0.7s",
                    }}
                  >
                    {m.role === "assistant" ? "AI" : "YOU"}
                  </span>
                  <p className="text-xs text-zinc-500 leading-relaxed">
                    {m.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Call control ───────────────────────────────────────── */}
        <div className="flex flex-col items-center gap-3 pt-2">
          {phase === "idle" || phase === "error" ? (
            <button
              onClick={startCall}
              className="flex w-full max-w-xs items-center justify-center gap-3 border border-white bg-white px-10 py-4 text-[11px] tracking-[0.3em] uppercase text-black transition-colors hover:bg-zinc-100"
            >
              <Phone className="h-3.5 w-3.5" />
              Start Call
            </button>
          ) : (
            <button
              onClick={endCall}
              className="flex w-full max-w-xs items-center justify-center gap-3 border border-zinc-800 px-10 py-4 text-[11px] tracking-[0.3em] uppercase text-zinc-500 transition-colors hover:border-red-900 hover:text-red-500"
            >
              <PhoneOff className="h-3.5 w-3.5" />
              End Call
            </button>
          )}

          {isActive && (
            <p className="text-[10px] tracking-[0.35em] text-zinc-700">
              {label}...
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
