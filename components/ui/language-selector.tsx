"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Globe } from "lucide-react";

import { useTranslation } from "@/lib/i18n/language-context";
import type { Locale } from "@/lib/i18n/translations";

type LangOption = { code: Locale; label: string; short: string };

const LANGS: LangOption[] = [
  { code: "en", label: "English", short: "EN" },
  { code: "fr", label: "Français", short: "FR" },
  { code: "de", label: "Deutsch", short: "DE" },
];

export function LanguageSelector() {
  const { locale, setLocale } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const current = LANGS.find((l) => l.code === locale) ?? LANGS[0];

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-9 items-center gap-1.5 border border-zinc-800 bg-zinc-950 px-2.5 font-mono text-[11px] tracking-wider text-zinc-300 transition-colors hover:border-zinc-700 hover:text-white"
      >
        <Globe className="h-3.5 w-3.5" />
        <span>{current.short}</span>
        <ChevronDown
          className={[
            "h-3 w-3 text-zinc-500 transition-transform",
            open ? "rotate-180" : "",
          ].join(" ")}
        />
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute right-0 top-[calc(100%+6px)] z-50 min-w-[140px] border border-zinc-800 bg-zinc-950/95 py-1 shadow-xl backdrop-blur-md"
        >
          {LANGS.map((lang) => {
            const selected = lang.code === locale;
            return (
              <li key={lang.code}>
                <button
                  role="option"
                  aria-selected={selected}
                  onClick={() => {
                    setLocale(lang.code);
                    setOpen(false);
                  }}
                  className={[
                    "flex w-full items-center justify-between gap-3 px-3 py-1.5 text-left text-[12px] transition-colors",
                    selected
                      ? "bg-zinc-900 text-white"
                      : "text-zinc-400 hover:bg-zinc-900 hover:text-white",
                  ].join(" ")}
                >
                  <span className="flex items-center gap-2">
                    <span className="font-mono text-[10px] tracking-wider text-zinc-500">
                      {lang.short}
                    </span>
                    <span>{lang.label}</span>
                  </span>
                  {selected && <Check className="h-3.5 w-3.5 text-white" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
