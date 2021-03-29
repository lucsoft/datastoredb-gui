import { custom, img, span } from "@lucsoft/webgen";
import '../../res/css/iconlist.css';
import { compareArray, execludeCompareArray } from "../common/arrayCompare";
import { DataStoreEvents, emitEvent, registerEvent } from "../common/eventmanager";
import { lastFilesCollected } from "../common/refreshData";
import { db, Icon } from '../data/IconsCache';
import lostPanda from '../../res/lostpanda.svg';
import { checkIfCacheIsAllowed } from "../common/checkIfCacheAllowed";
import { supportedIcontypes } from "../../config.json";
export const createIconList = () => {
    const list = document.createElement('div');
    let currentSearchRequest: { includeTags: string[]; execludeTags: string[]; filteredText: string; } = { execludeTags: [], includeTags: [], filteredText: "" }
    renderIconlist(list, currentSearchRequest)

    registerEvent(DataStoreEvents.RefreshDataComplete, async (data) => {
        const storedData: Icon[] = await getStoredData();

        if (data.new && data.new.length > 0) {
            if (!checkIfCacheIsAllowed())
                list.innerHTML = ""

            const newData = data.new
                .map(id => storedData.find(sd => sd.id == id)!)
                .filter(icon => supportedIconType(icon))
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
        if (currentSearchRequest.filteredText != data.filteredText
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
    })
export const getStoredData = async () => !checkIfCacheIsAllowed() ? lastFilesCollected ?? [] : await db.icons.orderBy('date').toArray();
export async function renderIconlist(element: HTMLElement, filterOptions: {
    includeTags: string[];
    execludeTags: string[];
    filteredText: string;
}) {
    const data: Icon[] = await getStoredData();

    const elements = data
        .filter(icon => supportedIconType(icon))
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
    const image = img(URL.createObjectURL(new File([ icon.data ], icon.filename, { type: icon.type })), 'icon');
    image.loading = "lazy";
    image.setAttribute('id', icon.id);
    image.onclick = () => emitEvent(DataStoreEvents.SidebarUpdate, {
        offset: () => getOffset(image),
        image: image.src,
        id: icon.id,
        date: icon.date,
        alts: [ image.src ],
        tags: icon.tags,
        displayName: icon.filename,
        type: icon.type
    });

    return image;
}

function supportedIconType(icon: Icon) {
    return supportedIcontypes.includes(icon.type);
}

function simpleTextFiltering(icon: Icon, filterOptions: { includeTags: string[]; execludeTags: string[]; filteredText: string; }): unknown {
    return icon.filename.toLowerCase().includes(filterOptions.filteredText.toLowerCase());
}

function tagFiltering(icon: Icon, filterOptions: { includeTags: string[]; execludeTags: string[]; filteredText: string; }): unknown {
    return compareArray(icon.tags, filterOptions.includeTags) && execludeCompareArray(icon.tags, filterOptions.execludeTags);
}
