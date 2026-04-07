"use client";
import Sidebar from "@/components/layout/SidebarAdmin";
import TopBar from "@/components/layout/TopBar";
import GreetingBanner from "@/components/GreetingBanner";
import { useState, useEffect, useMemo } from "react";
import {
  Users,
  TrendingUp,
  CheckCircle2,
  XCircle,
  BookOpen,
  Activity,
  Award,
  AlertTriangle,
  CalendarDays,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  WifiOff,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  CartesianGrid,
} from "recharts";

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

const TrendTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs shadow-lg">
      <p className="font-semibold text-gray-500 mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} className="font-medium m-0" style={{ color: p.fill }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
};

const Sk = ({ h = "h-5" }: { h?: string }) => (
  <div className={`w-full ${h} rounded-xl bg-white/10 animate-pulse`} />
);

const CLASS_CONFIGS = [
  { bar: "#38bdf8", badge: "bg-sky-100 text-sky-700" },
  { bar: "#34d399", badge: "bg-emerald-100 text-emerald-700" },
  { bar: "#fbbf24", badge: "bg-amber-100 text-amber-700" },
  { bar: "#a78bfa", badge: "bg-violet-100 text-violet-700" },
  { bar: "#f472b6", badge: "bg-pink-100 text-pink-700" },
  { bar: "#2dd4bf", badge: "bg-teal-100 text-teal-700" },
];

function ClassRow({ item, index }: { item: any; index: number }) {
  const cfg = CLASS_CONFIGS[index % CLASS_CONFIGS.length];
  const izin =
    item.izin ??
    Math.max(0, (item.total || 0) - (item.hadir || 0) - (item.tidakHadir || 0));
  const p = item.persentase || 0;
  const initial = (item.kelas || "?").substring(0, 3).toUpperCase();

  return (
    <div className="flex items-center gap-4 p-3.5 rounded-2xl bg-slate-50 hover:bg-white hover:shadow-md border border-transparent hover:border-slate-200 transition-all duration-200 cursor-default group">
      <div
        className={`w-11 h-11 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${cfg.badge}`}
      >
        {initial}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-gray-800 truncate">{item.kelas}</p>
        <div className="flex items-center gap-3 mt-0.5 text-[11px] text-gray-400">
          <span>{item.hadir ?? 0} hadir</span>
          <span>·</span>
          <span>{izin} izin</span>
          <span>·</span>
          <span>{item.tidakHadir ?? 0} alfa</span>
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-24 h-1.5 rounded-full bg-slate-200 overflow-hidden hidden sm:block">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${p}%`, background: cfg.bar }}
          />
        </div>
        <span
          className="text-sm font-black min-w-[42px] text-right"
          style={{ color: cfg.bar }}
        >
          {p}%
        </span>
      </div>
      <div className="text-right shrink-0 hidden sm:block">
        <p className="text-xs text-gray-400">Total</p>
        <p className="text-sm font-bold text-gray-700">{item.total}</p>
      </div>
    </div>
  );
}

const DEFAULT_TREND: TrendDay[] = [
  { day: "Sen", hadir: 0, absen: 0 },
  { day: "Sel", hadir: 0, absen: 0 },
  { day: "Rab", hadir: 0, absen: 0 },
  { day: "Kam", hadir: 0, absen: 0 },
  { day: "Jum", hadir: 0, absen: 0 },
  { day: "Sab", hadir: 0, absen: 0 },
  { day: "Min", hadir: 0, absen: 0 },
];

interface TrendDay {
  day: string;
  hadir: number;
  absen: number;
}

interface DashboardCards {
  totalSiswa: number;
  hadirHariIni: number;
  izin: number;
  tidakHadir: number;
  persentaseKehadiran: number;
}

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardCards>({
    totalSiswa: 0,
    hadirHariIni: 0,
    izin: 0,
    tidakHadir: 0,
    persentaseKehadiran: 0,
  });
  const [classData, setClassData] = useState<any[]>([]);
  const [trendData, setTrendData] = useState<TrendDay[]>(DEFAULT_TREND);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/dashboard?t=${Date.now()}`);
      if (res.status === 401) {
        setError("Sesi tidak valid. Silakan login ulang.");
        return;
      }
      if (!res.ok) {
        setError(`Gagal memuat data (${res.status}). Coba refresh halaman.`);
        return;
      }

      const data = await res.json();

      if (data.cards) {
        setStats({
          totalSiswa: data.cards.totalSiswa ?? 0,
          hadirHariIni: data.cards.hadirHariIni ?? 0,
          izin: data.cards.izin ?? 0,
          tidakHadir: data.cards.tidakHadir ?? 0,
          persentaseKehadiran: data.cards.persentaseKehadiran ?? 0,
        });
      }

      if (data.table) setClassData(data.table);
      if (Array.isArray(data.trend) && data.trend.length > 0) {
        setTrendData(data.trend);
      }
    } catch (e) {
      console.error("Dashboard fetch error:", e);
      setError("Koneksi gagal. Pastikan jaringan aktif dan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const izin = stats.izin;
  const pct = stats.persentaseKehadiran;

  const donutData = useMemo(
    () =>
      [
        { name: "Hadir", value: stats.hadirHariIni },
        { name: "Izin/Sakit", value: izin },
        { name: "Tidak Hadir", value: stats.tidakHadir },
      ].filter((d) => d.value > 0),
    [stats, izin],
  );

  const bestClass =
    classData.length > 0
      ? classData.reduce(
          (a, b) => (a.persentase > b.persentase ? a : b),
          classData[0],
        )
      : null;
  const worstClass =
    classData.length > 0
      ? classData.reduce(
          (a, b) => (a.persentase < b.persentase ? a : b),
          classData[0],
        )
      : null;

  const hariIni = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  if (error) {
    return (
      <div className="flex h-screen bg-slate-100 overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <TopBar />
          <main className="flex-1 flex items-center justify-center p-8">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 max-w-md w-full text-center">
              <div className="w-14 h-14 rounded-2xl bg-rose-100 flex items-center justify-center mx-auto mb-4">
                <WifiOff size={24} className="text-rose-500" />
              </div>
              <h2 className="text-lg font-bold text-slate-800 mb-2">
                Gagal Memuat Dashboard
              </h2>
              <p className="text-sm text-slate-500 mb-5">{error}</p>
              <button
                onClick={fetchData}
                className="flex items-center gap-2 mx-auto bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-700 transition-colors"
              >
                <RefreshCw size={15} />
                Coba Lagi
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-5 lg:p-8 bg-slate-100">
          <GreetingBanner />
          <div className="relative rounded-3xl overflow-hidden mb-5 shadow-xl">
            <div className="absolute inset-0 bg-gradient-to-br from-[#0f172a] via-[#1e3a5f] to-[#0f2744]" />
            <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-sky-500/10 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-12 left-20 w-48 h-48 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
            <div className="absolute top-1/2 right-1/3 w-32 h-32 rounded-full bg-emerald-500/5 blur-2xl pointer-events-none" />
            <div
              className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
                backgroundSize: "32px 32px",
              }}
            />

            <div className="relative p-6 lg:p-8">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center">
                      <Activity size={15} className="text-sky-300" />
                    </div>
                    <span className="text-[11px] font-semibold text-sky-300 uppercase tracking-widest">
                      Dashboard Admin
                    </span>
                  </div>
                  <h1 className="text-2xl font-black text-white mb-1">
                    Ringkasan Kehadiran Hari Ini
                  </h1>
                  <p className="text-sm text-slate-400 flex items-center gap-1.5">
                    <CalendarDays size={13} />
                    {hariIni}
                  </p>
                </div>
                <div className="bg-white/10 border border-white/15 rounded-2xl px-6 py-4 text-center backdrop-blur-sm">
                  <p className="text-4xl font-black text-white leading-none">
                    {loading ? "—" : `${pct}%`}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">rata-rata hadir</p>
                </div>
              </div>

              {/* 4 Stat Items */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  {
                    icon: <Users size={18} />,
                    num: stats.totalSiswa,
                    label: "Total Siswa",
                    sub: "Terdaftar",
                    color: "from-sky-500/20 to-sky-500/5",
                    border: "border-sky-500/20",
                    iconBg: "bg-sky-500/20",
                    iconColor: "text-sky-300",
                    numColor: "text-sky-100",
                    badge: null,
                  },
                  {
                    icon: <CheckCircle2 size={18} />,
                    num: stats.hadirHariIni,
                    label: "Hadir",
                    sub: "Hari ini",
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
                    sub: "Hari ini",
                    color: "from-amber-500/20 to-amber-500/5",
                    border: "border-amber-500/20",
                    iconBg: "bg-amber-500/20",
                    iconColor: "text-amber-300",
                    numColor: "text-amber-100",
                    badge:
                      stats.totalSiswa > 0
                        ? {
                            text: `${Math.round((izin / stats.totalSiswa) * 100)}%`,
                            positive: false,
                          }
                        : null,
                  },
                  {
                    icon: <XCircle size={18} />,
                    num: stats.tidakHadir,
                    label: "Alfa",
                    sub: "Tanpa keterangan",
                    color: "from-rose-500/20 to-rose-500/5",
                    border: "border-rose-500/20",
                    iconBg: "bg-rose-500/20",
                    iconColor: "text-rose-300",
                    numColor: "text-rose-100",
                    badge:
                      stats.totalSiswa > 0
                        ? {
                            text: `${Math.round((stats.tidakHadir / stats.totalSiswa) * 100)}%`,
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
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 mb-5">
            {/* ─── Distribusi Kehadiran  ─── */}
            <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <TrendingUp size={13} className="text-emerald-500" />
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">
                      Distribusi Kehadiran
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">Data hari ini</p>
                </div>
                {!loading && (
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full ${
                      pct >= 80
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-rose-100 text-rose-700"
                    }`}
                  >
                    {pct >= 80 ? "Baik" : "Perlu Perhatian"}
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
                          data={donutData}
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
                          {donutData.map((_, i) => (
                            <Cell key={i} fill={DONUT_COLORS[i]} />
                          ))}
                        </Pie>
                        <Tooltip content={<DonutTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-4xl font-black text-slate-900 leading-none">
                        {pct}%
                      </span>
                      <span className="text-xs text-slate-400 mt-1.5">
                        kehadiran
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2.5">
                    {[
                      {
                        label: "Hadir",
                        val: stats.hadirHariIni,
                        total: stats.totalSiswa,
                        color: "#10b981",
                        bg: "bg-emerald-50",
                        tc: "text-emerald-700",
                        icon: <CheckCircle2 size={14} />,
                      },
                      {
                        label: "Izin / Sakit",
                        val: izin,
                        total: stats.totalSiswa,
                        color: "#f59e0b",
                        bg: "bg-amber-50",
                        tc: "text-amber-700",
                        icon: <BookOpen size={14} />,
                      },
                      {
                        label: "Alfa",
                        val: stats.tidakHadir,
                        total: stats.totalSiswa,
                        color: "#f43f5e",
                        bg: "bg-rose-50",
                        tc: "text-rose-700",
                        icon: <XCircle size={14} />,
                      },
                    ].map((b) => {
                      const pctItem =
                        b.total > 0 ? Math.round((b.val / b.total) * 100) : 0;
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
                            {pctItem}%
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {bestClass && (
                    <div className="mt-4 flex flex-col gap-2 border-t border-slate-100 pt-4">
                      <div className="flex items-center gap-2 bg-emerald-50 rounded-xl px-3 py-2">
                        <Award
                          size={13}
                          className="text-emerald-600 shrink-0"
                        />
                        <span className="text-xs text-emerald-700 truncate">
                          Terbaik: <strong>{bestClass.kelas}</strong> —{" "}
                          {bestClass.persentase}%
                        </span>
                      </div>
                      {worstClass && worstClass.kelas !== bestClass.kelas && (
                        <div className="flex items-center gap-2 bg-rose-50 rounded-xl px-3 py-2">
                          <AlertTriangle
                            size={13}
                            className="text-rose-600 shrink-0"
                          />
                          <span className="text-xs text-rose-700 truncate">
                            Perhatian: <strong>{worstClass.kelas}</strong> —{" "}
                            {worstClass.persentase}%
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="lg:col-span-3 bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <Users size={13} className="text-indigo-500" />
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">
                      Kehadiran Per Kelas
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    {classData.length} kelas aktif
                  </p>
                </div>
                {!loading && (
                  <div className="flex gap-1.5">
                    {[
                      {
                        v: stats.totalSiswa,
                        l: "Total",
                        cls: "bg-indigo-50 text-indigo-700",
                      },
                      {
                        v: stats.hadirHariIni,
                        l: "Hadir",
                        cls: "bg-emerald-50 text-emerald-700",
                      },
                    ].map((s) => (
                      <div
                        key={s.l}
                        className={`${s.cls} rounded-xl px-3 py-1.5 text-center`}
                      >
                        <p className="text-sm font-black leading-none">{s.v}</p>
                        <p className="text-[10px] font-medium opacity-70">
                          {s.l}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {loading ? (
                <div className="flex flex-col gap-3">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className="h-16 rounded-2xl bg-slate-100 animate-pulse"
                    />
                  ))}
                </div>
              ) : classData.length === 0 ? (
                <div className="flex items-center justify-center h-40 text-sm text-slate-400">
                  Tidak ada data kelas.
                </div>
              ) : (
                <>
                  <div className="flex flex-col gap-2.5 mb-5">
                    {classData.slice(0, 6).map((item, i) => (
                      <ClassRow key={i} item={item} index={i} />
                    ))}
                  </div>

                  <div className="grid grid-cols-4 gap-2 bg-slate-50 rounded-2xl p-3">
                    {[
                      {
                        v: stats.totalSiswa,
                        l: "Total",
                        cls: "bg-indigo-100 text-indigo-700",
                        icon: <Users size={13} />,
                      },
                      {
                        v: stats.hadirHariIni,
                        l: "Hadir",
                        cls: "bg-emerald-100 text-emerald-700",
                        icon: <CheckCircle2 size={13} />,
                      },
                      {
                        v: izin,
                        l: "Izin",
                        cls: "bg-amber-100 text-amber-700",
                        icon: <BookOpen size={13} />,
                      },
                      {
                        v: stats.tidakHadir,
                        l: "Alfa",
                        cls: "bg-rose-100 text-rose-700",
                        icon: <XCircle size={13} />,
                      },
                    ].map((s) => (
                      <div
                        key={s.l}
                        className={`${s.cls} rounded-xl py-3 px-2 flex flex-col items-center gap-1`}
                      >
                        {s.icon}
                        <p className="text-lg font-black leading-none">{s.v}</p>
                        <p className="text-[10px] font-semibold opacity-75">
                          {s.l}
                        </p>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <TrendingUp size={13} className="text-indigo-500" />
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">
                  Tren 7 Hari Terakhir
                </span>
              </div>
              <div className="flex gap-4">
                {[
                  { color: "#6366f1", label: "Hadir" },
                  { color: "#fca5a5", label: "Tidak hadir" },
                ].map((l) => (
                  <span
                    key={l.label}
                    className="flex items-center gap-1.5 text-xs text-slate-400"
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-sm inline-block"
                      style={{ background: l.color }}
                    />
                    {l.label}
                  </span>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="h-36 bg-slate-50 rounded-2xl animate-pulse" />
            ) : (
              <div className="h-36">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={trendData}
                    margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
                    barCategoryGap="30%"
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#f1f5f9"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="day"
                      tick={{ fontSize: 11, fill: "#94a3b8" } as any}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={<TrendTooltip />} />
                    <Bar
                      dataKey="hadir"
                      name="Hadir"
                      fill="#6366f1"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={28}
                    />
                    <Bar
                      dataKey="absen"
                      name="Tidak hadir"
                      fill="#fca5a5"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={28}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {!loading &&
              trendData.every((d) => d.hadir === 0 && d.absen === 0) && (
                <p className="text-center text-xs text-slate-400 mt-2">
                  Data tren belum tersedia. Tambahkan endpoint{" "}
                  <code>/api/dashboard?trend=true</code> untuk mengaktifkan
                  fitur ini.
                </p>
              )}
          </div>
        </main>
      </div>
    </div>
  );
}
