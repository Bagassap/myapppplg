import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { judul, deskripsi, informasiId } = body;

        if (!judul || !deskripsi || !informasiId) {
            return NextResponse.json(
                { error: "Judul, Deskripsi, dan ID Informasi wajib diisi" },
                { status: 400 }
            );
        }

        const laporan = await prisma.laporanMasalah.create({
            data: {
                informasiId: parseInt(informasiId),
                judul,
                deskripsi,
            },
        });

        return NextResponse.json(laporan, { status: 201 });
    } catch (error) {
        return NextResponse.json(
            { error: "Gagal mengirim laporan" },
            { status: 500 }
        );
    }
}