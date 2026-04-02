"use client";
import Sidebar from "@/components/layout/SidebarSiswa";
import GreetingBanner from "@/components/GreetingBanner";
import TopBar from "@/components/layout/TopBar";
import { useState, useEffect } from "react";
import {
  Bell,
  ChevronRight,
  Megaphone,
  Info,
  AlertCircle,
  TrendingUp,
  Target,
  BookOpen,
  CheckCircle2,
  XCircle,
  Star,
  Flame,
  CalendarCheck,
  ShieldCheck,
} from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

interface Informasi {
  id: number;
  judul: string;
  isi: string;
  tanggal: string;
  tipe: string;
  tempatPKL?: string | null;
  createdAt: string;
}

const DONUT_COLORS = ["#10b981", "#f59e0b", "#f43f5e"];

const DonutTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "var(--color-background-primary)",
        border: "0.5px solid var(--color-border-secondary)",
        borderRadius: 10,
        padding: "8px 12px",
        fontSize: 12,
        boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
      }}
    >
      <p
        style={{
          fontWeight: 600,
          color: "var(--color-text-primary)",
          margin: "0 0 2px",
        }}
      >
        {payload[0].name}
      </p>
      <p style={{ color: "var(--color-text-secondary)", margin: 0 }}>
        Jumlah:{" "}
        <strong style={{ color: "var(--color-text-primary)" }}>
          {payload[0].value}
        </strong>
      </p>
    </div>
  );
};

const Sk = ({
  w = "100%",
  h = 20,
  r = 8,
}: {
  w?: string | number;
  h?: number;
  r?: number;
}) => (
  <div
    style={{
      width: w,
      height: h,
      borderRadius: r,
      background: "var(--color-background-tertiary)",
      animation: "pulse 1.5s ease-in-out infinite",
    }}
  />
);

const getTipeConfig = (tipe: string) => {
  switch (tipe?.toLowerCase()) {
    case "pengumuman":
      return {
        icon: <Megaphone size={14} />,
        pill: { bg: "#fefce8", color: "#a16207", border: "#fde68a" },
        iconBg: "#fefce8",
        iconColor: "#a16207",
      };
    case "peringatan":
      return {
        icon: <AlertCircle size={14} />,
        pill: { bg: "#fef2f2", color: "#be123c", border: "#fecaca" },
        iconBg: "#fef2f2",
        iconColor: "#be123c",
      };
    default:
      return {
        icon: <Info size={14} />,
        pill: { bg: "#f0fdf4", color: "#15803d", border: "#bbf7d0" },
        iconBg: "#f0fdf4",
        iconColor: "#15803d",
      };
  }
};

const formatTanggal = (t: string) =>
  new Date(t).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

export default function SiswaDashboard() {
  const [loading, setLoading] = useState(true);
  const [loadingInfo, setLoadingInfo] = useState(true);
  const [informasiList, setInformasiList] = useState<Informasi[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [stats, setStats] = useState({
    totalHariBulanIni: 0,
    hadirBulanIni: 0,
    tidakHadirBulanIni: 0,
    persentaseKehadiran: 0,
  });

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await fetch("/api/dashboard");
        if (res.ok) {
          const data = await res.json();
          setStats(
            data.cards || {
              totalHariBulanIni: 0,
              hadirBulanIni: 0,
              tidakHadirBulanIni: 0,
              persentaseKehadiran: 0,
            },
          );
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    const fetchInformasi = async () => {
      try {
        const res = await fetch("/api/informasi");
        if (res.ok) {
          const data = await res.json();
          setInformasiList(Array.isArray(data) ? data.slice(0, 5) : []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingInfo(false);
      }
    };
    fetchDashboard();
    fetchInformasi();
  }, []);

  const izin = Math.max(
    0,
    stats.totalHariBulanIni - stats.hadirBulanIni - stats.tidakHadirBulanIni,
  );
  const pct = stats.persentaseKehadiran;

  const donutData = [
    { name: "Hadir", value: stats.hadirBulanIni },
    { name: "Izin/Sakit", value: izin },
    { name: "Tidak Hadir", value: stats.tidakHadirBulanIni },
  ].filter((d) => d.value > 0);

  const hariIni = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const pctColor = pct >= 80 ? "#10b981" : pct >= 60 ? "#f59e0b" : "#f43f5e";
  const pctBg = pct >= 80 ? "#f0fdf4" : pct >= 60 ? "#fefce8" : "#fef2f2";
  const pctTc = pct >= 80 ? "#15803d" : pct >= 60 ? "#a16207" : "#be123c";

  const motivasiText =
    pct >= 90
      ? {
          title: "Luar biasa! 🏆",
          body: "Kehadiranmu sudah melampaui 90%. Pertahankan semangat belajarmu!",
        }
      : pct >= 80
        ? {
            title: "Bagus sekali! 🎉",
            body: "Kamu sudah mencapai target. Terus jaga konsistensinya ya!",
          }
        : {
            title: "Ayo semangat! 💪",
            body: `Butuh ${80 - pct}% lagi untuk mencapai target 80% kehadiran bulan ini.`,
          };

  const motivasiGradient =
    pct >= 90
      ? "linear-gradient(135deg, #059669 0%, #10b981 100%)"
      : pct >= 80
        ? "linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)"
        : "linear-gradient(135deg, #f59e0b 0%, #f97316 100%)";

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar />
        <main
          className="flex-1 overflow-y-auto overflow-x-hidden"
          style={{
            padding: "28px 32px",
            background: "var(--color-background-tertiary)",
          }}
        >
          <GreetingBanner />

          {/* ── HERO — Gradient Banner ── */}
          <div
            style={{
              background:
                "linear-gradient(135deg, #6366f1 0%, #4f46e5 55%, #7c3aed 100%)",
              borderRadius: 20,
              padding: "26px 28px",
              marginBottom: 16,
              position: "relative",
              overflow: "hidden",
              boxShadow: "0 8px 32px rgba(99,102,241,0.3)",
            }}
          >
            {/* Decorative circles */}
            <div
              style={{
                position: "absolute",
                right: -40,
                top: -40,
                width: 180,
                height: 180,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.07)",
              }}
            />
            <div
              style={{
                position: "absolute",
                right: 60,
                bottom: -60,
                width: 130,
                height: 130,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.05)",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: -20,
                bottom: -30,
                width: 100,
                height: 100,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.04)",
              }}
            />

            {/* Top row: identity + date */}
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                marginBottom: 20,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                {/* Avatar */}
                <div
                  style={{
                    width: 54,
                    height: 54,
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.2)",
                    border: "2px solid rgba(255,255,255,0.35)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 20,
                    fontWeight: 800,
                    color: "#fff",
                    flexShrink: 0,
                  }}
                >
                  <BookOpen size={22} color="#fff" />
                </div>
                <div>
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 5,
                      background: "rgba(255,255,255,0.15)",
                      padding: "3px 10px",
                      borderRadius: 20,
                      marginBottom: 6,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: "rgba(255,255,255,0.9)",
                      }}
                    >
                      Dashboard Siswa
                    </span>
                  </div>
                  <p
                    style={{
                      fontSize: 20,
                      fontWeight: 700,
                      color: "#fff",
                      margin: "0 0 2px",
                    }}
                  >
                    Rekap Kehadiran PKL
                  </p>
                  <p
                    style={{
                      fontSize: 12,
                      color: "rgba(255,255,255,0.75)",
                      margin: 0,
                    }}
                  >
                    {hariIni}
                  </p>
                </div>
              </div>

              {/* Percentage badge */}
              <div
                style={{
                  background: "rgba(255,255,255,0.15)",
                  backdropFilter: "blur(8px)",
                  borderRadius: 16,
                  padding: "12px 18px",
                  textAlign: "center",
                  border: "1px solid rgba(255,255,255,0.2)",
                }}
              >
                <p
                  style={{
                    fontSize: 30,
                    fontWeight: 800,
                    color: "#fff",
                    margin: 0,
                    lineHeight: 1,
                  }}
                >
                  {loading ? "—" : `${pct}%`}
                </p>
                <p
                  style={{
                    fontSize: 11,
                    color: "rgba(255,255,255,0.75)",
                    margin: "4px 0 0",
                  }}
                >
                  kehadiran
                </p>
              </div>
            </div>

            {/* Bottom row — 4 quick stats */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: 10,
              }}
            >
              {[
                {
                  v: stats.totalHariBulanIni,
                  l: "Total Hari",
                  icon: (
                    <CalendarCheck size={16} color="rgba(255,255,255,0.85)" />
                  ),
                },
                {
                  v: stats.hadirBulanIni,
                  l: "Hadir",
                  icon: (
                    <CheckCircle2 size={16} color="rgba(255,255,255,0.85)" />
                  ),
                },
                {
                  v: izin,
                  l: "Izin / Sakit",
                  icon: <BookOpen size={16} color="rgba(255,255,255,0.85)" />,
                },
                {
                  v: stats.tidakHadirBulanIni,
                  l: "Alfa",
                  icon: <XCircle size={16} color="rgba(255,255,255,0.85)" />,
                },
              ].map((b) => (
                <div
                  key={b.l}
                  style={{
                    background: "rgba(255,255,255,0.12)",
                    backdropFilter: "blur(4px)",
                    border: "1px solid rgba(255,255,255,0.18)",
                    borderRadius: 14,
                    padding: "12px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  {b.icon}
                  <p
                    style={{
                      fontSize: 22,
                      fontWeight: 800,
                      color: "#fff",
                      margin: 0,
                      lineHeight: 1,
                    }}
                  >
                    {loading ? "—" : b.v}
                  </p>
                  <p
                    style={{
                      fontSize: 10,
                      color: "rgba(255,255,255,0.75)",
                      margin: 0,
                      textAlign: "center",
                    }}
                  >
                    {b.l}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* ── INFO CARDS 4-col berwarna ── */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 12,
              marginBottom: 14,
            }}
          >
            {[
              {
                label: "Kehadiran Bulan Ini",
                val: `${pct}%`,
                sub: `${stats.hadirBulanIni} dari ${stats.totalHariBulanIni} hari`,
                gradient: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                icon: <TrendingUp size={20} color="#fff" />,
                pct: pct,
              },
              {
                label: "Target Kehadiran",
                val: "80%",
                sub:
                  pct >= 80 ? "Target tercapai! 🎉" : `Sisa ${80 - pct}% lagi`,
                gradient:
                  pct >= 80
                    ? "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)"
                    : "linear-gradient(135deg, #f59e0b 0%, #f97316 100%)",
                icon: <Target size={20} color="#fff" />,
                pct: 80,
              },
              {
                label: "Total Izin",
                val: `${izin} hari`,
                sub: "Dengan keterangan",
                gradient: "linear-gradient(135deg, #f59e0b 0%, #ea9e00 100%)",
                icon: <BookOpen size={20} color="#fff" />,
                pct:
                  stats.totalHariBulanIni > 0
                    ? Math.round((izin / stats.totalHariBulanIni) * 100)
                    : 0,
              },
              {
                label: "Total Alfa",
                val: `${stats.tidakHadirBulanIni} hari`,
                sub: "Tanpa keterangan",
                gradient: "linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)",
                icon: <XCircle size={20} color="#fff" />,
                pct:
                  stats.totalHariBulanIni > 0
                    ? Math.round(
                        (stats.tidakHadirBulanIni / stats.totalHariBulanIni) *
                          100,
                      )
                    : 0,
              },
            ].map((card) => (
              <div
                key={card.label}
                style={{
                  background: card.gradient,
                  borderRadius: 18,
                  padding: "18px",
                  color: "#fff",
                  boxShadow: "0 4px 18px rgba(0,0,0,0.14)",
                  transition: "transform 0.2s, box-shadow 0.2s",
                  cursor: "default",
                  position: "relative",
                  overflow: "hidden",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.transform =
                    "translateY(-3px) scale(1.02)";
                  (e.currentTarget as HTMLDivElement).style.boxShadow =
                    "0 10px 30px rgba(0,0,0,0.2)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.transform =
                    "translateY(0) scale(1)";
                  (e.currentTarget as HTMLDivElement).style.boxShadow =
                    "0 4px 18px rgba(0,0,0,0.14)";
                }}
              >
                {/* Decorative circle */}
                <div
                  style={{
                    position: "absolute",
                    right: -16,
                    top: -16,
                    width: 70,
                    height: 70,
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.1)",
                  }}
                />
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 12,
                    background: "rgba(255,255,255,0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 12,
                  }}
                >
                  {card.icon}
                </div>
                <p
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    opacity: 0.85,
                    margin: "0 0 4px",
                    letterSpacing: "0.04em",
                  }}
                >
                  {card.label}
                </p>
                <p
                  style={{
                    fontSize: 24,
                    fontWeight: 800,
                    margin: "0 0 4px",
                    lineHeight: 1,
                  }}
                >
                  {loading ? "—" : card.val}
                </p>
                <p style={{ fontSize: 11, opacity: 0.75, margin: "0 0 12px" }}>
                  {card.sub}
                </p>
                {/* Mini progress */}
                <div
                  style={{
                    height: 4,
                    borderRadius: 3,
                    background: "rgba(255,255,255,0.25)",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: loading ? "0%" : `${Math.min(card.pct, 100)}%`,
                      background: "rgba(255,255,255,0.8)",
                      borderRadius: 3,
                      transition: "width 0.8s ease",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* ── Middle: Donut | Progress Detail ── */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
              marginBottom: 14,
            }}
          >
            {/* Donut card */}
            <div
              style={{
                background: "var(--color-background-primary)",
                border: "0.5px solid var(--color-border-tertiary)",
                borderRadius: 16,
                padding: "22px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  marginBottom: 16,
                }}
              >
                <TrendingUp size={13} color="#10b981" />
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: "var(--color-text-secondary)",
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                  }}
                >
                  Distribusi Bulan Ini
                </span>
              </div>
              {loading ? (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 14,
                  }}
                >
                  <Sk w={140} h={140} r={70} />
                  <Sk h={12} />
                  <Sk h={12} />
                  <Sk h={12} />
                </div>
              ) : (
                <>
                  {/* Donut */}
                  <div
                    style={{
                      position: "relative",
                      width: "100%",
                      height: 170,
                      marginBottom: 18,
                    }}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={
                            donutData.length > 0
                              ? donutData
                              : [{ name: "Kosong", value: 1 }]
                          }
                          cx="50%"
                          cy="50%"
                          innerRadius={52}
                          outerRadius={78}
                          paddingAngle={4}
                          dataKey="value"
                          startAngle={90}
                          endAngle={-270}
                          animationBegin={0}
                          animationDuration={800}
                        >
                          {(donutData.length > 0
                            ? donutData
                            : [{ name: "Kosong", value: 1 }]
                          ).map((_, i) => (
                            <Cell
                              key={i}
                              fill={
                                donutData.length > 0
                                  ? DONUT_COLORS[i]
                                  : "#e5e7eb"
                              }
                            />
                          ))}
                        </Pie>
                        {donutData.length > 0 && (
                          <Tooltip content={<DonutTooltip />} />
                        )}
                      </PieChart>
                    </ResponsiveContainer>
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        pointerEvents: "none",
                      }}
                    >
                      <span
                        style={{
                          fontSize: 26,
                          fontWeight: 800,
                          color: "var(--color-text-primary)",
                          lineHeight: 1,
                        }}
                      >
                        {pct}%
                      </span>
                      <span
                        style={{
                          fontSize: 11,
                          color: "var(--color-text-secondary)",
                          marginTop: 4,
                        }}
                      >
                        hadir
                      </span>
                    </div>
                  </div>

                  {/* Legend rows — lebih detail */}
                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 8 }}
                  >
                    {[
                      {
                        label: "Hadir",
                        val: stats.hadirBulanIni,
                        color: "#10b981",
                        bg: "#f0fdf4",
                        tc: "#15803d",
                        icon: <CheckCircle2 size={14} />,
                      },
                      {
                        label: "Izin / Sakit",
                        val: izin,
                        color: "#f59e0b",
                        bg: "#fefce8",
                        tc: "#a16207",
                        icon: <BookOpen size={14} />,
                      },
                      {
                        label: "Alfa",
                        val: stats.tidakHadirBulanIni,
                        color: "#f43f5e",
                        bg: "#fef2f2",
                        tc: "#be123c",
                        icon: <XCircle size={14} />,
                      },
                    ].map((b) => {
                      const bPct =
                        stats.totalHariBulanIni > 0
                          ? Math.round((b.val / stats.totalHariBulanIni) * 100)
                          : 0;
                      return (
                        <div
                          key={b.label}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            padding: "9px 12px",
                            background: b.bg,
                            borderRadius: 12,
                            border: `1px solid ${b.color}22`,
                          }}
                        >
                          <div style={{ color: b.tc }}>{b.icon}</div>
                          <span
                            style={{
                              fontSize: 12,
                              color: b.tc,
                              fontWeight: 600,
                              flex: 1,
                            }}
                          >
                            {b.label}
                          </span>
                          <span
                            style={{
                              fontSize: 15,
                              fontWeight: 800,
                              color: b.tc,
                            }}
                          >
                            {b.val}
                          </span>
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 600,
                              background: "rgba(0,0,0,0.06)",
                              padding: "2px 7px",
                              borderRadius: 20,
                              color: b.tc,
                            }}
                          >
                            {bPct}%
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            {/* Progress Detail */}
            <div
              style={{
                background: "var(--color-background-primary)",
                border: "0.5px solid var(--color-border-tertiary)",
                borderRadius: 16,
                padding: "22px",
                display: "flex",
                flexDirection: "column",
                gap: 0,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  marginBottom: 16,
                }}
              >
                <Target size={13} color="#6366f1" />
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: "var(--color-text-secondary)",
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                  }}
                >
                  Progres Kehadiran
                </span>
              </div>

              {/* Main large progress */}
              <div style={{ marginBottom: 18 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "baseline",
                    marginBottom: 8,
                  }}
                >
                  <span
                    style={{
                      fontSize: 13,
                      color: "var(--color-text-secondary)",
                      fontWeight: 500,
                    }}
                  >
                    Total kehadiran
                  </span>
                  <span
                    style={{
                      fontSize: 22,
                      fontWeight: 800,
                      color: pctColor,
                    }}
                  >
                    {pct}%
                  </span>
                </div>
                <div
                  style={{
                    position: "relative",
                    height: 12,
                    background: "var(--color-background-tertiary)",
                    borderRadius: 8,
                    overflow: "hidden",
                    marginBottom: 8,
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: loading ? "0%" : `${Math.min(pct, 100)}%`,
                      background: `linear-gradient(90deg, ${pctColor}, ${pctColor}cc)`,
                      borderRadius: 8,
                      transition: "width 0.8s ease",
                    }}
                  />
                  {/* Target marker */}
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      bottom: 0,
                      left: "80%",
                      width: 2,
                      background: "#6366f1",
                      opacity: 0.5,
                    }}
                  />
                </div>
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span
                    style={{
                      fontSize: 10,
                      color: "var(--color-text-secondary)",
                    }}
                  >
                    0%
                  </span>
                  <span
                    style={{ fontSize: 10, color: "#6366f1", fontWeight: 600 }}
                  >
                    ▲ Target 80%
                  </span>
                  <span
                    style={{
                      fontSize: 10,
                      color: "var(--color-text-secondary)",
                    }}
                  >
                    100%
                  </span>
                </div>
                {!loading && (
                  <p
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: pctTc,
                      marginTop: 8,
                      textAlign: "center",
                    }}
                  >
                    {pct >= 80
                      ? "Anda sudah melampaui target! 🎉"
                      : `Butuh ${80 - pct}% lagi untuk mencapai target`}
                  </p>
                )}
              </div>

              {/* Divider */}
              <div
                style={{
                  height: "0.5px",
                  background: "var(--color-border-tertiary)",
                  marginBottom: 18,
                }}
              />

              {/* Per-category progress bars */}
              <div
                style={{ display: "flex", flexDirection: "column", gap: 14 }}
              >
                {[
                  {
                    label: "Hadir",
                    val: stats.hadirBulanIni,
                    color: "#10b981",
                    bg: "#f0fdf4",
                  },
                  {
                    label: "Izin / Sakit",
                    val: izin,
                    color: "#f59e0b",
                    bg: "#fefce8",
                  },
                  {
                    label: "Alfa",
                    val: stats.tidakHadirBulanIni,
                    color: "#f43f5e",
                    bg: "#fef2f2",
                  },
                ].map((b) => {
                  const bPct =
                    stats.totalHariBulanIni > 0
                      ? Math.round((b.val / stats.totalHariBulanIni) * 100)
                      : 0;
                  return (
                    <div key={b.label}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: 6,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                          }}
                        >
                          <span
                            style={{
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              background: b.color,
                              display: "inline-block",
                            }}
                          />
                          <span
                            style={{
                              fontSize: 12,
                              color: "var(--color-text-secondary)",
                              fontWeight: 500,
                            }}
                          >
                            {b.label}
                          </span>
                        </div>
                        <span
                          style={{
                            fontSize: 12,
                            fontWeight: 700,
                            color: b.color,
                          }}
                        >
                          {loading ? "—" : `${b.val} hari (${bPct}%)`}
                        </span>
                      </div>
                      <div
                        style={{
                          height: 7,
                          borderRadius: 5,
                          background: b.bg,
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            height: "100%",
                            width: loading ? "0%" : `${bPct}%`,
                            background: b.color,
                            borderRadius: 5,
                            transition: "width 0.8s ease",
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Divider */}
              <div
                style={{
                  height: "0.5px",
                  background: "var(--color-border-tertiary)",
                  margin: "18px 0",
                }}
              />

              {/* Streak / Pencapaian */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 8,
                }}
              >
                <div
                  style={{
                    background: "#fdf4ff",
                    borderRadius: 12,
                    padding: "12px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 4,
                    border: "1px solid #e879f922",
                  }}
                >
                  <Flame size={20} color="#c026d3" />
                  <p
                    style={{
                      fontSize: 16,
                      fontWeight: 800,
                      color: "#c026d3",
                      margin: 0,
                    }}
                  >
                    {stats.hadirBulanIni > 0 ? `${stats.hadirBulanIni}×` : "—"}
                  </p>
                  <p
                    style={{
                      fontSize: 10,
                      color: "#a21caf",
                      margin: 0,
                      textAlign: "center",
                    }}
                  >
                    Hadir bulan ini
                  </p>
                </div>
                <div
                  style={{
                    background: "#fffbeb",
                    borderRadius: 12,
                    padding: "12px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 4,
                    border: "1px solid #fcd34d22",
                  }}
                >
                  <Star size={20} color="#d97706" />
                  <p
                    style={{
                      fontSize: 16,
                      fontWeight: 800,
                      color: "#d97706",
                      margin: 0,
                    }}
                  >
                    {pct >= 80 ? "A" : pct >= 60 ? "B" : "C"}
                  </p>
                  <p
                    style={{
                      fontSize: 10,
                      color: "#92400e",
                      margin: 0,
                      textAlign: "center",
                    }}
                  >
                    Grade kehadiran
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ── Motivasi Banner ── */}
          {!loading && (
            <div
              style={{
                background: motivasiGradient,
                borderRadius: 16,
                padding: "18px 22px",
                marginBottom: 14,
                display: "flex",
                alignItems: "center",
                gap: 16,
                boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  right: -20,
                  top: -20,
                  width: 100,
                  height: 100,
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.08)",
                }}
              />
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  background: "rgba(255,255,255,0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <ShieldCheck size={24} color="#fff" />
              </div>
              <div style={{ flex: 1 }}>
                <p
                  style={{
                    fontSize: 15,
                    fontWeight: 700,
                    color: "#fff",
                    margin: "0 0 3px",
                  }}
                >
                  {motivasiText.title}
                </p>
                <p
                  style={{
                    fontSize: 12,
                    color: "rgba(255,255,255,0.85)",
                    margin: 0,
                  }}
                >
                  {motivasiText.body}
                </p>
              </div>
              <div
                style={{
                  background: "rgba(255,255,255,0.2)",
                  borderRadius: 14,
                  padding: "10px 16px",
                  textAlign: "center",
                  flexShrink: 0,
                }}
              >
                <p
                  style={{
                    fontSize: 22,
                    fontWeight: 800,
                    color: "#fff",
                    margin: 0,
                    lineHeight: 1,
                  }}
                >
                  {pct}%
                </p>
                <p
                  style={{
                    fontSize: 10,
                    color: "rgba(255,255,255,0.8)",
                    margin: "3px 0 0",
                  }}
                >
                  dari 80%
                </p>
              </div>
            </div>
          )}

          {/* ── Informasi Card ── */}
          <div
            style={{
              background: "var(--color-background-primary)",
              border: "0.5px solid var(--color-border-tertiary)",
              borderRadius: 16,
              overflow: "hidden",
            }}
          >
            {/* header */}
            <div
              style={{
                padding: "14px 20px",
                borderBottom: "0.5px solid var(--color-border-tertiary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 8,
                    background: "#f0fdf4",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Bell size={13} color="#10b981" />
                </div>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "var(--color-text-primary)",
                  }}
                >
                  Informasi Terbaru
                </span>
              </div>
              <a
                href="/siswa/informasi"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  fontSize: 12,
                  color: "#15803d",
                  fontWeight: 500,
                  background: "#f0fdf4",
                  border: "0.5px solid #bbf7d0",
                  borderRadius: 20,
                  padding: "5px 12px",
                  textDecoration: "none",
                  transition: "background 0.15s",
                }}
              >
                Lihat semua <ChevronRight size={13} />
              </a>
            </div>

            {/* list */}
            <div>
              {loadingInfo ? (
                <div
                  style={{
                    padding: 32,
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  <div
                    style={{
                      width: 24,
                      height: 24,
                      border: "2px solid var(--color-border-tertiary)",
                      borderTopColor: "#10b981",
                      borderRadius: "50%",
                      animation: "spin 0.8s linear infinite",
                    }}
                  />
                </div>
              ) : informasiList.length === 0 ? (
                <div
                  style={{
                    padding: "48px 20px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 12,
                      background: "#f0fdf4",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Bell size={18} color="#6ee7b7" />
                  </div>
                  <p
                    style={{
                      fontSize: 13,
                      color: "var(--color-text-secondary)",
                      margin: 0,
                    }}
                  >
                    Belum ada informasi terbaru.
                  </p>
                  <p
                    style={{
                      fontSize: 12,
                      color: "var(--color-text-secondary)",
                      opacity: 0.6,
                      margin: 0,
                    }}
                  >
                    Pengumuman baru akan muncul di sini.
                  </p>
                </div>
              ) : (
                informasiList.map((item, idx) => {
                  const config = getTipeConfig(item.tipe);
                  const isExpanded = expandedId === item.id;
                  const isLast = idx === informasiList.length - 1;
                  return (
                    <div
                      key={item.id}
                      onClick={() => setExpandedId(isExpanded ? null : item.id)}
                      style={{
                        padding: "14px 20px",
                        borderBottom: isLast
                          ? "none"
                          : "0.5px solid var(--color-border-tertiary)",
                        cursor: "pointer",
                        transition: "background 0.15s",
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 12,
                      }}
                      onMouseEnter={(e) =>
                        ((e.currentTarget as HTMLDivElement).style.background =
                          "var(--color-background-secondary)")
                      }
                      onMouseLeave={(e) =>
                        ((e.currentTarget as HTMLDivElement).style.background =
                          "transparent")
                      }
                    >
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 9,
                          background: config.iconBg,
                          color: config.iconColor,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          marginTop: 1,
                        }}
                      >
                        {config.icon}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            marginBottom: 4,
                            flexWrap: "wrap",
                          }}
                        >
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 600,
                              padding: "2px 8px",
                              borderRadius: 20,
                              background: config.pill.bg,
                              color: config.pill.color,
                              border: `0.5px solid ${config.pill.border}`,
                            }}
                          >
                            {item.tipe || "Umum"}
                          </span>
                          {item.tempatPKL && (
                            <span
                              style={{
                                fontSize: 11,
                                color: "var(--color-text-secondary)",
                              }}
                            >
                              {item.tempatPKL}
                            </span>
                          )}
                          <span
                            style={{
                              fontSize: 11,
                              color: "var(--color-text-secondary)",
                              marginLeft: "auto",
                            }}
                          >
                            {formatTanggal(item.tanggal)}
                          </span>
                        </div>
                        <p
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: "var(--color-text-primary)",
                            margin: "0 0 2px",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: isExpanded ? "normal" : "nowrap",
                          }}
                        >
                          {item.judul}
                        </p>
                        <p
                          style={{
                            fontSize: 12,
                            color: "var(--color-text-secondary)",
                            margin: 0,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: isExpanded ? "normal" : "nowrap",
                            lineHeight: 1.5,
                          }}
                        >
                          {item.isi}
                        </p>
                      </div>
                      <ChevronRight
                        size={15}
                        style={{
                          color: "var(--color-text-secondary)",
                          flexShrink: 0,
                          marginTop: 4,
                          transform: isExpanded
                            ? "rotate(90deg)"
                            : "rotate(0deg)",
                          transition: "transform 0.2s",
                        }}
                      />
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <style>{`
            @keyframes spin { to { transform: rotate(360deg); } }
            @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
          `}</style>
        </main>
      </div>
    </div>
  );
}
