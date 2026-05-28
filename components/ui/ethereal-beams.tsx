"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";

interface EtherealBeamsProps {
  className?: string;
  density?: number;
  angle?: number;
}

interface BeamDef {
  left: number;
  width: number;
  delay: number;
  duration: number;
  opacity: number;
}

export function EtherealBeams({
  className,
  density = 14,
  angle = 18,
}: EtherealBeamsProps) {
  const beams = useMemo<BeamDef[]>(() => {
    const out: BeamDef[] = [];
    for (let i = 0; i < density; i++) {
      const t = i / Math.max(1, density - 1);
      out.push({
        left: -10 + t * 120 + (i % 2 === 0 ? 2 : -2),
        width: 0.6 + ((i * 37) % 5) / 4,
        delay: -((i * 1.37) % 14),
        duration: 9 + ((i * 13) % 7),
        opacity: 0.08 + ((i * 17) % 9) / 100,
      });
    }
    return out;
  }, [density]);

  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden bg-black",
        className,
      )}
      style={{ ["--beam-angle" as string]: `${angle}deg` }}
    >
      <div
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.6) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          animation: "grid-pan 24s linear infinite",
          maskImage:
            "radial-gradient(ellipse at center, black 30%, transparent 75%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at center, black 30%, transparent 75%)",
        }}
      />

      <div className="absolute inset-0">
        {beams.map((b, i) => (
          <span
            key={i}
            className="absolute top-[-20%] h-[140%]"
            style={{
              left: `${b.left}%`,
              width: `${b.width}%`,
              background:
                "linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.55) 35%, rgba(255,255,255,0.85) 50%, rgba(255,255,255,0.55) 65%, transparent 100%)",
              filter: "blur(8px)",
              opacity: b.opacity,
              transform: `rotate(${angle}deg)`,
              animation: `beam-drift ${b.duration}s ease-in-out ${b.delay}s infinite`,
              transformOrigin: "center",
            }}
          />
        ))}
      </div>

      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 30%, rgba(255,255,255,0.10), transparent 60%)",
        }}
      />

      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black via-black/70 to-transparent" />
      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/80 to-transparent" />
    </div>
  );
}
