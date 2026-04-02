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
  BookOpen,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  CalendarDays,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
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

const Sk = ({ h = "h-5" }: { h?: string }) => (
  <div className={`w-full ${h} rounded-xl bg-slate-100 animate-pulse`} />
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

  const sudahAbsen = stats.hadirBulanIni > 0;

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

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-5 lg:p-8 bg-slate-100">
          <GreetingBanner />

          {/* ═══ CARD 1 — HERO OVERVIEW (navy dark, identik admin/guru) ═══ */}
          <div className="relative rounded-3xl overflow-hidden mb-5 shadow-xl">
            <div className="absolute inset-0 bg-gradient-to-br from-[#0f172a] via-[#1e3a5f] to-[#0f2744]" />
            {/* Orbs */}
            <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-12 left-20 w-48 h-48 rounded-full bg-sky-500/10 blur-3xl pointer-events-none" />
            <div className="absolute top-1/2 right-1/3 w-32 h-32 rounded-full bg-indigo-500/5 blur-2xl pointer-events-none" />
            {/* Grid overlay */}
            <div
              className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
                backgroundSize: "32px 32px",
              }}
            />

            <div className="relative p-6 lg:p-8">
              {/* Header row */}
              <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center">
                      <BookOpen size={15} className="text-emerald-300" />
                    </div>
                    <span className="text-[11px] font-semibold text-emerald-300 uppercase tracking-widest">
                      Dashboard Siswa
                    </span>
                  </div>
                  <h1 className="text-2xl font-black text-white mb-1">
                    Rekap Kehadiran PKL Bulan Ini
                  </h1>
                  <p className="text-sm text-slate-400 flex items-center gap-1.5">
                    <CalendarDays size={13} />
                    {hariIni}
                  </p>
                </div>

                {/* Pct + status pill */}
                <div className="flex flex-col items-end gap-2">
                  <div className="bg-white/10 border border-white/15 rounded-2xl px-6 py-4 text-center backdrop-blur-sm">
                    <p className="text-4xl font-black text-white leading-none">
                      {loading ? "—" : `${pct}%`}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">kehadiran</p>
                  </div>
                  <div
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[11px] font-semibold ${
                      sudahAbsen
                        ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-300"
                        : "bg-amber-500/20 border-amber-500/30 text-amber-300"
                    }`}
                  >
                    {sudahAbsen ? (
                      <CheckCircle2 size={12} />
                    ) : (
                      <Clock size={12} />
                    )}
                    {sudahAbsen
                      ? "Sudah absen hari ini"
                      : "Belum absen hari ini"}
                  </div>
                </div>
              </div>

              {/* 4 Stat items — identik pola admin/guru */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  {
                    icon: <CalendarDays size={18} />,
                    num: stats.totalHariBulanIni,
                    label: "Total Hari",
                    sub: "Bulan ini",
                    color: "from-sky-500/20 to-sky-500/5",
                    border: "border-sky-500/20",
                    iconBg: "bg-sky-500/20",
                    iconColor: "text-sky-300",
                    numColor: "text-sky-100",
                    badge: null,
                  },
                  {
                    icon: <CheckCircle2 size={18} />,
                    num: stats.hadirBulanIni,
                    label: "Hadir",
                    sub: "Bulan ini",
                    color: "from-emerald-500/20 to-emerald-500/5",
                    border: "border-emerald-500/20",
                    iconBg: "bg-emerald-500/20",
                    iconColor: "text-emerald-300",
                    numColor: "text-emerald-100",
                    badge: { text: `${pct}%`, positive: true },
                  },
                  {
                    icon: <BookOpen size={18} />,
                    num: izin,
                    label: "Izin / Sakit",
                    sub: "Dengan keterangan",
                    color: "from-amber-500/20 to-amber-500/5",
                    border: "border-amber-500/20",
                    iconBg: "bg-amber-500/20",
                    iconColor: "text-amber-300",
                    numColor: "text-amber-100",
                    badge:
                      stats.totalHariBulanIni > 0
                        ? {
                            text: `${Math.round((izin / stats.totalHariBulanIni) * 100)}%`,
                            positive: false,
                          }
                        : null,
                  },
                  {
                    icon: <XCircle size={18} />,
                    num: stats.tidakHadirBulanIni,
                    label: "Alfa",
                    sub: "Tanpa keterangan",
                    color: "from-rose-500/20 to-rose-500/5",
                    border: "border-rose-500/20",
                    iconBg: "bg-rose-500/20",
                    iconColor: "text-rose-300",
                    numColor: "text-rose-100",
                    badge:
                      stats.totalHariBulanIni > 0
                        ? {
                            text: `${Math.round((stats.tidakHadirBulanIni / stats.totalHariBulanIni) * 100)}%`,
                            positive: false,
                          }
                        : null,
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className={`bg-gradient-to-br ${item.color} border ${item.border} rounded-2xl p-4 backdrop-blur-sm`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div
                        className={`w-9 h-9 ${item.iconBg} rounded-xl flex items-center justify-center`}
                      >
                        <span className={item.iconColor}>{item.icon}</span>
                      </div>
                      {item.badge && (
                        <span
                          className={`flex items-center gap-0.5 text-[11px] font-bold px-2 py-0.5 rounded-full ${
                            item.badge.positive
                              ? "bg-emerald-500/20 text-emerald-300"
                              : "bg-rose-500/20 text-rose-300"
                          }`}
                        >
                          {item.badge.positive ? (
                            <ArrowUpRight size={10} />
                          ) : (
                            <ArrowDownRight size={10} />
                          )}
                          {item.badge.text}
                        </span>
                      )}
                    </div>
                    <p
                      className={`text-3xl font-black leading-none mb-1 ${item.numColor}`}
                    >
                      {loading ? "—" : item.num}
                    </p>
                    <p className="text-sm font-semibold text-slate-300">
                      {item.label}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">{item.sub}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ═══ CARD 2 + 3 ROW ═══ */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
            {/* ─── CARD 2: Distribusi Kehadiran (Donut) ─── */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <TrendingUp size={13} className="text-emerald-500" />
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">
                      Distribusi Bulan Ini
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">Rekap kehadiran kamu</p>
                </div>
                {!loading && (
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full ${
                      pct >= 80
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-rose-100 text-rose-700"
                    }`}
                  >
                    {pct >= 80 ? "Target Tercapai" : "Di Bawah Target"}
                  </span>
                )}
              </div>

              {loading ? (
                <div className="flex flex-col items-center gap-4">
                  <div className="w-44 h-44 rounded-full bg-slate-100 animate-pulse" />
                  <Sk h="h-8" />
                  <Sk h="h-8" />
                  <Sk h="h-8" />
                </div>
              ) : (
                <>
                  <div className="relative w-full h-52 mb-6">
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
                          innerRadius={68}
                          outerRadius={94}
                          paddingAngle={4}
                          dataKey="value"
                          startAngle={90}
                          endAngle={-270}
                          animationBegin={0}
                          animationDuration={900}
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
                      <span className="text-4xl font-black text-slate-900 leading-none">
                        {pct}%
                      </span>
                      <span className="text-xs text-slate-400 mt-1.5">
                        hadir
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2.5">
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
                          className={`flex items-center gap-3 ${b.bg} rounded-2xl px-4 py-3`}
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

            {/* ─── CARD 3: Progress Target + Motivasi ─── */}
            <div className="flex flex-col gap-4">
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex-1">
                <div className="flex items-center gap-2 mb-5">
                  <ShieldCheck size={13} className="text-indigo-500" />
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">
                    Progress Target
                  </span>
                </div>

                {loading ? (
                  <div className="flex flex-col gap-3">
                    <Sk h="h-10" />
                    <Sk h="h-3" />
                    <Sk />
                    <Sk />
                    <Sk />
                  </div>
                ) : (
                  <>
                    <div className="flex items-baseline gap-2 mb-2">
                      <span
                        className={`text-5xl font-black leading-none ${
                          pct >= 80
                            ? "text-emerald-600"
                            : pct >= 60
                              ? "text-amber-600"
                              : "text-rose-600"
                        }`}
                      >
                        {pct}%
                      </span>
                      <span className="text-sm text-slate-400">
                        dari target 80%
                      </span>
                    </div>

                    <div className="relative h-3 bg-slate-100 rounded-full overflow-hidden mb-1.5">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${Math.min(pct, 100)}%`,
                          background:
                            pct >= 80
                              ? "#10b981"
                              : pct >= 60
                                ? "#f59e0b"
                                : "#f43f5e",
                        }}
                      />
                      <div
                        className="absolute top-0 bottom-0 w-0.5 bg-indigo-400/60"
                        style={{ left: "80%" }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400 mb-5">
                      <span>0%</span>
                      <span className="text-indigo-500 font-semibold">
                        ▲ Target 80%
                      </span>
                      <span>100%</span>
                    </div>

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
                            ? Math.round(
                                (b.val / stats.totalHariBulanIni) * 100,
                              )
                            : 0;
                        return (
                          <div key={b.label}>
                            <div className="flex justify-between items-center mb-1.5">
                              <span className="text-xs font-medium text-slate-500">
                                {b.label}
                              </span>
                              <span
                                className="text-xs font-bold"
                                style={{ color: b.color }}
                              >
                                {b.val} hari · {bPct}%
                              </span>
                            </div>
                            <div
                              className={`h-2 rounded-full ${b.bg} overflow-hidden`}
                            >
                              <div
                                className="h-full rounded-full transition-all duration-700"
                                style={{
                                  width: `${bPct}%`,
                                  background: b.color,
                                }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>

              {/* Motivasi — white card konsisten */}
              {!loading && (
                <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200 flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                      pct >= 90
                        ? "bg-emerald-500"
                        : pct >= 80
                          ? "bg-indigo-500"
                          : "bg-amber-500"
                    }`}
                  >
                    <ShieldCheck size={22} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-slate-800 mb-0.5">
                      {motivasiText.title}
                    </p>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {motivasiText.body}
                    </p>
                  </div>
                  <div
                    className={`shrink-0 px-4 py-3 rounded-2xl text-right ${
                      pct >= 90
                        ? "bg-emerald-50"
                        : pct >= 80
                          ? "bg-indigo-50"
                          : "bg-amber-50"
                    }`}
                  >
                    <p
                      className={`text-2xl font-black leading-none ${
                        pct >= 90
                          ? "text-emerald-700"
                          : pct >= 80
                            ? "text-indigo-700"
                            : "text-amber-700"
                      }`}
                    >
                      {pct}%
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      dari 80%
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ═══ INFORMASI TERBARU ═══ */}
          <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <Bell size={14} className="text-emerald-600" />
                </div>
                <span className="text-sm font-bold text-slate-800">
                  Informasi Terbaru
                </span>
              </div>
              <a
                href="/siswa/informasi"
                className="flex items-center gap-1 text-xs text-emerald-700 font-semibold bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1.5 hover:bg-emerald-100 transition-colors no-underline"
              >
                Lihat semua <ChevronRight size={13} />
              </a>
            </div>

            <div>
              {loadingInfo ? (
                <div className="p-8 flex justify-center">
                  <div className="w-6 h-6 border-2 border-slate-200 border-t-emerald-500 rounded-full animate-spin" />
                </div>
              ) : informasiList.length === 0 ? (
                <div className="py-12 flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center">
                    <Bell size={18} className="text-emerald-300" />
                  </div>
                  <p className="text-sm text-slate-400">
                    Belum ada informasi terbaru.
                  </p>
                  <p className="text-xs text-slate-300">
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
                      className={`flex items-start gap-3 px-5 py-4 cursor-pointer hover:bg-slate-50 transition-colors ${!isLast ? "border-b border-slate-100" : ""}`}
                    >
                      <div
                        className={`w-8 h-8 rounded-xl ${config.iconCls} flex items-center justify-center shrink-0 mt-0.5`}
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
                            <span className="text-xs text-slate-400">
                              {item.tempatPKL}
                            </span>
                          )}
                          <span className="text-xs text-slate-400 ml-auto">
                            {formatTanggal(item.tanggal)}
                          </span>
                        </div>
                        <p
                          className={`text-sm font-semibold text-slate-800 mb-0.5 ${isExpanded ? "" : "truncate"}`}
                        >
                          {item.judul}
                        </p>
                        <p
                          className={`text-xs text-slate-500 leading-relaxed ${isExpanded ? "" : "truncate"}`}
                        >
                          {item.isi}
                        </p>
                      </div>
                      <ChevronRight
                        size={15}
                        className={`text-slate-300 shrink-0 mt-1 transition-transform duration-200 ${isExpanded ? "rotate-90" : ""}`}
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
