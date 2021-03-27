import { custom } from "@lucsoft/webgen";
import '../../res/css/iconlist.css';
import { DataStoreEvents, emitEvent } from "../common/eventmanager";
import { lastFilesCollected } from "../common/refreshData";
import { db } from '../data/IconsCache';
import { SidebarData } from "../types/sidebarTypes";
export const createIconList = () => {
    const list = document.createElement('div');
    renderIconlist(list)
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

export async function renderIconlist(element: HTMLElement) {
    const data = /apple/i.test(navigator.vendor) ? lastFilesCollected : await db.icons.orderBy('date').toArray()

    const elements: HTMLElement[] = [];
    data.forEach((x: any) => {
        const image = document.createElement('img')
        const shell = custom('div', image, 'shell')
        image.src = URL.createObjectURL(new File([ x.data ], x.filename, { type: x.type }))
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
        } as SidebarData)

        elements.push(shell)
    })

    element.innerHTML = "";
    element.append(...elements)
}