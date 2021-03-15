import { NetworkConnector } from '@lucsoft/network-connector';
import { custom, WebGen } from '@lucsoft/webgen';
import { renderHomeBar } from './components/homebar';
import { createIconList, renderIconlist } from './components/iconlist';
import { createSidebar } from "./components/sidebar";
import { updateFirstTimeDatabase } from "./data/init/hmsys";
import { createIncidentBar } from "./data/states/incidentBar";
import './common/refreshData';
import '../res/css/master.css';
import { registerMasterDropArea } from "./components/dropareas";
import { DataStoreEvents, emitEvent, registerEvent } from "./common/eventmanager";

export function renderMain(web: WebGen)
{
    const main = custom('article', undefined)
    const shell = custom('div', main, 'masterShell')
    document.body.append(shell)

    const elements = web.elements.custom(main, { maxWidth: '75rem' })
    const hmsys = new NetworkConnector('eu01.hmsys.de:444')

    elements.custom(createSidebar(web, hmsys))
    registerMasterDropArea(hmsys)
    createIncidentBar(elements, hmsys)
    renderHomeBar(elements)
    const list = createIconList(elements);
    registerEvent(DataStoreEvents.RefreshDataComplete, () => renderIconlist(list))
    emitEvent(DataStoreEvents.RefreshDataComplete, undefined)
    updateFirstTimeDatabase(hmsys, elements);
}
