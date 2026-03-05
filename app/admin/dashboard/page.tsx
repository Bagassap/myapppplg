"use client";
import Sidebar from "@/components/layout/SidebarAdmin";
import TopBar from "@/components/layout/TopBar";
import GreetingBanner from "@/components/GreetingBanner";
import AbsensiChart from "@/components/dashboard/AbsensiChart";
import { useState, useEffect, useMemo } from "react";
import {
  Users,
  CheckCircle,
  XCircle,
  TrendingUp,
  SlidersHorizontal,
} from "lucide-react";

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
          setFilters({
            kelas: data.kelas || [],
            tanggal: data.tanggal || [],
          });
          if (data.tanggal && data.tanggal.length > 0) {
            setSelectedPeriod(data.tanggal[0]);
          }
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

  // Transformasi classData → format chart
  const chartData = useMemo(() => {
    if (!classData.length) return [];
    return classData.map((item: any) => ({
      label: item.kelas,
      hadir: item.hadir ?? 0,
      izin: item.izin ?? 0,
      tidakHadir: (item.total ?? 0) - (item.hadir ?? 0) - (item.izin ?? 0),
    }));
  }, [classData]);

  const statCards = [
    {
      icon: <Users className="w-7 h-7 text-blue-600" />,
      label: "Total Siswa",
      value: stats.totalSiswa,
      bg: "from-blue-50 to-blue-100",
      border: "border-blue-200",
      text: "text-blue-600",
      badge: "text-blue-500",
      badgeLabel: "Total",
    },
    {
      icon: <CheckCircle className="w-7 h-7 text-green-600" />,
      label: "Hadir",
      value: stats.hadirHariIni,
      bg: "from-green-50 to-green-100",
      border: "border-green-200",
      text: "text-green-600",
      badge: "text-green-500",
      badgeLabel: "Hari Ini",
    },
    {
      icon: <XCircle className="w-7 h-7 text-red-500" />,
      label: "Tidak Hadir",
      value: stats.tidakHadir,
      bg: "from-red-50 to-red-100",
      border: "border-red-200",
      text: "text-red-500",
      badge: "text-red-400",
      badgeLabel: "Absen",
    },
    {
      icon: <TrendingUp className="w-7 h-7 text-indigo-600" />,
      label: "Kehadiran",
      value: `${stats.persentaseKehadiran}%`,
      bg: "from-indigo-50 to-blue-100",
      border: "border-indigo-200",
      text: "text-indigo-600",
      badge: "text-indigo-400",
      badgeLabel: "Persentase",
    },
  ];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <main className="flex-1 p-6 sm:p-8 lg:p-12 overflow-y-auto overflow-x-hidden">
          <GreetingBanner />
          <p className="text-gray-500 text-sm sm:text-base -mt-4 mb-7">
            Pantau statistik kehadiran siswa secara keseluruhan.
          </p>

          {/* ── Filter sederhana ─────────────────────────────────── */}
          <div className="bg-white px-5 py-4 rounded-2xl shadow-sm border border-gray-100 mb-7 flex flex-wrap gap-3 items-center">
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

          {/* ── Statistik Cards ───────────────────────────────────── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
            {statCards.map((card, i) => (
              <div
                key={i}
                className={`bg-gradient-to-br ${card.bg} p-5 rounded-2xl border ${card.border} shadow-sm`}
              >
                <div className="flex items-center justify-between mb-3">
                  {card.icon}
                  <span className={`text-xs font-medium ${card.badge}`}>
                    {card.badgeLabel}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mb-1">{card.label}</p>
                <p className={`text-2xl sm:text-3xl font-bold ${card.text}`}>
                  {loading ? (
                    <span className="text-gray-300 animate-pulse">—</span>
                  ) : (
                    card.value
                  )}
                </p>
              </div>
            ))}
          </div>

          {/* ── Grafik ───────────────────────────────────────────── */}
          <AbsensiChart data={chartData} loading={loading} />

          {/* ── Tabel per Kelas ──────────────────────────────────── */}
          <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Laporan per Kelas
            </h3>
            <div className="w-full overflow-x-auto">
              <table className="w-full table-auto border-collapse min-w-[500px] text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-5 py-3 text-left font-semibold text-gray-600 rounded-tl-xl">
                      Kelas
                    </th>
                    <th className="px-5 py-3 text-left font-semibold text-gray-600">
                      Hadir
                    </th>
                    <th className="px-5 py-3 text-left font-semibold text-gray-600">
                      Total Siswa
                    </th>
                    <th className="px-5 py-3 text-left font-semibold text-gray-600 rounded-tr-xl">
                      Persentase
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="text-center py-8 text-gray-400"
                      >
                        Memuat data...
                      </td>
                    </tr>
                  ) : classData.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="text-center py-8 text-gray-400"
                      >
                        Tidak ada data sesuai filter.
                      </td>
                    </tr>
                  ) : (
                    classData.map((item, index) => (
                      <tr
                        key={index}
                        className="border-b border-gray-50 hover:bg-indigo-50/40 transition-colors"
                      >
                        <td className="px-5 py-3 font-medium text-gray-900">
                          {item.kelas}
                        </td>
                        <td className="px-5 py-3">
                          <span className="text-green-600 font-semibold">
                            {item.hadir}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-gray-600">
                          {item.total}
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 max-w-[80px] bg-gray-100 rounded-full h-1.5">
                              <div
                                className="bg-indigo-500 h-1.5 rounded-full"
                                style={{ width: `${item.persentase}%` }}
                              />
                            </div>
                            <span className="text-gray-700 font-medium text-xs">
                              {item.persentase}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
