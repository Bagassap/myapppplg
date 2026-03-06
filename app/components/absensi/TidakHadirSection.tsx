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
  Users,
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
      if (!res.ok) throw new Error();
      setData(await res.json());
      setLastFetch(
        new Date().toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      );
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchTidakHadir();
  }, [fetchTidakHadir]);

  const totalPages = Math.max(1, Math.ceil(data.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = data.slice(startIndex, startIndex + itemsPerPage);

  const today = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden mt-6">
      {/* ── Header ── */}
      <div
        className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 cursor-pointer select-none"
        onClick={() => setCollapsed((c) => !c)}
      >
        <div className="flex items-center gap-3">
          <div
            className={`p-2 rounded-xl transition-colors ${data.length > 0 ? "bg-red-50" : "bg-emerald-50"}`}
          >
            <UserX
              className={`w-5 h-5 ${data.length > 0 ? "text-red-500" : "text-emerald-500"}`}
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-sm">
                Belum Absen Hari Ini
              </h3>
              {data.length > 0 && !loading && (
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold bg-red-500 text-white">
                  {data.length > 99 ? "99+" : data.length}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
              {today}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {lastFetch && (
            <span className="text-xs text-slate-400 dark:text-slate-500 hidden sm:block">
              Diperbarui {lastFetch}
            </span>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              fetchTidakHadir();
            }}
            disabled={loading}
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-40"
            title="Refresh"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 text-slate-400 ${loading ? "animate-spin" : ""}`}
            />
          </button>
          {collapsed ? (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          )}
        </div>
      </div>

      {/* ── Body ── */}
      {!collapsed && (
        <>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <div className="w-8 h-8 border-2 border-slate-200 border-t-red-400 rounded-full animate-spin" />
              <p className="text-xs text-slate-400 dark:text-slate-500">
                Memuat data…
              </p>
            </div>
          ) : data.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-center gap-2">
              <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center mb-1">
                <Users className="w-6 h-6 text-emerald-500" />
              </div>
              <p className="font-semibold text-emerald-600 dark:text-emerald-400 text-sm">
                Semua siswa sudah absen hari ini! 🎉
              </p>
              {lastFetch && (
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  Diperbarui pukul {lastFetch}
                </p>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto dark:bg-slate-900">
                <table className="w-full text-sm min-w-[480px]">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50">
                      <th className="px-5 py-2.5 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Nama Siswa
                      </th>
                      <th className="px-5 py-2.5 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Kelas
                      </th>
                      <th className="px-5 py-2.5 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Tempat PKL
                      </th>
                      {role === "admin" && (
                        <th className="px-5 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">
                          Guru Pembimbing
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                    {currentData.map((siswa) => (
                      <tr
                        key={siswa.userId}
                        className="hover:bg-red-50/30 dark:hover:bg-red-900/10 transition-colors"
                      >
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 text-xs font-bold flex items-center justify-center shrink-0">
                              {siswa.nama.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-medium text-slate-800 dark:text-slate-100 text-sm">
                              {siswa.nama}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-slate-500 dark:text-slate-400 text-sm">
                          {siswa.kelas}
                        </td>
                        <td className="px-5 py-3 text-slate-500 dark:text-slate-400 text-sm">
                          {siswa.tempatPKL}
                        </td>
                        {role === "admin" && (
                          <td className="px-5 py-3 text-slate-500 text-sm hidden md:table-cell">
                            {siswa.guruPembimbing || "—"}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between gap-4">
                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    {startIndex + 1}–
                    {Math.min(startIndex + itemsPerPage, data.length)} dari{" "}
                    {data.length} siswa
                  </p>
                  <div className="flex items-center gap-1">
                    <button
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((p) => p - 1)}
                      className="flex items-center gap-1 px-3 py-1.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-slate-300 rounded-lg text-xs hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 transition-colors"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" /> Prev
                    </button>
                    <span className="px-2 py-1.5 text-xs text-slate-600 dark:text-slate-300 font-semibold">
                      {currentPage}/{totalPages}
                    </span>
                    <button
                      disabled={currentPage >= totalPages}
                      onClick={() => setCurrentPage((p) => p + 1)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs disabled:opacity-40 transition-colors"
                    >
                      Next <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
