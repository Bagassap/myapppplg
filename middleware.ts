import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
    const token = await getToken({
        req,
        secret: process.env.NEXTAUTH_SECRET,
        cookieName: "next-auth.session-token",
        secureCookie: process.env.NEXTAUTH_URL?.startsWith("https") ?? false,
    });

    const url = req.nextUrl.clone();
    const { pathname } = url;

    // 1. Cek Token Eksistensi
    if (!token) {
        url.pathname = "/login";
        return NextResponse.redirect(url);
    }

    // Normalisasi Role ke Uppercase untuk keamanan perbandingan
    const userRole = token.role ? (token.role as string).toUpperCase() : "";

    // 2. Proteksi Route Admin
    if (
        (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) &&
        userRole !== "ADMIN"
    ) {
        // Jika Guru/Siswa mencoba akses Admin -> Redirect Login (atau bisa ke dashboard masing-masing)
        url.pathname = "/login";
        return NextResponse.redirect(url);
    }

    // 3. Proteksi Route Guru
    if (pathname.startsWith("/guru") && userRole !== "GURU") {
        url.pathname = "/login";
        return NextResponse.redirect(url);
    }

    // 4. Proteksi Route Siswa
    if (pathname.startsWith("/siswa") && userRole !== "SISWA") {
        url.pathname = "/login";
        return NextResponse.redirect(url);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/admin/:path*",
        "/guru/:path*",
        "/siswa/:path*",
        "/api/admin/:path*",
        // Note: API umum seperti /api/dashboard divalidasi di dalam handler masing-masing
    ],
};