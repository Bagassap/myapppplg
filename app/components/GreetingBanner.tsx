"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

interface GreetingData {
  greeting: string;
  emoji: string;
  color: string;
  colorDark: string;
  motivasi: string;
}

function getGreeting(): GreetingData {
  const hour = new Date().getHours();
  if (hour >= 4 && hour < 11)
    return {
      greeting: "Selamat Pagi",
      emoji: "🌤️",
      color: "#d97706",
      colorDark: "#fbbf24",
      motivasi: "Awali hari dengan niat yang baik dan semangat penuh! 💪",
    };
  if (hour >= 11 && hour < 15)
    return {
      greeting: "Selamat Siang",
      emoji: "☀️",
      color: "#ea580c",
      colorDark: "#f97316",
      motivasi: "Tetap fokus dan produktif, kamu sudah sejauh ini! 🔥",
    };
  if (hour >= 15 && hour < 19)
    return {
      greeting: "Selamat Sore",
      emoji: "🌇",
      color: "#db2777",
      colorDark: "#ec4899",
      motivasi: "Pertahankan semangat hingga akhir, hampir selesai! ✨",
    };
  return {
    greeting: "Selamat Malam",
    emoji: "🌙",
    color: "#4f46e5",
    colorDark: "#818cf8",
    motivasi: "Istirahat yang cukup, besok kita mulai lagi lebih baik! 🌟",
  };
}

export default function GreetingBanner() {
  const { data: session } = useSession();
  const [data, setData] = useState<GreetingData | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setData(getGreeting());
    const t = setTimeout(() => setVisible(true), 60);
    return () => clearTimeout(t);
  }, []);

  if (!data) return null;

  const name = (session?.user as any)?.name || session?.user?.email || "";
  const firstName = name.split(" ")[0];

  return (
    <div
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(8px)",
        transition: "opacity 0.5s ease, transform 0.5s ease",
      }}
      className="mb-6 sm:mb-8"
    >
      {/* Greeting utama */}
      <div className="flex items-center gap-3 flex-wrap mb-2">
        <span
          style={{
            fontSize: "2.5rem",
            filter: `drop-shadow(0 0 10px ${data.colorDark}88)`,
            lineHeight: 1,
          }}
          role="img"
          aria-label={data.greeting}
        >
          {data.emoji}
        </span>

        <h2
          style={{ color: data.color }}
          className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight tracking-tight"
        >
          {data.greeting}
          {firstName && (
            <span className="text-gray-800" style={{ fontWeight: 800 }}>
              , {firstName}
            </span>
          )}
        </h2>
      </div>

      {/* Kata penyemangat */}
      <p className="text-base sm:text-lg font-medium text-gray-600 ml-1 mb-3">
        {data.motivasi}
      </p>

      {/* Divider */}
      <div
        style={{
          background: `linear-gradient(90deg, ${data.color}66, transparent)`,
          height: "3px",
          borderRadius: "999px",
          width: "260px",
        }}
      />
    </div>
  );
}
