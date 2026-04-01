"use client";
import Sidebar from "@/components/layout/SidebarGuru";
import TopBar from "@/components/layout/TopBar";
import GreetingBanner from "@/components/GreetingBanner";
import { useState, useEffect, useMemo } from "react";
import { Users, TrendingUp, Award, GraduationCap } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

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

const AVATAR_COLORS = [
  { bg: "#eef2ff", text: "#4338ca" },
  { bg: "#f0fdf4", text: "#15803d" },
  { bg: "#fff7ed", text: "#c2410c" },
  { bg: "#fdf4ff", text: "#7e22ce" },
  { bg: "#eff6ff", text: "#1d4ed8" },
  { bg: "#fefce8", text: "#a16207" },
];

function SiswaCard({ item, index }: { item: any; index: number }) {
  const total = item.totalHari ?? item.total ?? 0;
  const hadir = item.hadir ?? 0;
  const p = total > 0 ? Math.round((hadir / total) * 100) : 0;
  const izinS = Math.max(0, total - hadir - (item.tidakHadir || 0));
  const alfaS = item.tidakHadir || 0;
  const av = AVATAR_COLORS[index % AVATAR_COLORS.length];
  const barColor = p >= 80 ? "#10b981" : p >= 60 ? "#f59e0b" : "#f43f5e";
  const initial = (item.siswa || item.tempatPKL || "?").charAt(0).toUpperCase();

  return (
    <div
      style={{
        background: "var(--color-background-primary)",
        border: "0.5px solid var(--color-border-tertiary)",
        borderRadius: 14,
        padding: "12px 14px",
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
          marginBottom: 8,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: av.bg,
              color: av.text,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12,
              fontWeight: 600,
              flexShrink: 0,
            }}
          >
            {initial}
          </div>
          <div style={{ minWidth: 0 }}>
            <p
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "var(--color-text-primary)",
                margin: 0,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                maxWidth: 130,
              }}
            >
              {item.siswa || item.tempatPKL}
            </p>
            {item.siswa && item.tempatPKL && (
              <p
                style={{
                  fontSize: 10,
                  color: "var(--color-text-secondary)",
                  margin: 0,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  maxWidth: 130,
                }}
              >
                {item.tempatPKL}
              </p>
            )}
          </div>
        </div>
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            padding: "2px 8px",
            borderRadius: 20,
            background: p >= 80 ? "#f0fdf4" : p >= 60 ? "#fefce8" : "#fef2f2",
            color: p >= 80 ? "#15803d" : p >= 60 ? "#a16207" : "#be123c",
            flexShrink: 0,
          }}
        >
          {p}%
        </span>
      </div>
      <div
        style={{
          height: 3,
          borderRadius: 3,
          background: "var(--color-background-tertiary)",
          marginBottom: 8,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${p}%`,
            background: barColor,
            borderRadius: 3,
            transition: "width 0.7s ease",
          }}
        />
      </div>
      <div style={{ display: "flex", gap: 5 }}>
        {[
          { v: hadir, l: "hadir", bg: "#f0fdf4", tc: "#15803d" },
          { v: izinS, l: "izin", bg: "#fefce8", tc: "#a16207" },
          { v: alfaS, l: "alfa", bg: "#fef2f2", tc: "#be123c" },
        ].map((c) => (
          <span
            key={c.l}
            style={{
              fontSize: 10,
              fontWeight: 500,
              padding: "2px 6px",
              borderRadius: 5,
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

export default function GuruDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSiswaPKL: 0,
    hadirHariIni: 0,
    tidakHadir: 0,
    persentaseKehadiran: 0,
  });
  const [pklData, setPklData] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/dashboard?t=${Date.now()}`);
        if (res.ok) {
          const data = await res.json();
          if (data.cards) setStats(data.cards);
          if (data.table) setPklData(data.table);
        }
      } catch {
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const izin = useMemo(
    () =>
      Math.max(0, stats.totalSiswaPKL - stats.hadirHariIni - stats.tidakHadir),
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

  const bestSiswa =
    pklData.length > 0
      ? pklData.reduce((a: any, b: any) => {
          const pa = a.totalHari > 0 ? a.hadir / a.totalHari : 0;
          const pb = b.totalHari > 0 ? b.hadir / b.totalHari : 0;
          return pa > pb ? a : b;
        })
      : null;

  const worstSiswa =
    pklData.length > 0
      ? pklData.reduce((a: any, b: any) => {
          const pa = a.totalHari > 0 ? a.hadir / a.totalHari : 0;
          const pb = b.totalHari > 0 ? b.hadir / b.totalHari : 0;
          return pa < pb ? a : b;
        })
      : null;

  const hariIni = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

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
                    background: "#f0fdf4",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <GraduationCap size={14} color="#10b981" />
                </div>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: "#10b981",
                    letterSpacing: "0.07em",
                    textTransform: "uppercase",
                  }}
                >
                  Dashboard Guru
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
                Pantau Siswa PKL
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
                  v: loading ? "—" : stats.totalSiswaPKL,
                  l: "siswa PKL",
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

          {/* ── Content Row ── */}
          <div
            style={{ display: "grid", gridTemplateColumns: "2fr 3fr", gap: 12 }}
          >
            {/* Left: Donut + Summary */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
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
                    Distribusi Kehadiran
                  </span>
                </div>
                {loading ? (
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 16 }}
                  >
                    <Sk w={88} h={88} r={44} />
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
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 14 }}
                  >
                    <div
                      style={{
                        position: "relative",
                        width: 88,
                        height: 88,
                        flexShrink: 0,
                      }}
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={donutData}
                            cx="50%"
                            cy="50%"
                            innerRadius={28}
                            outerRadius={42}
                            paddingAngle={3}
                            dataKey="value"
                            startAngle={90}
                            endAngle={-270}
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
                            fontSize: 14,
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
                        gap: 7,
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
                            gap: 7,
                          }}
                        >
                          <span
                            style={{
                              width: 7,
                              height: 7,
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

              {/* Summary card */}
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
                  <Award size={13} color="#6366f1" />
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: "var(--color-text-secondary)",
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                    }}
                  >
                    Ringkasan
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
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
                  <div>
                    <p
                      style={{
                        fontSize: 11,
                        color: "var(--color-text-secondary)",
                        margin: "0 0 2px",
                      }}
                    >
                      Rata-rata kehadiran siswa PKL
                    </p>
                    <p
                      style={{
                        fontSize: 26,
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
                {bestSiswa && (
                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 6 }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "7px 10px",
                        background: "#f0fdf4",
                        borderRadius: 9,
                      }}
                    >
                      <div
                        style={{
                          width: 5,
                          height: 5,
                          borderRadius: "50%",
                          background: "#10b981",
                          flexShrink: 0,
                        }}
                      />
                      <span style={{ fontSize: 11, color: "#15803d" }}>
                        Terbaik:{" "}
                        <strong>
                          {bestSiswa.siswa || bestSiswa.tempatPKL}
                        </strong>
                      </span>
                    </div>
                    {worstSiswa && worstSiswa !== bestSiswa && (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          padding: "7px 10px",
                          background: "#fef2f2",
                          borderRadius: 9,
                        }}
                      >
                        <div
                          style={{
                            width: 5,
                            height: 5,
                            borderRadius: "50%",
                            background: "#f43f5e",
                            flexShrink: 0,
                          }}
                        />
                        <span style={{ fontSize: 11, color: "#be123c" }}>
                          Perhatian:{" "}
                          <strong>
                            {worstSiswa.siswa || worstSiswa.tempatPKL}
                          </strong>
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Right: Siswa PKL list */}
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
                <Users size={13} color="#10b981" />
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: "var(--color-text-secondary)",
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                  }}
                >
                  Kehadiran Siswa PKL
                </span>
              </div>
              {loading ? (
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 10 }}
                >
                  {[...Array(4)].map((_, i) => (
                    <Sk key={i} h={72} />
                  ))}
                </div>
              ) : pklData.length === 0 ? (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    height: 140,
                    color: "var(--color-text-secondary)",
                    fontSize: 13,
                  }}
                >
                  Tidak ada data siswa bimbingan.
                </div>
              ) : (
                <>
                  {/* grid 3 cols for top row */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(3, 1fr)",
                      gap: 10,
                      marginBottom: 10,
                      maxHeight: 380,
                      overflowY: "auto",
                    }}
                  >
                    {pklData.map((item, i) => (
                      <SiswaCard key={i} item={item} index={i} />
                    ))}
                  </div>
                  {/* Summary 4 cols */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(4, 1fr)",
                      gap: 8,
                      marginTop: 4,
                    }}
                  >
                    {[
                      {
                        v: stats.totalSiswaPKL,
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
        </main>
      </div>
    </div>
  );
}
