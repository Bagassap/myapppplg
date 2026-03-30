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
    <div className="bg-white border border-gray-100 rounded-xl px-3 py-2 text-xs shadow-lg">
      <p className="font-semibold text-gray-800">{payload[0].name}</p>
      <p className="text-gray-500">
        Jumlah: <strong className="text-gray-900">{payload[0].value}</strong>
      </p>
    </div>
  );
};

const getTipeConfig = (tipe: string) => {
  switch (tipe?.toLowerCase()) {
    case "pengumuman":
      return {
        icon: <Megaphone className="w-3.5 h-3.5" />,
        pill: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
        iconBg: "bg-amber-50",
        iconText: "text-amber-600",
      };
    case "peringatan":
      return {
        icon: <AlertCircle className="w-3.5 h-3.5" />,
        pill: "bg-red-50 text-red-700 ring-1 ring-red-200",
        iconBg: "bg-red-50",
        iconText: "text-red-600",
      };
    default:
      return {
        icon: <Info className="w-3.5 h-3.5" />,
        pill: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
        iconBg: "bg-emerald-50",
        iconText: "text-emerald-600",
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

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-gray-50 px-4 sm:px-6 lg:px-8 py-7">
          <GreetingBanner />

          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 p-6 shadow-xl mb-5">
            <div className="absolute w-64 h-64 rounded-full right-[-50px] top-[-80px] bg-emerald-500/10 pointer-events-none" />
            <div className="absolute w-40 h-40 rounded-full left-[32%] bottom-[-60px] bg-amber-500/8 pointer-events-none" />
            <div className="relative z-10">
              <p className="text-slate-400 text-xs mb-1">{hariIni}</p>
              <p className="text-white text-sm mb-4">
                Pantau kehadiran PKL Anda bulan ini
              </p>
              <div className="flex gap-3 flex-wrap">
                {[
                  { v: stats.totalHariBulanIni, l: "Total hari", c: "#94a3b8" },
                  { v: stats.hadirBulanIni, l: "Hadir", c: "#34d399" },
                  { v: izin, l: "Izin", c: "#fbbf24" },
                  { v: stats.tidakHadirBulanIni, l: "Alfa", c: "#f87171" },
                ].map((s, i) => (
                  <div
                    key={i}
                    className="rounded-xl px-4 py-2.5 text-center min-w-[64px]"
                    style={{
                      background: "rgba(255,255,255,.08)",
                      border: "1px solid rgba(255,255,255,.1)",
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

          <div className="grid grid-cols-3 gap-3 mb-4">
            {[
              {
                v: `${pct}%`,
                l: "Kehadiran",
                bg: pct >= 80 ? "#f0fdf4" : pct >= 60 ? "#fefce8" : "#fef2f2",
                tc: pct >= 80 ? "#166534" : pct >= 60 ? "#854d0e" : "#991b1b",
                border:
                  pct >= 80 ? "#bbf7d0" : pct >= 60 ? "#fef08a" : "#fecaca",
              },
              {
                v: "Hadir",
                l: "Status hari ini",
                bg: "#f0fdf4",
                tc: "#166534",
                border: "#bbf7d0",
              },
              {
                v: stats.hadirBulanIni,
                l: "Hari hadir",
                bg: "#f1f5f9",
                tc: "#475569",
                border: "#e2e8f0",
              },
            ].map((c, i) => (
              <div
                key={i}
                className="rounded-2xl p-4 border text-center"
                style={{ background: c.bg, borderColor: c.border }}
              >
                <p
                  className="text-xl font-black leading-none"
                  style={{ color: c.tc }}
                >
                  {loading ? "—" : c.v}
                </p>
                <p
                  className="text-[10px] mt-1.5"
                  style={{ color: c.tc, opacity: 0.7 }}
                >
                  {c.l}
                </p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-1.5">
                <TrendingUp className="w-3 h-3 text-emerald-500" /> Distribusi
                bulan ini
              </p>
              {loading ? (
                <div className="w-32 h-32 rounded-full bg-gray-100 animate-pulse mx-auto" />
              ) : (
                <div className="flex items-center gap-5">
                  <div className="relative w-32 h-32 shrink-0">
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
                          innerRadius={40}
                          outerRadius={60}
                          paddingAngle={3}
                          dataKey="value"
                          startAngle={90}
                          endAngle={-270}
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
                      <span className="text-xl font-black text-slate-800 leading-none">
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
                        val: stats.hadirBulanIni,
                        color: "#10b981",
                      },
                      { label: "Izin/Sakit", val: izin, color: "#f59e0b" },
                      {
                        label: "Alfa",
                        val: stats.tidakHadirBulanIni,
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

            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-1.5">
                <TrendingUp className="w-3 h-3 text-emerald-500" /> Progres
                kehadiran
              </p>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-xs font-medium text-gray-600">
                      Total kehadiran
                    </span>
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded-full"
                      style={{
                        background:
                          pct >= 80
                            ? "#f0fdf4"
                            : pct >= 60
                              ? "#fefce8"
                              : "#fef2f2",
                        color:
                          pct >= 80
                            ? "#166534"
                            : pct >= 60
                              ? "#854d0e"
                              : "#991b1b",
                      }}
                    >
                      {pct}%
                    </span>
                  </div>
                  <div className="relative h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: loading ? "0%" : `${Math.min(pct, 100)}%`,
                        background:
                          pct >= 80
                            ? "#10b981"
                            : pct >= 60
                              ? "#f59e0b"
                              : "#f43f5e",
                      }}
                    />
                    <div
                      className="absolute top-0 h-full w-0.5 bg-slate-400 opacity-40"
                      style={{ left: "80%" }}
                    />
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-[10px] text-gray-400">0%</span>
                    <span className="text-[10px] text-gray-400">
                      Target 80%
                    </span>
                    <span className="text-[10px] text-gray-400">100%</span>
                  </div>
                  {!loading && pct >= 80 && (
                    <p className="text-[10px] text-emerald-600 mt-1 font-semibold">
                      Anda melampaui target kehadiran 🎉
                    </p>
                  )}
                  {!loading && pct < 80 && (
                    <p className="text-[10px] text-amber-600 mt-1 font-semibold">
                      Butuh {80 - pct}% lagi untuk mencapai target
                    </p>
                  )}
                </div>
                {[
                  {
                    label: "Hadir",
                    val: stats.hadirBulanIni,
                    color: "#10b981",
                    bg: "#f0fdf4",
                  },
                  {
                    label: "Izin/Sakit",
                    val: izin,
                    color: "#f59e0b",
                    bg: "#fefce8",
                  },
                  {
                    label: "Alfa",
                    val: stats.tidakHadirBulanIni,
                    color: "#f43f5e",
                    bg: "#fef2f2",
                  },
                ].map((b) => {
                  const bPct =
                    stats.totalHariBulanIni > 0
                      ? Math.round((b.val / stats.totalHariBulanIni) * 100)
                      : 0;
                  return (
                    <div key={b.label}>
                      <div className="flex justify-between items-center mb-1">
                        <div className="flex items-center gap-1.5">
                          <span
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ background: b.color }}
                          />
                          <span className="text-xs text-gray-600">
                            {b.label}
                          </span>
                        </div>
                        <span
                          className="text-xs font-semibold"
                          style={{ color: b.color }}
                        >
                          {loading ? "—" : `${b.val} hari (${bPct}%)`}
                        </span>
                      </div>
                      <div
                        className="h-1.5 rounded-full overflow-hidden"
                        style={{ background: b.bg }}
                      >
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: loading ? "0%" : `${bPct}%`,
                            background: b.color,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold text-gray-700 text-sm flex items-center gap-2">
                <Bell className="w-4 h-4 text-emerald-500" /> Informasi terbaru
              </h3>
              <a
                href="/siswa/informasi"
                className="flex items-center gap-1 text-xs text-emerald-700 hover:text-emerald-900 font-medium bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full transition-colors"
              >
                Lihat semua <ChevronRight className="w-3.5 h-3.5" />
              </a>
            </div>
            <div className="divide-y divide-gray-50">
              {loadingInfo ? (
                <div className="p-8 flex justify-center">
                  <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-emerald-500" />
                </div>
              ) : informasiList.length === 0 ? (
                <div className="py-14 flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center mb-3">
                    <Bell className="w-5 h-5 text-emerald-300" />
                  </div>
                  <p className="text-sm text-gray-500">
                    Belum ada informasi terbaru.
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Pengumuman baru akan muncul di sini.
                  </p>
                </div>
              ) : (
                informasiList.map((item) => {
                  const config = getTipeConfig(item.tipe);
                  const isExpanded = expandedId === item.id;
                  return (
                    <div
                      key={item.id}
                      className="px-5 py-4 hover:bg-gray-50 transition-colors cursor-pointer group"
                      onClick={() => setExpandedId(isExpanded ? null : item.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`shrink-0 mt-0.5 w-8 h-8 rounded-xl flex items-center justify-center ${config.iconBg} ${config.iconText}`}
                        >
                          {config.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span
                              className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full ${config.pill}`}
                            >
                              {item.tipe || "Umum"}
                            </span>
                            {item.tempatPKL && (
                              <span className="text-xs text-gray-400">
                                {item.tempatPKL}
                              </span>
                            )}
                            <span className="text-xs text-gray-400 ml-auto">
                              {formatTanggal(item.tanggal)}
                            </span>
                          </div>
                          <p className="font-semibold text-gray-800 text-sm truncate">
                            {item.judul}
                          </p>
                          {isExpanded ? (
                            <p className="text-sm text-gray-600 mt-1.5 leading-relaxed whitespace-pre-line">
                              {item.isi}
                            </p>
                          ) : (
                            <p className="text-xs text-gray-500 mt-0.5 truncate">
                              {item.isi}
                            </p>
                          )}
                        </div>
                        <ChevronRight
                          className={`w-4 h-4 text-gray-300 shrink-0 mt-1 transition-transform group-hover:text-gray-400 ${isExpanded ? "rotate-90" : ""}`}
                        />
                      </div>
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
