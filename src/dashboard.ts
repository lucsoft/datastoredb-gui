import { NetworkConnector } from '@lucsoft/network-connector';
import { custom } from '@lucsoft/webgen';
import { renderHomeBar } from './components/homebar';
import { createIconList } from './components/iconlist';
import { createSidebar } from "./components/sidebar/sidebar";
import { updateFirstTimeDatabase } from "./data/hmsys";
import { createIncidentBar } from "./data/incidentBar";
import './common/refreshData';
import '../res/css/master.css';
import { registerMasterDropArea } from "./components/dropareas";
import { RenderingX } from "@lucsoft/webgen/bin/lib/RenderingX";
import { Style } from "@lucsoft/webgen/bin/lib/Style";
import { generateUploadWizard } from "./components/uploadWizard";
import * as config from '../config.json';

export const hmsys = new NetworkConnector(config[ "default-ip" ], { UNSECURE_AllowNonHTTPSConnection: !config[ "default-https" ] })
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
