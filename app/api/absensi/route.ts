import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { uploadFile } from "@/lib/upload";
import { authOptions } from "../auth/[...nextauth]/route";

export const dynamic = "force-dynamic";

// GET METHOD (Tetap Sama - Tidak Berubah)
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
        if (userRole === "SISWA") {
            const userData = await prisma.user.findUnique({
                where: { email: userEmail },
                select: { username: true },
            });
            if (!userData || !userData.username)
                return NextResponse.json([], { status: 200 });
            whereClause.userId = userData.username;
        } else if (userRole === "GURU") {
            const guruUser = await prisma.user.findUnique({
                where: { email: userEmail },
                select: { name: true, username: true }
            });
            if (!guruUser?.name) return NextResponse.json([], { status: 200 });

            const searchConditions: any[] = [{ guruPembimbing: { contains: guruUser.name, mode: "insensitive" } }];
            if (guruUser.username) searchConditions.push({ guruPembimbing: { contains: guruUser.username, mode: "insensitive" } });

            const myStudents = await prisma.dataSiswa.findMany({
                where: { OR: searchConditions },
                select: { userId: true },
            });
            const studentIds = myStudents.map((s) => s.userId);
            if (studentIds.length === 0) return NextResponse.json([], { status: 200 });
            whereClause.userId = { in: studentIds };
        }

        const absensiList = await prisma.absensi.findMany({
            where: whereClause,
            include: { dataSiswa: true },
            orderBy: { tanggal: "desc" },
        });

        const formattedData = absensiList.map((item) => ({
            id: item.id,
            userId: item.userId,
            siswa: item.userId,
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
        }));

        return NextResponse.json(formattedData);
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// POST METHOD (Handling Base64 Signature)
export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user)
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userRole = (session.user as any).role;
    if (userRole !== "SISWA") {
        return NextResponse.json({ error: "Hanya siswa yang bisa absen" }, { status: 403 });
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
        const ttdRaw = formData.get("tandaTangan");

        let fotoUrl = null;
        let buktiUrl = null;
        let ttdUrl = null;

        // Upload Foto dan Bukti (File Biasa)
        if (fotoFile && typeof fotoFile !== "string") fotoUrl = await uploadFile(fotoFile);
        if (buktiFile && typeof buktiFile !== "string") buktiUrl = await uploadFile(buktiFile);

        // Upload Tanda Tangan (Bisa Base64 atau File Legacy)
        if (ttdRaw) {
            if (typeof ttdRaw === 'string' && ttdRaw.startsWith('data:image')) {
                // Backend Anda harus support menyimpan string base64 langsung ke DB
                // ATAU upload base64 tersebut ke storage (Supabase/S3) lalu ambil URL-nya.
                // Jika DB field tipe String dan cukup panjang, simpan Base64 aman.
                // TAPI, jika function uploadFile Anda pintar, Anda bisa convert base64 -> Buffer -> Upload di sini.
                // Untuk amannya, kita asumsikan disimpan sebagai string Base64 di database (URL field)
                // atau Anda punya utilitas upload base64. 

                // *Solusi Simpel:* Simpan Base64 string langsung (jika kolom DB TEXT/VARCHAR panjang)
                ttdUrl = ttdRaw;
            }
            else if (typeof ttdRaw !== "string") {
                ttdUrl = await uploadFile(ttdRaw as File);
            }
        }

        const status = formData.get("status") as string;

        const newAbsensi = await prisma.absensi.create({
            data: {
                userId: user.username,
                tanggal: new Date(),
                waktu: (formData.get("waktu") as string) || new Date().toLocaleTimeString(),
                status: status,
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
    } catch (error) {
        console.error("Error Absensi POST:", error);
        return NextResponse.json({ error: "Gagal menyimpan absensi" }, { status: 500 });
    }
}