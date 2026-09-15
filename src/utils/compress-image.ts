export interface CompressOptions {
    /** Max width in pixels (aspect ratio preserved). Default: 1920 */
    maxWidth?: number;
    /** Max height in pixels (aspect ratio preserved). Default: 1920 */
    maxHeight?: number;
    /** Output quality 0–1 (only applies to lossy formats). Default: 0.8 */
    quality?: number;
    /** Output MIME type. Default: "image/jpeg" */
    mimeType?: string;
}

const DEFAULT_OPTIONS: Required<CompressOptions> = {
    maxWidth: 1920,
    maxHeight: 1920,
    quality: 0.8,
    mimeType: "image/jpeg",
};

/** Size threshold below which we skip compression entirely (500 KB) */
const SKIP_THRESHOLD_BYTES = 500 * 1024;

/**
 * Compress an image `File` using the browser Canvas API.
 *
 * - Returns the original file if it's not an image or already small enough.
 * - Returns the original file if compression produces a larger result.
 * - Preserves the original filename (swaps extension to match output MIME).
 */
export async function compressImage(
    file: File,
    options?: CompressOptions,
): Promise<File> {
    // Only process image files
    if (!file.type.startsWith("image/")) {
        return file;
    }

    const opts = { ...DEFAULT_OPTIONS, ...options };

    // Load the image to read its natural dimensions
    const img = await loadImage(file);

    const { width: origW, height: origH } = img;

    // If image is already within bounds AND under the size threshold, skip
    if (
        origW <= opts.maxWidth &&
        origH <= opts.maxHeight &&
        file.size <= SKIP_THRESHOLD_BYTES
    ) {
        return file;
    }

    // Calculate scaled dimensions preserving aspect ratio
    const { width, height } = scaleDimensions(
        origW,
        origH,
        opts.maxWidth,
        opts.maxHeight,
    );

    // Draw onto off-screen canvas
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
        // Fallback: canvas not supported (shouldn't happen in modern browsers)
        return file;
    }

    ctx.drawImage(img, 0, 0, width, height);

    // Export as blob
    const blob = await canvasToBlob(canvas, opts.mimeType, opts.quality);

    // If compressed version is somehow larger, return original
    if (blob.size >= file.size) {
        return file;
    }

    // Build output filename with correct extension
    const ext = mimeToExtension(opts.mimeType);
    const baseName = file.name.replace(/\.[^.]+$/, "");
    const outputName = `${baseName}${ext}`;

    return new File([blob], outputName, {
        type: opts.mimeType,
        lastModified: Date.now(),
    });
}

// ─── Internal helpers ────────────────────────────────────────

function loadImage(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(file);

        img.onload = () => {
            URL.revokeObjectURL(url);
            resolve(img);
        };
        img.onerror = (err) => {
            URL.revokeObjectURL(url);
            reject(err);
        };

        img.src = url; //Actual Loading Happens Here....
    });
}

function scaleDimensions(
    origW: number,
    origH: number,
    maxW: number,
    maxH: number,
): { width: number; height: number } {
    let width = origW;
    let height = origH;

    if (width > maxW) {
        height = Math.round((height * maxW) / width);
        width = maxW;
    }
    if (height > maxH) {
        width = Math.round((width * maxH) / height);
        height = maxH;
    }

    return { width, height };
}

function canvasToBlob(
    canvas: HTMLCanvasElement,
    mimeType: string,
    quality: number,
): Promise<Blob> {
    return new Promise((resolve, reject) => {
        canvas.toBlob(
            (blob) => {
                if (blob) {
                    resolve(blob);
                } else {
                    reject(new Error("Canvas toBlob returned null"));
                }
            },
            mimeType,
            quality,
        );
    });
}

function mimeToExtension(mime: string): string {
    switch (mime) {
        case "image/jpeg":
            return ".jpg";
        case "image/webp":
            return ".webp";
        case "image/png":
            return ".png";
        default:
            return ".jpg";
    }
}
