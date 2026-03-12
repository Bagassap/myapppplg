import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    const token = await getToken({
        req,
        secret: process.env.NEXTAUTH_SECRET,
        cookieName: "next-auth.session-token",
    });

    const url = req.nextUrl.clone();

    if (!token) {
        url.pathname = "/login";
        return NextResponse.redirect(url);
    }

    const role = token.role ? String(token.role).toUpperCase() : "";

    if (
        (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) &&
        role !== "ADMIN"
    ) {
        url.pathname = "/login";
        return NextResponse.redirect(url);
    }

    if (pathname.startsWith("/guru") && role !== "GURU") {
        url.pathname = "/login";
        return NextResponse.redirect(url);
    }

    if (pathname.startsWith("/siswa") && role !== "SISWA") {
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
    ],
};