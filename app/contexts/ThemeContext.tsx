// app/contexts/ThemeContext.tsx
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

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setThemeState] = useState<Theme>("Light");

  // Load tema dari localStorage saat komponen mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("pengaturanSistem");
    if (savedTheme) {
      const settings = JSON.parse(savedTheme);
      setThemeState(settings.tema || "Light");
    }
  }, []);

  // Fungsi untuk mengubah tema dan menerapkan ke DOM
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    const root = document.documentElement; // Target <html>
    if (newTheme === "Dark") {
      root.classList.add("dark");
    } else if (newTheme === "Light") {
      root.classList.remove("dark");
    } else if (newTheme === "Auto") {
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)",
      ).matches;
      if (prefersDark) {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    }
    // Simpan ke localStorage
    const savedSettings = localStorage.getItem("pengaturanSistem");
    const settings = savedSettings ? JSON.parse(savedSettings) : {};
    settings.tema = newTheme;
    localStorage.setItem("pengaturanSistem", JSON.stringify(settings));
  };

  // Terapkan tema saat state berubah (hati-hati dengan loop, tapi aman di sini)
  useEffect(() => {
    setTheme(theme);
  }, [theme]);

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
