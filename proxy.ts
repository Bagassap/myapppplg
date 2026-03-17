import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function proxy(req: NextRequest) {
    const { pathname } = req.nextUrl;

    let token = null;
    try {
        token = await getToken({
            req,
            secret: process.env.NEXTAUTH_SECRET,
            cookieName: "next-auth.session-token",
        });
    } catch {
        const response = NextResponse.redirect(new URL("/login", req.url));
        response.cookies.delete("next-auth.session-token");
        response.cookies.delete("__Secure-next-auth.session-token");
        response.cookies.delete("next-auth.csrf-token");
        response.cookies.delete("next-auth.callback-url");
        return response;
    }

    const url = req.nextUrl.clone();

    if (!token) {
        const response = NextResponse.redirect(new URL("/login", req.url));
        response.cookies.delete("next-auth.session-token");
        response.cookies.delete("next-auth.csrf-token");
        return response;
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