import { useEffect, useState } from "react";

const THEMES = ["light", "dark", "system"] as const;
export type Theme = (typeof THEMES)[number];

export const isTheme = (value: unknown): value is Theme => THEMES.some((theme) => theme === value);

const STORAGE_KEY = "deskmate-theme";
const media = matchMedia("(prefers-color-scheme: dark)");

function readTheme(): Theme {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === "light" || stored === "dark" ? stored : "system";
  } catch {
    return "system";
  }
}

const applyTheme = (theme: Theme) =>
  document.documentElement.classList.toggle(
    "dark",
    theme === "dark" || (theme === "system" && media.matches),
  );

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(readTheme);

  useEffect(() => {
    applyTheme(theme);
    if (theme !== "system") return undefined;

    const onChange = () => applyTheme(theme);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [theme]);

  const setTheme = (next: Theme) => {
    try {
      if (next === "system") localStorage.removeItem(STORAGE_KEY);
      else localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Storage can be blocked; the choice then lasts for this tab only.
    }
    setThemeState(next);
  };

  return { theme, setTheme };
}
