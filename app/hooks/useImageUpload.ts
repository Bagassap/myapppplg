"use client";

import { useState, useCallback } from "react";

type ImageType = "foto" | "ttd" | "bukti";

type UploadState = {
    url: string | null;
    sizeKB: number | null;
    uploading: boolean;
    error: string | null;
    preview: string | null;
};

type UseImageUploadReturn = UploadState & {
    upload: (file: File, type: ImageType, oldUrl?: string) => Promise<string | null>;
    reset: () => void;
    previewFile: (file: File) => void;
};

export function useImageUpload(): UseImageUploadReturn {
    const [state, setState] = useState<UploadState>({
        url: null,
        sizeKB: null,
        uploading: false,
        error: null,
        preview: null,
    });

    const previewFile = useCallback((file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            setState((prev) => ({ ...prev, preview: e.target?.result as string }));
        };
        reader.readAsDataURL(file);
    }, []);

    const upload = useCallback(
        async (file: File, type: ImageType, oldUrl?: string): Promise<string | null> => {
            setState((prev) => ({ ...prev, uploading: true, error: null }));

            try {
                previewFile(file);

                const formData = new FormData();
                const fieldMap: Record<ImageType, string> = {
                    foto: "foto",
                    ttd: "tandaTangan",
                    bukti: "bukti",
                };
                formData.append(fieldMap[type], file);

                const params = new URLSearchParams({ type });
                if (oldUrl) params.set("oldUrl", oldUrl);

                const res = await fetch(`/api/upload?${params.toString()}`, {
                    method: "POST",
                    body: formData,
                });

                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data.error ?? "Upload gagal");
                }

                setState((prev) => ({
                    ...prev,
                    url: data.url,
                    sizeKB: data.sizeKB,
                    uploading: false,
                    error: null,
                }));

                return data.url;
            } catch (err: any) {
                const msg = err.message ?? "Upload gagal. Coba lagi.";
                setState((prev) => ({
                    ...prev,
                    uploading: false,
                    error: msg,
                }));
                return null;
            }
        },
        [previewFile]
    );

    const reset = useCallback(() => {
        setState({ url: null, sizeKB: null, uploading: false, error: null, preview: null });
    }, []);

    return { ...state, upload, reset, previewFile };
}
