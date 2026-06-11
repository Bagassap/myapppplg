"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [redirecting, setRedirecting] = useState(false);

  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "loading") return;

    if (status === "authenticated" && session?.user?.role) {
      const isActive = sessionStorage.getItem("session-active");

      if (!isActive) {
        signOut({ callbackUrl: "/login" });
        return;
      }

      if (!redirecting) {
        setRedirecting(true);
        redirectByRole(session.user.role);
      }
    }
  }, [status, session]);

  function redirectByRole(role: string) {
    const dest =
      role === "ADMIN"
        ? "/admin/dashboard"
        : role === "GURU"
          ? "/guru/dashboard"
          : role === "SISWA"
            ? "/siswa/dashboard"
            : null;

    if (dest) {
      router.replace(dest);
    } else {
      setError("Role tidak dikenali. Hubungi administrator.");
      setLoading(false);
      setRedirecting(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email: email.toLowerCase().trim(),
        password,
      });

      if (!res) {
        setError("Tidak ada respons dari server. Coba lagi.");
        setLoading(false);
        return;
      }

      if (!res.ok || res.error) {
        setError("Email atau password salah.");
        setLoading(false);
        return;
      }

      sessionStorage.setItem("session-active", "1");

      let attempts = 0;
      const tryRedirect = async () => {
        attempts++;
        const r = await fetch("/api/auth/session");
        const sess = await r.json();
        const role = sess?.user?.role;

        if (role) {
          setRedirecting(true);
          redirectByRole(role);
        } else if (attempts < 5) {
          setTimeout(tryRedirect, 300);
        } else {
          setError("Gagal memuat sesi. Coba muat ulang halaman.");
          setLoading(false);
        }
      };

      setTimeout(tryRedirect, 200);
    } catch (err) {
      console.error("Login error:", err);
      setError("Terjadi kesalahan koneksi. Silakan coba lagi.");
      setLoading(false);
    }
  }

  if (status === "loading" || redirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#00182E]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#ACEC00] border-t-transparent rounded-full animate-spin" />
          <span className="text-white/60 text-sm">Memuat...</span>
        </div>
      </div>
    );
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-[#00182E] overflow-hidden font-sans px-4 sm:px-6 md:px-0">

      {/* Dekoratif blob */}
      <div className="absolute -top-24 -left-16 w-96 h-96 bg-[#013FF6]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-28 -right-12 w-80 h-80 bg-[#ACEC00]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-1/3 w-64 h-64 bg-[#013FF6]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row w-full max-w-sm sm:max-w-md md:max-w-5xl rounded-3xl shadow-2xl overflow-hidden mx-auto border border-white/10">

        {/* Panel kiri — hanya desktop */}
        <div className="hidden md:flex w-1/2 flex-col items-center justify-center bg-[#00182E] p-12 gap-8 relative overflow-hidden border-r border-white/10">
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#013FF6]/15 rounded-full blur-2xl" />
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-[#ACEC00]/10 rounded-full blur-2xl" />

          <div className="relative">
            <div className="absolute inset-0 bg-[#ACEC00]/15 rounded-full blur-2xl scale-125" />
            <Image
              src="/img/PPLG.png"
              alt="Logo PPLG"
              width={200}
              height={200}
              className="relative object-contain drop-shadow-2xl"
              priority
            />
          </div>

          <div className="text-center relative z-10">
            <h2 className="text-2xl font-bold text-white mb-2 leading-tight">
              Sistem Presensi Online
            </h2>
            <p className="text-[#ACEC00] text-sm font-semibold tracking-wide">
              PPLG — Pengembangan Perangkat Lunak dan GIM
            </p>
          </div>

          {/* Dot indicators */}
          <div className="flex gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#ACEC00]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#013FF6]" />
            <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
          </div>
        </div>

        {/* Panel kanan — form */}
        <div className="w-full md:w-1/2 bg-white p-6 sm:p-8 md:p-12 flex flex-col items-center justify-center relative">
          {/* Logo mobile only */}
          <div className="flex justify-center mb-5 md:hidden mt-3">
            <Image
              src="/img/PPLG.png"
              alt="Logo"
              width={100}
              height={100}
              className="w-20 h-auto object-contain"
            />
          </div>

          {/* Judul */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-linear-to-r from-[#00182E] via-[#013FF6] to-[#00182E] bg-clip-text text-transparent text-center mb-1">
            Selamat Datang
          </h1>
          <p className="text-center text-[#013FF6] text-sm font-semibold mb-1">
            Pengembangan Perangkat Lunak dan GIM
          </p>
          <p className="text-center text-xs mb-6" style={{ color: "var(--text-secondary)" }}>
            Masuk ke akun Anda untuk melakukan presensi
          </p>

          {/* Error */}
          {error && (
            <div className="w-full mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
              <svg className="w-4 h-4 text-red-500 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form className="space-y-4 w-full" onSubmit={handleSubmit}>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: "var(--text-primary)" }}>
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--text-secondary)", opacity: 0.5 }} />
                <input
                  type="email"
                  placeholder="nama@sekolah.sch.id"
                  className="pl-10 pr-4 w-full py-3 rounded-xl border-2 border-gray-200 text-gray-800 placeholder-gray-300 focus:border-[#ACEC00] focus:outline-none transition-colors text-sm disabled:bg-gray-50"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(""); }}
                  required
                  disabled={loading}
                  autoComplete="email"
                  autoFocus
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: "var(--text-primary)" }}>
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#013FF6]/40 w-4 h-4" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pl-10 pr-10 w-full py-3 rounded-xl border-2 border-gray-200 text-gray-800 placeholder-gray-300 focus:border-[#013FF6] focus:outline-none transition-colors text-sm disabled:bg-gray-50"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  required
                  disabled={loading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#00182E] transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 mt-2 rounded-full bg-[#ACEC00] hover:bg-[#9dd500] text-[#00182E] font-bold shadow-lg shadow-[#ACEC00]/25 hover:shadow-xl hover:scale-[1.02] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 text-sm sm:text-base flex items-center justify-center gap-2"
            >
              {loading && (
                <div className="w-4 h-4 border-2 border-[#00182E] border-t-transparent rounded-full animate-spin" />
              )}
              {loading ? "Memproses..." : "Masuk"}
            </button>
          </form>

          <p className="text-center text-sm mt-4">
            <Link
              href="/forgot-password"
              className="text-[#013FF6] hover:text-[#00182E] font-semibold transition-colors"
            >
              Lupa Password?
            </Link>
          </p>

          <p className="text-center text-xs mt-6" style={{ color: "var(--text-secondary)" }}>
            © 2026 PPLG Nusa — Sistem Presensi PKL
          </p>
        </div>
      </div>
    </main>
  );
}
