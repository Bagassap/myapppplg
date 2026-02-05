import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req) {
    const token = await getToken({
        req,
        secret: process.env.NEXTAUTH_SECRET,
        secureCookie: process.env.NEXTAUTH_URL?.startsWith("https") ?? false
    });

    const url = req.nextUrl.clone();
    const { pathname } = url;

    if (!token) {
        url.pathname = "/login";
        url.searchParams.set("callbackUrl", encodeURI(req.url));
        return NextResponse.redirect(url);
    }

    if ((pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) && token.role !== "ADMIN") {
        url.pathname = "/dashboard";
        return NextResponse.redirect(url);
    }

    if (pathname.startsWith("/guru") && token.role !== "GURU") {
        url.pathname = "/dashboard";
        return NextResponse.redirect(url);
    }

    if (pathname.startsWith("/siswa") && token.role !== "SISWA") {
        url.pathname = "/dashboard";
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
        "/absensi/:path*",
        "/dashboard/:path*"
    ],
};