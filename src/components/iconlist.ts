import { conditionalCSSClass, custom, img, span } from "@lucsoft/webgen";
import '../../res/css/iconlist.css';
import { compareArray, execludeCompareArray } from "../common/iconData/arrayCompare";
import { DataStoreEvents, emitEvent, registerEvent } from "../common/eventmanager";
import { db, Icon } from '../data/IconsCache';
import lostPanda from '../../res/lostpanda.svg';
import { supportedIcontypes } from "../../config.json";
import { getPossibleVariants, isVariantFrom } from "../common/iconData/variants";
import { getStore } from "../common/api";
export const createIconList = () => {
    const list = document.createElement('div');
    let currentSearchRequest: { includeTags: string[]; execludeTags: string[]; filteredText: string; } = { execludeTags: [], includeTags: [], filteredText: "" }
    renderIconlist(list, currentSearchRequest)
    conditionalCSSClass(list, getStore('compact-view'), 'compact-view')

    registerEvent(DataStoreEvents.RefreshDataComplete, async (data) => {
        const storedData: Icon[] = await db.icons.toArray();

        if (data.new && data.new.length > 0) {
            const newData = data.new
                .map(id => storedData.find(sd => sd.id == id)!)
                .filter(icon => supportedIconType(icon))
                .filter(icon => filterSettings(icon, currentSearchRequest))
                .filter(x => tagFiltering(x, currentSearchRequest))
                .filter(x => simpleTextFiltering(x, currentSearchRequest))
            if (list.children[ 0 ]?.classList.contains('empty-list') && newData.length > 0)
                list.innerHTML = "";

            list.append(...newData
                .map(icon => renderSingleIcon(icon)))
        }
        if (data.removed && data.removed.length > 0) {
            data.removed.forEach(x => list.querySelector(`[id="${x}"]`)?.remove())
        }
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

function getOffset(el: HTMLElement) {
    const rect = el.getBoundingClientRect();
    return {
        bound: rect,
        left: rect.left + window.scrollX,
        top: rect.top + window.scrollY
    };
}

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
    image.onclick = async () => {
        const cachedAllData = await db.icons.toArray();

        emitEvent(DataStoreEvents.SidebarUpdate, {
            offset: () => getOffset(image),
            currentIcon: icon,
            imageVariants: cachedAllData.filter(x => x.variantFrom == icon.id),
            variantFrom: isVariantFrom(icon, cachedAllData),
            possiableVariants: getPossibleVariants(cachedAllData, icon)
        })
    };
    return image;
}

function supportedIconType(icon: Icon) {
    return supportedIcontypes.includes(icon.type);
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
