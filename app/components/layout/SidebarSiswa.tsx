"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
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
import { useSidebar } from "@/contexts/SidebarContext";

interface MenuItem {
  name: string;
  href: string;
  icon: ReactElement;
}

export default function SidebarSiswa() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(true);
  const { isMobileOpen, closeMobileSidebar } = useSidebar();

  const menu: MenuItem[] = [
    { name: "Dashboard", href: "/siswa/dashboard", icon: <LayoutDashboard /> },
    { name: "Absensi", href: "/siswa/absensi", icon: <ClipboardList /> },
    { name: "Informasi", href: "/siswa/informasi", icon: <MessageSquare /> },
    { name: "Data Siswa", href: "/siswa/data-siswa", icon: <Users /> },
  ];

  const handleLogout = () => {
    signOut({ callbackUrl: "/login" });
  };

  return (
    <>
      {isMobileOpen && (
        <div
          onClick={closeMobileSidebar}
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm transition-opacity"
        />
      )}

      <aside
        className={`
          bg-[#00182E] text-white flex flex-col justify-between shadow-2xl min-h-screen transition-all duration-300
          ${isOpen ? "w-72" : "w-20"}
          rounded-r-2xl
          fixed inset-y-0 left-0 z-50
          lg:static lg:translate-x-0
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="shrink-0 flex flex-col gap-5 p-5">
          <div className="flex items-center justify-between">
            {isOpen && (
              <div className="flex items-center gap-3 animate-fade-in">
                <img
                  src="/img/img.png"
                  alt="Logo"
                  width={110}
                  height={110}
                  className="rounded-xl transition-transform duration-300 hover:scale-105"
                />
              </div>
            )}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 hover:bg-[#013FF6] rounded-xl transition-all duration-200 hidden lg:flex items-center justify-center"
              aria-label="Toggle sidebar"
            >
              {isOpen ? (
                <ChevronLeft className="text-[#ACEC00] w-5 h-5" />
              ) : (
                <Menu className="text-[#ACEC00] w-5 h-5" />
              )}
            </button>
            <button
              onClick={closeMobileSidebar}
              className="p-2 hover:bg-[#013FF6] rounded-xl transition-all duration-200 lg:hidden"
              aria-label="Close mobile sidebar"
            >
              <ChevronLeft className="text-[#ACEC00] w-5 h-5" />
            </button>
          </div>

          <div className="border-b border-white/10" />
          {isOpen && (
            <span className="text-[#ACEC00]/60 text-xs font-bold uppercase tracking-widest animate-fade-in px-1">
              Navigasi
            </span>
          )}
        </div>

        <nav className="flex-1 flex flex-col gap-1 px-3 overflow-y-auto">
          {menu.map((item, idx) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMobileSidebar}
                className={`
                  group flex items-center gap-3 px-3 py-3 rounded-xl
                  transition-all duration-200 ease-in-out font-medium
                  ${active
                    ? "bg-[#ACEC00] shadow-lg shadow-[#ACEC00]/20"
                    : "hover:bg-[#013FF6]"
                  }
                  ${!isOpen ? "justify-center" : ""}
                `}
                title={!isOpen ? item.name : ""}
                style={{ animationDelay: `${idx * 0.06}s` }}
              >
                <span
                  className={`flex items-center justify-center w-5 h-5 shrink-0 transition-colors duration-200 ${
                    active ? "text-[#00182E]" : "text-white/50 group-hover:text-white"
                  }`}
                >
                  {item.icon}
                </span>
                {isOpen && (
                  <span
                    className={`truncate animate-fade-in text-base transition-colors duration-200 ${
                      active ? "text-[#00182E] font-bold" : "text-white/80"
                    }`}
                  >
                    {item.name}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-white/10 flex flex-col gap-2 shrink-0">
          <button
            onClick={handleLogout}
            className={`flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-red-600/20 transition-all duration-200 font-medium w-full text-left ${!isOpen ? "justify-center" : ""}`}
            aria-label="Logout"
          >
            <LogOut className="w-5 h-5 text-[#013FF6] shrink-0" />
            {isOpen && (
              <span className="animate-fade-in text-white/70 text-base">
                Keluar
              </span>
            )}
          </button>
          {isOpen && (
            <p className="text-xs text-[#ACEC00]/40 text-center animate-fade-in pb-1">
              © 2026 PPLG Nusa
            </p>
          )}
        </div>
      </aside>
    </>
  );
}
