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
  Users,
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

const DONUT_COLORS = ["#6366f1", "#a78bfa", "#e24b4a"];

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

  const miniCards = [
    {
      v: `${pct}%`,
      l: "Kehadiran",
      bg: "#eef2ff",
      border: "#c7d2fe",
      tc: "#4338ca",
    },
    {
      v: pct >= 80 ? "Baik" : pct >= 60 ? "Cukup" : "Kurang",
      l: "Status PKL",
      bg: pct >= 80 ? "#f0fdf4" : pct >= 60 ? "#fff7ed" : "#fef2f2",
      border: pct >= 80 ? "#bbf7d0" : pct >= 60 ? "#fed7aa" : "#fecaca",
      tc: pct >= 80 ? "#166534" : pct >= 60 ? "#9a3412" : "#991b1b",
    },
    {
      v: `${stats.hadirBulanIni}`,
      l: "Hari hadir",
      bg: "#f5f3ff",
      border: "#ddd6fe",
      tc: "#5b21b6",
    },
  ];

  const breakdown = [
    {
      label: "Hadir",
      val: stats.hadirBulanIni,
      color: "#6366f1",
      barBg: "#e0e7ff",
    },
    { label: "Izin/Sakit", val: izin, color: "#a78bfa", barBg: "#ede9fe" },
    {
      label: "Tidak hadir",
      val: stats.tidakHadirBulanIni,
      color: "#e24b4a",
      barBg: "#fee2e2",
    },
  ];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-gray-50 px-4 sm:px-6 lg:px-8 py-7">
          <GreetingBanner />
          <p className="text-gray-500 text-sm -mt-4 mb-5">
            Pantau kehadiran PKL pribadi Anda.
          </p>

          <div
            className="rounded-2xl p-6 mb-5 relative overflow-hidden"
            style={{
              background:
                "linear-gradient(135deg,#1e1b4b 0%,#312e81 60%,#4c1d95 100%)",
            }}
          >
            <div
              className="absolute w-64 h-64 rounded-full -right-16 -top-16"
              style={{ background: "rgba(129,140,248,.15)" }}
            />
            <div
              className="absolute w-40 h-40 rounded-full"
              style={{
                background: "rgba(196,181,253,.1)",
                left: "32%",
                bottom: "-60px",
              }}
            />
            <div
              className="absolute w-20 h-20 rounded-full left-2 top-2"
              style={{ background: "rgba(167,139,250,.18)" }}
            />
            <div className="relative z-10">
              <h2 className="text-xl font-medium text-white mb-1">Halo 👋</h2>
              <p
                className="text-sm mb-4"
                style={{ color: "rgba(199,210,254,.75)" }}
              >
                {hariIni} · Rekap kehadiran bulan ini
              </p>
              <div className="flex gap-3 flex-wrap">
                {[
                  { v: stats.totalHariBulanIni, l: "Total hari" },
                  { v: stats.hadirBulanIni, l: "Hadir", c: "#86efac" },
                  { v: izin, l: "Izin", c: "#fbbf24" },
                  { v: stats.tidakHadirBulanIni, l: "Alfa", c: "#f87171" },
                ].map((s, i) => (
                  <div
                    key={s.l}
                    className="rounded-xl px-4 py-2.5 text-center"
                    style={{
                      background: "rgba(255,255,255,.1)",
                      border: "1px solid rgba(255,255,255,.12)",
                    }}
                  >
                    <div
                      className="text-lg font-medium leading-none"
                      style={{ color: s.c ?? "#fff" }}
                    >
                      {loading ? "—" : s.v}
                    </div>
                    <div
                      className="text-xs mt-1"
                      style={{ color: "rgba(199,210,254,.65)" }}
                    >
                      {s.l}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-4">
            {miniCards.map((c) => (
              <div
                key={c.l}
                className="rounded-xl p-3 text-center border"
                style={{ background: c.bg, borderColor: c.border }}
              >
                <div
                  className="text-lg font-semibold leading-none"
                  style={{ color: c.tc }}
                >
                  {loading ? "—" : c.v}
                </div>
                <div
                  className="text-[10px] mt-1.5"
                  style={{ color: c.tc, opacity: 0.7 }}
                >
                  {c.l}
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
            <div className="bg-white border border-indigo-50 rounded-2xl p-5">
              <p className="text-xs font-medium text-indigo-400 uppercase tracking-wider mb-3">
                Distribusi bulan ini
              </p>
              {loading ? (
                <div className="w-32 h-32 rounded-full bg-gray-100 animate-pulse mx-auto mb-3" />
              ) : donutData.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-8 text-gray-300">
                  <Users className="w-8 h-8" />
                  <p className="text-sm">Belum ada data</p>
                </div>
              ) : (
                <div className="relative w-32 h-32 mx-auto mb-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={donutData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={60}
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
                    <span className="text-xl font-semibold text-indigo-900 leading-none">
                      {pct}%
                    </span>
                    <span className="text-[10px] text-gray-400 mt-1">
                      hadir
                    </span>
                  </div>
                </div>
              )}
              <div className="space-y-2">
                {[
                  {
                    label: "Hadir",
                    val: stats.hadirBulanIni,
                    color: "#6366f1",
                  },
                  { label: "Izin/Sakit", val: izin, color: "#a78bfa" },
                  {
                    label: "Alfa",
                    val: stats.tidakHadirBulanIni,
                    color: "#e24b4a",
                  },
                ].map((b) => (
                  <div
                    key={b.label}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2 h-2 rounded-sm"
                        style={{ background: b.color }}
                      />
                      <span className="text-sm text-gray-600">{b.label}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-800">
                      {loading ? "—" : b.val}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-indigo-50 rounded-2xl p-5">
              <p className="text-xs font-medium text-indigo-400 uppercase tracking-wider mb-4">
                Progres kehadiran
              </p>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-sm text-gray-700 font-medium">
                      Total kehadiran
                    </span>
                    <span
                      className="text-sm font-semibold"
                      style={{
                        color:
                          pct >= 80
                            ? "#6366f1"
                            : pct >= 60
                              ? "#a78bfa"
                              : "#e24b4a",
                      }}
                    >
                      {pct}%
                    </span>
                  </div>
                  <div className="h-2.5 bg-indigo-50 rounded-full overflow-hidden relative">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${Math.min(pct, 100)}%`,
                        background:
                          pct >= 80
                            ? "#6366f1"
                            : pct >= 60
                              ? "#a78bfa"
                              : "#e24b4a",
                      }}
                    />
                    <div
                      className="absolute top-0 h-full w-0.5 bg-indigo-400 opacity-40"
                      style={{ left: "80%" }}
                    />
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-[10px] text-gray-400">0%</span>
                    <span className="text-[10px] text-indigo-400">
                      Target 80%
                    </span>
                    <span className="text-[10px] text-gray-400">100%</span>
                  </div>
                  {pct >= 80 && (
                    <p className="text-[10px] text-indigo-500 mt-1">
                      Target tercapai 🎉
                    </p>
                  )}
                  {pct < 80 && (
                    <p className="text-[10px] text-red-400 mt-1">
                      Butuh {80 - pct}% lagi untuk mencapai target
                    </p>
                  )}
                </div>
                <div className="border-t border-gray-100 pt-3 space-y-2.5">
                  {breakdown.map((b) => {
                    const bPct =
                      stats.totalHariBulanIni > 0
                        ? Math.round((b.val / stats.totalHariBulanIni) * 100)
                        : 0;
                    return (
                      <div key={b.label}>
                        <div className="flex justify-between mb-1">
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
                            className="text-xs font-medium"
                            style={{ color: b.color }}
                          >
                            {loading ? "—" : `${b.val} hari (${bPct}%)`}
                          </span>
                        </div>
                        <div
                          className="h-1.5 rounded-full overflow-hidden"
                          style={{ background: b.barBg }}
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
          </div>

          <div className="bg-white border border-indigo-50 rounded-2xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-medium text-gray-700 text-sm flex items-center gap-2">
                <Bell className="w-4 h-4 text-indigo-500" /> Informasi terbaru
              </h3>
              <a
                href="/siswa/informasi"
                className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium transition-colors bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-full"
              >
                Lihat semua <ChevronRight className="w-3.5 h-3.5" />
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
                          <p className="font-medium text-gray-800 text-sm truncate">
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
