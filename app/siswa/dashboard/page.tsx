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

          {/* ── Hero Header ── */}
          <div
            style={{
              background: "var(--color-background-primary)",
              border: "0.5px solid var(--color-border-tertiary)",
              borderRadius: 20,
              padding: "24px 28px",
              marginBottom: 20,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 16,
            }}
          >
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 6,
                }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 8,
                    background: "#eff6ff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <BookOpen size={14} color="#3b82f6" />
                </div>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: "#3b82f6",
                    letterSpacing: "0.07em",
                    textTransform: "uppercase",
                  }}
                >
                  Dashboard Siswa
                </span>
              </div>
              <p
                style={{
                  fontSize: 22,
                  fontWeight: 700,
                  color: "var(--color-text-primary)",
                  margin: "0 0 4px",
                }}
              >
                Rekap Kehadiran PKL
              </p>
              <p
                style={{
                  fontSize: 13,
                  color: "var(--color-text-secondary)",
                  margin: 0,
                }}
              >
                {hariIni}
              </p>
            </div>
            {/* 4 quick stats */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {[
                {
                  v: loading ? "—" : stats.totalHariBulanIni,
                  l: "total hari",
                  bg: "var(--color-background-secondary)",
                  tc: "var(--color-text-secondary)",
                  bc: "var(--color-border-tertiary)",
                },
                {
                  v: loading ? "—" : stats.hadirBulanIni,
                  l: "hadir",
                  bg: "#f0fdf4",
                  tc: "#15803d",
                  bc: "#bbf7d0",
                },
                {
                  v: loading ? "—" : izin,
                  l: "izin",
                  bg: "#fefce8",
                  tc: "#a16207",
                  bc: "#fde68a",
                },
                {
                  v: loading ? "—" : stats.tidakHadirBulanIni,
                  l: "alfa",
                  bg: "#fef2f2",
                  tc: "#be123c",
                  bc: "#fecaca",
                },
              ].map((b) => (
                <div
                  key={b.l}
                  style={{
                    background: b.bg,
                    border: `0.5px solid ${b.bc}`,
                    borderRadius: 12,
                    padding: "8px 16px",
                    textAlign: "center",
                  }}
                >
                  <p
                    style={{
                      fontSize: 18,
                      fontWeight: 700,
                      color: b.tc,
                      margin: 0,
                      lineHeight: 1,
                    }}
                  >
                    {b.v}
                  </p>
                  <p
                    style={{
                      fontSize: 11,
                      color: b.tc,
                      opacity: 0.7,
                      margin: "3px 0 0",
                      textTransform: "capitalize",
                    }}
                  >
                    {b.l}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Middle Grid: Donut | Progress ── */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
              marginBottom: 12,
            }}
          >
            {/* Donut card */}
            <div
              style={{
                background: "var(--color-background-primary)",
                border: "0.5px solid var(--color-border-tertiary)",
                borderRadius: 16,
                padding: "20px 22px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  marginBottom: 14,
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
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <Sk w={100} h={100} r={50} />
                  <div
                    style={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      gap: 8,
                    }}
                  >
                    <Sk h={12} />
                    <Sk h={12} />
                    <Sk h={12} />
                  </div>
                </div>
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div
                    style={{
                      position: "relative",
                      width: 100,
                      height: 100,
                      flexShrink: 0,
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
                          innerRadius={32}
                          outerRadius={48}
                          paddingAngle={3}
                          dataKey="value"
                          startAngle={90}
                          endAngle={-270}
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
                          fontSize: 16,
                          fontWeight: 700,
                          color: "var(--color-text-primary)",
                          lineHeight: 1,
                        }}
                      >
                        {pct}%
                      </span>
                      <span
                        style={{
                          fontSize: 9,
                          color: "var(--color-text-secondary)",
                          marginTop: 2,
                        }}
                      >
                        hadir
                      </span>
                    </div>
                  </div>
                  <div
                    style={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      gap: 8,
                    }}
                  >
                    {[
                      {
                        label: "Hadir",
                        val: stats.hadirBulanIni,
                        color: "#10b981",
                        bg: "#f0fdf4",
                        tc: "#15803d",
                      },
                      {
                        label: "Izin/Sakit",
                        val: izin,
                        color: "#f59e0b",
                        bg: "#fefce8",
                        tc: "#a16207",
                      },
                      {
                        label: "Alfa",
                        val: stats.tidakHadirBulanIni,
                        color: "#f43f5e",
                        bg: "#fef2f2",
                        tc: "#be123c",
                      },
                    ].map((b) => (
                      <div
                        key={b.label}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <span
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: 2,
                            background: b.color,
                            flexShrink: 0,
                          }}
                        />
                        <span
                          style={{
                            fontSize: 12,
                            color: "var(--color-text-secondary)",
                            flex: 1,
                          }}
                        >
                          {b.label}
                        </span>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 600,
                            padding: "2px 8px",
                            borderRadius: 6,
                            background: b.bg,
                            color: b.tc,
                          }}
                        >
                          {b.val}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Progress card */}
            <div
              style={{
                background: "var(--color-background-primary)",
                border: "0.5px solid var(--color-border-tertiary)",
                borderRadius: 16,
                padding: "20px 22px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  marginBottom: 14,
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

              {/* Main progress bar */}
              <div style={{ marginBottom: 16 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 6,
                  }}
                >
                  <span
                    style={{
                      fontSize: 12,
                      color: "var(--color-text-secondary)",
                    }}
                  >
                    Total kehadiran
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      padding: "2px 8px",
                      borderRadius: 6,
                      background: pctBg,
                      color: pctTc,
                    }}
                  >
                    {pct}%
                  </span>
                </div>
                <div
                  style={{
                    position: "relative",
                    height: 8,
                    background: "var(--color-background-tertiary)",
                    borderRadius: 6,
                    overflow: "hidden",
                    marginBottom: 6,
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: loading ? "0%" : `${Math.min(pct, 100)}%`,
                      background: pctColor,
                      borderRadius: 6,
                      transition: "width 0.7s ease",
                    }}
                  />
                  {/* target marker */}
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      bottom: 0,
                      left: "80%",
                      width: 1.5,
                      background: "var(--color-text-secondary)",
                      opacity: 0.3,
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
                    style={{
                      fontSize: 10,
                      color: "var(--color-text-secondary)",
                    }}
                  >
                    Target 80%
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
                      fontSize: 11,
                      fontWeight: 500,
                      color: pctTc,
                      marginTop: 6,
                    }}
                  >
                    {pct >= 80
                      ? "Anda melampaui target kehadiran 🎉"
                      : `Butuh ${80 - pct}% lagi untuk mencapai target`}
                  </p>
                )}
              </div>

              {/* Per-category bars */}
              <div
                style={{ display: "flex", flexDirection: "column", gap: 10 }}
              >
                {[
                  {
                    label: "Hadir",
                    val: stats.hadirBulanIni,
                    color: "#10b981",
                    bg: "#f0fdf4",
                    tc: "#15803d",
                  },
                  {
                    label: "Izin/Sakit",
                    val: izin,
                    color: "#f59e0b",
                    bg: "#fefce8",
                    tc: "#a16207",
                  },
                  {
                    label: "Alfa",
                    val: stats.tidakHadirBulanIni,
                    color: "#f43f5e",
                    bg: "#fef2f2",
                    tc: "#be123c",
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
                          marginBottom: 4,
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
                              width: 6,
                              height: 6,
                              borderRadius: "50%",
                              background: b.color,
                            }}
                          />
                          <span
                            style={{
                              fontSize: 12,
                              color: "var(--color-text-secondary)",
                            }}
                          >
                            {b.label}
                          </span>
                        </div>
                        <span
                          style={{ fontSize: 11, fontWeight: 600, color: b.tc }}
                        >
                          {loading ? "—" : `${b.val} hari (${bPct}%)`}
                        </span>
                      </div>
                      <div
                        style={{
                          height: 4,
                          borderRadius: 4,
                          background: b.bg,
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            height: "100%",
                            width: loading ? "0%" : `${bPct}%`,
                            background: b.color,
                            borderRadius: 4,
                            transition: "width 0.7s ease",
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

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

          {/* spin animation */}
          <style>{`@keyframes spin { to { transform: rotate(360deg); } } @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }`}</style>
        </main>
      </div>
    </div>
  );
}
