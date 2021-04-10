import { custom, img, mIcon, RenderingXResult, span } from "@lucsoft/webgen";
import { triggerUpdate } from "../../common/api";
import { getImageSourceFromIcon } from "../../common/iconData/getImageUrlFromIcon";
import { list } from "../../common/list";
import { Icon } from "../../data/IconsCache";
import { SideBarType } from "../../types/sidebarTypes";

export function renderVariableView(sidebarX: RenderingXResult<SideBarType>, shell: HTMLElement, icon?: Icon, possiableVariants?: Icon[]) {
    const header = list([
        mIcon("arrow_back_ios_new"),
        span("Variants")
    ], [ "header" ]);
    const manuelUploadButton = custom("button", "Select your File", "one");
    const droparea = list([
        span("Drop a new Image here", "firstLine"),
        span("or", "secondLand"),
        custom("center", manuelUploadButton)
    ], [ "drop-area" ]);
    header.onclick = () => sidebarX.forceRedraw({ showVariableView: false });
    shell.append(
        header,
        droparea
    );
    if (possiableVariants && icon?.id && (possiableVariants.length) > 0) {
        shell.append(
            span("Recommended", "variants-title"),
            list(possiableVariants.map(x => createNewVariantsIcon(icon.id, x)), [ "variants" ])
        );
    }
}

function createNewVariantsIcon(mainIconId: string, icon: Icon) {
    const imageE = img(getImageSourceFromIcon(icon), "alt-preview");
    imageE.onclick = () => triggerUpdate(icon.id, { variantFrom: mainIconId });
    return imageE;
}