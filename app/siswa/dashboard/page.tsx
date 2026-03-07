"use client";
import Sidebar from "@/components/layout/SidebarSiswa";
import GreetingBanner from "@/components/GreetingBanner";
import TopBar from "@/components/layout/TopBar";
import { useState, useEffect } from "react";
import {
  CheckCircle,
  XCircle,
  TrendingUp,
  Calendar,
  Bell,
  ChevronRight,
  Megaphone,
  Info,
  AlertCircle,
} from "lucide-react";

interface Informasi {
  id: number;
  judul: string;
  isi: string;
  tanggal: string;
  tipe: string;
  tempatPKL?: string | null;
  createdAt: string;
}

// ── Tipe badge config (logic asli dipertahankan) ──────────────────────────────
const getTipeConfig = (tipe: string) => {
  switch (tipe?.toLowerCase()) {
    case "pengumuman":
      return {
        icon: <Megaphone className="w-3.5 h-3.5" />,
        pill: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
        iconBg: "bg-amber-50 ring-1 ring-amber-200",
        iconText: "text-amber-600",
      };
    case "peringatan":
      return {
        icon: <AlertCircle className="w-3.5 h-3.5" />,
        pill: "bg-red-50 text-red-700 ring-1 ring-red-200",
        iconBg: "bg-red-50 ring-1 ring-red-200",
        iconText: "text-red-600",
      };
    default:
      return {
        icon: <Info className="w-3.5 h-3.5" />,
        pill: "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200",
        iconBg: "bg-indigo-50 ring-1 ring-indigo-200",
        iconText: "text-indigo-600",
      };
  }
};

const formatTanggal = (tanggal: string) =>
  new Date(tanggal).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

export default function SiswaDashboard() {
  const [loading, setLoading] = useState(true);
  const [loadingInfo, setLoadingInfo] = useState(true);
  const [informasiList, setInformasiList] = useState<Informasi[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const [stats, setStats] = useState({
    totalHariBulanIni: 0,
    hadirBulanIni: 0,
    tidakHadirBulanIni: 0,
    persentaseKehadiran: 0,
  });

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await fetch("/api/dashboard");
        if (res.ok) {
          const data = await res.json();
          setStats(
            data.cards || {
              totalHariBulanIni: 0,
              hadirBulanIni: 0,
              tidakHadirBulanIni: 0,
              persentaseKehadiran: 0,
            },
          );
        }
      } catch (error) {
        console.error("Gagal mengambil data dashboard", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchInformasi = async () => {
      try {
        const res = await fetch("/api/informasi");
        if (res.ok) {
          const data = await res.json();
          setInformasiList(Array.isArray(data) ? data.slice(0, 5) : []);
        }
      } catch (error) {
        console.error("Gagal mengambil informasi", error);
      } finally {
        setLoadingInfo(false);
      }
    };

    fetchDashboard();
    fetchInformasi();
  }, []);

  // ── Stat card definitions (sama persis dengan admin style) ───────────────────
  const statCards = [
    {
      icon: <Calendar className="w-5 h-5 text-blue-600" />,
      label: "Total Hari Kerja",
      value: stats.totalHariBulanIni,
      suffix: "",
      bg: "from-blue-50 to-blue-100",
      border: "border-blue-200",
      iconBg: "bg-blue-50 ring-1 ring-blue-200",
      text: "text-blue-600",
      badgeLabel: "Bulan Ini",
      badge: "text-blue-400",
    },
    {
      icon: <CheckCircle className="w-5 h-5 text-emerald-600" />,
      label: "Hari Hadir",
      value: stats.hadirBulanIni,
      suffix: "",
      bg: "from-emerald-50 to-emerald-100",
      border: "border-emerald-200",
      iconBg: "bg-emerald-50 ring-1 ring-emerald-200",
      text: "text-emerald-600",
      badgeLabel: "Hadir",
      badge: "text-emerald-400",
    },
    {
      icon: <XCircle className="w-5 h-5 text-red-500" />,
      label: "Hari Tidak Hadir",
      value: stats.tidakHadirBulanIni,
      suffix: "",
      bg: "from-red-50 to-red-100",
      border: "border-red-200",
      iconBg: "bg-red-50 ring-1 ring-red-200",
      text: "text-red-500",
      badgeLabel: "Absen",
      badge: "text-red-400",
    },
    {
      icon: <TrendingUp className="w-5 h-5 text-indigo-600" />,
      label: "Persentase Kehadiran",
      value: stats.persentaseKehadiran,
      suffix: "%",
      bg: "from-indigo-50 to-blue-100",
      border: "border-indigo-200",
      iconBg: "bg-indigo-50 ring-1 ring-indigo-200",
      text: "text-indigo-600",
      badgeLabel: "Persentase",
      badge: "text-indigo-400",
    },
  ];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-gray-50 px-4 sm:px-6 lg:px-8 py-7">
          {/* ── Greeting + subtitle ── */}
          <GreetingBanner />
          <p className="text-gray-500 text-sm sm:text-base -mt-4 mb-7">
            Pantau ringkasan kehadiran pribadi Anda di tempat PKL.
          </p>

          {/* ── Statistik Cards (identik dengan admin) ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
            {statCards.map((card, i) => (
              <div
                key={i}
                className={`bg-gradient-to-br ${card.bg} p-5 rounded-2xl border ${card.border} shadow-sm`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2 rounded-xl ${card.iconBg}`}>
                    {card.icon}
                  </div>
                  <span className={`text-xs font-medium ${card.badge}`}>
                    {card.badgeLabel}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mb-1">{card.label}</p>
                <p className={`text-2xl sm:text-3xl font-bold ${card.text}`}>
                  {loading ? (
                    <span className="text-gray-300 animate-pulse">—</span>
                  ) : (
                    `${card.value}${card.suffix}`
                  )}
                </p>
              </div>
            ))}
          </div>

          {/* ── Progress Kehadiran ── */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-500" />
                Progres Kehadiran Bulan Ini
              </h3>
              <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-full">
                {loading ? "—" : `${stats.persentaseKehadiran}%`}
              </span>
            </div>
            {/* Progress bar */}
            <div className="w-full bg-gray-100 rounded-full h-2 mb-3">
              <div
                className="bg-indigo-500 h-2 rounded-full transition-all duration-700"
                style={{
                  width: loading
                    ? "0%"
                    : `${Math.min(stats.persentaseKehadiran, 100)}%`,
                }}
              />
            </div>
            {/* Mini stat row */}
            <div className="grid grid-cols-3 gap-3 mt-3">
              {[
                {
                  label: "Total Hari",
                  val: stats.totalHariBulanIni,
                  color: "text-blue-600",
                },
                {
                  label: "Hadir",
                  val: stats.hadirBulanIni,
                  color: "text-emerald-600",
                },
                {
                  label: "Tidak Hadir",
                  val: stats.tidakHadirBulanIni,
                  color: "text-red-500",
                },
              ].map((s) => (
                <div
                  key={s.label}
                  className="text-center p-2.5 bg-gray-50 rounded-xl border border-gray-100"
                >
                  <p className={`text-lg font-bold ${s.color}`}>
                    {loading ? <span className="text-gray-300">—</span> : s.val}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Informasi Terbaru ── */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            {/* Header bar */}
            <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold text-gray-700 text-sm flex items-center gap-2">
                <Bell className="w-4 h-4 text-indigo-500" />
                Informasi Terbaru
              </h3>
              <a
                href="/siswa/informasi"
                className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium transition-colors bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-full"
              >
                Lihat Semua <ChevronRight className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="divide-y divide-gray-50">
              {loadingInfo ? (
                <div className="p-8 flex justify-center">
                  <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-indigo-500" />
                </div>
              ) : informasiList.length === 0 ? (
                <div className="py-14 flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mb-3">
                    <Bell className="w-5 h-5 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-500 font-medium">
                    Belum ada informasi terbaru.
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Pengumuman baru akan muncul di sini.
                  </p>
                </div>
              ) : (
                informasiList.map((item) => {
                  const config = getTipeConfig(item.tipe);
                  const isExpanded = expandedId === item.id;
                  return (
                    <div
                      key={item.id}
                      className="px-5 py-4 hover:bg-gray-50 transition-colors cursor-pointer group"
                      onClick={() => setExpandedId(isExpanded ? null : item.id)}
                    >
                      <div className="flex items-start gap-3">
                        {/* Icon */}
                        <div
                          className={`shrink-0 mt-0.5 w-8 h-8 rounded-xl flex items-center justify-center ${config.iconBg} ${config.iconText}`}
                        >
                          {config.icon}
                        </div>
                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span
                              className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full ${config.pill}`}
                            >
                              {item.tipe || "Umum"}
                            </span>
                            {item.tempatPKL && (
                              <span className="text-xs text-gray-400">
                                {item.tempatPKL}
                              </span>
                            )}
                            <span className="text-xs text-gray-400 ml-auto">
                              {formatTanggal(item.tanggal)}
                            </span>
                          </div>
                          <p className="font-semibold text-gray-800 text-sm truncate">
                            {item.judul}
                          </p>
                          {isExpanded ? (
                            <p className="text-sm text-gray-600 mt-1.5 leading-relaxed whitespace-pre-line">
                              {item.isi}
                            </p>
                          ) : (
                            <p className="text-xs text-gray-500 mt-0.5 truncate">
                              {item.isi}
                            </p>
                          )}
                        </div>
                        {/* Chevron */}
                        <ChevronRight
                          className={`w-4 h-4 text-gray-300 shrink-0 mt-1 transition-transform group-hover:text-gray-400 ${isExpanded ? "rotate-90" : ""}`}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
