import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role === "SISWA") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {

        const siswaList = await prisma.user.findMany({
            where: { role: "SISWA" },
            select: {
                id: true,
                name: true,
                username: true,
                email: true,
            },
            orderBy: { name: "asc" },
        });

        const dataList = await prisma.dataSiswa.findMany({
            select: {
                userId: true,
                kelas: true,
                tempatPKL: true,
            },
        });

        const dataMap: Record<string, { kelas: string; tempatPKL: string | null }> = {};
        dataList.forEach((d) => { dataMap[d.userId] = d; });

        const result = siswaList.map((s) => ({
            id: s.id,
            name: s.name ?? "—",
            username: s.username ?? "—",
            kelas: dataMap[s.username ?? ""]?.kelas ?? "—",
            tempatPKL: dataMap[s.username ?? ""]?.tempatPKL ?? "—",
        }));

        return NextResponse.json(result);
    } catch (error) {
        console.error("[CHAT RECIPIENTS]", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}