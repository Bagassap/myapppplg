import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        const { searchParams } = new URL(request.url);

        const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
        const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20")));
        const search = searchParams.get("search") || "";
        const isPinnedParam = searchParams.get("pinned");
        const targetParam = searchParams.get("target");
        const skip = (page - 1) * limit;

        const where: any = {};

        const role = session?.user?.role;
        if (role === "GURU") {
            where.target = { in: ["SEMUA", "GURU"] };
        } else if (role === "SISWA") {
            where.target = { in: ["SEMUA", "SISWA"] };
        } else if (targetParam) {
            where.target = targetParam;
        }

        if (isPinnedParam === "true") where.isPinned = true;
        if (search) {
            where.OR = [
                { judul: { contains: search, mode: "insensitive" } },
                { isi: { contains: search, mode: "insensitive" } },
            ];
        }

        const [items, total] = await Promise.all([
            prisma.informasi.findMany({
                where,
                orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
                skip,
                take: limit,
                include: { _count: { select: { komentar: true } } },
            }),
            prisma.informasi.count({ where }),
        ]);

        return NextResponse.json({ data: items, total, page, totalPages: Math.ceil(total / limit) });
    } catch (error: any) {
        console.error("❌ [API GET ERROR]:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !["ADMIN", "GURU"].includes(session.user.role)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { judul, isi, tanggal, kategori, tipe, tempatPKL, target, isPinned } = body;

        if (!judul || !isi || !tanggal) {
            return NextResponse.json({ error: "Judul, Isi, dan Tanggal wajib diisi" }, { status: 400 });
        }

        const item = await prisma.informasi.create({
            data: {
                judul,
                isi,
                tanggal,
                kategori: kategori || "Pengumuman",
                tipe: tipe || "umum",
                tempatPKL: tempatPKL || null,
                target: target || "SEMUA",
                isPinned: isPinned === true,
            },
        });

        return NextResponse.json(item, { status: 201 });
    } catch (error: any) {
        console.error("❌ [API POST ERROR]:", error);
        return NextResponse.json({ error: "Gagal menyimpan data" }, { status: 500 });
    }
}
