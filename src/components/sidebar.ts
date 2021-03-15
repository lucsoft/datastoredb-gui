import { CardTypes, custom, span, WebGen } from "@lucsoft/webgen"
import { DataStoreEvents, registerEvent } from "../common/eventmanager";
import '../../res/css/sidebar.css';
import { NetworkConnector } from "@lucsoft/network-connector";
import { timeAgo } from "../common/date";

export const createSidebar = (web: WebGen, hmsys: NetworkConnector) =>
{
    const sidebar = document.createElement('article')
    sidebar.classList.add('sidebar');
    sidebar.onblur = () =>
    {
        sidebar.classList.remove('open')
    }
    sidebar.tabIndex = 0;
    const webGenSidebars = web.elements.custom(sidebar)
    const shell = custom('div', undefined, 'shell')

    const image = custom('img', undefined, 'preview') as HTMLImageElement

    const title = span("Loading...", 'icon-title')

    const taglist = custom('ul', undefined, 'tags-list')
    const variantsLabel = span('Variants', 'variants-title')
    const add = span('add', 'material-icons-round')
    add.onclick = () => web.elements.notify("Currently not implemented")
    const variantsList = custom('div', add, 'variants')

    const downloadAll = createAction("file_download", 'Download All Variants')
    downloadAll.onclick = () => web.elements.notify("Currently not implemented")
    const deleteIcon = createAction("delete", "Delete this Icon", true)
    const extraData = span('Loading...', 'extra-data')
    shell.append(image, title, taglist, variantsLabel, variantsList, downloadAll, deleteIcon, extraData)
    webGenSidebars.cards({}, { type: CardTypes.Headless, html: shell })
    registerEvent(DataStoreEvents.SidebarUpdate, (data) =>
    {
        const normal = document.body.offsetWidth - (data.offset.left + 365) > 0;
        sidebar.style.top = data.offset.top + "px";
        sidebar.style.left = (data.offset.left - (normal ? 0 : 365)) + "px";
        if (normal)
            sidebar.classList.remove('right')
        else
            sidebar.classList.add('right')

        sidebar.classList.add('open')
        sidebar.focus();

        deleteIcon.onclick = () => hmsys.api.trigger("@HomeSYS/DataStoreDB", { type: "removeFile", id: data.id })
        variantsList.innerHTML = "";
        variantsList.append(...data.alts.map((x: string) =>
        {
            const image = custom('img', undefined, 'alt-preview') as HTMLImageElement
            image.src = x
            return image
        }), add)
        custom('img', undefined, 'alt-icon')
        variantsList.append()
        taglist.innerHTML = "";
        taglist.append(...createTags(web, data.tags))
        image.src = data.image
        title.innerText = data.displayName
        extraData.innerText = `Uploaded by Anonymous\nLast updated ${timeAgo(data.date)}`
    })
    return sidebar;
}

const createTags = (web: WebGen, tags: string[]) =>
{
    const add = span('add', 'material-icons-round')
    add.onclick = () => web.elements.notify("Currently not implemented")
    return [ ...tags.map(x =>
        span('#' + x)
    ), add ];
}
const createAction = (icon: string, text: string, isRed?: boolean) =>
{
    const element = custom('span', undefined, 'action', isRed ? 'red' : 'black')
    element.append(span(icon, 'material-icons-round'), span(text, 'label'))

    return element;
}