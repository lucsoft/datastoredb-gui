import { img, mIcon, RenderingXResult, span } from "@lucsoft/webgen";
import { triggerUpdate } from "../../common/api";
import { getImageSourceFromIcon } from "../../common/iconData/getImageUrlFromIcon";
import { list } from "../../common/list";
import { Icon } from "../../data/IconsCache";
import { SideBarType } from "../../types/sidebarTypes";
import { createAction } from "./actions";

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
        createAction("add_photo_alternate", "Upload Custom Variant"),
        createAction("filter_b_and_w", "Open Variants Generator")
    )
}

function createNewVariantsIcon(mainIconId: string, icon: Icon) {
    const imageE = img(getImageSourceFromIcon(icon), "alt-preview");
    imageE.onclick = () => triggerUpdate(icon.id, { variantFrom: mainIconId });
    return imageE;
}