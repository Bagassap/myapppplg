"use client";
import React, { useState, useEffect, useMemo } from "react";
import Sidebar from "@/components/layout/SidebarAdmin";
import TopBar from "@/components/layout/TopBar";
import GreetingBanner from "@/components/GreetingBanner";
import {
  Users,
  TrendingUp,
  CheckCircle2,
  XCircle,
  BookOpen,
  Award,
  Activity,
  Sparkles,
  BarChart3,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  CartesianGrid,
} from "recharts";
const DONUT_COLORS = ["#6366f1", "#f59e0b", "#f43f5e"];

const CLASS_THEMES = [
  {
    accent: "#6366f1",
    glow: "rgba(99,102,241,0.15)",
    ring: "rgba(99,102,241,0.25)",
  },
  {
    accent: "#10b981",
    glow: "rgba(16,185,129,0.15)",
    ring: "rgba(16,185,129,0.25)",
  },
  {
    accent: "#f97316",
    glow: "rgba(249,115,22,0.15)",
    ring: "rgba(249,115,22,0.25)",
  },
  {
    accent: "#f43f5e",
    glow: "rgba(244,63,94,0.15)",
    ring: "rgba(244,63,94,0.25)",
  },
  {
    accent: "#8b5cf6",
    glow: "rgba(139,92,246,0.15)",
    ring: "rgba(139,92,246,0.25)",
  },
  {
    accent: "#0ea5e9",
    glow: "rgba(14,165,233,0.15)",
    ring: "rgba(14,165,233,0.25)",
  },
];

const DonutTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "rgba(15,15,30,0.95)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 12,
        padding: "8px 14px",
        fontSize: 12,
        backdropFilter: "blur(20px)",
      }}
    >
      <p style={{ color: "#e2e8f0", fontWeight: 700 }}>{payload[0].name}</p>
      <p style={{ color: "#94a3b8" }}>
        Jumlah: <strong style={{ color: "#fff" }}>{payload[0].value}</strong>
      </p>
    </div>
  );
};

const TrendTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "rgba(15,15,30,0.95)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 12,
        padding: "8px 14px",
        fontSize: 12,
        backdropFilter: "blur(20px)",
      }}
    >
      <p style={{ color: "#94a3b8", fontWeight: 600, marginBottom: 4 }}>
        {label}
      </p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.fill, fontWeight: 700 }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
};

const Skeleton = ({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) => (
  <div
    className={className}
    style={{
      background: "rgba(255,255,255,0.06)",
      borderRadius: 12,
      animation: "pulse 2s cubic-bezier(0.4,0,0.6,1) infinite",
      ...style,
    }}
  />
);
function StatCard({
  label,
  value,
  icon,
  gradient,
  glow,
  glowHover,
  sub,
  pct,
  loading,
}: {
  label: string;
  value: number | null;
  icon: React.ReactNode;
  gradient: string;
  glow: string;
  glowHover: string;
  sub: string;
  pct?: string;
  loading: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: gradient,
        borderRadius: 20,
        padding: "22px 20px",
        position: "relative",
        overflow: "hidden",
        cursor: "pointer",
        transition: "transform 0.3s ease, box-shadow 0.3s ease",
        transform: hovered
          ? "translateY(-5px) scale(1.025)"
          : "translateY(0) scale(1)",
        boxShadow: hovered ? `0 20px 50px ${glowHover}` : `0 8px 28px ${glow}`,
      }}
    >
      <div
        style={{
          position: "absolute",
          width: 110,
          height: 110,
          right: -28,
          top: -28,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.1)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 65,
          height: 65,
          right: 12,
          top: 48,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.12)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 18,
          right: 18,
          padding: 9,
          borderRadius: 13,
          background: "rgba(255,255,255,0.18)",
          backdropFilter: "blur(10px)",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {icon}
      </div>
      <p
        style={{
          fontSize: 10,
          fontWeight: 800,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.75)",
          marginBottom: 10,
        }}
      >
        {label}
      </p>
      {loading ? (
        <div
          style={{
            height: 40,
            width: 72,
            borderRadius: 10,
            background: "rgba(255,255,255,0.2)",
            marginBottom: 8,
            animation: "pulse 2s infinite",
          }}
        />
      ) : (
        <p
          style={{
            fontSize: 42,
            fontWeight: 900,
            color: "#fff",
            lineHeight: 1,
            marginBottom: 6,
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}
        >
          {value}
        </p>
      )}

      {/* Sub */}
      <p
        style={{
          fontSize: 12,
          color: "rgba(255,255,255,0.65)",
          fontWeight: 500,
        }}
      >
        {pct ? `${pct} · ` : ""}
        {sub}
      </p>

      {/* Bottom progress bar */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 3,
          background: "rgba(255,255,255,0.15)",
        }}
      >
        <div
          style={{
            height: "100%",
            width: pct ? `${pct.replace("%", "")}%` : "100%",
            background: "rgba(255,255,255,0.5)",
            transition: "width 1s ease",
          }}
        />
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSiswa: 0,
    hadirHariIni: 0,
    tidakHadir: 0,
    persentaseKehadiran: 0,
  });
  const [classData, setClassData] = useState<any[]>([]);

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/dashboard?t=${Date.now()}`);
        if (res.ok) {
          const data = await res.json();
          if (data.cards) setStats(data.cards);
          if (data.table) setClassData(data.table);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const izin = useMemo(
    () => Math.max(0, stats.totalSiswa - stats.hadirHariIni - stats.tidakHadir),
    [stats],
  );
  const pct = stats.persentaseKehadiran;

  const donutData = useMemo(
    () =>
      [
        { name: "Hadir", value: stats.hadirHariIni },
        { name: "Izin/Sakit", value: izin },
        { name: "Tidak Hadir", value: stats.tidakHadir },
      ].filter((d) => d.value > 0),
    [stats, izin],
  );

  const trendData = [
    { day: "Sen", hadir: 0, absen: 0 },
    { day: "Sel", hadir: 0, absen: 0 },
    { day: "Rab", hadir: 0, absen: 0 },
    { day: "Kam", hadir: 0, absen: 0 },
    { day: "Jum", hadir: stats.hadirHariIni, absen: stats.tidakHadir + izin },
    { day: "Sab", hadir: 0, absen: 0 },
    { day: "Min", hadir: 0, absen: 0 },
  ];

  const bestClass =
    classData.length > 0
      ? classData.reduce(
          (a, b) => (a.persentase > b.persentase ? a : b),
          classData[0],
        )
      : null;
  const worstClass =
    classData.length > 0
      ? classData.reduce(
          (a, b) => (a.persentase < b.persentase ? a : b),
          classData[0],
        )
      : null;

  const hariIni = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const statCards = [
    {
      label: "Total Siswa",
      value: stats.totalSiswa,
      icon: <Users className="w-5 h-5" />,
      gradient:
        "linear-gradient(135deg, #4f46e5 0%, #6366f1 60%, #818cf8 100%)",
      glow: "rgba(99,102,241,0.4)",
      glowHover: "rgba(99,102,241,0.65)",
      sub: "Terdaftar aktif",
      pct: "100%",
    },
    {
      label: "Hadir Hari Ini",
      value: stats.hadirHariIni,
      icon: <CheckCircle2 className="w-5 h-5" />,
      gradient:
        "linear-gradient(135deg, #0d9488 0%, #10b981 60%, #34d399 100%)",
      glow: "rgba(16,185,129,0.4)",
      glowHover: "rgba(16,185,129,0.65)",
      sub: "dari total siswa",
      pct: `${pct}%`,
    },
    {
      label: "Izin / Sakit",
      value: izin,
      icon: <BookOpen className="w-5 h-5" />,
      gradient:
        "linear-gradient(135deg, #f97316 0%, #f59e0b 60%, #fbbf24 100%)",
      glow: "rgba(245,158,11,0.4)",
      glowHover: "rgba(245,158,11,0.65)",
      sub: "Ada keterangan",
      pct:
        stats.totalSiswa > 0
          ? `${Math.round((izin / stats.totalSiswa) * 100)}%`
          : "0%",
    },
    {
      label: "Alfa",
      value: stats.tidakHadir,
      icon: <XCircle className="w-5 h-5" />,
      gradient:
        "linear-gradient(135deg, #e11d48 0%, #f43f5e 60%, #fb7185 100%)",
      glow: "rgba(244,63,94,0.4)",
      glowHover: "rgba(244,63,94,0.65)",
      sub: "Tanpa keterangan",
      pct:
        stats.totalSiswa > 0
          ? `${Math.round((stats.tidakHadir / stats.totalSiswa) * 100)}%`
          : "0%",
    },
  ];

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        background: "#0a0a14",
        overflow: "hidden",
      }}
    >
      <Sidebar />
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
        }}
      >
        <TopBar />
        <main
          style={{
            flex: 1,
            padding: "28px 32px",
            overflowY: "auto",
            overflowX: "hidden",
            background:
              "linear-gradient(160deg, #0a0a14 0%, #0d0d1f 50%, #0a0f1a 100%)",
          }}
        >
          <div
            style={{
              position: "fixed",
              inset: 0,
              pointerEvents: "none",
              zIndex: 0,
            }}
          >
            <div
              style={{
                position: "absolute",
                width: 600,
                height: 600,
                borderRadius: "50%",
                left: -150,
                top: -150,
                background:
                  "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 65%)",
                filter: "blur(40px)",
              }}
            />
            <div
              style={{
                position: "absolute",
                width: 500,
                height: 500,
                borderRadius: "50%",
                right: -100,
                bottom: -100,
                background:
                  "radial-gradient(circle, rgba(16,185,129,0.1) 0%, transparent 65%)",
                filter: "blur(40px)",
              }}
            />
          </div>

          <div style={{ position: "relative", zIndex: 1 }}>
            <GreetingBanner />
            <div
              style={{
                position: "relative",
                background:
                  "linear-gradient(135deg, #0f0c29 0%, #302b63 45%, #1a1a3e 100%)",
                borderRadius: 24,
                padding: "28px 32px",
                marginBottom: 24,
                overflow: "hidden",
                boxShadow:
                  "0 20px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)",
                border: "1px solid rgba(99,102,241,0.2)",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  width: 300,
                  height: 300,
                  borderRadius: "50%",
                  right: -60,
                  top: -120,
                  background:
                    "radial-gradient(circle, rgba(99,102,241,0.3) 0%, transparent 70%)",
                  pointerEvents: "none",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  width: 200,
                  height: 200,
                  borderRadius: "50%",
                  left: "35%",
                  bottom: -100,
                  background:
                    "radial-gradient(circle, rgba(16,185,129,0.18) 0%, transparent 70%)",
                  pointerEvents: "none",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  width: 120,
                  height: 120,
                  borderRadius: "50%",
                  left: 24,
                  top: 16,
                  background:
                    "radial-gradient(circle, rgba(245,158,11,0.15) 0%, transparent 70%)",
                  pointerEvents: "none",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  pointerEvents: "none",
                  opacity: 0.04,
                  backgroundImage:
                    "linear-gradient(rgba(255,255,255,.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.6) 1px, transparent 1px)",
                  backgroundSize: "36px 36px",
                }}
              />

              <div
                style={{
                  position: "relative",
                  zIndex: 1,
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: 20,
                }}
              >
                <div>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      fontSize: 10,
                      fontWeight: 800,
                      letterSpacing: "0.14em",
                      textTransform: "uppercase",
                      background: "rgba(99,102,241,0.2)",
                      color: "#a5b4fc",
                      border: "1px solid rgba(99,102,241,0.35)",
                      padding: "4px 12px",
                      borderRadius: 20,
                      marginBottom: 16,
                    }}
                  >
                    <Activity style={{ width: 12, height: 12 }} />
                    Dashboard Admin
                  </span>

                  <h1
                    style={{
                      fontSize: 32,
                      fontWeight: 900,
                      lineHeight: 1.1,
                      marginBottom: 6,
                      background:
                        "linear-gradient(90deg, #ffffff 0%, #c7d2fe 60%, #a5b4fc 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                    }}
                  >
                    Pantau Kehadiran Siswa
                  </h1>
                  <p
                    style={{ fontSize: 13, color: "#64748b", marginBottom: 20 }}
                  >
                    {hariIni}
                  </p>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {[
                      {
                        label: `${pct}% kehadiran`,
                        color: "#34d399",
                        bg: "rgba(52,211,153,0.15)",
                        border: "rgba(52,211,153,0.3)",
                      },
                      {
                        label: `${loading ? "—" : stats.totalSiswa} siswa`,
                        color: "#94a3b8",
                        bg: "rgba(148,163,184,0.1)",
                        border: "rgba(148,163,184,0.2)",
                      },
                      {
                        label: `${loading ? "—" : stats.tidakHadir + izin} tidak hadir`,
                        color: "#f87171",
                        bg: "rgba(248,113,113,0.12)",
                        border: "rgba(248,113,113,0.25)",
                      },
                    ].map((b) => (
                      <span
                        key={b.label}
                        style={{
                          padding: "5px 14px",
                          borderRadius: 20,
                          fontSize: 12,
                          fontWeight: 600,
                          background: b.bg,
                          color: b.color,
                          border: `1px solid ${b.border}`,
                        }}
                      >
                        {b.label}
                      </span>
                    ))}
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    borderRadius: 18,
                    overflow: "hidden",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    backdropFilter: "blur(20px)",
                  }}
                >
                  {[
                    { v: stats.hadirHariIni, l: "Hadir", c: "#34d399" },
                    { v: izin, l: "Izin", c: "#fbbf24" },
                    { v: stats.tidakHadir, l: "Alfa", c: "#f87171" },
                  ].map((s, i) => (
                    <div
                      key={i}
                      style={{
                        padding: "18px 24px",
                        textAlign: "center",
                        borderRight:
                          i < 2 ? "1px solid rgba(255,255,255,0.08)" : "none",
                      }}
                    >
                      <p
                        style={{
                          fontSize: 28,
                          fontWeight: 900,
                          lineHeight: 1,
                          color: s.c,
                          fontFamily: "'Plus Jakarta Sans', sans-serif",
                        }}
                      >
                        {loading ? "—" : s.v}
                      </p>
                      <p
                        style={{
                          fontSize: 10,
                          marginTop: 6,
                          color: "#475569",
                          fontWeight: 600,
                          letterSpacing: "0.1em",
                          textTransform: "uppercase",
                        }}
                      >
                        {s.l}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: 16,
                marginBottom: 24,
              }}
            >
              {statCards.map((card, i) => (
                <StatCard key={i} {...card} loading={loading} />
              ))}
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "2fr 3fr",
                gap: 16,
                marginBottom: 16,
              }}
            >
              <div
                style={{ display: "flex", flexDirection: "column", gap: 16 }}
              >
                <div
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 20,
                    padding: "22px 24px",
                    backdropFilter: "blur(20px)",
                  }}
                >
                  <p
                    style={{
                      fontSize: 10,
                      fontWeight: 800,
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      color: "#4ade80",
                      marginBottom: 18,
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <TrendingUp style={{ width: 12, height: 12 }} />
                    Distribusi Kehadiran
                  </p>

                  {loading ? (
                    <Skeleton
                      style={{
                        borderRadius: "50%",
                        height: 128,
                        width: 128,
                        display: "block",
                        margin: "0 auto",
                      }}
                    />
                  ) : (
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 20 }}
                    >
                      <div
                        style={{
                          position: "relative",
                          width: 130,
                          height: 130,
                          flexShrink: 0,
                        }}
                      >
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={donutData}
                              cx="50%"
                              cy="50%"
                              innerRadius={38}
                              outerRadius={58}
                              paddingAngle={4}
                              dataKey="value"
                              startAngle={90}
                              endAngle={-270}
                              animationBegin={0}
                              animationDuration={900}
                            >
                              {donutData.map((_, i) => (
                                <Cell key={i} fill={DONUT_COLORS[i]} />
                              ))}
                            </Pie>
                            <Tooltip content={<DonutTooltip />} />
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
                              fontSize: 22,
                              fontWeight: 900,
                              color: "#f1f5f9",
                              lineHeight: 1,
                              fontFamily: "'Plus Jakarta Sans', sans-serif",
                            }}
                          >
                            {pct}%
                          </span>
                          <span
                            style={{
                              fontSize: 9,
                              color: "#64748b",
                              marginTop: 3,
                              textTransform: "uppercase",
                              letterSpacing: "0.1em",
                              fontWeight: 600,
                            }}
                          >
                            hadir
                          </span>
                        </div>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 12,
                          flex: 1,
                        }}
                      >
                        {[
                          {
                            label: "Hadir",
                            val: stats.hadirHariIni,
                            color: "#6366f1",
                            bg: "rgba(99,102,241,0.15)",
                            tc: "#a5b4fc",
                          },
                          {
                            label: "Izin/Sakit",
                            val: izin,
                            color: "#f59e0b",
                            bg: "rgba(245,158,11,0.15)",
                            tc: "#fbbf24",
                          },
                          {
                            label: "Alfa",
                            val: stats.tidakHadir,
                            color: "#f43f5e",
                            bg: "rgba(244,63,94,0.15)",
                            tc: "#fb7185",
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
                                width: 10,
                                height: 10,
                                borderRadius: 3,
                                background: b.color,
                                flexShrink: 0,
                              }}
                            />
                            <span
                              style={{
                                fontSize: 12,
                                color: "#94a3b8",
                                flex: 1,
                              }}
                            >
                              {b.label}
                            </span>
                            <span
                              style={{
                                fontSize: 11,
                                fontWeight: 700,
                                padding: "2px 8px",
                                borderRadius: 20,
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

                <div
                  style={{
                    borderRadius: 20,
                    padding: "22px 24px",
                    background:
                      "linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)",
                    boxShadow: "0 12px 40px rgba(79,70,229,0.25)",
                    border: "1px solid rgba(99,102,241,0.2)",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      width: 160,
                      height: 160,
                      borderRadius: "50%",
                      right: -50,
                      bottom: -50,
                      background:
                        "radial-gradient(circle, rgba(99,102,241,0.35) 0%, transparent 70%)",
                      pointerEvents: "none",
                    }}
                  />

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      marginBottom: 12,
                    }}
                  >
                    <Award
                      style={{ width: 16, height: 16, color: "#a5b4fc" }}
                    />
                    <p
                      style={{
                        fontSize: 10,
                        fontWeight: 800,
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                        color: "#6366f1",
                      }}
                    >
                      Ringkasan Hari Ini
                    </p>
                  </div>

                  <p
                    style={{
                      fontSize: 52,
                      fontWeight: 900,
                      color: "#fff",
                      lineHeight: 1,
                      marginBottom: 4,
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                    }}
                  >
                    {pct}%
                  </p>
                  <p
                    style={{ fontSize: 12, color: "#64748b", marginBottom: 20 }}
                  >
                    Rata-rata kehadiran hari ini
                  </p>

                  {bestClass && (
                    <div
                      style={{
                        borderTop: "1px solid rgba(255,255,255,0.1)",
                        paddingTop: 16,
                        display: "flex",
                        flexDirection: "column",
                        gap: 8,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <span
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: "50%",
                            background: "#4ade80",
                            display: "inline-block",
                          }}
                        />
                        <p style={{ fontSize: 12, color: "#64748b" }}>
                          Terbaik:{" "}
                          <strong style={{ color: "#4ade80" }}>
                            {bestClass.kelas}
                          </strong>
                          <span style={{ color: "#475569" }}>
                            {" "}
                            — {bestClass.persentase}%
                          </span>
                        </p>
                      </div>
                      {worstClass && worstClass.kelas !== bestClass.kelas && (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                          }}
                        >
                          <span
                            style={{
                              width: 6,
                              height: 6,
                              borderRadius: "50%",
                              background: "#f87171",
                              display: "inline-block",
                            }}
                          />
                          <p style={{ fontSize: 12, color: "#64748b" }}>
                            Perhatian:{" "}
                            <strong style={{ color: "#f87171" }}>
                              {worstClass.kelas}
                            </strong>
                            <span style={{ color: "#475569" }}>
                              {" "}
                              — {worstClass.persentase}%
                            </span>
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 20,
                  padding: "22px 24px",
                  backdropFilter: "blur(20px)",
                }}
              >
                <p
                  style={{
                    fontSize: 10,
                    fontWeight: 800,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "#818cf8",
                    marginBottom: 18,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <Users style={{ width: 12, height: 12 }} />
                  Kehadiran Per Kelas
                </p>

                {loading ? (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 12,
                    }}
                  >
                    {[...Array(4)].map((_, i) => (
                      <div
                        key={i}
                        style={{
                          height: 100,
                          background: "rgba(255,255,255,0.05)",
                          borderRadius: 14,
                          animation: "pulse 2s infinite",
                        }}
                      />
                    ))}
                  </div>
                ) : classData.length === 0 ? (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      height: 120,
                      color: "#475569",
                      fontSize: 13,
                    }}
                  >
                    Tidak ada data.
                  </div>
                ) : (
                  <>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 12,
                        marginBottom: 16,
                      }}
                    >
                      {classData.map((item, i) => {
                        const th = CLASS_THEMES[i % CLASS_THEMES.length];
                        const barC =
                          item.persentase >= 80
                            ? "#10b981"
                            : item.persentase >= 60
                              ? "#f59e0b"
                              : "#f43f5e";
                        const initials = item.kelas
                          .split(" ")
                          .map((w: string) => w[0])
                          .join("")
                          .slice(0, 2);
                        const izinKelas = Math.max(
                          0,
                          (item.total || 0) -
                            (item.hadir || 0) -
                            (item.tidakHadir || 0),
                        );

                        return (
                          <div
                            key={i}
                            style={{
                              borderRadius: 16,
                              padding: "14px 16px",
                              background: th.glow,
                              border: `1px solid ${th.ring}`,
                              position: "relative",
                              overflow: "hidden",
                              transition: "transform 0.2s, box-shadow 0.2s",
                              cursor: "default",
                            }}
                            onMouseEnter={(e) => {
                              (
                                e.currentTarget as HTMLDivElement
                              ).style.transform = "translateY(-2px)";
                              (
                                e.currentTarget as HTMLDivElement
                              ).style.boxShadow = `0 8px 24px ${th.glow}`;
                            }}
                            onMouseLeave={(e) => {
                              (
                                e.currentTarget as HTMLDivElement
                              ).style.transform = "translateY(0)";
                              (
                                e.currentTarget as HTMLDivElement
                              ).style.boxShadow = "none";
                            }}
                          >
                            <div
                              style={{
                                position: "absolute",
                                width: 70,
                                height: 70,
                                borderRadius: "50%",
                                right: -18,
                                bottom: -18,
                                background: th.accent,
                                opacity: 0.15,
                                pointerEvents: "none",
                              }}
                            />

                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                marginBottom: 10,
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 8,
                                }}
                              >
                                <div
                                  style={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: 10,
                                    background: th.accent,
                                    color: "#fff",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: 11,
                                    fontWeight: 800,
                                    opacity: 0.9,
                                  }}
                                >
                                  {initials}
                                </div>
                                <div>
                                  <p
                                    style={{
                                      fontSize: 12,
                                      fontWeight: 700,
                                      color: "#e2e8f0",
                                    }}
                                  >
                                    {item.kelas}
                                  </p>
                                  <p style={{ fontSize: 10, color: "#64748b" }}>
                                    {item.hadir}/{item.total}
                                  </p>
                                </div>
                              </div>
                              <span
                                style={{
                                  fontSize: 11,
                                  fontWeight: 800,
                                  padding: "3px 8px",
                                  borderRadius: 20,
                                  background:
                                    item.persentase >= 80
                                      ? "rgba(74,222,128,0.15)"
                                      : item.persentase >= 60
                                        ? "rgba(251,191,36,0.15)"
                                        : "rgba(248,113,113,0.15)",
                                  color:
                                    item.persentase >= 80
                                      ? "#4ade80"
                                      : item.persentase >= 60
                                        ? "#fbbf24"
                                        : "#f87171",
                                }}
                              >
                                {item.persentase}%
                              </span>
                            </div>

                            <div
                              style={{
                                height: 5,
                                background: "rgba(255,255,255,0.1)",
                                borderRadius: 99,
                                overflow: "hidden",
                                marginBottom: 10,
                              }}
                            >
                              <div
                                style={{
                                  height: "100%",
                                  width: `${item.persentase}%`,
                                  background: barC,
                                  borderRadius: 99,
                                  transition: "width 1s ease",
                                }}
                              />
                            </div>

                            <div style={{ display: "flex", gap: 5 }}>
                              {[
                                { v: item.hadir, l: "H", color: "#4ade80" },
                                { v: izinKelas, l: "I", color: "#fbbf24" },
                                {
                                  v: item.tidakHadir || 0,
                                  l: "A",
                                  color: "#f87171",
                                },
                              ].map((c) => (
                                <span
                                  key={c.l}
                                  style={{
                                    fontSize: 10,
                                    fontWeight: 700,
                                    padding: "2px 7px",
                                    borderRadius: 8,
                                    background: "rgba(255,255,255,0.08)",
                                    color: c.color,
                                  }}
                                >
                                  {c.l}: {c.v}
                                </span>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div
                      style={{
                        display: "flex",
                        gap: 8,
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.06)",
                        borderRadius: 14,
                        padding: 4,
                      }}
                    >
                      {[
                        { v: stats.totalSiswa, l: "Total", color: "#94a3b8" },
                        { v: stats.hadirHariIni, l: "Hadir", color: "#4ade80" },
                        { v: izin, l: "Izin", color: "#fbbf24" },
                        { v: stats.tidakHadir, l: "Alfa", color: "#f87171" },
                      ].map((s) => (
                        <div
                          key={s.l}
                          style={{
                            flex: 1,
                            textAlign: "center",
                            padding: "10px 0",
                            borderRadius: 10,
                          }}
                        >
                          <p
                            style={{
                              fontSize: 16,
                              fontWeight: 900,
                              color: s.color,
                              fontFamily: "'Plus Jakarta Sans', sans-serif",
                            }}
                          >
                            {s.v}
                          </p>
                          <p
                            style={{
                              fontSize: 10,
                              color: "#475569",
                              marginTop: 2,
                              fontWeight: 600,
                            }}
                          >
                            {s.l}
                          </p>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            <div
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 20,
                padding: "22px 24px",
                backdropFilter: "blur(20px)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 20,
                }}
              >
                <p
                  style={{
                    fontSize: 10,
                    fontWeight: 800,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "#818cf8",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <BarChart3 style={{ width: 12, height: 12 }} />
                  Tren Kehadiran 7 Hari Terakhir
                </p>
                <div style={{ display: "flex", gap: 16 }}>
                  {[
                    { color: "#6366f1", label: "Hadir" },
                    { color: "#f87171", label: "Tidak hadir" },
                  ].map((l) => (
                    <span
                      key={l.label}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        fontSize: 12,
                        color: "#64748b",
                      }}
                    >
                      <span
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: 3,
                          background: l.color,
                          display: "inline-block",
                        }}
                      />
                      {l.label}
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ height: 148 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={trendData}
                    margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
                    barCategoryGap="35%"
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(255,255,255,0.05)"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="day"
                      tick={{ fontSize: 11, fill: "#475569" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={<TrendTooltip />} />
                    <Bar
                      dataKey="hadir"
                      name="Hadir"
                      fill="#6366f1"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={30}
                    />
                    <Bar
                      dataKey="absen"
                      name="Tidak hadir"
                      fill="#f87171"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={30}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
