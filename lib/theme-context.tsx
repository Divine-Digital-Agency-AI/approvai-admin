"use client";

import * as React from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  mounted: boolean;
}

const ThemeContext = React.createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = React.useState<Theme>("light");
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem("admin-theme") as Theme | null;
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initialTheme = savedTheme || (prefersDark ? "dark" : "light");
    setThemeState(initialTheme);

    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(initialTheme);
  }, []);

  const setTheme = React.useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem("admin-theme", newTheme);

    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(newTheme);
  }, []);

  const toggleTheme = React.useCallback(() => {
    setTheme(theme === "light" ? "dark" : "light");
  }, [theme, setTheme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme, mounted }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = React.useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
