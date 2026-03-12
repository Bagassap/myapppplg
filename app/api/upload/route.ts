import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import {
    processAndSaveImage,
    parseImageFromRequest,
    deleteOldImage,
    type ImageType,
} from "@/lib/image-processor";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id as string;

    try {
        const type = (req.nextUrl.searchParams.get("type") ?? "foto") as ImageType;
        const validTypes: ImageType[] = ["foto", "ttd", "bukti"];
        if (!validTypes.includes(type)) {
            return NextResponse.json(
                { error: "Type tidak valid. Gunakan: foto, ttd, atau bukti" },
                { status: 400 }
            );
        }

        const fieldMap: Record<ImageType, string> = {
            foto: "foto",
            ttd: "tandaTangan",
            bukti: "bukti",
        };

        const buffer = await parseImageFromRequest(req, fieldMap[type]);
        if (!buffer) {
            return NextResponse.json(
                { error: `Field '${fieldMap[type]}' tidak ditemukan` },
                { status: 400 }
            );
        }

        const oldUrl = req.nextUrl.searchParams.get("oldUrl");
        if (oldUrl) await deleteOldImage(oldUrl);

        const result = await processAndSaveImage(buffer, userId, type);

        return NextResponse.json({
            success: true,
            url: result.url,
            filename: result.filename,
            sizeKB: result.sizeKB,
            width: result.width,
            height: result.height,
            message: `Upload berhasil. Ukuran: ${result.sizeKB} KB`,
        });
    } catch (err: any) {
        const isUserError =
            err.message?.includes("Tipe file") ||
            err.message?.includes("terlalu besar");
        return NextResponse.json(
            { error: err.message ?? "Gagal upload gambar" },
            { status: isUserError ? 400 : 500 }
        );
    }
}