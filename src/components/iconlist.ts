import '../../res/css/iconlist.css';
import { db } from '../data/IconsCache';

export async function renderIconlist(element: HTMLElement)
{
    const data = await db.icons.orderBy('date').toArray()
    element.innerHTML = "";
    data.forEach(x =>
    {
        const image = document.createElement('img')

        image.src = URL.createObjectURL(x.data)
        element.append(image)
    })
}