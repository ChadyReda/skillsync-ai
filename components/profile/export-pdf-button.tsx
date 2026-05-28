"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";

export interface RoadmapEntry {
  title: string;
  completed: number;
  total: number;
}

export interface GitHubSummary {
  username: string;
  publicRepos: number;
  totalStars: number;
  followers: number;
  developerScore: number;
  topLanguages: { name: string; percentage: number }[];
  activityLevel: string;
}

export interface GitHubInsightsSummary {
  overallProfile: string;
  strengths: string[];
  expertise: string[];
  careerPaths: string[];
}

export interface ProfilePdfData {
  fullName: string | null;
  email: string;
  bio: string | null;
  level: number | null;
  xp: number | null;
  resumeScore: number | null;
  skills: string[];
  strengths: string[];
  improvements: string[];
  roadmaps: RoadmapEntry[];
  github: GitHubSummary | null;
  githubInsights: GitHubInsightsSummary | null;
}

interface Props {
  data: ProfilePdfData;
}

export default function ExportPdfButton({ data }: Props) {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);

    try {
      const { default: jsPDF } = await import("jspdf");

      const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
      const W = pdf.internal.pageSize.getWidth();   // 595
      const H = pdf.internal.pageSize.getHeight();  // 841
      const ML = 48;   // margin left
      const MR = W - 48; // margin right
      const contentW = MR - ML;

      let y = 0;

      // ── colour palette ──────────────────────────────────────────────────────
      const C = {
        bg:        [15,  15,  17]  as [number, number, number],
        surface:   [24,  24,  27]  as [number, number, number],
        border:    [39,  39,  42]  as [number, number, number],
        white:     [255, 255, 255] as [number, number, number],
        muted:     [161, 161, 170] as [number, number, number],
        dim:       [113, 113, 122] as [number, number, number],
        indigo:    [99,  102, 241] as [number, number, number],
        indigoBg:  [30,  27,  75]  as [number, number, number],
        emerald:   [52,  211, 153] as [number, number, number],
        emeraldBg: [6,   78,  59]  as [number, number, number],
        amber:     [251, 191, 36]  as [number, number, number],
        amberBg:   [120, 53,  15]  as [number, number, number],
        violet:    [167, 139, 250] as [number, number, number],
        sky:       [56,  189, 248] as [number, number, number],
        orange:    [251, 146, 60]  as [number, number, number],
      };

      // ── helpers ─────────────────────────────────────────────────────────────

      const fill = (r: [number,number,number]) =>
        pdf.setFillColor(r[0], r[1], r[2]);
      const stroke = (r: [number,number,number]) =>
        pdf.setDrawColor(r[0], r[1], r[2]);
      const color = (r: [number,number,number]) =>
        pdf.setTextColor(r[0], r[1], r[2]);

      const ensurePage = (needed: number) => {
        if (y + needed > H - 40) {
          pdf.addPage();
          // re-draw background on new page
          fill(C.bg);
          pdf.rect(0, 0, W, H, "F");
          y = 40;
        }
      };

      // section header (label + subtle rule)
      const sectionHeader = (label: string, accent: [number,number,number]) => {
        ensurePage(28);
        color(accent);
        pdf.setFontSize(8);
        pdf.setFont("helvetica", "bold");
        pdf.text(label.toUpperCase(), ML, y);
        stroke(C.border);
        pdf.setLineWidth(0.5);
        const labelW = pdf.getTextWidth(label.toUpperCase()) + 8;
        pdf.line(ML + labelW, y - 3, MR, y - 3);
        y += 14;
      };

      // pill / badge
      const pill = (
        text: string,
        x: number,
        py: number,
        bg: [number,number,number],
        fg: [number,number,number],
      ): number => {
        const pad = 8;
        pdf.setFontSize(8);
        pdf.setFont("helvetica", "normal");
        const tw = pdf.getTextWidth(text);
        const pw = tw + pad * 2;
        const ph = 14;
        fill(bg);
        stroke(bg);
        pdf.roundedRect(x, py - 10, pw, ph, 4, 4, "F");
        color(fg);
        pdf.text(text, x + pad, py);
        return pw + 6;
      };

      // bullet row
      const bullet = (
        text: string,
        bulletColor: [number,number,number],
        indent = ML,
      ) => {
        const lines = pdf.splitTextToSize(text, contentW - 20) as string[];
        ensurePage(lines.length * 13 + 4);
        fill(bulletColor);
        pdf.circle(indent + 3, y - 3, 2, "F");
        color(C.muted);
        pdf.setFontSize(9);
        pdf.setFont("helvetica", "normal");
        pdf.text(lines, indent + 12, y);
        y += lines.length * 13 + 2;
      };

      // horizontal rule
      const rule = () => {
        stroke(C.border);
        pdf.setLineWidth(0.4);
        pdf.line(ML, y, MR, y);
        y += 10;
      };

      // ── Page background ──────────────────────────────────────────────────────
      fill(C.bg);
      pdf.rect(0, 0, W, H, "F");

      // ── HERO BLOCK ───────────────────────────────────────────────────────────
      y = 0;
      // accent bar top
      fill(C.indigo);
      pdf.rect(0, 0, W, 4, "F");
      y = 36;

      // Name
      color(C.white);
      pdf.setFontSize(26);
      pdf.setFont("helvetica", "bold");
      pdf.text(data.fullName ?? "Candidate", ML, y);
      y += 6;

      // Thin underline in indigo
      fill(C.indigo);
      pdf.rect(ML, y, 40, 2, "F");
      y += 10;

      // Bio
      if (data.bio) {
        const bioLines = pdf.splitTextToSize(data.bio, contentW) as string[];
        color(C.muted);
        pdf.setFontSize(10);
        pdf.setFont("helvetica", "normal");
        pdf.text(bioLines, ML, y);
        y += bioLines.length * 14 + 4;
      }

      // Stats pills row
      y += 4;
      let px = ML;
      if (data.level !== null) {
        px += pill(`Level ${data.level}`, px, y, C.indigoBg, C.indigo);
      }
      if (data.xp !== null) {
        px += pill(`${data.xp} XP`, px, y, C.surface, C.muted);
      }
      if (data.resumeScore !== null) {
        const scoreColor = data.resumeScore >= 80 ? C.emerald : data.resumeScore >= 60 ? C.amber : [248, 113, 113] as [number,number,number];
        const scoreBg   = data.resumeScore >= 80 ? C.emeraldBg : data.resumeScore >= 60 ? C.amberBg : [127, 29, 29] as [number,number,number];
        px += pill(`Resume ${data.resumeScore}/100`, px, y, scoreBg, scoreColor);
      }
      y += 20;

      rule();

      // ── SKILLS ───────────────────────────────────────────────────────────────
      if (data.skills.length > 0) {
        sectionHeader("Skills", C.violet);
        let sx = ML;
        let rowY = y;
        for (const skill of data.skills) {
          pdf.setFontSize(8);
          const sw = pdf.getTextWidth(skill) + 16;
          if (sx + sw > MR) {
            sx = ML;
            rowY += 18;
            ensurePage(18);
          }
          fill(C.surface);
          stroke(C.border);
          pdf.setLineWidth(0.4);
          pdf.roundedRect(sx, rowY - 10, sw, 14, 3, 3, "FD");
          color(C.muted);
          pdf.text(skill, sx + 8, rowY);
          sx += sw + 6;
        }
        y = rowY + 20;
        rule();
      }

      // ── RESUME INSIGHTS ──────────────────────────────────────────────────────
      if (data.strengths.length > 0 || data.improvements.length > 0) {
        const colW = (contentW - 12) / 2;

        // Strengths
        if (data.strengths.length > 0) {
          ensurePage(24);
          sectionHeader("Strengths", C.emerald);
          for (const s of data.strengths) bullet(s, C.emerald);
          y += 6;
        }

        // Improvements
        if (data.improvements.length > 0) {
          ensurePage(24);
          sectionHeader("Growth Areas", C.amber);
          for (const imp of data.improvements) bullet(imp, C.amber);
          y += 6;
        }
        rule();
      }

      // ── ROADMAPS ─────────────────────────────────────────────────────────────
      if (data.roadmaps.length > 0) {
        sectionHeader("Learning Roadmaps", C.emerald);
        for (const rm of data.roadmaps) {
          ensurePage(32);
          const pct = rm.total > 0 ? Math.round((rm.completed / rm.total) * 100) : 0;
          const isComplete = pct === 100 && rm.total > 0;

          color(C.white);
          pdf.setFontSize(9.5);
          pdf.setFont("helvetica", "bold");
          pdf.text(rm.title, ML, y);

          const pctLabel = `${pct}%`;
          color(isComplete ? C.emerald : C.dim);
          pdf.setFontSize(8);
          pdf.setFont("helvetica", "normal");
          pdf.text(pctLabel, MR - pdf.getTextWidth(pctLabel), y);
          y += 8;

          // progress bar track
          fill(C.surface);
          stroke(C.surface);
          pdf.roundedRect(ML, y, contentW, 5, 2, 2, "F");
          // filled portion
          const barW = (pct / 100) * contentW;
          if (barW > 0) {
            fill(isComplete ? C.emerald : C.indigo);
            pdf.roundedRect(ML, y, barW, 5, 2, 2, "F");
          }
          y += 14;
        }
        y += 2;
        rule();
      }

      // ── GITHUB ANALYTICS ─────────────────────────────────────────────────────
      if (data.github) {
        const gh = data.github;
        sectionHeader("GitHub Analytics", C.sky);

        // Stats row
        const statItems = [
          { label: "Repositories", value: String(gh.publicRepos) },
          { label: "Total Stars",  value: String(gh.totalStars) },
          { label: "Followers",    value: String(gh.followers) },
          { label: "Dev Score",    value: `${gh.developerScore}/100` },
        ];

        ensurePage(50);
        const boxW = contentW / 4;
        for (let i = 0; i < statItems.length; i++) {
          const bx = ML + i * boxW;
          fill(C.surface);
          stroke(C.border);
          pdf.setLineWidth(0.4);
          pdf.roundedRect(bx, y - 6, boxW - 6, 34, 4, 4, "FD");

          color(C.white);
          pdf.setFontSize(14);
          pdf.setFont("helvetica", "bold");
          const vw = pdf.getTextWidth(statItems[i].value);
          pdf.text(statItems[i].value, bx + (boxW - 6) / 2 - vw / 2, y + 12);

          color(C.dim);
          pdf.setFontSize(7);
          pdf.setFont("helvetica", "normal");
          const lw = pdf.getTextWidth(statItems[i].label);
          pdf.text(statItems[i].label, bx + (boxW - 6) / 2 - lw / 2, y + 22);
        }
        y += 44;

        // Activity level
        ensurePage(20);
        color(C.dim);
        pdf.setFontSize(8.5);
        pdf.setFont("helvetica", "normal");
        pdf.text(`Activity: `, ML, y);
        color(C.sky);
        pdf.setFont("helvetica", "bold");
        pdf.text(gh.activityLevel.replace("_", " "), ML + pdf.getTextWidth("Activity: "), y);
        y += 14;

        // Top languages
        if (gh.topLanguages.length > 0) {
          ensurePage(20);
          color(C.dim);
          pdf.setFontSize(8);
          pdf.setFont("helvetica", "normal");
          const langs = gh.topLanguages.map((l) => `${l.name} ${l.percentage}%`).join("  ·  ");
          pdf.text(langs, ML, y);
          y += 14;
        }

        y += 4;
        rule();
      }

      // ── AI ENGINEERING INSIGHTS ───────────────────────────────────────────────
      if (data.githubInsights) {
        const gi = data.githubInsights;
        sectionHeader("AI Engineering Insights", C.indigo);

        if (gi.overallProfile) {
          ensurePage(30);
          const lines = pdf.splitTextToSize(gi.overallProfile, contentW) as string[];
          color(C.muted);
          pdf.setFontSize(9.5);
          pdf.setFont("helvetica", "italic");
          pdf.text(lines, ML, y);
          y += lines.length * 13 + 8;
        }

        if (gi.strengths.length > 0) {
          ensurePage(20);
          color(C.indigo);
          pdf.setFontSize(8);
          pdf.setFont("helvetica", "bold");
          pdf.text("ENGINEERING STRENGTHS", ML, y);
          y += 10;
          for (const s of gi.strengths) bullet(s, C.indigo);
          y += 4;
        }

        if (gi.expertise.length > 0) {
          ensurePage(20);
          color(C.violet);
          pdf.setFontSize(8);
          pdf.setFont("helvetica", "bold");
          pdf.text("EXPERTISE", ML, y);
          y += 10;
          let ex = ML;
          for (const e of gi.expertise) {
            pdf.setFontSize(8);
            const ew = pdf.getTextWidth(e) + 16;
            if (ex + ew > MR) { ex = ML; y += 18; ensurePage(18); }
            fill(C.indigoBg);
            stroke(C.indigo);
            pdf.setLineWidth(0.3);
            pdf.roundedRect(ex, y - 10, ew, 14, 3, 3, "FD");
            color(C.indigo);
            pdf.text(e, ex + 8, y);
            ex += ew + 6;
          }
          y += 20;
        }

        if (gi.careerPaths.length > 0) {
          ensurePage(20);
          color(C.emerald);
          pdf.setFontSize(8);
          pdf.setFont("helvetica", "bold");
          pdf.text("CAREER PATH FIT", ML, y);
          y += 10;
          for (const c of gi.careerPaths) bullet(c, C.emerald);
          y += 4;
        }

        rule();
      }

      // ── FOOTER ───────────────────────────────────────────────────────────────
      const totalPages: number = (pdf.internal as any).getNumberOfPages();
      for (let p = 1; p <= totalPages; p++) {
        pdf.setPage(p);
        color(C.dim);
        pdf.setFontSize(7.5);
        pdf.setFont("helvetica", "normal");
        pdf.text(
          `Generated by SkillSync  ·  ${new Date().toLocaleDateString()}`,
          ML,
          H - 20,
        );
        pdf.text(`${p} / ${totalPages}`, MR - 20, H - 20);
      }

      const fileName = data.fullName
        ? `${data.fullName.replace(/\s+/g, "_")}_SkillSync.pdf`
        : "candidate_SkillSync.pdf";

      pdf.save(fileName);
    } catch (err) {
      console.error("PDF export failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={loading}
      data-pdf-exclude
      className="inline-flex items-center gap-2 border border-zinc-700 bg-black px-4 py-2.5 text-sm font-medium text-zinc-300 transition-colors hover:border-zinc-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
    >
      {loading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : (
        <Download className="w-3.5 h-3.5" />
      )}
      {loading ? "Exporting..." : "Export PDF"}
    </button>
  );
}
