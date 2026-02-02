import { withAuth } from "next-auth/middleware";

export default withAuth(
    function middleware(req) {
        // Logika kustom jika diperlukan
    },
    {
        callbacks: {
            authorized: ({ token, req }) => {
                const { pathname } = req.nextUrl;
                if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
                    return token?.role === "ADMIN";
                }

                if (pathname.startsWith("/guru")) {
                    return token?.role === "GURU";
                }

                if (pathname.startsWith("/siswa")) {
                    return token?.role === "SISWA";
                }

                return true;
            },
        },
    }
);

export const config = {
    // TAMBAHKAN "/api/admin/:path*" ke dalam matcher
    matcher: [
        "/admin/:path*",
        "/guru/:path*",
        "/siswa/:path*",
        "/api/admin/:path*"
    ],
};