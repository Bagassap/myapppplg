"use client";

import { useEffect, useState } from "react";

interface GreetingData {
  greeting: string;
  emoji: string;
  sub: string;
  from: string;
  to: string;
}

function getGreeting(): GreetingData {
  const hour = new Date().getHours();
  if (hour >= 4 && hour < 11)
    return {
      greeting: "Selamat Pagi",
      emoji: "🌤️",
      sub: "Mulai hari dengan semangat!",
      from: "#fde68a",
      to: "#fbbf24",
    };
  if (hour >= 11 && hour < 15)
    return {
      greeting: "Selamat Siang",
      emoji: "☀️",
      sub: "Tetap produktif hari ini.",
      from: "#fdba74",
      to: "#f97316",
    };
  if (hour >= 15 && hour < 19)
    return {
      greeting: "Selamat Sore",
      emoji: "🌇",
      sub: "Jaga semangat hingga akhir.",
      from: "#f9a8d4",
      to: "#ec4899",
    };
  return {
    greeting: "Selamat Malam",
    emoji: "🌙",
    sub: "Istirahat yang cukup ya.",
    from: "#a5b4fc",
    to: "#818cf8",
  };
}

export default function GreetingBanner() {
  const [data, setData] = useState<GreetingData | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setData(getGreeting());
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  if (!data) return null;

  return (
    <div
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(10px)",
        transition: "opacity 0.6s ease, transform 0.6s ease",
      }}
      className="w-full flex flex-col items-center gap-1 py-3"
    >
      {/* Pill badge */}
      <div
        style={{
          background: `linear-gradient(135deg, ${data.from}22, ${data.to}33)`,
          border: `1px solid ${data.from}66`,
        }}
        className="flex items-center gap-2 px-4 py-1.5 rounded-full backdrop-blur-sm"
      >
        <span
          style={{ filter: "drop-shadow(0 0 6px rgba(255,255,255,0.6))" }}
          className="text-lg"
          role="img"
          aria-label={data.greeting}
        >
          {data.emoji}
        </span>
        <span
          style={{
            background: `linear-gradient(90deg, ${data.from}, ${data.to})`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
          className="text-sm font-bold tracking-widest uppercase"
        >
          {data.greeting}
        </span>
      </div>

      {/* Sub text */}
      <p className="text-white/50 text-xs tracking-wide italic">{data.sub}</p>
    </div>
  );
}
