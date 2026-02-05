import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const tipe = searchParams.get("tipe");

        const whereClause: any = {};
        if (tipe && tipe !== "Semua") {
            whereClause.tipe = tipe;
        }

        const data = await prisma.informasi.findMany({
            where: whereClause,
            include: {
                komentar: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return NextResponse.json(data, { status: 200 });

    } catch (error: any) {
        console.error("❌ [API GET ERROR]:", error);

        return NextResponse.json(
            { error: "Internal Server Error", details: error.message },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { judul, isi, tanggal, tipe, tempatPKL } = body;

        if (!judul || !isi || !tanggal) {
            return NextResponse.json(
                { error: "Judul, Isi, dan Tanggal wajib diisi" },
                { status: 400 }
            );
        }

        const newData = await prisma.informasi.create({
            data: {
                judul,
                isi,
                tanggal,
                kategori: "Pengumuman",
                tipe: tipe || "umum",
                tempatPKL: tempatPKL || null,
            },
        });

        return NextResponse.json(newData, { status: 201 });

    } catch (error: any) {
        console.error("❌ [API POST ERROR]:", error);

        return NextResponse.json(
            { error: "Gagal menyimpan data", details: error.message },
            { status: 500 }
        );
    }
}