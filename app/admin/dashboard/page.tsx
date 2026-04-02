"use client";
import Sidebar from "@/components/layout/SidebarAdmin";
import TopBar from "@/components/layout/TopBar";
import GreetingBanner from "@/components/GreetingBanner";
import { useState, useEffect, useMemo } from "react";
import {
  Users,
  TrendingUp,
  CheckCircle2,
  XCircle,
  BookOpen,
  Activity,
  Award,
  AlertTriangle,
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

/* ─── Constants ─── */
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

const TrendTooltip = ({ active, payload, label }: any) => {
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
          color: "var(--color-text-secondary)",
          margin: "0 0 4px",
        }}
      >
        {label}
      </p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.fill, fontWeight: 500, margin: 0 }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
};

/* ─── Skeleton ─── */
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

/* ─── Class Card — berwarna per index ─── */
const CLASS_THEMES = [
  {
    gradient: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
    light: "#eff6ff",
    lightText: "#1d4ed8",
    label: "Kelas A",
  },
  {
    gradient: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    light: "#f0fdf4",
    lightText: "#15803d",
    label: "Kelas B",
  },
  {
    gradient: "linear-gradient(135deg, #f59e0b 0%, #f97316 100%)",
    light: "#fff7ed",
    lightText: "#c2410c",
    label: "Kelas C",
  },
  {
    gradient: "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)",
    light: "#faf5ff",
    lightText: "#6d28d9",
    label: "Kelas D",
  },
];

function ClassCard({ item, index }: { item: any; index: number }) {
  const theme = CLASS_THEMES[index % CLASS_THEMES.length];
  const izinKelas = Math.max(
    0,
    (item.total || 0) - (item.hadir || 0) - (item.tidakHadir || 0),
  );
  const p = item.persentase || 0;

  return (
    <div
      style={{
        borderRadius: 16,
        overflow: "hidden",
        background: theme.gradient,
        boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
        transition: "transform 0.2s, box-shadow 0.2s",
        cursor: "default",
        color: "#fff",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform =
          "translateY(-3px) scale(1.02)";
        (e.currentTarget as HTMLDivElement).style.boxShadow =
          "0 10px 32px rgba(0,0,0,0.2)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform =
          "translateY(0) scale(1)";
        (e.currentTarget as HTMLDivElement).style.boxShadow =
          "0 4px 20px rgba(0,0,0,0.12)";
      }}
    >
      {/* Top section */}
      <div style={{ padding: "18px 18px 14px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 12,
          }}
        >
          <div>
            <p style={{ fontSize: 14, fontWeight: 700, margin: 0, opacity: 1 }}>
              {item.kelas}
            </p>
          </div>
          <span
            style={{
              fontSize: 12,
              fontWeight: 700,
              background: "rgba(255,255,255,0.25)",
              padding: "3px 10px",
              borderRadius: 20,
              backdropFilter: "blur(4px)",
            }}
          >
            {p}%
          </span>
        </div>

        {/* Big percentage */}
        <p
          style={{
            fontSize: 36,
            fontWeight: 800,
            margin: "0 0 2px",
            lineHeight: 1,
          }}
        >
          {p}%
        </p>
        <p style={{ fontSize: 11, opacity: 0.8, margin: "0 0 12px" }}>
          tingkat kehadiran
        </p>

        {/* Progress bar */}
        <div
          style={{
            height: 6,
            borderRadius: 4,
            background: "rgba(255,255,255,0.25)",
            marginBottom: 12,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${p}%`,
              background: "rgba(255,255,255,0.85)",
              borderRadius: 4,
              transition: "width 0.7s ease",
            }}
          />
        </div>
      </div>

      {/* Bottom section — soft bg */}
      <div
        style={{
          background: "rgba(0,0,0,0.15)",
          padding: "10px 18px",
          display: "flex",
          gap: 12,
        }}
      >
        {[
          { v: item.hadir, l: "Hadir" },
          { v: izinKelas, l: "Izin" },
          { v: item.tidakHadir || 0, l: "Alfa" },
        ].map((c) => (
          <div key={c.l} style={{ textAlign: "center" }}>
            <p style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>{c.v}</p>
            <p style={{ fontSize: 10, opacity: 0.75, margin: 0 }}>{c.l}</p>
          </div>
        ))}
        <div style={{ marginLeft: "auto", textAlign: "right" }}>
          <p style={{ fontSize: 12, opacity: 0.75, margin: 0 }}>Total siswa</p>
          <p style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>
            {item.total}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Component ─── */
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
    (async () => {
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
    })();
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

  const pctColor = pct >= 80 ? "#10b981" : pct >= 60 ? "#f59e0b" : "#f43f5e";

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
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
                    background: "#eef2ff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Activity size={14} color="#6366f1" />
                </div>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: "#6366f1",
                    letterSpacing: "0.07em",
                    textTransform: "uppercase",
                  }}
                >
                  Dashboard Admin
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
                Pantau Kehadiran
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
            {/* quick stats pill row */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {[
                {
                  v: loading ? "—" : `${pct}%`,
                  l: "hadir",
                  bg: "#f0fdf4",
                  tc: "#15803d",
                  bc: "#bbf7d0",
                },
                {
                  v: loading ? "—" : stats.totalSiswa,
                  l: "total siswa",
                  bg: "var(--color-background-secondary)",
                  tc: "var(--color-text-secondary)",
                  bc: "var(--color-border-tertiary)",
                },
                {
                  v: loading ? "—" : stats.tidakHadir + izin,
                  l: "tidak hadir",
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

          {/* ── Middle Row: Donut Besar | Per Kelas ── */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "5fr 7fr",
              gap: 14,
              marginBottom: 14,
            }}
          >
            {/* LEFT — Donut Besar + Keterangan Lengkap */}
            <div
              style={{
                background: "var(--color-background-primary)",
                border: "0.5px solid var(--color-border-tertiary)",
                borderRadius: 18,
                padding: "24px",
                display: "flex",
                flexDirection: "column",
                gap: 0,
              }}
            >
              {/* Header */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  marginBottom: 20,
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
                  Distribusi Kehadiran Hari Ini
                </span>
              </div>

              {loading ? (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 16,
                  }}
                >
                  <Sk w={180} h={180} r={90} />
                  <Sk h={14} />
                  <Sk h={14} />
                  <Sk h={14} />
                </div>
              ) : (
                <>
                  {/* Donut besar + center text */}
                  <div
                    style={{
                      position: "relative",
                      width: "100%",
                      height: 200,
                      marginBottom: 20,
                    }}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={donutData}
                          cx="50%"
                          cy="50%"
                          innerRadius={64}
                          outerRadius={92}
                          paddingAngle={4}
                          dataKey="value"
                          startAngle={90}
                          endAngle={-270}
                          animationBegin={0}
                          animationDuration={800}
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
                          fontSize: 30,
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
                        kehadiran
                      </span>
                    </div>
                  </div>

                  {/* Legend — 3 baris detail */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 10,
                      marginBottom: 20,
                    }}
                  >
                    {[
                      {
                        label: "Hadir",
                        val: stats.hadirHariIni,
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
                        val: stats.tidakHadir,
                        color: "#f43f5e",
                        bg: "#fef2f2",
                        tc: "#be123c",
                        icon: <XCircle size={14} />,
                      },
                    ].map((b) => {
                      const pctItem =
                        stats.totalSiswa > 0
                          ? Math.round((b.val / stats.totalSiswa) * 100)
                          : 0;
                      return (
                        <div
                          key={b.label}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            padding: "10px 14px",
                            background: b.bg,
                            borderRadius: 12,
                            border: `1px solid ${b.color}22`,
                          }}
                        >
                          <div style={{ color: b.tc }}>{b.icon}</div>
                          <span
                            style={{
                              fontSize: 13,
                              color: b.tc,
                              fontWeight: 600,
                              flex: 1,
                            }}
                          >
                            {b.label}
                          </span>
                          <span
                            style={{
                              fontSize: 18,
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
                            {pctItem}%
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Divider */}
                  <div
                    style={{
                      height: "0.5px",
                      background: "var(--color-border-tertiary)",
                      marginBottom: 16,
                    }}
                  />

                  {/* Summary strip — rata-rata + best/worst */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      marginBottom: 12,
                    }}
                  >
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 12,
                        background: "#eef2ff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <Award size={18} color="#6366f1" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <p
                        style={{
                          fontSize: 11,
                          color: "var(--color-text-secondary)",
                          margin: "0 0 2px",
                        }}
                      >
                        Rata-rata kehadiran hari ini
                      </p>
                      <p
                        style={{
                          fontSize: 24,
                          fontWeight: 700,
                          color: "var(--color-text-primary)",
                          margin: 0,
                          lineHeight: 1,
                        }}
                      >
                        {pct}%
                      </p>
                    </div>
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 12,
                        background: pct >= 80 ? "#f0fdf4" : "#fef2f2",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {pct >= 80 ? (
                        <CheckCircle2 size={20} color="#15803d" />
                      ) : (
                        <AlertTriangle size={20} color="#be123c" />
                      )}
                    </div>
                  </div>

                  {bestClass && (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 6,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          padding: "8px 12px",
                          background: "#f0fdf4",
                          borderRadius: 10,
                        }}
                      >
                        <div
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: "50%",
                            background: "#10b981",
                            flexShrink: 0,
                          }}
                        />
                        <span style={{ fontSize: 11, color: "#15803d" }}>
                          Terbaik: <strong>{bestClass.kelas}</strong> —{" "}
                          {bestClass.persentase}%
                        </span>
                      </div>
                      {worstClass && worstClass.kelas !== bestClass.kelas && (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            padding: "8px 12px",
                            background: "#fef2f2",
                            borderRadius: 10,
                          }}
                        >
                          <div
                            style={{
                              width: 6,
                              height: 6,
                              borderRadius: "50%",
                              background: "#f43f5e",
                              flexShrink: 0,
                            }}
                          />
                          <span style={{ fontSize: 11, color: "#be123c" }}>
                            Perhatian: <strong>{worstClass.kelas}</strong> —{" "}
                            {worstClass.persentase}%
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* RIGHT — Per Kelas (card berwarna) */}
            <div
              style={{
                background: "var(--color-background-primary)",
                border: "0.5px solid var(--color-border-tertiary)",
                borderRadius: 18,
                padding: "24px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  marginBottom: 18,
                }}
              >
                <Users size={13} color="#6366f1" />
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: "var(--color-text-secondary)",
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                  }}
                >
                  Kehadiran per Kelas
                </span>
              </div>

              {loading ? (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 12,
                  }}
                >
                  {[...Array(4)].map((_, i) => (
                    <Sk key={i} h={140} />
                  ))}
                </div>
              ) : classData.length === 0 ? (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    height: 180,
                    color: "var(--color-text-secondary)",
                    fontSize: 13,
                  }}
                >
                  Tidak ada data.
                </div>
              ) : (
                <>
                  {/* Grid 2-col untuk card berwarna */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        classData.length <= 2 ? "1fr 1fr" : "repeat(3, 1fr)",
                      gap: 12,
                      marginBottom: 16,
                    }}
                  >
                    {classData.slice(0, 6).map((item, i) => (
                      <ClassCard key={i} item={item} index={i} />
                    ))}
                  </div>

                  {/* Summary 4 cols */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(4, 1fr)",
                      gap: 8,
                      padding: "14px",
                      background: "var(--color-background-secondary)",
                      borderRadius: 14,
                    }}
                  >
                    {[
                      {
                        v: stats.totalSiswa,
                        l: "Total",
                        bg: "#eef2ff",
                        tc: "#4338ca",
                        icon: <Users size={14} />,
                      },
                      {
                        v: stats.hadirHariIni,
                        l: "Hadir",
                        bg: "#f0fdf4",
                        tc: "#15803d",
                        icon: <CheckCircle2 size={14} />,
                      },
                      {
                        v: izin,
                        l: "Izin",
                        bg: "#fefce8",
                        tc: "#a16207",
                        icon: <BookOpen size={14} />,
                      },
                      {
                        v: stats.tidakHadir,
                        l: "Alfa",
                        bg: "#fef2f2",
                        tc: "#be123c",
                        icon: <XCircle size={14} />,
                      },
                    ].map((s) => (
                      <div
                        key={s.l}
                        style={{
                          background: s.bg,
                          borderRadius: 12,
                          padding: "12px 8px",
                          textAlign: "center",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <div style={{ color: s.tc }}>{s.icon}</div>
                        <p
                          style={{
                            fontSize: 20,
                            fontWeight: 800,
                            color: s.tc,
                            margin: 0,
                            lineHeight: 1,
                          }}
                        >
                          {s.v}
                        </p>
                        <p
                          style={{
                            fontSize: 10,
                            color: s.tc,
                            opacity: 0.75,
                            margin: 0,
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

          {/* ── Trend Chart ── */}
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
                justifyContent: "space-between",
                marginBottom: 16,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <TrendingUp size={13} color="#6366f1" />
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: "var(--color-text-secondary)",
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                  }}
                >
                  Tren Kehadiran 7 Hari Terakhir
                </span>
              </div>
              <div style={{ display: "flex", gap: 14 }}>
                {[
                  { color: "#6366f1", label: "Hadir" },
                  { color: "#fca5a5", label: "Tidak hadir" },
                ].map((l) => (
                  <span
                    key={l.label}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      fontSize: 12,
                      color: "var(--color-text-secondary)",
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
            <div style={{ height: 140 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={trendData}
                  margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
                  barCategoryGap="30%"
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--color-border-tertiary)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="day"
                    tick={
                      {
                        fontSize: 11,
                        fill: "var(--color-text-secondary)",
                      } as any
                    }
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<TrendTooltip />} />
                  <Bar
                    dataKey="hadir"
                    name="Hadir"
                    fill="#6366f1"
                    radius={[5, 5, 0, 0]}
                    maxBarSize={28}
                  />
                  <Bar
                    dataKey="absen"
                    name="Tidak hadir"
                    fill="#fca5a5"
                    radius={[5, 5, 0, 0]}
                    maxBarSize={28}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
