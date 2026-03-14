"use client";
import Sidebar from "@/components/layout/SidebarSiswa";
import GreetingBanner from "@/components/GreetingBanner";
import TopBar from "@/components/layout/TopBar";
import { useState, useEffect } from "react";
import {
  TrendingUp,
  Bell,
  ChevronRight,
  Megaphone,
  Info,
  AlertCircle,
  Users,
  CheckCircle2,
  XCircle,
  Calendar,
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

const DONUT_COLORS = ["#639922", "#ba7517", "#e24b4a"];

const DonutTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "var(--color-background-primary)",
        border: "0.5px solid var(--color-border-tertiary)",
        borderRadius: 10,
        padding: "8px 12px",
        fontSize: 13,
      }}
    >
      <p
        style={{
          fontWeight: 500,
          margin: "0 0 2px",
          color: "var(--color-text-primary)",
        }}
      >
        {payload[0].name}
      </p>
      <p style={{ margin: 0, color: "var(--color-text-secondary)" }}>
        Jumlah:{" "}
        <strong style={{ color: "var(--color-text-primary)" }}>
          {payload[0].value}
        </strong>
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
        iconBg: "bg-amber-50 ring-1 ring-amber-200",
        iconText: "text-amber-600",
      };
    case "peringatan":
      return {
        icon: <AlertCircle className="w-3.5 h-3.5" />,
        pill: "bg-red-50 text-red-700 ring-1 ring-red-200",
        iconBg: "bg-red-50 ring-1 ring-red-200",
        iconText: "text-red-600",
      };
    default:
      return {
        icon: <Info className="w-3.5 h-3.5" />,
        pill: "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200",
        iconBg: "bg-indigo-50 ring-1 ring-indigo-200",
        iconText: "text-indigo-600",
      };
  }
};

const formatTanggal = (tanggal: string) =>
  new Date(tanggal).toLocaleDateString("id-ID", {
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
      } catch (error) {
        console.error("Gagal mengambil data dashboard", error);
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
      } catch (error) {
        console.error("Gagal mengambil informasi", error);
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

  const donutData = [
    { name: "Hadir", value: stats.hadirBulanIni },
    { name: "Izin/Sakit", value: izin },
    { name: "Tidak Hadir", value: stats.tidakHadirBulanIni },
  ].filter((d) => d.value > 0);

  const pct = stats.persentaseKehadiran;
  const badgeStyle =
    pct >= 80
      ? { background: "#eaf3de", color: "#3b6d11" }
      : pct >= 60
        ? { background: "#faeeda", color: "#854f0b" }
        : { background: "#fcebeb", color: "#a32d2d" };

  const breakdown = [
    {
      label: "Hadir",
      value: stats.hadirBulanIni,
      bg: "#eaf3de",
      color: "#3b6d11",
      dot: "#639922",
      Icon: CheckCircle2,
    },
    {
      label: "Izin/Sakit",
      value: izin,
      bg: "#faeeda",
      color: "#854f0b",
      dot: "#ba7517",
      Icon: Calendar,
    },
    {
      label: "Tidak Hadir",
      value: stats.tidakHadirBulanIni,
      bg: "#fcebeb",
      color: "#a32d2d",
      dot: "#e24b4a",
      Icon: XCircle,
    },
  ];

  const miniStats = [
    {
      label: "Total Hari",
      value: stats.totalHariBulanIni,
      color: "text-indigo-600",
    },
    { label: "Hadir", value: stats.hadirBulanIni, color: "text-emerald-600" },
    {
      label: "Tidak Hadir",
      value: stats.tidakHadirBulanIni,
      color: "text-red-500",
    },
  ];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-gray-50 px-4 sm:px-6 lg:px-8 py-7">
          <GreetingBanner />
          <p className="text-gray-500 text-sm -mt-4 mb-7">
            Pantau ringkasan kehadiran pribadi Anda di tempat PKL.
          </p>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-500" />
                <p className="text-sm font-semibold text-gray-700">
                  Ringkasan Kehadiran
                </p>
              </div>
              <span className="text-xs text-gray-400 bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-full">
                Bulan Ini
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="p-6 lg:border-r border-gray-100 flex flex-col items-center gap-6">
                {loading ? (
                  <div className="w-52 h-52 rounded-full bg-gray-100 animate-pulse" />
                ) : donutData.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 py-12 text-gray-300">
                    <Users className="w-10 h-10" />
                    <p className="text-sm">Belum ada data</p>
                  </div>
                ) : (
                  <div className="relative w-52 h-52">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={donutData}
                          cx="50%"
                          cy="50%"
                          innerRadius={64}
                          outerRadius={94}
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
                      <span className="text-4xl font-bold text-gray-900 leading-none">
                        {stats.totalHariBulanIni}
                      </span>
                      <span className="text-xs text-gray-400 mt-1">
                        total hari
                      </span>
                      <span
                        className="text-xs font-semibold mt-2 px-2.5 py-0.5 rounded-full"
                        style={badgeStyle}
                      >
                        {pct}% hadir
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap justify-center gap-2">
                  {breakdown.map((b) => (
                    <div
                      key={b.label}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm border"
                      style={{
                        background: b.bg,
                        borderColor: `${b.dot}40`,
                        color: b.color,
                      }}
                    >
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ background: b.dot }}
                      />
                      <span className="font-medium">{b.label}</span>
                      <span className="font-bold">
                        {loading ? "—" : b.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-6 flex flex-col gap-5">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Progres Kehadiran
                    </p>
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded-full"
                      style={badgeStyle}
                    >
                      {loading ? "—" : `${pct}%`}
                    </span>
                  </div>
                  <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: loading ? "0%" : `${Math.min(pct, 100)}%`,
                        background:
                          pct >= 80
                            ? "#639922"
                            : pct >= 60
                              ? "#ba7517"
                              : "#e24b4a",
                      }}
                    />
                  </div>
                  <div className="flex justify-between mt-1.5">
                    <span className="text-xs text-gray-400">0%</span>
                    <span className="text-xs text-gray-400">Target 80%</span>
                    <span className="text-xs text-gray-400">100%</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {miniStats.map((s) => (
                    <div
                      key={s.label}
                      className="text-center p-3 bg-gray-50 rounded-xl border border-gray-100 hover:bg-gray-100 transition-colors"
                    >
                      <p className={`text-xl font-bold ${s.color}`}>
                        {loading ? (
                          <span className="text-gray-300 animate-pulse">—</span>
                        ) : (
                          s.value
                        )}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-auto pt-2 border-t border-gray-100">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                    Rincian Kehadiran
                  </p>
                  <div className="space-y-2.5">
                    {breakdown.map((b) => {
                      const bPct =
                        stats.totalHariBulanIni > 0
                          ? Math.round(
                              (b.value / stats.totalHariBulanIni) * 100,
                            )
                          : 0;
                      return (
                        <div key={b.label}>
                          <div className="flex justify-between items-center mb-1">
                            <div className="flex items-center gap-1.5">
                              <span
                                className="w-2 h-2 rounded-full"
                                style={{ background: b.dot }}
                              />
                              <span className="text-xs text-gray-600">
                                {b.label}
                              </span>
                            </div>
                            <span
                              className="text-xs font-semibold"
                              style={{ color: b.color }}
                            >
                              {loading ? "—" : `${b.value} hari (${bPct}%)`}
                            </span>
                          </div>
                          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-700"
                              style={{
                                width: loading ? "0%" : `${bPct}%`,
                                background: b.dot,
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold text-gray-700 text-sm flex items-center gap-2">
                <Bell className="w-4 h-4 text-indigo-500" />
                Informasi Terbaru
              </h3>
              <a
                href="/siswa/informasi"
                className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium transition-colors bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-full"
              >
                Lihat Semua <ChevronRight className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="divide-y divide-gray-50">
              {loadingInfo ? (
                <div className="p-8 flex justify-center">
                  <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-indigo-500" />
                </div>
              ) : informasiList.length === 0 ? (
                <div className="py-14 flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mb-3">
                    <Bell className="w-5 h-5 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-500 font-medium">
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
