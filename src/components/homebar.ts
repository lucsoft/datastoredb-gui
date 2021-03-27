import { NetworkConnector } from "@lucsoft/network-connector";
import { createElement, mIcon, RenderingX, span } from "@lucsoft/webgen";
import '../../res/css/homebar.css';
import pandaIcon from '../../res/pandaicon.svg';

import { DataStoreEvents, registerEvent } from "../common/eventmanager";
import { controlPanelContent, controlPanelDialog } from "./controlpanel";
import { getStoredData } from "./iconlist";
import { manualUploadImage } from "./upload";

export const renderHomeBar = (web: RenderingX, net: NetworkConnector) => {
    const container = createElement('div')
    const search = document.createElement('input')
    search.placeholder = "Search something...";
    const settings = span(undefined, 'webgen-svg')
    fetch(pandaIcon).then(x => x.text())
        .then(x => settings.innerHTML = x)
    const upload = mIcon("cloud_queue")
    container.classList.add('homebar')
    const control = controlPanelContent(web);
    control.getShell().classList.add('datastore-dialog');
    const dialog = controlPanelDialog(web, control);
    settings.onclick = () => dialog.open()
    registerEvent(DataStoreEvents.RecivedProfileData, (data) => {
        upload.innerHTML = data.canUpload ? "cloud_upload" : "cloud_off"
        upload.onclick = data.canUpload ? () => {
            manualUploadImage(net);
        } : () => web.notify("Uploading with this account is disabled")
        control.forceRedraw({
            username: data.username,
            canRemove: data.canRemove,
            canUpload: data.canUpload,
            userId: data.userId,
            createDate: data.createDate
        })
    })
    getStoredData().then((data) => {
        control.forceRedraw({
            iconCount: data?.length ?? undefined
        })
    })

    registerEvent(DataStoreEvents.RefreshDataComplete, () => {
        getStoredData().then((data) => {
            control.forceRedraw({
                iconCount: data?.length ?? undefined
            })
        })
    });

    container.append(search, upload, settings)
    return container;
}