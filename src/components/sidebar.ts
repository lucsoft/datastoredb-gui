import { Card, conditionalCSSClass, createElement, custom, img, mIcon, RenderElement, RenderingX, span } from "@lucsoft/webgen"
import { DataStoreEvents, registerEvent } from "../common/eventmanager";
import '../../res/css/sidebar.css';
import { NetworkConnector } from "@lucsoft/network-connector";
import { timeAgo } from "../common/date";
import { disableGlobalDragAndDrop, enableGlobalDragAndDrop } from "./dropareas";
import { SidebarData, SidebarNormalData } from "../types/sidebarTypes";
import { ProfileData } from "../types/profileDataTypes";
type opt<TypeT> = undefined | TypeT;
export const createSidebar = (web: RenderingX, hmsys: NetworkConnector): RenderElement => ({
    draw: () => {
        const sidebar = createElement('article')
        let currentId: string | undefined = undefined;
        let offset: SidebarNormalData[ "offset" ] | undefined = undefined;
        const sidebarCard = web.toCustom({ shell: sidebar }, {
            iconTitle: "",
            id: undefined as opt<string>,
            imageBlobUrl: undefined as opt<string>,
            imageType: undefined as opt<string>,
            createDate: undefined as opt<number>,
            username: undefined as opt<string>,
            canUpload: false,
            canRemove: false,
            tags: undefined as opt<string[]>,
            imageVariants: undefined as opt<string[]>
        }, () => [
            (_, data) => Card({}, {
                getSize: () => ({}),
                draw: (card) => {

                    const shell = custom('div', undefined, 'shell')
                    const image = img(data.imageBlobUrl, 'preview')
                    const title = span(data.iconTitle, 'icon-title')
                    const taglist = custom('ul', undefined, 'tags-list')
                    taglist.innerHTML = "";
                    taglist.append(...createTags(data.tags))

                    const add = mIcon('add')
                    const variantsList = custom('div', add, 'variants')
                    variantsList.innerHTML = "";
                    if (data.imageVariants) variantsList.append(...data.imageVariants.map(src => img(src, 'alt-preview')))
                    if (data.canUpload) variantsList.append(add)


                    const downloadAll = createAction("file_download", 'Download All Variants')
                    const deleteIcon = createAction("delete", "Delete this Icon", true)
                    deleteIcon.style.display = data.canRemove ? 'flex' : 'none';
                    deleteIcon.onclick = () => hmsys.api.trigger("@HomeSYS/DataStoreDB", { type: "removeFile", id: data.id })

                    sidebar.classList.add('sidebar');
                    sidebar.onblur = () => {
                        if (data.canUpload) enableGlobalDragAndDrop();
                        sidebar.classList.remove('open')
                    }
                    sidebar.tabIndex = 0;
                    add.onclick = () => web.notify("Currently not implemented")
                    downloadAll.onclick = () => web.notify("Currently not implemented")

                    conditionalCSSClass(title, data.iconTitle.length > 20, 'small')
                    shell.append(
                        image,
                        title,
                        taglist,
                        span('Variants', 'variants-title'),
                        variantsList,
                        downloadAll,
                        deleteIcon,
                        span(`by ${data.username} • ${timeAgo(data.createDate)} • ${data.imageType}@${image.naturalWidth}x${image.naturalHeight}`, 'extra-data')
                    )
                    card.append(shell)
                    return card;
                }
            })
        ])

        registerEvent(DataStoreEvents.RecivedProfileData, (data: ProfileData) => {
            console.log(data);
            sidebarCard.redraw({
                canUpload: data.canUpload,
                username: data.username,
                canRemove: data.canRemove
            })
            console.log(sidebarCard.getState())
        })
        addEventListener('resize', () => {
            if (offset && sidebar.classList.contains('open')) updatePosition(sidebar, offset)
        }, { passive: true })
        registerEvent(DataStoreEvents.SidebarUpdate, (data: SidebarData) => {
            if (data === undefined) {
                sidebar.blur()
                return;
            }
            if (typeof data === 'string') {
                if (currentId && currentId == data) sidebar.blur()
                return;
            }
            currentId = data.id
            offset = data.offset
            updatePosition(sidebar, data.offset)
            sidebar.classList.add('open')
            sidebar.focus();
            disableGlobalDragAndDrop()

            sidebarCard.redraw({
                iconTitle: data.displayName,
                imageBlobUrl: data.image,
                id: data.id,
                tags: data.tags,
                createDate: data.date,
                imageType: data.type,
                imageVariants: data.alts
            })
        })
        return sidebar;
    }
})
const updatePosition = (sidebar: HTMLElement, data: SidebarNormalData[ "offset" ]) => {
    const offset = data();
    const normal = document.body.offsetWidth - (offset.left + 365) > 0;
    sidebar.style.top = offset.top + "px";
    sidebar.style.left = (offset.left - (normal ? 0 : 365)) + "px";
    conditionalCSSClass(sidebar, !normal, 'right')
}
const createTags = (tags?: string[]) => {
    const add = mIcon('add')
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