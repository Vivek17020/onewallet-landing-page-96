import * as React from "react";

type Theme = "light" | "dark" | "system";

interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: "light" | "dark";
  setTheme: (t: Theme) => void;
}

const ThemeContext = React.createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = React.useState<Theme>(() => {
    if (typeof window === "undefined") return "system";
    return (localStorage.getItem("vite-ui-theme") as Theme) || "system";
  });

  const [resolvedTheme, setResolvedTheme] = React.useState<"light" | "dark">(() => {
    if (typeof window === "undefined") return "light";
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const stored = (localStorage.getItem("vite-ui-theme") as Theme) || "system";
    if (stored === "dark") return "dark";
    if (stored === "light") return "light";
    return prefersDark ? "dark" : "light";
  });

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      if (theme === "system") {
        setResolvedTheme(media.matches ? "dark" : "light");
      }
    };
    handler();
    media.addEventListener("change", handler);
    return () => media.removeEventListener("change", handler);
  }, [theme]);

  React.useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    const current = theme === "system" ? resolvedTheme : theme;
    
    root.classList.remove("light", "dark");
    root.classList.add(current);
    
    localStorage.setItem("vite-ui-theme", theme);
  }, [theme, resolvedTheme]);

  const value = React.useMemo(
    () => ({ theme, resolvedTheme, setTheme: (t: Theme) => setThemeState(t) }),
    [theme, resolvedTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = React.useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
