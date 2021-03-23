import { WebGenElements, custom } from "@lucsoft/webgen";
import { electron } from "webpack";
import '../../res/css/iconlist.css';
import { DataStoreEvents, emitEvent } from "../common/eventmanager";
import { lastFilesCollected } from "../common/refreshData";
import { db } from '../data/IconsCache';
export const createIconList = (elements: WebGenElements) => {
    const list = document.createElement('div');
    list.classList.add('image-list');

    elements.custom(list)
    return list;
};

function getOffset(el: HTMLElement) {
    const rect = el.getBoundingClientRect();
    return {
        bound: rect,
        left: rect.left + window.screenX,
        top: rect.top + window.screenY
    };
}

export async function renderIconlist(element: HTMLElement) {
    const data = /apple/i.test(navigator.vendor) ? lastFilesCollected : await db.icons.orderBy('date').toArray()

    const elements: HTMLElement[] = [];
    data.forEach((x: any) => {
        const image = document.createElement('img')
        const shell = custom('div', image, 'shell')

        image.src = URL.createObjectURL(x.data)
        image.onclick = () => emitEvent(DataStoreEvents.SidebarUpdate, {
            offset: () => getOffset(image),
            image: image.src,
            id: x.id,
            date: x.date,
            alts: [ image.src ],
            tags: x.tags,
            displayName: x.filename
        })

        elements.push(shell)
    })

    element.innerHTML = "";
    element.append(...elements)
}