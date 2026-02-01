import Image from "next/image";
import Link from "next/link";
import { BookOpen, ClipboardList, Trophy, User } from "lucide-react";

export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center bg-linear-to-br from-blue-600 to-indigo-700 overflow-hidden font-sans">
      {/* Decorative shapes */}
      <div className="absolute -top-25 -left-25 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-blob"></div>
      <div className="absolute -bottom-30 -right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-blob animation-delay-2000"></div>

      {/* Card utama */}
      <div className="relative z-10 flex flex-col items-center gap-6 p-8 bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl max-w-md w-full animate-fadeIn">
        {/* Logo */}
        <div className="mb-4 mt-4">
          <Image
            src="/img/PPLG.png"
            alt="Logo"
            width={100}
            height={100}
            priority
          />
        </div>

        {/* Judul */}
        <h1 className="text-4xl md:text-5xl font-extrabold text-white text-center">
          Sistem Presensi <br />{" "}
          <span className="text-yellow-300">Online PKL</span>
        </h1>

        {/* Deskripsi */}
        <p className="mt-3 text-center text-gray-200 max-w-md">
          Sistem presensi Praktik Kerja Lapangan berbasis online untuk memantau
          kehadiran siswa
        </p>

        {/* Info fitur / icon */}
        <div className="mt-6 grid grid-cols-2 gap-4 w-full">
          <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2 hover:bg-white/20 transition">
            <BookOpen className="w-5 h-5 text-blue-400" />
            <span className="text-white text-sm">Presensi Harian</span>
          </div>
          <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2 hover:bg-white/20 transition">
            <ClipboardList className="w-5 h-5 text-green-400" />
            <span className="text-white text-sm">Jurnal Kegiatan</span>
          </div>
          <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2 hover:bg-white/20 transition">
            <Trophy className="w-5 h-5 text-yellow-300" />
            <span className="text-white text-sm">Riwayat Kehadiran</span>
          </div>
          <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2 hover:bg-white/20 transition">
            <User className="w-5 h-5 text-pink-400" />
            <span className="text-white text-sm">Profil & Data PKL</span>
          </div>
        </div>

        {/* Tombol */}
        <div className="mt-6 flex space-x-4 w-full justify-center">
          <Link
            href="/login"
            className="px-6 py-3 rounded-full bg-linear-to-r from-yellow-400 to-yellow-600 text-white font-semibold shadow-lg hover:scale-105 hover:shadow-xl transition transform"
          >
            Login Sekarang
          </Link>
        </div>
      </div>
    </main>
  );
}
