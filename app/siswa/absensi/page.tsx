"use client";

import Sidebar from "@/components/layout/SidebarSiswa";
import TopBar from "@/components/layout/TopBar";
import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";

// --- PERBAIKAN 1: Menambahkan type casting 'as any' agar Ref terbaca ---
const SignatureCanvas = dynamic(() => import("react-signature-canvas"), {
  ssr: false,
  loading: () => (
    <div className="h-40 w-full bg-gray-100 rounded-xl animate-pulse flex items-center justify-center text-gray-400 text-sm">
      Memuat area tanda tangan...
    </div>
  ),
}) as React.ComponentType<any>;

import {
  Calendar,
  CheckSquare,
  Clock as ClockIcon,
  MapPin,
  Camera,
  Edit,
  XCircle,
  Loader2,
  PenTool,
  Trash2,
  FileText,
  UploadCloud,
} from "lucide-react";

export default function SiswaAbsensi() {
  const { data: session, status } = useSession();
  const [showAbsenModal, setShowAbsenModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [presensiData, setPresensiData] = useState<any[]>([]);

  // Ref untuk Canvas
  const sigCanvas = useRef<any>(null);

  const [siswaData, setSiswaData] = useState({
    nama: "",
    nis: "",
    kelas: "",
    tempatPKL: "",
  });

  const [absenForm, setAbsenForm] = useState({
    status: "Hadir",
    kegiatan: "",
    foto: null as File | null,
    lokasi: "",
    waktuLokasi: new Date().toLocaleTimeString(),
    catatan: "",
    bukti: null as File | null,
    tandaTangan: null as string | null,
  });

  // --- Helpers & Fetching Data ---
  const getLocalDateString = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const fetchPresensiHariIni = async () => {
    try {
      const params = new URLSearchParams();
      const now = new Date();
      const today = getLocalDateString(now);
      params.append("startDate", today);
      params.append("endDate", today);

      const presensiRes = await fetch(
        `/api/absensi?${params.toString()}&t=${now.getTime()}`,
        { cache: "no-store", headers: { Pragma: "no-cache" } },
      );

      if (!presensiRes.ok) throw new Error(`Gagal memuat data presensi.`);
      const presensiRaw = await presensiRes.json();

      const transformedPresensi = presensiRaw.map((item: any) => ({
        id: item.id,
        tanggal: new Date(item.tanggal).toLocaleDateString("id-ID"),
        status: item.status,
        waktu: item.waktu || "-",
        kegiatan: item.kegiatan || "",
        lokasi: item.lokasi || "",
        catatan: item.keterangan || "",
        foto: item.foto || "",
        bukti: item.bukti || "",
        tandaTangan: item.tandaTangan || "",
      }));
      setPresensiData(transformedPresensi);
    } catch (err: any) {
      console.error("Fetch presensi error:", err);
    }
  };

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      setError("Unauthorized: Silakan login terlebih dahulu.");
      setLoading(false);
      return;
    }
    const fetchData = async () => {
      try {
        setLoading(true);
        const siswaRes = await fetch("/api/data-siswa");
        if (siswaRes.ok) {
          const siswaRaw = await siswaRes.json();
          const siswa =
            Array.isArray(siswaRaw) && siswaRaw.length > 0
              ? siswaRaw[0]
              : Array.isArray(siswaRaw)
                ? null
                : siswaRaw;
          if (siswa) {
            setSiswaData({
              nama: session.user?.name || "",
              nis: siswa.userId || siswa.id?.toString() || "",
              kelas: siswa.kelas || "",
              tempatPKL: siswa.tempatPKL || "",
            });
          }
        }
        await fetchPresensiHariIni();
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [session, status]);

  // --- Logic Lokasi ---
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      setAbsenForm((prev) => ({
        ...prev,
        lokasi: "Mengambil titik lokasi...",
      }));
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setAbsenForm((prev) => ({
            ...prev,
            lokasi: `${latitude}, ${longitude}`,
          }));
        },
        (error) => {
          alert("Gagal mendapatkan lokasi. Pastikan GPS aktif.");
          setAbsenForm((prev) => ({ ...prev, lokasi: "" }));
        },
        { enableHighAccuracy: true },
      );
    } else {
      alert("Browser tidak mendukung Geolocation.");
    }
  };

  // Logic Clear Canvas
  const clearSignature = () => sigCanvas.current?.clear();

  // Logic UI Dinamis
  const isStatusIzinOrSakit = ["Izin", "Sakit"].includes(absenForm.status);
  const isStatusPulang = absenForm.status === "Pulang";

  // --- Handle Submit ---
  const handleAbsenSubmit = async () => {
    // 1. VALIDASI TANDA TANGAN
    if (sigCanvas.current?.isEmpty()) {
      alert("⚠️ Tanda Tangan wajib digambar!");
      return;
    }

    // 2. Validasi Field Wajib
    if (!absenForm.lokasi) {
      alert("Lokasi/GPS wajib diambil.");
      return;
    }

    if (!absenForm.foto) {
      alert("Foto Selfie/Lokasi wajib diupload untuk verifikasi.");
      return;
    }

    if (isStatusIzinOrSakit && !absenForm.bukti) {
      // Optional: Uncomment jika ingin mewajibkan upload surat
      // alert("Mohon upload bukti surat keterangan (Izin/Sakit).");
      // return;
    }

    const textContent = isStatusPulang ? absenForm.kegiatan : absenForm.catatan;
    if (!textContent && absenForm.status !== "Hadir") {
      alert(`Mohon isi keterangan/kegiatan.`);
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("tipe", "absen");
    formData.append("status", absenForm.status);
    formData.append("waktu", absenForm.waktuLokasi);
    formData.append("lokasi", absenForm.lokasi);

    formData.append("keterangan", absenForm.catatan || "");
    formData.append("kegiatan", absenForm.kegiatan || "");

    if (absenForm.foto) formData.append("foto", absenForm.foto);
    if (absenForm.bukti) formData.append("bukti", absenForm.bukti);

    // --- CONVERT CANVAS TO BASE64 ---
    const signatureDataURL = sigCanvas.current
      .getTrimmedCanvas()
      .toDataURL("image/png");
    formData.append("tandaTangan", signatureDataURL);

    try {
      const response = await fetch("/api/absensi", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error(await response.text());

      await fetchPresensiHariIni();
      alert("✅ Absensi Berhasil Disimpan!");
      setShowAbsenModal(false);
      clearSignature();

      setAbsenForm({
        status: "Hadir",
        kegiatan: "",
        foto: null,
        lokasi: "",
        waktuLokasi: new Date().toLocaleTimeString(),
        catatan: "",
        bukti: null,
        tandaTangan: null,
      });
    } catch (err: any) {
      console.error(err);
      alert("Gagal: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrevious = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };
  const handleNext = () => {
    if (currentPage < Math.ceil(presensiData.length / itemsPerPage))
      setCurrentPage(currentPage + 1);
  };
  const openImage = (url: string) => {
    if (url) window.open(url, "_blank");
  };

  if (loading)
    return (
      <div className="flex h-screen bg-gray-50 items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  if (error)
    return (
      <div className="flex h-screen bg-gray-50 items-center justify-center text-red-600 font-bold">
        {error}
      </div>
    );

  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = presensiData.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <main className="flex-1 p-6 sm:p-8 lg:p-12 overflow-y-auto w-full">
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <Calendar className="w-10 h-10 text-indigo-600" /> Absensi
            </h1>
            <p className="text-gray-600">
              Lakukan absen setiap hari dengan konsisten.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow border border-gray-100 mb-8 flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500 font-medium">
                Tanggal Hari Ini
              </p>
              <p className="text-xl font-bold text-gray-900">
                {new Date().toLocaleDateString("id-ID", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
            <button
              onClick={() => setShowAbsenModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl shadow hover:scale-105 transition-transform flex items-center gap-2"
            >
              <CheckSquare className="w-5 h-5" /> Isi Absensi
            </button>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow mb-8 border border-gray-100">
            <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <ClockIcon className="w-6 h-6 text-indigo-600" /> Riwayat Hari Ini
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead className="bg-gray-50 text-gray-700">
                  <tr>
                    <th className="px-4 py-3 rounded-tl-lg">Status</th>
                    <th className="px-4 py-3">Waktu</th>
                    <th className="px-4 py-3">Lokasi</th>
                    <th className="px-4 py-3 text-center">Foto</th>
                    <th className="px-4 py-3 text-center">TTD</th>
                    <th className="px-4 py-3 rounded-tr-lg">Ket</th>
                  </tr>
                </thead>
                <tbody>
                  {currentData.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-8 text-center text-gray-500"
                      >
                        Belum ada data.
                      </td>
                    </tr>
                  ) : (
                    currentData.map((item) => (
                      <tr key={item.id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium">
                          <span
                            className={`px-2 py-1 rounded text-xs font-bold ${
                              item.status === "Hadir"
                                ? "bg-green-100 text-green-700"
                                : item.status === "Pulang"
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">{item.waktu}</td>
                        <td className="px-4 py-3 truncate max-w-[150px]">
                          {item.lokasi || "-"}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {item.foto ? (
                            <button
                              onClick={() => openImage(item.foto)}
                              className="text-blue-600 underline text-sm"
                            >
                              Lihat
                            </button>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {item.tandaTangan ? (
                            <button
                              onClick={() => openImage(item.tandaTangan)}
                              className="text-purple-600 underline text-sm"
                            >
                              Cek
                            </button>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {item.catatan || item.kegiatan || "-"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* FORM MODAL */}
          {showAbsenModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                onClick={() => !isSubmitting && setShowAbsenModal(false)}
              ></div>
              <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl relative z-10 animate-fade-scale overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-6 border-b flex justify-between items-center bg-gray-50">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Edit className="w-5 h-5 text-indigo-600" /> Form Absensi
                  </h3>
                  <button
                    onClick={() => setShowAbsenModal(false)}
                    disabled={isSubmitting}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="w-8 h-8" />
                  </button>
                </div>

                <div className="p-6 overflow-y-auto">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleAbsenSubmit();
                    }}
                    className="space-y-5"
                  >
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Status Kehadiran
                      </label>
                      <select
                        value={absenForm.status}
                        onChange={(e) =>
                          setAbsenForm((prev) => ({
                            ...prev,
                            status: e.target.value,
                          }))
                        }
                        disabled={isSubmitting}
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      >
                        <option value="Hadir">Hadir</option>
                        <option value="Pulang">Pulang</option>
                        <option value="Izin">Izin</option>
                        <option value="Sakit">Sakit</option>
                        <option value="Libur">Libur</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        {/* PERBAIKAN 2: Menghapus 'block' karena sudah ada 'flex' */}
                        <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                          <ClockIcon className="w-4 h-4" /> Waktu
                        </label>
                        <input
                          type="text"
                          value={absenForm.waktuLokasi}
                          readOnly
                          className="w-full px-4 py-2.5 rounded-xl bg-gray-100 text-gray-600 cursor-not-allowed"
                        />
                      </div>
                      <div>
                        {/* PERBAIKAN 2: Menghapus 'block' */}
                        <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                          <MapPin className="w-4 h-4" /> Lokasi (GPS){" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={absenForm.lokasi}
                            readOnly
                            placeholder="Koordinat..."
                            className="w-full px-4 py-2.5 rounded-xl bg-gray-100 text-gray-600 text-sm"
                          />
                          <button
                            type="button"
                            onClick={getCurrentLocation}
                            disabled={isSubmitting}
                            className="px-3 bg-indigo-100 text-indigo-700 rounded-xl hover:bg-indigo-200 transition-colors"
                          >
                            <MapPin className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* FOTO SELFIE */}
                    <div>
                      {/* PERBAIKAN 2: Menghapus 'block' */}
                      <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                        <Camera className="w-4 h-4" /> Foto Selfie / Lokasi{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        capture="user"
                        disabled={isSubmitting}
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          setAbsenForm((prev) => ({ ...prev, foto: file }));
                        }}
                        className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Wajib ambil foto selfie terbaru.
                      </p>
                    </div>

                    {/* INPUT KHUSUS IZIN/SAKIT */}
                    {isStatusIzinOrSakit && (
                      <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100">
                        {/* PERBAIKAN 2: Menghapus 'block' */}
                        <label className="text-sm font-semibold text-yellow-800 mb-2 flex items-center gap-1">
                          <UploadCloud className="w-4 h-4" /> Upload Surat Bukti
                          (Dokter/Ortu)
                        </label>
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          disabled={isSubmitting}
                          onChange={(e) => {
                            const file = e.target.files?.[0] || null;
                            setAbsenForm((prev) => ({ ...prev, bukti: file }));
                          }}
                          className="w-full text-sm text-yellow-700"
                        />
                      </div>
                    )}

                    <div>
                      {/* PERBAIKAN 2: Menghapus 'block' */}
                      <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                        <FileText className="w-4 h-4" />{" "}
                        {isStatusPulang ? "Laporan Kegiatan" : "Keterangan"}
                      </label>
                      <textarea
                        rows={3}
                        disabled={isSubmitting}
                        placeholder={
                          isStatusPulang
                            ? "Apa yang Anda kerjakan hari ini?"
                            : "Tambahkan catatan..."
                        }
                        value={
                          isStatusPulang
                            ? absenForm.kegiatan
                            : absenForm.catatan
                        }
                        onChange={(e) => {
                          const val = e.target.value;
                          if (isStatusPulang) {
                            setAbsenForm((prev) => ({
                              ...prev,
                              kegiatan: val,
                              catatan: "",
                            }));
                          } else {
                            setAbsenForm((prev) => ({
                              ...prev,
                              catatan: val,
                              kegiatan: "",
                            }));
                          }
                        }}
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                    </div>

                    {/* --- AREA TANDA TANGAN (CANVAS) --- */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                          <PenTool className="w-4 h-4" /> Tanda Tangan{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <button
                          type="button"
                          onClick={clearSignature}
                          className="text-xs text-red-500 flex items-center gap-1 hover:text-red-700 font-medium px-2 py-1 rounded hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-3 h-3" /> Hapus / Ulangi
                        </button>
                      </div>
                      <div className="border-2 border-dashed border-gray-300 rounded-xl overflow-hidden bg-gray-50 hover:bg-gray-100 transition-colors cursor-crosshair touch-none">
                        <SignatureCanvas
                          ref={sigCanvas}
                          penColor="black"
                          velocityFilterWeight={0.7}
                          canvasProps={{
                            className: "w-full h-40 block", // Tinggi canvas
                            style: { width: "100%", height: "160px" },
                          }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        *Gambar tanda tangan Anda pada kotak di atas.
                      </p>
                    </div>

                    <div className="pt-4 flex gap-3">
                      <button
                        type="button"
                        onClick={() => setShowAbsenModal(false)}
                        disabled={isSubmitting}
                        className="flex-1 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 flex justify-center items-center gap-2"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />{" "}
                            Mengirim...
                          </>
                        ) : (
                          "Kirim Data"
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
