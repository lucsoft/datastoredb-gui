import { NetworkConnector, createLocalStorageProvider } from '@lucsoft/network-connector';
import { custom, View } from '@lucsoft/webgen';
import { renderHomeBar } from '../homebar';
import { createIconList } from '../iconlist';
import { registerSidebarEvents } from "../sidebar/sidebar";
import { updateFirstTimeDatabase } from "../../data/hmsys";
import { createIncidentBar } from "../../data/incidentBar";
import '../../../res/css/master.css';
import { registerMasterDropArea } from "../dropareas";
import { Style } from "@lucsoft/webgen/bin/lib/Style";
import { generateUploadWizard } from "./uploadWizard";
import { config } from "../../common/envdata";

export const hmsys = new NetworkConnector(config.defaultIp, {
    store: createLocalStorageProvider(),
    AllowNonHTTPSConnection: !config.defaultHttps
})
export function renderMain(style: Style) {
    const shell = custom('div', undefined, 'masterShell')
    document.body.append(shell)

    const wizard = generateUploadWizard();

    View(({ use }) => {
        use(createIncidentBar())
        use(renderHomeBar(style, wizard))
        use(createIconList())
    }).appendOn(shell)

    registerMasterDropArea(wizard)
    registerSidebarEvents();
    updateFirstTimeDatabase();
}
