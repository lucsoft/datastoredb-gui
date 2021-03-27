import { Card, conditionalCSSClass, createElement, custom, img, mIcon, RenderElement, RenderingX, span } from "@lucsoft/webgen"
import { DataStoreEvents, registerEvent } from "../common/eventmanager";
import '../../res/css/sidebar.css';
import { NetworkConnector } from "@lucsoft/network-connector";
import { timeAgo } from "../common/date";
import { disableGlobalDragAndDrop, enableGlobalDragAndDrop } from "./dropareas";
import { SidebarNormalData } from "../types/sidebarTypes";

type SideBarType = {
    showSidebar?: boolean
    iconTitle?: string
    id?: string
    imageBlobUrl?: string
    imageType?: string
    createDate?: number
    tags?: string[]
    imageVariants?: string[]
    offset?: SidebarNormalData[ "offset" ]
    canUpload?: boolean
    username?: string
    canRemove?: boolean
};
export const createSidebar = (web: RenderingX, hmsys: NetworkConnector): RenderElement => {

    return {
        draw: () => {
            const sidebar = createElement('article')
            sidebar.classList.add('sidebar');
            sidebar.tabIndex = 0;

            const shell = custom('div', undefined, 'shell')
            const sidebarX = web.toCustom({ shell: sidebar }, {} as SideBarType, [
                (state) => Card({}, {
                    getSize: () => ({}),
                    draw: (card) => {
                        const image = img(state.imageBlobUrl, 'preview')
                        const title = span(state.iconTitle, 'icon-title')
                        const taglist = custom('ul', undefined, 'tags-list')
                        taglist.innerHTML = "";

                        if (state.offset && state.showSidebar)
                            updatePosition(sidebar, state.offset!)
                        conditionalCSSClass(sidebar, state.showSidebar, 'open')
                        taglist.append(...createTags(state.tags))
                        if (state.showSidebar)
                            sidebar.focus();

                        const add = mIcon('add')
                        const variantsList = custom('div', add, 'variants')
                        variantsList.innerHTML = "";
                        if (state.imageVariants) variantsList.append(...state.imageVariants.map(src => img(src, 'alt-preview')))
                        if (state.canUpload) variantsList.append(add)

                        const downloadAll = createAction("file_download", 'Download All Variants')
                        const deleteIcon = createAction("delete", "Delete this Icon", true)
                        deleteIcon.style.display = state.canRemove ? 'flex' : 'none';
                        deleteIcon.onclick = () => hmsys.api.trigger("@HomeSYS/DataStoreDB", { type: "removeFile", id: state.id })

                        sidebar.onblur = () => {
                            if (state.canUpload) enableGlobalDragAndDrop();
                            sidebarX.forceRedraw({
                                showSidebar: false
                            })
                            sidebar.classList.remove('open')
                        }
                        add.onclick = () => web.notify("Currently not implemented")
                        downloadAll.onclick = () => web.notify("Currently not implemented")

                        conditionalCSSClass(title, (state.iconTitle?.length ?? 0) > 20, 'small')
                        shell.innerHTML = "";
                        shell.append(
                            image,
                            title,
                            taglist,
                            span('Variants', 'variants-title'),
                            variantsList,
                            downloadAll,
                            deleteIcon,
                            span(`by ${state.username} • ${timeAgo(state.createDate)} • ${state.imageType}@${image.naturalWidth}x${image.naturalHeight}`, 'extra-data')
                        )

                        card.append(shell)
                        return card;
                    }
                })
            ])

            registerEvent(DataStoreEvents.RecivedProfileData, (data) => {
                sidebarX.forceRedraw({
                    canUpload: data.canUpload,
                    username: data.username,
                    canRemove: data.canRemove
                })
            })
            addEventListener('resize', () => {
                const state = sidebarX.getState();
                if (state?.showSidebar && state.offset) updatePosition(sidebar, state.offset)
            }, { passive: true })
            registerEvent(DataStoreEvents.SidebarUpdate, (data) => {
                const currentState = sidebarX.getState();
                if (data === undefined) {
                    sidebarX.forceRedraw({ showSidebar: false })
                    return;
                }
                if (typeof data === 'string') {
                    if (currentState && currentState.id && currentState.id == data) sidebarX.forceRedraw({ showSidebar: false })
                    return;
                }
                disableGlobalDragAndDrop()

                sidebarX.forceRedraw({
                    showSidebar: true,
                    iconTitle: data.displayName,
                    imageBlobUrl: data.image,
                    id: data.id,
                    tags: data.tags,
                    createDate: data.date,
                    imageType: data.type,
                    imageVariants: data.alts,
                    offset: data.offset
                })
            })
            return sidebar;
        }
    }
}
const updatePosition = (sidebar: HTMLElement, data: SidebarNormalData[ "offset" ]) => {
    const offset = data();
    const normal = document.body.offsetWidth - (offset.left + 365) > 0;
    sidebar.style.top = offset.top + "px";
    sidebar.style.left = (offset.left - (normal ? 0 : 365)) + "px";
    conditionalCSSClass(sidebar, !normal, 'right')
}
const createTags = (tags?: string[]) => {
    const add = mIcon('edit')
    if (tags)
        return [ ...tags.map(x => span('#' + x)), add ];
    else
        return [ add ];
}
const createAction = (icon: string, text: string, isRed?: boolean) => {
    const element = custom('span', undefined, 'action', isRed ? 'red' : 'black')
    element.append(mIcon(icon), span(text, 'label'))
    return element;
}