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
  CalendarDays,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  WifiOff,
} from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const DONUT_COLORS = ["#ACEC00", "#013FF6", "#f43f5e"];

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

const AVATAR_COLORS = [
  "bg-indigo-100 text-indigo-700",
  "bg-emerald-100 text-emerald-700",
  "bg-orange-100 text-orange-700",
  "bg-violet-100 text-violet-700",
  "bg-blue-100 text-blue-700",
  "bg-amber-100 text-amber-700",
];

function SiswaRow({ item, index }: { item: any; index: number }) {
  const totalHari = item.totalHari ?? item.total ?? 0;
  const hadir = item.hadir ?? 0;
  const alfaS = item.tidakHadir ?? 0;
  const izinS = Math.max(0, totalHari - hadir - alfaS);
  const p = totalHari > 0 ? Math.round((hadir / totalHari) * 100) : 0;
  const av = AVATAR_COLORS[index % AVATAR_COLORS.length];
  const barColor = p >= 80 ? "#10b981" : p >= 60 ? "#f59e0b" : "#f43f5e";
  const pBadge =
    p >= 80
      ? "bg-emerald-100 text-emerald-700"
      : p >= 60
        ? "bg-amber-100 text-amber-700"
        : "bg-rose-100 text-rose-700";
  const displayName = item.siswa || item.tempatPKL || "?";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-slate-50 hover:bg-white hover:shadow-md border border-transparent hover:border-slate-200 transition-all duration-200 cursor-default">
      <div
        className={`w-10 h-10 rounded-full ${av} flex items-center justify-center text-sm font-bold shrink-0`}
      >
        {initial}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-gray-800 truncate">
          {displayName}
        </p>
        {item.siswa && item.tempatPKL && (
          <p className="text-[11px] text-gray-400 truncate">{item.tempatPKL}</p>
        )}
        <div className="h-1 rounded-full bg-slate-200 overflow-hidden mt-1.5 max-w-30">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${p}%`, background: barColor }}
          />
        </div>
      </div>
      <div className="hidden sm:flex gap-1">
        {[
          { v: hadir, l: "hadir", cls: "bg-emerald-50 text-emerald-700" },
          { v: izinS, l: "izin", cls: "bg-amber-50 text-amber-700" },
          { v: alfaS, l: "alfa", cls: "bg-rose-50 text-rose-700" },
        ].map((c) => (
          <span
            key={c.l}
            className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-lg ${c.cls}`}
          >
            {c.v} {c.l}
          </span>
        ))}
      </div>
      <span
        className={`text-xs font-black px-2.5 py-1 rounded-full shrink-0 ${pBadge}`}
      >
        {p}%
      </span>
    </div>
  );
}

interface GuruCards {
  totalSiswaPKL: number;
  hadirHariIni: number;
  izin: number;
  tidakHadir: number;
  persentaseKehadiran: number;
}

export default function GuruDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<GuruCards>({
    totalSiswaPKL: 0,
    hadirHariIni: 0,
    izin: 0,
    tidakHadir: 0,
    persentaseKehadiran: 0,
  });
  const [pklData, setPklData] = useState<any[]>([]);

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
          totalSiswaPKL: data.cards.totalSiswaPKL ?? 0,
          hadirHariIni: data.cards.hadirHariIni ?? 0,
          izin:
            data.cards.izin ??
            Math.max(
              0,
              (data.cards.totalSiswaPKL ?? 0) -
                (data.cards.hadirHariIni ?? 0) -
                (data.cards.tidakHadir ?? 0),
            ),
          tidakHadir: data.cards.tidakHadir ?? 0,
          persentaseKehadiran: data.cards.persentaseKehadiran ?? 0,
        });
      }

      if (data.table) setPklData(data.table);
    } catch {
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

  const bestSiswa =
    pklData.length > 0
      ? pklData.reduce((a: any, b: any) => {
          const pa = (a.totalHari ?? 0) > 0 ? a.hadir / a.totalHari : 0;
          const pb = (b.totalHari ?? 0) > 0 ? b.hadir / b.totalHari : 0;
          return pa > pb ? a : b;
        })
      : null;

  const worstSiswa =
    pklData.length > 0
      ? pklData.reduce((a: any, b: any) => {
          const pa = (a.totalHari ?? 0) > 0 ? a.hadir / a.totalHari : 0;
          const pb = (b.totalHari ?? 0) > 0 ? b.hadir / b.totalHari : 0;
          return pa < pb ? a : b;
        })
      : null;

  const [hariIni, setHariIni] = useState("");
  useEffect(() => {
    setHariIni(
      new Date().toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
    );
  }, []);

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

          {/* ═══ CARD 1 — HERO OVERVIEW ═══ */}
          <div className="relative rounded-3xl overflow-hidden mb-5 shadow-xl">
            <div className="absolute inset-0 bg-[#00182E]" />
            <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-[#ACEC00]/8 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-12 left-20 w-48 h-48 rounded-full bg-[#013FF6]/15 blur-3xl pointer-events-none" />
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
                      <GraduationCap size={15} className="text-[#ACEC00]" />
                    </div>
                    <span className="text-[11px] font-semibold text-[#ACEC00] uppercase tracking-widest">
                      Dashboard Guru
                    </span>
                  </div>
                  <h1 className="text-2xl font-black text-white mb-1">
                    Rekap Siswa PKL Hari Ini
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

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  {
                    icon: <Users size={18} />,
                    num: stats.totalSiswaPKL,
                    label: "Siswa PKL",
                    sub: "Dalam bimbingan",
                    color: "from-[#013FF6]/20 to-[#013FF6]/5",
                    border: "border-[#013FF6]/20",
                    iconBg: "bg-[#013FF6]/20",
                    iconColor: "text-blue-300",
                    numColor: "text-blue-100",
                    badge: null,
                  },
                  {
                    icon: <CheckCircle2 size={18} />,
                    num: stats.hadirHariIni,
                    label: "Hadir",
                    sub: "Hari ini",
                    color: "from-[#ACEC00]/20 to-[#ACEC00]/5",
                    border: "border-[#ACEC00]/20",
                    iconBg: "bg-[#ACEC00]/20",
                    iconColor: "text-[#ACEC00]",
                    numColor: "text-[#ACEC00]/90",
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
                      stats.totalSiswaPKL > 0
                        ? {
                            text: `${Math.round((izin / stats.totalSiswaPKL) * 100)}%`,
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
                      stats.totalSiswaPKL > 0
                        ? {
                            text: `${Math.round((stats.tidakHadir / stats.totalSiswaPKL) * 100)}%`,
                            positive: false,
                          }
                        : null,
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className={`bg-linear-to-br ${item.color} border ${item.border} rounded-2xl p-4 backdrop-blur-sm`}
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
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
            {/* ─── CARD 2: Distribusi Kehadiran ─── */}
            <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <TrendingUp size={13} className="text-[#ACEC00]" />
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">
                      Distribusi Kehadiran
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">Siswa PKL hari ini</p>
                </div>
                {!loading && (
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full ${pct >= 80 ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}
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
                        total: stats.totalSiswaPKL,
                        bg: "bg-emerald-50",
                        tc: "text-emerald-700",
                        icon: <CheckCircle2 size={14} />,
                      },
                      {
                        label: "Izin / Sakit",
                        val: izin,
                        total: stats.totalSiswaPKL,
                        bg: "bg-amber-50",
                        tc: "text-amber-700",
                        icon: <BookOpen size={14} />,
                      },
                      {
                        label: "Alfa",
                        val: stats.tidakHadir,
                        total: stats.totalSiswaPKL,
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

                  {bestSiswa && (
                    <div className="mt-4 flex flex-col gap-2 border-t border-slate-100 pt-4">
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-2xl bg-[#013FF6]/15 flex items-center justify-center shrink-0">
                          <Award size={16} className="text-blue-400" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-400">
                            Rata-rata kehadiran
                          </p>
                          <p className="text-xl font-black text-slate-900 leading-none">
                            {pct}%
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 bg-emerald-50 rounded-xl px-3 py-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                        <span className="text-xs text-emerald-700 truncate">
                          Terbaik:{" "}
                          <strong>
                            {bestSiswa.siswa || bestSiswa.tempatPKL}
                          </strong>
                        </span>
                      </div>
                      {worstSiswa && worstSiswa !== bestSiswa && (
                        <div className="flex items-center gap-2 bg-rose-50 rounded-xl px-3 py-2">
                          <AlertTriangle
                            size={12}
                            className="text-rose-600 shrink-0"
                          />
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
                </>
              )}
            </div>

            {/* ─── CARD 3: Daftar Siswa PKL ─── */}
            <div className="lg:col-span-3 bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <Users size={13} className="text-blue-400" />
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">
                      Kehadiran Siswa PKL
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    {pklData.length} siswa dalam bimbingan
                  </p>
                </div>
                {!loading && (
                  <div className="flex gap-1.5">
                    {[
                      {
                        v: stats.totalSiswaPKL,
                        l: "Total",
                        cls: "bg-[#013FF6]/10 text-blue-700",
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
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="h-16 rounded-2xl bg-slate-100 animate-pulse"
                    />
                  ))}
                </div>
              ) : pklData.length === 0 ? (
                <div className="flex items-center justify-center h-40 text-sm text-slate-400">
                  Tidak ada data siswa bimbingan.
                </div>
              ) : (
                <>
                  <div className="flex flex-col gap-2 mb-5 max-h-95 overflow-y-auto pr-1">
                    {pklData.map((item, i) => (
                      <SiswaRow key={i} item={item} index={i} />
                    ))}
                  </div>

                  <div className="grid grid-cols-4 gap-2 bg-slate-50 rounded-2xl p-3">
                    {[
                      {
                        v: stats.totalSiswaPKL,
                        l: "Total",
                        cls: "bg-[#013FF6]/10 text-blue-700",
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
        </main>
      </div>
    </div>
  );
}
