import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Pastikan path ini mengarah ke file singleton prisma Anda

export async function GET(request: Request) {
    try {
        // 1. Ambil Query Params (Aman, tidak membaca body)
        const { searchParams } = new URL(request.url);
        const tipe = searchParams.get("tipe");

        // 2. Setup Filter
        const whereClause: any = {};
        if (tipe && tipe !== "Semua") {
            whereClause.tipe = tipe;
        }

        // 3. Eksekusi Query Database
        // Menggunakan prisma.informasi (sesuai standar generate model 'Informasi' menjadi lowercase di client)
        const data = await prisma.informasi.findMany({
            where: whereClause,
            include: {
                komentar: true, // Pastikan relasi ini ada di schema.prisma
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        // 4. Return Sukses
        return NextResponse.json(data, { status: 200 });

    } catch (error: any) {
        // LOGGING: Ini akan muncul di terminal VSCode Anda, BUKAN di browser.
        // Cek terminal untuk melihat penyebab asli error 500.
        console.error("❌ [API GET ERROR]:", error);

        // Return Error JSON agar frontend tidak crash mapping undefined
        return NextResponse.json(
            { error: "Internal Server Error", details: error.message },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        // 1. Parsing Body
        // Jika body kosong/malformed, ini akan melempar error yang ditangkap catch
        const body = await request.json();
        const { judul, isi, tanggal, tipe, tempatPKL } = body;

        // 2. Validasi Server-Side
        if (!judul || !isi || !tanggal) {
            return NextResponse.json(
                { error: "Judul, Isi, dan Tanggal wajib diisi" },
                { status: 400 }
            );
        }

        // 3. Eksekusi Create
        const newData = await prisma.informasi.create({
            data: {
                judul,
                isi,
                tanggal, // Schema Anda String, jadi aman. Jika DateTime, perlu new Date(tanggal)
                kategori: "Pengumuman", // Default hardcoded
                tipe: tipe || "umum",
                tempatPKL: tempatPKL || null,
            },
        });

        // 4. Return Sukses
        return NextResponse.json(newData, { status: 201 });

    } catch (error: any) {
        // LOGGING
        console.error("❌ [API POST ERROR]:", error);

        return NextResponse.json(
            { error: "Gagal menyimpan data", details: error.message },
            { status: 500 }
        );
    }
}