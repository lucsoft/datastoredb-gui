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
    const variantsList = custom('div', add, 'variants')

    const downloadAll = createAction("file_download", 'Download All Variants')
    const deleteIcon = createAction("delete", "Delete this Icon", true)
    const extraData = span('Loading...', 'extra-data')
    shell.append(image, title, taglist, variantsLabel, variantsList, downloadAll, deleteIcon, extraData)
    webGenSidebars.cards({}, { type: CardTypes.Headless, html: shell })
    registerEvent(DataStoreEvents.SidebarUpdate, (data) =>
    {
        sidebar.style.top = data.offset.top + "px";
        sidebar.style.left = data.offset.left + "px";
        sidebar.classList.add('open')
        sidebar.focus();
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
        taglist.append(...createTags(data.tags))
        image.src = data.image
        title.innerText = data.displayName
        extraData.innerText = `Uploaded by Anonymous\nLast updated ${timeAgo(data.date)}`
    })
    return sidebar;
}

const createTags = (tags: string[]) =>
{
    const add = span('add', 'material-icons-round')

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