import { getFilterMode } from "../common/api";
import { Icon } from "../data/IconsCache";

export function variantRaw(icon: Icon): Promise<Icon> {
    return new Promise(async (done) => {
        const { image, canvas, canvasE } = getCanvas();
        await loadImageThenRenderItOnCanvas(image, icon);
        canvas?.drawImage(image, 0, 0, 0, 0);
        canvasE.toBlob((blob) => done({ ...icon, filename: icon.filename, data: BlobToFile(blob, icon, 's') } as Icon));
    });
}

export function variantDisabled(x: Icon, icon: Icon): Promise<Icon> {
    return new Promise(async done => {
        const { image, canvas, canvasE } = getCanvas();
        canvas.globalAlpha = getFilterMode()[ 1 ];
        canvas.filter = getFilterMode()[ 2 ];
        await loadImageThenRenderItOnCanvas(image, x);
        canvas.drawImage(image, 0, 0);
        canvasE.toBlob((blob) => done({ ...x, data: BlobToFile(blob, icon, x.filename) }));
    });
}

export function variantOverlay(icon: Icon, overlay: Icon): Promise<Icon> {
    return new Promise(async (done) => {
        const { image, canvas, canvasE } = getCanvas();
        await loadImageThenRenderItOnCanvas(image, icon);
        canvas.drawImage(image, 0, 0, 16, 16);
        await loadImageThenRenderItOnCanvas(image, overlay);
        canvas.drawImage(image, 0, 0, 16, 16);
        canvasE.toBlob((blob) => done({ ...overlay, data: BlobToFile(blob, icon, overlay.filename) }));
    });
}

export function variantDuplicate(icon: Icon): Icon | PromiseLike<Icon> {
    return new Promise(async (done) => {
        const { image, canvas, canvasE } = getCanvas();
        await loadImageThenRenderItOnCanvas(image, icon);
        canvas.drawImage(image, 0, 0, 11, 11);
        canvas.drawImage(image, 5, 5, 11, 11);
        canvasE.toBlob((blob) => done({ ...icon, filename: icon.filename + 's', data: BlobToFile(blob, icon, 's') } as Icon));
    });
}

function getCanvas() {
    const canvasE = document.createElement('canvas');
    const canvas = canvasE.getContext('2d')!;
    canvasE.width = 16;
    canvasE.height = 16;
    const image = new Image();
    return { image, canvas, canvasE };
}

function loadImageThenRenderItOnCanvas(image: HTMLImageElement, icon: Icon) {
    return new Promise(done => {
        image.onload = done; image.src = URL.createObjectURL(icon.data);
    })
}

function BlobToFile(blob: Blob | null, icon: Icon, filename: string): File {
    return new File([ blob! ], (icon.filename + " " + filename.replace('overlay', '')).trim(), { type: "image/png" });
}