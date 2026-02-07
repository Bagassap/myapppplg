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
        // === LOGIC GURU (DEBUG MODE) ===
        else if (userRole === "GURU") {
            console.log("\n========== DEBUG API ABSENSI (ROLE: GURU) ==========");
            console.log("1. Email Login:", userEmail);

            // Ambil data user guru lengkap
            const guruUser = await prisma.user.findUnique({
                where: { email: userEmail },
                select: { name: true, username: true } // Ambil username juga untuk jaga-jaga
            });

            console.log("2. Data User Guru:", guruUser);

            if (!guruUser?.name) {
                console.log("!!! ERROR: Akun Guru tidak memiliki Nama (name is null) !!!");
                return NextResponse.json([], { status: 200 });
            }

            const namaGuru = guruUser.name;

            // Logika Pencarian:
            // Kita cari siswa yang kolom 'guruPembimbing'-nya mengandung Nama Guru
            // ATAU mengandung Username Guru (fallback jika relasi pakai NIP)
            const searchConditions: any[] = [
                { guruPembimbing: { contains: namaGuru, mode: "insensitive" } }
            ];

            // Jika username ada, tambahkan ke pencarian (siapa tahu relasi pakai NIP/ID)
            if (guruUser.username) {
                searchConditions.push({ guruPembimbing: { contains: guruUser.username, mode: "insensitive" } });
            }

            // Query Siswa
            const myStudents = await prisma.dataSiswa.findMany({
                where: {
                    OR: searchConditions
                },
                select: { userId: true, guruPembimbing: true, id: true },
            });

            console.log(`3. Hasil Query Siswa (Mencari '${namaGuru}'):`);
            console.log(`   -> Ditemukan ${myStudents.length} siswa binaan.`);
            if (myStudents.length > 0) {
                console.log("   -> Sample Siswa 1:", myStudents[0]);
            } else {
                // DEBUG LANJUTAN JIKA KOSONG:
                // Cek 5 data siswa acak untuk melihat format guruPembimbing mereka
                const checkRandom = await prisma.dataSiswa.findMany({ take: 3, select: { guruPembimbing: true } });
                console.log("   -> (DEBUG) Contoh data 'guruPembimbing' di database siswa lain:", checkRandom);
            }

            const studentIds = myStudents.map((s) => s.userId);

            if (studentIds.length === 0) {
                console.log("!!! STOP: Tidak ada siswa yang cocok, return kosong.");
                return NextResponse.json([], { status: 200 });
            }

            whereClause.userId = { in: studentIds };
            console.log("4. Filter userId Absensi:", studentIds);
        }

        // === EXECUTE QUERY ===
        const absensiList = await prisma.absensi.findMany({
            where: whereClause,
            include: {
                dataSiswa: true,
            },
            orderBy: { tanggal: "desc" },
        });

        console.log(`5. Total Absensi Ditemukan: ${absensiList.length}`);

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
        console.error("Absensi API Error:", error);
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
        const ttdFile = formData.get("tandaTangan") as File | null;
        const buktiFile = formData.get("bukti") as File | null;

        let fotoUrl = null;
        let ttdUrl = null;
        let buktiUrl = null;

        if (fotoFile && typeof fotoFile !== "string")
            fotoUrl = await uploadFile(fotoFile);
        if (ttdFile && typeof ttdFile !== "string")
            ttdUrl = await uploadFile(ttdFile);
        if (buktiFile && typeof buktiFile !== "string")
            buktiUrl = await uploadFile(buktiFile);

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
                tandaTangan: ttdUrl,
                bukti: buktiUrl,
            },
        });

        return NextResponse.json(newAbsensi, { status: 201 });
    } catch (error) {
        return NextResponse.json(
            { error: "Gagal menyimpan absensi" },
            { status: 500 }
        );
    }
}