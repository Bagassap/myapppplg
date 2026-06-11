import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { judul, deskripsi, informasiId } = body;

        if (!judul?.trim() || !deskripsi?.trim() || !informasiId) {
            return NextResponse.json({ error: "Semua field wajib diisi" }, { status: 400 });
        }

        const laporan = await prisma.laporanMasalah.create({
            data: {
                informasiId: parseInt(informasiId),
                judul: judul.trim(),
                deskripsi: deskripsi.trim(),
            },
        });

        return NextResponse.json(laporan, { status: 201 });
    } catch {
        return NextResponse.json({ error: "Gagal mengirim laporan" }, { status: 500 });
    }
}
