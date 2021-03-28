import { NetworkConnector } from '@lucsoft/network-connector';
import { custom } from '@lucsoft/webgen';
import { renderHomeBar } from './components/homebar';
import { createIconList } from './components/iconlist';
import { createSidebar } from "./components/sidebar";
import { updateFirstTimeDatabase } from "./data/init/hmsys";
import { createIncidentBar } from "./data/states/incidentBar";
import './common/refreshData';
import '../res/css/master.css';
import { registerMasterDropArea } from "./components/dropareas";
import { RenderingX } from "@lucsoft/webgen/bin/lib/RenderingX";
import { Style } from "@lucsoft/webgen/bin/lib/Style";

export function renderMain(web: RenderingX, style: Style) {
    const shell = custom('div', undefined, 'masterShell')
    document.body.append(shell)

    const hmsys = new NetworkConnector('eu01.hmsys.de:444')

    web.toCustom({ maxWidth: '75rem', shell }, {}, () => [
        createIncidentBar(hmsys),
        createSidebar(web, hmsys),
        renderHomeBar(web, hmsys, style),
        createIconList()
    ])
    registerMasterDropArea(hmsys)
    updateFirstTimeDatabase(hmsys, web);
}
