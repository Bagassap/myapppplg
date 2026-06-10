"use client";
import Sidebar from "@/components/layout/SidebarAdmin";
import TopBar from "@/components/layout/TopBar";
import GreetingBanner from "@/components/GreetingBanner";
import { useState, useEffect, useMemo } from "react";
import {
  Users,
  GraduationCap,
  TrendingUp,
  CheckCircle2,
  XCircle,
  BookOpen,
  Activity,
  AlertTriangle,
  CalendarDays,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  WifiOff,
  Clock,
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

function StatusBadge({ status }: { status: string }) {
  if (status === "Hadir")
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#ACEC00]/15 text-[#00182E]">
        <CheckCircle2 size={9} /> Hadir
      </span>
    );
  if (status === "Izin" || status === "Sakit")
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#013FF6]/10 text-[#013FF6]">
        <BookOpen size={9} /> {status}
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700">
      <XCircle size={9} /> Alfa
    </span>
  );
}

function ClassRow({ item, index }: { item: any; index: number }) {
  const barColor = index % 2 === 0 ? "#ACEC00" : "#013FF6";
  const badgeCls =
    index % 2 === 0
      ? "bg-[#ACEC00]/10 text-[#00182E]"
      : "bg-[#013FF6]/10 text-[#013FF6]";
  const izin =
    item.izin ??
    Math.max(0, (item.total || 0) - (item.hadir || 0) - (item.tidakHadir || 0));
  const p = item.persentase || 0;
  const initial = (item.kelas || "?").substring(0, 3).toUpperCase();

  return (
    <div className="flex items-center gap-4 p-3.5 rounded-2xl bg-slate-50 hover:bg-white hover:shadow-md border border-transparent hover:border-slate-200 transition-all duration-200 cursor-default">
      <div
        className={`w-11 h-11 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${badgeCls}`}
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
            style={{ width: `${p}%`, background: barColor }}
          />
        </div>
        <span
          className="text-sm font-black min-w-10.5 text-right"
          style={{ color: barColor }}
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

const DEFAULT_TREND = [
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

interface AbsensiRecord {
  nama: string;
  status: string;
  waktu: string | null;
  createdAt: string;
}

interface DashboardCards {
  totalSiswa: number;
  totalGuru: number;
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
    totalGuru: 0,
    hadirHariIni: 0,
    izin: 0,
    tidakHadir: 0,
    persentaseKehadiran: 0,
  });
  const [classData, setClassData] = useState<any[]>([]);
  const [trendData, setTrendData] = useState<TrendDay[]>(DEFAULT_TREND);
  const [absensiTerbaru, setAbsensiTerbaru] = useState<AbsensiRecord[]>([]);

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
          totalGuru: data.cards.totalGuru ?? 0,
          hadirHariIni: data.cards.hadirHariIni ?? 0,
          izin: data.cards.izin ?? 0,
          tidakHadir: data.cards.tidakHadir ?? 0,
          persentaseKehadiran: data.cards.persentaseKehadiran ?? 0,
        });
      }
      if (data.table) setClassData(data.table);
      if (Array.isArray(data.trend) && data.trend.length > 0) setTrendData(data.trend);
      if (Array.isArray(data.absensiTerbaru)) setAbsensiTerbaru(data.absensiTerbaru);
    } catch {
      setError("Koneksi gagal. Pastikan jaringan aktif dan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const pct = stats.persentaseKehadiran;
  const izin = stats.izin;

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
      ? classData.reduce((a, b) => (a.persentase > b.persentase ? a : b), classData[0])
      : null;
  const worstClass =
    classData.length > 0
      ? classData.reduce((a, b) => (a.persentase < b.persentase ? a : b), classData[0])
      : null;

  const [hariIni, setHariIni] = useState("");
  useEffect(() => {
    setHariIni(
      new Date().toLocaleDateString("id-ID", {
        weekday: "long", day: "numeric", month: "long", year: "numeric",
      }),
    );
  }, []);

  const formatWaktu = (record: AbsensiRecord) => {
    if (record.waktu) return record.waktu;
    return new Date(record.createdAt).toLocaleTimeString("id-ID", {
      hour: "2-digit", minute: "2-digit",
    });
  };

  if (error) {
    return (
      <div className="flex h-screen bg-slate-100 overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <TopBar />
          <main className="flex-1 flex items-center justify-center p-8">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-[#013FF6]/20 max-w-md w-full text-center">
              <div className="w-14 h-14 rounded-2xl bg-[#013FF6]/10 flex items-center justify-center mx-auto mb-4">
                <WifiOff size={24} className="text-[#013FF6]" />
              </div>
              <h2 className="text-lg font-bold text-slate-800 mb-2">Gagal Memuat Dashboard</h2>
              <p className="text-sm text-slate-500 mb-5">{error}</p>
              <button
                onClick={fetchData}
                className="flex items-center gap-2 mx-auto bg-[#00182E] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#013FF6] transition-colors"
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

          {/* ═══ HERO CARD ═══ */}
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
                      <Activity size={15} className="text-[#ACEC00]" />
                    </div>
                    <span className="text-[11px] font-semibold text-[#ACEC00] uppercase tracking-widest">
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

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  {
                    icon: <Users size={18} />,
                    num: stats.totalSiswa,
                    label: "Total Siswa",
                    sub: "Terdaftar",
                    color: "from-[#013FF6]/20 to-[#013FF6]/5",
                    border: "border-[#013FF6]/20",
                    iconBg: "bg-[#013FF6]/20",
                    iconColor: "text-blue-300",
                    numColor: "text-blue-100",
                    badge: null,
                  },
                  {
                    icon: <GraduationCap size={18} />,
                    num: stats.totalGuru,
                    label: "Total Guru",
                    sub: "Pembimbing PKL",
                    color: "from-white/10 to-white/5",
                    border: "border-white/15",
                    iconBg: "bg-white/15",
                    iconColor: "text-white/80",
                    numColor: "text-white",
                    badge: null,
                  },
                  {
                    icon: <CheckCircle2 size={18} />,
                    num: stats.hadirHariIni,
                    label: "Hadir",
                    sub: "Hari ini",
                    color: "from-[#ACEC00]/20 to-[#ACEC00]/5",
                    border: "border-[#ACEC00]/25",
                    iconBg: "bg-[#ACEC00]/20",
                    iconColor: "text-[#ACEC00]",
                    numColor: "text-[#ACEC00]",
                    badge: { text: `${pct}%`, positive: true },
                  },
                  {
                    icon: <XCircle size={18} />,
                    num: stats.tidakHadir,
                    label: "Tidak Hadir",
                    sub: "Alfa hari ini",
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
                    className={`bg-linear-to-br ${item.color} border ${item.border} rounded-2xl p-4 backdrop-blur-sm`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className={`w-9 h-9 ${item.iconBg} rounded-xl flex items-center justify-center`}>
                        <span className={item.iconColor}>{item.icon}</span>
                      </div>
                      {item.badge && (
                        <span
                          className={`flex items-center gap-0.5 text-[11px] font-bold px-2 py-0.5 rounded-full ${
                            item.badge.positive
                              ? "bg-[#ACEC00]/20 text-[#ACEC00]"
                              : "bg-rose-500/20 text-rose-300"
                          }`}
                        >
                          {item.badge.positive ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                          {item.badge.text}
                        </span>
                      )}
                    </div>
                    <p className={`text-3xl font-black leading-none mb-1 ${item.numColor}`}>
                      {loading ? "—" : item.num}
                    </p>
                    <p className="text-sm font-semibold text-slate-300">{item.label}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{item.sub}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ═══ ROW 2: Distribution + Kehadiran Per Kelas ═══ */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 mb-5">
            {/* Distribusi */}
            <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <TrendingUp size={13} className="text-[#ACEC00]" />
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
                        ? "bg-[#ACEC00]/15 text-[#00182E]"
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
                      <span className="text-4xl font-black text-slate-900 leading-none">{pct}%</span>
                      <span className="text-xs text-slate-400 mt-1.5">kehadiran</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2.5">
                    {[
                      {
                        label: "Hadir",
                        val: stats.hadirHariIni,
                        total: stats.totalSiswa,
                        bg: "bg-[#ACEC00]/10",
                        tc: "text-[#00182E]",
                        icon: <CheckCircle2 size={14} />,
                      },
                      {
                        label: "Izin / Sakit",
                        val: izin,
                        total: stats.totalSiswa,
                        bg: "bg-[#013FF6]/8",
                        tc: "text-[#013FF6]",
                        icon: <BookOpen size={14} />,
                      },
                      {
                        label: "Alfa",
                        val: stats.tidakHadir,
                        total: stats.totalSiswa,
                        bg: "bg-rose-50",
                        tc: "text-rose-700",
                        icon: <XCircle size={14} />,
                      },
                    ].map((b) => {
                      const pctItem = b.total > 0 ? Math.round((b.val / b.total) * 100) : 0;
                      return (
                        <div key={b.label} className={`flex items-center gap-3 ${b.bg} rounded-2xl px-4 py-3`}>
                          <span className={b.tc}>{b.icon}</span>
                          <span className={`text-sm font-semibold ${b.tc} flex-1`}>{b.label}</span>
                          <span className={`text-xl font-black ${b.tc}`}>{b.val}</span>
                          <span className={`text-[11px] font-semibold ${b.tc} bg-black/5 px-2 py-0.5 rounded-full`}>
                            {pctItem}%
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {bestClass && (
                    <div className="mt-4 flex flex-col gap-2 border-t border-slate-100 pt-4">
                      <div className="flex items-center gap-2 bg-[#ACEC00]/10 rounded-xl px-3 py-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#ACEC00] shrink-0" />
                        <span className="text-xs text-[#00182E] truncate font-medium">
                          Terbaik: <strong>{bestClass.kelas}</strong> — {bestClass.persentase}%
                        </span>
                      </div>
                      {worstClass && worstClass.kelas !== bestClass.kelas && (
                        <div className="flex items-center gap-2 bg-rose-50 rounded-xl px-3 py-2">
                          <AlertTriangle size={13} className="text-rose-600 shrink-0" />
                          <span className="text-xs text-rose-700 truncate">
                            Perhatian: <strong>{worstClass.kelas}</strong> — {worstClass.persentase}%
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Kehadiran Per Kelas */}
            <div className="lg:col-span-3 bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <Users size={13} className="text-[#013FF6]" />
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">
                      Kehadiran Per Kelas
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">{classData.length} kelas aktif</p>
                </div>
                {!loading && (
                  <div className="flex gap-1.5">
                    {[
                      { v: stats.totalSiswa, l: "Total", cls: "bg-[#013FF6]/10 text-[#013FF6]" },
                      { v: stats.hadirHariIni, l: "Hadir", cls: "bg-[#ACEC00]/10 text-[#00182E]" },
                    ].map((s) => (
                      <div key={s.l} className={`${s.cls} rounded-xl px-3 py-1.5 text-center`}>
                        <p className="text-sm font-black leading-none">{s.v}</p>
                        <p className="text-[10px] font-medium opacity-70">{s.l}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {loading ? (
                <div className="flex flex-col gap-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-16 rounded-2xl bg-slate-100 animate-pulse" />
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
                      { v: stats.totalSiswa, l: "Total", cls: "bg-[#013FF6]/10 text-[#013FF6]", icon: <Users size={13} /> },
                      { v: stats.hadirHariIni, l: "Hadir", cls: "bg-[#ACEC00]/10 text-[#00182E]", icon: <CheckCircle2 size={13} /> },
                      { v: izin, l: "Izin", cls: "bg-[#013FF6]/8 text-[#013FF6]", icon: <BookOpen size={13} /> },
                      { v: stats.tidakHadir, l: "Alfa", cls: "bg-rose-100 text-rose-700", icon: <XCircle size={13} /> },
                    ].map((s) => (
                      <div key={s.l} className={`${s.cls} rounded-xl py-3 px-2 flex flex-col items-center gap-1`}>
                        {s.icon}
                        <p className="text-lg font-black leading-none">{s.v}</p>
                        <p className="text-[10px] font-semibold opacity-75">{s.l}</p>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* ═══ ABSENSI TERBARU ═══ */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 mb-5 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock size={13} className="text-[#013FF6]" />
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">
                  Absensi Terbaru
                </span>
              </div>
              <span className="text-xs text-slate-400">10 data terakhir hari ini</span>
            </div>

            {loading ? (
              <div className="p-6 flex flex-col gap-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-12 rounded-xl bg-slate-100 animate-pulse" />
                ))}
              </div>
            ) : absensiTerbaru.length === 0 ? (
              <div className="py-12 flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-2xl bg-[#013FF6]/8 flex items-center justify-center">
                  <Clock size={18} className="text-[#013FF6]/40" />
                </div>
                <p className="text-sm text-slate-400">Belum ada absensi hari ini.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-160">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="text-left px-6 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-widest">
                        Nama
                      </th>
                      <th className="text-left px-6 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-widest">
                        Status
                      </th>
                      <th className="text-left px-6 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-widest hidden sm:table-cell">
                        Waktu
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {absensiTerbaru.map((rec, i) => (
                      <tr key={i} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-[#00182E] flex items-center justify-center shrink-0">
                              <span className="text-[#ACEC00] text-[11px] font-bold">
                                {rec.nama.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <span className="font-semibold text-slate-800 truncate max-w-45">
                              {rec.nama}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-3.5">
                          <StatusBadge status={rec.status} />
                        </td>
                        <td className="px-6 py-3.5 text-slate-500 font-mono text-xs hidden sm:table-cell">
                          {formatWaktu(rec)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* ═══ TREN 7 HARI ═══ */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <TrendingUp size={13} className="text-[#013FF6]" />
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">
                  Tren 7 Hari Terakhir
                </span>
              </div>
              <div className="flex gap-4">
                {[
                  { color: "#ACEC00", label: "Hadir" },
                  { color: "#013FF6", label: "Tidak hadir" },
                ].map((l) => (
                  <span key={l.label} className="flex items-center gap-1.5 text-xs text-slate-400">
                    <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: l.color }} />
                    {l.label}
                  </span>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="h-36 bg-slate-50 rounded-2xl animate-pulse" />
            ) : (
              <div className="h-36 w-full">
                <ResponsiveContainer width="100%" height="100%" minHeight={144}>
                  <BarChart data={trendData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }} barCategoryGap="30%">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#94a3b8" } as any} axisLine={false} tickLine={false} />
                    <Tooltip content={<TrendTooltip />} />
                    <Bar dataKey="hadir" name="Hadir" fill="#ACEC00" radius={[6, 6, 0, 0]} maxBarSize={28} />
                    <Bar dataKey="absen" name="Tidak hadir" fill="#013FF6" radius={[6, 6, 0, 0]} maxBarSize={28} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
