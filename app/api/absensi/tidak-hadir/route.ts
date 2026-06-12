import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { authOptions } from "../../auth/[...nextauth]/route";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user)
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = session.user as any;
    const userRole = user.role ? user.role.toUpperCase() : "";
    const userEmail = user.email;

    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get("date") || new Date().toISOString().split("T")[0];

    const targetDate = new Date(dateParam);
    const start = new Date(targetDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(targetDate);
    end.setHours(23, 59, 59, 999);

    try {
        let studentScope: { userId: string; kelas: string; tempatPKL: string | null; guruPembimbing: string | null }[] = [];

        if (userRole === "ADMIN") {
            studentScope = await prisma.dataSiswa.findMany({
                select: { userId: true, kelas: true, tempatPKL: true, guruPembimbing: true },
            });

        } else if (userRole === "GURU") {
            const guruUser = await prisma.user.findUnique({
                where: { email: userEmail },
                select: { name: true, username: true },
            });
            if (!guruUser?.name) return NextResponse.json([], { status: 200 });

            const searchConditions: any[] = [
                { guruPembimbing: { contains: guruUser.name, mode: "insensitive" } },
            ];
            if (guruUser.username) {
                searchConditions.push({ guruPembimbing: { contains: guruUser.username, mode: "insensitive" } });
            }

            studentScope = await prisma.dataSiswa.findMany({
                where: { OR: searchConditions },
                select: { userId: true, kelas: true, tempatPKL: true, guruPembimbing: true },
            });

        } else {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        if (studentScope.length === 0) return NextResponse.json([], { status: 200 });

        const allStudentIds = studentScope.map(s => s.userId);

        const sudahAbsen = await prisma.absensi.findMany({
            where: {
                userId: { in: allStudentIds },
                tanggal: { gte: start, lte: end },
            },
            select: { userId: true },
            distinct: ["userId"],
        });

        const sudahAbsenSet = new Set(sudahAbsen.map(a => a.userId));

        const belumAbsenIds = allStudentIds.filter(id => !sudahAbsenSet.has(id));
        if (belumAbsenIds.length === 0) return NextResponse.json([], { status: 200 });
        const guruPembimbingRaw = [
            ...new Set(
                studentScope
                    .filter(s => belumAbsenIds.includes(s.userId))
                    .map(s => s.guruPembimbing)
                    .filter(Boolean) as string[]
            ),
        ];

        const [userRecords, guruRecords] = await Promise.all([
            prisma.user.findMany({
                where: { username: { in: belumAbsenIds } },
                select: { username: true, name: true },
            }),
            prisma.user.findMany({
                where: {
                    role: "GURU",
                    OR: guruPembimbingRaw.flatMap(g => [
                        { name: { contains: g, mode: "insensitive" as const } },
                        { username: { contains: g, mode: "insensitive" as const } },
                    ]),
                },
                select: { username: true, name: true },
            }),
        ]);

        const userMap = new Map(userRecords.map(u => [u.username ?? "", u.name ?? u.username ?? ""]));

        const guruNameMap = new Map<string, string>();
        for (const raw of guruPembimbingRaw) {
            const found = guruRecords.find(
                g =>
                    g.name?.toLowerCase().includes(raw.toLowerCase()) ||
                    g.username?.toLowerCase().includes(raw.toLowerCase())
            );
            guruNameMap.set(raw, found?.name || raw);
        }

        const result = studentScope
            .filter(s => belumAbsenIds.includes(s.userId))
            .map(s => ({
                userId: s.userId,
                nama: userMap.get(s.userId) || s.userId,
                kelas: s.kelas,
                tempatPKL: s.tempatPKL || "-",
                guruPembimbing: s.guruPembimbing
                    ? guruNameMap.get(s.guruPembimbing) || s.guruPembimbing
                    : "-",
            }));

        return NextResponse.json(result);

    } catch (error) {
        console.error("Error GET tidak-hadir:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
