"use client";
import Sidebar from "@/components/layout/SidebarGuru";
import TopBar from "@/components/layout/TopBar";
import GreetingBanner from "@/components/GreetingBanner";
import { useState, useEffect, useMemo } from "react";
import { Users } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

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

const SISWA_THEMES = [
  {
    bg: "#eef2ff",
    border: "#c7d2fe",
    av: ["#e0e7ff", "#4338ca"],
    bar: "#6366f1",
  },
  {
    bg: "#f5f3ff",
    border: "#ddd6fe",
    av: ["#ede9fe", "#6d28d9"],
    bar: "#7c3aed",
  },
  {
    bg: "#fef2f2",
    border: "#fecaca",
    av: ["#fee2e2", "#991b1b"],
    bar: "#e24b4a",
  },
  {
    bg: "#fff7ed",
    border: "#fed7aa",
    av: ["#ffedd5", "#9a3412"],
    bar: "#ea580c",
  },
  {
    bg: "#f0fdf4",
    border: "#bbf7d0",
    av: ["#dcfce7", "#166534"],
    bar: "#16a34a",
  },
  {
    bg: "#faf5ff",
    border: "#e9d5ff",
    av: ["#f3e8ff", "#7e22ce"],
    bar: "#9333ea",
  },
];

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
    const fetchDashboard = async () => {
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
    };
    fetchDashboard();
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
      ? [...pklData].sort((a, b) => {
          const pa =
            a.totalHari > 0 ? Math.round((a.hadir / a.totalHari) * 100) : 0;
          const pb =
            b.totalHari > 0 ? Math.round((b.hadir / b.totalHari) * 100) : 0;
          return pb - pa;
        })[0]
      : null;
  const worstSiswa =
    pklData.length > 0
      ? [...pklData]
          .filter((s) => (s.totalHari ?? 0) > 0)
          .sort((a, b) => {
            const pa = Math.round((a.hadir / a.totalHari) * 100);
            const pb = Math.round((b.hadir / b.totalHari) * 100);
            return pa - pb;
          })[0]
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
          <p className="text-gray-500 text-sm -mt-4 mb-5">
            Pantau kehadiran siswa bimbingan Anda di tempat PKL.
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
            <div className="relative z-10 flex items-end justify-between flex-wrap gap-4">
              <div>
                <h2 className="text-xl font-medium text-white mb-1">
                  Selamat datang, Guru 👋
                </h2>
                <p
                  className="text-sm"
                  style={{ color: "rgba(199,210,254,.75)" }}
                >
                  {hariIni} · Siswa bimbingan PKL Anda
                </p>
                <div className="flex gap-2 mt-3 flex-wrap">
                  {[
                    {
                      label: `${pct}% hadir`,
                      bg: "rgba(134,239,172,.15)",
                      color: "#86efac",
                      border: "rgba(134,239,172,.25)",
                    },
                    {
                      label: `${stats.totalSiswaPKL} siswa PKL`,
                      bg: "rgba(196,181,253,.12)",
                      color: "#c4b5fd",
                      border: "rgba(196,181,253,.2)",
                    },
                    {
                      label: `${stats.tidakHadir} tidak hadir`,
                      bg: "rgba(252,165,165,.12)",
                      color: "#fca5a5",
                      border: "rgba(252,165,165,.2)",
                    },
                  ].map((b) => (
                    <span
                      key={b.label}
                      className="px-3 py-1 rounded-full text-xs font-medium border"
                      style={{
                        background: b.bg,
                        color: b.color,
                        borderColor: b.border,
                      }}
                    >
                      {loading ? "—" : b.label}
                    </span>
                  ))}
                </div>
              </div>
              <div
                className="flex rounded-xl overflow-hidden"
                style={{
                  background: "rgba(255,255,255,.08)",
                  border: "1px solid rgba(255,255,255,.12)",
                }}
              >
                {[
                  { v: stats.hadirHariIni, l: "Hadir", c: "#fff" },
                  { v: izin, l: "Izin", c: "#fbbf24" },
                  { v: stats.tidakHadir, l: "Alfa", c: "#f87171" },
                ].map((s, i) => (
                  <div
                    key={s.l}
                    className="px-4 py-3 text-center"
                    style={{
                      borderRight:
                        i < 2 ? "1px solid rgba(255,255,255,.1)" : "none",
                    }}
                  >
                    <div
                      className="text-xl font-medium leading-none"
                      style={{ color: s.c }}
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

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-4">
            <div className="lg:col-span-2 bg-white border border-indigo-50 rounded-2xl p-5">
              <p className="text-xs font-medium text-indigo-400 uppercase tracking-wider mb-3">
                Distribusi kehadiran
              </p>
              {loading ? (
                <div className="w-36 h-36 rounded-full bg-gray-100 animate-pulse mx-auto mb-3" />
              ) : donutData.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-8 text-gray-300">
                  <Users className="w-8 h-8" />
                  <p className="text-sm">Belum ada data</p>
                </div>
              ) : (
                <div className="relative w-36 h-36 mx-auto mb-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={donutData}
                        cx="50%"
                        cy="50%"
                        innerRadius={44}
                        outerRadius={66}
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
                    <span className="text-2xl font-semibold text-indigo-900 leading-none">
                      {pct}%
                    </span>
                    <span className="text-xs text-gray-400 mt-1">hadir</span>
                  </div>
                </div>
              )}
              <div className="space-y-2.5">
                {[
                  {
                    label: "Hadir",
                    val: stats.hadirHariIni,
                    color: "#6366f1",
                    pctVal: pct,
                  },
                  {
                    label: "Izin/Sakit",
                    val: izin,
                    color: "#a78bfa",
                    pctVal:
                      stats.totalSiswaPKL > 0
                        ? Math.round((izin / stats.totalSiswaPKL) * 100)
                        : 0,
                  },
                  {
                    label: "Alfa",
                    val: stats.tidakHadir,
                    color: "#e24b4a",
                    pctVal:
                      stats.totalSiswaPKL > 0
                        ? Math.round(
                            (stats.tidakHadir / stats.totalSiswaPKL) * 100,
                          )
                        : 0,
                  },
                ].map((b) => (
                  <div
                    key={b.label}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2 h-2 rounded-sm flex-shrink-0"
                        style={{ background: b.color }}
                      />
                      <span className="text-sm text-gray-600">{b.label}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-800">
                      {loading ? "—" : b.val}{" "}
                      <span className="text-xs text-gray-400">{b.pctVal}%</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-3 bg-white border border-indigo-50 rounded-2xl p-5">
              <p className="text-xs font-medium text-indigo-400 uppercase tracking-wider mb-3">
                Kehadiran per siswa PKL
              </p>
              {loading ? (
                <div className="space-y-3">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className="h-16 bg-gray-100 rounded-xl animate-pulse"
                    />
                  ))}
                </div>
              ) : pklData.length === 0 ? (
                <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
                  Tidak ada data siswa bimbingan.
                </div>
              ) : (
                <>
                  <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                    {pklData.map((item, i) => {
                      const total = item.totalHari ?? item.total ?? 0;
                      const hadir = item.hadir ?? 0;
                      const p =
                        total > 0 ? Math.round((hadir / total) * 100) : 0;
                      const izinSiswa = Math.max(
                        0,
                        total - hadir - (item.tidakHadir ?? 0),
                      );
                      const th = SISWA_THEMES[i % SISWA_THEMES.length];
                      const initial = (item.siswa || item.tempatPKL || "?")
                        .charAt(0)
                        .toUpperCase();
                      const barColor =
                        p >= 80 ? "#6366f1" : p >= 60 ? "#a78bfa" : "#e24b4a";
                      const bdg =
                        p >= 80
                          ? { bg: "#eef2ff", tc: "#3730a3" }
                          : p >= 60
                            ? { bg: "#f5f3ff", tc: "#5b21b6" }
                            : { bg: "#fef2f2", tc: "#991b1b" };
                      return (
                        <div
                          key={i}
                          className="rounded-xl p-3 relative overflow-hidden border"
                          style={{ background: th.bg, borderColor: th.border }}
                        >
                          <div
                            className="absolute -right-3 -bottom-3 w-14 h-14 rounded-full"
                            style={{ background: th.bar, opacity: 0.12 }}
                          />
                          <div className="flex items-center justify-between mb-2 relative z-10">
                            <div className="flex items-center gap-2">
                              <div
                                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0"
                                style={{
                                  background: th.av[0],
                                  color: th.av[1],
                                }}
                              >
                                {initial}
                              </div>
                              <div className="min-w-0">
                                <p
                                  className="text-xs font-medium truncate max-w-[140px]"
                                  style={{ color: th.av[1] }}
                                >
                                  {item.siswa || item.tempatPKL}
                                </p>
                                {item.siswa && item.tempatPKL && (
                                  <p
                                    className="text-[10px] truncate max-w-[140px]"
                                    style={{ color: th.av[1], opacity: 0.6 }}
                                  >
                                    {item.tempatPKL}
                                  </p>
                                )}
                              </div>
                            </div>
                            <span
                              className="text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0"
                              style={{ background: bdg.bg, color: bdg.tc }}
                            >
                              {p}%
                            </span>
                          </div>
                          <div
                            className="h-1.5 rounded-full overflow-hidden relative z-10"
                            style={{ background: "rgba(0,0,0,.08)" }}
                          >
                            <div
                              className="h-full rounded-full transition-all duration-700"
                              style={{ width: `${p}%`, background: barColor }}
                            />
                          </div>
                          <div className="flex gap-2 mt-2 relative z-10">
                            <span
                              className="text-[10px] px-1.5 py-0.5 rounded-md font-medium"
                              style={{ background: th.av[0], color: th.av[1] }}
                            >
                              {hadir} hadir
                            </span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded-md font-medium bg-purple-50 text-purple-700">
                              {izinSiswa} izin
                            </span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded-md font-medium bg-red-50 text-red-700">
                              {item.tidakHadir ?? 0} alfa
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex gap-2 mt-3">
                    {[
                      {
                        v: stats.totalSiswaPKL,
                        l: "Total",
                        bg: "#eef2ff",
                        tc: "#4338ca",
                      },
                      {
                        v: stats.hadirHariIni,
                        l: "Hadir",
                        bg: "#eef2ff",
                        tc: "#3730a3",
                      },
                      { v: izin, l: "Izin", bg: "#f5f3ff", tc: "#5b21b6" },
                      {
                        v: stats.tidakHadir,
                        l: "Alfa",
                        bg: "#fef2f2",
                        tc: "#991b1b",
                      },
                    ].map((s) => (
                      <div
                        key={s.l}
                        className="flex-1 text-center rounded-lg py-2"
                        style={{ background: s.bg }}
                      >
                        <div
                          className="text-sm font-medium"
                          style={{ color: s.tc }}
                        >
                          {loading ? "—" : s.v}
                        </div>
                        <div
                          className="text-[10px] mt-0.5"
                          style={{ color: s.tc, opacity: 0.7 }}
                        >
                          {s.l}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          <div
            className="rounded-2xl p-5"
            style={{ background: "linear-gradient(135deg,#4338ca,#6d28d9)" }}
          >
            <p
              className="text-xs font-medium uppercase tracking-wider mb-3"
              style={{ color: "rgba(196,181,253,.7)" }}
            >
              Insight siswa bimbingan
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-4xl font-semibold text-white leading-none">
                  {loading ? "—" : `${pct}%`}
                </div>
                <div
                  className="text-sm mt-1"
                  style={{ color: "rgba(196,181,253,.8)" }}
                >
                  Rata-rata kehadiran
                </div>
              </div>
              <div
                className="text-sm pt-2 sm:pt-0 sm:border-l sm:pl-4"
                style={{
                  borderColor: "rgba(255,255,255,.12)",
                  color: "rgba(196,181,253,.7)",
                }}
              >
                <p className="mb-1">Terbaik</p>
                <p className="text-white font-medium text-base">
                  {bestSiswa?.siswa ?? "—"}
                </p>
                {bestSiswa && (
                  <p
                    style={{ color: "rgba(196,181,253,.6)" }}
                    className="text-xs"
                  >
                    {bestSiswa.tempatPKL}
                  </p>
                )}
              </div>
              <div
                className="text-sm sm:border-l sm:pl-4"
                style={{
                  borderColor: "rgba(255,255,255,.12)",
                  color: "rgba(196,181,253,.7)",
                }}
              >
                <p className="mb-1">Perlu perhatian</p>
                <p
                  style={{ color: "#fca5a5" }}
                  className="font-medium text-base"
                >
                  {worstSiswa?.siswa ?? "—"}
                </p>
                {worstSiswa && (
                  <p
                    style={{ color: "rgba(252,165,165,.6)" }}
                    className="text-xs"
                  >
                    {worstSiswa.tempatPKL}
                  </p>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
