import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ filename: string[] }> }
) {
    const { filename } = await params;
    const filePath_segments = filename ?? [];

    for (const segment of filePath_segments) {
        if (!segment || segment.includes("..") || segment.includes("\\")) {
            return new NextResponse("Bad Request", { status: 400 });
        }
    }

    const relativePath = filePath_segments.join(path.sep);
    const filePath = path.join(process.cwd(), "public", "uploads", relativePath);
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    if (!filePath.startsWith(uploadsDir)) {
        return new NextResponse("Forbidden", { status: 403 });
    }

    try {
        const fileBuffer = await fs.readFile(filePath);

        const ext = path.extname(relativePath).toLowerCase();
        const mimeTypes: Record<string, string> = {
            ".jpg": "image/jpeg",
            ".jpeg": "image/jpeg",
            ".png": "image/png",
            ".gif": "image/gif",
            ".webp": "image/webp",
            ".pdf": "application/pdf",
        };
        const contentType = mimeTypes[ext] || "application/octet-stream";

        return new NextResponse(fileBuffer, {
            status: 200,
            headers: {
                "Content-Type": contentType,
                "Cache-Control": "public, max-age=31536000",
            },
        });
    } catch {
        return new NextResponse("File not found", { status: 404 });
    }
}