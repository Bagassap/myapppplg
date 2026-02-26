"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

type Theme = "Light" | "Dark" | "Auto";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function applyTheme(newTheme: Theme) {
  const root = document.documentElement;
  if (newTheme === "Dark") {
    root.classList.add("dark");
  } else if (newTheme === "Light") {
    root.classList.remove("dark");
  } else {
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
    prefersDark ? root.classList.add("dark") : root.classList.remove("dark");
  }
}

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setThemeState] = useState<Theme>("Light");

  useEffect(() => {
    const savedSettings = localStorage.getItem("pengaturanSistem");
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        const saved = settings.tema as Theme;
        if (saved) {
          setThemeState(saved);
          applyTheme(saved);
        }
      } catch {}
    }
  }, []);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    applyTheme(newTheme);

    const savedSettings = localStorage.getItem("pengaturanSistem");
    const settings = savedSettings ? JSON.parse(savedSettings) : {};
    settings.tema = newTheme;
    localStorage.setItem("pengaturanSistem", JSON.stringify(settings));
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
