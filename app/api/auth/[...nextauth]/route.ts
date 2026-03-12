import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { checkLoginLimit } from "@/lib/rate-limit";
import { cachedQuery } from "@/lib/cache";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },

            async authorize(credentials, req) {
                if (!credentials?.email || !credentials?.password) return null;
                const ip =
                    (req as any)?.headers?.["x-forwarded-for"]?.split(",")[0] ??
                    (req as any)?.socket?.remoteAddress ??
                    "unknown";

                const limit = checkLoginLimit(ip);
                if (!limit.allowed) {
                    throw new Error("TooManyRequests");
                }

                try {
                    const user = await cachedQuery(
                        `auth:user:${credentials.email.toLowerCase()}`,
                        10,
                        () =>
                            prisma.user.findFirst({
                                where: { email: credentials.email.toLowerCase().trim() },
                                select: {
                                    id: true,
                                    name: true,
                                    email: true,
                                    password: true,
                                    role: true,
                                    username: true,
                                },
                            })
                    );

                    if (!user) return null;
                    const isValid = await bcrypt.compare(credentials.password, user.password);
                    if (!isValid) return null;

                    return {
                        id: user.id.toString(),
                        name: user.name,
                        email: user.email,
                        role: user.role,
                        username: user.username ?? "",
                    };
                } catch (err: any) {
                    if (err.message === "TooManyRequests") throw err;
                    console.error("[NextAuth] authorize error:", err);
                    return null;
                }
            },
        }),
    ],

    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60,
        updateAge: 24 * 60 * 60,
    },

    secret: process.env.NEXTAUTH_SECRET,

    pages: {
        signIn: "/login",
        error: "/login",
    },
    cookies: {
        sessionToken: {
            name: "next-auth.session-token",
            options: {
                httpOnly: true,
                sameSite: "lax",
                path: "/",
                secure: process.env.NEXTAUTH_URL?.startsWith("https://") ?? false,
                maxAge: 30 * 24 * 60 * 60,
            },
        },
    },

    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = (user as any).role;
                token.username = (user as any).username;
                token.name = user.name;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
                session.user.role = token.role as "ADMIN" | "GURU" | "SISWA";
                session.user.username = token.username as string;
                session.user.name = token.name as string | null;
            }
            return session;
        },
    },

    debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };