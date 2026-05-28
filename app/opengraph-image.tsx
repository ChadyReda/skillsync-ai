import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "SkillSync — AI Career Platform";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          background: "#0d0d0f",
          fontFamily: "monospace",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Grid background */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
            opacity: 0.6,
          }}
        />

        {/* Glow */}
        <div
          style={{
            position: "absolute",
            top: -120,
            left: "50%",
            transform: "translateX(-50%)",
            width: 700,
            height: 400,
            background:
              "radial-gradient(ellipse at center, rgba(255,255,255,0.06) 0%, transparent 70%)",
            borderRadius: "50%",
          }}
        />

        {/* Content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "64px 80px",
            width: "100%",
            position: "relative",
          }}
        >
          {/* Top: badge + logo row */}
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 48,
                height: 48,
                border: "1px solid #28282e",
                background: "#141418",
              }}
            >
              <div
                style={{
                  width: 24,
                  height: 24,
                  background: "#f4f4f6",
                  borderRadius: 2,
                }}
              />
            </div>
            <span
              style={{
                color: "#f4f4f6",
                fontSize: 22,
                fontWeight: 700,
                letterSpacing: "0.18em",
              }}
            >
              SKILLSYNC
            </span>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginLeft: 24,
                border: "1px solid #28282e",
                background: "#141418",
                padding: "6px 14px",
              }}
            >
              <div
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "#10b981",
                }}
              />
              <span
                style={{
                  color: "#a0a0aa",
                  fontSize: 11,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                }}
              >
                AI-Powered Career Ecosystem
              </span>
            </div>
          </div>

          {/* Middle: headline */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div
              style={{
                color: "#f4f4f6",
                fontSize: 72,
                fontWeight: 800,
                lineHeight: 1.05,
                letterSpacing: "-0.02em",
              }}
            >
              Your Career,
            </div>
            <div
              style={{
                color: "#f4f4f6",
                fontSize: 72,
                fontWeight: 800,
                lineHeight: 1.05,
                letterSpacing: "-0.02em",
                opacity: 0.5,
              }}
            >
              Supercharged by AI
            </div>
            <div
              style={{
                color: "#72727c",
                fontSize: 22,
                lineHeight: 1.5,
                maxWidth: 680,
                marginTop: 8,
              }}
            >
              Connect with top recruiters, build AI-personalized roadmaps, get
              resume insights, and land your dream role.
            </div>
          </div>

          {/* Bottom: stats row */}
          <div style={{ display: "flex", gap: 0 }}>
            {[
              { value: "AI-Native", label: "Built from the ground up" },
              { value: "Realtime", label: "Live chat & notifications" },
              { value: "Role-Based", label: "Candidate & recruiter flows" },
            ].map((stat, i) => (
              <div
                key={stat.value}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                  padding: "20px 32px",
                  border: "1px solid #28282e",
                  borderRight: i < 2 ? "none" : "1px solid #28282e",
                  background: "rgba(0,0,0,0.4)",
                  minWidth: 200,
                }}
              >
                <span
                  style={{
                    color: "#52525a",
                    fontSize: 10,
                    letterSpacing: "0.22em",
                    textTransform: "uppercase",
                  }}
                >
                  0{i + 1}
                </span>
                <span
                  style={{ color: "#f4f4f6", fontSize: 20, fontWeight: 600 }}
                >
                  {stat.value}
                </span>
                <span style={{ color: "#52525a", fontSize: 12 }}>
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
