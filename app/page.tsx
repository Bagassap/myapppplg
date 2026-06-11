"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Home() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  const cards = [
    { icon: "👨‍💼", title: "Admin", desc: "Kelola seluruh data absensi PKL siswa dan laporan kehadiran." },
    { icon: "👨‍🏫", title: "Guru", desc: "Pantau absensi siswa bimbingan secara real-time." },
    { icon: "👨‍🎓", title: "Siswa", desc: "Catat kehadiran harian beserta foto, lokasi, dan tanda tangan." },
  ];

  return (
    <>
      <div
        style={{
          minHeight: "100vh",
          background: "#00182E",
          display: "flex",
          flexDirection: "column",
          fontFamily: "'Inter', 'Segoe UI', sans-serif",
        }}
      >
        {/* ── Hero ── */}
        <section
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "80px 24px 60px",
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(24px)",
            transition: "opacity .6s ease, transform .6s ease",
          }}
        >
          {/* Badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 18px",
              borderRadius: 100,
              border: "1.5px solid #013FF6",
              marginBottom: 32,
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: "#ACEC00",
                display: "inline-block",
                flexShrink: 0,
              }}
            />
            <span
              style={{
                color: "#94a3b8",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "1.5px",
                textTransform: "uppercase",
              }}
            >
              PPLG NUSP
            </span>
          </div>

          {/* Icon */}
          <div
            style={{
              width: 96,
              height: 96,
              borderRadius: 24,
              background: "rgba(172,236,0,0.1)",
              border: "2px solid rgba(172,236,0,0.25)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 48,
              marginBottom: 28,
              boxShadow: "0 0 48px rgba(172,236,0,0.12)",
            }}
          >
            🎓
          </div>

          {/* Title */}
          <h1
            style={{
              color: "#fff",
              fontWeight: 900,
              fontSize: "clamp(28px,5vw,42px)",
              textAlign: "center",
              lineHeight: 1.15,
              margin: "0 0 12px",
              letterSpacing: "-0.5px",
            }}
          >
            Sistem Presensi{" "}
            <span style={{ color: "#ACEC00" }}>Online PKL</span>
          </h1>

          {/* Subtitle */}
          <p
            style={{
              color: "#94a3b8",
              fontSize: 16,
              textAlign: "center",
              margin: "0 0 28px",
              maxWidth: 380,
              lineHeight: 1.7,
            }}
          >
            Pengembangan Perangkat Lunak dan GIM
          </p>

          {/* Divider */}
          <div
            style={{
              width: 60,
              height: 3,
              background: "#ACEC00",
              borderRadius: 99,
              marginBottom: 36,
            }}
          />

          {/* CTA */}
          <Link
            href="/login"
            style={{
              display: "inline-block",
              padding: "14px 40px",
              background: "#ACEC00",
              color: "#00182E",
              borderRadius: 12,
              fontWeight: 800,
              fontSize: 15,
              textDecoration: "none",
              letterSpacing: "0.3px",
              boxShadow: "0 8px 32px rgba(172,236,0,0.28)",
              transition: "transform .2s, box-shadow .2s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.transform = "scale(1.05)";
              (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 14px 44px rgba(172,236,0,0.45)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.transform = "scale(1)";
              (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 8px 32px rgba(172,236,0,0.28)";
            }}
          >
            Masuk Sekarang →
          </Link>
        </section>

        {/* ── Feature Cards ── */}
        <section
          style={{
            background: "#001a35",
            padding: "40px 24px 48px",
            opacity: visible ? 1 : 0,
            transition: "opacity .6s ease .2s",
          }}
        >
          <div
            style={{
              maxWidth: 900,
              margin: "0 auto",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: 20,
            }}
          >
            {cards.map((card) => (
              <div
                key={card.title}
                style={{
                  background: "#012444",
                  borderRadius: 16,
                  padding: 24,
                  borderTop: "3px solid #013FF6",
                  transition: "transform .2s, box-shadow .2s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)";
                  (e.currentTarget as HTMLDivElement).style.boxShadow = "0 12px 32px rgba(1,63,246,0.2)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
                  (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
                }}
              >
                <span style={{ fontSize: 36, display: "block", marginBottom: 12, lineHeight: 1 }}>
                  {card.icon}
                </span>
                <h3
                  style={{
                    color: "#fff",
                    fontWeight: 800,
                    fontSize: 17,
                    margin: "0 0 8px",
                  }}
                >
                  {card.title}
                </h3>
                <p
                  style={{
                    color: "#94a3b8",
                    fontSize: 13,
                    margin: 0,
                    lineHeight: 1.65,
                  }}
                >
                  {card.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Footer ── */}
        <footer
          style={{
            background: "#00182E",
            borderTop: "1px solid #013FF6",
            padding: "20px 24px",
            textAlign: "center",
          }}
        >
          <p style={{ color: "#94a3b8", fontSize: 12, margin: 0 }}>
            © 2026 PPLG NUSP · Sistem Presensi PKL
          </p>
        </footer>
      </div>
    </>
  );
}
