import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const data = await prisma.informasi.findMany({
            orderBy: { createdAt: "desc" },
            select: { id: true, judul: true, konten: true, pembuat: true, createdAt: true },
        });
        return NextResponse.json({ success: true, data });
    } catch {
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !["ADMIN", "GURU"].includes(session.user.role)) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const { judul, konten } = await request.json();
        if (!judul?.trim() || !konten?.trim()) {
            return NextResponse.json({ success: false, error: "Judul dan konten wajib diisi" }, { status: 400 });
        }

        const pembuat =
            session.user.name ||
            (session.user as any).username ||
            session.user.email ||
            "Admin";

        const item = await prisma.informasi.create({
            data: { judul: judul.trim(), konten: konten.trim(), pembuat },
            select: { id: true, judul: true, konten: true, pembuat: true, createdAt: true },
        });

        return NextResponse.json({ success: true, data: item }, { status: 201 });
    } catch {
        return NextResponse.json({ success: false, error: "Gagal menyimpan data" }, { status: 500 });
    }
}
