// components/layout/TopBar.tsx
"use client";

import { useState } from "react";
import { Search, Sun, Moon, Loader, Menu, User } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useSidebar } from "@/contexts/SidebarContext";
import ChatWidget from "@/components/chat/ChatWidget";

export default function TopBar() {
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const { data: session, status } = useSession();
  const { toggleMobileSidebar } = useSidebar();

  const toggleTheme = () => setTheme(theme === "Dark" ? "Light" : "Dark");

  if (status === "loading") {
    return (
      <header className="flex items-center justify-between px-6 py-4 bg-white border-b-2 border-[#BFD833]">
        <div className="flex items-center gap-2">
          <Loader className="w-5 h-5 animate-spin text-[#44225A]" />
          <span className="text-sm text-[#44225A]/60">Memuat...</span>
        </div>
      </header>
    );
  }

  if (!session) {
    router.push("/login");
    return null;
  }

  const initials = session.user?.name
    ? session.user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "U";

  return (
    <>
      <header className="flex items-center justify-between px-4 sm:px-6 py-3 bg-white border-b-2 border-[#BFD833] sticky top-0 z-30 shadow-sm">

        {/* Kiri: toggle + judul */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleMobileSidebar}
            className="lg:hidden p-2 -ml-1 text-[#44225A] hover:bg-[#44225A]/10 rounded-lg transition-colors"
            aria-label="Toggle sidebar"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-[#44225A] leading-tight">
              Presensi Online PPLG
            </h2>
            <p className="text-xs text-[#AD6DA1] font-medium hidden sm:block">
              Selamat datang,{" "}
              <span className="text-[#762864] font-semibold">
                {session.user?.name?.split(" ")[0] || "User"}
              </span>
            </p>
          </div>
        </div>

        {/* Kanan: search + theme + user */}
        <div className="flex items-center gap-2 sm:gap-3">

          {/* Search */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-[#44225A]/5 border border-[#44225A]/15 rounded-xl">
            <Search className="w-4 h-4 text-[#44225A]/40 shrink-0" />
            <input
              type="text"
              placeholder="Cari..."
              className="bg-transparent outline-none text-sm text-gray-700 placeholder-[#44225A]/30 w-28 lg:w-40"
            />
          </div>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            title={theme === "Dark" ? "Ganti ke Light Mode" : "Ganti ke Dark Mode"}
            className="p-2 rounded-xl hover:bg-[#44225A]/10 transition-colors cursor-pointer"
          >
            {theme === "Dark" ? (
              <Moon className="w-5 h-5 text-[#AD6DA1]" />
            ) : (
              <Sun className="w-5 h-5 text-[#BFD833]" />
            )}
          </button>

          {/* User avatar */}
          <div className="flex items-center gap-2">
            {session.user?.image ? (
              <img
                src={session.user.image}
                alt="User"
                className="w-9 h-9 rounded-xl border-2 border-[#BFD833] object-cover shadow-sm"
              />
            ) : (
              <div className="w-9 h-9 rounded-xl bg-[#44225A] flex items-center justify-center border-2 border-[#BFD833] shadow-sm shrink-0">
                <span className="text-xs font-bold text-[#BFD833]">{initials}</span>
              </div>
            )}
            <span className="hidden md:block text-sm font-semibold text-[#44225A]">
              {session.user?.name || "User"}
            </span>
          </div>
        </div>
      </header>

      <ChatWidget />
    </>
  );
}
