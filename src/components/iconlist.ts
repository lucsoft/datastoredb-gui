import { WebGen } from "@lucsoft/webgen";
import '../../res/css/iconlist.css';
import { db } from '../data/IconsCache';
const { span } = new WebGen().elements.none().components;

export async function renderIconlist(element: HTMLElement)
{
    const data = await db.icons.orderBy('date').toArray()

    element.innerHTML = "";

    data.forEach(x =>
    {
        const shell = document.createElement('div')
        shell.classList.add('shell')
        const image = document.createElement('img')

        image.src = URL.createObjectURL(x.data)
        shell.tabIndex = -1;
        image.onclick = () => shell.classList.toggle('menu')
        shell.onblur = () => shell.classList.remove('menu')

        const menu = document.createElement('span')

        menu.append(span("Edit"))
        menu.append(span("Download"))
        menu.append(span("Delete"))

        shell.append(image, menu)
        element.append(shell)
    })
}