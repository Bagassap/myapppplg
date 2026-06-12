"use client";
import Link from "next/link";

const styles = `
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50%       { transform: scale(1.06); }
  }
  @keyframes expandWidth {
    from { width: 0; }
    to   { width: 60px; }
  }
  @keyframes glow {
    0%, 100% { box-shadow: 0 8px 32px rgba(172,236,0,0.3); }
    50%       { box-shadow: 0 12px 48px rgba(172,236,0,0.6); }
  }
  @keyframes float0 { 0%,100%{transform:translateY(0)}  50%{transform:translateY(-10px)} }
  @keyframes float1 { 0%,100%{transform:translateY(0)}  50%{transform:translateY(-14px)} }
  @keyframes float2 { 0%,100%{transform:translateY(0)}  50%{transform:translateY(-8px)}  }
  @keyframes float3 { 0%,100%{transform:translateY(0)}  50%{transform:translateY(-12px)} }
  @keyframes float4 { 0%,100%{transform:translateY(0)}  50%{transform:translateY(-16px)} }
  @keyframes float5 { 0%,100%{transform:translateY(0)}  50%{transform:translateY(-9px)}  }
  @keyframes bgShift {
    0%   { background-position: 0% 50%; }
    50%  { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  .cta-btn:hover {
    transform: scale(1.05) !important;
  }
`;

const PARTICLES = [
  { w: 4,  h: 4,  bg: "#ACEC00", top: "15%", left: "10%", anim: "float0", dur: "3s", blur: 8  },
  { w: 6,  h: 6,  bg: "#013FF6", top: "28%", left: "25%", anim: "float1", dur: "4s", blur: 10 },
  { w: 4,  h: 4,  bg: "#ACEC00", top: "41%", left: "40%", anim: "float2", dur: "5s", blur: 8  },
  { w: 6,  h: 6,  bg: "#013FF6", top: "54%", left: "55%", anim: "float3", dur: "6s", blur: 10 },
  { w: 4,  h: 4,  bg: "#ACEC00", top: "67%", left: "70%", anim: "float4", dur: "7s", blur: 8  },
  { w: 6,  h: 6,  bg: "#013FF6", top: "80%", left: "85%", anim: "float5", dur: "4s", blur: 12 },
];

const STATS = [
  { value: "104+", label: "Siswa PKL" },
  { value: "9",    label: "Guru Pembimbing" },
  { value: "3",    label: "Kelas Aktif" },
];

export default function Home() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />

      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(-45deg, #00182E, #001a35, #012444, #00182E)",
          backgroundSize: "400% 400%",
          animation: "bgShift 8s ease infinite",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "var(--font-satoshi, 'Inter', 'Segoe UI', sans-serif)",
          position: "relative",
          overflow: "hidden",
          padding: "60px 24px",
        }}
      >

        {PARTICLES.map((p, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              width: p.w,
              height: p.h,
              background: p.bg,
              borderRadius: "50%",
              top: p.top,
              left: p.left,
              opacity: 0.4,
              animation: `${p.anim} ${p.dur} ease-in-out infinite`,
              boxShadow: `0 0 ${p.blur}px ${p.bg}`,
              pointerEvents: "none",
            }}
          />
        ))}

        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "6px 18px",
            borderRadius: 100,
            border: "1.5px solid #013FF6",
            marginBottom: 32,
            animation: "fadeInUp 0.5s ease 0.1s both",
          }}
        >
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#ACEC00", display: "inline-block", flexShrink: 0 }} />
          <span style={{ color: "#94a3b8", fontSize: 11, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase" }}>
            PPLG NUSA
          </span>
        </div>

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
            animation: "pulse 3s ease-in-out infinite",
          }}
        >
          🎓
        </div>

        <h1
          style={{
            color: "#fff",
            fontWeight: 900,
            fontSize: "clamp(28px,5vw,44px)",
            textAlign: "center",
            lineHeight: 1.15,
            margin: "0 0 12px",
            letterSpacing: "-0.5px",
            animation: "fadeInUp 0.5s ease 0.3s both",
          }}
        >
          Sistem Presensi{" "}
          <span style={{ color: "#ACEC00" }}>Online PKL</span>
        </h1>

        <p
          style={{
            color: "#94a3b8",
            fontSize: 16,
            textAlign: "center",
            margin: "0 0 28px",
            maxWidth: 380,
            lineHeight: 1.7,
            animation: "fadeInUp 0.5s ease 0.5s both",
          }}
        >
          Pengembangan Perangkat Lunak dan GIM
        </p>

        <div
          style={{
            height: 3,
            background: "#ACEC00",
            borderRadius: 99,
            marginBottom: 36,
            animation: "expandWidth 0.6s ease 0.7s both",
          }}
        />

        <Link
          href="/login"
          className="cta-btn"
          style={{
            display: "inline-block",
            padding: "16px 40px",
            background: "#ACEC00",
            color: "#00182E",
            borderRadius: 50,
            fontWeight: 800,
            fontSize: 17,
            textDecoration: "none",
            letterSpacing: "0.5px",
            animation: "glow 2s ease-in-out infinite, fadeInUp 0.5s ease 0.9s both",
            transition: "transform .2s",
          }}
        >
          Masuk Sekarang →
        </Link>

        <div
          style={{
            display: "flex",
            gap: "48px",
            marginTop: 48,
            flexWrap: "wrap",
            justifyContent: "center",
            animation: "fadeInUp 0.5s ease 1.1s both",
          }}
        >
          {STATS.map((s) => (
            <div key={s.label} style={{ textAlign: "center" }}>
              <div style={{ color: "#ACEC00", fontSize: 32, fontWeight: 900, lineHeight: 1 }}>{s.value}</div>
              <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        <p
          style={{
            position: "absolute",
            bottom: 20,
            color: "rgba(255,255,255,0.35)",
            fontSize: 13,
            margin: 0,
            animation: "fadeInUp 0.5s ease 1.3s both",
          }}
        >
          © 2026 Bagas Saputra · Presensi PPLG
        </p>
      </div>
    </>
  );
}
