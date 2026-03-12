"use client";

import Sidebar from "@/components/layout/SidebarGuru";
import TopBar from "@/components/layout/TopBar";
import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useExportPDF } from "@/hooks/useExportPDF";
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
  CheckCircle2,
  Users,
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
      className="px-3 py-1.5 border border-gray-200 rounded-lg bg-gray-50 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-violet-300 transition-shadow"
    >
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}

interface AbsensiRow {
  id: number;
  siswa: string;
  tempatPKL: string;
  status: string;
  waktu: string;
  catatan: string;
  kegiatan: string;
  lokasi: string;
  foto: string;
  tandaTangan: string;
  tanggal: string;
  isVirtualAlfa?: boolean;
}

// ── Animated Counter ──────────────────────────────────────────────────────────
function useCountUp(target: number, duration = 800, delay = 0) {
  const [value, setValue] = useState(0);
  const raf = useRef<number>(0);
  useEffect(() => {
    if (target === 0) {
      setValue(0);
      return;
    }
    const timeout = setTimeout(() => {
      const start = performance.now();
      const step = (now: number) => {
        const t = Math.min((now - start) / duration, 1);
        const ease = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
        setValue(Math.round(ease * target));
        if (t < 1) raf.current = requestAnimationFrame(step);
      };
      raf.current = requestAnimationFrame(step);
    }, delay);
    return () => {
      clearTimeout(timeout);
      cancelAnimationFrame(raf.current);
    };
  }, [target, duration, delay]);
  return value;
}

function ProgressRing({
  pct,
  color,
  size = 52,
  stroke = 4,
}: {
  pct: number;
  color: string;
  size?: number;
  stroke?: number;
}) {
  const r = (size - stroke * 2) / 2;
  const circ = 2 * Math.PI * r;
  const [dash, setDash] = useState(circ);
  useEffect(() => {
    const t = setTimeout(() => setDash(circ - (pct / 100) * circ), 150);
    return () => clearTimeout(t);
  }, [pct, circ]);
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="rgba(255,255,255,0.2)"
        strokeWidth={stroke}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={dash}
        style={{
          transition: "stroke-dashoffset 1s cubic-bezier(0.16,1,0.3,1)",
        }}
      />
    </svg>
  );
}

// Guru menggunakan warna violet sebagai aksen utama
const STAT_CARD_CONFIGS = [
  {
    key: "total",
    label: "Total Absensi",
    Icon: ClipboardList,
    grad: ["#7c3aed", "#6d28d9"],
  },
  {
    key: "hadir",
    label: "Hadir",
    Icon: CheckCircle2,
    grad: ["#10b981", "#0d9488"],
  },
  {
    key: "izin",
    label: "Izin / Sakit",
    Icon: Clock,
    grad: ["#f59e0b", "#f97316"],
  },
  {
    key: "alfa",
    label: "Alfa",
    Icon: AlertCircle,
    grad: ["#f43f5e", "#e11d48"],
  },
];

function StatCard({
  cfg,
  value,
  total,
  badge,
  loading,
  delay,
}: {
  cfg: (typeof STAT_CARD_CONFIGS)[0];
  value: number;
  total: number;
  badge?: string | null;
  loading: boolean;
  delay: number;
}) {
  const [visible, setVisible] = useState(false);
  const [hovered, setHovered] = useState(false);
  const count = useCountUp(visible && !loading ? value : 0, 800, delay);
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  const Icon = cfg.Icon;

  useEffect(() => {
    if (!loading) {
      const t = setTimeout(() => setVisible(true), delay);
      return () => clearTimeout(t);
    }
  }, [loading, delay]);

  if (loading) {
    return (
      <div
        className="rounded-2xl h-[108px] animate-pulse"
        style={{
          background: `linear-gradient(135deg, ${cfg.grad[0]}55, ${cfg.grad[1]}55)`,
        }}
      />
    );
  }

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative overflow-hidden rounded-2xl p-4 cursor-default select-none"
      style={{
        background: `linear-gradient(135deg, ${cfg.grad[0]}, ${cfg.grad[1]})`,
        boxShadow: hovered
          ? `0 16px 32px -8px ${cfg.grad[0]}70`
          : `0 6px 20px -4px ${cfg.grad[0]}50`,
        opacity: visible ? 1 : 0,
        transform: visible
          ? hovered
            ? "translateY(-3px) scale(1.025)"
            : "translateY(0) scale(1)"
          : "translateY(12px)",
        transition: `opacity .45s ease ${delay}ms, transform .45s ease ${delay}ms, box-shadow .2s ease`,
      }}
    >
      <div
        className="absolute -right-5 -top-5 w-20 h-20 rounded-full bg-white/10 transition-transform duration-500"
        style={{ transform: hovered ? "scale(1.4)" : "scale(1)" }}
      />
      <div className="absolute right-1 -bottom-6 w-14 h-14 rounded-full bg-black/[0.06]" />

      <div className="relative flex items-start justify-between mb-3">
        <div>
          <p className="text-white/70 text-[10px] font-bold uppercase tracking-widest mb-1">
            {cfg.label}
          </p>
          <div className="flex items-end gap-1.5">
            <span className="text-[2.2rem] font-black text-white leading-none tabular-nums">
              {count}
            </span>
            {cfg.key !== "total" && total > 0 && (
              <span className="text-white/50 text-xs font-semibold mb-0.5">
                /{total}
              </span>
            )}
          </div>
        </div>
        <div className="relative flex-shrink-0">
          <ProgressRing
            pct={cfg.key === "total" ? 100 : visible ? pct : 0}
            color="rgba(255,255,255,0.9)"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <Icon className="w-4 h-4 text-white/90" />
          </div>
        </div>
      </div>

      {cfg.key !== "total" && (
        <div className="h-1 rounded-full bg-white/20 overflow-hidden mb-2">
          <div
            className="h-full rounded-full bg-white/80 transition-all duration-1000"
            style={{
              width: visible ? `${pct}%` : "0%",
              transitionDelay: `${delay + 250}ms`,
            }}
          />
        </div>
      )}

      <div className="flex items-center justify-between">
        {cfg.key !== "total" ? (
          <span className="text-white/75 text-[11px] font-semibold">
            {pct}% dari total
          </span>
        ) : (
          <span className="text-white/75 text-[11px] font-semibold">
            semua record
          </span>
        )}
        {badge && (
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-white/25 text-white">
            {badge}
          </span>
        )}
      </div>
    </div>
  );
}

function SummaryCard({
  total,
  hadir,
  izin,
  alfa,
  loading,
  selectedPeriod,
}: {
  total: number;
  hadir: number;
  izin: number;
  alfa: number;
  loading: boolean;
  selectedPeriod: string;
}) {
  const [visible, setVisible] = useState(false);
  const hadirPct = total > 0 ? Math.round((hadir / total) * 100) : 0;

  useEffect(() => {
    if (!loading) {
      const t = setTimeout(() => setVisible(true), 0);
      return () => clearTimeout(t);
    } else setVisible(false);
  }, [loading]);

  const breakdown = [
    { val: hadir, color: "#10b981", label: "Hadir" },
    { val: izin, color: "#f59e0b", label: "Izin/Sakit" },
    { val: alfa, color: "#f43f5e", label: "Alfa" },
  ];

  return (
    <div
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 p-5 shadow-xl mb-4"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(12px)",
        transition: "opacity .4s ease, transform .4s ease",
      }}
    >
      <div className="absolute right-0 top-0 w-48 h-48 rounded-full bg-violet-500/8 -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      <div className="absolute right-12 bottom-0 w-28 h-28 rounded-full bg-emerald-500/8 translate-y-1/2 pointer-events-none" />

      <div className="relative flex items-center justify-between gap-4 flex-wrap">
        <div className="min-w-0">
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-2">
            Ringkasan — {selectedPeriod}
          </p>
          {loading ? (
            <div className="h-10 w-28 bg-white/10 rounded-xl animate-pulse mb-3" />
          ) : (
            <div className="flex items-end gap-3 mb-3">
              <span className="text-5xl font-black text-white leading-none">
                {total}
              </span>
              <span
                className={`mb-1 px-2.5 py-0.5 rounded-full text-xs font-bold
                ${
                  hadirPct >= 80
                    ? "bg-emerald-500/20 text-emerald-400"
                    : hadirPct >= 60
                      ? "bg-amber-500/20 text-amber-400"
                      : "bg-rose-500/20 text-rose-400"
                }`}
              >
                {hadirPct}% hadir
              </span>
            </div>
          )}
          <div className="flex h-2 rounded-full overflow-hidden gap-0.5 w-64 max-w-full">
            {breakdown.map((b, i) => (
              <div
                key={i}
                className="h-full rounded-full transition-all duration-1000"
                style={{
                  background: b.color,
                  width:
                    !loading && total > 0 && visible
                      ? `${(b.val / total) * 100}%`
                      : "0%",
                  minWidth: b.val > 0 && !loading && visible ? 4 : 0,
                  transitionDelay: `${200 + i * 80}ms`,
                }}
              />
            ))}
          </div>
          <div className="flex gap-4 mt-2 flex-wrap">
            {breakdown.map((b) => (
              <div key={b.label} className="flex items-center gap-1.5">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ background: b.color }}
                />
                <span className="text-slate-500 text-[11px]">
                  {b.label} ({b.val})
                </span>
              </div>
            ))}
          </div>
        </div>
        {!loading && (
          <div className="relative flex-shrink-0">
            <ProgressRing
              pct={visible ? hadirPct : 0}
              color={
                hadirPct >= 80
                  ? "#34d399"
                  : hadirPct >= 60
                    ? "#fbbf24"
                    : "#f87171"
              }
              size={88}
              stroke={7}
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <Users className="w-5 h-5 text-slate-400" />
              <span className="text-white text-[11px] font-black mt-0.5">
                {hadirPct}%
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function GuruAbsensi() {
  const { data: session, status } = useSession();
  const { exportPDF, exporting } = useExportPDF();

  const [selectedPKL, setSelectedPKL] = useState("Semua Tempat PKL");
  const [selectedPeriod, setSelectedPeriod] = useState("Bulan Ini");
  const [selectedSiswa, setSelectedSiswa] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("Semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [presensiData, setPresensiData] = useState<AbsensiRow[]>([]);
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
        const today = new Date().toLocaleDateString("id-ID");
        setAlfaVirtual(
          list.map((s, idx) => ({
            id: -(idx + 1),
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
          })),
        );
      } catch {
        setAlfaVirtual([]);
      } finally {
        setLoadingAlfa(false);
      }
    };
    fetchBelumAbsen();
  }, [selectedPeriod]);

  const combinedData: AbsensiRow[] = [
    ...presensiData,
    ...alfaVirtual.filter(
      (v) =>
        !presensiData.some(
          (p) => p.siswa === v.siswa && p.tanggal === v.tanggal,
        ),
    ),
  ];

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

  const statTotal = combinedData.length;
  const statHadir = combinedData.filter((i) => i.status === "Hadir").length;
  const statIzin = combinedData.filter((i) =>
    ["Izin", "Sakit"].includes(i.status),
  ).length;
  const statAlfa = combinedData.filter((i) => i.status === "Alfa").length;
  const isLoading = loading || loadingAlfa;

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
          <div className="mb-6">
            <div className="flex items-center gap-2.5 mb-1">
              <span className="block w-1 h-6 bg-violet-600 rounded-full" />
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                Data Absensi
              </h1>
            </div>
            <p className="text-gray-500 text-sm pl-3.5">
              Pantau kehadiran siswa bimbingan Anda.
            </p>
          </div>

          {/* ── STAT CARDS ── */}
          <SummaryCard
            total={statTotal}
            hadir={statHadir}
            izin={statIzin}
            alfa={statAlfa}
            loading={isLoading}
            selectedPeriod={selectedPeriod}
          />

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            {STAT_CARD_CONFIGS.map((cfg, i) => {
              const val =
                cfg.key === "total"
                  ? statTotal
                  : cfg.key === "hadir"
                    ? statHadir
                    : cfg.key === "izin"
                      ? statIzin
                      : statAlfa;
              const badge =
                cfg.key === "alfa" &&
                alfaVirtual.length > 0 &&
                selectedPeriod === "Hari Ini"
                  ? `${alfaVirtual.length} belum absen`
                  : null;
              return (
                <StatCard
                  key={cfg.key}
                  cfg={cfg}
                  value={val}
                  total={statTotal}
                  badge={badge}
                  loading={isLoading}
                  delay={i * 70}
                />
              );
            })}
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
                className="pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg bg-gray-50 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-violet-300 w-[155px]"
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
              options={[
                "Semua Siswa",
                ...new Set(combinedData.map((i) => i.siswa)),
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
              <table className="w-full text-sm min-w-[640px]">
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
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-8 h-8 rounded-full font-bold text-xs flex items-center justify-center shrink-0 select-none ${item.isVirtualAlfa ? "bg-red-100 text-red-600" : "bg-violet-100 text-violet-600"}`}
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
                        <td className="px-5 py-3.5 text-gray-500 hidden sm:table-cell">
                          {item.tempatPKL}
                        </td>
                        <td className="px-5 py-3.5">
                          <StatusBadge status={item.status} />
                        </td>
                        <td className="px-5 py-3.5 text-gray-500 font-mono text-xs whitespace-nowrap">
                          {item.waktu}
                        </td>
                        <td className="px-5 py-3.5 text-gray-400 text-xs hidden md:table-cell max-w-[180px]">
                          <span
                            className={`block truncate ${item.isVirtualAlfa ? "text-red-400 italic" : ""}`}
                          >
                            {item.catatan || "—"}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          {item.isVirtualAlfa ? (
                            <span className="text-xs text-red-400 italic px-2">
                              —
                            </span>
                          ) : (
                            <button
                              onClick={() => setModalSiswa(item.siswa)}
                              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-violet-50 hover:bg-violet-100 text-violet-600 rounded-lg text-xs font-semibold transition-colors border border-violet-200"
                            >
                              <Eye className="w-3 h-3" /> Riwayat
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
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
                  className="flex items-center gap-1 px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-xs disabled:opacity-40 transition-colors"
                >
                  Next <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* ── Modal Riwayat ── */}
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
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-violet-100 text-violet-600 font-bold text-sm flex items-center justify-center">
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
