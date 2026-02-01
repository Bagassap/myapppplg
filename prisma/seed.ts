import "dotenv/config";
import { prisma } from "../lib/prisma";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";
import { parse } from "csv-parse";




interface UserCsvRecord {
    username: string;
    email: string;
    password: string;
    name: string;
    role: string;

}

interface GuruCsvRecord {
    userId : string
}

interface SiswaCsvRecord {
    userId : string
    kelas : string
    tempatPKL : string
    guruPembimbing : string

}

type Role = 'ADMIN' | 'GURU' | 'SISWA'; 

function normalizeName(name: string): string {
    return name
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[.,']/g, "")
        .replace(/\s+/g, " ")
        .trim()
        .toUpperCase();
}

async function UserReadCsv(fileName: string): Promise<UserCsvRecord[]> {
    const filePath = path.resolve(process.cwd(), fileName);
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    return new Promise((resolve, reject) => {
        parse(fileContent, { columns: true, trim: true }, (err, records: UserCsvRecord[]) => {
            if (err) reject(err);
            else resolve(records);
        });
    });
}
async function GuruReadCsv(fileName: string): Promise<GuruCsvRecord[]> {
    const filePath = path.resolve(process.cwd(), fileName);
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    return new Promise((resolve, reject) => {
        parse(fileContent, { columns: true, trim: true }, (err, records: GuruCsvRecord[]) => {
            if (err) reject(err);
            else resolve(records);
        });
    });
}


async function SiswaReadCsv(fileName: string): Promise<SiswaCsvRecord[]> {
    const filePath = path.resolve(process.cwd(), fileName);
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    return new Promise((resolve, reject) => {
        parse(fileContent, { columns: true, trim: true }, (err, records: SiswaCsvRecord[]) => {
            if (err) reject(err);
            else resolve(records);
        });
    });
}

async function main() {
    const userData = await UserReadCsv('./csv/user.csv');
    const guruData = await GuruReadCsv('./csv/guru.csv');
    const siswaData = await SiswaReadCsv('./csv/siswa.csv');

    // Seed Admin (tidak berubah)
for (const user of userData) {
        if (!user.email || !user.password || !user.username || !user.name || !user.role) {
            console.warn("Admin data incomplete:", user);
            continue;
        }
        const passHash = await bcrypt.hash(user.password, 10);
        await prisma.user.create ({
            data: {
                username: user.username,
                email: user.email,
                password: passHash,
                name: user.name,
                role: user.role as Role
            }
        })
        console.log(`User dengan email ${user.name} berhasil di-import`);
    }


    // Seed Guru (diperbaiki: buat User DAN DataGuru, simpan DataGuru.id di guruMap)
    for (const guru of guruData) {
        if (!guru.userId) {
            console.warn("Guru data incomplete:", guru);
            continue;
        }
        const dataGuru = await prisma.dataGuru.create({

            data: {
            userId : guru.userId
            },
        });
        console.log(`Guru dengan email ${dataGuru.userId} berhasil di-import`);

    }


    // Seed Siswa (diperbaiki: guruPembimbing sekarang mereferensikan DataGuru.id)
    for (const siswa of siswaData) {
        if (!siswa.userId || !siswa.kelas || !siswa.tempatPKL || !siswa.guruPembimbing) {
            console.warn("Siswa data incomplete:", siswa);
            continue;
        }
        const user = await prisma.dataSiswa.create({
            data: {
                userId : siswa.userId,
                kelas: siswa.kelas,
                tempatPKL: siswa.tempatPKL,
                guruPembimbing : siswa.guruPembimbing
            },
        });
        console.log(`Siswa dengan email ${siswa.userId} berhasil di-import`);
    }

    console.log("Seed selesai.");
    await prisma.$disconnect();
}

main().catch(err => {
    console.error("Seed error:", err);
    process.exit(1);
});