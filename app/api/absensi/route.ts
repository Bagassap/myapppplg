import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { uploadFiles } from "@/lib/upload";
import { authOptions } from "../auth/[...nextauth]/route";

export const dynamic = "force-dynamic";

const submitTracker = new Map<string, number>();
const RATE_LIMIT_MS = 3000;

function isRateLimited(userId: string): boolean {
    const last = submitTracker.get(userId);
    const now = Date.now();
    if (last && now - last < RATE_LIMIT_MS) return true;
    if (submitTracker.size > 200) {
        const cutoff = now - RATE_LIMIT_MS * 10;
        for (const [k, v] of submitTracker) {
            if (v < cutoff) submitTracker.delete(k);
        }
    }
    return false;
}

// ── GET ──
export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const user = session.user as any;
    const userRole = user.role?.toUpperCase() ?? "";
    const userEmail = user.email;

    let whereClause: any = {};

    if (startDate && endDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        whereClause.tanggal = { gte: start, lte: end };
    }

    try {
        if (userRole === "SISWA") {
            const userData = await prisma.user.findUnique({
                where: { email: userEmail },
                select: { username: true, name: true },
            });
            if (!userData?.username) return NextResponse.json([], { status: 200 });

            whereClause.userId = userData.username;

            const absensiList = await prisma.absensi.findMany({
                where: whereClause,
                include: {
                    dataSiswa: { select: { kelas: true, tempatPKL: true } },
                },
                orderBy: { tanggal: "desc" },
            });

            return NextResponse.json(
                absensiList.map(item => ({
                    id: item.id,
                    userId: item.userId,
                    siswa: userData.name ?? item.userId,
                    kelas: item.dataSiswa?.kelas ?? "-",
                    tempatPKL: item.dataSiswa?.tempatPKL ?? "-",
                    tanggal: item.tanggal,
                    waktu: item.waktu ?? "-",
                    status: item.status,
                    tipe: item.tipe,
                    kegiatan: item.kegiatan ?? "-",
                    keterangan: item.keterangan ?? "-",
                    lokasi: item.lokasi ?? null,
                    foto: item.foto ?? null,
                    tandaTangan: item.tandaTangan ?? null,
                    bukti: item.bukti ?? null,
                }))
            );

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
                searchConditions.push({
                    guruPembimbing: { contains: guruUser.username, mode: "insensitive" },
                });
            }

            const myStudents = await prisma.dataSiswa.findMany({
                where: { OR: searchConditions },
                select: { userId: true },
            });

            const studentIds = myStudents.map(s => s.userId);
            if (studentIds.length === 0) return NextResponse.json([], { status: 200 });
            whereClause.userId = { in: studentIds };
        }

        const absensiList = await prisma.absensi.findMany({
            where: whereClause,
            include: {
                dataSiswa: { select: { kelas: true, tempatPKL: true } },
            },
            orderBy: { tanggal: "desc" },
        });

        if (absensiList.length === 0) return NextResponse.json([]);

        const uniqueUserIds = [...new Set(absensiList.map(item => item.userId))];
        const users = await prisma.user.findMany({
            where: { username: { in: uniqueUserIds } },
            select: { username: true, name: true },
        });
        const userMap = new Map(users.map(u => [u.username ?? "", u.name ?? u.username ?? ""]));

        return NextResponse.json(
            absensiList.map(item => ({
                id: item.id,
                userId: item.userId,
                siswa: userMap.get(item.userId) ?? item.userId,
                kelas: item.dataSiswa?.kelas ?? "-",
                tempatPKL: item.dataSiswa?.tempatPKL ?? "-",
                tanggal: item.tanggal,
                waktu: item.waktu ?? "-",
                status: item.status,
                tipe: item.tipe,
                kegiatan: item.kegiatan ?? "-",
                keterangan: item.keterangan ?? "-",
                lokasi: item.lokasi ?? null,
                foto: item.foto ?? null,
                tandaTangan: item.tandaTangan ?? null,
                bukti: item.bukti ?? null,
            }))
        );

    } catch (error) {
        console.error("Error GET Absensi:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// ── POST ──
export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = (session.user as any).role;
    if (userRole !== "SISWA") {
        return NextResponse.json({ error: "Hanya siswa yang bisa absen" }, { status: 403 });
    }

    try {
        const [formData, userData] = await Promise.all([
            req.formData(),
            prisma.user.findUnique({
                where: { email: (session.user as any).email },
                select: { username: true },
            }),
        ]);

        if (!userData?.username) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        if (isRateLimited(userData.username)) {
            return NextResponse.json(
                { error: "Terlalu cepat. Tunggu beberapa detik sebelum submit lagi." },
                { status: 429 }
            );
        }

        const fotoFile = formData.get("foto") as File | null;
        const buktiFile = formData.get("bukti") as File | null;
        const ttdRaw = formData.get("tandaTangan");

        const [fotoUrl, buktiUrl] = await uploadFiles([
            fotoFile && typeof fotoFile !== "string" ? fotoFile : null,
            buktiFile && typeof buktiFile !== "string" ? buktiFile : null,
        ]);

        let ttdUrl: string | null = null;
        if (ttdRaw) {
            if (typeof ttdRaw === "string" && ttdRaw.startsWith("data:image")) {
                ttdUrl = ttdRaw;
            } else if (typeof ttdRaw !== "string") {
                ttdUrl = await uploadFiles([ttdRaw as File]).then(r => r[0]);
            }
        }

        const status = formData.get("status") as string;

        const newAbsensi = await prisma.absensi.create({
            data: {
                userId: userData.username,
                tanggal: new Date(),
                waktu: (formData.get("waktu") as string) || new Date().toLocaleTimeString("id-ID"),
                status,
                tipe: status === "Pulang" ? "keluar" : "masuk",
                kegiatan: (formData.get("kegiatan") as string) || "",
                keterangan: (formData.get("keterangan") as string) || "",
                lokasi: (formData.get("lokasi") as string) || "",
                foto: fotoUrl,
                tandaTangan: ttdUrl,
                bukti: buktiUrl,
            },
        });

        return NextResponse.json(newAbsensi, { status: 201 });

    } catch (error: any) {
        if (error?.code === "P2002") {
            return NextResponse.json(
                { error: "Anda sudah melakukan absensi hari ini." },
                { status: 409 }
            );
        }
        console.error("Error Absensi POST:", error);
        return NextResponse.json({ error: "Gagal menyimpan absensi" }, { status: 500 });
    }
}