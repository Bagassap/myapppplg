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
        console.log("Session data lengkap:", session); // Tambahkan log

        const role = session?.user?.role;
        console.log("Role dari session:", role); // Tambahkan log

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
    <main className="relative flex min-h-screen items-center justify-center bg-linear-to-br from-blue-600 to-indigo-600 overflow-hidden font-sans">
      {/* Efek dekorasi */}
      <div className="absolute -top-25 -left-20 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute -bottom-30 -right-15 w-96 h-96 bg-orange-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>

      {/* Card utama */}
      <div className="relative z-10 flex flex-col md:flex-row w-full max-w-lg md:max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden mx-4 md:mx-auto">
        {/* Gambar kiri */}
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

        {/* Form kanan */}
        <div className="w-full md:w-1/2 px-6 py-10 md:p-12 flex flex-col items-center">
          {/* Logo */}
          <div className="flex justify-center mb-6 p-6 ">
            <Image src="/img/PPLG.png" alt="Logo" width={100} height={100} />
          </div>

          {/* Judul */}
          <h1 className="text-3xl md:text-4xl font-bold bg-linear-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent text-center mb-3">
            Sistem Presensi Online
          </h1>
          <p className="text-center text-gray-600 text-base mb-2 font-medium">
            PEngembangan Perangkat Lunak dan GIM
          </p>
          <p className="text-center text-gray-500 text-sm mb-8 leading-relaxed">
            Masuk ke akun Anda untuk melakukan presensi
          </p>

          {/* Form login */}
          <form className="space-y-4 w-full" onSubmit={handleSubmit}>
            {/* Input Email */}
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-blue-400 w-5 h-5" />
              <input
                type="email"
                placeholder="Masukkan email"
                className="pl-10 pr-4 w-full py-2 rounded-lg border border-gray-300 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:outline-none transition"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            {/* Input Password */}
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-yellow-500 w-5 h-5" />
              <input
                type="password"
                placeholder="Masukkan password"
                className="pl-10 pr-4 w-full py-2 rounded-lg border border-gray-300 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-yellow-400 focus:outline-none transition"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            {/* Tombol Login */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 rounded-full bg-linear-to-r from-yellow-400 to-orange-500 text-white font-semibold shadow-lg hover:scale-105 hover:shadow-xl transition transform disabled:opacity-50"
            >
              {loading ? "Memproses..." : "Login"}
            </button>
          </form>

          {/* Link Forgot Password */}
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
