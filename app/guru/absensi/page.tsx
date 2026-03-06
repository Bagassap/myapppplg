"use client";

import Sidebar from "@/components/layout/SidebarGuru";
import TopBar from "@/components/layout/TopBar";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useExportPDF } from "@/hooks/useExportPDF";
import TidakHadirSection from "@/components/absensi/TidakHadirSection";
import {
  SlidersHorizontal,
  Download,
  Loader2,
  CheckSquare,
  X,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Image as ImageIcon,
  PenTool,
  Search,
  ClipboardList,
  Eye,
  Clock,
  AlertCircle,
} from "lucide-react";

const STATUS_STYLES: Record<string, { pill: string; dot: string }> = {
  Hadir: {
    pill: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
    dot: "bg-emerald-500",
  },
  Pulang: {
    pill: "bg-sky-50 text-sky-700 ring-1 ring-sky-200",
    dot: "bg-sky-500",
  },
  Izin: {
    pill: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
    dot: "bg-amber-400",
  },
  Sakit: {
    pill: "bg-orange-50 text-orange-700 ring-1 ring-orange-200",
    dot: "bg-orange-400",
  },
  Alfa: {
    pill: "bg-red-50 text-red-700 ring-1 ring-red-200",
    dot: "bg-red-500",
  },
  Libur: {
    pill: "bg-slate-100 text-slate-500 ring-1 ring-slate-200",
    dot: "bg-slate-400",
  },
};

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_STYLES[status] ?? STATUS_STYLES.Libur;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${s.pill}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${s.dot}`} />
      {status}
    </span>
  );
}

function SkeletonRows() {
  return (
    <>
      {[...Array(5)].map((_, i) => (
        <tr key={i} className="border-b border-slate-100">
          <td className="px-5 py-3.5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-slate-100 rounded-full animate-pulse" />
              <div className="h-3.5 bg-slate-100 rounded-full w-28 animate-pulse" />
            </div>
          </td>
          <td className="px-5 py-3.5 hidden sm:table-cell">
            <div className="h-3.5 bg-slate-100 rounded-full w-24 animate-pulse" />
          </td>
          <td className="px-5 py-3.5">
            <div className="h-5 bg-slate-100 rounded-full w-16 animate-pulse" />
          </td>
          <td className="px-5 py-3.5">
            <div className="h-3.5 bg-slate-100 rounded-full w-14 animate-pulse" />
          </td>
          <td className="px-5 py-3.5 hidden md:table-cell">
            <div className="h-3.5 bg-slate-100 rounded-full w-32 animate-pulse" />
          </td>
          <td className="px-5 py-3.5">
            <div className="h-7 bg-slate-100 rounded-lg w-20 animate-pulse" />
          </td>
        </tr>
      ))}
    </>
  );
}

function FilterSelect({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="px-3 py-1.5 border border-slate-200 rounded-lg bg-slate-50 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-300 transition-shadow"
    >
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}

export default function GuruAbsensi() {
  const { data: session, status } = useSession();
  const { exportPDF, exporting } = useExportPDF();

  const [selectedPKL, setSelectedPKL] = useState("Semua Tempat PKL");
  const [selectedPeriod, setSelectedPeriod] = useState("Bulan Ini");
  const [selectedSiswa, setSelectedSiswa] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("Semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [presensiData, setPresensiData] = useState<any[]>([]);
  const [siswaMap, setSiswaMap] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [modalSiswa, setModalSiswa] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewType, setPreviewType] = useState<"foto" | "ttd">("foto");
  const itemsPerPage = 10;

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      setError("Unauthorized: Silakan login.");
      setLoading(false);
      return;
    }

    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const params = new URLSearchParams();
        const now = new Date();
        if (selectedPeriod === "Hari Ini") {
          const d = now.toISOString().split("T")[0];
          params.append("startDate", d);
          params.append("endDate", d);
        } else if (selectedPeriod === "Bulan Ini") {
          params.append(
            "startDate",
            new Date(now.getFullYear(), now.getMonth(), 1)
              .toISOString()
              .split("T")[0],
          );
          params.append(
            "endDate",
            new Date(now.getFullYear(), now.getMonth() + 1, 0)
              .toISOString()
              .split("T")[0],
          );
        } else if (selectedPeriod === "Tahun Ini") {
          params.append(
            "startDate",
            new Date(now.getFullYear(), 0, 1).toISOString().split("T")[0],
          );
          params.append(
            "endDate",
            new Date(now.getFullYear(), 11, 31).toISOString().split("T")[0],
          );
        }
        const res = await fetch(`/api/absensi?${params}`);
        if (!res.ok) throw new Error(await res.text());
        const raw: any[] = await res.json();
        const data = raw.map((item) => ({
          id: item.id,
          siswa: item.siswa || "—",
          tempatPKL: item.tempatPKL || "—",
          status: item.status,
          waktu: item.waktu || "—",
          catatan: item.keterangan || item.kegiatan || "",
          lokasi: item.lokasi || "",
          foto: item.foto || "",
          tandaTangan: item.tandaTangan || "",
          tanggal: new Date(item.tanggal).toLocaleDateString("id-ID"),
        }));
        setPresensiData(data);
        const grouped: Record<string, any[]> = {};
        data.forEach((d) => {
          if (!grouped[d.siswa]) grouped[d.siswa] = [];
          grouped[d.siswa].push(d);
        });
        setSiswaMap(grouped);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [session, status, selectedPeriod]);

  const filteredData = presensiData.filter((item) => {
    const q = searchQuery.toLowerCase();
    return (
      (!q ||
        item.siswa.toLowerCase().includes(q) ||
        item.tempatPKL.toLowerCase().includes(q)) &&
      (selectedPKL === "Semua Tempat PKL" || item.tempatPKL === selectedPKL) &&
      (selectedStatus === "Semua" ||
        item.status.toLowerCase() === selectedStatus.toLowerCase()) &&
      (selectedSiswa === "" || item.siswa === selectedSiswa)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filteredData.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  const statTotal = presensiData.length;
  const statHadir = presensiData.filter((i) => i.status === "Hadir").length;
  const statIzin = presensiData.filter((i) =>
    ["Izin", "Sakit"].includes(i.status),
  ).length;
  const statAlfa = presensiData.filter((i) => i.status === "Alfa").length;

  if (error)
    return (
      <div className="flex h-screen bg-slate-50">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <TopBar />
          <main className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
              <p className="text-red-500 font-medium">{error}</p>
            </div>
          </main>
        </div>
      </div>
    );

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-slate-50 dark:bg-slate-950 px-4 sm:px-6 lg:px-8 py-7">
          {/* Page Header */}
          <div className="mb-7">
            <div className="flex items-center gap-2.5 mb-1">
              <span className="block w-1 h-6 bg-violet-600 rounded-full" />
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                Data Absensi
              </h1>
            </div>
            <p className="text-slate-400 dark:text-slate-500 text-sm pl-3.5">
              Pantau kehadiran siswa bimbingan Anda.
            </p>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[
              {
                label: "Total",
                val: statTotal,
                color: "text-slate-700",
                ring: "ring-slate-200",
                bg: "bg-slate-50",
                icon: <ClipboardList className="w-4 h-4 text-slate-400" />,
              },
              {
                label: "Hadir",
                val: statHadir,
                color: "text-emerald-700",
                ring: "ring-emerald-200",
                bg: "bg-emerald-50",
                icon: <CheckSquare className="w-4 h-4 text-emerald-500" />,
              },
              {
                label: "Izin",
                val: statIzin,
                color: "text-amber-700",
                ring: "ring-amber-200",
                bg: "bg-amber-50",
                icon: <Clock className="w-4 h-4 text-amber-500" />,
              },
              {
                label: "Alfa",
                val: statAlfa,
                color: "text-red-700",
                ring: "ring-red-200",
                bg: "bg-red-50",
                icon: <X className="w-4 h-4 text-red-500" />,
              },
            ].map((s) => (
              <div
                key={s.label}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm px-5 py-4 flex items-center justify-between"
              >
                <div>
                  <p className="text-xs font-medium text-slate-400 dark:text-slate-500 mb-1">
                    {s.label}
                  </p>
                  <p className={`text-2xl font-bold ${s.color}`}>
                    {loading ? (
                      <span className="inline-block w-8 h-6 bg-slate-100 rounded animate-pulse" />
                    ) : (
                      s.val
                    )}
                  </p>
                </div>
                <div
                  className={`p-2.5 rounded-xl ring-1 dark:bg-slate-800 ${s.ring} ${s.bg}`}
                >
                  {s.icon}
                </div>
              </div>
            ))}
          </div>

          {/* Filter Bar */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm px-4 py-3 mb-5 flex flex-wrap items-center gap-2.5">
            <SlidersHorizontal className="w-4 h-4 text-slate-400 shrink-0" />
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Cari siswa..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg bg-slate-50 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-300 w-[155px]"
              />
            </div>
            <span className="hidden sm:block w-px h-5 bg-slate-200" />
            <FilterSelect
              value={selectedPKL}
              onChange={(v) => {
                setSelectedPKL(v);
                setCurrentPage(1);
              }}
              options={[
                "Semua Tempat PKL",
                ...new Set(presensiData.map((i) => i.tempatPKL)),
              ]}
            />
            <FilterSelect
              value={selectedPeriod}
              onChange={(v) => {
                setSelectedPeriod(v);
                setCurrentPage(1);
              }}
              options={["Hari Ini", "Bulan Ini", "Tahun Ini"]}
            />
            <FilterSelect
              value={selectedSiswa}
              onChange={(v) => {
                setSelectedSiswa(v);
                setCurrentPage(1);
              }}
              options={[
                "Semua Siswa",
                ...new Set(presensiData.map((i) => i.siswa)),
              ]}
            />
            <FilterSelect
              value={selectedStatus}
              onChange={(v) => {
                setSelectedStatus(v);
                setCurrentPage(1);
              }}
              options={[
                "Semua",
                "Hadir",
                "Pulang",
                "Izin",
                "Sakit",
                "Alfa",
                "Libur",
              ]}
            />
            <div className="ml-auto shrink-0">
              <button
                onClick={() =>
                  exportPDF(filteredData, "Laporan Absensi PKL — Guru")
                }
                disabled={exporting}
                className="flex items-center gap-2 px-4 py-1.5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-60"
              >
                {exporting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Download className="w-3.5 h-3.5" />
                )}
                {exporting ? "Membuat…" : "Ekspor PDF"}
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden mb-6">
            <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h2 className="font-semibold text-slate-700 dark:text-slate-200 text-sm">
                Daftar Presensi
              </h2>
              <span className="text-xs text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2.5 py-0.5 rounded-full font-medium">
                {loading ? "…" : `${filteredData.length} record`}
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[640px]">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50">
                    {[
                      "Siswa",
                      "Tempat PKL",
                      "Status",
                      "Waktu",
                      "Catatan",
                      "Aksi",
                    ].map((h, idx) => (
                      <th
                        key={h}
                        className={`px-5 py-2.5 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider
                        ${idx === 1 ? "hidden sm:table-cell" : ""}
                        ${idx === 4 ? "hidden md:table-cell" : ""}`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                  {loading ? (
                    <SkeletonRows />
                  ) : currentData.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-16 text-center">
                        <div className="flex flex-col items-center gap-2 text-slate-400 dark:text-slate-500">
                          <ClipboardList className="w-9 h-9 opacity-25" />
                          <p className="text-sm font-medium">
                            Tidak ada data ditemukan
                          </p>
                          <p className="text-xs opacity-60">
                            Coba ubah filter atau periode
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    currentData.map((item) => (
                      <tr
                        key={item.id}
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-800/60 transition-colors"
                      >
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-violet-100 text-violet-600 font-bold text-xs flex items-center justify-center shrink-0">
                              {item.siswa.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-slate-800 dark:text-slate-100 truncate">
                                {item.siswa}
                              </p>
                              <p className="text-xs text-slate-400 dark:text-slate-500 sm:hidden truncate">
                                {item.tempatPKL}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400 hidden sm:table-cell">
                          {item.tempatPKL}
                        </td>
                        <td className="px-5 py-3.5">
                          <StatusBadge status={item.status} />
                        </td>
                        <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400 font-mono text-xs whitespace-nowrap">
                          {item.waktu}
                        </td>
                        <td className="px-5 py-3.5 text-slate-400 dark:text-slate-500 text-xs hidden md:table-cell max-w-[180px]">
                          <span className="block truncate">
                            {item.catatan || "—"}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <button
                            onClick={() => setModalSiswa(item.siswa)}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-violet-50 hover:bg-violet-100 text-violet-600 rounded-lg text-xs font-semibold transition-colors border border-violet-200"
                          >
                            <Eye className="w-3 h-3" /> Riwayat
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between gap-4">
              <p className="text-xs text-slate-400 dark:text-slate-500">
                {filteredData.length === 0
                  ? "Tidak ada data"
                  : `${startIndex + 1}–${Math.min(startIndex + itemsPerPage, filteredData.length)} dari ${filteredData.length}`}
              </p>
              <div className="flex items-center gap-1">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                  className="flex items-center gap-1 px-3 py-1.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-slate-300 rounded-lg text-xs hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 transition-colors"
                >
                  <ChevronLeft className="w-3.5 h-3.5" /> Prev
                </button>
                <span className="px-2.5 py-1.5 text-xs text-slate-600 dark:text-slate-300 font-semibold">
                  {currentPage}/{totalPages}
                </span>
                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-xs disabled:opacity-40 transition-colors"
                >
                  Next <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          <TidakHadirSection period={selectedPeriod} role="guru" />
        </main>
      </div>

      {/* Modal Riwayat */}
      {modalSiswa && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setModalSiswa(null)}
          />
          <div
            className="relative bg-white dark:bg-slate-900 w-full sm:max-w-5xl max-h-[90vh] sm:rounded-2xl rounded-t-3xl shadow-2xl overflow-hidden flex flex-col"
            style={{ animation: "slideUp .25s cubic-bezier(.32,1.25,.6,1)" }}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 sticky top-0 bg-white dark:bg-slate-900 z-10">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-violet-100 text-violet-600 font-bold text-sm flex items-center justify-center">
                  {modalSiswa.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-100">
                    {modalSiswa}
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    Riwayat Presensi Lengkap
                  </p>
                </div>
              </div>
              <button
                onClick={() => setModalSiswa(null)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <div className="flex-1 overflow-auto">
              <table className="w-full text-sm min-w-[640px]">
                <thead className="sticky top-0 bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 z-10">
                  <tr>
                    {[
                      "Tanggal",
                      "Status",
                      "Waktu",
                      "Lokasi",
                      "Foto",
                      "TTD",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                  {(siswaMap[modalSiswa] || []).map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-300 text-sm">
                        {item.tanggal}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={item.status} />
                      </td>
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400 font-mono text-xs">
                        {item.waktu}
                      </td>
                      <td className="px-4 py-3">
                        {item.lokasi ? (
                          <a
                            href={`https://www.google.com/maps?q=${item.lokasi}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-violet-600 bg-violet-50 hover:bg-violet-100 px-2 py-1 rounded-lg border border-violet-200 font-medium transition-colors"
                          >
                            <MapPin className="w-3 h-3" /> Maps
                          </a>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {item.foto ? (
                          <div
                            onClick={() => {
                              setPreviewUrl(item.foto);
                              setPreviewType("foto");
                            }}
                            className="w-10 h-10 border-2 border-slate-200 rounded-xl overflow-hidden cursor-pointer hover:scale-105 hover:shadow-md transition-all"
                          >
                            <img
                              src={item.foto}
                              className="w-full h-full object-cover"
                              alt="Foto"
                              onError={(e) =>
                                ((e.target as HTMLImageElement).style.display =
                                  "none")
                              }
                            />
                          </div>
                        ) : (
                          <ImageIcon className="w-5 h-5 text-slate-200" />
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {item.tandaTangan ? (
                          <div
                            onClick={() => {
                              setPreviewUrl(item.tandaTangan);
                              setPreviewType("ttd");
                            }}
                            className="w-10 h-10 border-2 border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden cursor-pointer bg-white dark:bg-slate-800 p-0.5 hover:scale-105 hover:shadow-md transition-all"
                          >
                            <img
                              src={item.tandaTangan}
                              className="w-full h-full object-contain"
                              alt="TTD"
                              onError={(e) =>
                                ((e.target as HTMLImageElement).style.display =
                                  "none")
                              }
                            />
                          </div>
                        ) : (
                          <PenTool className="w-5 h-5 text-slate-200" />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!siswaMap[modalSiswa]?.length && (
                <div className="py-12 text-center text-slate-400 text-sm">
                  Tidak ada riwayat.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewUrl && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{ animation: "fadeIn .15s ease" }}
          onClick={() => setPreviewUrl(null)}
        >
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md" />
          <div
            className="relative max-w-2xl w-full flex flex-col"
            onClick={(e) => e.stopPropagation()}
            style={{ animation: "scaleIn .2s cubic-bezier(0.34,1.56,0.64,1)" }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                {previewType === "ttd" ? (
                  <PenTool className="w-3 h-3" />
                ) : (
                  <ImageIcon className="w-3 h-3" />
                )}
                {previewType === "ttd" ? "Tanda Tangan" : "Foto Absensi"}
              </span>
              <button
                onClick={() => setPreviewUrl(null)}
                className="p-2 hover:bg-white/10 rounded-xl transition-colors"
              >
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>
            <div
              className={`rounded-2xl overflow-hidden shadow-2xl ${previewType === "ttd" ? "bg-white dark:bg-slate-100 p-8" : ""}`}
            >
              <img
                src={previewUrl}
                alt=""
                className="w-full block"
                style={{
                  maxHeight: "72vh",
                  objectFit: previewType === "ttd" ? "contain" : "cover",
                  borderRadius: previewType === "ttd" ? 0 : 16,
                }}
              />
            </div>
            <p className="text-center text-xs text-slate-500 mt-3">
              Klik di luar untuk menutup
            </p>
          </div>
          <style>{`
            @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
            @keyframes scaleIn { from{opacity:0;transform:scale(0.94) translateY(8px)} to{opacity:1;transform:scale(1) translateY(0)} }
            @keyframes slideUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
          `}</style>
        </div>
      )}

      <style>{`@keyframes slideUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }`}</style>
    </div>
  );
}
