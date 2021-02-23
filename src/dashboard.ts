import { NetworkConnector } from '@lucsoft/network-connector';
import { WebGen } from '@lucsoft/webgen';
import { renderHomeBar } from './components/homebar';
import { createIconList, renderIconlist } from './components/iconlist';
import { createSidebar } from "./components/sidebar";
import { updateFirstTimeDatabase } from "./data/init/hmsys";
import { createIncidentBar } from "./data/states/incidentBar";
import './common/refreshData';

export function renderMain(web: WebGen)
{
    const shell = document.createElement('div')
    shell.classList.add('masterShell')
    const main = document.createElement('article')
    shell.append(main);
    document.body.append(shell)
    const elements = web.elements.custom(main, { maxWidth: '75rem' })
    const hmsys = new NetworkConnector('eu01.hmsys.de:444')

    createIncidentBar(elements, hmsys)
    createSidebar(web)
    renderHomeBar(elements)
    const list = createIconList(elements);
    renderIconlist(list)

    updateFirstTimeDatabase(hmsys, elements);
}
