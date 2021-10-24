import { img, Icon as mIcon, span, draw, Component, Horizontal, Vertical, ViewOptions } from "@lucsoft/webgen";
import { triggerUpdate } from "../../common/api";
import { db, Icon } from "../../data/IconsCache";
import { createAction } from "./actions";
import { manualUploadImage, uploadImage } from "../upload";
import { hmsys } from "../views/dashboard";
import { imageGen, VariantsGeneratorDialog } from "./variantsGenerator";
import { DataStoreEvents, emitEvent } from "../../common/eventmanager";
import { variantDisabled, variantDuplicate, variantOverlay, variantRaw } from "../../logic/imageTransfromer";
import { SideBarType } from "../../types/sidebarTypes";
import { sidebarDialog } from "./sidebar";

export function renderVariantsView(main: ViewOptions<SideBarType>): Component {
    const optionalData = [];
    const { currentIcon: icon, possiableVariants } = main.state;
    if (!icon) throw new Error("Invalid");
    const header = draw(Horizontal({
        classes: [ "header" ],
        align: "flex-start"
    },
        draw(mIcon("chevron-left")),
        span("Variants")));

    header.onclick = () => main.update({ showVariantsView: false });

    if (possiableVariants && icon?.id && (possiableVariants.length) > 0)
        optionalData.push(
            span("Recommended", "variants-title"),
            Horizontal({ classes: [ "variants" ] }, ...possiableVariants.map(x => createNewVariantsIcon(icon.id, x)))
        )

    return Vertical({ margin: "-0.5rem 1rem 0.5rem" },
        header,
        ...optionalData,
        createAction("file-arrow-up", "Upload Custom Variant", false, () => uploadCustomVariant(icon!)),
        createAction("file-earmark-image", "Open Variants Generator", false, async () => {
            sidebarDialog.close()
            const mapDatatoGeneratorList = await buildGenartorList(icon);
            var data = await db.icons.filter(x => x.tags.includes('overlay') && x.tags.includes('basic')).filter(x => x.variantFrom == undefined).toArray();
            VariantsGeneratorDialog.unsafeViewOptions()!.update({ from: icon, target: icon, normal: data.map(mapDatatoGeneratorList) })
            data.push(await variantRaw(icon));
            data = await Promise.all(data.map((overlay) => variantOverlay(icon, overlay)));
            data.push(await variantDuplicate(icon));
            VariantsGeneratorDialog
                .open()
                .unsafeViewOptions()
                .update({
                    normal: data.map(mapDatatoGeneratorList),
                    disabled: (await Promise.all(data.map((x) => variantDisabled(x, icon)))).map(mapDatatoGeneratorList)
                })
        })
    )

}
const uploadCustomVariant = (icon: Icon) => {
    manualUploadImage((files) => uploadImage(files!, hmsys, icon.id))
    emitEvent(DataStoreEvents.SidebarUpdate, undefined);
    return undefined;
};

async function buildGenartorList(icon: Icon) {
    const image = new Image();
    await new Promise(done => { image.onload = done; image.src = URL.createObjectURL(icon.data); });
    const mapDatatoGeneratorList = (x: Icon): imageGen => ({ title: x.filename.replace('overlay', '').trim(), image: x.data, selected: false });
    return mapDatatoGeneratorList;
}

function createNewVariantsIcon(mainIconId: string, icon: Icon) {
    const imageE = img(URL.createObjectURL(icon.data), "alt-preview");
    imageE.onclick = () => triggerUpdate(icon.id, { variantFrom: mainIconId });
    return imageE;
}