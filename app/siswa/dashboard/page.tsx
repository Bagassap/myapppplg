"use client";
import Sidebar from "@/components/layout/SidebarSiswa";
import TopBar from "@/components/layout/TopBar";
import { useState } from "react";
import {
  Users,
  CheckCircle,
  XCircle,
  TrendingUp,
  Download,
  Filter,
  Bell,
  Calendar,
} from "lucide-react";

export default function SiswaDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState("Bulan Ini");

  const stats = {
    totalHariBulanIni: 22,
    hadirBulanIni: 20,
    tidakHadirBulanIni: 2,
    persentaseKehadiran: 91,
  };

  const kehadiranData = [
    { tanggal: "2023-10-01", status: "Hadir", catatan: "" },
    { tanggal: "2023-10-02", status: "Hadir", catatan: "" },
    { tanggal: "2023-10-03", status: "Tidak Hadir", catatan: "Sakit" },
    { tanggal: "2023-10-04", status: "Hadir", catatan: "" },
    { tanggal: "2023-10-05", status: "Hadir", catatan: "" },
    { tanggal: "2023-10-06", status: "Tidak Hadir", catatan: "Izin" },
  ];

  const notifications = [
    {
      pesan: "Anda telah hadir 20 hari bulan ini. Pertahankan!",
      tingkat: "Positif",
    },
    { pesan: "Pengingat: Jangan lupa absen hari ini.", tingkat: "Info" },
  ];

  const handleExport = () => {
    alert("Laporan kehadiran pribadi diekspor ke file PDF!");
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        {/* PERUBAHAN: Padding diperbesar (p-6 sm:p-8 lg:p-12) */}
        <main className="flex-1 p-6 sm:p-8 lg:p-12 overflow-y-auto overflow-x-hidden">
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Siswa Dashboard
            </h1>
            <p className="text-gray-600 text-sm sm:text-base md:text-lg">
              Pantau ringkasan kehadiran pribadi Anda di tempat PKL.
            </p>
          </div>

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
                {stats.totalHariBulanIni}
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
                {stats.hadirBulanIni}
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
                {stats.tidakHadirBulanIni}
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
                {stats.persentaseKehadiran}%
              </p>
            </div>
          </div>

          {/* Notifikasi Pribadi */}
          <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-100 mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <Bell className="w-6 h-6 text-orange-600" />
              Notifikasi Pribadi
            </h3>
            <div className="space-y-4">
              {notifications.map((notif, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-xl border-l-4 ${
                    notif.tingkat === "Positif"
                      ? "border-green-500 bg-green-50"
                      : "border-blue-500 bg-blue-50"
                  }`}
                >
                  <p className="text-gray-700">{notif.pesan}</p>
                  <span
                    className={`text-sm font-medium ${
                      notif.tingkat === "Positif"
                        ? "text-green-600"
                        : "text-blue-600"
                    }`}
                  >
                    {notif.tingkat}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
