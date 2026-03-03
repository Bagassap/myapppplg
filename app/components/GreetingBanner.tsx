"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

interface GreetingData {
  greeting: string;
  emoji: string;
  color: string;
}

function getGreeting(): GreetingData {
  const hour = new Date().getHours();
  if (hour >= 4 && hour < 11)
    return { greeting: "Selamat Pagi", emoji: "🌤️", color: "#fbbf24" };
  if (hour >= 11 && hour < 15)
    return { greeting: "Selamat Siang", emoji: "☀️", color: "#f97316" };
  if (hour >= 15 && hour < 19)
    return { greeting: "Selamat Sore", emoji: "🌇", color: "#ec4899" };
  return { greeting: "Selamat Malam", emoji: "🌙", color: "#818cf8" };
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
      <div className="flex items-center gap-3 flex-wrap">
        {/* Emoji dengan glow */}
        <span
          style={{
            fontSize: "2rem",
            filter: `drop-shadow(0 0 8px ${data.color}66)`,
            lineHeight: 1,
          }}
          role="img"
          aria-label={data.greeting}
        >
          {data.emoji}
        </span>

        <div>
          {/* Greeting utama */}
          <p
            style={{
              background: `linear-gradient(90deg, ${data.color}, ${data.color}aa)`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
            className="text-sm font-semibold tracking-widest uppercase leading-none mb-1"
          >
            {data.greeting}
            {firstName ? `, ${firstName}` : ""}
          </p>

          {/* Sub text — judul dashboard */}
        </div>
      </div>

      {/* Divider tipis dengan warna sesuai waktu */}
      <div
        style={{
          background: `linear-gradient(90deg, ${data.color}44, transparent)`,
          height: "2px",
          borderRadius: "999px",
          marginTop: "12px",
          width: "200px",
        }}
      />
    </div>
  );
}
