import { NetworkConnector } from "@lucsoft/network-connector";
import { createElement, DialogActionAfterSubmit, mIcon, RenderingX, span } from "@lucsoft/webgen";
import '../../res/css/homebar.css';
import pandaIcon from '../../res/pandaicon.svg';

import { DataStoreEvents, registerEvent } from "../common/eventmanager";
import { ProfileData } from "../types/profileDataTypes";
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
    settings.onclick = () => {
        web.toDialog({
            title: "Panda2.0 — DataStoreDB",
            content: span("Hello World! More Content comming soon"),
            buttons: [
                [ 'close', DialogActionAfterSubmit.RemoveClose ]
            ]
        }).open()
    };
    registerEvent(DataStoreEvents.RecivedProfileData, (data: ProfileData) => {
        upload.innerHTML = data.canUpload ? "cloud_upload" : "cloud_off"
        upload.onclick = data.canUpload ? () => {
            manualUploadImage(net);
        } : () => web.notify("Uploading with this account is disabled")
    })
    container.append(search, upload, settings)
    return container;
}