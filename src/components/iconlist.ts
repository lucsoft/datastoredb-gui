import '../../res/css/iconlist.css';
import { db } from '../data/IconsCache';

export async function renderIconlist(element: HTMLElement)
{
    const data = await db.icons.orderBy('date').toArray()
    element.innerHTML = "";
    data.forEach(x =>
    {
        const shell = document.createElement('div')
        shell.classList.add('shell')
        const image = document.createElement('img')
        image.onclick = () =>
        {
            shell.classList.toggle('menu')
        }
        image.src = URL.createObjectURL(x.data)
        shell.append(image)
        element.append(shell)
    })
}