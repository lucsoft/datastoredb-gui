import { CardTypes, custom, span, WebGen } from "@lucsoft/webgen"
import { DataStoreEvents, registerEvent } from "../common/eventmanager";
import '../../res/css/sidebar.css';

export const createSidebar = (web: WebGen) =>
{
    const sidebar = document.createElement('article')
    sidebar.classList.add('sidebar');
    const webGenSidebars = web.elements.custom(sidebar)
    const shell = document.createElement('div')

    const image = document.createElement('img')

    const title = span("Loading...", 'icon-title')

    const taglist = custom('ul', undefined, 'tags')
    const variantsLabel = span('Variants')
    const variantsList = custom('ul', undefined, 'variants')

    const downloadAll = createAction("file_download", 'Download All Variants')
    const deleteIcon = createAction("delete", "Delete this Icon", true)
    const extraData = span('Loading...', 'extra-data')
    shell.append(
        image,
        title,
        taglist,
        variantsLabel,
        variantsList,
        downloadAll,
        deleteIcon,
        extraData
    )
    webGenSidebars.cards({}, { type: CardTypes.Headless, html: shell })
    registerEvent(DataStoreEvents.SidebarUpdate, (data) =>
    {
        sidebar.classList.add('open')
        image.src = data.image
        title.innerText = data.displayName
    })
    return sidebar;
}

const createAction = (icon: string, text: string, isRed?: boolean) =>
{
    const element = custom('li', undefined)
    element.append(span(icon, 'material-icons-round'), span(text, isRed ? 'red' : 'black'))

    return element;
}