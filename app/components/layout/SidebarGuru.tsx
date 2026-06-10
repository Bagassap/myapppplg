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

export default function SidebarGuru() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(true);
  const { isMobileOpen, closeMobileSidebar } = useSidebar();

  const menu: MenuItem[] = [
    { name: "Dashboard", href: "/guru/dashboard", icon: <LayoutDashboard /> },
    { name: "Absensi", href: "/guru/absensi", icon: <ClipboardList /> },
    { name: "Informasi", href: "/guru/informasi", icon: <MessageSquare /> },
    { name: "Data Siswa", href: "/guru/data-siswa", icon: <Users /> },
  ];

  const handleLogout = () => {
    signOut({ callbackUrl: "/login" });
  };

  return (
    <>
      {isMobileOpen && (
        <div
          onClick={closeMobileSidebar}
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
        />
      )}

      <aside
        className={`
          bg-linear-to-b from-[#44225A] via-[#44225A] to-[#762864]
          text-white flex flex-col justify-between shadow-2xl min-h-screen transition-all duration-300
          ${isOpen ? "w-72" : "w-20"}
          rounded-r-2xl
          fixed inset-y-0 left-0 z-50
          lg:static lg:translate-x-0
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Header sidebar */}
        <div className="shrink-0 flex flex-col gap-5 p-5">
          <div className="flex items-center justify-between">
            {isOpen && (
              <div className="flex items-center gap-3 animate-fade-in">
                <img
                  src="/img/img.png"
                  alt="Logo"
                  width={110}
                  height={110}
                  className="rounded-xl shadow-md transition-transform duration-300 hover:scale-105"
                />
              </div>
            )}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 hover:bg-white/15 rounded-xl transition-all duration-300 hidden lg:flex items-center justify-center"
              aria-label="Toggle sidebar"
            >
              {isOpen ? (
                <ChevronLeft className="text-[#BFD833] w-5 h-5" />
              ) : (
                <Menu className="text-[#BFD833] w-5 h-5" />
              )}
            </button>
            <button
              onClick={closeMobileSidebar}
              className="p-2 hover:bg-white/15 rounded-xl transition-all duration-300 lg:hidden"
              aria-label="Close mobile sidebar"
            >
              <ChevronLeft className="text-[#BFD833] w-5 h-5" />
            </button>
          </div>

          {/* Divider + label */}
          <div className="border-b border-white/15" />
          {isOpen && (
            <span className="text-[#BFD833]/70 text-xs font-semibold uppercase tracking-widest animate-fade-in px-1">
              Navigasi
            </span>
          )}
        </div>

        {/* Menu navigasi */}
        <nav className="flex-1 flex flex-col gap-1.5 px-3 overflow-y-auto">
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
                    ? "bg-[#BFD833] shadow-lg shadow-[#BFD833]/20"
                    : "hover:bg-white/10"
                  }
                  ${!isOpen ? "justify-center" : ""}
                `}
                title={!isOpen ? item.name : ""}
                style={{ animationDelay: `${idx * 0.06}s` }}
              >
                <span
                  className={`flex items-center justify-center w-5 h-5 shrink-0 transition-colors duration-200 ${
                    active
                      ? "text-[#44225A]"
                      : "text-white/60 group-hover:text-white"
                  }`}
                >
                  {item.icon}
                </span>
                {isOpen && (
                  <span
                    className={`truncate animate-fade-in text-base transition-colors duration-200 ${
                      active ? "text-[#44225A] font-semibold" : "text-white/90"
                    }`}
                  >
                    {item.name}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer sidebar */}
        <div className="p-3 border-t border-white/15 flex flex-col gap-3 shrink-0">
          <button
            onClick={handleLogout}
            className={`flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-red-500/20 transition-all duration-200 font-medium w-full text-left ${!isOpen ? "justify-center" : ""}`}
            aria-label="Logout"
          >
            <LogOut className="w-5 h-5 text-[#AD6DA1] shrink-0" />
            {isOpen && (
              <span className="animate-fade-in text-white/80 text-base">
                Keluar
              </span>
            )}
          </button>
          {isOpen && (
            <p className="text-xs text-[#BFD833]/50 text-center animate-fade-in pb-1">
              © 2026 PPLG Nusa
            </p>
          )}
        </div>
      </aside>
    </>
  );
}
