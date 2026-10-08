import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement>;
const base = { viewBox: "0 0 32 32", fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round", strokeLinejoin: "round" } as const;

/** Smart Filter: AI shield scanning a frame. */
export function SmartFilterIcon(p: P) {
  return (
    <svg {...base} aria-hidden {...p}>
      <path d="M16 3 5 7v8c0 7 4.7 11.6 11 14 6.3-2.4 11-7 11-14V7L16 3Z" />
      <rect x="10.5" y="11" width="11" height="8" rx="1.5" />
      <path d="m14.5 13.4 3.2 1.6-3.2 1.6v-3.2Z" fill="currentColor" stroke="none" />
      <path d="M8 22.5h16" strokeDasharray="1.5 2.5" opacity=".7" />
      <circle cx="24.5" cy="8.5" r="1.3" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** Clyro Synth: film frame with AI spark (cinema creation). */
export function SynthIcon(p: P) {
  return (
    <svg {...base} aria-hidden {...p}>
      <rect x="3" y="7" width="22" height="18" rx="2.5" />
      <path d="M3 11h22M3 21h22M7.5 7v4M12.5 7v4M17.5 7v4M7.5 21v4M12.5 21v4M17.5 21v4" opacity=".75" />
      <path d="m9 18 3.5-3.5 2.5 2.5 2-2 2.5 3" />
      <path d="M27 2.5c.3 2 1 2.7 3 3-2 .3-2.7 1-3 3-.3-2-1-2.7-3-3 2-.3 2.7-1 3-3Z" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** Clyro Jukebox: vinyl disc with soundwave. */
export function JukeboxIcon(p: P) {
  return (
    <svg {...base} aria-hidden {...p}>
      <circle cx="13" cy="16" r="10" />
      <circle cx="13" cy="16" r="5.5" opacity=".6" />
      <circle cx="13" cy="16" r="1.6" fill="currentColor" stroke="none" />
      <path d="M26 11v10M29 13.5v5M23 8.5v15" />
    </svg>
  );
}
