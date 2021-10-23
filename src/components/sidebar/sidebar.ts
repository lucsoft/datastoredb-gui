import { img, Icon as mIcon, span, Dialog, Input, Color, Vertical, Horizontal, ViewOptions } from "@lucsoft/webgen"
import { DataStoreEvents, registerEvent } from "../../common/eventmanager";
import '../../../res/css/sidebar.css';
import { timeAgo } from "../../common/user/date";
import { disableGlobalDragAndDrop, enableGlobalDragAndDrop } from "../dropareas";
import { SideBarType } from "../../types/sidebarTypes";
// import { hmsys } from "../views/dashboard";
import { getPossibleVariants, isVariantFrom } from "../../common/iconData/variants";
import { db, Icon } from "../../data/IconsCache";
import { getImageSourceFromIconOpt } from "../../common/iconData/getImageUrlFromIcon";
import { triggerUpdate } from "../../common/api";
import { renderVariantsView } from "./variantsView";
import { tagComponent } from "./tags";
import { createAction } from "./actions";
import { deleteDialog } from "../dialogs";

export const sidebarDialog = Dialog<SideBarType>((view) => {

    disableGlobalDragAndDrop()

    const { currentIcon, canEdit, username, canRemove, canUpload, showVariantsView: showVariantsView, imageVariants, variantFrom } = view.state;
    const image = img(getImageSourceFromIconOpt(currentIcon), "preview");
    if (!currentIcon) return view.use(span("Something illeagl happend"));
    // const title = use(span(currentIcon?.filename, 'icon-title', canEdit ? 'editable' : 'static'))
    const title = Input({
        color: canEdit ? undefined : Color.Disabled,
        placeholder: "Icon",
        value: currentIcon?.filename ?? "",
        changeOn: handleBlurEventOfIconTitle(currentIcon)
    });
    const details = span(getDetailsText(username, currentIcon, image), 'extra-data');
    image.onload = () => details.innerText = getDetailsText(username, currentIcon, image);
    const add = mIcon('add') as HTMLElement
    add.onclick = () => view.update({ showVariantsView: true })
    const variants = Horizontal({ classes: [ "variants" ] },
        ...(imageVariants ?? []).map(icon => img(URL.createObjectURL(icon.data), 'alt-preview')),
        ...(canUpload && canEdit ? [ add ] : [])
    )

    const optionalData = [];

    if (currentIcon?.variantFrom)
        optionalData.push(
            span('Variants', 'variants-title'),
            variants,
            createAction("file_download", 'Download All Variants', false, handleAllVariantsDownload(currentIcon))
        );
    if (variantFrom)
        optionalData.push(
            createAction("update_disabled", `Remove this Variant from ${variantFrom.filename}`, true, createRemovedRef(currentIcon))
        )
    if (canRemove)
        optionalData.push(
            createAction("delete", "Delete " + currentIcon.filename, true, openDeleteDialog(currentIcon))
        )

    if (showVariantsView) {
        view.use(renderVariantsView(view))
    }
    else
        view.use(Vertical({ classes: [ "shell" ], align: "flex-start", gap: " " },
            image,
            title,
            tagComponent(view, sidebarDialog),
            ...optionalData,
            details
        ))
})
    .addClass("sidebar")
    .allowUserClose()
    .onClose(() => {
        const dia = sidebarDialog.unsafeViewOptions<SideBarType>();
        if (dia.state.canUpload) enableGlobalDragAndDrop();
        dia.update({ showVariantsView: false })
    })

export const registerSidebarEvents = () => {
    const view: () => ViewOptions<SideBarType> = sidebarDialog.unsafeViewOptions;
    registerEvent(DataStoreEvents.ConnectionLost, () => {
        view().update({
            canEdit: false,
            canRemove: false,
            canUpload: false
        })
        disableGlobalDragAndDrop()
    })
    registerEvent(DataStoreEvents.RecivedProfileData, (data) => {
        view().update({
            canUpload: data.canUpload,
            username: data.username,
            canRemove: data.canRemove,
            canEdit: data.canEdit
        })
    })
    registerEvent(DataStoreEvents.RefreshDataComplete, async (data) => {
        const iconId = data.updated?.[ 0 ];
        const dia = view();
        const cachedAllData = await db.icons.toArray();
        const iconData = cachedAllData.find(x => x?.id == iconId);
        if (iconData === undefined) return;

        if (data.updated && iconId && dia.state.currentIcon && dia.state.currentIcon.id == iconId) {
            dia.update({
                currentIcon: iconData,
                possiableVariants: getPossibleVariants(cachedAllData, iconData),
                variantFrom: isVariantFrom(iconData, cachedAllData)
            })
        } else if (iconData.variantFrom == dia.state.currentIcon?.id) {
            dia.update({
                possiableVariants: getPossibleVariants(cachedAllData, cachedAllData.find(x => x.id == iconData.variantFrom)!)
            })
        }
    })
    registerEvent(DataStoreEvents.SidebarUpdate, (data) => {
        const currentState = view().state;
        if (data === undefined) return sidebarDialog.close();
        console.log(data);
        if (typeof data === 'string') {
            if (currentState && currentState.currentIcon && currentState.currentIcon.id == data) sidebarDialog.close();
            return;
        }
        sidebarDialog.open();
        view().update({
            currentIcon: data.currentIcon,
            imageVariants: data.imageVariants,
            variantFrom: data.variantFrom,
            possiableVariants: data.possiableVariants,
            showVariantsView: currentState.currentIcon?.id == data.currentIcon.id ? currentState.showVariantsView : false
        })
    })
}

function getDetailsText(username?: string, icon?: Icon, image?: HTMLImageElement): string {
    return `by ${username ?? "Unknown User"} • ${timeAgo(icon?.date)} • ${icon?.type}@${image?.naturalWidth}x${image?.naturalHeight}`;
}

function handleAllVariantsDownload(icon: Icon): ((this: GlobalEventHandlers, ev: MouseEvent) => any) | null {
    return () => {
        const download = document.createElement('a');
        download.download = "";
        download.href = URL.createObjectURL(icon.data);
        download.download = icon.filename ?? '';
        download.click();
    };
}

function handleBlurEventOfIconTitle(icon?: Icon): ((text: string) => void) {
    return (text) => {
        if (icon && text != icon.filename) triggerUpdate(icon.id, { filename: text })
    };
}

function createRemovedRef(icon: Icon): ((this: GlobalEventHandlers, ev: MouseEvent) => any) | null {
    return () => {
        triggerUpdate(icon.id, { variantFrom: null })
    }
}

function openDeleteDialog(icon: Icon): ((this: GlobalEventHandlers, ev: MouseEvent) => any) | null {
    return () => deleteDialog.open().unsafeViewOptions().update(icon.id);
}
