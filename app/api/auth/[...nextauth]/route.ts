import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                const user = await prisma.user.findFirst({
                    where: {
                        email: credentials.email,
                    },
                });

                if (!user) {
                    return null;
                }

                const isValid = await bcrypt.compare(credentials.password, user.password);
                if (!isValid) {
                    return null;
                }

                return {
                    id: user.id.toString(),
                    name: user.name,
                    email: user.email,
                    role: user.role,
                };
            },
        }),
    ],
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 hari
    },
    secret: process.env.NEXTAUTH_SECRET,
    pages: {
        signIn: '/login',
        error: '/login',
    },
    // ROOT CAUSE FIX:
    // NEXTAUTH_URL = http://192.168.20.6:3000 (HTTP, bukan HTTPS)
    // Tapi NODE_ENV=production (karena npm run build+start) menyebabkan
    // Next-Auth otomatis set secure:true pada cookie.
    // Browser MENOLAK mengirim Secure cookie ke HTTP → getToken() di middleware
    // tidak menemukan token → redirect ke login setelah beberapa navigasi.
    // Fix: override cookie config, secure mengikuti URL bukan NODE_ENV.
    cookies: {
        sessionToken: {
            name: "next-auth.session-token",
            options: {
                httpOnly: true,
                sameSite: "lax",
                path: "/",
                secure: process.env.NEXTAUTH_URL?.startsWith("https://") ?? false,
            },
        },
    },
    callbacks: {
        async jwt({ token, user }: { token: any; user: any }) {
            if (user) {
                token.role = user.role;
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token }: { session: any; token: any }) {
            session.user.id = token.sub;
            session.user.role = token.role;
            return session;
        },
    },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
