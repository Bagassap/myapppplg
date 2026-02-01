import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const validClasses = ["XII PG 1", "XII RPL 1", "XII RPL 2"];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "GET") {
        try {
            const kelasFilter = req.query.kelas;
            let where: any = {};
            if (kelasFilter && typeof kelasFilter === "string" && validClasses.includes(kelasFilter)) {
                where.kelas = kelasFilter;
            }

            // Ambil data siswa tanpa include user
            const dataSiswa = await prisma.dataSiswa.findMany({
                where,
            });

            // Ambil semua userId dari dataSiswa (userId bertipe string)
            const userIds = dataSiswa.map(ds => Number(ds.userId));

            // Ambil data user yang sesuai userId
            const users = await prisma.user.findMany({
                where: { id: { in: userIds } }, // user.id bertipe number
                select: { id: true, name: true, username: true }
            });

            // Buat mapping id user => user data
            const userMap = new Map<number, { name: string | null; username: string | null }>();
            users.forEach(u => userMap.set(u.id, { name: u.name, username: u.username }));

            // Gabungkan data siswa dengan data user
            const result = dataSiswa.map(ds => {
                const userIdAsNumber = Number(ds.userId);
                const user = userMap.get(userIdAsNumber);
                return {
                    ...ds,
                    name: user?.name || "Tidak Diketahui",
                    nis: user?.username || "Tidak Ada"
                };
            });

            res.status(200).json(result);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Gagal mengambil data siswa" });
        }
    } else if (req.method === "POST") {
        try {
            const { username, email, password, namaLengkap, kelas, tempatPKL } = req.body;

            if (
                !username ||
                !email ||
                !password ||
                !namaLengkap ||
                !kelas ||
                !validClasses.includes(kelas)
            ) {
                return res.status(400).json({ error: "Data siswa tidak valid" });
            }

            const hashedPassword = bcrypt.hashSync(password, 10);

            // Cek unique username/email
            const cekUser = await prisma.user.findFirst({
                where: {
                    OR: [
                        { username },
                        { email },
                    ],
                },
            });
            if (cekUser) {
                return res.status(409).json({ error: "Username atau email sudah digunakan" });
            }

            // Buat user baru
            const user = await prisma.user.create({
                data: {
                    username,
                    email,
                    password: hashedPassword,
                    role: "SISWA",
                    name: namaLengkap,
                },
            });

            // Buat dataSiswa dan simpan userId sebagai string dari nomor id user
            const dataSiswa = await prisma.dataSiswa.create({
                data: {
                    userId: user.id.toString(),
                    kelas,
                    tempatPKL,
                },
            });

            res.status(201).json({ user, dataSiswa });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Gagal menambahkan siswa" });
        }
    } else {
        res.setHeader("Allow", ["GET", "POST"]);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}