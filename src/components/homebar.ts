import { NetworkConnector } from "@lucsoft/network-connector";
import { createElement, mIcon, RenderElement, RenderingX, span } from "@lucsoft/webgen";
import '../../res/css/homebar.css';
import pandaIcon from '../../res/pandaicon.svg';

import { DataStoreEvents, registerEvent } from "../common/eventmanager";
import { ProfileData } from "../types/profileDataTypes";
import { manualUploadImage } from "./upload";

export const renderHomeBar = (web: RenderingX, net: NetworkConnector): RenderElement => ({
    draw: () => {
        const container = createElement('div')
        const search = document.createElement('input')
        search.placeholder = "Search something...";
        const control = span(undefined, 'webgen-svg')
        fetch(pandaIcon).then(x => x.text())
            .then(x => control.innerHTML = x)
        const upload = mIcon("cloud_queue")
        container.classList.add('homebar')

        registerEvent(DataStoreEvents.RecivedProfileData, (data: ProfileData) => {
            upload.innerHTML = data.canUpload ? "cloud_upload" : "cloud_off"
            upload.onclick = data.canUpload ? () => {
                manualUploadImage(net);
            } : () => web.notify("Uploading with this account is disabled")
        })
        container.append(search, upload, control)
        return container;
    }
})