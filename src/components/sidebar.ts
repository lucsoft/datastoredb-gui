import { Card, conditionalCSSClass, createElement, custom, DialogActionAfterSubmit, img, input, mIcon, RenderElement, RenderingX, RenderingXResult, span } from "@lucsoft/webgen"
import { DataStoreEvents, emitEvent, registerEvent } from "../common/eventmanager";
import '../../res/css/sidebar.css';
import { timeAgo } from "../common/date";
import { disableGlobalDragAndDrop, enableGlobalDragAndDrop } from "./dropareas";
import { SidebarNormalData } from "../types/sidebarTypes";
import { hmsys } from "../dashboard";
import { getStoredData } from "../common/refreshData";
import { list } from "../common/list";

type SideBarType = {
    showVariableView?: boolean
    showSidebar?: boolean
    iconTitle?: string
    id?: string
    imageBlobUrl?: string
    imageType?: string
    lastUpdated?: number
    editTags?: boolean
    tags?: string[]
    imageVariants?: string[]
    isVariantFrom?: [ id: string, url: string, name: string ]
    possiableVariants?: [ id: string, url: string, name: string ][]
    offset?: SidebarNormalData[ "offset" ]
    canUpload?: boolean
    username?: string
    canRemove?: boolean
    canEdit?: boolean
};
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
                (state) => Card({}, {
                    getSize: () => ({}),
                    draw: (card) => {

                        const image = img(state.imageBlobUrl, 'preview')
                        const title = span(state.iconTitle, 'icon-title', state.canEdit ? 'editable' : 'static')
                        const details = span(`by ${state.username} • ${timeAgo(state.lastUpdated)} • ${state.imageType}@${image.naturalWidth}x${image.naturalHeight}`, 'extra-data');
                        title.contentEditable = state.canEdit ? "true" : "false";
                        title.onblur = handleBlurEventOfIconTitle(title, state)
                        const taglist = custom('ul', undefined, 'tags-list')
                        taglist.innerHTML = "";

                        if (state.offset && state.showSidebar)
                            updatePosition(sidebar, state.offset!)
                        conditionalCSSClass(sidebar, state.showSidebar, 'open')
                        taglist.append(...createTags(() => sidebarX, state))
                        if (state.showSidebar) sidebar.focus();
                        image.onload = () => details.innerText = `by ${state.username} • ${timeAgo(state.lastUpdated)} • ${state.imageType}@${image.naturalWidth}x${image.naturalHeight}`;

                        const add = mIcon('add')
                        const variantsList = custom('div', add, 'variants')
                        variantsList.innerHTML = "";
                        if (state.imageVariants) variantsList.append(...state.imageVariants.map(src => img(src, 'alt-preview')))
                        if (state.canUpload) variantsList.append(add)
                        add.onclick = () => sidebarX.forceRedraw({ showVariableView: true })

                        conditionalCSSClass(title, (state.iconTitle?.length ?? 0) > 20, 'small')
                        shell.innerHTML = "";
                        if (state.showVariableView) {
                            renderVariableView(sidebarX, shell, state);
                        } else {
                            shell.append(
                                image,
                                title,
                                taglist)
                            if (!state.isVariantFrom)
                                shell.append(
                                    span('Variants', 'variants-title'),
                                    variantsList,
                                    createAction("file_download", 'Download All Variants', false, handleAllVariantsDownload(state))
                                )
                            else
                                shell.append(
                                    createAction("update_disabled", `Remove this Variant from ${state.isVariantFrom[ 2 ]}`, true)
                                )
                            if (state.canRemove)
                                shell.append(createAction("delete", "Delete " + state.iconTitle, true, createDeleteDialog(web, state)))
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

                if (data.updated && iconId && state.id == iconId) {
                    const iconData = (await getStoredData()).find(x => x.id == iconId);

                    sidebarX.forceRedraw({
                        iconTitle: iconData?.filename,
                        tags: iconData?.tags,
                        lastUpdated: iconData?.date
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
                    if (currentState && currentState.id && currentState.id == data) {
                        if (sidebarX.getState().canUpload) enableGlobalDragAndDrop();
                        sidebarX.forceRedraw({ showSidebar: false, showVariableView: false })
                    }
                    return;
                }
                disableGlobalDragAndDrop()
                sidebarX.forceRedraw({
                    showSidebar: true,
                    iconTitle: data.displayName,
                    imageBlobUrl: data.image,
                    id: data.id,
                    tags: data.tags,
                    lastUpdated: data.date,
                    imageType: data.type,
                    imageVariants: data.alts,
                    isVariantFrom: data.isVariantFrom,
                    showVariableView: currentState.id == data.id ? currentState.showVariableView : false,
                    possiableVariants: data.possiableAlts,
                    offset: data.offset
                })
            })
            return sidebar;
        }
    }

}

const createTags = (sidebarX: () => RenderingXResult<SideBarType>, state: SideBarType) => {
    const add = state.canEdit == true ? mIcon('edit') : ""
    if (add)
        add.onclick = () => sidebarX().forceRedraw({ editTags: true })
    if (state.editTags != true && state.tags)
        return [ ...state.tags.map(x => {
            const tag = span('#' + x)
            tag.onclick = () => {
                sidebarX().forceRedraw({
                    showSidebar: false,
                    showVariableView: false
                })
                emitEvent(DataStoreEvents.SearchBarAddTag, x);
            }
            return tag
        }), add ];
    else if (state.editTags == true) {
        const tagsInput = input({
            value: state.tags?.join(' ')
        })
        tagsInput.autofocus = true;
        tagsInput.onblur = () => {
            const newData = tagsInput.value.split(/_| |-|%20|,/)
            if (JSON.stringify(newData) != JSON.stringify(state.tags))
                hmsys.api.trigger('@HomeSYS/DataStoreDB', { type: "updateFile", id: state.id, tags: newData })
            sidebarX().forceRedraw({
                editTags: false
            })
        }
        return [ tagsInput ];
    }
    else
        return [ add ];
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

function renderVariableView(sidebarX: RenderingXResult<SideBarType>, shell: HTMLElement, state: SideBarType) {
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
    console.log(state.possiableVariants);
    if (state.possiableVariants && (state.possiableVariants.length) > 0) {
        shell.append(
            span("Recommended", "variants-title"),
            list(state.possiableVariants.map(x => img(x[ 1 ], "alt-preview")), [ "variants" ])
        );
    }
}

function handleAllVariantsDownload(state: SideBarType): ((this: GlobalEventHandlers, ev: MouseEvent) => any) | null {
    return () => {
        const download = document.createElement('a');
        download.download = "";
        download.href = state.imageBlobUrl ?? '';
        download.download = state.iconTitle ?? '';
        download.click();
    };
}

function handleBlurEventOfIconTitle(title: HTMLElement, state: SideBarType): ((this: GlobalEventHandlers, ev: FocusEvent) => any) | null {
    return () => {
        if (title.innerText != state.iconTitle)
            hmsys.api.trigger('@HomeSYS/DataStoreDB', { type: "updateFile", id: state.id, filename: title.innerText });
    };
}

function createDeleteDialog(web: RenderingX, state: SideBarType): ((this: GlobalEventHandlers, ev: MouseEvent) => any) | null {
    return () => web.toDialog({
        title: 'Are you sure?',
        userRequestClose: () => DialogActionAfterSubmit.RemoveClose,
        content: span('Deleteing this File will be gone forever. (wich is a very long time)'),
        buttons: [
            [ 'closed', DialogActionAfterSubmit.RemoveClose ],
            [ 'Delete', () => {
                hmsys.api.trigger("@HomeSYS/DataStoreDB", { type: "removeFile", id: state.id });
                return DialogActionAfterSubmit.RemoveClose;
            }
            ]
        ]
    }).open();
}
