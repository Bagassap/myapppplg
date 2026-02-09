"use client";

import Sidebar from "@/components/layout/SidebarAdmin";
import TopBar from "@/components/layout/TopBar";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  Calendar,
  Filter,
  Download,
  Search,
  MapPin,
  ImageIcon,
  PenTool,
  X,
  Loader2,
  CheckSquare,
  Clock,
  AlertCircle,
} from "lucide-react";

export default function AdminAbsensiPage() {
  const { data: session } = useSession();

  // State Data
  const [presensiData, setPresensiData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // State Filter
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [searchQuery, setSearchQuery] = useState("");

  // State Modal Preview Gambar
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch data harian defaultnya
        const params = new URLSearchParams();
        params.append("startDate", selectedDate);
        params.append("endDate", selectedDate);

        const res = await fetch(`/api/absensi?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setPresensiData(data);
        }
      } catch (error) {
        console.error("Error fetching absensi:", error);
      } finally {
        setLoading(false);
      }
    };

    if (session) fetchData();
  }, [session, selectedDate]);

  // Filter Client Side (Search Nama/Kelas)
  const filteredData = presensiData.filter(
    (item) =>
      item.siswa.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.kelas || "").toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Data Absensi Siswa
            </h1>
            <p className="text-gray-600">
              Pantau kehadiran, foto bukti, dan tanda tangan siswa.
            </p>
          </div>

          {/* Controls */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="flex items-center gap-2 border rounded-lg px-3 py-2 bg-gray-50">
                <Calendar className="w-4 h-4 text-gray-500" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-transparent outline-none text-sm"
                />
              </div>
              <div className="flex items-center gap-2 border rounded-lg px-3 py-2 bg-gray-50 flex-1">
                <Search className="w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Cari Siswa / Kelas..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent outline-none text-sm w-full"
                />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                  <tr>
                    <th className="px-6 py-3">Waktu</th>
                    <th className="px-6 py-3">Siswa</th>
                    <th className="px-6 py-3">Kelas</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3 text-center">Foto</th>
                    <th className="px-6 py-3 text-center">TTD</th>
                    <th className="px-6 py-3">Lokasi</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                      </td>
                    </tr>
                  ) : filteredData.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center">
                        Tidak ada data absensi pada tanggal ini.
                      </td>
                    </tr>
                  ) : (
                    filteredData.map((item) => (
                      <tr
                        key={item.id}
                        className="bg-white border-b hover:bg-gray-50"
                      >
                        <td className="px-6 py-4 font-medium">{item.waktu}</td>
                        <td className="px-6 py-4 font-bold text-gray-900">
                          {item.siswa}
                        </td>
                        <td className="px-6 py-4">{item.kelas}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2 py-1 rounded text-xs font-semibold
                            ${
                              item.status === "Hadir"
                                ? "bg-green-100 text-green-800"
                                : item.status === "Pulang"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>

                        {/* Kolom Foto Preview */}
                        <td className="px-6 py-4 text-center">
                          {item.foto ? (
                            <button
                              onClick={() => setPreviewImage(item.foto)}
                              className="bg-indigo-50 text-indigo-600 p-2 rounded-lg hover:bg-indigo-100 transition-colors flex items-center justify-center mx-auto gap-1 text-xs font-medium"
                            >
                              <ImageIcon className="w-4 h-4" /> Lihat
                            </button>
                          ) : (
                            <span className="text-gray-300">-</span>
                          )}
                        </td>

                        {/* Kolom Tanda Tangan Preview */}
                        <td className="px-6 py-4 text-center">
                          {item.tandaTangan ? (
                            <button
                              onClick={() => setPreviewImage(item.tandaTangan)}
                              className="bg-purple-50 text-purple-600 p-2 rounded-lg hover:bg-purple-100 transition-colors flex items-center justify-center mx-auto gap-1 text-xs font-medium"
                            >
                              <PenTool className="w-4 h-4" /> Cek TTD
                            </button>
                          ) : (
                            <span className="text-gray-300">-</span>
                          )}
                        </td>

                        <td className="px-6 py-4 truncate max-w-[150px]">
                          {item.lokasi ? (
                            <a
                              href={`https://www.google.com/maps?q=${item.lokasi}`}
                              target="_blank"
                              className="text-blue-500 hover:underline flex items-center gap-1"
                            >
                              <MapPin className="w-3 h-3" /> Maps
                            </a>
                          ) : (
                            "-"
                          )}
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

      {/* MODAL PREVIEW IMAGE / TTD */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="relative bg-white p-2 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="font-bold text-gray-700">Preview Gambar</h3>
              <button
                onClick={() => setPreviewImage(null)}
                className="p-1 hover:bg-gray-100 rounded-full"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>
            <div className="flex-1 p-4 bg-gray-100 flex items-center justify-center overflow-auto">
              <img
                src={previewImage}
                alt="Preview"
                className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-md"
              />
            </div>
            <div className="p-4 border-t bg-gray-50 text-center">
              <a
                href={previewImage}
                download="bukti_absensi.png"
                className="text-indigo-600 text-sm font-medium hover:underline"
              >
                Download Gambar Original
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
