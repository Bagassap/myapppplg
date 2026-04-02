"use client";

import Sidebar from "@/components/layout/SidebarSiswa";
import TopBar from "@/components/layout/TopBar";
import { useState, useEffect } from "react";
import {
  Info,
  Megaphone,
  CheckCircle,
  Calendar,
  Bell,
  FileText,
  AlertTriangle,
  BarChart2,
  Sparkles,
  ChevronRight,
  Clock,
  BookOpen,
} from "lucide-react";

interface Announcement {
  id: number;
  judul: string;
  isi: string;
  tanggal: string;
  kategori: string;
}

function formatTanggal(raw: string) {
  if (!raw) return "-";
  const d = new Date(raw);
  if (isNaN(d.getTime())) return raw;
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatTanggalShort(raw: string) {
  if (!raw) return "-";
  const d = new Date(raw);
  if (isNaN(d.getTime())) return raw;
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const ITEM_STYLES = [
  {
    accentCls: "border-l-indigo-500",
    numCls: "bg-indigo-50 text-indigo-700",
    iconBg: "bg-indigo-50",
    iconColor: "text-indigo-600",
    badgeCls: "bg-indigo-50 text-indigo-700 border-indigo-200",
    hoverCls: "hover:bg-indigo-50/30",
    icon: <Info className="w-4 h-4" />,
    label: "Pengumuman",
  },
  {
    accentCls: "border-l-emerald-500",
    numCls: "bg-emerald-50 text-emerald-700",
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
    badgeCls: "bg-emerald-50 text-emerald-700 border-emerald-200",
    hoverCls: "hover:bg-emerald-50/30",
    icon: <CheckCircle className="w-4 h-4" />,
    label: "Update",
  },
  {
    accentCls: "border-l-amber-500",
    numCls: "bg-amber-50 text-amber-700",
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
    badgeCls: "bg-amber-50 text-amber-700 border-amber-200",
    hoverCls: "hover:bg-amber-50/30",
    icon: <AlertTriangle className="w-4 h-4" />,
    label: "Perhatian",
  },
  {
    accentCls: "border-l-rose-500",
    numCls: "bg-rose-50 text-rose-700",
    iconBg: "bg-rose-50",
    iconColor: "text-rose-600",
    badgeCls: "bg-rose-50 text-rose-700 border-rose-200",
    hoverCls: "hover:bg-rose-50/30",
    icon: <Bell className="w-4 h-4" />,
    label: "Penting",
  },
];

export default function SiswaInformasi() {
  const [pengumuman, setPengumuman] = useState<Announcement[]>([]);

  const fetchInformasi = async () => {
    try {
      const res = await fetch("/api/informasi");
      const data = await res.json();
      setPengumuman(data);
    } catch (error) {
      console.error("Gagal mengambil data:", error);
    }
  };

  useEffect(() => {
    fetchInformasi();
  }, []);

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-slate-100 px-4 sm:px-6 lg:px-8 py-6">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 mb-5 text-[11px]">
            <span className="text-gray-400">absensipkl</span>
            <ChevronRight className="w-3 h-3 text-gray-300" />
            <span className="text-gray-400">dashboard</span>
            <ChevronRight className="w-3 h-3 text-gray-300" />
            <span className="font-semibold text-gray-700">informasi</span>
          </nav>

          {/* ── Hero Banner ── */}
          <div className="relative bg-[#1e2d5a] rounded-2xl overflow-hidden mb-5 p-6 sm:p-8">
            <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-[#2d4070] opacity-70 pointer-events-none" />
            <div className="absolute -bottom-12 right-20 w-36 h-36 rounded-full bg-[#253660] opacity-60 pointer-events-none" />
            <div className="absolute top-5 right-32 w-16 h-16 rounded-full bg-[#3a5090] opacity-40 pointer-events-none" />
            <div className="absolute -top-5 left-[58%] w-56 h-56 rounded-full border border-white/5 pointer-events-none" />
            <div className="absolute top-4 right-8 grid grid-cols-5 gap-1.5 opacity-20 pointer-events-none">
              {Array.from({ length: 15 }).map((_, i) => (
                <div key={i} className="w-1 h-1 rounded-full bg-white" />
              ))}
            </div>

            <div className="relative z-10 flex items-start justify-between gap-4 mb-6">
              <span className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-3 py-1.5 text-[11px] font-semibold text-white/90 tracking-wide">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Informasi PKL Aktif
              </span>
            </div>

            <div className="relative z-10 mb-6">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
                Informasi PKL
              </h1>
              <p className="text-sm text-white/55 max-w-md leading-relaxed">
                Lihat pengumuman &amp; informasi terkini terkait Program Kerja
                Lapangan kamu.
              </p>
            </div>

            <div className="relative z-10 grid grid-cols-3 gap-3">
              {[
                {
                  icon: <BarChart2 className="w-3.5 h-3.5" />,
                  val: pengumuman.length,
                  label: "TOTAL INFORMASI",
                },
                {
                  icon: <FileText className="w-3.5 h-3.5" />,
                  val: pengumuman.length,
                  label: "PENGUMUMAN",
                },
                {
                  icon: <Calendar className="w-3.5 h-3.5" />,
                  val:
                    pengumuman.length > 0
                      ? formatTanggalShort(pengumuman[0].tanggal)
                      : "—",
                  label: "DIPOSTING TERBARU",
                  small: true,
                },
              ].map((st, i) => (
                <div
                  key={i}
                  className="bg-white/[0.08] border border-white/10 rounded-2xl p-4"
                >
                  <div className="w-7 h-7 rounded-lg bg-white/[0.12] flex items-center justify-center mb-3 text-white/75">
                    {st.icon}
                  </div>
                  <div
                    className={`font-bold text-white leading-none ${st.small ? "text-base mt-1" : "text-2xl"}`}
                  >
                    {st.val}
                  </div>
                  <div className="text-[10px] font-semibold text-white/45 mt-1.5 tracking-wider">
                    {st.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Ticker Strip */}
          {pengumuman.length > 0 && (
            <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-2xl px-4 py-3 mb-4 shadow-sm">
              <div className="shrink-0 w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-indigo-600" />
              </div>
              <p className="flex-1 text-[12px] text-gray-600 truncate">
                <span className="font-semibold text-gray-800">Terbaru: </span>
                {pengumuman[0].judul} — {formatTanggal(pengumuman[0].tanggal)}
              </p>
              <span className="shrink-0 text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 px-2.5 py-1 rounded-full">
                Baru
              </span>
            </div>
          )}

          {/* Main Card */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 pt-5 pb-0 border-b border-gray-100">
              <div className="flex items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shadow-sm">
                    <Bell className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="font-bold text-gray-800 text-base">
                      Daftar Informasi PKL
                    </h2>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      Pengumuman &amp; informasi terkini seputar PKL
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Live
                  </span>
                  <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-full">
                    {pengumuman.length} item
                  </span>
                </div>
              </div>
              <div className="flex -mb-px">
                {["Semua", "Pengumuman", "Penting"].map((tab, i) => (
                  <button
                    key={tab}
                    className={`px-5 py-2.5 text-[12px] font-semibold border-b-2 transition-colors whitespace-nowrap ${i === 0 ? "text-indigo-600 border-indigo-500" : "text-gray-400 border-transparent hover:text-gray-600"}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {pengumuman.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center px-6">
                <div className="w-20 h-20 rounded-full border-2 border-dashed border-gray-200 flex items-center justify-center mb-5">
                  <div className="w-14 h-14 rounded-full bg-gray-50 flex items-center justify-center">
                    <Megaphone className="w-6 h-6 text-gray-300" />
                  </div>
                </div>
                <p className="font-bold text-gray-700 text-sm mb-1.5">
                  Belum ada informasi
                </p>
                <p className="text-gray-400 text-[12px] max-w-xs leading-relaxed">
                  Pengumuman dari guru atau admin akan tampil di sini.
                </p>
              </div>
            ) : (
              <div>
                {pengumuman.map((p, idx) => {
                  const s = ITEM_STYLES[idx % ITEM_STYLES.length];
                  const isLast = idx === pengumuman.length - 1;
                  return (
                    <div
                      key={p.id}
                      className={`group relative flex items-start gap-4 px-6 py-5 border-l-[3px] ${s.accentCls} ${s.hoverCls} transition-all duration-150 ${!isLast ? "border-b border-gray-100" : ""}`}
                    >
                      <span
                        className={`shrink-0 mt-0.5 w-7 h-7 rounded-lg text-[11px] font-bold flex items-center justify-center ${s.numCls}`}
                      >
                        {String(idx + 1).padStart(2, "0")}
                      </span>
                      <div
                        className={`shrink-0 mt-0.5 w-9 h-9 rounded-xl ${s.iconBg} flex items-center justify-center`}
                      >
                        <span className={s.iconColor}>{s.icon}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1.5">
                          <span
                            className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full border ${s.badgeCls}`}
                          >
                            {s.label}
                          </span>
                          <span className="flex items-center gap-1 text-[11px] text-gray-400">
                            <Calendar className="w-3 h-3" />
                            {formatTanggal(p.tanggal)}
                          </span>
                          <span className="w-1 h-1 rounded-full bg-gray-300" />
                          <span className="text-[11px] text-gray-400">
                            Admin PKL
                          </span>
                        </div>
                        <h4 className="font-bold text-gray-800 text-sm leading-snug mb-1.5">
                          {p.judul}
                        </h4>
                        <p className="text-gray-500 text-[12.5px] leading-relaxed whitespace-pre-wrap">
                          {p.isi}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {pengumuman.length > 0 && (
              <div className="flex items-center gap-2 px-6 py-4 bg-slate-50 border-t border-gray-100">
                <Clock className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-[11px] text-gray-400">Menampilkan</span>
                <span className="w-1 h-1 rounded-full bg-gray-300" />
                <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg">
                  {pengumuman.length} informasi aktif
                </span>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
