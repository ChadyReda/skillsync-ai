import { cn } from "@/lib/utils";

type Logo = {
  src: string;
  alt: string;
  sizeClass?: string;
};

interface LogoCloudProps {
  className?: string;
  logos?: Logo[];
}

const defaultLogos: Logo[] = [
  { src: "https://svgl.app/library/openai_wordmark_light.svg", alt: "OpenAI" },
  { src: "https://svgl.app/library/clerk-wordmark-light.svg", alt: "Clerk" },
  { src: "https://svgl.app/library/vercel_wordmark.svg", alt: "Vercel" },
  {
    src: "https://svgl.app/library/claude-ai-wordmark-icon_light.svg",
    alt: "Anthropic",
  },
  {
    src: "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/drizzle.svg",
    alt: "Drizzle",
    sizeClass: "h-10",
  },
  { src: "https://svgl.app/library/github_wordmark_light.svg", alt: "GitHub" },
  { src: "https://svgl.app/library/nvidia-wordmark-light.svg", alt: "Nvidia" },
  {
    src: "https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/nextdotjs.svg",
    alt: "Next.js",
    sizeClass: "h-10",
  },
];

export function LogoCloud({ className, logos = defaultLogos }: LogoCloudProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-zinc-800 bg-black",
        className,
      )}
    >
      {/* subtle glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.06),transparent_60%)]" />

      {/* -mr-px -mb-px hides the overflowing right/bottom borders of the last column/row */}
      <div className="grid grid-cols-2 -mr-px -mb-px md:grid-cols-4">
        {logos.map((logo) => (
          <LogoCell key={logo.alt} logo={logo} />
        ))}
      </div>
    </div>
  );
}

function LogoCell({ logo }: { logo: Logo }) {
  return (
    <div
      className="group relative flex h-28 items-center justify-center overflow-hidden bg-black border-r border-b border-zinc-800 transition-all duration-300 hover:bg-zinc-950"
    >
      {/* premium hover highlight */}
      <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom_right,rgba(255,255,255,0.04),transparent)]" />
      </div>

      <img
        src={logo.src}
        alt={logo.alt}
        loading="lazy"
        width={120}
        height={24}
        className={cn("relative z-10 select-none opacity-40 grayscale transition-all duration-300 group-hover:scale-105 group-hover:opacity-90 group-hover:grayscale-0 dark:invert dark:brightness-150", logo.sizeClass ?? "h-7")}
      />
    </div>
  );
}
