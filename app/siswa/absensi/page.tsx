"use client";

import Sidebar from "@/components/layout/SidebarSiswa";
import TopBar from "@/components/layout/TopBar";
import MediaModal from "@/components/absensi/MediaModal";
import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";

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
  User,
  Hash,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  X,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

const STATUS_STYLES: Record<string, { pill: string; dot: string }> = {
  Hadir: {
    pill: "bg-[#ACEC00]/10 text-[#00182E] ring-1 ring-[#ACEC00]/30",
    dot: "bg-[#ACEC00]",
  },
  Pulang: {
    pill: "bg-[#013FF6]/10 text-[#013FF6] ring-1 ring-[#013FF6]/20",
    dot: "bg-[#013FF6]",
  },
  Izin: {
    pill: "bg-[#013FF6]/10 text-[#013FF6] ring-1 ring-[#013FF6]/20",
    dot: "bg-[#013FF6]",
  },
  Sakit: {
    pill: "bg-[#013FF6]/8 text-[#013FF6] ring-1 ring-[#013FF6]/15",
    dot: "bg-[#013FF6]",
  },
  Alfa: {
    pill: "bg-rose-50 text-rose-700 ring-1 ring-rose-200",
    dot: "bg-rose-500",
  },
  Libur: {
    pill: "bg-gray-100 text-gray-500 ring-1 ring-gray-200",
    dot: "bg-gray-400",
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

export default function SiswaAbsensi() {
  const { data: session, status } = useSession();
  const [showAbsenModal, setShowAbsenModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [presensiData, setPresensiData] = useState<any[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewType, setPreviewType] = useState<"foto" | "ttd" | "lokasi">("foto");
  const [fotoPreviewUrl, setFotoPreviewUrl] = useState<string | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [jamSekarang, setJamSekarang] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [successStatus, setSuccessStatus] = useState("");

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

  useEffect(() => {
    const tick = () =>
      setJamSekarang(
        new Date().toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      );
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

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
      if (!presensiRes.ok) throw new Error("Gagal memuat data presensi.");
      const presensiRaw = await presensiRes.json();
      setPresensiData(
        presensiRaw.map((item: any) => ({
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
        })),
      );
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
          const siswa = siswaRaw?.data?.[0] ?? (Array.isArray(siswaRaw) ? siswaRaw[0] : null);
          if (siswa) {
            setSiswaData({
              nama: siswa.name || session.user?.name || "",
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

  const getCurrentLocation = () => {
    setGpsError(null);
    if (!navigator.geolocation) {
      setGpsError(
        "Browser tidak mendukung GPS. Gunakan Safari atau Chrome terbaru.",
      );
      return;
    }
    setGpsLoading(true);
    setAbsenForm((prev) => ({ ...prev, lokasi: "" }));
    const onSuccess = (position: GeolocationPosition) => {
      const { latitude, longitude } = position.coords;
      setAbsenForm((prev) => ({
        ...prev,
        lokasi: `${latitude}, ${longitude}`,
      }));
      setGpsError(null);
      setGpsLoading(false);
    };
    const onError = (error: GeolocationPositionError) => {
      setAbsenForm((prev) => ({ ...prev, lokasi: "" }));
      setGpsLoading(false);
      if (error.code === 1)
        setGpsError(
          "Akses lokasi ditolak. Di iPhone: Pengaturan > Safari > Lokasi > Izinkan Saat Menggunakan. Lalu muat ulang halaman.",
        );
      else if (error.code === 3)
        setGpsError(
          "Waktu habis. Pastikan GPS aktif dan sinyal baik, lalu coba lagi.",
        );
      else
        setGpsError(
          "GPS tidak tersedia. Pastikan Location Services aktif di Pengaturan iPhone.",
        );
    };
    const tryLowAccuracy = () =>
      navigator.geolocation.getCurrentPosition(onSuccess, onError, {
        enableHighAccuracy: false,
        timeout: 15000,
        maximumAge: 60000,
      });
    navigator.geolocation.getCurrentPosition(
      onSuccess,
      (error) => {
        if (error.code === 3 || error.code === 2) tryLowAccuracy();
        else onError(error);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  };

  const clearSignature = () => sigCanvas.current?.clear();
  const isStatusIzinOrSakit = ["Izin", "Sakit"].includes(absenForm.status);
  const isStatusPulang = absenForm.status === "Pulang";
  const openPreview = (url: string, type: "foto" | "ttd") => {
    if (!url) return;
    setPreviewUrl(url);
    setPreviewType(type);
  };

  const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve) => {
      if (file.size <= 1024 * 1024) { resolve(file); return; }
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        const maxDim = 1280;
        let { width: w, height: h } = img;
        if (w > maxDim || h > maxDim) {
          if (w > h) { h = Math.round((h / w) * maxDim); w = maxDim; }
          else { w = Math.round((w / h) * maxDim); h = maxDim; }
        }
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d", { willReadFrequently: false })!;
        ctx.drawImage(img, 0, 0, w, h);
        canvas.toBlob(
          (blob) => {
            canvas.width = 0;
            canvas.height = 0;
            resolve(blob ? new File([blob], file.name.replace(/\.[^.]+$/, ".jpg"), { type: "image/jpeg" }) : file);
          },
          "image/jpeg",
          0.75,
        );
      };
      img.onerror = () => resolve(file);
      img.src = url;
    });
  };

  const handleFotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const compressed = await compressImage(file);
    if (fotoPreviewUrl) URL.revokeObjectURL(fotoPreviewUrl);
    setFotoPreviewUrl(URL.createObjectURL(compressed));
    setAbsenForm((prev) => ({ ...prev, foto: compressed }));
  };

  const uploadWithRetry = async (
    url: string,
    formData: FormData,
    retries = 2,
  ): Promise<Response> => {
    for (let i = 0; i <= retries; i++) {
      try {
        const res = await fetch(url, { method: "POST", body: formData });
        return res;
      } catch (err) {
        if (i === retries) throw err;
        await new Promise((r) => setTimeout(r, 1000 * (i + 1)));
      }
    }
    throw new Error("Upload gagal setelah beberapa percobaan");
  };

  const handleAbsenSubmit = async () => {
    if (sigCanvas.current?.isEmpty()) {
      alert("⚠️ Tanda Tangan wajib digambar!");
      return;
    }
    if (!absenForm.lokasi) {
      alert("Lokasi/GPS wajib diambil.");
      return;
    }
    if (!absenForm.foto) {
      alert("Foto Selfie/Lokasi wajib diupload untuk verifikasi.");
      return;
    }

    setIsSubmitting(true);
    try {
      const fotoForm = new FormData();
      fotoForm.append("foto", absenForm.foto);
      const fotoRes = await uploadWithRetry("/api/upload?type=foto", fotoForm);
      if (!fotoRes.ok) throw new Error("Gagal upload foto");
      const fotoUrl = (await fotoRes.json()).url;

      let buktiUrl: string | null = null;
      if (absenForm.bukti) {
        const buktiKompres = await compressImage(absenForm.bukti);
        const buktiForm = new FormData();
        buktiForm.append("bukti", buktiKompres);
        const buktiRes = await uploadWithRetry(
          "/api/upload?type=bukti",
          buktiForm,
        );
        if (!buktiRes.ok) throw new Error("Gagal upload bukti");
        buktiUrl = (await buktiRes.json()).url;
      }

      const signatureDataURL = sigCanvas.current
        .getTrimmedCanvas()
        .toDataURL("image/png");
      const ttdBlob = await fetch(signatureDataURL).then((r) => r.blob());
      const ttdFile = new File([ttdBlob], "ttd.png", { type: "image/png" });
      const ttdForm = new FormData();
      ttdForm.append("tandaTangan", ttdFile);
      const ttdRes = await uploadWithRetry("/api/upload?type=ttd", ttdForm);
      if (!ttdRes.ok) throw new Error("Gagal upload tanda tangan");
      const ttdUrl = (await ttdRes.json()).url;

      const response = await fetch("/api/absensi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipe: "absen",
          status: absenForm.status,
          waktu: absenForm.waktuLokasi,
          lokasi: absenForm.lokasi,
          keterangan: absenForm.catatan || "",
          kegiatan: absenForm.kegiatan || "",
          foto: fotoUrl,
          bukti: buktiUrl,
          tandaTangan: ttdUrl,
        }),
      });

      if (!response.ok) throw new Error(await response.text());
      await fetchPresensiHariIni();
      setSuccessStatus(absenForm.status);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);
      setShowAbsenModal(false);
      clearSignature();
      if (fotoPreviewUrl) { URL.revokeObjectURL(fotoPreviewUrl); setFotoPreviewUrl(null); }
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

  if (loading)
    return (
      <div className="flex h-screen bg-gray-50 items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#013FF6]"></div>
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
  const totalPages = Math.max(1, Math.ceil(presensiData.length / itemsPerPage));
  const sudahAbsen = presensiData.length > 0;
  const statusHariIni = presensiData[0]?.status ?? null;
  const waktuAbsen = presensiData[0]?.waktu ?? null;
  const hariIni = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-gray-50 px-4 sm:px-6 lg:px-8 py-7">
          <div className="mb-7 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2.5 mb-1">
                <span style={{ display: "block", width: 4, height: 32, background: "#ACEC00", borderRadius: 2, flexShrink: 0 }} />
                <span style={{ fontSize: 22, lineHeight: 1 }}>📋</span>
                <h1 className="font-bold tracking-tight" style={{ color: "var(--text-primary)", fontSize: 28, margin: 0 }}>
                  Absensi
                </h1>
              </div>
              <p className="text-sm" style={{ color: "var(--text-secondary)", paddingLeft: 16 }}>
                Lakukan absen setiap hari dengan konsisten.
              </p>
            </div>
            <button
              onClick={() => setShowAbsenModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#00182E] hover:bg-[#013FF6] active:bg-[#013FF6] text-white rounded-xl text-sm font-semibold shadow-sm transition-colors"
            >
              <Edit className="w-4 h-4" /> Isi Absensi
            </button>
          </div>

          {/* ── 1 Stat Card ── */}
          <div className="mb-6">
            <div className="relative bg-[#00182E] rounded-2xl shadow-xl overflow-hidden">
              <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/10 rounded-full" />
              <div className="absolute -bottom-10 -left-6 w-32 h-32 bg-white/5 rounded-full" />
              <div
                className="absolute top-0 right-0 w-64 h-full opacity-10"
                style={{
                  background:
                    "radial-gradient(circle at 80% 50%, white, transparent 60%)",
                }}
              />

              <div className="relative z-10 p-5 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                  <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-5">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-white/20 rounded-xl">
                        <Calendar className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-white/60 text-xs font-medium uppercase tracking-wider">
                          Hari Ini
                        </p>
                        <p className="text-white font-bold text-sm leading-tight">
                          {hariIni}
                        </p>
                      </div>
                    </div>

                    <div className="hidden sm:block w-px h-10 bg-white/20" />

                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-white/20 rounded-xl">
                        <ClockIcon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-white/60 text-xs font-medium uppercase tracking-wider">
                          Jam
                        </p>
                        <p className="text-white font-bold text-lg font-mono leading-tight">
                          {jamSekarang}
                        </p>
                      </div>
                    </div>

                    <div className="hidden sm:block w-px h-10 bg-white/20" />

                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2.5 rounded-xl ${sudahAbsen ? "bg-[#ACEC00]/20" : "bg-rose-400/20"}`}
                      >
                        {sudahAbsen ? (
                          <CheckCircle2 className="w-5 h-5 text-[#ACEC00]" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-rose-300" />
                        )}
                      </div>
                      <div>
                        <p className="text-white/60 text-xs font-medium uppercase tracking-wider">
                          Status Absensi
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {sudahAbsen ? (
                            <span className="text-[#ACEC00] font-bold text-sm">
                              Sudah Absen
                            </span>
                          ) : (
                            <span className="text-rose-300 font-bold text-sm">
                              Belum Absen
                            </span>
                          )}
                          {statusHariIni && (
                            <StatusBadge status={statusHariIni} />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {waktuAbsen && (
                    <div className="sm:ml-auto text-right">
                      <p className="text-white/60 text-xs font-medium uppercase tracking-wider">
                        Waktu Absen
                      </p>
                      <p className="text-white font-bold text-lg font-mono">
                        {waktuAbsen}
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-white/10 flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${sudahAbsen ? "bg-[#ACEC00] animate-pulse" : "bg-rose-400 animate-pulse"}`}
                  />
                  <p className="text-white/60 text-xs">
                    {sudahAbsen
                      ? `${presensiData.length} record absensi hari ini · ${siswaData.kelas} · ${siswaData.tempatPKL}`
                      : `Belum ada absensi hari ini · ${siswaData.kelas} · ${siswaData.tempatPKL}`}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ── Tabel Riwayat ── */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden mb-6">
            <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-gray-700 text-sm flex items-center gap-2">
                <ClockIcon className="w-4 h-4 text-[#013FF6]" />
                Riwayat Hari Ini
              </h2>
              <span className="text-xs text-gray-500 bg-gray-100 border border-gray-200 px-2.5 py-0.5 rounded-full font-medium">
                {presensiData.length} record
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[580px]">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    {[
                      "Status",
                      "Waktu",
                      "Lokasi",
                      "Foto",
                      "TTD",
                      "Keterangan",
                    ].map((h, idx) => (
                      <th
                        key={h}
                        className={`px-5 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider ${idx === 2 ? "hidden sm:table-cell" : ""} ${idx === 5 ? "hidden md:table-cell" : ""} ${idx === 3 || idx === 4 ? "text-center w-20" : ""}`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {currentData.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="py-12 text-center text-gray-500 text-sm sm:text-base"
                      >
                        Belum ada data.
                      </td>
                    </tr>
                  ) : (
                    currentData.map((item) => (
                      <tr
                        key={item.id}
                        className="border-b border-gray-100 hover:bg-[#013FF6]/5 transition-colors"
                      >
                        <td className="px-5 py-3.5">
                          <StatusBadge status={item.status} />
                        </td>
                        <td className="px-5 py-3.5 text-gray-700 text-xs whitespace-nowrap font-mono">
                          {item.waktu}
                        </td>
                        <td className="px-5 py-3.5 hidden sm:table-cell">
                          {item.lokasi ? (
                            <button
                              onClick={() => { setPreviewUrl(item.lokasi); setPreviewType("lokasi"); }}
                              className="inline-flex items-center gap-1 text-xs text-[#013FF6] bg-[#013FF6]/8 hover:bg-[#013FF6]/15 px-2 py-1 rounded-lg border border-[#013FF6]/20 font-medium transition-colors"
                            >
                              <MapPin className="w-3 h-3" /> Lihat
                            </button>
                          ) : (
                            <span className="text-gray-300">-</span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-center w-20">
                          {item.foto ? (
                            <div
                              className="flex justify-center cursor-pointer group"
                              onClick={() => openPreview(item.foto, "foto")}
                            >
                              <div className="w-10 h-10 border-2 border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md hover:scale-105 transition-all">
                                <img
                                  src={item.foto}
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                                  alt="Foto"
                                  onError={(e) => {
                                    (
                                      e.target as HTMLImageElement
                                    ).style.display = "none";
                                  }}
                                />
                              </div>
                            </div>
                          ) : (
                            <div className="flex justify-center text-gray-300">
                              <Camera className="w-5 h-5" />
                            </div>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-center w-20">
                          {item.tandaTangan ? (
                            <div
                              className="flex justify-center cursor-pointer group"
                              onClick={() =>
                                openPreview(item.tandaTangan, "ttd")
                              }
                            >
                              <div className="w-10 h-10 border-2 border-gray-200 rounded-xl bg-white overflow-hidden shadow-sm hover:shadow-md hover:scale-105 transition-all p-0.5">
                                <img
                                  src={item.tandaTangan}
                                  className="w-full h-full object-contain group-hover:scale-110 transition-transform"
                                  alt="TTD"
                                  onError={(e) => {
                                    (
                                      e.target as HTMLImageElement
                                    ).style.display = "none";
                                  }}
                                />
                              </div>
                            </div>
                          ) : (
                            <div className="flex justify-center text-gray-300">
                              <PenTool className="w-5 h-5" />
                            </div>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-gray-400 text-xs hidden md:table-cell max-w-[180px]">
                          <span className="block truncate">
                            {item.catatan || item.kegiatan || "—"}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="px-5 py-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between gap-4">
              <p className="text-xs text-gray-500 font-medium">
                Menampilkan {presensiData.length === 0 ? 0 : startIndex + 1}–
                {Math.min(startIndex + itemsPerPage, presensiData.length)} dari{" "}
                {presensiData.length}
              </p>
              <div className="flex items-center gap-1">
                <button
                  disabled={currentPage === 1}
                  onClick={handlePrevious}
                  className="flex items-center gap-1 px-3 py-1.5 border border-gray-200 bg-white rounded-lg text-xs hover:bg-gray-50 disabled:opacity-40 transition-colors"
                >
                  <ChevronLeft className="w-3.5 h-3.5" /> Prev
                </button>
                <span className="px-2.5 py-1.5 text-xs text-gray-600 font-semibold">
                  {currentPage}/{totalPages}
                </span>
                <button
                  disabled={
                    currentPage >= Math.ceil(presensiData.length / itemsPerPage)
                  }
                  onClick={handleNext}
                  className="flex items-center gap-1 px-3 py-1.5 bg-[#00182E] hover:bg-[#013FF6] text-white rounded-lg text-xs disabled:opacity-40 transition-colors"
                >
                  Next <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {showAbsenModal && (
            <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
              <div
                className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
                onClick={() => !isSubmitting && setShowAbsenModal(false)}
              />
              <div
                className="relative bg-white w-full sm:max-w-2xl max-h-[92vh] sm:rounded-2xl rounded-t-3xl shadow-2xl overflow-hidden flex flex-col"
                style={{
                  animation: "slideUp .25s cubic-bezier(.32,1.25,.6,1)",
                }}
              >
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-[#013FF6]/10">
                      <Edit className="w-4 h-4 text-[#013FF6]" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">
                        Form Absensi
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date().toLocaleDateString("id-ID", {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowAbsenModal(false)}
                    disabled={isSubmitting}
                    className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    <XCircle className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto px-5 py-5">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleAbsenSubmit();
                    }}
                    className="space-y-5"
                  >
                    <div className="bg-[#013FF6]/5 border border-[#013FF6]/10 rounded-xl p-4">
                      <h4 className="text-xs font-semibold text-[#013FF6] uppercase tracking-wider mb-3 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5" /> Data Diri
                      </h4>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          {
                            label: "Nama",
                            icon: <User className="w-3 h-3" />,
                            val: siswaData.nama,
                          },
                          {
                            label: "NIS",
                            icon: <Hash className="w-3 h-3" />,
                            val: siswaData.nis,
                          },
                          {
                            label: "Kelas",
                            icon: <BookOpen className="w-3 h-3" />,
                            val: siswaData.kelas,
                          },
                          {
                            label: "Tempat PKL",
                            icon: <MapPin className="w-3 h-3" />,
                            val: siswaData.tempatPKL,
                          },
                        ].map((f) => (
                          <div key={f.label} className="flex flex-col gap-1">
                            <label className="text-xs font-semibold text-[#013FF6] uppercase tracking-wide flex items-center gap-1">
                              {f.icon} {f.label}
                            </label>
                            <input
                              type="text"
                              value={f.val || "-"}
                              disabled
                              readOnly
                              className="px-3 py-2 rounded-lg border border-[#013FF6]/15 bg-white text-gray-700 text-sm cursor-not-allowed"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

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
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-700 focus:ring-2 focus:ring-[#013FF6]/30 outline-none transition-all"
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
                        <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                          <ClockIcon className="w-4 h-4" /> Waktu
                        </label>
                        <input
                          type="text"
                          value={absenForm.waktuLokasi}
                          readOnly
                          className="w-full px-4 py-2.5 rounded-xl bg-gray-100 text-gray-600 cursor-not-allowed border border-gray-200 text-sm"
                        />
                      </div>
                      <div>
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
                            className="w-full px-4 py-2.5 rounded-xl bg-gray-100 text-gray-600 text-sm border border-gray-200"
                          />
                          <button
                            type="button"
                            onClick={getCurrentLocation}
                            disabled={isSubmitting || gpsLoading}
                            className="px-3 bg-[#013FF6]/8 text-[#013FF6] border border-[#013FF6]/20 rounded-xl hover:bg-[#013FF6]/15 transition-colors flex items-center justify-center min-w-11 disabled:opacity-50"
                          >
                            {gpsLoading ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <MapPin className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                        {gpsError && (
                          <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 leading-relaxed">
                            ⚠️ {gpsError}
                          </div>
                        )}
                        {absenForm.lokasi && !gpsError && !gpsLoading && (
                          <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-xl text-xs text-green-700 flex items-center gap-1">
                            ✅ Lokasi berhasil diambil
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                        <Camera className="w-4 h-4" /> Foto Selfie / Lokasi{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <div className="border-2 border-dashed border-gray-200 rounded-xl p-3 hover:border-[#013FF6]/30 transition-colors bg-gray-50">
                        <input
                          type="file"
                          accept="image/*"
                          capture="user"
                          disabled={isSubmitting}
                          onChange={handleFotoChange}
                          className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#013FF6]/10 file:text-[#013FF6] hover:file:bg-[#013FF6]/15"
                        />
                        {fotoPreviewUrl && (
                          <div className="mt-2 relative rounded-xl overflow-hidden border border-[#013FF6]/20">
                            <img src={fotoPreviewUrl} alt="Preview foto" className="w-full max-h-36 object-cover" />
                            <button
                              type="button"
                              onClick={() => { URL.revokeObjectURL(fotoPreviewUrl); setFotoPreviewUrl(null); setAbsenForm(prev => ({ ...prev, foto: null })); }}
                              className="absolute top-1.5 right-1.5 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Wajib ambil foto selfie terbaru. {absenForm.foto && !fotoPreviewUrl ? "" : absenForm.foto ? <span className="text-green-600 font-medium">✓ Foto dipilih</span> : ""}
                      </p>
                    </div>

                    {isStatusIzinOrSakit && (
                      <div className="bg-[#013FF6]/5 p-4 rounded-xl border border-[#013FF6]/10">
                        <label className="text-sm font-semibold text-[#013FF6] mb-2 flex items-center gap-1">
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
                          className="w-full text-sm text-[#013FF6]"
                        />
                      </div>
                    )}

                    <div>
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
                          if (isStatusPulang)
                            setAbsenForm((prev) => ({
                              ...prev,
                              kegiatan: val,
                              catatan: "",
                            }));
                          else
                            setAbsenForm((prev) => ({
                              ...prev,
                              catatan: val,
                              kegiatan: "",
                            }));
                        }}
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-700 focus:ring-2 focus:ring-[#013FF6]/30 outline-none resize-none"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                          <PenTool className="w-4 h-4" /> Tanda Tangan{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <button
                          type="button"
                          onClick={clearSignature}
                          className="text-xs text-red-500 flex items-center gap-1 hover:text-red-700 font-medium px-2 py-1 rounded-lg hover:bg-red-50 transition-colors"
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
                            className: "w-full h-40 block",
                            style: { width: "100%", height: "160px" },
                          }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        *Gambar tanda tangan Anda pada kotak di atas.
                      </p>
                    </div>

                    <div className="pt-2 flex gap-3">
                      <button
                        type="button"
                        onClick={() => setShowAbsenModal(false)}
                        disabled={isSubmitting}
                        className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-100 transition-colors text-sm font-medium disabled:opacity-50"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 py-2.5 bg-[#00182E] text-white font-semibold rounded-xl hover:bg-[#013FF6] transition-colors shadow-sm disabled:opacity-60 flex justify-center items-center gap-2"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />{" "}
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
              <style>{`@keyframes slideUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }`}</style>
            </div>
          )}
        </main>
      </div>

      {previewUrl && (
        <MediaModal type={previewType} data={previewUrl} onClose={() => setPreviewUrl(null)} />
      )}

      {showSuccess && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center px-4"
          style={{ animation: "fadeIn 0.2s ease" }}
        >
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowSuccess(false)}
          />
          <div
            className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden"
            style={{ animation: "popIn 0.35s cubic-bezier(0.34,1.56,0.64,1)" }}
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gray-100 overflow-hidden rounded-t-3xl">
              <div
                className="h-full bg-linear-to-r from-[#ACEC00] to-[#013FF6] rounded-full"
                style={{ animation: "shrinkBar 5s linear forwards" }}
              />
            </div>
            <div className="px-7 py-8 flex flex-col items-center text-center">
              <div className="relative mb-5">
                <div
                  className="w-20 h-20 bg-[#00182E] rounded-full flex items-center justify-center shadow-lg shadow-[#00182E]/30"
                  style={{
                    animation:
                      "bounceIn 0.5s cubic-bezier(0.34,1.56,0.64,1) 0.1s both",
                  }}
                >
                  <CheckCircle2 className="w-10 h-10 text-white" />
                </div>
                <div
                  className="absolute -top-1 -right-1 w-6 h-6 bg-[#ACEC00] rounded-full flex items-center justify-center"
                  style={{
                    animation:
                      "bounceIn 0.5s cubic-bezier(0.34,1.56,0.64,1) 0.25s both",
                  }}
                >
                  <span className="text-[#00182E] text-xs font-black">✓</span>
                </div>
              </div>

              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Absensi Berhasil!
              </h2>
              <p className="text-gray-500 text-sm leading-relaxed mb-1">
                Terima kasih, absensi kamu hari ini sudah tercatat.
              </p>
              <div className="mt-2 mb-5">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${STATUS_STYLES[successStatus]?.pill ?? STATUS_STYLES.Libur.pill}`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${STATUS_STYLES[successStatus]?.dot ?? STATUS_STYLES.Libur.dot}`}
                  />
                  Status: {successStatus}
                </span>
              </div>

              <p className="text-xs text-gray-400 mb-4">
                {new Date().toLocaleDateString("id-ID", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>

              <button
                onClick={() => setShowSuccess(false)}
                className="w-full py-2.5 bg-[#00182E] text-white font-semibold rounded-xl hover:bg-[#013FF6] transition-colors text-sm shadow-md"
              >
                Oke, Terima Kasih!
              </button>
            </div>
          </div>
          <style>{`
            @keyframes popIn { from { opacity: 0; transform: scale(0.85) translateY(20px); } to { opacity: 1; transform: scale(1) translateY(0); } }
            @keyframes bounceIn { from { opacity: 0; transform: scale(0); } to { opacity: 1; transform: scale(1); } }
            @keyframes shrinkBar { from { width: 100%; } to { width: 0%; } }
          `}</style>
        </div>
      )}
    </div>
  );
}
