import { img, mIcon, RenderingXResult, span } from "@lucsoft/webgen";
import { triggerUpdate } from "../../common/api";
import { list } from "../list";
import { Icon } from "../../data/IconsCache";
import { SideBarType } from "../../types/sidebarTypes";
import { createAction } from "./actions";
import { manualUploadImage, uploadImage } from "../upload";
import { hmsys } from "../views/dashboard";

export function renderVariableView(sidebarX: RenderingXResult<SideBarType>, shell: HTMLElement, icon?: Icon, possiableVariants?: Icon[]) {
    const header = list([
        mIcon("arrow_back_ios_new"),
        span("Variants")
    ], [ "header" ]);
    header.onclick = () => sidebarX.forceRedraw({ showVariableView: false });
    shell.append(header);
    if (possiableVariants && icon?.id && (possiableVariants.length) > 0)
        shell.append(
            span("Recommended", "variants-title"),
            list(possiableVariants.map(x => createNewVariantsIcon(icon.id, x)), [ "variants" ])
        );

    shell.append(
        createAction("add_photo_alternate", "Upload Custom Variant", false, () => uploadCustomVariant(icon!)),
        createAction("filter_b_and_w", "Open Variants Generator")
    )
}
const uploadCustomVariant = (icon: Icon) => {
    manualUploadImage((files) => {
        uploadImage(files!, hmsys, icon.id)
    })
    return undefined;
};
function createNewVariantsIcon(mainIconId: string, icon: Icon) {
    const imageE = img(URL.createObjectURL(icon.data), "alt-preview");
    imageE.onclick = () => triggerUpdate(icon.id, { variantFrom: mainIconId });
    return imageE;
}