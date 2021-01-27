import { WebGenElements } from '@lucsoft/webgen';
import { HeadlessCard } from '@lucsoft/webgen/bin/lib/Cards';


export function renderHomeBar(ele: WebGenElements)
{
    const search = document.createElement('div')
    search.style.height = "1rem"
    const upload = document.createElement('div')
    upload.style.height = "1rem"
    ele.cards({ minColumnWidth: 5 }, {
        type: "less",
        html: search,
        width: 3
    } as HeadlessCard, {
        type: "less",
        html: upload,
        width: 1
    } as HeadlessCard)
}