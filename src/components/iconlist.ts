import { custom, img, span } from "@lucsoft/webgen";
import '../../res/css/iconlist.css';
import { compareArray, execludeCompareArray } from "../common/arrayCompare";
import { DataStoreEvents, emitEvent, registerEvent } from "../common/eventmanager";
import { Icon } from '../data/IconsCache';
import lostPanda from '../../res/lostpanda.svg';
import { supportedIcontypes } from "../../config.json";
import { getStoredData } from "../common/refreshData";
import { getPossibleVariants, isVariantFrom } from "../common/iconData/variants";
import { getImageSourceFromIcon } from "../common/iconData/getImageUrlFromIcon";
export const createIconList = () => {
    const list = document.createElement('div');
    let currentSearchRequest: { includeTags: string[]; execludeTags: string[]; filteredText: string; } = { execludeTags: [], includeTags: [], filteredText: "" }
    renderIconlist(list, currentSearchRequest)

    registerEvent(DataStoreEvents.RefreshDataComplete, async (data) => {
        const storedData: Icon[] = await getStoredData();

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
        if ((await getStoredData()).length == 0)
            return;
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
    const data: Icon[] = await getStoredData();

    const elements = data
        .filter(icon => supportedIconType(icon))
        .filter(icon => filterSettings(icon, filterOptions))
        .filter(icon => tagFiltering(icon, filterOptions))
        .filter(icon => simpleTextFiltering(icon, filterOptions))
        .map((icon) => renderSingleIcon(icon))
    element.innerHTML = "";
    if (elements.length == 0) {
        const shell = custom('div', undefined, 'empty-list')
        if (data.length == 0) {
            shell.append(span('Welcome!', 'title'), span('The Pandas are preparing your Files.', 'subtitle'), lostPandaImage)
            setTimeout(() => {
                const data = element.querySelector('.empty-list .subtitle')
                if (data) {
                    element.innerHTML = "";
                    const shell = custom('div', undefined, 'empty-list')
                    shell.append(span('Upload some files.', 'title'), span('Our Pandas need to pay rent.', 'subtitle'), lostPandaImage)
                    element.append(shell)
                }
            }, 2000)
        }
        else
            shell.append(span('Oh no!', 'title'), span('Our Pandas couldn\'t fullfill what you need.', 'subtitle'), lostPandaImage)

        element.append(shell)
    }
    element.append(...elements)
}

const renderSingleIcon = (icon: Icon) => {
    const image = img(getImageSourceFromIcon(icon), 'icon');
    image.loading = "lazy";
    image.setAttribute('id', icon.id);
    image.onclick = async () => {
        const cachedAllData = await getStoredData();
        const cachedData = cachedAllData.find(x => x.id == icon.id);
        if (cachedData == undefined) return;
        emitEvent(DataStoreEvents.SidebarUpdate, {
            offset: () => getOffset(image),
            currentIcon: icon,
            imageVariants: cachedAllData
                .filter(x => x.variantFrom == icon.id),
            variantFrom: isVariantFrom(icon, cachedAllData),
            possiableVariants: getPossibleVariants(cachedAllData, icon),
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
    if (icon.variantFrom && filterOptions.filteredText == "")
        return false;
    return true;
}

function simpleTextFiltering(icon: Icon, filterOptions: { includeTags: string[]; execludeTags: string[]; filteredText: string; }): unknown {
    return icon.filename.toLowerCase().includes(filterOptions.filteredText.toLowerCase());
}

function tagFiltering(icon: Icon, filterOptions: { includeTags: string[]; execludeTags: string[]; filteredText: string; }): unknown {
    return compareArray(icon.tags, filterOptions.includeTags) && execludeCompareArray(icon.tags, filterOptions.execludeTags);
}
