"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

interface GreetingData {
  greeting: string;
  emoji: string;
  color: string;
  motivasi: string;
}

function getGreeting(): GreetingData {
  const hour = new Date().getHours();
  if (hour >= 4 && hour < 11)
    return {
      greeting: "Selamat Pagi",
      emoji: "🌤️",
      color: "#92400e",
      motivasi: "Awali hari dengan semangat dan niat yang baik.",
    };
  if (hour >= 11 && hour < 15)
    return {
      greeting: "Selamat Siang",
      emoji: "☀️",
      color: "#9a3412",
      motivasi: "Tetap fokus dan produktif, kamu sudah sejauh ini.",
    };
  if (hour >= 15 && hour < 19)
    return {
      greeting: "Selamat Sore",
      emoji: "🌇",
      color: "#9d174d",
      motivasi: "Pertahankan semangat hingga akhir hari ini.",
    };
  return {
    greeting: "Selamat Malam",
    emoji: "🌙",
    color: "#3730a3",
    motivasi: "Istirahat yang cukup, besok kita mulai lagi lebih baik.",
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
        transform: visible ? "translateY(0)" : "translateY(6px)",
        transition: "opacity 0.5s ease, transform 0.5s ease",
      }}
      className="mb-6 sm:mb-8"
    >
      {/* Greeting */}
      <div className="flex items-center gap-2 mb-1">
        <span
          style={{ fontSize: "1.75rem", lineHeight: 1 }}
          role="img"
          aria-label={data.greeting}
        >
          {data.emoji}
        </span>
        <h2
          style={{ color: data.color }}
          className="text-2xl sm:text-3xl font-bold tracking-tight"
        >
          {data.greeting}
          {firstName && (
            <span className="text-gray-700 font-semibold">, {firstName}</span>
          )}
        </h2>
      </div>

      {/* Motivasi */}
      <p className="text-sm sm:text-base text-gray-500 ml-1 mb-3 font-normal">
        {data.motivasi}
      </p>

      {/* Divider */}
      <div
        style={{
          background: `linear-gradient(90deg, ${data.color}55, transparent)`,
          height: "2px",
          borderRadius: "999px",
          width: "220px",
        }}
      />
    </div>
  );
}
