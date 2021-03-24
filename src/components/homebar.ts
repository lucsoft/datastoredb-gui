import { createElement, img, mIcon, span, WebGen } from "@lucsoft/webgen";
import '../../res/css/homebar.css';
import pandaIcon from '../../res/pandaicon.svg';

import { DataStoreEvents, registerEvent } from "../common/eventmanager";
import { ProfileData } from "../types/profileDataTypes";

export function renderHomeBar(web: WebGen, shell: HTMLElement) {
    const container = createElement('div')
    shell.append(container)
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
            web.elements.notify("Currently not Implmented")
        } : () => web.elements.notify("Uploading with this account is disabled")
    })
    container.append(search, upload, control)
    // menu.last.style.gridTemplateColumns = "auto 12rem";
}