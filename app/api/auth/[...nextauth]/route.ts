import NextAuth, { NextAuthOptions } from "next-auth";  // Tambahkan import NextAuthOptions
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
                    console.log("User tidak ditemukan untuk email:", credentials.email);
                    return null;
                }

                const isValid = await bcrypt.compare(credentials.password, user.password);
                if (!isValid) {
                    console.log("Password tidak valid untuk email:", credentials.email);
                    return null;
                }

                console.log("Login berhasil untuk email:", credentials.email);
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
    },
    secret: process.env.NEXTAUTH_SECRET,
    callbacks: {
        async jwt({ token, user }: { token: any; user: any }) {  // Tambahkan type annotations
            console.log("JWT callback - user.role:", user?.role, "token.role sebelum:", token.role);
            if (user) {
                token.role = user.role;
            }
            console.log("JWT callback - token.role setelah:", token.role);
            return token;
        },
        async session({ session, token }: { session: any; token: any }) {  // Tambahkan type annotations
            console.log("Session callback - token.role:", token.role);
            session.user.id = token.sub; // Set id from token.sub
            session.user.role = token.role;
            console.log("Session callback - session.user.role:", session.user.role);
            return session;
        },
    },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };