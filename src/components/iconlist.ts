import { WebGenElements, span, custom } from "@lucsoft/webgen";
import '../../res/css/iconlist.css';
import { DataStoreEvents, emitEvent } from "../common/eventmanager";
import { db } from '../data/IconsCache';
export const createIconList = (elements: WebGenElements) =>
{
    const list = document.createElement('div');
    list.classList.add('image-list');

    elements.custom(list)
    return list;
};

function getOffset(el: HTMLElement)
{
    const rect = el.getBoundingClientRect();
    return {
        left: rect.left + window.scrollX,
        top: rect.top + window.scrollY
    };
}

export async function renderIconlist(element: HTMLElement)
{
    const data = await db.icons.orderBy('date').toArray()

    element.innerHTML = "";

    data.forEach(x =>
    {
        const image = document.createElement('img')
        const shell = custom('div', image, 'shell')

        image.src = URL.createObjectURL(x.data)
        image.onclick = () => emitEvent(DataStoreEvents.SidebarUpdate, {
            offset: getOffset(image),
            image: image.src,
            id: x.id,
            date: x.date,
            alts: [ image.src ],
            tags: x.tags,
            displayName: x.filename
        })

        element.append(shell)
    })
}