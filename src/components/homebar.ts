import { HeadlessCard, WebGenElements } from '@lucsoft/webgen';
import { CardTypes } from "@lucsoft/webgen/bin/types/card";
import '../../res/css/homebar.css';
export function renderHomeBar(ele: WebGenElements)
{
    const search = document.createElement('input')
    search.placeholder = "Search something...";
    const control = document.createElement('button')
    control.classList.add('one')
    control.innerText = "About DataStoreDB"
    const menu = ele.cards({ minColumnWidth: 5 }, {
        type: CardTypes.Headless,
        html: search
    } as HeadlessCard, {
        type: CardTypes.Headless,
        html: control
    } as HeadlessCard)
    menu.last.classList.add('homebar')
    menu.last.style.gridTemplateColumns = "auto 12rem";
}