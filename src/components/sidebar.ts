import { Card, conditionalCSSClass, createElement, custom, DialogActionAfterSubmit, img, input, mIcon, RenderElement, RenderingX, RenderingXResult, span } from "@lucsoft/webgen"
import { DataStoreEvents, emitEvent, registerEvent } from "../common/eventmanager";
import '../../res/css/sidebar.css';
import { timeAgo } from "../common/date";
import { disableGlobalDragAndDrop, enableGlobalDragAndDrop } from "./dropareas";
import { SidebarNormalData, SideBarType } from "../types/sidebarTypes";
import { hmsys } from "../dashboard";
import { getStoredData } from "../common/refreshData";
import { getPossibleVariants, isVariantFrom } from "../common/iconData/variants";
import { Icon } from "../data/IconsCache";
import { getImageSourceFromIcon, getImageSourceFromIconOpt } from "../common/iconData/getImageUrlFromIcon";
import { triggerUpdate } from "../common/api";
import { renderVariableView } from "./sidebar/variableView";
import { sidebarGenerateTags } from "./sidebar/tags";


export const createSidebar = (web: RenderingX): RenderElement => {

    return {
        draw: () => {
            const sidebar = createElement('article')
            sidebar.classList.add('sidebar');
            sidebar.tabIndex = 0;

            const shell = custom('div', undefined, 'shell')
            document.body.addEventListener('click', (e) => {
                // TODO Switch to a backdrop to get the a simpler click event thing
                if (![ document.body,
                document.querySelector('.incident-shell'),
                document.querySelector('.image-list'),
                document.querySelector('.homebar'),
                document.querySelector('.masterShell article'),
                ...document.querySelectorAll('.image-list *'),
                ...document.querySelectorAll('.homebar *')
                ].includes(e.target as Element)) return
                if (sidebarX.getState().canUpload) enableGlobalDragAndDrop();

                sidebarX.forceRedraw({
                    showSidebar: false,
                    showVariableView: false
                })
                sidebar.classList.remove('open')

            })
            const sidebarX = web.toCustom({ shell: sidebar }, {} as SideBarType, [
                ({ currentIcon, canEdit, username, canRemove, canUpload, offset, showSidebar, showVariableView, editTags, imageVariants, variantFrom, possiableVariants }) => Card({}, {
                    getSize: () => ({}),
                    draw: (card) => {

                        const image = img(getImageSourceFromIconOpt(currentIcon), 'preview')
                        const title = span(currentIcon?.filename, 'icon-title', canEdit ? 'editable' : 'static')
                        const details = span(getDetailsText(username, currentIcon, image), 'extra-data');
                        title.contentEditable = canEdit ? "true" : "false";
                        title.onblur = handleBlurEventOfIconTitle(title, currentIcon)
                        const taglist = custom('ul', undefined, 'tags-list')
                        taglist.innerHTML = "";

                        if (offset && showSidebar) updatePosition(sidebar, offset)
                        conditionalCSSClass(sidebar, showSidebar, 'open')
                        taglist.append(...sidebarGenerateTags(() => sidebarX, currentIcon, canEdit, editTags))
                        if (showSidebar) sidebar.focus();
                        image.onload = () => details.innerText = getDetailsText(username, currentIcon, image);

                        const add = mIcon('add')
                        const variantsList = custom('div', add, 'variants')
                        variantsList.innerHTML = "";
                        if (imageVariants) variantsList.append(...imageVariants.map(icon => img(getImageSourceFromIcon(icon), 'alt-preview')))
                        if (canUpload) variantsList.append(add)
                        add.onclick = () => sidebarX.forceRedraw({ showVariableView: true })

                        conditionalCSSClass(title, (currentIcon?.filename?.length ?? 0) > 20, 'small')
                        shell.innerHTML = "";
                        if (showVariableView) renderVariableView(sidebarX, shell, currentIcon, possiableVariants);
                        else {
                            shell.append(
                                image,
                                title,
                                taglist)
                            if (currentIcon && !currentIcon?.variantFrom)
                                shell.append(
                                    span('Variants', 'variants-title'),
                                    variantsList,
                                    createAction("file_download", 'Download All Variants', false, handleAllVariantsDownload(currentIcon))
                                )
                            else if (variantFrom && currentIcon)
                                shell.append(
                                    createAction("update_disabled", `Remove this Variant from ${variantFrom.filename}`, true, createRemovedRef(currentIcon))
                                )
                            if (canRemove && currentIcon)
                                shell.append(createAction("delete", "Delete " + currentIcon.filename, true, createDeleteDialog(web, currentIcon)))
                            shell.append(details)
                        }

                        card.append(shell)
                        return card;
                    }
                })
            ])
            registerEvent(DataStoreEvents.ConnectionLost, () => {
                sidebarX.forceRedraw({
                    canEdit: false,
                    canRemove: false,
                    canUpload: false
                })
                disableGlobalDragAndDrop()
            })
            registerEvent(DataStoreEvents.RecivedProfileData, (data) => {
                sidebarX.forceRedraw({
                    canUpload: data.canUpload,
                    username: data.username,
                    canRemove: data.canRemove,
                    canEdit: data.canEdit
                })
            })
            registerEvent(DataStoreEvents.RefreshDataComplete, async (data) => {
                const iconId = data.updated?.[ 0 ];
                const state = sidebarX.getState();

                const cachedAllData = await getStoredData();
                const iconData = cachedAllData.find(x => x.id == iconId);
                if (iconData === undefined) return;

                if (data.updated && iconId && state.currentIcon && state.currentIcon.id == iconId) {
                    sidebarX.forceRedraw({
                        currentIcon: iconData,
                        possiableVariants: getPossibleVariants(cachedAllData, iconData),
                        variantFrom: isVariantFrom(iconData, cachedAllData),
                    })
                } else if (iconData.variantFrom == state.currentIcon?.id) {
                    sidebarX.forceRedraw({
                        possiableVariants: getPossibleVariants(cachedAllData, cachedAllData.find(x => x.id == iconData.variantFrom)!)
                    })
                }
            })
            addEventListener('resize', () => {
                const state = sidebarX.getState();
                if (state?.showSidebar && state.offset && matchMedia('(min-width: 700px)').matches) updatePosition(sidebar, state.offset)
            }, { passive: true })
            registerEvent(DataStoreEvents.SidebarUpdate, (data) => {
                const currentState = sidebarX.getState();
                if (data === undefined) {
                    if (sidebarX.getState().canUpload) enableGlobalDragAndDrop();
                    sidebarX.forceRedraw({ showSidebar: false, showVariableView: false })
                    return;
                }
                if (typeof data === 'string') {
                    if (currentState && currentState.currentIcon && currentState.currentIcon.id == data) {
                        if (sidebarX.getState().canUpload) enableGlobalDragAndDrop();
                        sidebarX.forceRedraw({ showSidebar: false, showVariableView: false })
                    }
                    return;
                }
                disableGlobalDragAndDrop()
                console.log(data.possiableVariants, data.currentIcon);
                sidebarX.forceRedraw({
                    showSidebar: true,
                    currentIcon: data.currentIcon,
                    imageVariants: data.imageVariants,
                    variantFrom: data.variantFrom,
                    showVariableView: currentState.currentIcon?.id == data.currentIcon.id ? currentState.showVariableView : false,
                    possiableVariants: data.possiableVariants,
                    offset: data.offset
                })
            })
            return sidebar;
        }
    }

}

const updatePosition = (sidebar: HTMLElement, data: SidebarNormalData[ "offset" ]) => {
    const offset = data();
    const normal = document.body.offsetWidth - (offset.left + 320) > 0;
    sidebar.style.top = offset.top + "px";
    sidebar.style.left = (offset.left - (normal ? 0 : 365)) + "px";
    conditionalCSSClass(sidebar, !normal && matchMedia('(min-width: 700px)').matches, 'right')
}

const createAction = (icon: string, text: string, isRed?: boolean, onClick?: null | ((this: GlobalEventHandlers, ev: MouseEvent) => any)) => {
    const element = custom('span', undefined, 'action', isRed ? 'red' : 'black')
    if (onClick)
        element.onclick = onClick;
    element.append(mIcon(icon), span(text, 'label'))
    return element;
}

function getDetailsText(username?: string, icon?: Icon, image?: HTMLImageElement): string {
    return `by ${username} • ${timeAgo(icon?.date)} • ${icon?.type}@${image?.naturalWidth}x${image?.naturalHeight}`;
}

function handleAllVariantsDownload(icon: Icon): ((this: GlobalEventHandlers, ev: MouseEvent) => any) | null {
    return () => {
        const download = document.createElement('a');
        download.download = "";
        download.href = getImageSourceFromIcon(icon);
        download.download = icon.filename ?? '';
        download.click();
    };
}

function handleBlurEventOfIconTitle(title: HTMLElement, icon?: Icon): ((this: GlobalEventHandlers, ev: FocusEvent) => any) | null {
    return () => {
        if (icon && title.innerText != icon.filename)
            triggerUpdate(icon.id, { filename: title.innerText })
    };
}

function createRemovedRef(icon: Icon): ((this: GlobalEventHandlers, ev: MouseEvent) => any) | null {
    return () => {
        triggerUpdate(icon.id, { variantFrom: null })
    }
}

function createDeleteDialog(web: RenderingX, icon: Icon): ((this: GlobalEventHandlers, ev: MouseEvent) => any) | null {
    return () => web.toDialog({
        title: 'Are you sure?',
        userRequestClose: () => DialogActionAfterSubmit.RemoveClose,
        content: span('Deleteing this File will be gone forever. (wich is a very long time)'),
        buttons: [
            [ 'closed', DialogActionAfterSubmit.RemoveClose ],
            [ 'Delete', () => {
                hmsys.api.trigger("@HomeSYS/DataStoreDB", { type: "removeFile", id: icon.id });
                return DialogActionAfterSubmit.RemoveClose;
            }
            ]
        ]
    }).open();
}
