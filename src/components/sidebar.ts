import { CardTypes, conditionalCSSClass, createElement, custom, img, mIcon, span, WebGen } from "@lucsoft/webgen"
import { DataStoreEvents, registerEvent } from "../common/eventmanager";
import '../../res/css/sidebar.css';
import { NetworkConnector } from "@lucsoft/network-connector";
import { timeAgo } from "../common/date";
import { disableGlobalDragAndDrop, enableGlobalDragAndDrop } from "./dropareas";
import { SidebarData } from "../types/sidebarTypes";

export const createSidebar = (web: WebGen, hmsys: NetworkConnector) => {
    const sidebar = createElement('article')
    let currentId: string | undefined = undefined;
    sidebar.classList.add('sidebar');
    sidebar.onblur = () => {
        enableGlobalDragAndDrop()
        sidebar.classList.remove('open')
    }
    sidebar.tabIndex = 0;
    const webGenSidebars = web.elements.custom(sidebar)
    const shell = custom('div', undefined, 'shell')
    const image = img(undefined, 'preview')
    const title = span("Loading...", 'icon-title')
    const taglist = custom('ul', undefined, 'tags-list')
    const variantsLabel = span('Variants', 'variants-title')
    const add = mIcon('add')
    add.onclick = () => web.elements.notify("Currently not implemented")
    const variantsList = custom('div', add, 'variants')

    const downloadAll = createAction("file_download", 'Download All Variants')
    downloadAll.onclick = () => web.elements.notify("Currently not implemented")
    const deleteIcon = createAction("delete", "Delete this Icon", true)
    const extraData = span('Loading...', 'extra-data')
    shell.append(image, title, taglist, variantsLabel, variantsList, downloadAll, deleteIcon, extraData)
    webGenSidebars.cards({}, { type: CardTypes.Headless, html: shell })
    registerEvent(DataStoreEvents.SidebarUpdate, (data: SidebarData) => {
        if (data === undefined) {
            sidebar.blur()
            return;
        }
        if (typeof data === 'string') {
            if (currentId && currentId == data) sidebar.blur()
            return;
        }
        currentId = data.id;
        const offset = data.offset();
        const normal = document.body.offsetWidth - (offset.left + 365) > 0;
        sidebar.style.top = offset.top + "px";
        sidebar.style.left = (offset.left - (normal ? 0 : 365)) + "px";
        conditionalCSSClass(sidebar, !normal, 'right')
        sidebar.classList.add('open')
        sidebar.focus();
        disableGlobalDragAndDrop()
        deleteIcon.onclick = () => hmsys.api.trigger("@HomeSYS/DataStoreDB", { type: "removeFile", id: data.id })
        variantsList.innerHTML = "";
        variantsList.append(...data.alts.map(src => img(src, 'alt-preview')), add)
        variantsList.append()
        taglist.innerHTML = "";
        taglist.append(...createTags(data.tags))
        image.src = data.image
        title.innerText = data.displayName
        conditionalCSSClass(title, data.displayName.length > 20, 'small')
        extraData.innerText = `by Anonymous • ${timeAgo(data.date)} • ${data.type}@${image.naturalWidth}x${image.naturalHeight}`
    })
    return sidebar;
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