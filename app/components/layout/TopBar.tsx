// components/layout/TopBar.tsx  ← VERSI DENGAN CHAT
"use client";

import { useState } from "react";
import {
  Search,
  Sun,
  Moon,
  Loader,
  Menu,
  User,
  MessageCircle,
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useSidebar } from "@/contexts/SidebarContext";
import { useChatPolling } from "@/hooks/useChatPolling";
import SiswaChatWidget from "@/components/chat/SiswaChatWidget";
import SendMessagePanel from "@/components/chat/SendMessagePanel";

// ── Chat Badge Icon (inline, tanpa file terpisah) ─────────────────────────────
function ChatIconButton({
  role,
  onClick,
  isActive,
}: {
  role: "ADMIN" | "GURU" | "SISWA";
  onClick: () => void;
  isActive: boolean;
}) {
  // Polling unread hanya untuk SISWA
  const { unreadCount } = useChatPolling({
    role,
    enabled: role === "SISWA",
    pollInterval: 10000,
  });

  return (
    <button
      onClick={onClick}
      aria-label={`Chat${unreadCount > 0 ? ` — ${unreadCount} pesan baru` : ""}`}
      className={`relative p-2 rounded-xl transition-colors cursor-pointer ${
        isActive
          ? "bg-indigo-50 text-indigo-600"
          : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
      }`}
    >
      <MessageCircle className="w-5 h-5" />
      {unreadCount > 0 && (
        <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-rose-500 rounded-full border-2 border-white text-white text-[9px] font-bold flex items-center justify-center px-0.5">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </button>
  );
}

// ── TopBar ────────────────────────────────────────────────────────────────────
export default function TopBar() {
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const { data: session, status } = useSession();
  const { toggleMobileSidebar } = useSidebar();
  const [chatIconActive, setChatIconActive] = useState(false);

  const toggleTheme = () => setTheme(theme === "Dark" ? "Light" : "Dark");

  const role = session?.user?.role as "ADMIN" | "GURU" | "SISWA" | undefined;

  if (status === "loading") {
    return (
      <header className="flex items-center justify-between px-6 py-6 bg-white border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Loader className="w-5 h-5 animate-spin text-gray-500" />
          <span className="text-sm text-gray-600">Memuat...</span>
        </div>
      </header>
    );
  }

  if (!session) {
    router.push("/login");
    return null;
  }

  return (
    <>
      {/* ── Header Bar ── */}
      <header className="flex items-center justify-between px-6 py-6 bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <button
            onClick={toggleMobileSidebar}
            className="lg:hidden p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">
              Presensi Online PPLG
            </h2>
            <p className="text-sm text-gray-600">Welcome back!</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-lg">
            <Search className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search"
              className="bg-transparent outline-none text-sm text-gray-900 placeholder-gray-400"
            />
          </div>

          <div className="flex items-center gap-3">
            {/* ── Chat Icon — hanya muncul jika session ada ── */}
            {role && (
              <ChatIconButton
                role={role}
                onClick={() => setChatIconActive((p) => !p)}
                isActive={chatIconActive}
              />
            )}

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              title={
                theme === "Dark" ? "Ganti ke Light Mode" : "Ganti ke Dark Mode"
              }
              className="cursor-pointer p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              {theme === "Dark" ? (
                <Moon className="w-5 h-5 text-blue-400" />
              ) : (
                <Sun className="w-5 h-5 text-yellow-500" />
              )}
            </button>

            {/* User avatar */}
            <div className="flex items-center gap-2">
              {session.user?.image ? (
                <img
                  src={session.user.image}
                  alt="User"
                  className="w-8 h-8 rounded-full border border-gray-200 object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200">
                  <User className="w-5 h-5 text-gray-500" />
                </div>
              )}
              <span className="hidden sm:block text-sm font-medium text-gray-900">
                {session.user?.name || "User"}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* ── Chat Widgets — floating, render di luar header ── */}
      {role === "SISWA" && <SiswaChatWidget />}
      {role === "ADMIN" && <SendMessagePanel role="ADMIN" />}
      {role === "GURU" && <SendMessagePanel role="GURU" />}
    </>
  );
}
