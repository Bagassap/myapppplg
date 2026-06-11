import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const informasiId = parseInt(searchParams.get("informasiId") || "0");

        if (!informasiId) {
            return NextResponse.json({ error: "informasiId diperlukan" }, { status: 400 });
        }

        const komentars = await prisma.komentar.findMany({
            where: { informasiId },
            orderBy: { createdAt: "asc" },
        });

        return NextResponse.json(komentars);
    } catch {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { informasiId, isi } = body;

        if (!informasiId || !isi?.trim()) {
            return NextResponse.json({ error: "informasiId dan isi wajib diisi" }, { status: 400 });
        }

        const nama =
            session.user.name ||
            (session.user as any).username ||
            session.user.email ||
            "User";

        const komentar = await prisma.komentar.create({
            data: {
                informasiId: parseInt(informasiId),
                nama,
                isi: isi.trim(),
                tanggal: new Date().toISOString().split("T")[0],
            },
        });

        return NextResponse.json(komentar, { status: 201 });
    } catch {
        return NextResponse.json({ error: "Gagal menyimpan komentar" }, { status: 500 });
    }
}
