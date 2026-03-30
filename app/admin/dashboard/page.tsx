"use client";
import Sidebar from "@/components/layout/SidebarAdmin";
import TopBar from "@/components/layout/TopBar";
import GreetingBanner from "@/components/GreetingBanner";
import { useState, useEffect, useMemo } from "react";
import { Users, TrendingUp } from "lucide-react";
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

          {/* Hero Banner — slate-800/900, sama dengan absensi */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 p-6 shadow-xl mb-5">
            <div className="absolute w-64 h-64 rounded-full right-[-50px] top-[-80px] bg-emerald-500/10 pointer-events-none" />
            <div className="absolute w-40 h-40 rounded-full left-[32%] bottom-[-60px] bg-indigo-500/8 pointer-events-none" />
            <div className="absolute w-20 h-20 rounded-full left-3 top-3 bg-amber-500/8 pointer-events-none" />
            <div className="relative z-10 flex items-end justify-between flex-wrap gap-4">
              <div>
                <p className="text-slate-400 text-xs mb-1">{hariIni}</p>
                <p className="text-white text-sm mb-3">
                  Pantau statistik kehadiran siswa hari ini
                </p>
                <div className="flex gap-2 flex-wrap">
                  <span
                    className="px-3 py-1 rounded-full text-xs font-semibold border"
                    style={{
                      background: "rgba(52,211,153,.15)",
                      color: "#34d399",
                      borderColor: "rgba(52,211,153,.25)",
                    }}
                  >
                    {pct}% hadir
                  </span>
                  <span
                    className="px-3 py-1 rounded-full text-xs font-semibold border"
                    style={{
                      background: "rgba(203,213,225,.1)",
                      color: "#94a3b8",
                      borderColor: "rgba(203,213,225,.2)",
                    }}
                  >
                    {loading ? "—" : stats.totalSiswa} siswa
                  </span>
                  <span
                    className="px-3 py-1 rounded-full text-xs font-semibold border"
                    style={{
                      background: "rgba(252,165,165,.12)",
                      color: "#fca5a5",
                      borderColor: "rgba(252,165,165,.2)",
                    }}
                  >
                    {loading ? "—" : stats.tidakHadir + izin} tidak hadir
                  </span>
                </div>
              </div>
              <div
                className="flex gap-px rounded-xl overflow-hidden border"
                style={{
                  background: "rgba(255,255,255,.07)",
                  borderColor: "rgba(255,255,255,.1)",
                }}
              >
                {[
                  { v: stats.hadirHariIni, l: "Hadir", c: "#34d399" },
                  { v: izin, l: "Izin", c: "#fbbf24" },
                  { v: stats.tidakHadir, l: "Alfa", c: "#f87171" },
                ].map((s, i) => (
                  <div
                    key={i}
                    className="px-4 py-3 text-center"
                    style={{
                      borderRight:
                        i < 2 ? "1px solid rgba(255,255,255,.08)" : "none",
                    }}
                  >
                    <p
                      className="text-xl font-black leading-none"
                      style={{ color: s.c }}
                    >
                      {loading ? "—" : s.v}
                    </p>
                    <p className="text-[10px] mt-1 text-slate-400">{s.l}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Donut + Per Kelas */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-4">
            <div className="lg:col-span-2 grid grid-rows-2 gap-4">
              <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                  <TrendingUp className="w-3 h-3 text-emerald-500" /> Distribusi
                </p>
                {loading ? (
                  <div className="w-32 h-32 rounded-full bg-gray-100 animate-pulse mx-auto" />
                ) : (
                  <div className="flex items-center gap-4">
                    <div className="relative w-28 h-28 shrink-0">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={donutData}
                            cx="50%"
                            cy="50%"
                            innerRadius={34}
                            outerRadius={52}
                            paddingAngle={3}
                            dataKey="value"
                            startAngle={90}
                            endAngle={-270}
                          >
                            {donutData.map((_, i) => (
                              <Cell key={i} fill={DONUT_COLORS[i]} />
                            ))}
                          </Pie>
                          <Tooltip content={<DonutTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-lg font-black text-slate-800 leading-none">
                          {pct}%
                        </span>
                        <span className="text-[9px] text-gray-400 mt-0.5">
                          hadir
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 flex-1">
                      {[
                        {
                          label: "Hadir",
                          val: stats.hadirHariIni,
                          color: "#10b981",
                        },
                        { label: "Izin/Sakit", val: izin, color: "#f59e0b" },
                        {
                          label: "Alfa",
                          val: stats.tidakHadir,
                          color: "#f43f5e",
                        },
                      ].map((b) => (
                        <div key={b.label} className="flex items-center gap-2">
                          <span
                            className="w-2 h-2 rounded-sm shrink-0"
                            style={{ background: b.color }}
                          />
                          <span className="text-xs text-gray-600 flex-1">
                            {b.label}
                          </span>
                          <span className="text-xs font-bold text-gray-800">
                            {b.val}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="rounded-2xl p-5 bg-gradient-to-br from-slate-800 to-slate-900 shadow-lg">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                  Ringkasan
                </p>
                <p className="text-4xl font-black text-white leading-none mb-1">
                  {pct}%
                </p>
                <p className="text-xs text-slate-400 mb-4">
                  Rata-rata kehadiran hari ini
                </p>
                {bestClass && (
                  <div className="text-xs text-slate-500 border-t border-white/10 pt-3 space-y-1.5">
                    <p>
                      Terbaik:{" "}
                      <strong className="text-emerald-400">
                        {bestClass.kelas}
                      </strong>{" "}
                      — {bestClass.persentase}%
                    </p>
                    {worstClass && worstClass.kelas !== bestClass.kelas && (
                      <p>
                        Perhatian:{" "}
                        <strong className="text-red-400">
                          {worstClass.kelas}
                        </strong>{" "}
                        — {worstClass.persentase}%
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="lg:col-span-3 bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-1.5">
                <Users className="w-3 h-3 text-emerald-500" /> Kehadiran per
                kelas
              </p>
              {loading ? (
                <div className="grid grid-cols-2 gap-3">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className="h-24 bg-gray-100 rounded-xl animate-pulse"
                    />
                  ))}
                </div>
              ) : classData.length === 0 ? (
                <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
                  Tidak ada data.
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-3 mb-3">
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
                      const alfaKelas = item.tidakHadir || 0;
                      return (
                        <div
                          key={i}
                          className="rounded-xl p-3 relative overflow-hidden border"
                          style={{ background: th.bg, borderColor: th.border }}
                        >
                          <div
                            className="absolute right-[-12px] bottom-[-12px] w-14 h-14 rounded-full opacity-15"
                            style={{ background: th.bar }}
                          />
                          <div className="flex items-center justify-between mb-2 relative z-10">
                            <div className="flex items-center gap-2">
                              <div
                                className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold"
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
                            style={{ background: "rgba(0,0,0,.08)" }}
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
                                v: alfaKelas,
                                l: "alfa",
                                bg: "#fef2f2",
                                tc: "#991b1b",
                              },
                            ].map((c) => (
                              <span
                                key={c.l}
                                className="text-[9px] font-medium px-1.5 py-0.5 rounded-md"
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
                        className="flex-1 rounded-lg py-2 text-center"
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

          {/* Trend Chart */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                <TrendingUp className="w-3 h-3 text-emerald-500" /> Tren
                kehadiran 7 hari terakhir
              </p>
              <div className="flex gap-3">
                {[
                  { color: "#10b981", label: "Hadir" },
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
                    fill="#10b981"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={32}
                  />
                  <Bar
                    dataKey="absen"
                    name="Tidak hadir"
                    fill="#fecaca"
                    radius={[4, 4, 0, 0]}
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
