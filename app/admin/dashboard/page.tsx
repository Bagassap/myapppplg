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
  AlertTriangle,
  BookOpen,
  Award,
  Activity,
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

/* ── Skeleton loader ── */
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

  /* ── Stat card config ── */
  const statCards = [
    {
      label: "Total Siswa",
      value: loading ? null : stats.totalSiswa,
      icon: <Users className="w-5 h-5" />,
      gradient: "from-[#6366f1] to-[#4f46e5]",
      glow: "rgba(99,102,241,0.35)",
      glowHover: "rgba(99,102,241,0.55)",
      sub: "Terdaftar aktif",
      iconBg: "rgba(255,255,255,0.18)",
    },
    {
      label: "Hadir Hari Ini",
      value: loading ? null : stats.hadirHariIni,
      icon: <CheckCircle2 className="w-5 h-5" />,
      gradient: "from-[#10b981] to-[#0d9488]",
      glow: "rgba(16,185,129,0.35)",
      glowHover: "rgba(16,185,129,0.55)",
      sub: `${pct}% dari total`,
      iconBg: "rgba(255,255,255,0.18)",
    },
    {
      label: "Izin / Sakit",
      value: loading ? null : izin,
      icon: <BookOpen className="w-5 h-5" />,
      gradient: "from-[#f59e0b] to-[#f97316]",
      glow: "rgba(245,158,11,0.35)",
      glowHover: "rgba(245,158,11,0.55)",
      sub: "Keterangan ada",
      iconBg: "rgba(255,255,255,0.18)",
    },
    {
      label: "Alfa",
      value: loading ? null : stats.tidakHadir,
      icon: <XCircle className="w-5 h-5" />,
      gradient: "from-[#f43f5e] to-[#e11d48]",
      glow: "rgba(244,63,94,0.35)",
      glowHover: "rgba(244,63,94,0.55)",
      sub: "Tanpa keterangan",
      iconBg: "rgba(255,255,255,0.18)",
    },
  ];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <main className="flex-1 p-6 sm:p-8 overflow-y-auto overflow-x-hidden">
          <GreetingBanner />

          {/* ═══════════════════════════════════════════
              HERO HEADER — dark gradient, campuran
          ═══════════════════════════════════════════ */}
          <div
            className="relative overflow-hidden rounded-3xl p-7 mb-6 shadow-2xl"
            style={{
              background:
                "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)",
            }}
          >
            {/* decorative orbs */}
            <div
              className="absolute rounded-full pointer-events-none"
              style={{
                width: 280,
                height: 280,
                right: -60,
                top: -100,
                background:
                  "radial-gradient(circle, rgba(99,102,241,0.25) 0%, transparent 70%)",
              }}
            />
            <div
              className="absolute rounded-full pointer-events-none"
              style={{
                width: 180,
                height: 180,
                left: "30%",
                bottom: -80,
                background:
                  "radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%)",
              }}
            />
            <div
              className="absolute rounded-full pointer-events-none"
              style={{
                width: 100,
                height: 100,
                left: 20,
                top: 20,
                background:
                  "radial-gradient(circle, rgba(245,158,11,0.12) 0%, transparent 70%)",
              }}
            />
            {/* grid texture */}
            <div
              className="absolute inset-0 pointer-events-none opacity-5"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.4) 1px, transparent 1px)",
                backgroundSize: "40px 40px",
              }}
            />

            <div className="relative z-10 flex items-start justify-between flex-wrap gap-5">
              <div>
                {/* badge */}
                <span
                  className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full mb-4"
                  style={{
                    background: "rgba(99,102,241,0.2)",
                    color: "#a5b4fc",
                    border: "1px solid rgba(99,102,241,0.35)",
                  }}
                >
                  <Activity className="w-3 h-3" />
                  Dashboard Admin
                </span>
                <p
                  className="text-3xl font-black mb-1 leading-tight"
                  style={{
                    background: "linear-gradient(90deg, #fff 0%, #c7d2fe 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Pantau Kehadiran
                </p>
                <p className="text-sm mb-5" style={{ color: "#94a3b8" }}>
                  {hariIni}
                </p>
                <div className="flex gap-2 flex-wrap">
                  {[
                    {
                      label: `${pct}% hadir`,
                      color: "#34d399",
                      bg: "rgba(52,211,153,0.15)",
                      border: "rgba(52,211,153,0.3)",
                    },
                    {
                      label: `${loading ? "—" : stats.totalSiswa} siswa`,
                      color: "#94a3b8",
                      bg: "rgba(148,163,184,0.1)",
                      border: "rgba(148,163,184,0.2)",
                    },
                    {
                      label: `${loading ? "—" : stats.tidakHadir + izin} tidak hadir`,
                      color: "#fca5a5",
                      bg: "rgba(252,165,165,0.12)",
                      border: "rgba(252,165,165,0.25)",
                    },
                  ].map((b) => (
                    <span
                      key={b.label}
                      className="px-3 py-1 rounded-full text-xs font-semibold"
                      style={{
                        background: b.bg,
                        color: b.color,
                        border: `1px solid ${b.border}`,
                      }}
                    >
                      {b.label}
                    </span>
                  ))}
                </div>
              </div>

              {/* quick stats panel */}
              <div
                className="flex rounded-2xl overflow-hidden"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                {[
                  { v: stats.hadirHariIni, l: "Hadir", c: "#34d399" },
                  { v: izin, l: "Izin", c: "#fbbf24" },
                  { v: stats.tidakHadir, l: "Alfa", c: "#f87171" },
                ].map((s, i) => (
                  <div
                    key={i}
                    className="px-5 py-4 text-center"
                    style={{
                      borderRight:
                        i < 2 ? "1px solid rgba(255,255,255,0.08)" : "none",
                    }}
                  >
                    <p
                      className="text-2xl font-black leading-none"
                      style={{ color: s.c }}
                    >
                      {loading ? "—" : s.v}
                    </p>
                    <p
                      className="text-[10px] mt-1.5 font-medium"
                      style={{ color: "#64748b" }}
                    >
                      {s.l}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ═══════════════════════════════════════════
              STAT CARDS — gradient, hover glow
          ═══════════════════════════════════════════ */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {statCards.map((card, i) => (
              <div
                key={i}
                className={`relative overflow-hidden rounded-2xl p-5 text-white cursor-pointer transition-all duration-300 bg-gradient-to-br ${card.gradient}`}
                style={{
                  boxShadow: `0 8px 24px ${card.glow}`,
                  animationDelay: `${i * 80}ms`,
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.transform =
                    "translateY(-4px) scale(1.02)";
                  (e.currentTarget as HTMLDivElement).style.boxShadow =
                    `0 16px 40px ${card.glowHover}`;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.transform =
                    "translateY(0) scale(1)";
                  (e.currentTarget as HTMLDivElement).style.boxShadow =
                    `0 8px 24px ${card.glow}`;
                }}
              >
                {/* pattern circles */}
                <div
                  className="absolute rounded-full pointer-events-none"
                  style={{
                    width: 100,
                    height: 100,
                    right: -25,
                    top: -25,
                    background: "rgba(255,255,255,0.1)",
                  }}
                />
                <div
                  className="absolute rounded-full pointer-events-none"
                  style={{
                    width: 60,
                    height: 60,
                    right: 10,
                    top: 40,
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                />
                {/* icon */}
                <div
                  className="absolute top-4 right-4 p-2 rounded-xl"
                  style={{
                    background: card.iconBg,
                    backdropFilter: "blur(8px)",
                  }}
                >
                  {card.icon}
                </div>
                <p className="text-[10px] font-bold tracking-widest uppercase opacity-80 mb-2">
                  {card.label}
                </p>
                {loading ? (
                  <div className="h-9 w-16 rounded-lg bg-white/20 animate-pulse mb-2" />
                ) : (
                  <p className="text-4xl font-black leading-none mb-2">
                    {card.value}
                  </p>
                )}
                <p className="text-xs opacity-70">{card.sub}</p>
              </div>
            ))}
          </div>

          {/* ═══════════════════════════════════════════
              DONUT + RINGKASAN + PER KELAS
          ═══════════════════════════════════════════ */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-4">
            {/* left column: donut + summary */}
            <div className="lg:col-span-2 flex flex-col gap-4">
              {/* Donut card */}
              <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-1.5">
                  <TrendingUp className="w-3 h-3 text-emerald-500" />
                  Distribusi kehadiran
                </p>
                {loading ? (
                  <Skeleton className="w-32 h-32 rounded-full mx-auto" />
                ) : (
                  <div className="flex items-center gap-5">
                    <div className="relative w-32 h-32 shrink-0">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={donutData}
                            cx="50%"
                            cy="50%"
                            innerRadius={38}
                            outerRadius={58}
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
                          <span className="text-xs text-gray-600 flex-1">
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

              {/* Summary dark card */}
              <div
                className="rounded-2xl p-5 shadow-lg relative overflow-hidden"
                style={{
                  background:
                    "linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)",
                }}
              >
                <div
                  className="absolute rounded-full pointer-events-none"
                  style={{
                    width: 140,
                    height: 140,
                    right: -40,
                    bottom: -40,
                    background:
                      "radial-gradient(circle, rgba(99,102,241,0.3) 0%, transparent 70%)",
                  }}
                />
                <div className="flex items-center gap-2 mb-3">
                  <Award className="w-4 h-4 text-indigo-400" />
                  <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">
                    Ringkasan
                  </p>
                </div>
                <p className="text-5xl font-black text-white leading-none mb-1">
                  {pct}%
                </p>
                <p className="text-xs text-slate-400 mb-5">
                  Rata-rata kehadiran hari ini
                </p>
                {bestClass && (
                  <div
                    className="border-t pt-4 space-y-2"
                    style={{ borderColor: "rgba(255,255,255,0.1)" }}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
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
                        <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
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

            {/* Per-kelas card */}
            <div className="lg:col-span-3 bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-1.5">
                <Users className="w-3 h-3 text-indigo-500" />
                Kehadiran per kelas
              </p>
              {loading ? (
                <div className="grid grid-cols-2 gap-3">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-24" />
                  ))}
                </div>
              ) : classData.length === 0 ? (
                <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
                  Tidak ada data.
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {classData.map((item, i) => {
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
                          className="rounded-xl p-3.5 relative overflow-hidden border transition-all duration-200 hover:shadow-md cursor-default"
                          style={{ background: th.bg, borderColor: th.border }}
                        >
                          <div
                            className="absolute right-[-14px] bottom-[-14px] w-16 h-16 rounded-full opacity-20 pointer-events-none"
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
                          <div className="flex gap-1.5 mt-2.5 relative z-10">
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
                  {/* summary row */}
                  <div className="flex gap-2">
                    {[
                      {
                        v: stats.totalSiswa,
                        l: "Total",
                        bg: "#f1f5f9",
                        tc: "#475569",
                      },
                      {
                        v: stats.hadirHariIni,
                        l: "Hadir",
                        bg: "#f0fdf4",
                        tc: "#166534",
                      },
                      { v: izin, l: "Izin", bg: "#fefce8", tc: "#854d0e" },
                      {
                        v: stats.tidakHadir,
                        l: "Alfa",
                        bg: "#fef2f2",
                        tc: "#991b1b",
                      },
                    ].map((s) => (
                      <div
                        key={s.l}
                        className="flex-1 rounded-xl py-2.5 text-center"
                        style={{ background: s.bg }}
                      >
                        <p
                          className="text-sm font-black"
                          style={{ color: s.tc }}
                        >
                          {s.v}
                        </p>
                        <p
                          className="text-[9px] mt-0.5"
                          style={{ color: s.tc, opacity: 0.7 }}
                        >
                          {s.l}
                        </p>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* ═══════════════════════════════════════════
              TREND BAR CHART
          ═══════════════════════════════════════════ */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                  <TrendingUp className="w-3 h-3 text-indigo-500" />
                  Tren kehadiran 7 hari terakhir
                </p>
              </div>
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
