"use client";

import { useState, useEffect, useCallback } from "react";
import { UserX, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";

interface SiswaTidakHadir {
  userId: string;
  nama: string;
  kelas: string;
  tempatPKL: string;
  guruPembimbing: string;
}

interface Props {
  period: string; // "Hari Ini" | "Bulan Ini" | "Tahun Ini"
  role: "admin" | "guru";
}

function getDateFromPeriod(period: string): string {
  return new Date().toISOString().split("T")[0];
}

export default function TidakHadirSection({ period, role }: Props) {
  const [data, setData] = useState<SiswaTidakHadir[]>([]);
  const [loading, setLoading] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [lastFetch, setLastFetch] = useState<string>("");

  const fetchTidakHadir = useCallback(async () => {
    setLoading(true);
    try {
      const date = getDateFromPeriod(period);
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
              <div className="w-full overflow-x-auto">
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
                    {data.map((siswa) => (
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
              <p className="text-xs text-red-400 mt-3">
                * {data.length} siswa belum melakukan absensi hari ini
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
