"use client";

import Sidebar from "@/components/layout/SidebarSiswa";
import TopBar from "@/components/layout/TopBar";
import { useState, useEffect } from "react";
import { Info, Megaphone } from "lucide-react";

interface Announcement {
  id: number;
  judul: string;
  isi: string;
  tanggal: string;
  kategori: string;
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
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <main className="flex-1 p-4 sm:p-8 lg:p-12 overflow-y-auto overflow-x-hidden w-full max-w-full">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <Info className="w-8 h-8 sm:w-10 sm:h-10 text-indigo-600 animate-pulse" />
              Informasi PKL
            </h1>
            <p className="text-gray-600 text-sm sm:text-lg">
              Lihat informasi dan pengumuman terkait Program Kerja Lapangan
              (PKL).
            </p>
          </div>

          {/* Card Daftar Pengumuman */}
          <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:scale-[1.01]">
            {pengumuman.length === 0 ? (
              <p className="text-gray-500 italic text-center sm:text-left">
                Belum ada pengumuman resmi yang ditambahkan.
              </p>
            ) : (
              <div className="space-y-4 sm:space-y-6">
                {pengumuman.map((p, idx) => (
                  <div
                    key={p.id}
                    className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-lg border-l-4 border-indigo-500 hover:from-indigo-100 hover:to-purple-100 transition-all duration-200"
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-2 mb-2">
                      <div className="flex-1 min-w-0 w-full">
                        <h4 className="font-semibold text-gray-900 break-words">
                          {p.judul}
                        </h4>
                      </div>
                    </div>
                    <p className="text-gray-700 mb-2 text-sm sm:text-base break-words whitespace-pre-wrap">
                      {p.isi}
                    </p>
                    <span className="text-xs text-gray-500 block">
                      {p.tanggal}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
