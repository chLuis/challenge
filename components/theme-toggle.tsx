"use client";

import { useSyncExternalStore, type ReactNode } from "react";
import { applyTheme, readTheme, subscribeToTheme, THEMES, type Theme } from "@/lib/theme";

const LABELS: Record<Theme, string> = {
  light: "Claro",
  dark: "Oscuro",
  system: "Según el sistema",
};

const ICONS: Record<Theme, ReactNode> = {
  light: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </>
  ),
  dark: <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" />,
  system: (
    <>
      <rect x="3" y="4" width="18" height="12" rx="2" />
      <path d="M8 20h8M12 16v4" />
    </>
  ),
};

/**
 * The selected option is highlighted from CSS (html[data-theme]), not from
 * React state, so it is right on the first paint and never flashes.
 */
export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribeToTheme, readTheme, () => "system" as const);

  return (
    <div role="group" aria-label="Tema" className="flex rounded-lg border border-border bg-surface p-1 shadow-sm">
      {THEMES.map((option) => (
        <button
          key={option}
          type="button"
          data-theme-option={option}
          aria-label={LABELS[option]}
          aria-pressed={theme === option}
          title={LABELS[option]}
          onClick={() => applyTheme(option)}
          className="flex size-8 items-center justify-center rounded-md text-muted transition-colors hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <svg
            viewBox="0 0 24 24"
            className="size-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            {ICONS[option]}
          </svg>
        </button>
      ))}
    </div>
  );
}
