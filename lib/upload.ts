import { promises as fs } from "fs";
import path from "path";

const uploadDir = path.join(process.cwd(), "public", "uploads");

let dirReady = false;

async function ensureUploadDir() {
    if (dirReady) return;
    try {
        await fs.access(uploadDir);
    } catch {
        await fs.mkdir(uploadDir, { recursive: true });
    }
    dirReady = true;
}

const MAX_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export async function uploadFile(file: File): Promise<string> {

    if (file.size > MAX_SIZE_BYTES) {
        throw new Error(`File terlalu besar. Maks 5MB, ukuran: ${(file.size / 1024 / 1024).toFixed(1)}MB`);
    }
    if (file.type && !ALLOWED_TYPES.includes(file.type)) {
        throw new Error(`Tipe file tidak didukung: ${file.type}`);
    }

    await ensureUploadDir();

    const ext = path.extname(file.name) || ".jpg";
    const random = Math.random().toString(36).slice(2, 7);
    const fileName = `${Date.now()}-${random}${ext}`;
    const filePath = path.join(uploadDir, fileName);

    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(filePath, buffer);

    return `/api/uploads/${fileName}`;
}

export async function uploadFiles(files: (File | null)[]): Promise<(string | null)[]> {
    return Promise.all(
        files.map(f => f ? uploadFile(f) : Promise.resolve(null))
    );
}
