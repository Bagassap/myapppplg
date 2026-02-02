"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ClipboardList,
  MessageSquare,
  Users,
  LogOut,
  Menu,
  ChevronLeft,
} from "lucide-react";
import { useState, ReactElement } from "react";
// Import Context
import { useSidebar } from "@/contexts/SidebarContext";

interface MenuItem {
  name: string;
  href: string;
  icon: ReactElement;
}

export default function SidebarSiswa() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(true);

  // Gunakan context untuk mobile state
  const { isMobileOpen, closeMobileSidebar } = useSidebar();

  const menu: MenuItem[] = [
    { name: "Dashboard", href: "/siswa/dashboard", icon: <LayoutDashboard /> },
    { name: "Absensi", href: "/siswa/absensi", icon: <ClipboardList /> },
    { name: "Informasi", href: "/siswa/informasi", icon: <MessageSquare /> },
    { name: "Data Siswa", href: "/siswa/data-siswa", icon: <Users /> },
  ];

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    router.push("/login");
  };

  return (
    <>
      {/* Mobile Overlay (Backdrop) */}
      {isMobileOpen && (
        <div
          onClick={closeMobileSidebar}
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
        />
      )}

      <aside
        className={`
          bg-linear-to-b from-indigo-700 via-indigo-600 to-blue-600 text-white flex flex-col justify-between shadow-2xl min-h-screen transition-all duration-300
          ${isOpen ? "w-80" : "w-20"} 
          rounded-r-2xl

          /* --- RESPONSIVE CLASSES --- */
          fixed inset-y-0 left-0 z-50
          lg:static lg:translate-x-0
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Header */}
        <div className="shrink-0 flex flex-col gap-6 p-6">
          <div className="flex items-center justify-between">
            {isOpen && (
              <div className="flex items-center gap-4 animate-fade-in">
                <img
                  src="/img/img.png"
                  alt="Logo"
                  width={120}
                  height={120}
                  className="rounded-lg shadow-md p-1 transition-transform duration-300 hover:scale-110"
                />
              </div>
            )}

            {/* Tombol Toggle Desktop (Internal state) */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 hover:bg-white/20 rounded-md transition-all duration-300 hover:rotate-180 hidden lg:block"
              aria-label="Toggle sidebar"
            >
              {isOpen ? (
                <ChevronLeft className="text-white w-6 h-6" />
              ) : (
                <Menu className="text-white w-6 h-6" />
              )}
            </button>

            {/* Tombol Close Mobile (Hanya muncul di mobile) */}
            <button
              onClick={closeMobileSidebar}
              className="p-2 hover:bg-white/20 rounded-md transition-all duration-300 lg:hidden"
              aria-label="Close mobile sidebar"
            >
              <ChevronLeft className="text-white w-6 h-6" />
            </button>
          </div>
          {/* Garis Pemisah */}
          <div className="border-b border-white/30"></div>

          {isOpen && (
            <div className="flex flex-col gap-1 animate-fade-in">
              <span className="text-white text-base">Main Menu</span>
            </div>
          )}
        </div>

        {/* Menu Navigasi */}
        <nav className="flex-1 flex flex-col gap-6 px-4 overflow-y-auto">
          {menu.map((item, idx) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMobileSidebar} // Tutup sidebar saat link diklik di mobile
                className={`group flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ease-in-out text-base font-medium tracking-wide hover:bg-white/15 hover:shadow-sm ${
                  active ? "bg-white/20 shadow-md" : ""
                }`}
                title={!isOpen ? item.name : ""}
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <span
                  className={`flex items-center justify-center w-6 h-6 text-white transition-all duration-300 rounded-md ${
                    active
                      ? " text-white"
                      : "texr-white/50 group-hover:text-white"
                  }`}
                >
                  {item.icon}
                </span>
                {isOpen && (
                  <span className="truncate animate-fade-in text-white text-lg transition-colors duration-300">
                    {item.name}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-white/30 flex flex-col gap-4 shrink-0">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-white/15 transition-all duration-300 hover:shadow-sm text-base font-medium"
            aria-label="Logout"
          >
            <LogOut className="w-6 h-6 text-indigo-300" />
            {isOpen && <span className="animate-fade-in">Keluar</span>}
          </button>
          {isOpen && (
            <p className="text-sm text-blue-300 mt-2 text-center animate-fade-in">
              © 2025 NextsideAPP
            </p>
          )}
        </div>
      </aside>
    </>
  );
}
