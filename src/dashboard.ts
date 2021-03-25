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
import { RenderingX } from "@lucsoft/webgen/bin/lib/RenderingX";

export function renderMain(web: RenderingX) {
    const shell = custom('div', undefined, 'masterShell')
    document.body.append(shell)

    const hmsys = new NetworkConnector('eu01.hmsys.de:444')

    const render = web.toCustom({ maxWidth: '75rem', shell }, {}, () => [
        createIncidentBar(hmsys),
        createSidebar(web, hmsys),
        renderHomeBar(web, hmsys),
        createIconList()
    ])
    registerMasterDropArea(hmsys)

    registerEvent(DataStoreEvents.RefreshDataComplete, () => render.redraw())
    emitEvent(DataStoreEvents.RefreshDataComplete, undefined)
    updateFirstTimeDatabase(hmsys, web);
}
