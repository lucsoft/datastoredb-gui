import { CardTypes, conditionalCSSClass, createElement, custom, img, mIcon, span, WebGen } from "@lucsoft/webgen"
import { DataStoreEvents, registerEvent } from "../common/eventmanager";
import '../../res/css/sidebar.css';
import { NetworkConnector } from "@lucsoft/network-connector";
import { timeAgo } from "../common/date";
import { disableGlobalDragAndDrop, enableGlobalDragAndDrop } from "./dropareas";
import { SidebarData, SidebarNormalData } from "../types/sidebarTypes";
import { ProfileData } from "../types/profileDataTypes";

export const createSidebar = (web: WebGen, hmsys: NetworkConnector) => {
    const sidebar = createElement('article')
    let currentId: string | undefined = undefined;
    let username = 'Unknown'
    let uploadAllowed = false;
    let offset: SidebarNormalData[ "offset" ] | undefined = undefined;
    const webGenSidebars = web.elements.custom(sidebar)
    const shell = custom('div', undefined, 'shell')
    const image = img(undefined, 'preview')
    const title = span("Loading...", 'icon-title')
    const taglist = custom('ul', undefined, 'tags-list')
    const variantsLabel = span('Variants', 'variants-title')
    const add = mIcon('add')
    const variantsList = custom('div', add, 'variants')
    const downloadAll = createAction("file_download", 'Download All Variants')
    const deleteIcon = createAction("delete", "Delete this Icon", true)
    const extraData = span('Loading...', 'extra-data')

    sidebar.classList.add('sidebar');
    sidebar.onblur = () => {
        if (uploadAllowed)
            enableGlobalDragAndDrop();
        sidebar.classList.remove('open')
    }
    sidebar.tabIndex = 0;
    add.onclick = () => web.elements.notify("Currently not implemented")
    downloadAll.onclick = () => web.elements.notify("Currently not implemented")
    shell.append(image, title, taglist, variantsLabel, variantsList, downloadAll, deleteIcon, extraData)
    webGenSidebars.cards({}, { type: CardTypes.Headless, html: shell })
    registerEvent(DataStoreEvents.RecivedProfileData, (data: ProfileData) => {
        deleteIcon.style.display = data.canRemove ? 'flex' : 'none';
        uploadAllowed = data.canUpload;
        username = data.username;
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
        deleteIcon.onclick = () => hmsys.api.trigger("@HomeSYS/DataStoreDB", { type: "removeFile", id: data.id })
        variantsList.innerHTML = "";
        if (uploadAllowed)
            variantsList.append(...data.alts.map(src => img(src, 'alt-preview')), add)
        else
            variantsList.append(...data.alts.map(src => img(src, 'alt-preview')))
        taglist.innerHTML = "";
        taglist.append(...createTags(data.tags))
        image.src = data.image
        title.innerText = data.displayName
        conditionalCSSClass(title, data.displayName.length > 20, 'small')
        extraData.innerText = `by ${username} • ${timeAgo(data.date)} • ${data.type}@${image.naturalWidth}x${image.naturalHeight}`
    })
    return sidebar;
}
const updatePosition = (sidebar: HTMLElement, data: SidebarNormalData[ "offset" ]) => {
    const offset = data();
    const normal = document.body.offsetWidth - (offset.left + 365) > 0;
    sidebar.style.top = offset.top + "px";
    sidebar.style.left = (offset.left - (normal ? 0 : 365)) + "px";
    conditionalCSSClass(sidebar, !normal, 'right')
}
const createTags = (tags: string[]) => {
    const add = mIcon('add')
    return [ ...tags.map(x => span('#' + x)), add ];
}
const createAction = (icon: string, text: string, isRed?: boolean) => {
    const element = custom('span', undefined, 'action', isRed ? 'red' : 'black')
    element.append(mIcon(icon), span(text, 'label'))
    return element;
}