// components/absensi/TidakHadirSection.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import {
  UserX,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface SiswaTidakHadir {
  userId: string;
  nama: string;
  kelas: string;
  tempatPKL: string;
  guruPembimbing: string;
}

interface Props {
  period: string;
  role: "admin" | "guru";
}

export default function TidakHadirSection({ period, role }: Props) {
  const [data, setData] = useState<SiswaTidakHadir[]>([]);
  const [loading, setLoading] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [lastFetch, setLastFetch] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchTidakHadir = useCallback(async () => {
    setLoading(true);
    setCurrentPage(1);
    try {
      const date = new Date().toISOString().split("T")[0];
      const res = await fetch(`/api/absensi/tidak-hadir?date=${date}`);
      if (!res.ok) throw new Error("Gagal fetch");
      const json = await res.json();
      setData(json);
      setLastFetch(new Date().toLocaleTimeString("id-ID"));
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchTidakHadir();
  }, [fetchTidakHadir]);

  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = data.slice(startIndex, startIndex + itemsPerPage);

  const today = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-red-100 overflow-hidden mt-6 sm:mt-10">
      {/* Header */}
      <div
        className="p-4 sm:p-6 border-b border-red-100 flex items-center justify-between cursor-pointer select-none"
        onClick={() => setCollapsed((c) => !c)}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-50 rounded-xl">
            <UserX className="w-5 h-5 sm:w-6 sm:h-6 text-red-500" />
          </div>
          <div>
            <h3 className="text-base sm:text-xl font-bold text-gray-900 flex items-center gap-2">
              Siswa Belum Absen Hari Ini
              {data.length > 0 && (
                <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-600">
                  {data.length}
                </span>
              )}
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">{today}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              fetchTidakHadir();
            }}
            disabled={loading}
            className="p-2 rounded-xl hover:bg-gray-100 transition-colors disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw
              className={`w-4 h-4 text-gray-500 ${loading ? "animate-spin" : ""}`}
            />
          </button>
          {collapsed ? (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </div>

      {/* Body */}
      {!collapsed && (
        <>
          <div className="p-4 sm:p-6">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-400" />
              </div>
            ) : data.length === 0 ? (
              <div className="flex flex-col items-center py-10 text-center">
                <div className="text-4xl mb-3">🎉</div>
                <p className="text-green-600 font-semibold text-sm sm:text-base">
                  Semua siswa sudah absen hari ini!
                </p>
                {lastFetch && (
                  <p className="text-xs text-gray-400 mt-1">
                    Terakhir diperbarui: {lastFetch}
                  </p>
                )}
              </div>
            ) : (
              <>
                {lastFetch && (
                  <p className="text-xs text-gray-400 mb-3">
                    Terakhir diperbarui: {lastFetch}
                  </p>
                )}
                <div className="w-full overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300">
                  <table className="w-full text-xs sm:text-sm min-w-[500px]">
                    <thead>
                      <tr className="bg-red-50 border-b border-red-100">
                        <th className="px-3 py-2.5 text-left font-semibold text-red-700 rounded-tl-lg">
                          Nama Siswa
                        </th>
                        <th className="px-3 py-2.5 text-left font-semibold text-red-700">
                          Kelas
                        </th>
                        <th className="px-3 py-2.5 text-left font-semibold text-red-700">
                          Tempat PKL
                        </th>
                        {role === "admin" && (
                          <th className="px-3 py-2.5 text-left font-semibold text-red-700 rounded-tr-lg">
                            Guru Pembimbing
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {currentData.map((siswa) => (
                        <tr
                          key={siswa.userId}
                          className="hover:bg-red-50/40 transition-colors"
                        >
                          <td className="px-3 py-3 font-medium text-gray-900">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-red-400 shrink-0" />
                              {siswa.nama}
                            </div>
                          </td>
                          <td className="px-3 py-3 text-gray-600">
                            {siswa.kelas}
                          </td>
                          <td className="px-3 py-3 text-gray-600">
                            {siswa.tempatPKL}
                          </td>
                          {role === "admin" && (
                            <td className="px-3 py-3 text-gray-600">
                              {siswa.guruPembimbing}
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>

          {/* Pagination — hanya tampil jika ada data */}
          {data.length > 0 && !loading && (
            <div className="px-4 sm:px-6 pb-4 sm:pb-6 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 pt-4">
              <p className="text-xs sm:text-sm text-gray-600 font-medium">
                Menampilkan {startIndex + 1}–
                {Math.min(startIndex + itemsPerPage, data.length)} dari{" "}
                {data.length} siswa
              </p>
              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" /> Prev
                </button>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1 px-4 py-2 bg-red-500 text-white rounded-lg text-sm disabled:opacity-50 hover:bg-red-600 transition-colors"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
