// src/components/layout/TopBar.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Sun, Moon, User, LogOut, Loader, Menu } from "lucide-react"; // Added Menu
import { useTheme } from "@/contexts/ThemeContext";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useSidebar } from "@/contexts/SidebarContext"; // Import Context

export default function TopBar() {
  const { theme, setTheme } = useTheme();
  const [showProfile, setShowProfile] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { data: session, status } = useSession();

  // Use Sidebar Context
  const { toggleMobileSidebar } = useSidebar();

  const toggleTheme = () => {
    const newTheme = theme === "Dark" ? "Light" : "Dark";
    setTheme(newTheme);
    console.log("Theme toggled to:", newTheme);
    console.log("Current theme state:", theme);
  };

  const handleProfile = () => {
    setShowProfile(false);
    router.push("/profile");
  };

  const handleLogout = async () => {
    setShowProfile(false);
    await signOut({ callbackUrl: "/login" });
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setShowProfile(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
    <header className="flex items-center justify-between px-6 py-6 bg-white border-b border-gray-200 sticky top-0 z-30">
      {/* Left: Toggle & Title */}
      <div className="flex items-center gap-4">
        {/* Toggle Button (Mobile Only) */}
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

      {/* Right: Search & Actions */}
      <div className="flex items-center gap-6">
        {/* Search box - Hidden on very small screens if needed, otherwise keep */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-lg">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search"
            className="bg-transparent outline-none text-sm text-gray-900 placeholder-gray-400"
          />
        </div>

        {/* Icons */}
        <div className="flex items-center gap-4 relative">
          <div className="cursor-pointer" onClick={toggleTheme}>
            {theme === "Dark" ? (
              <Sun className="w-5 h-5 text-yellow-500 transition-colors" />
            ) : (
              <Moon className="w-5 h-5 text-blue-500 transition-colors" />
            )}
          </div>

          {/* Profil Dropdown */}
          <div className="relative" ref={profileRef}>
            <div
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => setShowProfile(!showProfile)}
            >
              <img
                src={session.user?.image || "https://i.pravatar.cc/40"}
                alt="User"
                className="w-8 h-8 rounded-full"
              />
              {/* Hide Name on small mobile screens to save space */}
              <span className="hidden sm:block text-sm font-medium text-gray-900">
                {session.user?.name || "User"}
              </span>
            </div>
            {showProfile && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                <div className="p-4">
                  <ul className="space-y-2">
                    <li
                      className="flex items-center gap-2 text-sm text-gray-600 hover:bg-gray-100 px-2 py-1 rounded cursor-pointer"
                      onClick={handleProfile}
                    >
                      <User className="w-4 h-4" />
                      Profile
                    </li>
                    <li
                      className="flex items-center gap-2 text-sm text-red-600 hover:bg-gray-100 px-2 py-1 rounded cursor-pointer"
                      onClick={handleLogout}
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
