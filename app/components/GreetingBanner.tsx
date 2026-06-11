"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

interface GreetingData {
  text: string;
  icon: string;
  motivasi: string;
}

function getGreeting(): GreetingData {
  const hour = new Date().getHours();
  if (hour >= 4 && hour < 11)
    return { text: "Selamat Pagi", icon: "🌅", motivasi: "Awali hari dengan semangat dan niat yang baik." };
  if (hour >= 11 && hour < 15)
    return { text: "Selamat Siang", icon: "☀️", motivasi: "Tetap fokus dan produktif, kamu sudah sejauh ini." };
  if (hour >= 15 && hour < 19)
    return { text: "Selamat Sore", icon: "🌇", motivasi: "Pertahankan semangat hingga akhir hari ini." };
  return { text: "Selamat Malam", icon: "🌙", motivasi: "Istirahat yang cukup, besok kita mulai lagi lebih baik." };
}

const ROLE_LABEL: Record<string, string> = { ADMIN: "Admin", GURU: "Guru", SISWA: "Siswa" };

export default function GreetingBanner() {
  const { data: session } = useSession();
  const [greeting, setGreeting] = useState<GreetingData | null>(null);
  const [hariIni, setHariIni] = useState("");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setGreeting(getGreeting());
    setHariIni(
      new Date().toLocaleDateString("id-ID", {
        weekday: "long", day: "numeric", month: "long", year: "numeric",
      })
    );
    const t = setTimeout(() => setVisible(true), 60);
    return () => clearTimeout(t);
  }, []);

  if (!greeting) return null;

  const user = session?.user as any;
  const name = user?.name || user?.email || "";
  const firstName = name.split(" ")[0];
  const role = (user?.role ?? "").toUpperCase();
  const roleLabel = ROLE_LABEL[role] ?? role;

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #00182E 0%, #012444 100%)",
        borderRadius: 16,
        padding: "20px 28px",
        marginBottom: 20,
        borderLeft: "4px solid #ACEC00",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 16,
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(6px)",
        transition: "opacity .5s ease, transform .5s ease",
      }}
    >
      {/* Kiri: icon + teks */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, minWidth: 0 }}>
        <span style={{ fontSize: 30, lineHeight: 1, flexShrink: 0 }}>{greeting.icon}</span>
        <div style={{ minWidth: 0 }}>
          <h2
            style={{
              color: "#ACEC00",
              fontWeight: 700,
              fontSize: 20,
              margin: "0 0 3px",
              letterSpacing: "-0.3px",
              lineHeight: 1.2,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {greeting.text}{firstName ? `, ${firstName}` : ""}!
          </h2>
          <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 12, margin: "0 0 3px", lineHeight: 1.5 }}>
            {greeting.motivasi}
          </p>
          {hariIni && (
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, margin: 0 }}>
              {hariIni}
            </p>
          )}
        </div>
      </div>

      {/* Kanan: role badge */}
      {roleLabel && (
        <div
          style={{
            background: "#013FF6",
            color: "#fff",
            borderRadius: 20,
            padding: "5px 14px",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.5px",
            flexShrink: 0,
            whiteSpace: "nowrap",
          }}
        >
          {roleLabel}
        </div>
      )}
    </div>
  );
}
