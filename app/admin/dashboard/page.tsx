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

const Sk = () => (
  <div className="w-full h-5 rounded-lg bg-gray-100 animate-pulse" />
);

/* ── Class Card — solid Tailwind bg ONLY, no gradient ── */
const CLASS_CONFIGS = [
  {
    card: "bg-blue-500 hover:bg-blue-600",
    text: "text-white",
    footer: "bg-blue-700",
  },
  {
    card: "bg-emerald-500 hover:bg-emerald-600",
    text: "text-white",
    footer: "bg-emerald-700",
  },
  {
    card: "bg-orange-400 hover:bg-orange-500",
    text: "text-white",
    footer: "bg-orange-600",
  },
  {
    card: "bg-violet-500 hover:bg-violet-600",
    text: "text-white",
    footer: "bg-violet-700",
  },
  {
    card: "bg-pink-500 hover:bg-pink-600",
    text: "text-white",
    footer: "bg-pink-700",
  },
  {
    card: "bg-teal-500 hover:bg-teal-600",
    text: "text-white",
    footer: "bg-teal-700",
  },
];

function ClassCard({ item, index }: { item: any; index: number }) {
  const cfg = CLASS_CONFIGS[index % CLASS_CONFIGS.length];
  const izin = Math.max(
    0,
    (item.total || 0) - (item.hadir || 0) - (item.tidakHadir || 0),
  );
  const p = item.persentase || 0;

  return (
    <div
      className={`${cfg.card} ${cfg.text} rounded-2xl overflow-hidden shadow-md hover:shadow-xl hover:scale-[1.02] transition-all duration-200 cursor-default`}
    >
      <div className="p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-bold">{item.kelas}</p>
          <span className="text-xs font-bold bg-white/25 px-2.5 py-1 rounded-full">
            {p}%
          </span>
        </div>
        <p className="text-4xl font-black leading-none mb-1">{p}%</p>
        <p className="text-xs opacity-75 mb-4">tingkat kehadiran</p>
        <div className="h-1.5 rounded-full bg-white/30 overflow-hidden">
          <div
            className="h-full bg-white/80 rounded-full transition-all duration-700"
            style={{ width: `${p}%` }}
          />
        </div>
      </div>
      <div className={`${cfg.footer} px-5 py-3 flex gap-4`}>
        {[
          { v: item.hadir, l: "Hadir" },
          { v: izin, l: "Izin" },
          { v: item.tidakHadir || 0, l: "Alfa" },
        ].map((c) => (
          <div key={c.l}>
            <p className="text-base font-bold leading-none">{c.v}</p>
            <p className="text-[10px] opacity-75 mt-0.5">{c.l}</p>
          </div>
        ))}
        <div className="ml-auto text-right">
          <p className="text-xs opacity-75">Total</p>
          <p className="text-base font-bold">{item.total}</p>
        </div>
      </div>
    </div>
  );
}

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
    (async () => {
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
    })();
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
    <div className="flex h-screen bg-slate-100 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-5 lg:p-8 bg-slate-100">
          <GreetingBanner />

          {/* ── Hero Header ── */}
          <div className="bg-white border border-gray-200 rounded-2xl px-6 py-5 mb-5 flex flex-wrap items-center justify-between gap-4 shadow-sm">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-7 h-7 rounded-lg bg-indigo-100 flex items-center justify-center">
                  <Activity size={14} className="text-indigo-600" />
                </div>
                <span className="text-[11px] font-semibold text-indigo-600 uppercase tracking-widest">
                  Dashboard Admin
                </span>
              </div>
              <p className="text-xl font-bold text-gray-900 mb-1">
                Pantau Kehadiran
              </p>
              <p className="text-sm text-gray-400">{hariIni}</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              {[
                {
                  v: loading ? "—" : `${pct}%`,
                  l: "hadir",
                  cls: "bg-emerald-50 border-emerald-200 text-emerald-700",
                },
                {
                  v: loading ? "—" : stats.totalSiswa,
                  l: "total siswa",
                  cls: "bg-gray-50 border-gray-200 text-gray-600",
                },
                {
                  v: loading ? "—" : stats.tidakHadir + izin,
                  l: "tidak hadir",
                  cls: "bg-rose-50 border-rose-200 text-rose-700",
                },
              ].map((b) => (
                <div
                  key={b.l}
                  className={`${b.cls} border rounded-xl px-4 py-2 text-center`}
                >
                  <p className="text-lg font-bold leading-none">{b.v}</p>
                  <p className="text-[11px] opacity-70 mt-1 capitalize">
                    {b.l}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Middle Row ── */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-4">
            {/* LEFT — Donut */}
            <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-5">
                <TrendingUp size={13} className="text-emerald-500" />
                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">
                  Distribusi Kehadiran
                </span>
              </div>

              {loading ? (
                <div className="flex flex-col items-center gap-4">
                  <div className="w-44 h-44 rounded-full bg-gray-100 animate-pulse" />
                  <Sk />
                  <Sk />
                  <Sk />
                </div>
              ) : (
                <>
                  <div className="relative w-full h-52 mb-5">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={donutData}
                          cx="50%"
                          cy="50%"
                          innerRadius={64}
                          outerRadius={90}
                          paddingAngle={4}
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
                      <span className="text-3xl font-black text-gray-900 leading-none">
                        {pct}%
                      </span>
                      <span className="text-xs text-gray-400 mt-1">
                        kehadiran
                      </span>
                    </div>
                  </div>

                  {/* Legend */}
                  <div className="flex flex-col gap-2 mb-5">
                    {[
                      {
                        label: "Hadir",
                        val: stats.hadirHariIni,
                        bg: "bg-emerald-50",
                        tc: "text-emerald-700",
                        icon: <CheckCircle2 size={15} />,
                      },
                      {
                        label: "Izin / Sakit",
                        val: izin,
                        bg: "bg-amber-50",
                        tc: "text-amber-700",
                        icon: <BookOpen size={15} />,
                      },
                      {
                        label: "Alfa",
                        val: stats.tidakHadir,
                        bg: "bg-rose-50",
                        tc: "text-rose-700",
                        icon: <XCircle size={15} />,
                      },
                    ].map((b) => {
                      const pctItem =
                        stats.totalSiswa > 0
                          ? Math.round((b.val / stats.totalSiswa) * 100)
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
                            {pctItem}%
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="border-t border-gray-100 pt-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0">
                        <Award size={17} className="text-indigo-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-400 mb-0.5">
                          Rata-rata kehadiran
                        </p>
                        <p className="text-2xl font-black text-gray-900 leading-none">
                          {pct}%
                        </p>
                      </div>
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center ${pct >= 80 ? "bg-emerald-100" : "bg-rose-100"}`}
                      >
                        {pct >= 80 ? (
                          <CheckCircle2
                            size={20}
                            className="text-emerald-600"
                          />
                        ) : (
                          <AlertTriangle size={20} className="text-rose-600" />
                        )}
                      </div>
                    </div>
                    {bestClass && (
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2 bg-emerald-50 rounded-lg px-3 py-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                          <span className="text-xs text-emerald-700">
                            Terbaik: <strong>{bestClass.kelas}</strong> —{" "}
                            {bestClass.persentase}%
                          </span>
                        </div>
                        {worstClass && worstClass.kelas !== bestClass.kelas && (
                          <div className="flex items-center gap-2 bg-rose-50 rounded-lg px-3 py-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                            <span className="text-xs text-rose-700">
                              Perhatian: <strong>{worstClass.kelas}</strong> —{" "}
                              {worstClass.persentase}%
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* RIGHT — Per Kelas */}
            <div className="lg:col-span-3 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-5">
                <Users size={13} className="text-indigo-500" />
                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">
                  Kehadiran per Kelas
                </span>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="h-36 rounded-2xl bg-gray-100 animate-pulse"
                    />
                  ))}
                </div>
              ) : classData.length === 0 ? (
                <div className="flex items-center justify-center h-32 text-sm text-gray-400">
                  Tidak ada data.
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
                    {classData.slice(0, 6).map((item, i) => (
                      <ClassCard key={i} item={item} index={i} />
                    ))}
                  </div>
                  {/* Summary */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 rounded-2xl p-3">
                    {[
                      {
                        v: stats.totalSiswa,
                        l: "Total",
                        cls: "bg-indigo-100 text-indigo-700",
                        icon: <Users size={14} />,
                      },
                      {
                        v: stats.hadirHariIni,
                        l: "Hadir",
                        cls: "bg-emerald-100 text-emerald-700",
                        icon: <CheckCircle2 size={14} />,
                      },
                      {
                        v: izin,
                        l: "Izin",
                        cls: "bg-amber-100 text-amber-700",
                        icon: <BookOpen size={14} />,
                      },
                      {
                        v: stats.tidakHadir,
                        l: "Alfa",
                        cls: "bg-rose-100 text-rose-700",
                        icon: <XCircle size={14} />,
                      },
                    ].map((s) => (
                      <div
                        key={s.l}
                        className={`${s.cls} rounded-xl py-3 px-2 flex flex-col items-center gap-1`}
                      >
                        {s.icon}
                        <p className="text-xl font-black leading-none">
                          {loading ? "—" : s.v}
                        </p>
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

          {/* ── Trend Chart ── */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <TrendingUp size={13} className="text-indigo-500" />
                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">
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
                    className="flex items-center gap-1.5 text-xs text-gray-400"
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
                    radius={[5, 5, 0, 0]}
                    maxBarSize={28}
                  />
                  <Bar
                    dataKey="absen"
                    name="Tidak hadir"
                    fill="#fca5a5"
                    radius={[5, 5, 0, 0]}
                    maxBarSize={28}
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
