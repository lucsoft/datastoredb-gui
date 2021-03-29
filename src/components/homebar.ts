import { createElement, custom, mIcon, RenderingX, span, conditionalCSSClass } from "@lucsoft/webgen";
import { Style } from "@lucsoft/webgen/bin/lib/Style";
import '../../res/css/homebar.css';
import pandaIcon from '../../res/pandaicon.svg';

import { DataStoreEvents, emitEvent, registerEvent } from "../common/eventmanager";
import { hmsys } from "../dashboard";
import { Icon } from "../data/IconsCache";
import { controlPanelContent, controlPanelDialog } from "./controlpanel";
import { getStoredData } from "./iconlist";
import { SearchHandleOnKeyboardDownEvent } from "./searchHandle/OnKeyDown";
import { SearchHandleOnKeyboardUpEvent } from "./searchHandle/OnKeyUp";
import { manualUploadImage } from "./upload";
import { supportedIcontypes } from '../../config.json';
export const renderHomeBar = (web: RenderingX, style: Style) => {
    let iconData: Icon[] = [];
    getStoredData().then((data) => {
        iconData = data.filter(icon => supportedIcontypes.includes(icon.type))
        control.forceRedraw({
            iconCount: data?.length ?? undefined
        })
    })
    const container = createElement('div')
    const search = document.createElement('input')
    search.placeholder = "Search for Icons, Images and more...";
    const settings = span(undefined, 'webgen-svg')
    const icon2 = span(undefined, 'webgen-svg')
    const tagSelector = custom('ul', span('Pro Tip: Use ! or # to filter for tags', 'help'), 'tag-selector');
    let tagSelectIndex = 0;
    search.onfocus = () => conditionalCSSClass(tagSelector, true, 'show')
    search.onblur = () => tagSelector.children.length == 1 && tagSelector.classList.contains('show') ? conditionalCSSClass(tagSelector, false, 'show') : undefined

    const filteredUpdate = () => {
        emitEvent(DataStoreEvents.SearchBarUpdated, {
            includeTags: search.value.match(/(#[\w|\d|.]*\u200b)/g)?.map(x => x.substring(1, x.length - 1)) ?? [],
            execludeTags: search.value.match(/([-|!][\w|\d|.]*\u200b)/g)?.map(x => x.substring(1, x.length - 1)) ?? [],
            filteredText: search.value.replaceAll(/([#|-|!][\w|\d|.]*\u200b)/g, '').trim()
        })
    }

    search.onkeyup = SearchHandleOnKeyboardUpEvent(tagSelector, (val) => {
        if (val !== undefined) return tagSelectIndex = val
        return tagSelectIndex
    }, search, () => iconData, filteredUpdate)

    search.onkeydown = SearchHandleOnKeyboardDownEvent(tagSelector, (val) => {
        if (val !== undefined) return tagSelectIndex = val
        return tagSelectIndex
    }, search, filteredUpdate)
    fetch(pandaIcon).then(x => x.text())
        .then(x => {
            settings.innerHTML = x
            icon2.innerHTML = x
        })
    const upload = mIcon("cloud_queue")
    container.classList.add('homebar')
    const control = controlPanelContent(icon2, web, style);
    control.getShell().classList.add('datastore-dialog');
    const dialog = controlPanelDialog(web, control);
    settings.onclick = () => dialog.open()
    registerEvent(DataStoreEvents.RecivedProfileData, (data) => {
        upload.innerHTML = data.canUpload ? "cloud_upload" : "cloud_off"
        upload.onclick = data.canUpload ? () => {
            manualUploadImage(hmsys);
        } : () => web.notify("Uploading with this account is disabled")
        control.forceRedraw({
            username: data.username,
            canRemove: data.canRemove,
            canUpload: data.canUpload,
            userId: data.userId,
            createDate: data.createDate
        })
    })

    registerEvent(DataStoreEvents.RefreshDataComplete, () => {
        getStoredData().then((data) => {
            iconData = data.filter(icon => supportedIcontypes.includes(icon.type))
            control.forceRedraw({
                iconCount: data?.length ?? undefined
            })
        })
    });

    registerEvent(DataStoreEvents.SearchBarAddTag, (data) => {
        search.value += ` #${data}\u200b `;
        filteredUpdate();
    })
    container.append(search, upload, settings, tagSelector)
    return container;
}