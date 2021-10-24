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
    image.loading = "eager";
    const details = span(getDetailsText(username, currentIcon, image), 'extra-data');
    image.onload = () => details.innerText = getDetailsText(username, currentIcon, image);
    const optionalData = [];

    if (variantFrom)
        optionalData.push(createAction("file-minus", `Remove this Variant from ${variantFrom.filename}`, true, createRemovedRef(currentIcon)))
    if (canRemove)
        optionalData.push(createAction("file-x", "Delete " + currentIcon.filename, true, openDeleteDialog(currentIcon)))

    if (showVariantsView) view.use(renderVariantsView(view))
    else
        view.use(Vertical({ classes: [ "shell" ], align: "flex-start", gap: " " },
            image,
            titleComponent(currentIcon, canEdit, view, openTitleEdit),
            tagComponent(currentIcon, canEdit ?? false, view, sidebarDialog),
            span('Variants', 'variants-title'),
            variantsComponent(imageVariants, canUpload, canEdit, view),
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
    registerEvent(DataStoreEvents.SyncIconUpdate, async (data) => {
        const dia = sidebarDialog.unsafeViewOptions<SideBarType>();
        const currentIcon = data.find(x => x.id == dia.state.currentIcon?.id);
        const iconIsVariantFromCurrentIcon = data.find(x => x.variantFrom == dia.state.currentIcon?.id);
        const cachedAllData = await db.icons.toArray();
        if (!(currentIcon || iconIsVariantFromCurrentIcon)) return;

        if (currentIcon) {
            dia.update({
                currentIcon: currentIcon,
                possiableVariants: getPossibleVariants(cachedAllData, currentIcon),
                variantFrom: isVariantFrom(currentIcon, cachedAllData)
            })
        } else if (iconIsVariantFromCurrentIcon) {
            dia.update({
                possiableVariants: getPossibleVariants(cachedAllData, iconIsVariantFromCurrentIcon)
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

function variantsComponent(imageVariants: Icon[] | undefined, canUpload: boolean | undefined, canEdit: boolean | undefined, view: ViewOptions<SideBarType>) {
    return Horizontal({ classes: [ "variants" ] }, ...nullish(
        ...imageVariants?.map(icon => {
            const imageIcon = img(URL.createObjectURL(icon.data), 'alt-preview');
            imageIcon.onclick = () => sidebarOpenIcon(icon);
            return imageIcon;
        }) ?? [],
        canUpload && canEdit
            ? IconButton({
                icon: "plus",
                clickOn: () => view.update({ showVariantsView: true })
            })
            : null
    ));
}

function titleComponent(currentIcon: Icon, canEdit: boolean | undefined, view: ViewOptions<SideBarType>, openTitleEdit: boolean | undefined) {
    const staticTitle = span(currentIcon?.filename, 'icon-title', canEdit ? "editable" : "noeditable");
    staticTitle.onclick = () => canEdit ? view.update({ openTitleEdit: true }) : null;
    const title = openTitleEdit ? Input({
        placeholder: "Icon",
        value: currentIcon?.filename ?? "",
        autoFocus: true,
        blurOn: handleBlurEventOfIconTitle(currentIcon)
    }) : staticTitle;
    return title;
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
