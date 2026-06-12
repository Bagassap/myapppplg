import NextAuth, { DefaultSession } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            role: "ADMIN" | "GURU" | "SISWA";
            name: string | null;
            email: string;
            username: string;
        } & DefaultSession["user"];
    }

    interface User {
        id: string;
        role: "ADMIN" | "GURU" | "SISWA";
        name: string | null;
        email: string;
        username: string;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string;
        role: "ADMIN" | "GURU" | "SISWA";
        username: string;
        name: string | null;
    }
}
