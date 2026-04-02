"use client";
import Sidebar from "@/components/layout/SidebarGuru";
import TopBar from "@/components/layout/TopBar";
import GreetingBanner from "@/components/GreetingBanner";
import { useState, useEffect, useMemo } from "react";
import {
  Users,
  TrendingUp,
  Award,
  GraduationCap,
  CheckCircle2,
  XCircle,
  BookOpen,
  AlertTriangle,
} from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

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

const AVATAR_COLORS = [
  "bg-indigo-100 text-indigo-700",
  "bg-emerald-100 text-emerald-700",
  "bg-orange-100 text-orange-700",
  "bg-violet-100 text-violet-700",
  "bg-blue-100 text-blue-700",
  "bg-amber-100 text-amber-700",
];

function SiswaCard({ item, index }: { item: any; index: number }) {
  const total = item.totalHari ?? item.total ?? 0;
  const hadir = item.hadir ?? 0;
  const p = total > 0 ? Math.round((hadir / total) * 100) : 0;
  const izinS = Math.max(0, total - hadir - (item.tidakHadir || 0));
  const alfaS = item.tidakHadir || 0;
  const av = AVATAR_COLORS[index % AVATAR_COLORS.length];
  const barColor = p >= 80 ? "#10b981" : p >= 60 ? "#f59e0b" : "#f43f5e";
  const pBadge =
    p >= 80
      ? "bg-emerald-100 text-emerald-700"
      : p >= 60
        ? "bg-amber-100 text-amber-700"
        : "bg-rose-100 text-rose-700";
  const initial = (item.siswa || item.tempatPKL || "?").charAt(0).toUpperCase();

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-3.5 hover:border-gray-300 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 cursor-default">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-8 h-8 rounded-full ${av} flex items-center justify-center text-xs font-semibold shrink-0`}
          >
            {initial}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-gray-800 truncate max-w-[120px]">
              {item.siswa || item.tempatPKL}
            </p>
            {item.siswa && item.tempatPKL && (
              <p className="text-[10px] text-gray-400 truncate max-w-[120px]">
                {item.tempatPKL}
              </p>
            )}
          </div>
        </div>
        <span
          className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${pBadge} shrink-0`}
        >
          {p}%
        </span>
      </div>
      <div className="h-1 rounded-full bg-gray-100 mb-2 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${p}%`, background: barColor }}
        />
      </div>
      <div className="flex gap-1.5">
        {[
          { v: hadir, l: "hadir", cls: "bg-emerald-50 text-emerald-700" },
          { v: izinS, l: "izin", cls: "bg-amber-50 text-amber-700" },
          { v: alfaS, l: "alfa", cls: "bg-rose-50 text-rose-700" },
        ].map((c) => (
          <span
            key={c.l}
            className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${c.cls}`}
          >
            {c.v} {c.l}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function GuruDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSiswaPKL: 0,
    hadirHariIni: 0,
    tidakHadir: 0,
    persentaseKehadiran: 0,
  });
  const [pklData, setPklData] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/dashboard?t=${Date.now()}`);
        if (res.ok) {
          const data = await res.json();
          if (data.cards) setStats(data.cards);
          if (data.table) setPklData(data.table);
        }
      } catch {
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const izin = useMemo(
    () =>
      Math.max(0, stats.totalSiswaPKL - stats.hadirHariIni - stats.tidakHadir),
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

  const bestSiswa =
    pklData.length > 0
      ? pklData.reduce((a: any, b: any) => {
          const pa = a.totalHari > 0 ? a.hadir / a.totalHari : 0;
          const pb = b.totalHari > 0 ? b.hadir / b.totalHari : 0;
          return pa > pb ? a : b;
        })
      : null;

  const worstSiswa =
    pklData.length > 0
      ? pklData.reduce((a: any, b: any) => {
          const pa = a.totalHari > 0 ? a.hadir / a.totalHari : 0;
          const pb = b.totalHari > 0 ? b.hadir / b.totalHari : 0;
          return pa < pb ? a : b;
        })
      : null;

  const hariIni = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const pctBadge =
    pct >= 80
      ? "bg-emerald-50 border-emerald-200 text-emerald-700"
      : "bg-amber-50 border-amber-200 text-amber-700";

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-5 lg:p-8 bg-slate-100">
          <GreetingBanner />

          {/* ── Hero ── */}
          <div className="bg-white border border-gray-200 rounded-2xl px-6 py-5 mb-5 flex flex-wrap items-center justify-between gap-4 shadow-sm">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <GraduationCap size={14} className="text-emerald-600" />
                </div>
                <span className="text-[11px] font-semibold text-emerald-600 uppercase tracking-widest">
                  Dashboard Guru
                </span>
              </div>
              <p className="text-xl font-bold text-gray-900 mb-1">
                Pantau Siswa PKL
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
                  v: loading ? "—" : stats.totalSiswaPKL,
                  l: "siswa PKL",
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

          {/* ── Content ── */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            {/* LEFT */}
            <div className="lg:col-span-2 flex flex-col gap-4">
              {/* Donut card */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-5">
                  <TrendingUp size={13} className="text-emerald-500" />
                  <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">
                    Distribusi Kehadiran
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
                            data={donutData}
                            cx="50%"
                            cy="50%"
                            innerRadius={58}
                            outerRadius={84}
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

                    <div className="flex flex-col gap-2">
                      {[
                        {
                          label: "Hadir",
                          val: stats.hadirHariIni,
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
                          val: stats.tidakHadir,
                          bg: "bg-rose-50",
                          tc: "text-rose-700",
                          icon: <XCircle size={14} />,
                        },
                      ].map((b) => {
                        const pctItem =
                          stats.totalSiswaPKL > 0
                            ? Math.round((b.val / stats.totalSiswaPKL) * 100)
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
                  </>
                )}
              </div>

              {/* Ringkasan card */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <Award size={13} className="text-indigo-500" />
                  <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">
                    Ringkasan
                  </span>
                </div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-11 h-11 rounded-2xl bg-indigo-100 flex items-center justify-center shrink-0">
                    <Award size={20} className="text-indigo-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-400 mb-0.5">
                      Rata-rata kehadiran
                    </p>
                    <p className="text-3xl font-black text-gray-900 leading-none">
                      {pct}%
                    </p>
                  </div>
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center ${pct >= 80 ? "bg-emerald-100" : "bg-rose-100"}`}
                  >
                    {pct >= 80 ? (
                      <CheckCircle2 size={22} className="text-emerald-600" />
                    ) : (
                      <AlertTriangle size={22} className="text-rose-600" />
                    )}
                  </div>
                </div>
                {bestSiswa && (
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2 bg-emerald-50 rounded-lg px-3 py-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                      <span className="text-xs text-emerald-700 truncate">
                        Terbaik:{" "}
                        <strong>
                          {bestSiswa.siswa || bestSiswa.tempatPKL}
                        </strong>
                      </span>
                    </div>
                    {worstSiswa && worstSiswa !== bestSiswa && (
                      <div className="flex items-center gap-2 bg-rose-50 rounded-lg px-3 py-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                        <span className="text-xs text-rose-700 truncate">
                          Perhatian:{" "}
                          <strong>
                            {worstSiswa.siswa || worstSiswa.tempatPKL}
                          </strong>
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT — Siswa list */}
            <div className="lg:col-span-3 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-5">
                <Users size={13} className="text-emerald-500" />
                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">
                  Kehadiran Siswa PKL
                </span>
              </div>

              {loading ? (
                <div className="flex flex-col gap-3">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className="h-20 rounded-xl bg-gray-100 animate-pulse"
                    />
                  ))}
                </div>
              ) : pklData.length === 0 ? (
                <div className="flex items-center justify-center h-36 text-sm text-gray-400">
                  Tidak ada data siswa bimbingan.
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2.5 mb-3 max-h-[400px] overflow-y-auto pr-1">
                    {pklData.map((item, i) => (
                      <SiswaCard key={i} item={item} index={i} />
                    ))}
                  </div>
                  {/* Summary */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 rounded-2xl p-3">
                    {[
                      {
                        v: stats.totalSiswaPKL,
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
        </main>
      </div>
    </div>
  );
}
