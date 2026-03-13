"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
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

  // Redirect jika sudah login — tapi HANYA setelah status pasti "authenticated"
  // Tidak redirect saat status masih "loading"
  useEffect(() => {
    if (status === "authenticated" && session?.user?.role && !redirecting) {
      setRedirecting(true);
      redirectByRole(session.user.role);
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

  // Tampilkan spinner hanya saat status masih loading ATAU sedang redirect setelah login
  if (status === "loading" || redirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-600">
        <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Selalu tampilkan form login — jangan return null
  return (
    <main className="relative flex min-h-screen items-center justify-center bg-linear-to-br from-blue-600 to-indigo-600 overflow-hidden font-sans px-4 sm:px-6 md:px-0">
      <div className="absolute -top-25 -left-20 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute -bottom-30 -right-15 w-96 h-96 bg-orange-400/20 rounded-full blur-3xl animate-pulse delay-1000" />

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
            Pengembangan Perangkat Lunak dan GIM
          </p>

          <p className="text-center text-gray-500 text-xs sm:text-sm mb-6 md:mb-8 leading-relaxed px-2">
            Masuk ke akun Anda untuk melakukan presensi
          </p>

          {error && (
            <div className="w-full mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
              <svg
                className="w-4 h-4 text-red-500 mt-0.5 shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form className="space-y-4 w-full" onSubmit={handleSubmit}>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400 w-5 h-5" />
              <input
                type="email"
                placeholder="Masukkan email"
                className="pl-10 pr-4 w-full py-2.5 md:py-2 rounded-lg border border-gray-300 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:outline-none transition text-sm sm:text-base disabled:bg-gray-50"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                required
                disabled={loading}
                autoComplete="email"
                autoFocus
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-yellow-500 w-5 h-5" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Masukkan password"
                className="pl-10 pr-10 w-full py-2.5 md:py-2 rounded-lg border border-gray-300 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-yellow-400 focus:outline-none transition text-sm sm:text-base disabled:bg-gray-50"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                required
                disabled={loading}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 md:py-2 rounded-full bg-linear-to-r from-yellow-400 to-orange-500 text-white font-semibold shadow-lg hover:scale-105 hover:shadow-xl transition transform disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 text-sm sm:text-base flex items-center justify-center gap-2"
            >
              {loading && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
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
