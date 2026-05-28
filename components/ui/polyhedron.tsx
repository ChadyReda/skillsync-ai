type Props = {
  className?: string;
  strokeWidth?: number;
};

const base = (className?: string) =>
  ["shrink-0", className ?? ""].filter(Boolean).join(" ");

export function Cube({ className, strokeWidth = 1.5 }: Props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="square"
      strokeLinejoin="miter"
      className={base(className)}
      aria-hidden
    >
      <path d="M12 3 L21 7.5 L21 16.5 L12 21 L3 16.5 L3 7.5 Z" />
      <path d="M12 3 V12 M3 7.5 L12 12 L21 7.5" />
    </svg>
  );
}

export function HexPrism({ className, strokeWidth = 1.5 }: Props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="square"
      strokeLinejoin="miter"
      className={base(className)}
      aria-hidden
    >
      <path d="M12 2 L21 7 L21 17 L12 22 L3 17 L3 7 Z" />
      <path d="M12 2 V12 M3 7 L12 12 L21 7" />
    </svg>
  );
}

export function Triangle({ className, strokeWidth = 1.5 }: Props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="square"
      strokeLinejoin="miter"
      className={base(className)}
      aria-hidden
    >
      <path d="M12 3 L22 21 L2 21 Z" />
    </svg>
  );
}

export function Diamond({ className, strokeWidth = 1.5 }: Props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="square"
      strokeLinejoin="miter"
      className={base(className)}
      aria-hidden
    >
      <path d="M12 2 L22 12 L12 22 L2 12 Z" />
    </svg>
  );
}

export function Tetra({ className, strokeWidth = 1.5 }: Props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="square"
      strokeLinejoin="miter"
      className={base(className)}
      aria-hidden
    >
      <path d="M12 3 L21 20 L3 20 Z" />
      <path d="M12 3 V20 M3 20 L21 20" />
    </svg>
  );
}

export function GridSquares({ className, strokeWidth = 1.5 }: Props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="square"
      strokeLinejoin="miter"
      className={base(className)}
      aria-hidden
    >
      <rect x="3" y="3" width="8" height="8" />
      <rect x="13" y="3" width="8" height="8" />
      <rect x="3" y="13" width="8" height="8" />
      <rect x="13" y="13" width="8" height="8" />
    </svg>
  );
}

export function Octa({ className, strokeWidth = 1.5 }: Props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="square"
      strokeLinejoin="miter"
      className={base(className)}
      aria-hidden
    >
      <path d="M12 2 L22 12 L12 22 L2 12 Z" />
      <path d="M2 12 H22 M12 2 V22" />
    </svg>
  );
}

export function ConcentricSquare({ className, strokeWidth = 1.5 }: Props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="square"
      strokeLinejoin="miter"
      className={base(className)}
      aria-hidden
    >
      <rect x="3" y="3" width="18" height="18" />
      <rect x="9" y="9" width="6" height="6" />
    </svg>
  );
}

export function FilledSquare({ className, strokeWidth = 1.5 }: Props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="square"
      strokeLinejoin="miter"
      className={base(className)}
      aria-hidden
    >
      <rect x="5" y="5" width="14" height="14" />
    </svg>
  );
}

export function PolySpinner({ className, strokeWidth = 1.5 }: Props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="square"
      strokeLinejoin="miter"
      className={base(`${className ?? ""} animate-spin`)}
      aria-hidden
    >
      <path d="M12 3 L21 19 L3 19 Z" />
    </svg>
  );
}

export function ArrowOut({ className, strokeWidth = 1.5 }: Props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="square"
      strokeLinejoin="miter"
      className={base(className)}
      aria-hidden
    >
      <path d="M8 16 L16 8" />
      <path d="M9 8 H16 V15" />
    </svg>
  );
}

export function CheckSquare({ className, strokeWidth = 1.5 }: Props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="square"
      strokeLinejoin="miter"
      className={base(className)}
      aria-hidden
    >
      <rect x="3" y="3" width="18" height="18" />
      <path d="M7 12 L11 16 L17 8" />
    </svg>
  );
}

export function CrossSquare({ className, strokeWidth = 1.5 }: Props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="square"
      strokeLinejoin="miter"
      className={base(className)}
      aria-hidden
    >
      <rect x="3" y="3" width="18" height="18" />
      <path d="M8 8 L16 16 M16 8 L8 16" />
    </svg>
  );
}
