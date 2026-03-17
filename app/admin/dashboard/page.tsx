"use client";
import Sidebar from "@/components/layout/SidebarAdmin";
import TopBar from "@/components/layout/TopBar";
import GreetingBanner from "@/components/GreetingBanner";
import { useState, useEffect, useMemo } from "react";
import { Users } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

const DONUT_COLORS = ["#6366f1", "#a78bfa", "#e24b4a"];

const DonutTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 10, padding: "8px 12px", fontSize: 13 }}>
      <p style={{ fontWeight: 500, margin: "0 0 2px", color: "var(--color-text-primary)" }}>{payload[0].name}</p>
      <p style={{ margin: 0, color: "var(--color-text-secondary)" }}>Jumlah: <strong style={{ color: "var(--color-text-primary)" }}>{payload[0].value}</strong></p>
    </div>
  );
};

const KELAS_THEMES = [
  { bg: "#eef2ff", border: "#c7d2fe", av: ["#e0e7ff", "#4338ca"], bar: "#6366f1" },
  { bg: "#f5f3ff", border: "#ddd6fe", av: ["#ede9fe", "#6d28d9"], bar: "#7c3aed" },
  { bg: "#faf5ff", border: "#e9d5ff", av: ["#f3e8ff", "#7e22ce"], bar: "#9333ea" },
  { bg: "#fef2f2", border: "#fecaca", av: ["#fee2e2", "#991b1b"], bar: "#e24b4a" },
  { bg: "#fff7ed", border: "#fed7aa", av: ["#ffedd5", "#9a3412"], bar: "#ea580c" },
  { bg: "#f0fdf4", border: "#bbf7d0", av: ["#dcfce7", "#166534"], bar: "#16a34a" },
];

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalSiswa: 0, hadirHariIni: 0, tidakHadir: 0, persentaseKehadiran: 0 });
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
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchDashboard();
  }, []);

  const izin = useMemo(() => Math.max(0, stats.totalSiswa - stats.hadirHariIni - stats.tidakHadir), [stats]);
  const pct = stats.persentaseKehadiran;

  const donutData = useMemo(() => [
    { name: "Hadir", value: stats.hadirHariIni },
    { name: "Izin/Sakit", value: izin },
    { name: "Tidak Hadir", value: stats.tidakHadir },
  ].filter(d => d.value > 0), [stats, izin]);

  const bestKelas = classData.length > 0 ? [...classData].sort((a, b) => b.persentase - a.persentase)[0] : null;
  const worstKelas = classData.length > 0 ? [...classData].sort((a, b) => a.persentase - b.persentase)[0] : null;
  const hariIni = new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  const trendData = [
    { day: "Sen", hadir: 88, absen: 12 },
    { day: "Sel", hadir: 91, absen: 9 },
    { day: "Rab", hadir: 85, absen: 15 },
    { day: "Kam", hadir: 92, absen: 8 },
    { day: "Jum", hadir: stats.hadirHariIni || 87, absen: stats.tidakHadir || 13 },
  ];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <main className="flex-1 p-6 sm:p-8 overflow-y-auto overflow-x-hidden">
          <GreetingBanner />
          <p className="text-gray-500 text-sm -mt-4 mb-5">Pantau statistik kehadiran siswa secara keseluruhan.</p>

          <div className="rounded-2xl p-6 mb-5 relative overflow-hidden" style={{ background: "linear-gradient(135deg,#1e1b4b 0%,#312e81 60%,#4c1d95 100%)" }}>
            <div className="absolute w-64 h-64 rounded-full -right-16 -top-16" style={{ background: "rgba(129,140,248,.15)" }} />
            <div className="absolute w-40 h-40 rounded-full" style={{ background: "rgba(196,181,253,.1)", left: "32%", bottom: "-60px" }} />
            <div className="absolute w-20 h-20 rounded-full left-2 top-2" style={{ background: "rgba(167,139,250,.18)" }} />
            <div className="relative z-10 flex items-end justify-between flex-wrap gap-4">
              <div>
                <h2 className="text-xl font-medium text-white mb-1">Selamat datang, Admin 👋</h2>
                <p className="text-sm" style={{ color: "rgba(199,210,254,.75)" }}>{hariIni} · Statistik kehadiran hari ini</p>
                <div className="flex gap-2 mt-3 flex-wrap">
                  {[
                    { label: `${pct}% hadir`, bg: "rgba(134,239,172,.15)", color: "#86efac", border: "rgba(134,239,172,.25)" },
                    { label: `${stats.totalSiswa} siswa`, bg: "rgba(196,181,253,.12)", color: "#c4b5fd", border: "rgba(196,181,253,.2)" },
                    { label: `${stats.tidakHadir} tidak hadir`, bg: "rgba(252,165,165,.12)", color: "#fca5a5", border: "rgba(252,165,165,.2)" },
                  ].map(b => (
                    <span key={b.label} className="px-3 py-1 rounded-full text-xs font-medium border" style={{ background: b.bg, color: b.color, borderColor: b.border }}>{loading ? "—" : b.label}</span>
                  ))}
                </div>
              </div>
              <div className="flex rounded-xl overflow-hidden" style={{ background: "rgba(255,255,255,.08)", border: "1px solid rgba(255,255,255,.12)" }}>
                {[{ v: stats.hadirHariIni, l: "Hadir", c: "#fff" }, { v: izin, l: "Izin", c: "#fbbf24" }, { v: stats.tidakHadir, l: "Alfa", c: "#f87171" }].map((s, i) => (
                  <div key={s.l} className="px-4 py-3 text-center" style={{ borderRight: i < 2 ? "1px solid rgba(255,255,255,.1)" : "none" }}>
                    <div className="text-xl font-medium leading-none" style={{ color: s.c }}>{loading ? "—" : s.v}</div>
                    <div className="text-xs mt-1" style={{ color: "rgba(199,210,254,.65)" }}>{s.l}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-4">
            <div className="lg:col-span-2 bg-white border border-indigo-50 rounded-2xl p-5">
              <p className="text-xs font-medium text-indigo-400 uppercase tracking-wider mb-3">Distribusi kehadiran</p>
              {loading ? (
                <div className="w-36 h-36 rounded-full bg-gray-100 animate-pulse mx-auto mb-3" />
              ) : donutData.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-8 text-gray-300"><Users className="w-8 h-8" /><p className="text-sm">Belum ada data</p></div>
              ) : (
                <div className="relative w-36 h-36 mx-auto mb-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={donutData} cx="50%" cy="50%" innerRadius={44} outerRadius={66} paddingAngle={3} dataKey="value" startAngle={90} endAngle={-270}>
                        {donutData.map((_, i) => <Cell key={i} fill={DONUT_COLORS[i]} />)}
                      </Pie>
                      <Tooltip content={<DonutTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-2xl font-semibold text-indigo-900 leading-none">{pct}%</span>
                    <span className="text-xs text-gray-400 mt-1">hadir</span>
                  </div>
                </div>
              )}
              <div className="space-y-2.5">
                {[
                  { label: "Hadir", val: stats.hadirHariIni, color: "#6366f1", pctVal: pct },
                  { label: "Izin/Sakit", val: izin, color: "#a78bfa", pctVal: stats.totalSiswa > 0 ? Math.round((izin / stats.totalSiswa) * 100) : 0 },
                  { label: "Alfa", val: stats.tidakHadir, color: "#e24b4a", pctVal: stats.totalSiswa > 0 ? Math.round((stats.tidakHadir / stats.totalSiswa) * 100) : 0 },
                ].map(b => (
                  <div key={b.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-sm flex-shrink-0" style={{ background: b.color }} />
                      <span className="text-sm text-gray-600">{b.label}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-800">{loading ? "—" : b.val} <span className="text-xs text-gray-400">{b.pctVal}%</span></span>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-3 bg-white border border-indigo-50 rounded-2xl p-5">
              <p className="text-xs font-medium text-indigo-400 uppercase tracking-wider mb-3">Kehadiran per kelas</p>
              {loading ? (
                <div className="grid grid-cols-2 gap-3">{[...Array(4)].map((_, i) => <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />)}</div>
              ) : classData.length === 0 ? (
                <div className="flex items-center justify-center h-32 text-gray-400 text-sm">Tidak ada data.</div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto">
                    {classData.map((item, i) => {
                      const th = KELAS_THEMES[i % KELAS_THEMES.length];
                      const initials = item.kelas.split(" ").map((w: string) => w[0]).join("").slice(0, 2);
                      const barColor = item.persentase >= 80 ? "#6366f1" : item.persentase >= 60 ? "#a78bfa" : "#e24b4a";
                      const bdg = item.persentase >= 80 ? { bg: "#eef2ff", tc: "#3730a3" } : item.persentase >= 60 ? { bg: "#f5f3ff", tc: "#5b21b6" } : { bg: "#fef2f2", tc: "#991b1b" };
                      const izinKelas = Math.max(0, (item.total || 0) - (item.hadir || 0) - (item.tidakHadir || 0));
                      return (
                        <div key={i} className="rounded-xl p-3 relative overflow-hidden border" style={{ background: th.bg, borderColor: th.border }}>
                          <div className="absolute -right-3 -bottom-3 w-14 h-14 rounded-full" style={{ background: th.bar, opacity: 0.12 }} />
                          <div className="flex items-center justify-between mb-2 relative z-10">
                            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-medium" style={{ background: th.av[0], color: th.av[1] }}>{initials}</div>
                            <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: bdg.bg, color: bdg.tc }}>{item.persentase}%</span>
                          </div>
                          <p className="text-xs font-medium relative z-10 mb-0.5" style={{ color: th.av[1] }}>{item.kelas}</p>
                          <p className="text-xs relative z-10 mb-2" style={{ color: th.av[1], opacity: 0.6 }}>{item.hadir}/{item.total} siswa</p>
                          <div className="h-1.5 rounded-full overflow-hidden relative z-10" style={{ background: "rgba(0,0,0,.08)" }}>
                            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${item.persentase}%`, background: barColor }} />
                          </div>
                          <div className="flex justify-between mt-1.5 relative z-10">
                            <span className="text-[10px]" style={{ color: th.av[1], opacity: 0.55 }}>{item.hadir} hadir</span>
                            <span className="text-[10px]" style={{ color: th.av[1], opacity: 0.55 }}>{izinKelas} izin · {item.tidakHadir || 0} alfa</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex gap-2 mt-3">
                    {[
                      { v: classData.reduce((a, c) => a + (c.total || 0), 0), l: "Total", bg: "#eef2ff", tc: "#4338ca" },
                      { v: classData.reduce((a, c) => a + (c.hadir || 0), 0), l: "Hadir", bg: "#eef2ff", tc: "#3730a3" },
                      { v: izin, l: "Izin", bg: "#f5f3ff", tc: "#5b21b6" },
                      { v: stats.tidakHadir, l: "Alfa", bg: "#fef2f2", tc: "#991b1b" },
                    ].map(s => (
                      <div key={s.l} className="flex-1 text-center rounded-lg py-2" style={{ background: s.bg }}>
                        <div className="text-sm font-medium" style={{ color: s.tc }}>{loading ? "—" : s.v}</div>
                        <div className="text-[10px] mt-0.5" style={{ color: s.tc, opacity: 0.7 }}>{s.l}</div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 bg-white border border-indigo-50 rounded-2xl p-5">
              <p className="text-xs font-medium text-indigo-400 uppercase tracking-wider mb-1">Tren kehadiran 5 hari terakhir</p>
              <div className="flex gap-3 mb-3">
                <span className="flex items-center gap-1.5 text-xs text-gray-500"><span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: "#6366f1" }} />Hadir</span>
                <span className="flex items-center gap-1.5 text-xs text-gray-500"><span className="w-2.5 h-2.5 rounded-sm inline-block bg-indigo-100" />Tidak hadir</span>
              </div>
              <div style={{ height: 140 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={trendData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                    <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                    <Bar dataKey="hadir" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={32} />
                    <Bar dataKey="absen" fill="#e0e7ff" radius={[4, 4, 0, 0]} maxBarSize={32} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-2xl p-5 flex flex-col justify-between" style={{ background: "linear-gradient(135deg,#4338ca,#6d28d9)" }}>
              <p className="text-xs font-medium uppercase tracking-wider mb-3" style={{ color: "rgba(196,181,253,.7)" }}>Insight hari ini</p>
              <div className="text-center my-2">
                <div className="text-5xl font-semibold text-white leading-none">{loading ? "—" : `${pct}%`}</div>
                <div className="text-sm mt-2" style={{ color: "rgba(196,181,253,.8)" }}>Rata-rata kehadiran</div>
              </div>
              <div className="space-y-2 text-sm pt-3 border-t" style={{ borderColor: "rgba(255,255,255,.12)", color: "rgba(196,181,253,.7)" }}>
                <p>Terbaik: <strong className="text-white">{bestKelas?.kelas ?? "—"}</strong>{bestKelas ? ` — ${bestKelas.persentase}%` : ""}</p>
                <p>Perhatian: <strong style={{ color: "#fca5a5" }}>{worstKelas?.kelas ?? "—"}</strong>{worstKelas ? ` — ${worstKelas.persentase}%` : ""}</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}