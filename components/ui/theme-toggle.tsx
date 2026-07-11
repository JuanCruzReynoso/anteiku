"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // Static label to avoid hydration mismatch
  const label = "Cambiar tema";

  return (
    <button
      type="button"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="inline-flex size-14 items-center justify-center rounded-lg hover:bg-muted transition-colors"
      aria-label={label}
    >
      {mounted ? (
        <>
          <Sun className="h-6 w-6 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-6 w-6 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </>
      ) : (
        <Sun className="h-6 w-6" />
      )}
      <span className="sr-only">{label}</span>
    </button>
  );
}
