import sharp from "sharp";
import path from "path";
import fs from "fs/promises";
import { existsSync, mkdirSync } from "fs";

const CONFIG = {
    MAX_FILE_SIZE_BYTES: 1 * 1024 * 1024,  // 1 MB
    UPLOAD_DIR: path.join(process.cwd(), "public", "uploads"),

    FOTO: {
        maxWidth: 1280,
        maxHeight: 1280,
        quality: 80,
        format: "webp" as const,
    },

    TTD: {
        maxWidth: 800,
        maxHeight: 400,
        quality: 85,
        format: "webp" as const,
    },

    BUKTI: {
        maxWidth: 1600,
        maxHeight: 1600,
        quality: 75,
        format: "webp" as const,
    },
};

export type ImageType = "foto" | "ttd" | "bukti";

function ensureUploadDir(subDir: string): string {
    const dir = path.join(CONFIG.UPLOAD_DIR, subDir);
    if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
    }
    return dir;
}

function generateFilename(userId: string, type: ImageType): string {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const rand = Math.random().toString(36).slice(2, 8);
    return `${type}_${userId}_${date}_${rand}.webp`;
}

export async function processAndSaveImage(
    buffer: Buffer,
    userId: string,
    type: ImageType
): Promise<{
    filename: string;
    url: string;
    sizeKB: number;
    width: number;
    height: number;
}> {
    const cfg = CONFIG[type.toUpperCase() as keyof typeof CONFIG] as typeof CONFIG.FOTO;
    const metadata = await sharp(buffer).metadata();
    const originalSizeKB = Math.round(buffer.length / 1024);

    console.log(`[ImageProcessor] ${type} asli: ${originalSizeKB} KB, ${metadata.width}x${metadata.height}`);
    let pipeline = sharp(buffer)
        .rotate()
        .resize({
            width: cfg.maxWidth,
            height: cfg.maxHeight,
            fit: "inside",
            withoutEnlargement: true,
        });

    let outputBuffer = await pipeline
        .webp({ quality: cfg.quality, effort: 4 })
        .toBuffer();

    if (outputBuffer.length > CONFIG.MAX_FILE_SIZE_BYTES) {
        let quality = cfg.quality - 10;

        while (outputBuffer.length > CONFIG.MAX_FILE_SIZE_BYTES && quality >= 30) {
            console.log(`[ImageProcessor] Masih ${Math.round(outputBuffer.length / 1024)} KB, turunkan quality ke ${quality}`);

            outputBuffer = await sharp(buffer)
                .rotate()
                .resize({
                    width: cfg.maxWidth,
                    height: cfg.maxHeight,
                    fit: "inside",
                    withoutEnlargement: true,
                })
                .webp({ quality, effort: 4 })
                .toBuffer();

            quality -= 10;
        }
    }


    const subDir = type === "foto" ? "absensi" : type === "ttd" ? "ttd" : "bukti";
    const uploadDir = ensureUploadDir(subDir);
    const filename = generateFilename(userId, type);
    const filepath = path.join(uploadDir, filename);
    await fs.writeFile(filepath, outputBuffer);

    const finalMeta = await sharp(outputBuffer).metadata();
    const finalSizeKB = Math.round(outputBuffer.length / 1024);

    console.log(
        `[ImageProcessor] ${type} selesai: ${finalSizeKB} KB ` +
        `(hemat ${originalSizeKB - finalSizeKB} KB), ` +
        `${finalMeta.width}x${finalMeta.height}`
    );

    return {
        filename,
        url: `/uploads/${subDir}/${filename}`,
        sizeKB: finalSizeKB,
        width: finalMeta.width ?? 0,
        height: finalMeta.height ?? 0,
    };
}

export async function parseImageFromRequest(
    req: Request,
    fieldName: string
): Promise<Buffer | null> {
    try {
        const formData = await req.formData();
        const file = formData.get(fieldName) as File | null;
        if (!file) return null;

        const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/heic"];
        if (!allowedTypes.includes(file.type)) {
            throw new Error(`Tipe file tidak didukung: ${file.type}. Gunakan JPG, PNG, atau WebP.`);
        }

        const MAX_INPUT_SIZE = 10 * 1024 * 1024;
        if (file.size > MAX_INPUT_SIZE) {
            throw new Error("File terlalu besar. Maksimal 10 MB sebelum kompresi.");
        }

        const arrayBuffer = await file.arrayBuffer();
        return Buffer.from(arrayBuffer);
    } catch (err) {
        throw err;
    }
}

export async function deleteOldImage(urlPath: string | null): Promise<void> {
    if (!urlPath) return;
    try {
        const filepath = path.join(process.cwd(), "public", urlPath);
        await fs.unlink(filepath);
        console.log(`[ImageProcessor] Hapus file lama: ${urlPath}`);
    } catch {
    }
}

export async function cleanupOldFiles(daysOld = 365): Promise<number> {
    const dirs = ["absensi", "ttd", "bukti"];
    const cutoff = Date.now() - daysOld * 24 * 60 * 60 * 1000;
    let deleted = 0;

    for (const dir of dirs) {
        const dirPath = path.join(CONFIG.UPLOAD_DIR, dir);
        if (!existsSync(dirPath)) continue;

        const files = await fs.readdir(dirPath);
        for (const file of files) {
            const filePath = path.join(dirPath, file);
            const stat = await fs.stat(filePath);
            if (stat.mtimeMs < cutoff) {
                await fs.unlink(filePath);
                deleted++;
            }
        }
    }

    console.log(`[Cleanup] Hapus ${deleted} file lama (>${daysOld} hari)`);
    return deleted;
}