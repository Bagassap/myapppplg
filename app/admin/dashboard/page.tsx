"use client";
import Sidebar from "@/components/layout/SidebarAdmin";
import TopBar from "@/components/layout/TopBar";
import GreetingBanner from "@/components/GreetingBanner";
import { useState, useEffect, useMemo } from "react";
import { Users, CheckCircle2, XCircle, Clock, TrendingUp } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

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
    const fetchDashboard = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.append("t", new Date().getTime().toString());
        const res = await fetch(`/api/dashboard?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          if (data.cards) setStats(data.cards);
          if (data.table) setClassData(data.table);
        }
      } catch (error) {
        console.error("Gagal load dashboard", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const izin = useMemo(() => {
    const val = stats.totalSiswa - stats.hadirHariIni - stats.tidakHadir;
    return val > 0 ? val : 0;
  }, [stats]);

  const donutData = useMemo(
    () =>
      [
        { name: "Hadir", value: stats.hadirHariIni },
        { name: "Izin/Sakit", value: izin },
        { name: "Tidak Hadir", value: stats.tidakHadir },
      ].filter((d) => d.value > 0),
    [stats, izin],
  );

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
      value: stats.hadirHariIni,
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
      Icon: Clock,
    },
    {
      label: "Tidak Hadir",
      value: stats.tidakHadir,
      bg: "#fcebeb",
      color: "#a32d2d",
      dot: "#e24b4a",
      Icon: XCircle,
    },
  ];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <main className="flex-1 p-6 sm:p-8 lg:p-10 overflow-y-auto overflow-x-hidden">
          <GreetingBanner />
          <p className="text-gray-500 text-sm -mt-4 mb-7">
            Pantau statistik kehadiran siswa secara keseluruhan.
          </p>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-500" />
                <p className="text-sm font-semibold text-gray-700">
                  Ringkasan Kehadiran
                </p>
              </div>
              <span className="text-xs text-gray-400 bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-full">
                Hari Ini
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
                        {stats.totalSiswa}
                      </span>
                      <span className="text-xs text-gray-400 mt-1">
                        total siswa
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

              <div className="p-6">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" /> Laporan per Kelas
                </p>
                {loading ? (
                  <div className="space-y-3">
                    {[...Array(4)].map((_, i) => (
                      <div
                        key={i}
                        className="h-10 bg-gray-100 rounded-xl animate-pulse"
                      />
                    ))}
                  </div>
                ) : classData.length === 0 ? (
                  <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
                    Tidak ada data.
                  </div>
                ) : (
                  <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                    {classData.map((item, i) => {
                      const barColor =
                        item.persentase >= 80
                          ? "#639922"
                          : item.persentase >= 60
                            ? "#ba7517"
                            : "#e24b4a";
                      const bdg =
                        item.persentase >= 80
                          ? { bg: "#eaf3de", color: "#3b6d11" }
                          : item.persentase >= 60
                            ? { bg: "#faeeda", color: "#854f0b" }
                            : { bg: "#fcebeb", color: "#a32d2d" };
                      return (
                        <div
                          key={i}
                          className="group hover:bg-gray-50 rounded-xl p-2 -mx-2 transition-colors cursor-default"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                                <span className="text-[10px] font-bold text-indigo-600">
                                  {i + 1}
                                </span>
                              </div>
                              <span className="text-sm text-gray-800">
                                {item.kelas}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-400">
                                {item.hadir}/{item.total}
                              </span>
                              <span
                                className="text-xs font-semibold px-2 py-0.5 rounded-full"
                                style={bdg}
                              >
                                {item.persentase}%
                              </span>
                            </div>
                          </div>
                          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-700"
                              style={{
                                width: `${item.persentase}%`,
                                background: barColor,
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
