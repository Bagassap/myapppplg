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

/* ─── Stat Card ─── */
type StatCardProps = {
  label: string;
  value: number | null;
  icon: React.ReactNode;
  accent: string;
  sub: string;
  loading: boolean;
};

function StatCard({ label, value, icon, accent, sub, loading }: StatCardProps) {
  return (
    <div
      style={{
        background: "var(--color-background-primary)",
        border: "0.5px solid var(--color-border-tertiary)",
        borderRadius: 16,
        padding: "20px 20px 16px",
        position: "relative",
        overflow: "hidden",
        transition: "border-color 0.2s, transform 0.2s",
        cursor: "default",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor =
          "var(--color-border-secondary)";
        (e.currentTarget as HTMLDivElement).style.transform =
          "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor =
          "var(--color-border-tertiary)";
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
      }}
    >
      {/* accent bar */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: accent,
          borderRadius: "16px 16px 0 0",
        }}
      />
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
        <p
          style={{
            fontSize: 11,
            fontWeight: 500,
            color: "var(--color-text-secondary)",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            margin: 0,
          }}
        >
          {label}
        </p>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: accent + "18",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: accent,
          }}
        >
          {icon}
        </div>
      </div>
      {loading ? (
        <Sk h={36} r={8} />
      ) : (
        <p
          style={{
            fontSize: 32,
            fontWeight: 700,
            color: "var(--color-text-primary)",
            margin: "0 0 4px",
            lineHeight: 1,
          }}
        >
          {value}
        </p>
      )}
      <p
        style={{
          fontSize: 12,
          color: "var(--color-text-secondary)",
          margin: 0,
        }}
      >
        {sub}
      </p>
    </div>
  );
}

/* ─── Class Card ─── */
function ClassCard({ item, index }: { item: any; index: number }) {
  const izinKelas = Math.max(
    0,
    (item.total || 0) - (item.hadir || 0) - (item.tidakHadir || 0),
  );
  const p = item.persentase || 0;
  const barColor = p >= 80 ? "#10b981" : p >= 60 ? "#f59e0b" : "#f43f5e";
  const initials = item.kelas
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const avatarColors = [
    { bg: "#eef2ff", text: "#4338ca" },
    { bg: "#f0fdf4", text: "#15803d" },
    { bg: "#fff7ed", text: "#c2410c" },
    { bg: "#fdf4ff", text: "#7e22ce" },
  ];
  const av = avatarColors[index % avatarColors.length];

  return (
    <div
      style={{
        background: "var(--color-background-primary)",
        border: "0.5px solid var(--color-border-tertiary)",
        borderRadius: 14,
        padding: "14px 16px",
        transition: "border-color 0.2s, transform 0.2s",
        cursor: "default",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor =
          "var(--color-border-secondary)";
        (e.currentTarget as HTMLDivElement).style.transform =
          "translateY(-1px)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor =
          "var(--color-border-tertiary)";
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 8,
              background: av.bg,
              color: av.text,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            {initials}
          </div>
          <div>
            <p
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "var(--color-text-primary)",
                margin: 0,
              }}
            >
              {item.kelas}
            </p>
            <p
              style={{
                fontSize: 11,
                color: "var(--color-text-secondary)",
                margin: 0,
              }}
            >
              {item.hadir}/{item.total} siswa
            </p>
          </div>
        </div>
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            padding: "3px 8px",
            borderRadius: 20,
            background: p >= 80 ? "#f0fdf4" : p >= 60 ? "#fefce8" : "#fef2f2",
            color: p >= 80 ? "#15803d" : p >= 60 ? "#a16207" : "#be123c",
          }}
        >
          {p}%
        </span>
      </div>
      {/* progress bar */}
      <div
        style={{
          height: 4,
          borderRadius: 4,
          background: "var(--color-background-tertiary)",
          marginBottom: 10,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${p}%`,
            background: barColor,
            borderRadius: 4,
            transition: "width 0.7s ease",
          }}
        />
      </div>
      {/* badges */}
      <div style={{ display: "flex", gap: 6 }}>
        {[
          { v: item.hadir, l: "hadir", bg: "#f0fdf4", tc: "#15803d" },
          { v: izinKelas, l: "izin", bg: "#fefce8", tc: "#a16207" },
          { v: item.tidakHadir || 0, l: "alfa", bg: "#fef2f2", tc: "#be123c" },
        ].map((c) => (
          <span
            key={c.l}
            style={{
              fontSize: 10,
              fontWeight: 500,
              padding: "2px 7px",
              borderRadius: 6,
              background: c.bg,
              color: c.tc,
            }}
          >
            {c.v} {c.l}
          </span>
        ))}
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

  const statCards = [
    {
      label: "Total Siswa",
      value: stats.totalSiswa,
      icon: <Users size={15} />,
      accent: "#6366f1",
      sub: "Terdaftar aktif",
    },
    {
      label: "Hadir Hari Ini",
      value: stats.hadirHariIni,
      icon: <CheckCircle2 size={15} />,
      accent: "#10b981",
      sub: `${pct}% dari total`,
    },
    {
      label: "Izin / Sakit",
      value: izin,
      icon: <BookOpen size={15} />,
      accent: "#f59e0b",
      sub: "Ada keterangan",
    },
    {
      label: "Alfa",
      value: stats.tidakHadir,
      icon: <XCircle size={15} />,
      accent: "#f43f5e",
      sub: "Tanpa keterangan",
    },
  ];

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

          {/* ── Stat Cards ── */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 12,
              marginBottom: 20,
            }}
          >
            {statCards.map((c, i) => (
              <StatCard
                key={i}
                loading={loading}
                {...c}
                value={loading ? null : c.value}
              />
            ))}
          </div>

          {/* ── Middle Row: Donut+Summary | Per Kelas ── */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 3fr",
              gap: 12,
              marginBottom: 12,
            }}
          >
            {/* Left: Donut + Summary combined */}
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
                  Distribusi &amp; Ringkasan
                </span>
              </div>

              {/* Donut row */}
              {loading ? (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    marginBottom: 20,
                  }}
                >
                  <Sk w={96} h={96} r={48} />
                  <div
                    style={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      gap: 8,
                    }}
                  >
                    <Sk h={14} />
                    <Sk h={14} />
                    <Sk h={14} />
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    marginBottom: 20,
                  }}
                >
                  <div
                    style={{
                      position: "relative",
                      width: 96,
                      height: 96,
                      flexShrink: 0,
                    }}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={donutData}
                          cx="50%"
                          cy="50%"
                          innerRadius={30}
                          outerRadius={46}
                          paddingAngle={3}
                          dataKey="value"
                          startAngle={90}
                          endAngle={-270}
                          animationBegin={0}
                          animationDuration={700}
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
                        val: stats.hadirHariIni,
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
                        val: stats.tidakHadir,
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

              {/* Divider */}
              <div
                style={{
                  height: "0.5px",
                  background: "var(--color-border-tertiary)",
                  marginBottom: 16,
                }}
              />

              {/* Summary strip */}
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: "#eef2ff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Award size={16} color="#6366f1" />
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
                      fontSize: 22,
                      fontWeight: 700,
                      color: "var(--color-text-primary)",
                      margin: 0,
                      lineHeight: 1,
                    }}
                  >
                    {pct}%
                  </p>
                </div>
              </div>
              {bestClass && (
                <div
                  style={{
                    marginTop: 12,
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
            </div>

            {/* Right: Per Kelas */}
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
                  marginBottom: 16,
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
                    gridTemplateColumns: "1fr 1fr 1fr",
                    gap: 10,
                  }}
                >
                  {[...Array(3)].map((_, i) => (
                    <Sk key={i} h={90} />
                  ))}
                </div>
              ) : classData.length === 0 ? (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    height: 120,
                    color: "var(--color-text-secondary)",
                    fontSize: 13,
                  }}
                >
                  Tidak ada data.
                </div>
              ) : (
                <>
                  {/* top 3 class boxes horizontal */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(3, 1fr)",
                      gap: 10,
                      marginBottom: 14,
                    }}
                  >
                    {classData.slice(0, 3).map((item, i) => (
                      <ClassCard key={i} item={item} index={i} />
                    ))}
                  </div>
                  {/* remaining classes if any */}
                  {classData.length > 3 && (
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(3, 1fr)",
                        gap: 10,
                        marginBottom: 14,
                      }}
                    >
                      {classData.slice(3).map((item, i) => (
                        <ClassCard key={i + 3} item={item} index={i + 3} />
                      ))}
                    </div>
                  )}
                  {/* Summary row — 4 cols */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(4, 1fr)",
                      gap: 8,
                    }}
                  >
                    {[
                      {
                        v: stats.totalSiswa,
                        l: "Total",
                        bg: "var(--color-background-secondary)",
                        tc: "var(--color-text-secondary)",
                      },
                      {
                        v: stats.hadirHariIni,
                        l: "Hadir",
                        bg: "#f0fdf4",
                        tc: "#15803d",
                      },
                      { v: izin, l: "Izin", bg: "#fefce8", tc: "#a16207" },
                      {
                        v: stats.tidakHadir,
                        l: "Alfa",
                        bg: "#fef2f2",
                        tc: "#be123c",
                      },
                    ].map((s) => (
                      <div
                        key={s.l}
                        style={{
                          background: s.bg,
                          borderRadius: 10,
                          padding: "10px 8px",
                          textAlign: "center",
                        }}
                      >
                        <p
                          style={{
                            fontSize: 16,
                            fontWeight: 700,
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
                            opacity: 0.7,
                            margin: "4px 0 0",
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
