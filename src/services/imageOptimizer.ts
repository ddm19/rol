export type OptimizedImage = {
    blob: Blob;
    extension: 'webp' | 'jpg';
};

const WEBP_TYPE = 'image/webp';
const JPEG_TYPE = 'image/jpeg';

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob | null> {
    return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

export async function optimizeImage(source: Blob, maxWidth: number, quality: number): Promise<OptimizedImage> {
    const bitmap = await createImageBitmap(source);
    const scale = Math.min(1, maxWidth / bitmap.width);
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);

    const context = canvas.getContext('2d');
    if (!context) throw new Error('No se pudo procesar la imagen');
    context.imageSmoothingQuality = 'high';
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();

    const webp = await canvasToBlob(canvas, WEBP_TYPE, quality);
    if (webp && webp.type === WEBP_TYPE) return { blob: webp, extension: 'webp' };

    const jpeg = await canvasToBlob(canvas, JPEG_TYPE, quality);
    if (!jpeg) throw new Error('No se pudo convertir la imagen');
    return { blob: jpeg, extension: 'jpg' };
}
