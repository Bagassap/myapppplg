"use client";
import Sidebar from "@/components/layout/SidebarSiswa";
import GreetingBanner from "@/components/GreetingBanner";
import TopBar from "@/components/layout/TopBar";
import { useState, useEffect } from "react";
import {
  Bell,
  ChevronRight,
  Megaphone,
  Info,
  AlertCircle,
  TrendingUp,
  Target,
  BookOpen,
  CheckCircle2,
  XCircle,
  Star,
  Flame,
  CalendarCheck,
  ShieldCheck,
} from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

interface Informasi {
  id: number;
  judul: string;
  isi: string;
  tanggal: string;
  tipe: string;
  tempatPKL?: string | null;
  createdAt: string;
}

const DONUT_COLORS = ["#10b981", "#f59e0b", "#f43f5e"];

const DonutTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs shadow-lg">
      <p className="font-semibold text-gray-800 mb-0.5">{payload[0].name}</p>
      <p className="text-gray-500 m-0">
        Jumlah: <strong className="text-gray-800">{payload[0].value}</strong>
      </p>
    </div>
  );
};

const Sk = () => (
  <div className="w-full h-5 rounded-lg bg-gray-100 animate-pulse" />
);

const getTipeConfig = (tipe: string) => {
  switch (tipe?.toLowerCase()) {
    case "pengumuman":
      return {
        icon: <Megaphone size={14} />,
        pill: "bg-amber-50 text-amber-700 border-amber-200",
        iconCls: "bg-amber-50 text-amber-600",
      };
    case "peringatan":
      return {
        icon: <AlertCircle size={14} />,
        pill: "bg-rose-50 text-rose-700 border-rose-200",
        iconCls: "bg-rose-50 text-rose-600",
      };
    default:
      return {
        icon: <Info size={14} />,
        pill: "bg-emerald-50 text-emerald-700 border-emerald-200",
        iconCls: "bg-emerald-50 text-emerald-600",
      };
  }
};

const formatTanggal = (t: string) =>
  new Date(t).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

/* ── Info Card solid Tailwind ── */
const INFO_CARD_CONFIGS = [
  {
    bg: "bg-emerald-500",
    hover: "hover:bg-emerald-600",
    text: "text-white",
    iconBg: "bg-emerald-600",
  },
  {
    bg: "bg-indigo-500",
    hover: "hover:bg-indigo-600",
    text: "text-white",
    iconBg: "bg-indigo-600",
  },
  {
    bg: "bg-amber-400",
    hover: "hover:bg-amber-500",
    text: "text-white",
    iconBg: "bg-amber-500",
  },
  {
    bg: "bg-rose-500",
    hover: "hover:bg-rose-600",
    text: "text-white",
    iconBg: "bg-rose-600",
  },
];

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
      } catch (e) {
        console.error(e);
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
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingInfo(false);
      }
    };
    fetchDashboard();
    fetchInformasi();
  }, []);

  const izin = Math.max(
    0,
    stats.totalHariBulanIni - stats.hadirBulanIni - stats.tidakHadirBulanIni,
  );
  const pct = stats.persentaseKehadiran;
  const donutData = [
    { name: "Hadir", value: stats.hadirBulanIni },
    { name: "Izin/Sakit", value: izin },
    { name: "Tidak Hadir", value: stats.tidakHadirBulanIni },
  ].filter((d) => d.value > 0);

  const hariIni = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const pctColor = pct >= 80 ? "#10b981" : pct >= 60 ? "#f59e0b" : "#f43f5e";
  const pctBadge =
    pct >= 80
      ? "bg-emerald-100 text-emerald-700"
      : pct >= 60
        ? "bg-amber-100 text-amber-700"
        : "bg-rose-100 text-rose-700";
  const pctTc =
    pct >= 80
      ? "text-emerald-700"
      : pct >= 60
        ? "text-amber-700"
        : "text-rose-700";

  const motivasiText =
    pct >= 90
      ? {
          title: "Luar biasa! 🏆",
          body: "Kehadiranmu sudah melampaui 90%. Pertahankan!",
        }
      : pct >= 80
        ? {
            title: "Bagus sekali! 🎉",
            body: "Kamu sudah mencapai target. Terus jaga konsistensinya!",
          }
        : {
            title: "Ayo semangat! 💪",
            body: `Butuh ${80 - pct}% lagi untuk mencapai target 80% kehadiran.`,
          };

  /* Motivasi banner — solid bg ONLY */
  const motivasiBg =
    pct >= 90 ? "bg-emerald-500" : pct >= 80 ? "bg-indigo-500" : "bg-amber-400";
  const motivasiFoot =
    pct >= 90 ? "bg-emerald-600" : pct >= 80 ? "bg-indigo-600" : "bg-amber-500";

  const infoCards = [
    {
      label: "Kehadiran Bulan Ini",
      val: `${pct}%`,
      sub: `${stats.hadirBulanIni} dari ${stats.totalHariBulanIni} hari`,
      icon: <TrendingUp size={20} />,
      pct,
      cfg: INFO_CARD_CONFIGS[0],
    },
    {
      label: "Target Kehadiran",
      val: "80%",
      sub: pct >= 80 ? "Target tercapai! 🎉" : `Sisa ${80 - pct}% lagi`,
      icon: <Target size={20} />,
      pct: 80,
      cfg: pct >= 80 ? INFO_CARD_CONFIGS[1] : INFO_CARD_CONFIGS[2],
    },
    {
      label: "Total Izin",
      val: `${izin} hari`,
      sub: "Dengan keterangan",
      icon: <BookOpen size={20} />,
      pct:
        stats.totalHariBulanIni > 0
          ? Math.round((izin / stats.totalHariBulanIni) * 100)
          : 0,
      cfg: INFO_CARD_CONFIGS[2],
    },
    {
      label: "Total Alfa",
      val: `${stats.tidakHadirBulanIni} hari`,
      sub: "Tanpa keterangan",
      icon: <XCircle size={20} />,
      pct:
        stats.totalHariBulanIni > 0
          ? Math.round(
              (stats.tidakHadirBulanIni / stats.totalHariBulanIni) * 100,
            )
          : 0,
      cfg: INFO_CARD_CONFIGS[3],
    },
  ];

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-5 lg:p-8 bg-slate-100">
          <GreetingBanner />

          {/* ── Hero Banner — solid indigo ── */}
          <div className="bg-indigo-600 rounded-2xl p-6 mb-5 shadow-lg relative overflow-hidden">
            {/* Decorative circles menggunakan border trick */}
            <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full border-[32px] border-indigo-500 opacity-40" />
            <div className="absolute right-16 -bottom-10 w-28 h-28 rounded-full border-[24px] border-indigo-500 opacity-30" />

            {/* Top */}
            <div className="flex flex-wrap items-start justify-between gap-4 mb-6 relative">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-indigo-500 border-2 border-indigo-400 flex items-center justify-center shrink-0">
                  <BookOpen size={24} className="text-white" />
                </div>
                <div>
                  <div className="inline-flex items-center gap-1 bg-indigo-500 px-3 py-1 rounded-full mb-2">
                    <span className="text-[11px] font-semibold text-indigo-100">
                      Dashboard Siswa
                    </span>
                  </div>
                  <p className="text-xl font-bold text-white mb-0.5">
                    Rekap Kehadiran PKL
                  </p>
                  <p className="text-sm text-indigo-200">{hariIni}</p>
                </div>
              </div>
              {/* Percentage */}
              <div className="bg-indigo-500 border border-indigo-400 rounded-2xl px-5 py-3 text-center">
                <p className="text-3xl font-black text-white leading-none">
                  {loading ? "—" : `${pct}%`}
                </p>
                <p className="text-xs text-indigo-200 mt-1">kehadiran</p>
              </div>
            </div>

            {/* Bottom quick stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 relative">
              {[
                {
                  v: stats.totalHariBulanIni,
                  l: "Total Hari",
                  icon: <CalendarCheck size={16} className="text-indigo-200" />,
                },
                {
                  v: stats.hadirBulanIni,
                  l: "Hadir",
                  icon: <CheckCircle2 size={16} className="text-indigo-200" />,
                },
                {
                  v: izin,
                  l: "Izin / Sakit",
                  icon: <BookOpen size={16} className="text-indigo-200" />,
                },
                {
                  v: stats.tidakHadirBulanIni,
                  l: "Alfa",
                  icon: <XCircle size={16} className="text-indigo-200" />,
                },
              ].map((b) => (
                <div
                  key={b.l}
                  className="bg-indigo-500 border border-indigo-400 rounded-xl p-3 flex flex-col items-center gap-1.5"
                >
                  {b.icon}
                  <p className="text-2xl font-black text-white leading-none">
                    {loading ? "—" : b.v}
                  </p>
                  <p className="text-[10px] text-indigo-200 text-center">
                    {b.l}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* ── 4 Info Cards — solid colors ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 mb-4">
            {infoCards.map((card) => (
              <div
                key={card.label}
                className={`${card.cfg.bg} ${card.cfg.hover} ${card.cfg.text} rounded-2xl overflow-hidden shadow-md hover:shadow-xl hover:scale-[1.02] transition-all duration-200 cursor-default`}
              >
                <div className="p-5">
                  <div
                    className={`w-10 h-10 ${card.cfg.iconBg} rounded-xl flex items-center justify-center mb-4`}
                  >
                    {card.icon}
                  </div>
                  <p className="text-[11px] font-semibold opacity-80 mb-1 uppercase tracking-wide">
                    {card.label}
                  </p>
                  <p className="text-2xl font-black leading-none mb-1">
                    {loading ? "—" : card.val}
                  </p>
                  <p className="text-xs opacity-75 mb-4">{card.sub}</p>
                  {/* Mini progress */}
                  <div className="h-1.5 rounded-full bg-white/30 overflow-hidden">
                    <div
                      className="h-full bg-white/75 rounded-full transition-all duration-700"
                      style={{ width: `${Math.min(card.pct, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ── Donut | Progress ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Donut */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-5">
                <TrendingUp size={13} className="text-emerald-500" />
                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">
                  Distribusi Bulan Ini
                </span>
              </div>

              {loading ? (
                <div className="flex flex-col items-center gap-4">
                  <div className="w-40 h-40 rounded-full bg-gray-100 animate-pulse" />
                  <Sk />
                  <Sk />
                  <Sk />
                </div>
              ) : (
                <>
                  <div className="relative w-full h-48 mb-5">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={
                            donutData.length > 0
                              ? donutData
                              : [{ name: "Kosong", value: 1 }]
                          }
                          cx="50%"
                          cy="50%"
                          innerRadius={54}
                          outerRadius={80}
                          paddingAngle={4}
                          dataKey="value"
                          startAngle={90}
                          endAngle={-270}
                          animationBegin={0}
                          animationDuration={800}
                        >
                          {(donutData.length > 0
                            ? donutData
                            : [{ name: "Kosong", value: 1 }]
                          ).map((_, i) => (
                            <Cell
                              key={i}
                              fill={
                                donutData.length > 0
                                  ? DONUT_COLORS[i]
                                  : "#e5e7eb"
                              }
                            />
                          ))}
                        </Pie>
                        {donutData.length > 0 && (
                          <Tooltip content={<DonutTooltip />} />
                        )}
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-3xl font-black text-gray-900 leading-none">
                        {pct}%
                      </span>
                      <span className="text-xs text-gray-400 mt-1">hadir</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    {[
                      {
                        label: "Hadir",
                        val: stats.hadirBulanIni,
                        bg: "bg-emerald-50",
                        tc: "text-emerald-700",
                        icon: <CheckCircle2 size={14} />,
                      },
                      {
                        label: "Izin / Sakit",
                        val: izin,
                        bg: "bg-amber-50",
                        tc: "text-amber-700",
                        icon: <BookOpen size={14} />,
                      },
                      {
                        label: "Alfa",
                        val: stats.tidakHadirBulanIni,
                        bg: "bg-rose-50",
                        tc: "text-rose-700",
                        icon: <XCircle size={14} />,
                      },
                    ].map((b) => {
                      const bPct =
                        stats.totalHariBulanIni > 0
                          ? Math.round((b.val / stats.totalHariBulanIni) * 100)
                          : 0;
                      return (
                        <div
                          key={b.label}
                          className={`flex items-center gap-3 ${b.bg} rounded-xl px-3.5 py-2.5`}
                        >
                          <span className={b.tc}>{b.icon}</span>
                          <span
                            className={`text-sm font-semibold ${b.tc} flex-1`}
                          >
                            {b.label}
                          </span>
                          <span className={`text-xl font-black ${b.tc}`}>
                            {b.val}
                          </span>
                          <span
                            className={`text-[11px] font-semibold ${b.tc} bg-black/5 px-2 py-0.5 rounded-full`}
                          >
                            {bPct}%
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            {/* Progress */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col">
              <div className="flex items-center gap-2 mb-5">
                <Target size={13} className="text-indigo-500" />
                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">
                  Progres Kehadiran
                </span>
              </div>

              {/* Big progress */}
              <div className="mb-5">
                <div className="flex justify-between items-baseline mb-2">
                  <span className="text-sm font-medium text-gray-500">
                    Total kehadiran
                  </span>
                  <span className={`text-2xl font-black ${pctTc}`}>{pct}%</span>
                </div>
                <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden mb-2">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${Math.min(pct, 100)}%`,
                      background: pctColor,
                    }}
                  />
                  {/* Target marker */}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-indigo-400 opacity-60"
                    style={{ left: "80%" }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-gray-400">
                  <span>0%</span>
                  <span className="text-indigo-500 font-semibold">
                    ▲ Target 80%
                  </span>
                  <span>100%</span>
                </div>
                {!loading && (
                  <p
                    className={`text-xs font-semibold ${pctTc} mt-2 text-center`}
                  >
                    {pct >= 80
                      ? "Anda sudah melampaui target! 🎉"
                      : `Butuh ${80 - pct}% lagi untuk mencapai target`}
                  </p>
                )}
              </div>

              <div className="border-t border-gray-100 pt-5 mb-5">
                <div className="flex flex-col gap-3.5">
                  {[
                    {
                      label: "Hadir",
                      val: stats.hadirBulanIni,
                      color: "#10b981",
                      bg: "bg-emerald-50",
                    },
                    {
                      label: "Izin / Sakit",
                      val: izin,
                      color: "#f59e0b",
                      bg: "bg-amber-50",
                    },
                    {
                      label: "Alfa",
                      val: stats.tidakHadirBulanIni,
                      color: "#f43f5e",
                      bg: "bg-rose-50",
                    },
                  ].map((b) => {
                    const bPct =
                      stats.totalHariBulanIni > 0
                        ? Math.round((b.val / stats.totalHariBulanIni) * 100)
                        : 0;
                    return (
                      <div key={b.label}>
                        <div className="flex justify-between items-center mb-1.5">
                          <div className="flex items-center gap-2">
                            <span
                              className="w-2 h-2 rounded-full inline-block"
                              style={{ background: b.color }}
                            />
                            <span className="text-xs font-medium text-gray-500">
                              {b.label}
                            </span>
                          </div>
                          <span
                            className="text-xs font-bold"
                            style={{ color: b.color }}
                          >
                            {loading ? "—" : `${b.val} hari (${bPct}%)`}
                          </span>
                        </div>
                        <div
                          className={`h-2 rounded-full ${b.bg} overflow-hidden`}
                        >
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${bPct}%`, background: b.color }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Grade + Flame */}
              <div className="grid grid-cols-2 gap-2 mt-auto">
                <div className="bg-fuchsia-50 border border-fuchsia-100 rounded-xl py-3 flex flex-col items-center gap-1.5">
                  <Flame size={20} className="text-fuchsia-500" />
                  <p className="text-lg font-black text-fuchsia-600 leading-none">
                    {stats.hadirBulanIni > 0 ? `${stats.hadirBulanIni}×` : "—"}
                  </p>
                  <p className="text-[10px] text-fuchsia-500 text-center">
                    Hadir bulan ini
                  </p>
                </div>
                <div className="bg-amber-50 border border-amber-100 rounded-xl py-3 flex flex-col items-center gap-1.5">
                  <Star size={20} className="text-amber-500" />
                  <p className="text-lg font-black text-amber-600 leading-none">
                    {pct >= 80 ? "A" : pct >= 60 ? "B" : "C"}
                  </p>
                  <p className="text-[10px] text-amber-500 text-center">
                    Grade kehadiran
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ── Motivasi Banner — solid ── */}
          {!loading && (
            <div
              className={`${motivasiBg} rounded-2xl p-5 mb-4 flex items-center gap-4 shadow-md relative overflow-hidden`}
            >
              <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full border-[20px] border-white/10" />
              <div
                className={`w-12 h-12 ${motivasiFoot} rounded-2xl flex items-center justify-center shrink-0`}
              >
                <ShieldCheck size={24} className="text-white" />
              </div>
              <div className="flex-1">
                <p className="text-base font-bold text-white mb-0.5">
                  {motivasiText.title}
                </p>
                <p className="text-sm text-white/80">{motivasiText.body}</p>
              </div>
              <div
                className={`${motivasiFoot} rounded-xl px-4 py-2.5 text-center shrink-0`}
              >
                <p className="text-2xl font-black text-white leading-none">
                  {pct}%
                </p>
                <p className="text-[10px] text-white/75 mt-0.5">dari 80%</p>
              </div>
            </div>
          )}

          {/* ── Informasi ── */}
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <Bell size={13} className="text-emerald-600" />
                </div>
                <span className="text-sm font-semibold text-gray-800">
                  Informasi Terbaru
                </span>
              </div>
              <a
                href="/siswa/informasi"
                className="flex items-center gap-1 text-xs text-emerald-700 font-medium bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1.5 hover:bg-emerald-100 transition-colors no-underline"
              >
                Lihat semua <ChevronRight size={13} />
              </a>
            </div>

            <div>
              {loadingInfo ? (
                <div className="p-8 flex justify-center">
                  <div className="w-6 h-6 border-2 border-gray-200 border-t-emerald-500 rounded-full animate-spin" />
                </div>
              ) : informasiList.length === 0 ? (
                <div className="py-12 flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                    <Bell size={18} className="text-emerald-300" />
                  </div>
                  <p className="text-sm text-gray-400">
                    Belum ada informasi terbaru.
                  </p>
                  <p className="text-xs text-gray-300">
                    Pengumuman baru akan muncul di sini.
                  </p>
                </div>
              ) : (
                informasiList.map((item, idx) => {
                  const config = getTipeConfig(item.tipe);
                  const isExpanded = expandedId === item.id;
                  const isLast = idx === informasiList.length - 1;
                  return (
                    <div
                      key={item.id}
                      onClick={() => setExpandedId(isExpanded ? null : item.id)}
                      className={`flex items-start gap-3 px-5 py-4 cursor-pointer hover:bg-gray-50 transition-colors ${!isLast ? "border-b border-gray-100" : ""}`}
                    >
                      <div
                        className={`w-8 h-8 rounded-lg ${config.iconCls} flex items-center justify-center shrink-0 mt-0.5`}
                      >
                        {config.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span
                            className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${config.pill}`}
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
                        <p
                          className={`text-sm font-semibold text-gray-800 mb-0.5 ${isExpanded ? "" : "truncate"}`}
                        >
                          {item.judul}
                        </p>
                        <p
                          className={`text-xs text-gray-500 leading-relaxed ${isExpanded ? "" : "truncate"}`}
                        >
                          {item.isi}
                        </p>
                      </div>
                      <ChevronRight
                        size={15}
                        className={`text-gray-300 shrink-0 mt-1 transition-transform duration-200 ${isExpanded ? "rotate-90" : ""}`}
                      />
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
