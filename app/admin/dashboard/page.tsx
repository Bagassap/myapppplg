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
  ChevronRight,
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

const CLASS_THEMES = [
  {
    bg: "#f0fdf4",
    border: "#bbf7d0",
    av: ["#dcfce7", "#166534"],
    bar: "#10b981",
  },
  {
    bg: "#fefce8",
    border: "#fef08a",
    av: ["#fef9c3", "#854d0e"],
    bar: "#eab308",
  },
  {
    bg: "#fff7ed",
    border: "#fed7aa",
    av: ["#ffedd5", "#9a3412"],
    bar: "#f97316",
  },
  {
    bg: "#fef2f2",
    border: "#fecaca",
    av: ["#fee2e2", "#991b1b"],
    bar: "#f43f5e",
  },
  {
    bg: "#eef2ff",
    border: "#c7d2fe",
    av: ["#e0e7ff", "#3730a3"],
    bar: "#6366f1",
  },
  {
    bg: "#f5f3ff",
    border: "#ddd6fe",
    av: ["#ede9fe", "#5b21b6"],
    bar: "#7c3aed",
  },
];

const DonutTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 rounded-xl px-3 py-2 text-xs shadow-lg">
      <p className="font-semibold text-gray-800">{payload[0].name}</p>
      <p className="text-gray-500">
        Jumlah: <strong className="text-gray-900">{payload[0].value}</strong>
      </p>
    </div>
  );
};

const TrendTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 rounded-xl px-3 py-2 text-xs shadow-lg">
      <p className="font-semibold text-gray-700 mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.fill }} className="font-medium">
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
};

const Skeleton = ({ className }: { className?: string }) => (
  <div className={`animate-pulse rounded-xl bg-gray-100 ${className ?? ""}`} />
);

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSiswa: 0,
    hadirHariIni: 0,
    tidakHadir: 0,
    persentaseKehadiran: 0,
  });
  const [classData, setClassData] = useState<any[]>([]);

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/dashboard?t=${Date.now()}`);
        if (res.ok) {
          const data = await res.json();
          if (data.cards) setStats(data.cards);
          if (data.table) setClassData(data.table);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const izin = useMemo(
    () => Math.max(0, stats.totalSiswa - stats.hadirHariIni - stats.tidakHadir),
    [stats],
  );
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

  const trendData = [
    { day: "Sen", hadir: 0, absen: 0 },
    { day: "Sel", hadir: 0, absen: 0 },
    { day: "Rab", hadir: 0, absen: 0 },
    { day: "Kam", hadir: 0, absen: 0 },
    { day: "Jum", hadir: stats.hadirHariIni, absen: stats.tidakHadir + izin },
    { day: "Sab", hadir: 0, absen: 0 },
    { day: "Min", hadir: 0, absen: 0 },
  ];

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

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <main className="flex-1 p-6 sm:p-8 overflow-y-auto overflow-x-hidden">
          <GreetingBanner />

          {/* ── PAGE HEADER ── */}
          <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-wide uppercase px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100">
                  <Activity className="w-3 h-3" />
                  Dashboard Admin
                </span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 leading-tight">
                Pantau Kehadiran
              </h1>
              <p className="text-sm text-gray-400 mt-0.5">{hariIni}</p>
            </div>
            <div className="flex items-center gap-2">
              {[
                {
                  label: `${pct}% hadir`,
                  color: "text-emerald-700 bg-emerald-50 border-emerald-200",
                },
                {
                  label: `${loading ? "—" : stats.totalSiswa} siswa`,
                  color: "text-gray-500 bg-gray-50 border-gray-200",
                },
              ].map((b) => (
                <span
                  key={b.label}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${b.color}`}
                >
                  {b.label}
                </span>
              ))}
            </div>
          </div>

          {/* ── TOP SECTION: Donut + Summary + Ringkasan ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
            {/* Card 1: Donut Chart */}
            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-1.5">
                <TrendingUp className="w-3 h-3 text-emerald-500" />
                Distribusi kehadiran
              </p>
              {loading ? (
                <Skeleton className="w-32 h-32 rounded-full mx-auto" />
              ) : (
                <div className="flex items-center gap-4">
                  <div className="relative w-32 h-32 shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={donutData}
                          cx="50%"
                          cy="50%"
                          innerRadius={36}
                          outerRadius={56}
                          paddingAngle={3}
                          dataKey="value"
                          startAngle={90}
                          endAngle={-270}
                          animationBegin={0}
                          animationDuration={800}
                        >
                          {donutData.map((_, i) => (
                            <Cell key={i} fill={DONUT_COLORS[i]} />
                          ))}
                        </Pie>
                        <Tooltip content={<DonutTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-xl font-black text-slate-800 leading-none">
                        {pct}%
                      </span>
                      <span className="text-[9px] text-gray-400 mt-0.5 uppercase tracking-wide">
                        hadir
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-3 flex-1">
                    {[
                      {
                        label: "Hadir",
                        val: stats.hadirHariIni,
                        color: "#10b981",
                        bg: "#f0fdf4",
                        tc: "#166534",
                      },
                      {
                        label: "Izin/Sakit",
                        val: izin,
                        color: "#f59e0b",
                        bg: "#fefce8",
                        tc: "#854d0e",
                      },
                      {
                        label: "Alfa",
                        val: stats.tidakHadir,
                        color: "#f43f5e",
                        bg: "#fef2f2",
                        tc: "#991b1b",
                      },
                    ].map((b) => (
                      <div key={b.label} className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-sm shrink-0"
                          style={{ background: b.color }}
                        />
                        <span className="text-xs text-gray-500 flex-1">
                          {b.label}
                        </span>
                        <span
                          className="text-xs font-bold px-2 py-0.5 rounded-full"
                          style={{ background: b.bg, color: b.tc }}
                        >
                          {b.val}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Card 2: Ringkasan angka (2x2 grid) */}
            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-1.5">
                <Users className="w-3 h-3 text-indigo-500" />
                Ringkasan angka
              </p>
              <div className="grid grid-cols-2 gap-3 h-full">
                {[
                  {
                    label: "Total Siswa",
                    value: stats.totalSiswa,
                    icon: <Users className="w-4 h-4" />,
                    bg: "#eef2ff",
                    ic: "#6366f1",
                    tc: "#3730a3",
                    dot: "#6366f1",
                  },
                  {
                    label: "Hadir",
                    value: stats.hadirHariIni,
                    icon: <CheckCircle2 className="w-4 h-4" />,
                    bg: "#f0fdf4",
                    ic: "#10b981",
                    tc: "#166534",
                    dot: "#10b981",
                  },
                  {
                    label: "Izin",
                    value: izin,
                    icon: <BookOpen className="w-4 h-4" />,
                    bg: "#fefce8",
                    ic: "#f59e0b",
                    tc: "#854d0e",
                    dot: "#f59e0b",
                  },
                  {
                    label: "Alfa",
                    value: stats.tidakHadir,
                    icon: <XCircle className="w-4 h-4" />,
                    bg: "#fef2f2",
                    ic: "#f43f5e",
                    tc: "#991b1b",
                    dot: "#f43f5e",
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="rounded-xl p-3.5 flex flex-col gap-2 transition-transform hover:scale-[1.02]"
                    style={{ background: item.bg }}
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ background: "white", color: item.ic }}
                    >
                      {item.icon}
                    </div>
                    {loading ? (
                      <div className="h-7 w-12 rounded-lg animate-pulse bg-white/60" />
                    ) : (
                      <span
                        className="text-2xl font-black leading-none"
                        style={{ color: item.tc }}
                      >
                        {item.value}
                      </span>
                    )}
                    <span
                      className="text-[11px] font-medium"
                      style={{ color: item.tc, opacity: 0.75 }}
                    >
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Card 3: Ringkasan % + best/worst */}
            <div
              className="rounded-2xl p-5 shadow-sm relative overflow-hidden flex flex-col justify-between"
              style={{
                background:
                  "linear-gradient(135deg, #1e1b4b 0%, #312e81 60%, #1e40af 100%)",
              }}
            >
              <div
                className="absolute w-48 h-48 rounded-full pointer-events-none"
                style={{
                  right: -40,
                  bottom: -40,
                  background:
                    "radial-gradient(circle, rgba(99,102,241,0.3) 0%, transparent 70%)",
                }}
              />
              <div
                className="absolute w-24 h-24 rounded-full pointer-events-none"
                style={{
                  left: 20,
                  top: 10,
                  background:
                    "radial-gradient(circle, rgba(52,211,153,0.15) 0%, transparent 70%)",
                }}
              />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <Award className="w-4 h-4 text-indigo-400" />
                  <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">
                    Ringkasan harian
                  </p>
                </div>
                <p className="text-5xl font-black text-white leading-none mb-1">
                  {pct}%
                </p>
                <p className="text-xs text-slate-400 mb-5">
                  Rata-rata kehadiran hari ini
                </p>
                {/* progress bar */}
                <div
                  className="h-1.5 rounded-full overflow-hidden mb-4"
                  style={{ background: "rgba(255,255,255,0.1)" }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${Math.min(pct, 100)}%`,
                      background: "linear-gradient(90deg, #34d399, #6366f1)",
                    }}
                  />
                </div>
              </div>
              {bestClass && (
                <div
                  className="relative z-10 space-y-2 border-t pt-4"
                  style={{ borderColor: "rgba(255,255,255,0.1)" }}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                    <p className="text-xs text-slate-400">
                      Terbaik:{" "}
                      <strong className="text-emerald-400">
                        {bestClass.kelas}
                      </strong>{" "}
                      <span className="text-slate-500">
                        — {bestClass.persentase}%
                      </span>
                    </p>
                  </div>
                  {worstClass && worstClass.kelas !== bestClass.kelas && (
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                      <p className="text-xs text-slate-400">
                        Perhatian:{" "}
                        <strong className="text-red-400">
                          {worstClass.kelas}
                        </strong>{" "}
                        <span className="text-slate-500">
                          — {worstClass.persentase}%
                        </span>
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ── KEHADIRAN PER KELAS ── */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm mb-4">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                <Users className="w-3 h-3 text-indigo-500" />
                Kehadiran per kelas
              </p>
            </div>
            {loading ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-28" />
                ))}
              </div>
            ) : classData.length === 0 ? (
              <div className="flex items-center justify-center h-28 text-gray-400 text-sm">
                Tidak ada data.
              </div>
            ) : (
              <>
                {/* 3 kelas cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-3">
                  {classData.slice(0, 3).map((item, i) => {
                    const th = CLASS_THEMES[i % CLASS_THEMES.length];
                    const barC =
                      item.persentase >= 80
                        ? "#10b981"
                        : item.persentase >= 60
                          ? "#f59e0b"
                          : "#f43f5e";
                    const badgeBg =
                      item.persentase >= 80
                        ? "#f0fdf4"
                        : item.persentase >= 60
                          ? "#fefce8"
                          : "#fef2f2";
                    const badgeTc =
                      item.persentase >= 80
                        ? "#166534"
                        : item.persentase >= 60
                          ? "#854d0e"
                          : "#991b1b";
                    const initials = item.kelas
                      .split(" ")
                      .map((w: string) => w[0])
                      .join("")
                      .slice(0, 2);
                    const izinKelas = Math.max(
                      0,
                      (item.total || 0) -
                        (item.hadir || 0) -
                        (item.tidakHadir || 0),
                    );
                    return (
                      <div
                        key={i}
                        className="rounded-xl p-4 border relative overflow-hidden transition-all duration-200 hover:shadow-md hover:scale-[1.02] cursor-default"
                        style={{ background: th.bg, borderColor: th.border }}
                      >
                        <div
                          className="absolute right-[-14px] bottom-[-14px] w-20 h-20 rounded-full opacity-15 pointer-events-none"
                          style={{ background: th.bar }}
                        />
                        <div className="flex items-center justify-between mb-3 relative z-10">
                          <div className="flex items-center gap-2.5">
                            <div
                              className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold"
                              style={{ background: th.av[0], color: th.av[1] }}
                            >
                              {initials}
                            </div>
                            <div>
                              <p
                                className="text-sm font-semibold"
                                style={{ color: th.av[1] }}
                              >
                                {item.kelas}
                              </p>
                              <p
                                className="text-[11px] opacity-60"
                                style={{ color: th.av[1] }}
                              >
                                {item.hadir}/{item.total} siswa
                              </p>
                            </div>
                          </div>
                          <span
                            className="text-[11px] font-bold px-2.5 py-1 rounded-full"
                            style={{ background: badgeBg, color: badgeTc }}
                          >
                            {item.persentase}%
                          </span>
                        </div>
                        <div
                          className="h-2 rounded-full overflow-hidden relative z-10"
                          style={{ background: "rgba(0,0,0,0.08)" }}
                        >
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{
                              width: `${item.persentase}%`,
                              background: barC,
                            }}
                          />
                        </div>
                        <div className="flex gap-1.5 mt-3 relative z-10">
                          {[
                            {
                              v: item.hadir,
                              l: "hadir",
                              bg: "#f0fdf4",
                              tc: "#166534",
                            },
                            {
                              v: izinKelas,
                              l: "izin",
                              bg: "#fefce8",
                              tc: "#854d0e",
                            },
                            {
                              v: item.tidakHadir || 0,
                              l: "alfa",
                              bg: "#fef2f2",
                              tc: "#991b1b",
                            },
                          ].map((c) => (
                            <span
                              key={c.l}
                              className="text-[10px] font-semibold px-2 py-0.5 rounded-md"
                              style={{ background: c.bg, color: c.tc }}
                            >
                              {c.v} {c.l}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* kelas tambahan jika ada lebih dari 3 */}
                {classData.length > 3 && (
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-3">
                    {classData.slice(3).map((item, i) => {
                      const th = CLASS_THEMES[(i + 3) % CLASS_THEMES.length];
                      const barC =
                        item.persentase >= 80
                          ? "#10b981"
                          : item.persentase >= 60
                            ? "#f59e0b"
                            : "#f43f5e";
                      const badgeBg =
                        item.persentase >= 80
                          ? "#f0fdf4"
                          : item.persentase >= 60
                            ? "#fefce8"
                            : "#fef2f2";
                      const badgeTc =
                        item.persentase >= 80
                          ? "#166534"
                          : item.persentase >= 60
                            ? "#854d0e"
                            : "#991b1b";
                      const initials = item.kelas
                        .split(" ")
                        .map((w: string) => w[0])
                        .join("")
                        .slice(0, 2);
                      const izinKelas = Math.max(
                        0,
                        (item.total || 0) -
                          (item.hadir || 0) -
                          (item.tidakHadir || 0),
                      );
                      return (
                        <div
                          key={i}
                          className="rounded-xl p-3.5 border relative overflow-hidden transition-all duration-200 hover:shadow-md hover:scale-[1.02] cursor-default"
                          style={{ background: th.bg, borderColor: th.border }}
                        >
                          <div
                            className="absolute right-[-10px] bottom-[-10px] w-14 h-14 rounded-full opacity-15 pointer-events-none"
                            style={{ background: th.bar }}
                          />
                          <div className="flex items-center justify-between mb-2.5 relative z-10">
                            <div className="flex items-center gap-2">
                              <div
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-bold"
                                style={{
                                  background: th.av[0],
                                  color: th.av[1],
                                }}
                              >
                                {initials}
                              </div>
                              <div>
                                <p
                                  className="text-xs font-semibold"
                                  style={{ color: th.av[1] }}
                                >
                                  {item.kelas}
                                </p>
                                <p
                                  className="text-[10px] opacity-60"
                                  style={{ color: th.av[1] }}
                                >
                                  {item.hadir}/{item.total}
                                </p>
                              </div>
                            </div>
                            <span
                              className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                              style={{ background: badgeBg, color: badgeTc }}
                            >
                              {item.persentase}%
                            </span>
                          </div>
                          <div
                            className="h-1.5 rounded-full overflow-hidden relative z-10"
                            style={{ background: "rgba(0,0,0,0.08)" }}
                          >
                            <div
                              className="h-full rounded-full transition-all duration-700"
                              style={{
                                width: `${item.persentase}%`,
                                background: barC,
                              }}
                            />
                          </div>
                          <div className="flex gap-1.5 mt-2 relative z-10">
                            {[
                              {
                                v: item.hadir,
                                l: "hadir",
                                bg: "#f0fdf4",
                                tc: "#166534",
                              },
                              {
                                v: izinKelas,
                                l: "izin",
                                bg: "#fefce8",
                                tc: "#854d0e",
                              },
                              {
                                v: item.tidakHadir || 0,
                                l: "alfa",
                                bg: "#fef2f2",
                                tc: "#991b1b",
                              },
                            ].map((c) => (
                              <span
                                key={c.l}
                                className="text-[9px] font-semibold px-1.5 py-0.5 rounded-md"
                                style={{ background: c.bg, color: c.tc }}
                              >
                                {c.v} {c.l}
                              </span>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Global summary row */}
                <div className="grid grid-cols-4 gap-2">
                  {[
                    {
                      v: stats.totalSiswa,
                      l: "Total",
                      icon: <Users className="w-4 h-4" />,
                      bg: "#f1f5f9",
                      ic: "#64748b",
                      tc: "#475569",
                    },
                    {
                      v: stats.hadirHariIni,
                      l: "Hadir",
                      icon: <CheckCircle2 className="w-4 h-4" />,
                      bg: "#f0fdf4",
                      ic: "#10b981",
                      tc: "#166534",
                    },
                    {
                      v: izin,
                      l: "Izin",
                      icon: <BookOpen className="w-4 h-4" />,
                      bg: "#fefce8",
                      ic: "#f59e0b",
                      tc: "#854d0e",
                    },
                    {
                      v: stats.tidakHadir,
                      l: "Alfa",
                      icon: <XCircle className="w-4 h-4" />,
                      bg: "#fef2f2",
                      ic: "#f43f5e",
                      tc: "#991b1b",
                    },
                  ].map((s) => (
                    <div
                      key={s.l}
                      className="rounded-xl py-3 px-3 flex items-center gap-2.5 transition-transform hover:scale-[1.02]"
                      style={{ background: s.bg }}
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: "white", color: s.ic }}
                      >
                        {s.icon}
                      </div>
                      <div>
                        <p
                          className="text-sm font-black leading-none"
                          style={{ color: s.tc }}
                        >
                          {s.v}
                        </p>
                        <p
                          className="text-[10px] mt-0.5"
                          style={{ color: s.tc, opacity: 0.7 }}
                        >
                          {s.l}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* ── TREND BAR CHART ── */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                <TrendingUp className="w-3 h-3 text-indigo-500" />
                Tren kehadiran 7 hari terakhir
              </p>
              <div className="flex gap-3">
                {[
                  { color: "#6366f1", label: "Hadir" },
                  { color: "#fecaca", label: "Tidak hadir" },
                ].map((l) => (
                  <span
                    key={l.label}
                    className="flex items-center gap-1.5 text-xs text-gray-400"
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-sm"
                      style={{ background: l.color }}
                    />
                    {l.label}
                  </span>
                ))}
              </div>
            </div>
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
                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<TrendTooltip />} />
                  <Bar
                    dataKey="hadir"
                    name="Hadir"
                    fill="#6366f1"
                    radius={[5, 5, 0, 0]}
                    maxBarSize={32}
                  />
                  <Bar
                    dataKey="absen"
                    name="Tidak hadir"
                    fill="#fecaca"
                    radius={[5, 5, 0, 0]}
                    maxBarSize={32}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
