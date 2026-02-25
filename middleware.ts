import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {

    const token = await getToken({
        req,
        secret: process.env.NEXTAUTH_SECRET,
    });

    const url = req.nextUrl.clone();
    const { pathname } = url;

    if (!token) {
        url.pathname = "/login";
        return NextResponse.redirect(url);
    }

    const userRole = token.role ? (token.role as string).toUpperCase() : "";

    if (
        (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) &&
        userRole !== "ADMIN"
    ) {
        url.pathname = "/login";
        return NextResponse.redirect(url);
    }

    if (pathname.startsWith("/guru") && userRole !== "GURU") {
        url.pathname = "/login";
        return NextResponse.redirect(url);
    }

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
    ],
};
