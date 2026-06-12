import "server-only";

import path from "path";
import fs from "fs/promises";
import { existsSync } from "fs";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

export async function cleanupOldFiles(daysOld = 365): Promise<number> {
    const dirs = ["absensi", "ttd", "bukti"];
    const cutoff = Date.now() - daysOld * 24 * 60 * 60 * 1000;
    let deleted = 0;

    for (const dir of dirs) {
        const dirPath = path.join(UPLOAD_DIR, dir);
        if (!existsSync(dirPath)) continue;

        let files: string[];
        try {
            files = await fs.readdir(dirPath);
        } catch {
            continue;
        }

        for (const file of files) {
            try {
                const filePath = path.join(dirPath, file);
                const stat = await fs.stat(filePath);
                if (stat.mtimeMs < cutoff) {
                    await fs.unlink(filePath);
                    deleted++;
                }
            } catch {
            }
        }
    }

    console.log(`[Cleanup] Hapus ${deleted} file lama (>${daysOld} hari)`);
    return deleted;
}
