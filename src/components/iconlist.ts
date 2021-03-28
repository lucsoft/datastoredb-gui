import { img } from "@lucsoft/webgen";
import '../../res/css/iconlist.css';
import { compareArray, execludeCompareArray } from "../common/arrayCompare";
import { DataStoreEvents, emitEvent, registerEvent } from "../common/eventmanager";
import { lastFilesCollected } from "../common/refreshData";
import { db } from '../data/IconsCache';
export const createIconList = () => {
    const list = document.createElement('div');
    renderIconlist(list, { execludeTags: [], includeTags: [], filteredText: "" })
    // registerEvent(DataStoreEvents.RefreshDataComplete, () => {
    //     renderIconlist(list, [])
    // })
    registerEvent(DataStoreEvents.SearchBarUpdated, (data) => {
        renderIconlist(list, data)
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

export const getStoredData = async () => /apple/i.test(navigator.vendor) ? lastFilesCollected ?? [] : await db.icons.orderBy('date').toArray();
export async function renderIconlist(element: HTMLElement, filterOptions: {
    includeTags: string[];
    execludeTags: string[];
    filteredText: string;
}) {
    const data = await getStoredData();

    const elements: HTMLElement[] = [];
    data.filter(x => compareArray(x.tags, filterOptions.includeTags) && execludeCompareArray(x.tags, filterOptions.execludeTags)).forEach((x: any) => {
        const image = img(URL.createObjectURL(new File([ x.data ], x.filename, { type: x.type })), 'icon')
        image.loading = "lazy";
        image.onclick = () => emitEvent(DataStoreEvents.SidebarUpdate, {
            offset: () => getOffset(image),
            image: image.src,
            id: x.id,
            date: x.date,
            alts: [ image.src ],
            tags: x.tags,
            displayName: x.filename,
            type: x.type
        })

        elements.push(image)
    })

    element.innerHTML = "";
    element.append(...elements)
}