// components/layout/TopBar.tsx
"use client";

import { Search, Sun, Moon, Loader, Menu } from "lucide-react";
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
      <header
        className="flex items-center justify-between px-6 py-4 border-b-2 border-[#ACEC00]"
        style={{ background: "var(--bg-topbar)" }}
      >
        <div className="flex items-center gap-2">
          <Loader className="w-5 h-5 animate-spin text-[#013FF6]" />
          <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Memuat...
          </span>
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
      <header
        className="flex items-center justify-between px-4 sm:px-6 py-3 border-b-2 border-[#ACEC00] sticky top-0 z-30 shadow-sm"
        style={{ background: "var(--bg-topbar)" }}
      >
        {/* Kiri: toggle + judul */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleMobileSidebar}
            className="lg:hidden p-2 -ml-1 rounded-lg transition-colors hover:bg-black/5 dark:hover:bg-white/10"
            style={{ color: "var(--text-primary)" }}
            aria-label="Toggle sidebar"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div>
            <h2
              className="text-lg sm:text-xl font-bold leading-tight"
              style={{ color: "var(--text-primary)" }}
            >
              Presensi Online PPLG
            </h2>
            <p className="text-xs font-semibold hidden sm:block" style={{ color: "var(--text-secondary)" }}>
              Selamat datang,{" "}
              <span style={{ color: "var(--text-primary)" }}>
                {session.user?.name?.split(" ")[0] || "User"}
              </span>
            </p>
          </div>
        </div>

        {/* Kanan: search + theme + user */}
        <div className="flex items-center gap-2 sm:gap-3">

          {/* Search */}
          <div
            className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl border"
            style={{
              background: "var(--bg-input)",
              borderColor: "var(--border-color)",
            }}
          >
            <Search
              className="w-4 h-4 shrink-0"
              style={{ color: "var(--text-secondary)" }}
            />
            <input
              type="text"
              placeholder="Cari..."
              className="bg-transparent outline-none text-sm w-28 lg:w-40"
              style={{ color: "var(--text-primary)" }}
            />
          </div>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            title={theme === "Dark" ? "Ganti ke Light Mode" : "Ganti ke Dark Mode"}
            className="p-2 rounded-xl transition-colors cursor-pointer hover:bg-black/5 dark:hover:bg-white/10"
          >
            {theme === "Dark" ? (
              <Moon className="w-5 h-5 text-[#ACEC00]" />
            ) : (
              <Sun className="w-5 h-5 text-[#013FF6]" />
            )}
          </button>

          {/* User avatar */}
          <div className="flex items-center gap-2">
            {session.user?.image ? (
              <img
                src={session.user.image}
                alt="User"
                className="w-9 h-9 rounded-xl border-2 border-[#ACEC00] object-cover shadow-sm"
              />
            ) : (
              <div className="w-9 h-9 rounded-xl bg-[#00182E] flex items-center justify-center border-2 border-[#ACEC00] shadow-sm shrink-0">
                <span className="text-xs font-bold text-[#ACEC00]">{initials}</span>
              </div>
            )}
            <span
              className="hidden md:block text-sm font-bold"
              style={{ color: "var(--text-primary)" }}
            >
              {session.user?.name || "User"}
            </span>
          </div>
        </div>
      </header>

      <ChatWidget />
    </>
  );
}
