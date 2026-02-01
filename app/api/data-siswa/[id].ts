import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const validClasses = ["XII PG 1", "XII RPL 1", "XII RPL 2"];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const id = Number(req.query.id);

    if (isNaN(id)) return res.status(400).json({ error: "ID tidak valid" });

    if (req.method === "GET") {
        try {
            const siswa = await prisma.dataSiswa.findUnique({
                where: { id },
            });

            if (!siswa) return res.status(404).json({ error: "Data siswa tidak ditemukan" });

            // Ambil user berdasarkan userId yang disimpan sebagai string di dataSiswa
            const userIdNumber = Number(siswa.userId);
            const user = await prisma.user.findUnique({
                where: { id: userIdNumber },
            });

            res.status(200).json({
                ...siswa,
                name: user?.name || "Tidak Diketahui",
                username: user?.username || "Tidak Ada",
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Gagal mengambil data siswa" });
        }
    } else if (req.method === "PUT") {
        try {
            const { username, namaLengkap, kelas, tempatPKL, password } = req.body;

            if (!username || !namaLengkap || !kelas || !validClasses.includes(kelas)) {
                return res.status(400).json({ error: "Data tidak valid" });
            }

            const dataUpdateUser: any = { name: namaLengkap };
            if (password) {
                dataUpdateUser.password = bcrypt.hashSync(password, 10);
            }

            const existingDataSiswa = await prisma.dataSiswa.findUnique({
                where: { id },
            });
            if (!existingDataSiswa) return res.status(404).json({ error: "Data siswa tidak ditemukan" });

            const existingUser = await prisma.user.findUnique({
                where: { id: Number(existingDataSiswa.userId) },
            });
            if (!existingUser) return res.status(404).json({ error: "Data user tidak ditemukan" });

            // Cek username unik jika berubah
            if (username !== existingUser.username) {
                const cekUser = await prisma.user.findUnique({
                    where: { username },
                });
                if (cekUser && cekUser.id !== existingUser.id)
                    return res.status(409).json({ error: "Username sudah digunakan" });
            }

            await prisma.user.update({
                where: { id: existingUser.id },
                data: {
                    username,
                    ...dataUpdateUser,
                },
            });

            await prisma.dataSiswa.update({
                where: { id },
                data: {
                    kelas,
                    tempatPKL,
                },
            });

            res.status(200).json({ message: "Data siswa berhasil diperbarui" });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Gagal mengupdate data siswa" });
        }
    } else if (req.method === "DELETE") {
        try {
            const dataSiswa = await prisma.dataSiswa.findUnique({
                where: { id },
            });
            if (!dataSiswa) return res.status(404).json({ error: "Data siswa tidak ditemukan" });

            await prisma.user.delete({
                where: { id: Number(dataSiswa.userId) },
            });

            await prisma.dataSiswa.delete({
                where: { id },
            });

            res.status(200).json({ message: "Data siswa berhasil dihapus" });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Gagal menghapus data siswa" });
        }
    } else {
        res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}