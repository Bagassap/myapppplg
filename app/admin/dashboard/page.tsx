"use client";
import Sidebar from "@/components/layout/SidebarAdmin";
import TopBar from "@/components/layout/TopBar";
import GreetingBanner from "@/components/GreetingBanner";
import { useState, useEffect, useMemo } from "react";
import {
  SlidersHorizontal,
  TrendingUp,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const DONUT_COLORS = ["#10b981", "#f59e0b", "#f43f5e"];

const DonutTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-100 rounded-xl shadow-xl px-3 py-2 text-sm">
        <p className="font-semibold text-gray-800">{payload[0].name}</p>
        <p className="text-gray-500">
          Jumlah:{" "}
          <span className="font-bold text-gray-900">{payload[0].value}</span>
        </p>
      </div>
    );
  }
  return null;
};

export default function AdminDashboard() {
  const [selectedClass, setSelectedClass] = useState("Semua Kelas");
  const [selectedPeriod, setSelectedPeriod] = useState("Semua Periode");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSiswa: 0,
    hadirHariIni: 0,
    tidakHadir: 0,
    persentaseKehadiran: 0,
  });
  const [classData, setClassData] = useState<any[]>([]);
  const [filters, setFilters] = useState({
    kelas: [] as { id: string; label: string }[],
    tanggal: [] as string[],
  });

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const res = await fetch("/api/dashboard/filters");
        if (res.ok) {
          const data = await res.json();
          setFilters({ kelas: data.kelas || [], tanggal: data.tanggal || [] });
          if (data.tanggal && data.tanggal.length > 0)
            setSelectedPeriod(data.tanggal[0]);
        }
      } catch (error) {
        console.error("Gagal load filter", error);
      }
    };
    fetchFilters();
  }, []);

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (selectedClass !== "Semua Kelas")
          params.append("kelas", selectedClass);
        if (selectedPeriod !== "Semua Periode")
          params.append("tanggal", selectedPeriod);
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
  }, [selectedClass, selectedPeriod]);

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

  const breakdown = [
    {
      label: "Hadir",
      value: stats.hadirHariIni,
      color: "#10b981",
      icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    },
    {
      label: "Izin/Sakit",
      value: izin,
      color: "#f59e0b",
      icon: <Clock className="w-3.5 h-3.5" />,
    },
    {
      label: "Tidak Hadir",
      value: stats.tidakHadir,
      color: "#f43f5e",
      icon: <XCircle className="w-3.5 h-3.5" />,
    },
  ];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <main className="flex-1 p-6 sm:p-8 lg:p-10 overflow-y-auto overflow-x-hidden">
          <GreetingBanner />
          <p className="text-gray-500 text-sm sm:text-base -mt-4 mb-7">
            Pantau statistik kehadiran siswa secara keseluruhan.
          </p>

          <div className="bg-white px-5 py-4 rounded-2xl shadow-sm border border-gray-100 mb-6 flex flex-wrap gap-3 items-center">
            <SlidersHorizontal className="w-4 h-4 text-indigo-400 shrink-0" />
            <div className="flex flex-wrap gap-3 flex-1">
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-xl bg-gray-50 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 min-w-[140px]"
              >
                <option>Semua Kelas</option>
                {filters.kelas.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.label}
                  </option>
                ))}
              </select>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-xl bg-gray-50 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 min-w-[140px]"
              >
                <option>Semua Periode</option>
                {filters.tanggal.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-500" />
              <h3 className="text-sm font-semibold text-gray-700">
                Ringkasan Kehadiran
              </h3>
              <span className="ml-auto text-xs text-gray-400 bg-gray-50 border border-gray-200 px-2.5 py-0.5 rounded-full">
                {selectedPeriod}
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-gray-100">
              <div className="p-6 flex flex-col items-center justify-center gap-5">
                {loading ? (
                  <div className="w-52 h-52 rounded-full bg-gray-100 animate-pulse" />
                ) : donutData.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 text-gray-300 py-10">
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
                          innerRadius={62}
                          outerRadius={92}
                          paddingAngle={3}
                          dataKey="value"
                          startAngle={90}
                          endAngle={-270}
                        >
                          {donutData.map((_, i) => (
                            <Cell
                              key={i}
                              fill={DONUT_COLORS[i % DONUT_COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip content={<DonutTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-3xl font-black text-gray-900 leading-none">
                        {stats.totalSiswa}
                      </span>
                      <span className="text-xs text-gray-400 mt-0.5">
                        total siswa
                      </span>
                      <span
                        className={`text-xs font-bold mt-1.5 px-2.5 py-0.5 rounded-full ${stats.persentaseKehadiran >= 80 ? "bg-emerald-100 text-emerald-700" : stats.persentaseKehadiran >= 60 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}
                      >
                        {stats.persentaseKehadiran}% hadir
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap justify-center gap-2.5">
                  {breakdown.map((b) => (
                    <div
                      key={b.label}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border"
                      style={{
                        borderColor: `${b.color}30`,
                        background: `${b.color}08`,
                      }}
                    >
                      <span style={{ color: b.color }}>{b.icon}</span>
                      <span className="text-xs font-semibold text-gray-600">
                        {b.label}
                      </span>
                      <span
                        className="text-xs font-black"
                        style={{ color: b.color }}
                      >
                        {loading ? "—" : b.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-6">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" /> Laporan per Kelas
                </h4>
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
                    {classData.map((item, i) => (
                      <div
                        key={i}
                        className="group hover:bg-gray-50 rounded-xl p-2 -mx-2 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-lg bg-indigo-50 flex items-center justify-center">
                              <span className="text-[10px] font-black text-indigo-600">
                                {i + 1}
                              </span>
                            </div>
                            <span className="text-sm font-semibold text-gray-800">
                              {item.kelas}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-400">
                              {item.hadir}/{item.total}
                            </span>
                            <span
                              className={`text-xs font-bold px-2 py-0.5 rounded-full ${item.persentase >= 80 ? "bg-emerald-100 text-emerald-700" : item.persentase >= 60 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}
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
                              background:
                                item.persentase >= 80
                                  ? "#10b981"
                                  : item.persentase >= 60
                                    ? "#f59e0b"
                                    : "#f43f5e",
                            }}
                          />
                        </div>
                      </div>
                    ))}
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
