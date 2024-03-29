import { conditionalCSSClass, custom, img, span } from "@lucsoft/webgen";
import '../../res/css/iconlist.css';
import { compareArray, execludeCompareArray } from "../common/iconData/arrayCompare";
import { DataStoreEvents, registerEvent } from "../common/eventmanager";
import { db, Icon } from '../data/IconsCache';
import lostPanda from '../../res/lostpanda.svg';
import { getStore } from "../common/api";
import { config } from "../common/envdata";
import { sidebarOpenIcon } from "../logic/openIcon";
export const createIconList = () => {
    const list = document.createElement('div');
    let currentSearchRequest: { includeTags: string[]; execludeTags: string[]; filteredText: string; } = { execludeTags: [], includeTags: [], filteredText: "" }
    renderIconlist(list, currentSearchRequest)
    conditionalCSSClass(list, getStore('compact-view'), 'compact-view')

    registerEvent(DataStoreEvents.SyncIconRemove, (data) => {
        data.forEach(x => list.querySelector(`[id="${x}"]`)?.remove())
    })
    registerEvent(DataStoreEvents.SyncIconAdd, async (data) => {
        const newData = data
            .filter(icon => supportedIconType(icon))
            .filter(icon => filterSettings(icon, currentSearchRequest))
            .filter(x => tagFiltering(x, currentSearchRequest))
            .filter(x => simpleTextFiltering(x, currentSearchRequest))
        if (list.children[ 0 ]?.classList.contains('empty-list') && newData.length > 0)
            list.innerHTML = "";

        list.append(...newData
            .map(icon => renderSingleIcon(icon)))
    })
    registerEvent(DataStoreEvents.SearchBarUpdated, async (data) => {
        if ((await db.icons.count()) == 0) return;
        conditionalCSSClass(list, getStore('compact-view'), 'compact-view')
        if (data === 'indirect-rerender')
            renderIconlist(list, currentSearchRequest)
        else if (currentSearchRequest.filteredText != data.filteredText
            || JSON.stringify(currentSearchRequest.execludeTags) != JSON.stringify(data.execludeTags)
            || JSON.stringify(currentSearchRequest.includeTags) != JSON.stringify(data.includeTags)
        ) {
            currentSearchRequest = data;
            renderIconlist(list, data)
        }
    });
    list.classList.add('image-list');
    return list;
};

const lostPandaImage = custom('div', undefined, 'lost-panda')
fetch(lostPanda).then(x => x.text())
    .then(x => {
        lostPandaImage.innerHTML = x
    });
export async function renderIconlist(element: HTMLElement, filterOptions: {
    includeTags: string[];
    execludeTags: string[];
    filteredText: string;
}) {
    const count = await db.icons.count()

    let elements = (await db.icons
        .filter(icon => supportedIconType(icon))
        .filter(icon => filterSettings(icon, filterOptions))
        .filter(icon => simpleTextFiltering(icon, filterOptions))
        .filter(icon => tagFiltering(icon, filterOptions))
        .sortBy('id'))

    if (elements.length === 0) {
        element.innerHTML = "";
        const shell = custom('div', undefined, 'empty-list')
        if (count == 0)
            shell.append(span('Welcome!', 'title'), span('The Pandas are preparing your Files.', 'subtitle'), lostPandaImage)
        else
            shell.append(span('Oh no!', 'title'), span('Our Pandas couldn\'t fullfill what you need.', 'subtitle'), lostPandaImage)

        element.append(shell)
    }
    else {
        element.innerHTML = "";
        element.append(...elements.map((icon: Icon) => renderSingleIcon(icon)))
    }

}

const renderSingleIcon = (icon: Icon) => {
    const image = img(URL.createObjectURL(icon.data), 'icon');
    image.loading = "lazy";
    image.setAttribute('id', icon.id);
    image.onclick = () => sidebarOpenIcon(icon);
    return image;
}

function supportedIconType(icon: Icon) {
    return config.supportedIcontypes.includes(icon.data?.type ?? "");
}

function filterSettings(icon: Icon, filterOptions: { includeTags: string[]; execludeTags: string[]; filteredText: string; }) {
    if (filterOptions.includeTags.includes('overlay') ? false : icon.tags.includes("overlay"))
        return false;
    if (localStorage.getItem('always-all-variants') != "true" && icon.variantFrom && filterOptions.filteredText == "")
        return false;
    return true;
}

function simpleTextFiltering(icon: Icon, filterOptions: { includeTags: string[]; execludeTags: string[]; filteredText: string; }): boolean {
    return icon.filename.toLowerCase().includes(filterOptions.filteredText.toLowerCase());
}

function tagFiltering(icon: Icon, filterOptions: { includeTags: string[]; execludeTags: string[]; filteredText: string; }): boolean {
    return compareArray(icon.tags, filterOptions.includeTags) && execludeCompareArray(icon.tags, filterOptions.execludeTags);
}
