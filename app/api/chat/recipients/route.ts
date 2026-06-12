import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const role = session.user.role as string;

    if (role === "SISWA") return NextResponse.json([]);

    if (role === "ADMIN") {
        const siswaUsers = await prisma.user.findMany({
            where: { role: "SISWA" },
            select: { id: true, name: true, username: true },
            orderBy: { name: "asc" },
        });

        const usernames = siswaUsers.map((u) => u.username).filter(Boolean) as string[];
        const dataSiswaList = await prisma.dataSiswa.findMany({
            where: { userId: { in: usernames } },
            select: { userId: true, kelas: true, tempatPKL: true },
        });
        const dsMap = Object.fromEntries(dataSiswaList.map((d) => [d.userId, d]));

        return NextResponse.json(
            siswaUsers.map((u) => ({
                id: u.id,
                name: u.name ?? "—",
                username: u.username ?? "—",
                kelas: dsMap[u.username ?? ""]?.kelas ?? "—",
                tempatPKL: dsMap[u.username ?? ""]?.tempatPKL ?? "—",
            })),
        );
    }

    if (role === "GURU") {
        const guruName = session.user.name ?? "";
        const bimbing = await prisma.dataSiswa.findMany({
            where: { guruPembimbing: guruName },
            select: { userId: true, kelas: true, tempatPKL: true },
        });

        if (bimbing.length === 0) return NextResponse.json([]);

        const nisArr = bimbing.map((d) => d.userId);
        const users = await prisma.user.findMany({
            where: { username: { in: nisArr } },
            select: { id: true, name: true, username: true },
        });
        const dsMap = Object.fromEntries(bimbing.map((d) => [d.userId, d]));

        return NextResponse.json(
            users.map((u) => ({
                id: u.id,
                name: u.name ?? "—",
                username: u.username ?? "—",
                kelas: dsMap[u.username ?? ""]?.kelas ?? "—",
                tempatPKL: dsMap[u.username ?? ""]?.tempatPKL ?? "—",
            })),
        );
    }

    return NextResponse.json([]);
}
