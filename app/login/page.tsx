"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Mail, Lock } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email: email.toLowerCase().trim(),
        password,
      });

      if (res?.ok) {
        console.log("SignIn berhasil, fetching session...");
        const sessionRes = await fetch("/api/auth/session");
        const session = await sessionRes.json();
        console.log("Session data lengkap:", session);

        const role = session?.user?.role;
        console.log("Role dari session:", role);

        if (role === "ADMIN") {
          console.log("Redirect ke admin");
          router.push("/admin/dashboard");
        } else if (role === "GURU") {
          console.log("Redirect ke guru");
          router.push("/guru/dashboard");
        } else if (role === "SISWA") {
          console.log("Redirect ke siswa");
          router.push("/siswa/dashboard");
        } else {
          console.log("Role tidak dikenali, redirect default");
          router.push("/dashboard");
        }
      } else {
        alert(`Login gagal: ${res?.error || "Periksa email dan password"}`);
      }
    } catch (err) {
      console.error("Login error:", err);
      alert("Terjadi kesalahan. Silakan coba lagi.");
    }

    setLoading(false);
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-linear-to-br from-blue-600 to-indigo-600 overflow-hidden font-sans px-4 sm:px-6 md:px-0">
      <div className="absolute -top-25 -left-20 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute -bottom-30 -right-15 w-96 h-96 bg-orange-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>

      <div className="relative z-10 flex flex-col md:flex-row w-full max-w-sm sm:max-w-md md:max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden mx-auto">
        <div className="hidden md:flex w-1/2 items-center justify-center bg-gray-100">
          <Image
            src="/img/PPLG.png"
            alt="Ilustrasi Login"
            width={300}
            height={300}
            className="object-contain"
            priority
          />
        </div>

        <div className="w-full md:w-1/2 p-6 sm:p-8 md:p-12 flex flex-col items-center justify-center">
          <div className="flex justify-center mb-4 md:mb-6">
            <Image
              src="/img/PPLG.png"
              alt="Logo"
              width={120}
              height={120}
              className="w-20 h-auto md:w-28 md:h-auto object-contain"
            />
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-linear-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent text-center mb-2 md:mb-3">
            Sistem Presensi Online
          </h1>

          <p className="text-center text-gray-600 text-sm sm:text-base mb-1 md:mb-2 font-medium">
            PEngembangan Perangkat Lunak dan GIM
          </p>

          <p className="text-center text-gray-500 text-xs sm:text-sm mb-6 md:mb-8 leading-relaxed px-2">
            Masuk ke akun Anda untuk melakukan presensi
          </p>

          <form className="space-y-4 w-full" onSubmit={handleSubmit}>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400 w-5 h-5" />
              <input
                type="email"
                placeholder="Masukkan email"
                className="pl-10 pr-4 w-full py-2.5 md:py-2 rounded-lg border border-gray-300 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:outline-none transition text-sm sm:text-base"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-yellow-500 w-5 h-5" />
              <input
                type="password"
                placeholder="Masukkan password"
                className="pl-10 pr-4 w-full py-2.5 md:py-2 rounded-lg border border-gray-300 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-yellow-400 focus:outline-none transition text-sm sm:text-base"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 md:py-2 rounded-full bg-linear-to-r from-yellow-400 to-orange-500 text-white font-semibold shadow-lg hover:scale-105 hover:shadow-xl transition transform disabled:opacity-50 text-sm sm:text-base"
            >
              {loading ? "Memproses..." : "Login"}
            </button>
          </form>

          <p className="text-center text-gray-500 text-sm mt-4">
            <Link
              href="/forgot-password"
              className="text-blue-500 hover:underline"
            >
              Lupa Password?
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
