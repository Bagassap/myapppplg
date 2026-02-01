// src/components/layout/TopBar.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Sun, Moon, User, LogOut, Loader } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext"; // Import context
import { useRouter } from "next/navigation"; // Import untuk navigasi
import { useSession, signOut } from "next-auth/react"; // Import untuk session dan signOut

export default function TopBar() {
  // Gunakan theme dari context (bukan state lokal)
  const { theme, setTheme } = useTheme();

  // State untuk dropdown profil
  const [showProfile, setShowProfile] = useState(false);

  // Ref untuk mendeteksi klik di luar dropdown
  const profileRef = useRef<HTMLDivElement>(null);

  // Router untuk navigasi
  const router = useRouter();

  // Session dari NextAuth
  const { data: session, status } = useSession();

  // Fungsi toggle tema (Light ↔ Dark)
  const toggleTheme = () => {
    const newTheme = theme === "Dark" ? "Light" : "Dark";
    setTheme(newTheme);
    console.log("Theme toggled to:", newTheme); // Debug: cek di console
    console.log("Current theme state:", theme); // Debug tambahan
  };

  // Fungsi untuk menu Profile
  const handleProfile = () => {
    setShowProfile(false); // Tutup dropdown
    router.push("/profile"); // Navigasi ke halaman profile (sesuaikan path)
  };

  // Fungsi untuk menu Logout
  const handleLogout = async () => {
    setShowProfile(false); // Tutup dropdown
    await signOut({ callbackUrl: "/login" }); // Logout dengan NextAuth dan redirect ke login
  };

  // Efek untuk menutup dropdown saat klik di luar
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

  // Jika session sedang loading, tampilkan loading
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

  // Jika tidak ada session, redirect ke login atau tampilkan placeholder
  if (!session) {
    router.push("/login"); // Redirect jika belum login
    return null; // Atau tampilkan placeholder
  }

  return (
    <header className="flex items-center justify-between px-6 py-6 bg-white border-b border-gray-200">
      {/* Left: Title */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">
          Presensi Online PPLG
        </h2>
        <p className="text-sm text-gray-600">Welcome back!</p>
      </div>

      {/* Right: Search & Actions */}
      <div className="flex items-center gap-6">
        {/* Search box */}
        <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-lg">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search"
            className="bg-transparent outline-none text-sm text-gray-900 placeholder-gray-400"
          />
        </div>

        {/* Icons */}
        <div className="flex items-center gap-4 relative">
          {/* Dark/Light Mode Toggle - Sekarang satu tombol toggle */}
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
                src={session.user?.image || "https://i.pravatar.cc/40"} // Foto dari session atau fallback
                alt="User"
                className="w-8 h-8 rounded-full"
              />
              <span className="text-sm font-medium text-gray-900">
                {session.user?.name || "User"} {/* Nama dari session */}
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
