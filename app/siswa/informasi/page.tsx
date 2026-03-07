"use client";

import Sidebar from "@/components/layout/SidebarSiswa";
import TopBar from "@/components/layout/TopBar";
import { useState, useEffect } from "react";
import { Megaphone, Calendar, Bell, FileText } from "lucide-react";

interface Announcement {
  id: number;
  judul: string;
  isi: string;
  tanggal: string;
  kategori: string;
}

function formatTanggal(raw: string) {
  if (!raw) return "-";
  const d = new Date(raw);
  if (isNaN(d.getTime())) return raw;
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function SiswaInformasi() {
  const [pengumuman, setPengumuman] = useState<Announcement[]>([]);

  const fetchInformasi = async () => {
    try {
      const res = await fetch("/api/informasi");
      const data = await res.json();
      setPengumuman(data);
    } catch (error) {
      console.error("Gagal mengambil data:", error);
    }
  };

  useEffect(() => {
    fetchInformasi();
  }, []);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-gray-50 px-4 sm:px-6 lg:px-8 py-7">
          {/* ── Page Header ── */}
          <div className="mb-7">
            <div className="flex items-center gap-2.5 mb-1">
              <span className="block w-1 h-6 bg-indigo-600 rounded-full" />
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                Informasi PKL
              </h1>
            </div>
            <p className="text-gray-500 text-sm pl-3.5">
              Lihat pengumuman dan informasi terkait Program Kerja Lapangan.
            </p>
          </div>

          {/* ── Stats Row ── */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 flex items-center gap-4">
              <div className="p-2.5 rounded-xl bg-indigo-50 ring-1 ring-indigo-200 shrink-0">
                <Bell className="w-4 h-4 text-indigo-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 mb-0.5">
                  Total
                </p>
                <p className="text-2xl font-bold text-gray-800">
                  {pengumuman.length}
                </p>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 flex items-center gap-4">
              <div className="p-2.5 rounded-xl bg-emerald-50 ring-1 ring-emerald-200 shrink-0">
                <FileText className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 mb-0.5">
                  Pengumuman
                </p>
                <p className="text-2xl font-bold text-gray-800">
                  {pengumuman.length}
                </p>
              </div>
            </div>
            <div className="hidden sm:flex bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 items-center gap-4">
              <div className="p-2.5 rounded-xl bg-amber-50 ring-1 ring-amber-200 shrink-0">
                <Calendar className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 mb-0.5">
                  Terbaru
                </p>
                <p className="text-sm font-semibold text-gray-700 truncate">
                  {pengumuman.length > 0
                    ? formatTanggal(pengumuman[0].tanggal)
                    : "—"}
                </p>
              </div>
            </div>
          </div>

          {/* ── Card Container ── */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-gray-700 text-sm flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-indigo-500" />
                Daftar Pengumuman
              </h2>
              <span className="text-xs text-gray-500 bg-gray-100 border border-gray-200 px-2.5 py-0.5 rounded-full font-medium">
                {pengumuman.length} item
              </span>
            </div>

            <div className="p-4 sm:p-5">
              {pengumuman.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
                    <Megaphone className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-gray-500 text-sm font-medium mb-1">
                    Belum ada pengumuman
                  </p>
                  <p className="text-gray-400 text-xs">
                    Pengumuman dari guru atau admin akan tampil di sini.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pengumuman.map((p) => (
                    <div
                      key={p.id}
                      className="group bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-md hover:border-indigo-100 transition-all duration-200"
                    >
                      <div className="flex gap-4">
                        <div className="shrink-0 mt-0.5 w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center ring-1 ring-indigo-200">
                          <Megaphone className="w-4 h-4 text-indigo-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1.5">
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full">
                              Pengumuman
                            </span>
                            <span className="flex items-center gap-1 text-xs text-gray-400">
                              <Calendar className="w-3 h-3" />
                              {formatTanggal(p.tanggal)}
                            </span>
                          </div>
                          <h4 className="font-semibold text-gray-800 text-sm sm:text-base leading-snug mb-2 break-words">
                            {p.judul}
                          </h4>
                          <p className="text-gray-600 text-sm leading-relaxed break-words whitespace-pre-wrap">
                            {p.isi}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
