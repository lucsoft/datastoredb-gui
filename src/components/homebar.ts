import { WebGenElements } from '@lucsoft/webgen';
import type { HeadlessCard } from '@lucsoft/webgen/bin/lib/Cards';
import '../../res/css/homebar.css';
export function renderHomeBar(ele: WebGenElements)
{
    const search = document.createElement('input')
    search.placeholder = "Search something...";
    const control = document.createElement('button')
    control.classList.add('one')
    control.innerText = "Settings"
    const menu = ele.cards({ minColumnWidth: 5 }, {
        type: "less",
        html: search
    } as HeadlessCard, {
        type: "less",
        html: control
    } as HeadlessCard)
    menu.last.classList.add('homebar')
    menu.last.style.gridTemplateColumns = "auto 12rem";
}