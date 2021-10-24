import { img, span, Dialog, Input, Vertical, Horizontal, ViewOptions, nullish, IconButton } from "@lucsoft/webgen"
import { DataStoreEvents, registerEvent } from "../../common/eventmanager";
import '../../../res/css/sidebar.css';
import { timeAgo } from "../../common/user/date";
import { disableGlobalDragAndDrop, enableGlobalDragAndDrop } from "../dropareas";
import { SideBarType } from "../../types/sidebarTypes";
import { getPossibleVariants, isVariantFrom } from "../../common/iconData/variants";
import { db, Icon } from "../../data/IconsCache";
import { getImageSourceFromIconOpt } from "../../common/iconData/getImageUrlFromIcon";
import { triggerUpdate } from "../../common/api";
import { renderVariantsView } from "./variantsView";
import { tagComponent } from "./tags";
import { createAction } from "./actions";
import { deleteDialog } from "../dialogs";
import { sidebarOpenIcon } from "../../logic/openIcon";

export const sidebarDialog = Dialog<SideBarType>((view) => {
    const { currentIcon, canEdit, username, canRemove, canUpload, showVariantsView: showVariantsView, imageVariants, variantFrom, openTitleEdit } = view.state;
    if (!currentIcon) return view.use(span("Something illeagl happend"));
    disableGlobalDragAndDrop()
    const image = img(getImageSourceFromIconOpt(currentIcon), "preview");

    const staticTitle = span(currentIcon?.filename, 'icon-title', canEdit ? "editable" : "noeditable");
    staticTitle.onclick = () => canEdit ? view.update({ openTitleEdit: true }) : null;
    const title = openTitleEdit ? Input({
        placeholder: "Icon",
        value: currentIcon?.filename ?? "",
        autoFocus: true,
        blurOn: handleBlurEventOfIconTitle(currentIcon)
    }) : staticTitle;
    const details = span(getDetailsText(username, currentIcon, image), 'extra-data');
    image.loading = "eager";
    image.onload = () => details.innerText = getDetailsText(username, currentIcon, image);
    const variants = Horizontal({ classes: [ "variants" ] }, ...nullish(
        ...imageVariants?.map(icon => {
            const imageIcon = img(URL.createObjectURL(icon.data), 'alt-preview');
            imageIcon.onclick = () => sidebarOpenIcon(icon)
            return imageIcon;
        }) ?? [],
        canUpload && canEdit
            ? IconButton({
                icon: "plus",
                clickOn: () => view.update({ showVariantsView: true })
            })
            : null
    ))

    const optionalData = [];
    if (variantFrom)
        optionalData.push(
            createAction("file-minus", `Remove this Variant from ${variantFrom.filename}`, true, createRemovedRef(currentIcon))
        )
    if (canRemove)
        optionalData.push(
            createAction("file-x", "Delete " + currentIcon.filename, true, openDeleteDialog(currentIcon))
        )

    if (showVariantsView) {
        view.use(renderVariantsView(view))
    }
    else
        view.use(Vertical({ classes: [ "shell" ], align: "flex-start", gap: " " },
            image,
            title,
            tagComponent(currentIcon, canEdit ?? false, view, sidebarDialog),
            span('Variants', 'variants-title'),
            variants,
            createAction("file-arrow-down", 'Download All Variants', false, handleAllVariantsDownload(currentIcon)),
            ...optionalData,
            details
        ))
})
    .addClass("sidebar")
    .allowUserClose()
    .onClose(() => {
        const dia = sidebarDialog.unsafeViewOptions<SideBarType>();
        dia.update({ showVariantsView: false, editTags: false, openTitleEdit: false })
        if (dia.state.canUpload) enableGlobalDragAndDrop();
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
        sidebarDialog.unsafeViewOptions<SideBarType>().update({ openTitleEdit: false })
        if (icon && text != icon.filename) triggerUpdate(icon.id, { filename: text })
    };
}

function createRemovedRef(icon: Icon): ((this: GlobalEventHandlers, ev: MouseEvent) => any) | null {
    return () => {
        triggerUpdate(icon.id, { variantFrom: null })
    }
}

function openDeleteDialog(icon: Icon): ((this: GlobalEventHandlers, ev: MouseEvent) => any) | null {
    return () => {
        sidebarDialog.close();
        deleteDialog.open().unsafeViewOptions<{ id: string }>().update({ id: icon.id });
    }
}
