"use client";

import { Search, Sun, Moon, Loader, Menu, User } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useSidebar } from "@/contexts/SidebarContext";

export default function TopBar() {
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const { data: session, status } = useSession();
  const { toggleMobileSidebar } = useSidebar();

  const toggleTheme = () => {
    const newTheme = theme === "Dark" ? "Light" : "Dark";
    setTheme(newTheme);
  };

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
        {/* Search box */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-lg">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search"
            className="bg-transparent outline-none text-sm text-gray-900 placeholder-gray-400"
          />
        </div>

        {/* Icons & Profile Info */}
        <div className="flex items-center gap-4">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="cursor-pointer p-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            {theme === "Dark" ? (
              <Sun className="w-5 h-5 text-yellow-500 transition-colors" />
            ) : (
              <Moon className="w-5 h-5 text-blue-500 transition-colors" />
            )}
          </button>

          {/* User Profile (Static Display) */}
          <div className="flex items-center gap-2">
            {/* Logic: Jika ada image tampilkan img, jika tidak tampilkan Icon User */}
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
  );
}
