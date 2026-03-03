"use client";
import Sidebar from "@/components/layout/SidebarSiswa";
import GreetingBanner from "@/components/GreetingBanner";
import TopBar from "@/components/layout/TopBar";
import { useState, useEffect } from "react";
import {
  CheckCircle,
  XCircle,
  TrendingUp,
  Calendar,
  Bell,
  ChevronRight,
  Megaphone,
  Info,
  AlertCircle,
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

  const getTipeConfig = (tipe: string) => {
    switch (tipe?.toLowerCase()) {
      case "pengumuman":
        return {
          icon: <Megaphone className="w-4 h-4" />,
          bg: "bg-yellow-100",
          text: "text-yellow-700",
          border: "border-yellow-200",
          dot: "bg-yellow-400",
        };
      case "peringatan":
        return {
          icon: <AlertCircle className="w-4 h-4" />,
          bg: "bg-red-100",
          text: "text-red-700",
          border: "border-red-200",
          dot: "bg-red-400",
        };
      default:
        return {
          icon: <Info className="w-4 h-4" />,
          bg: "bg-blue-100",
          text: "text-blue-700",
          border: "border-blue-200",
          dot: "bg-blue-400",
        };
    }
  };

  const formatTanggal = (tanggal: string) => {
    return new Date(tanggal).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <main className="flex-1 p-6 sm:p-8 lg:p-12 overflow-y-auto overflow-x-hidden">
          {/* ✅ Greeting Banner */}
          <GreetingBanner role="Siswa" />
          <p className="text-gray-600 text-sm sm:text-base md:text-lg -mt-4 mb-6 sm:mb-8">
            Pantau ringkasan kehadiran pribadi Anda di tempat PKL.
          </p>

          {/* Statistik Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
            <div className="bg-gradient-to-br from-blue-100 to-blue-200 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-blue-200">
              <div className="flex items-center justify-between mb-4">
                <Calendar className="w-8 h-8 text-blue-600" />
                <span className="text-sm font-medium text-blue-700">Total</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Total Hari Kerja
              </h3>
              <p className="text-3xl font-bold text-blue-600">
                {loading ? "..." : stats?.totalHariBulanIni || 0}
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-100 to-green-200 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-green-200">
              <div className="flex items-center justify-between mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
                <span className="text-sm font-medium text-green-700">
                  Hadir
                </span>
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Hari Hadir
              </h3>
              <p className="text-3xl font-bold text-green-600">
                {loading ? "..." : stats?.hadirBulanIni || 0}
              </p>
            </div>

            <div className="bg-gradient-to-br from-red-100 to-red-200 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-red-200">
              <div className="flex items-center justify-between mb-4">
                <XCircle className="w-8 h-8 text-red-600" />
                <span className="text-sm font-medium text-red-700">Absen</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Hari Tidak Hadir
              </h3>
              <p className="text-3xl font-bold text-red-600">
                {loading ? "..." : stats?.tidakHadirBulanIni || 0}
              </p>
            </div>

            <div className="bg-gradient-to-br from-indigo-100 to-blue-200 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-indigo-200">
              <div className="flex items-center justify-between mb-4">
                <TrendingUp className="w-8 h-8 text-indigo-600" />
                <span className="text-sm font-medium text-indigo-700">
                  Persentase
                </span>
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Persentase Kehadiran
              </h3>
              <p className="text-3xl font-bold text-indigo-600">
                {loading ? "..." : stats?.persentaseKehadiran || 0}%
              </p>
            </div>
          </div>

          {/* Card Notifikasi Informasi */}
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Bell className="w-5 h-5 sm:w-7 sm:h-7 text-indigo-600" />
                Informasi Terbaru
              </h3>
              <a
                href="/siswa/informasi"
                className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
              >
                Lihat Semua <ChevronRight className="w-4 h-4" />
              </a>
            </div>

            <div className="divide-y divide-gray-50">
              {loadingInfo ? (
                <div className="p-8 flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
                </div>
              ) : informasiList.length === 0 ? (
                <div className="p-8 text-center text-gray-400">
                  <Bell className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Belum ada informasi terbaru.</p>
                </div>
              ) : (
                informasiList.map((item) => {
                  const config = getTipeConfig(item.tipe);
                  const isExpanded = expandedId === item.id;
                  return (
                    <div
                      key={item.id}
                      className="p-4 sm:p-5 hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => setExpandedId(isExpanded ? null : item.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`mt-0.5 shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${config.bg} ${config.text}`}
                        >
                          {config.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span
                              className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${config.bg} ${config.text} ${config.border}`}
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
                          <p className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                            {item.judul}
                          </p>
                          {isExpanded ? (
                            <p className="text-sm text-gray-600 mt-1 leading-relaxed whitespace-pre-line">
                              {item.isi}
                            </p>
                          ) : (
                            <p className="text-sm text-gray-500 mt-0.5 truncate">
                              {item.isi}
                            </p>
                          )}
                        </div>
                        <ChevronRight
                          className={`w-4 h-4 text-gray-300 shrink-0 mt-1 transition-transform ${isExpanded ? "rotate-90" : ""}`}
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
