import { img, mIcon, RenderingXResult, span } from "@lucsoft/webgen";
import { getFilterMode, triggerUpdate } from "../../common/api";
import { list } from "../list";
import { db, Icon } from "../../data/IconsCache";
import { SideBarType } from "../../types/sidebarTypes";
import { createAction } from "./actions";
import { manualUploadImage, uploadImage } from "../upload";
import { hmsys } from "../views/dashboard";
import { imageGen, VariantsGeneratorDialog } from "./variantsGenerator";
import { DataStoreEvents, emitEvent } from "../../common/eventmanager";

export function renderVariantsView(sidebarX: RenderingXResult<SideBarType>, shell: HTMLElement, icon: Icon, possiableVariants: Icon[], generator: VariantsGeneratorDialog) {
    const header = list([
        mIcon("arrow_back_ios_new"),
        span("Variants")
    ], [ "header" ]);
    header.onclick = () => sidebarX.forceRedraw({ showVariantsView: false });
    shell.append(header);
    if (possiableVariants && icon?.id && (possiableVariants.length) > 0)
        shell.append(
            span("Recommended", "variants-title"),
            list(possiableVariants.map(x => createNewVariantsIcon(icon.id, x)), [ "variants" ])
        );

    shell.append(createAction("add_photo_alternate", "Upload Custom Variant", false, () => uploadCustomVariant(icon!)))

    const image = new Image()
    new Promise(done => { image.onload = done; image.src = URL.createObjectURL(icon.data) }).then(() => {
        const mapDatatoGeneratorList = (x: Icon): imageGen => ({ title: x.filename.replace('overlay', '').trim(), image: x.data, selected: false });
        shell.append(createAction("filter_b_and_w", "Open Variants Generator", false, async () => {

            var data = await db.icons.filter(x => x.tags.includes('overlay') && x.tags.includes('basic')).filter(x => x.variantFrom == undefined).toArray();
            generator.data.forceRedraw({ from: icon, target: icon, normal: data.map(mapDatatoGeneratorList) })
            data.push(await (new Promise(async (done) => {
                const canvasE = document.createElement('canvas')
                const canvas = canvasE.getContext('2d');
                canvasE.width = 16;
                canvasE.height = 16;
                const image = new Image()
                await new Promise(done => loadImageThenRenderItOnCanvas(image, done, icon));
                canvas?.drawImage(image, 0, 0, 0, 0);
                canvasE.toBlob((blob) => done({ ...icon, filename: icon.filename, data: BlobToFile(blob, icon, 's') } as Icon))
            })));
            data = await Promise.all(data.map((x): Promise<Icon> => new Promise(async (done) => {
                const canvasE = document.createElement('canvas')
                const canvas = canvasE.getContext('2d');
                canvasE.width = 16;
                canvasE.height = 16;
                const image = new Image()
                await new Promise(done => loadImageThenRenderItOnCanvas(image, done, icon));
                canvas?.drawImage(image, 0, 0, 16, 16);
                await new Promise(done => loadImageThenRenderItOnCanvas(image, done, x));
                canvas?.drawImage(image, 0, 0, 16, 16);
                canvasE.toBlob((blob) => done({ ...x, data: BlobToFile(blob, icon, x.filename) }))
            })));
            data.push(await (new Promise(async (done) => {
                const canvasE = document.createElement('canvas')
                const canvas = canvasE.getContext('2d')!;
                canvasE.width = 16;
                canvasE.height = 16;
                const image = new Image()
                await new Promise(done => loadImageThenRenderItOnCanvas(image, done, icon));
                canvas.drawImage(image, 0, 0, 11, 11);
                canvas.drawImage(image, 5, 5, 11, 11);
                canvasE.toBlob((blob) => done({ ...icon, filename: icon.filename + 's', data: BlobToFile(blob, icon, 's') } as Icon))
            })));
            generator.data.forceRedraw({ normal: data.map(mapDatatoGeneratorList) })
            data = await Promise.all(data.map((x): Promise<Icon> => new Promise(async (done) => {
                const canvasE = document.createElement('canvas')
                const canvas = canvasE.getContext('2d')!;
                canvasE.width = 16;
                canvasE.height = 16;
                const image = new Image()
                canvas.globalAlpha = getFilterMode()[ 1 ];
                canvas.filter = getFilterMode()[ 2 ];

                await new Promise(done => loadImageThenRenderItOnCanvas(image, done, icon));
                canvas.drawImage(image, 0, 0);
                canvasE.toBlob((blob) => done({ ...x, data: BlobToFile(blob, icon, x.filename) }))
            })));
            generator.data.forceRedraw({ disabled: data.map(mapDatatoGeneratorList) })
            generator.dialog.open();
        }))
    });


}
const uploadCustomVariant = (icon: Icon) => {
    manualUploadImage((files) => uploadImage(files!, hmsys, icon.id))
    emitEvent(DataStoreEvents.SidebarUpdate, undefined);
    return undefined;
};
function loadImageThenRenderItOnCanvas(image: HTMLImageElement, done: (value: unknown) => void, icon: Icon) {
    image.onload = done; image.src = URL.createObjectURL(icon.data);
}

function BlobToFile(blob: Blob | null, icon: Icon, filename: string): File {
    return new File([ blob! ], (icon.filename + " " + filename.replace('overlay', '')).trim(), { type: "image/png" });
}

function createNewVariantsIcon(mainIconId: string, icon: Icon) {
    const imageE = img(URL.createObjectURL(icon.data), "alt-preview");
    imageE.onclick = () => triggerUpdate(icon.id, { variantFrom: mainIconId });
    return imageE;
}