import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { uploadFile } from "@/lib/upload";
import { authOptions } from "../auth/[...nextauth]/route";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const user = session.user as any;
    const userRole = user.role ? user.role.toUpperCase() : "";
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
        // === LOGIC SISWA ===
        if (userRole === "SISWA") {
            const userData = await prisma.user.findUnique({
                where: { email: userEmail },
                select: { username: true },
            });
            if (!userData || !userData.username)
                return NextResponse.json([], { status: 200 });
            whereClause.userId = userData.username;

        }
        // === LOGIC GURU (CLEAN VERSION) ===
        else if (userRole === "GURU") {
            const guruUser = await prisma.user.findUnique({
                where: { email: userEmail },
                select: { name: true, username: true }
            });

            if (!guruUser?.name) {
                return NextResponse.json([], { status: 200 });
            }

            const searchConditions: any[] = [
                { guruPembimbing: { contains: guruUser.name, mode: "insensitive" } }
            ];

            if (guruUser.username) {
                searchConditions.push({ guruPembimbing: { contains: guruUser.username, mode: "insensitive" } });
            }

            const myStudents = await prisma.dataSiswa.findMany({
                where: {
                    OR: searchConditions
                },
                select: { userId: true },
            });

            const studentIds = myStudents.map((s) => s.userId);

            if (studentIds.length === 0) {
                return NextResponse.json([], { status: 200 });
            }

            whereClause.userId = { in: studentIds };
        }

        const absensiList = await prisma.absensi.findMany({
            where: whereClause,
            include: {
                dataSiswa: true,
            },
            orderBy: { tanggal: "desc" },
        });

        const uniqueUserIds = Array.from(
            new Set(absensiList.map((item) => item.userId))
        );

        const users = await prisma.user.findMany({
            where: {
                username: { in: uniqueUserIds },
            },
            select: {
                username: true,
                name: true,
            },
        });

        const userMap = new Map();
        users.forEach((u) => {
            if (u.username) userMap.set(u.username, u.name);
        });

        const formattedData = absensiList.map((item) => {
            const namaSiswa = userMap.get(item.userId) || item.userId || "Siswa";

            return {
                id: item.id,
                userId: item.userId,
                siswa: namaSiswa,
                kelas: item.dataSiswa?.kelas || "-",
                tempatPKL: item.dataSiswa?.tempatPKL || "-",
                tanggal: item.tanggal,
                waktu: item.waktu || "-",
                status: item.status,
                tipe: item.tipe,
                kegiatan: item.kegiatan || "-",
                keterangan: item.keterangan || "-",
                lokasi: item.lokasi || null,
                foto: item.foto || null,
                tandaTangan: item.tandaTangan || null,
                bukti: item.bukti || null,
            };
        });

        return NextResponse.json(formattedData);
    } catch (error) {
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user)
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userRole = (session.user as any).role;
    if (userRole !== "SISWA") {
        return NextResponse.json(
            { error: "Hanya siswa yang bisa absen" },
            { status: 403 }
        );
    }

    try {
        const formData = await req.formData();

        const user = await prisma.user.findUnique({
            where: { email: (session.user as any).email },
            select: { username: true },
        });
        if (!user || !user.username)
            return NextResponse.json({ error: "User not found" }, { status: 404 });

        const fotoFile = formData.get("foto") as File | null;
        const buktiFile = formData.get("bukti") as File | null;

        // AMBIL DATA TANDA TANGAN (Bisa berupa File lama atau String Base64 baru)
        const ttdRaw = formData.get("tandaTangan");

        let fotoUrl = null;
        let buktiUrl = null;
        let ttdUrl = null;

        if (fotoFile && typeof fotoFile !== "string")
            fotoUrl = await uploadFile(fotoFile);

        if (buktiFile && typeof buktiFile !== "string")
            buktiUrl = await uploadFile(buktiFile);

        // LOGIKA PENYIMPANAN TANDA TANGAN
        if (ttdRaw) {
            // Jika string base64 (dari canvas), simpan langsung
            if (typeof ttdRaw === 'string' && ttdRaw.startsWith('data:image')) {
                ttdUrl = ttdRaw;
            }
            // Fallback: Jika masih ada yang pakai upload file (legacy)
            else if (typeof ttdRaw !== "string") {
                ttdUrl = await uploadFile(ttdRaw as File);
            }
        }

        const status = formData.get("status") as string;

        const newAbsensi = await prisma.absensi.create({
            data: {
                userId: user.username,
                tanggal: new Date(),
                waktu:
                    (formData.get("waktu") as string) || new Date().toLocaleTimeString(),
                status: status,
                tipe: status === "Pulang" ? "keluar" : "masuk",
                kegiatan: (formData.get("kegiatan") as string) || "",
                keterangan: (formData.get("keterangan") as string) || "",
                lokasi: (formData.get("lokasi") as string) || "",
                foto: fotoUrl,
                tandaTangan: ttdUrl, // Base64 string masuk sini
                bukti: buktiUrl,
            },
        });

        return NextResponse.json(newAbsensi, { status: 201 });
    } catch (error) {
        console.error("Error Absensi POST:", error);
        return NextResponse.json(
            { error: "Gagal menyimpan absensi" },
            { status: 500 }
        );
    }
}