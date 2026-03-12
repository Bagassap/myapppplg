"use client";

import Sidebar from "@/components/layout/SidebarAdmin";
import TopBar from "@/components/layout/TopBar";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useExportPDF } from "@/hooks/useExportPDF";
import DeleteAbsensiModal from "@/components/absensi/DeleteAbsensiModal";
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

// ── Status Badge ──────────────────────────────────────────────────────────────
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
    pill: "bg-gray-100 text-gray-500 ring-1 ring-slate-200",
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

// ── Skeleton ──────────────────────────────────────────────────────────────────
function SkeletonRows() {
  return (
    <>
      {[...Array(5)].map((_, i) => (
        <tr key={i} className="border-b border-gray-100">
          <td className="px-5 py-3.5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-100 rounded-full animate-pulse" />
              <div className="h-3.5 bg-gray-100 rounded-full w-28 animate-pulse" />
            </div>
          </td>
          <td className="px-5 py-3.5 hidden sm:table-cell">
            <div className="h-3.5 bg-gray-100 rounded-full w-24 animate-pulse" />
          </td>
          <td className="px-5 py-3.5">
            <div className="h-5 bg-gray-100 rounded-full w-16 animate-pulse" />
          </td>
          <td className="px-5 py-3.5">
            <div className="h-3.5 bg-gray-100 rounded-full w-14 animate-pulse" />
          </td>
          <td className="px-5 py-3.5 hidden md:table-cell">
            <div className="h-3.5 bg-gray-100 rounded-full w-32 animate-pulse" />
          </td>
          <td className="px-5 py-3.5">
            <div className="h-7 bg-gray-100 rounded-lg w-20 animate-pulse" />
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
      className="px-3 py-1.5 border border-gray-200 rounded-lg bg-gray-50 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-shadow"
    >
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}

// ── Virtual Alfa row type ─────────────────────────────────────────────────────
// Siswa belum absen direpresentasikan sebagai row virtual dengan id negatif
// sehingga tidak ada conflict dengan ID database dan tidak ada tombol delete
interface AbsensiRow {
  id: number;
  siswa: string;
  tempatPKL: string;
  status: string;
  waktu: string;
  catatan: string;
  kegiatan: string; // required by useExportPDF
  lokasi: string;
  foto: string;
  tandaTangan: string;
  tanggal: string;
  isVirtualAlfa?: boolean; // true = belum absen, bukan dari DB
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function AdminAbsensi() {
  const { data: session, status } = useSession();
  const { exportPDF, exporting } = useExportPDF();

  const [selectedPKL, setSelectedPKL] = useState("Semua Tempat PKL");
  const [selectedPeriod, setSelectedPeriod] = useState("Hari Ini");
  const [selectedSiswa, setSelectedSiswa] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("Semua");
  const [searchQuery, setSearchQuery] = useState("");

  // Data dari DB (absensi yang sudah tercatat)
  const [presensiData, setPresensiData] = useState<AbsensiRow[]>([]);
  // Data siswa yang BELUM absen hari ini (akan jadi virtual Alfa)
  const [alfaVirtual, setAlfaVirtual] = useState<AbsensiRow[]>([]);

  const [siswaMap, setSiswaMap] = useState<Record<string, AbsensiRow[]>>({});
  const [loading, setLoading] = useState(true);
  const [loadingAlfa, setLoadingAlfa] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [modalSiswa, setModalSiswa] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewType, setPreviewType] = useState<"foto" | "ttd">("foto");
  const itemsPerPage = 10;

  // ── Fetch absensi dari DB ─────────────────────────────────────────────────
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

        const data: AbsensiRow[] = raw.map((item) => ({
          id: item.id,
          siswa: item.siswa || "—",
          tempatPKL: item.tempatPKL || "—",
          status: item.status,
          waktu: item.waktu || "—",
          catatan: item.keterangan || "",
          kegiatan: item.kegiatan || "",
          lokasi: item.lokasi || "",
          foto: item.foto || "",
          tandaTangan: item.tandaTangan || "",
          tanggal: new Date(item.tanggal).toLocaleDateString("id-ID"),
        }));

        setPresensiData(data);
        const grouped: Record<string, AbsensiRow[]> = {};
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

  // ── Fetch siswa belum absen (hanya untuk "Hari Ini") ─────────────────────
  // Hasilnya dikonversi menjadi virtual Alfa rows
  useEffect(() => {
    if (selectedPeriod !== "Hari Ini") {
      setAlfaVirtual([]);
      return;
    }
    const fetchBelumAbsen = async () => {
      setLoadingAlfa(true);
      try {
        const date = new Date().toISOString().split("T")[0];
        const res = await fetch(`/api/absensi/tidak-hadir?date=${date}`);
        if (!res.ok) throw new Error();
        const list: {
          userId: string;
          nama: string;
          kelas: string;
          tempatPKL: string;
          guruPembimbing: string;
        }[] = await res.json();

        // Konversi ke virtual Alfa rows dengan id negatif (tidak ada di DB)
        const today = new Date().toLocaleDateString("id-ID");
        const virtual: AbsensiRow[] = list.map((s, idx) => ({
          id: -(idx + 1), // negatif = virtual, bukan dari DB
          siswa: s.nama,
          tempatPKL: s.tempatPKL || "—",
          status: "Alfa",
          waktu: "—",
          catatan: "Belum absen",
          kegiatan: "",
          lokasi: "",
          foto: "",
          tandaTangan: "",
          tanggal: today,
          isVirtualAlfa: true,
        }));
        setAlfaVirtual(virtual);
      } catch {
        setAlfaVirtual([]);
      } finally {
        setLoadingAlfa(false);
      }
    };
    fetchBelumAbsen();
  }, [selectedPeriod]);

  // ── Gabungkan data DB + virtual Alfa ─────────────────────────────────────
  // Virtual Alfa hanya ditampilkan jika filter tidak mengecualikan "Alfa"
  const combinedData: AbsensiRow[] = [
    ...presensiData,
    // Hanya tambahkan virtual Alfa jika siswa belum tercatat di DB hari ini
    // (hindari duplikat jika siswa absen Alfa secara manual)
    ...alfaVirtual.filter(
      (v) =>
        !presensiData.some(
          (p) => p.siswa === v.siswa && p.tanggal === v.tanggal,
        ),
    ),
  ];

  // ── Filter ────────────────────────────────────────────────────────────────
  const filteredData = combinedData.filter((item) => {
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

  // ── Stat counters (termasuk virtual Alfa) ─────────────────────────────────
  const statTotal = combinedData.length;
  const statHadir = combinedData.filter((i) => i.status === "Hadir").length;
  const statIzin = combinedData.filter((i) =>
    ["Izin", "Sakit"].includes(i.status),
  ).length;
  const statAlfa = combinedData.filter((i) => i.status === "Alfa").length; // DB Alfa + virtual

  if (error)
    return (
      <div className="flex h-screen bg-gray-50">
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
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-gray-50 px-4 sm:px-6 lg:px-8 py-7">
          {/* ── Page Header ── */}
          <div className="mb-7 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2.5 mb-1">
                <span className="block w-1 h-6 bg-indigo-600 rounded-full" />
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                  Data Absensi
                </h1>
              </div>
              <p className="text-gray-500 text-sm pl-3.5">
                Kelola dan pantau kehadiran seluruh siswa PKL.
              </p>
            </div>
          </div>

          {/* ── Stat Cards ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[
              {
                label: "Total",
                val: statTotal,
                color: "text-gray-700",
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
                // Tampilkan badge kecil jika ada virtual Alfa (siswa belum absen)
                badge:
                  alfaVirtual.length > 0 && selectedPeriod === "Hari Ini"
                    ? `${alfaVirtual.length} belum absen`
                    : null,
              },
            ].map((s: any) => (
              <div
                key={s.label}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 flex items-center justify-between"
              >
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">
                    {s.label}
                  </p>
                  <p className={`text-2xl font-bold ${s.color}`}>
                    {loading || (s.label === "Alfa" && loadingAlfa) ? (
                      <span className="inline-block w-8 h-6 bg-gray-100 rounded animate-pulse" />
                    ) : (
                      s.val
                    )}
                  </p>
                  {s.badge && !loading && !loadingAlfa && (
                    <p className="text-[10px] text-red-400 mt-0.5 font-medium">
                      {s.badge}
                    </p>
                  )}
                </div>
                <div className={`p-2.5 rounded-xl ring-1 ${s.ring} ${s.bg}`}>
                  {s.icon}
                </div>
              </div>
            ))}
          </div>

          {/* ── Filter Bar ── */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm px-4 py-3 mb-5 flex flex-wrap items-center gap-2.5">
            <SlidersHorizontal className="w-4 h-4 text-gray-400 shrink-0" />
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Cari siswa..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg bg-gray-50 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 w-[155px]"
              />
            </div>
            <span className="hidden sm:block w-px h-5 bg-gray-200" />
            <FilterSelect
              value={selectedPKL}
              onChange={(v) => {
                setSelectedPKL(v);
                setCurrentPage(1);
              }}
              options={[
                "Semua Tempat PKL",
                ...new Set(combinedData.map((i) => i.tempatPKL)),
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
              options={["", ...new Set(combinedData.map((i) => i.siswa))].map(
                (v, i) => (i === 0 ? "Semua Siswa" : (v as string)),
              )}
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
                  exportPDF(filteredData, "Laporan Absensi PKL — Admin")
                }
                disabled={exporting}
                className="flex items-center gap-2 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-60"
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

          {/* ── Table ── */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden mb-6">
            <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-gray-700 text-sm">
                Daftar Presensi
              </h2>
              <div className="flex items-center gap-2">
                {selectedPeriod === "Hari Ini" &&
                  alfaVirtual.length > 0 &&
                  !loadingAlfa && (
                    <span className="text-[10px] font-semibold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                      {alfaVirtual.length} siswa belum absen → Alfa
                    </span>
                  )}
                <span className="text-xs text-gray-400 bg-gray-50 border border-gray-200 px-2.5 py-0.5 rounded-full font-medium">
                  {loading ? "…" : `${filteredData.length} record`}
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[680px]">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
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
                        className={`px-5 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider ${idx === 1 ? "hidden sm:table-cell" : ""} ${idx === 4 ? "hidden md:table-cell" : ""}`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading || loadingAlfa ? (
                    <SkeletonRows />
                  ) : currentData.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-16 text-center">
                        <div className="flex flex-col items-center gap-2 text-gray-400">
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
                        key={`${item.id}-${item.siswa}`}
                        className={`transition-colors ${item.isVirtualAlfa ? "bg-red-50/30 hover:bg-red-50/60" : "hover:bg-gray-50"}`}
                      >
                        {/* Siswa */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-8 h-8 rounded-full font-bold text-xs flex items-center justify-center shrink-0 select-none ${item.isVirtualAlfa ? "bg-red-100 text-red-600" : "bg-indigo-100 text-indigo-600"}`}
                            >
                              {item.siswa.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-gray-800 truncate">
                                {item.siswa}
                              </p>
                              <p className="text-xs text-gray-400 sm:hidden truncate">
                                {item.tempatPKL}
                              </p>
                            </div>
                          </div>
                        </td>
                        {/* Tempat PKL */}
                        <td className="px-5 py-3.5 text-gray-500 hidden sm:table-cell">
                          {item.tempatPKL}
                        </td>
                        {/* Status */}
                        <td className="px-5 py-3.5">
                          <StatusBadge status={item.status} />
                        </td>
                        {/* Waktu */}
                        <td className="px-5 py-3.5 text-gray-500 font-mono text-xs whitespace-nowrap">
                          {item.waktu}
                        </td>
                        {/* Catatan */}
                        <td className="px-5 py-3.5 text-gray-400 text-xs hidden md:table-cell max-w-[180px]">
                          <span
                            className={`block truncate ${item.isVirtualAlfa ? "text-red-400 italic" : ""}`}
                          >
                            {item.catatan || "—"}
                          </span>
                        </td>
                        {/* Aksi */}
                        <td className="px-5 py-3.5">
                          {item.isVirtualAlfa ? (
                            // Virtual Alfa: tidak ada tombol aksi (belum ada record di DB)
                            <span className="text-xs text-red-400 italic px-2">
                              —
                            </span>
                          ) : (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setModalSiswa(item.siswa)}
                                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg text-xs font-semibold transition-colors border border-indigo-200"
                              >
                                <Eye className="w-3 h-3" /> Riwayat
                              </button>
                              <DeleteAbsensiModal
                                absensiId={item.id}
                                namaSiswa={item.siswa}
                                tanggal={item.tanggal}
                                status={item.status}
                                onSuccess={(id) =>
                                  setPresensiData((p) =>
                                    p.filter((x) => x.id !== id),
                                  )
                                }
                              />
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-5 py-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between gap-4">
              <p className="text-xs text-gray-400">
                {filteredData.length === 0
                  ? "Tidak ada data"
                  : `${startIndex + 1}–${Math.min(startIndex + itemsPerPage, filteredData.length)} dari ${filteredData.length}`}
              </p>
              <div className="flex items-center gap-1">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                  className="flex items-center gap-1 px-3 py-1.5 border border-gray-200 bg-white rounded-lg text-xs hover:bg-gray-50 disabled:opacity-40 transition-colors"
                >
                  <ChevronLeft className="w-3.5 h-3.5" /> Prev
                </button>
                <span className="px-2.5 py-1.5 text-xs text-gray-600 font-semibold">
                  {currentPage}/{totalPages}
                </span>
                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs disabled:opacity-40 transition-colors"
                >
                  Next <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* ── Modal Riwayat Siswa ── */}
      {modalSiswa && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setModalSiswa(null)}
          />
          <div
            className="relative bg-white w-full sm:max-w-5xl max-h-[90vh] sm:rounded-2xl rounded-t-3xl shadow-2xl overflow-hidden flex flex-col"
            style={{ animation: "slideUp .25s cubic-bezier(.32,1.25,.6,1)" }}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-white sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-600 font-bold text-sm flex items-center justify-center">
                  {modalSiswa.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{modalSiswa}</p>
                  <p className="text-xs text-gray-400">
                    Riwayat Presensi Lengkap
                  </p>
                </div>
              </div>
              <button
                onClick={() => setModalSiswa(null)}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <div className="flex-1 overflow-auto">
              <table className="w-full text-sm min-w-[640px]">
                <thead className="sticky top-0 bg-gray-50 border-b border-gray-100 z-10">
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
                        className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {(siswaMap[modalSiswa] || []).map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3 font-medium text-gray-700 text-sm">
                        {item.tanggal}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={item.status} />
                      </td>
                      <td className="px-4 py-3 text-gray-500 font-mono text-xs">
                        {item.waktu}
                      </td>
                      <td className="px-4 py-3">
                        {item.lokasi ? (
                          <a
                            href={`https://www.google.com/maps?q=${item.lokasi}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-2 py-1 rounded-lg border border-indigo-200 font-medium transition-colors"
                          >
                            <MapPin className="w-3 h-3" /> Maps
                          </a>
                        ) : (
                          <span className="text-slate-300 text-sm">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {item.foto ? (
                          <div
                            onClick={() => {
                              setPreviewUrl(item.foto);
                              setPreviewType("foto");
                            }}
                            className="w-10 h-10 border-2 border-gray-200 rounded-xl overflow-hidden cursor-pointer hover:scale-105 hover:shadow-md transition-all"
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
                            className="w-10 h-10 border-2 border-gray-200 rounded-xl overflow-hidden cursor-pointer bg-white p-0.5 hover:scale-105 hover:shadow-md transition-all"
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
                <div className="py-12 text-center text-gray-400 text-sm">
                  Tidak ada riwayat.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Preview Modal ── */}
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
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
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
              className={`rounded-2xl overflow-hidden shadow-2xl ${previewType === "ttd" ? "bg-white p-8" : ""}`}
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
            <p className="text-center text-xs text-gray-500 mt-3">
              Klik di luar untuk menutup
            </p>
          </div>
          <style>{`
            @keyframes fadeIn { from{opacity:0} to{opacity:1} }
            @keyframes scaleIn { from{opacity:0;transform:scale(0.94) translateY(8px)} to{opacity:1;transform:scale(1) translateY(0)} }
            @keyframes slideUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
          `}</style>
        </div>
      )}

      <style>{`@keyframes slideUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }`}</style>
    </div>
  );
}
