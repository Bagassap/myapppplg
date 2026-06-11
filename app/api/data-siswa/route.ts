import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

const KELAS_OPTIONS = ["XII PG 1", "XII RPL 1", "XII RPL 2"];

async function buildResponse(siswaData: any[]) {
    if (!siswaData.length) return [];
    const usernames = siswaData.map(d => d.userId);
    const users = await prisma.user.findMany({
        where: { username: { in: usernames } },
        select: { username: true, name: true, email: true },
    });
    const userMap = new Map(users.map(u => [u.username ?? "", u]));
    return siswaData.map(d => {
        const u = userMap.get(d.userId);
        return {
            id: d.id,
            userId: d.userId,
            name: u?.name ?? "",
            email: u?.email ?? "",
            kelas: d.kelas,
            jurusan: d.jurusan ?? "",
            tempatPKL: d.tempatPKL ?? "",
            guruPembimbing: d.guruPembimbing ?? "",
            noHp: d.noHp ?? "",
            alamat: d.alamat ?? "",
            isActive: d.isActive ?? true,
        };
    });
}

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const user = session.user as { id?: string; role?: string };
    const { role, id: userId } = user;

    const search = req.nextUrl.searchParams.get("search") ?? "";
    const kelasFilter = req.nextUrl.searchParams.get("kelas") ?? "";

    let where: any = {};
    if (kelasFilter && kelasFilter !== "Semua Kelas") where.kelas = kelasFilter;

    try {
        let raw: any[];

        if (role === "ADMIN") {
            raw = await prisma.dataSiswa.findMany({
                where,
                orderBy: { id: "asc" },
                select: { id: true, userId: true, kelas: true, jurusan: true, tempatPKL: true, guruPembimbing: true, noHp: true, alamat: true, isActive: true },
            });
        } else if (role === "GURU") {
            const guruUser = await prisma.user.findUnique({
                where: { id: Number(userId) }, select: { username: true, name: true },
            });
            const guruName = guruUser?.username ?? guruUser?.name ?? "";
            raw = await prisma.dataSiswa.findMany({
                where: { ...where, guruPembimbing: { equals: guruName, mode: "insensitive" } },
                orderBy: { id: "asc" },
                select: { id: true, userId: true, kelas: true, jurusan: true, tempatPKL: true, guruPembimbing: true, noHp: true, alamat: true, isActive: true },
            });
        } else if (role === "SISWA") {
            const me = await prisma.user.findUnique({
                where: { id: Number(userId) }, select: { username: true },
            });
            if (!me?.username) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
            const siswa = await prisma.dataSiswa.findFirst({
                where: { userId: me.username },
                select: { id: true, userId: true, kelas: true, jurusan: true, tempatPKL: true, guruPembimbing: true, noHp: true, alamat: true, isActive: true },
            });
            raw = siswa ? [siswa] : [];
        } else {
            return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
        }

        let data = await buildResponse(raw);
        if (search) {
            const q = search.toLowerCase();
            data = data.filter(d =>
                d.name.toLowerCase().includes(q) ||
                d.userId.toLowerCase().includes(q) ||
                d.kelas.toLowerCase().includes(q)
            );
        }
        return NextResponse.json({ success: true, data });
    } catch (e) {
        console.error("GET /api/data-siswa", e);
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== "ADMIN") {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { username, email, password, namaLengkap, kelas, jurusan, tempatPKL, noHp, alamat } = await req.json();
        if (!username?.trim() || !email?.trim() || !password?.trim() || !namaLengkap?.trim() || !kelas?.trim()) {
            return NextResponse.json({ success: false, error: "Field wajib belum diisi" }, { status: 400 });
        }

        const existing = await prisma.user.findFirst({
            where: { OR: [{ username }, { email }] },
        });
        if (existing) return NextResponse.json({ success: false, error: "Username atau email sudah digunakan" }, { status: 409 });

        const hashed = await bcrypt.hash(password, 10);
        const newUser = await prisma.user.create({
            data: { username, email, password: hashed, role: "SISWA", name: namaLengkap },
        });
        const newSiswa = await prisma.dataSiswa.create({
            data: {
                userId: username,
                kelas,
                jurusan: jurusan ?? null,
                tempatPKL: tempatPKL ?? null,
                noHp: noHp ?? null,
                alamat: alamat ?? null,
            },
        });

        return NextResponse.json({
            success: true,
            data: {
                id: newSiswa.id, userId: username, name: namaLengkap, email,
                kelas, jurusan: jurusan ?? "", tempatPKL: tempatPKL ?? "",
                noHp: noHp ?? "", alamat: alamat ?? "", isActive: true,
            },
        }, { status: 201 });
    } catch (e) {
        console.error("POST /api/data-siswa", e);
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
    }
}
