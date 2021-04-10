import { NetworkConnector } from '@lucsoft/network-connector';
import { custom } from '@lucsoft/webgen';
import { renderHomeBar } from './components/homebar';
import { createIconList } from './components/iconlist';
import { createSidebar } from "./components/sidebar";
import { updateFirstTimeDatabase } from "./data/hmsys";
import { createIncidentBar } from "./data/incidentBar";
import './common/refreshData';
import '../res/css/master.css';
import { registerMasterDropArea } from "./components/dropareas";
import { RenderingX } from "@lucsoft/webgen/bin/lib/RenderingX";
import { Style } from "@lucsoft/webgen/bin/lib/Style";
import { generateUploadWizard } from "./components/uploadWizard";

export const hmsys = new NetworkConnector('eu01.hmsys.de:444')
export function renderMain(web: RenderingX, style: Style) {
    const shell = custom('div', undefined, 'masterShell')
    document.body.append(shell)

    const wizard = generateUploadWizard(web);

    web.toCustom({ shell }, {}, () => [
        createIncidentBar(style),
        createSidebar(web),
        renderHomeBar(web, style, wizard),
        createIconList()
    ])

    registerMasterDropArea(web, wizard)
    updateFirstTimeDatabase(web);
}
