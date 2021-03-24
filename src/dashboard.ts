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

export function renderMain(web: WebGen) {
    const shell = custom('div', undefined, 'masterShell')
    document.body.append(shell)

    const elements = web.elements.custom(shell, { maxWidth: '75rem' })
    const hmsys = new NetworkConnector('eu01.hmsys.de:444')
    createIncidentBar(elements, hmsys)

    elements.custom(createSidebar(web, hmsys))
    renderHomeBar(web, shell)
    registerMasterDropArea(hmsys)
    const list = createIconList(elements);
    registerEvent(DataStoreEvents.RefreshDataComplete, () => renderIconlist(list))
    emitEvent(DataStoreEvents.RefreshDataComplete, undefined)
    updateFirstTimeDatabase(hmsys, elements, web);
}
