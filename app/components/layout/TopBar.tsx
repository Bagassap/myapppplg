// components/layout/TopBar.tsx
"use client";

import { useState, useEffect } from "react";
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
import ChatWidget from "@/components/chat/ChatWidget";

export default function TopBar() {
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const { data: session, status } = useSession();
  const { toggleMobileSidebar } = useSidebar();

  const [chatOpen, setChatOpen] = useState(false);
  const [unread, setUnread] = useState(0);

  const toggleTheme = () => setTheme(theme === "Dark" ? "Light" : "Dark");

  // Poll unread count saat widget tertutup
  useEffect(() => {
    if (chatOpen || status !== "authenticated") return;
    const fetchUnread = async () => {
      try {
        const r = await fetch("/api/chat/unread");
        if (r.ok) {
          const { count } = await r.json();
          setUnread(count);
        }
      } catch {}
    };
    fetchUnread();
    const id = setInterval(fetchUnread, 10000);
    return () => clearInterval(id);
  }, [chatOpen, status]);

  // Reset badge saat widget dibuka
  const openChat = () => {
    setChatOpen(true);
    setUnread(0);
  };
  const closeChat = () => setChatOpen(false);

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
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-lg">
            <Search className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search"
              className="bg-transparent outline-none text-sm text-gray-900 placeholder-gray-400"
            />
          </div>

          <div className="flex items-center gap-3">
            {/* Chat Icon + Badge */}
            <button
              onClick={chatOpen ? closeChat : openChat}
              aria-label="Chat"
              className={`relative p-2 rounded-xl transition-colors cursor-pointer ${
                chatOpen
                  ? "bg-indigo-50 text-indigo-600"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              }`}
            >
              <MessageCircle className="w-5 h-5" />
              {unread > 0 && !chatOpen && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-rose-500 rounded-full border-2 border-white text-white text-[9px] font-bold flex items-center justify-center px-0.5">
                  {unread > 9 ? "9+" : unread}
                </span>
              )}
            </button>

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

      {/* Chat Widget — floating */}
      <ChatWidget isOpen={chatOpen} onClose={closeChat} showFAB={false} />
    </>
  );
}
