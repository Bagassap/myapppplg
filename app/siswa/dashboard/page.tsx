"use client";
import Sidebar from "@/components/layout/SidebarSiswa";
import GreetingBanner from "@/components/GreetingBanner";
import TopBar from "@/components/layout/TopBar";
import PageHeader from "@/components/layout/PageHeader";
import { useState, useEffect } from "react";
import {
  Bell,
  ChevronRight,
  Megaphone,
  Info,
  AlertCircle,
  BookOpen,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  CalendarDays,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

interface Informasi {
  id: number;
  judul: string;
  isi: string;
  tanggal: string;
  tipe: string;
  tempatPKL?: string | null;
  createdAt: string;
}

const getTipeConfig = (tipe: string) => {
  switch (tipe?.toLowerCase()) {
    case "pengumuman":
      return {
        icon: <Megaphone size={14} />,
        pill: "bg-[#013FF6]/10 text-[#013FF6] border-[#013FF6]/20",
        iconCls: "bg-[#013FF6]/10 text-[#013FF6]",
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
        pill: "bg-[#ACEC00]/10 text-[#00182E] border-[#ACEC00]/20",
        iconCls: "bg-[#ACEC00]/10 text-[#00182E]",
      };
  }
};

const formatTanggal = (t: string) =>
  new Date(t).toLocaleDateString("id-ID", {
    day: "numeric", month: "long", year: "numeric",
  });

export default function SiswaDashboard() {
  const [loading, setLoading] = useState(true);
  const [loadingInfo, setLoadingInfo] = useState(true);
  const [informasiList, setInformasiList] = useState<Informasi[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [hariIni, setHariIni] = useState("");

  const [stats, setStats] = useState({
    totalHariBulanIni: 0,
    hadirBulanIni: 0,
    izinBulanIni: 0,
    tidakHadirBulanIni: 0,
    persentaseKehadiran: 0,
    sudahAbsenHariIni: false,
  });

  useEffect(() => {
    setHariIni(
      new Date().toLocaleDateString("id-ID", {
        weekday: "long", day: "numeric", month: "long", year: "numeric",
      }),
    );

    const fetchDashboard = async () => {
      try {
        const res = await fetch(`/api/dashboard?t=${Date.now()}`);
        if (res.ok) {
          const data = await res.json();
          if (data.cards) {
            setStats({
              totalHariBulanIni: data.cards.totalHariBulanIni ?? 0,
              hadirBulanIni: data.cards.hadirBulanIni ?? 0,
              izinBulanIni:
                data.cards.izinBulanIni ??
                Math.max(
                  0,
                  (data.cards.totalHariBulanIni ?? 0) -
                    (data.cards.hadirBulanIni ?? 0) -
                    (data.cards.tidakHadirBulanIni ?? 0),
                ),
              tidakHadirBulanIni: data.cards.tidakHadirBulanIni ?? 0,
              persentaseKehadiran: data.cards.persentaseKehadiran ?? 0,
              sudahAbsenHariIni: data.cards.sudahAbsenHariIni ?? false,
            });
          }
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

  const izin = stats.izinBulanIni;
  const pct = stats.persentaseKehadiran;
  const sudahAbsen = stats.sudahAbsenHariIni;

  const motivasiText =
    pct >= 90
      ? { title: "Luar biasa! 🏆", body: "Kehadiranmu sudah melampaui 90%. Pertahankan!" }
      : pct >= 80
        ? { title: "Bagus sekali! 🎉", body: "Kamu sudah mencapai target. Terus jaga konsistensinya!" }
        : { title: "Ayo semangat! 💪", body: `Butuh ${80 - pct}% lagi untuk mencapai target 80% kehadiran.` };

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-5 lg:p-8 bg-slate-100">
          <PageHeader icon="📊" title="Dashboard" subtitle="Rekap kehadiran PKL bulan ini" />
          <GreetingBanner />

          {/* ═══ HERO CARD ═══ */}
          <div className="relative rounded-3xl overflow-hidden mb-5 shadow-xl">
            <div className="absolute inset-0 bg-[#00182E]" />
            <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-[#ACEC00]/8 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-12 left-20 w-48 h-48 rounded-full bg-[#013FF6]/15 blur-3xl pointer-events-none" />
            <div className="absolute top-1/2 right-1/3 w-32 h-32 rounded-full bg-[#013FF6]/5 blur-2xl pointer-events-none" />
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
                      <BookOpen size={15} className="text-[#ACEC00]" />
                    </div>
                    <span className="text-[11px] font-semibold text-[#ACEC00] uppercase tracking-widest">
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
                        ? "bg-[#ACEC00]/20 border-[#ACEC00]/30 text-[#ACEC00]"
                        : "bg-white/10 border-white/20 text-white/70"
                    }`}
                  >
                    {sudahAbsen ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                    {sudahAbsen ? "Sudah absen hari ini" : "Belum absen hari ini"}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  {
                    icon: <CalendarDays size={18} />,
                    num: stats.totalHariBulanIni,
                    label: "Total Hari",
                    sub: "Bulan ini",
                    color: "from-[#013FF6]/20 to-[#013FF6]/5",
                    border: "border-[#013FF6]/20",
                    iconBg: "bg-[#013FF6]/20",
                    iconColor: "text-blue-300",
                    numColor: "text-blue-100",
                    badge: null,
                  },
                  {
                    icon: <CheckCircle2 size={18} />,
                    num: stats.hadirBulanIni,
                    label: "Hadir",
                    sub: "Bulan ini",
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
                    sub: "Dengan keterangan",
                    color: "from-[#013FF6]/15 to-[#013FF6]/5",
                    border: "border-[#013FF6]/15",
                    iconBg: "bg-[#013FF6]/15",
                    iconColor: "text-blue-300",
                    numColor: "text-blue-100",
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
                            text: `${Math.round(
                              (stats.tidakHadirBulanIni / stats.totalHariBulanIni) * 100,
                            )}%`,
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

          {/* ═══ MOTIVASI BANNER ═══ */}
          {!loading && (
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200 flex items-center gap-4 mb-5">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                  pct >= 90 ? "bg-[#ACEC00]" : pct >= 80 ? "bg-[#013FF6]" : "bg-rose-500"
                }`}
              >
                <ShieldCheck size={22} className="text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-slate-800 mb-0.5">{motivasiText.title}</p>
                <p className="text-xs text-slate-500 leading-relaxed">{motivasiText.body}</p>
              </div>
              <div
                className={`shrink-0 px-4 py-3 rounded-2xl text-right ${
                  pct >= 90 ? "bg-[#ACEC00]/10" : pct >= 80 ? "bg-[#013FF6]/8" : "bg-rose-50"
                }`}
              >
                <p
                  className={`text-2xl font-black leading-none ${
                    pct >= 90 ? "text-[#00182E]" : pct >= 80 ? "text-[#013FF6]" : "text-rose-600"
                  }`}
                >
                  {pct}%
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">dari 80%</p>
              </div>
            </div>
          )}

          {/* ═══ INFORMASI TERBARU ═══ */}
          <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#013FF6]/10 flex items-center justify-center">
                  <Bell size={14} className="text-[#013FF6]" />
                </div>
                <span className="text-sm font-bold text-slate-800">Informasi Terbaru</span>
              </div>
              <a
                href="/siswa/informasi"
                className="flex items-center gap-1 text-xs text-[#013FF6] font-semibold bg-[#013FF6]/8 border border-[#013FF6]/20 rounded-full px-3 py-1.5 hover:bg-[#013FF6]/15 transition-colors no-underline"
              >
                Lihat semua <ChevronRight size={13} />
              </a>
            </div>

            <div>
              {loadingInfo ? (
                <div className="p-8 flex justify-center">
                  <div className="w-6 h-6 border-2 border-slate-200 border-t-[#013FF6] rounded-full animate-spin" />
                </div>
              ) : informasiList.length === 0 ? (
                <div className="py-12 flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-2xl bg-[#013FF6]/8 flex items-center justify-center">
                    <Bell size={18} className="text-[#013FF6]/40" />
                  </div>
                  <p className="text-sm text-slate-400">Belum ada informasi terbaru.</p>
                  <p className="text-xs text-slate-300">Pengumuman baru akan muncul di sini.</p>
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
                      className={`flex items-start gap-3 px-5 py-4 cursor-pointer hover:bg-slate-50 transition-colors ${
                        !isLast ? "border-b border-slate-100" : ""
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-xl ${config.iconCls} flex items-center justify-center shrink-0 mt-0.5`}
                      >
                        {config.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${config.pill}`}>
                            {item.tipe || "Umum"}
                          </span>
                          {item.tempatPKL && (
                            <span className="text-xs text-slate-400">{item.tempatPKL}</span>
                          )}
                          <span className="text-xs text-slate-400 ml-auto">
                            {formatTanggal(item.tanggal)}
                          </span>
                        </div>
                        <p className={`text-sm font-semibold text-slate-800 mb-0.5 ${isExpanded ? "" : "truncate"}`}>
                          {item.judul}
                        </p>
                        <p className={`text-xs text-slate-500 leading-relaxed ${isExpanded ? "" : "truncate"}`}>
                          {item.isi}
                        </p>
                      </div>
                      <ChevronRight
                        size={15}
                        className={`text-slate-300 shrink-0 mt-1 transition-transform duration-200 ${
                          isExpanded ? "rotate-90" : ""
                        }`}
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
