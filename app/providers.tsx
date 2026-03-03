"use client";

import { SessionProvider } from "next-auth/react";
import { SidebarProvider } from "@/contexts/SidebarContext";
import { ThemeProvider } from "@/contexts/ThemeContext";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider>
        <SidebarProvider>{children}</SidebarProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
