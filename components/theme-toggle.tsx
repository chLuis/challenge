import type { ReactNode } from "react";
import { getTheme } from "@/lib/theme";
import { setTheme } from "@/lib/theme-action";
import type { Theme } from "@/types/theme";
import { Monitor, Moon, Sun } from "lucide-react";

const OPTIONS: { value: Theme; label: string; icon: ReactNode }[] = [
  {
    value: "light",
    label: "Claro",
    icon: <Sun />,
  },
  { 
    value: "dark",
    label: "Oscuro",
    icon: <Moon />
  },
  {
    value: "system",
    label: "Según el sistema",
    icon: <Monitor />,
  },
];

export async function ThemeToggle() {
  const theme = await getTheme();

  return (
    <form action={setTheme} role="group" aria-label="Tema" className="flex rounded-lg border border-border bg-surface p-1 shadow-sm">
      {OPTIONS.map(({ value, label, icon }) => (
        <button
          key={value}
          name="theme"
          value={value}
          aria-label={label}
          aria-pressed={theme === value}
          title={label}
          className="flex size-8 items-center justify-center rounded-md text-muted transition-colors hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary aria-pressed:bg-primary aria-pressed:text-primary-text"
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
            {icon}
          </svg>
        </button>
      ))}
    </form>
  );
}
