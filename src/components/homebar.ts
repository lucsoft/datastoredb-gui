import { createElement, custom, span, conditionalCSSClass, Horizontal, View, IconButton, Color, draw, DialogData } from "@lucsoft/webgen";
import { Style } from "@lucsoft/webgen/bin/lib/Style";
import '../../res/css/homebar.css';

import { DataStoreEvents, emitEvent, registerEvent } from "../common/eventmanager";
import { db, Icon } from "../data/IconsCache";
import { dialogControlPanel } from "./views/controlpanel";
import { SearchHandleOnKeyboardDownEvent, SearchHandleOnKeyboardUpEvent } from "../logic/searchHandler";
import { manualUploadImage } from "./upload";
import { PandaIcon } from "./pandaIcon";
import { UploadWizard } from "../types/UploadWizard";
import { getStats } from "../common/api";
import { config } from "../common/envdata";

type homeBarState = {
    uploadAllowed: boolean
};

const includeTagsRegex = /(#[\w|\d|.]*\u200b)/g;
const execludeTagsRegex = /([-|!][\w|\d|.]*\u200b)/g;
const filteredTextRegex = /([#|-|!][\w|\d|.]*\u200b)/g;

export const renderHomeBar = (style: Style, uploadWizard: UploadWizard) => {
    let iconData: Icon[] = [];
    const shell = createElement("div");
    shell.classList.add("homebar");

    async function updateIconData() {
        iconData = await db.icons.orderBy('id').filter(x => config.supportedIcontypes.includes(x.type!)).toArray();
        db.icons.count().then(iconCount => dialog.unsafeViewOptions().update({ iconCount }))
    }
    updateIconData()
    const { search, tagSelector } = createSearchComponent(() => iconData);

    const dialog = dialogControlPanel(style);
    getStats().then(x => dialog.unsafeViewOptions().update({ uptime: x.uptime, eventsEmitted: x.eventsEmitted }))
    registerEvent(DataStoreEvents.RecivedProfileData, (data) => {
        homeBar.unsafeViewOptions<homeBarState>().update({
            uploadAllowed: data.canUpload
        });
        dialog.unsafeViewOptions().update({
            username: data.username,
            canRemove: data.canRemove,
            canUpload: data.canUpload,
            userId: data.userId,
            createDate: data.createDate
        })
    })

    registerEvent(DataStoreEvents.RefreshDataComplete, () => updateIconData());

    const homeBar = View<homeBarState>(({ state, use }) => {
        use(Horizontal({},
            search,
            cloudComponent(state.uploadAllowed, uploadWizard),
            pandaComponent(dialog)
        ))
        use(tagSelector)
    }).appendOn(shell)

    return shell;
}

function createSearchComponent(data: () => Icon[]) {
    const search = createElement('input') as HTMLInputElement;
    search.placeholder = "Search for Icons, Images and more...";
    const tagSelector = custom('ul', span('Pro Tip: Use ! or # to filter for tags', 'help'), 'tag-selector');
    let tagSelectIndex = 0;
    search.onfocus = () => conditionalCSSClass(tagSelector, true, 'show');
    search.onblur = () => tagSelector.children.length == 1 && tagSelector.classList.contains('show') ? conditionalCSSClass(tagSelector, false, 'show') : undefined;

    const filteredUpdate = () => emitEvent(DataStoreEvents.SearchBarUpdated, {
        includeTags: search.value.match(includeTagsRegex)?.map(x => x.substring(1, x.length - 1)) ?? [],
        execludeTags: search.value.match(execludeTagsRegex)?.map(x => x.substring(1, x.length - 1)) ?? [],
        filteredText: search.value.replaceAll(filteredTextRegex, '').trim()
    });

    registerEvent(DataStoreEvents.SearchBarAddTag, (data) => {
        search.value += ` #${data}\u200b `;
        filteredUpdate();
    })

    const tagSetter = (val?: number) => val !== undefined ? tagSelectIndex = val : tagSelectIndex;
    search.onkeyup = SearchHandleOnKeyboardUpEvent(tagSelector, tagSetter, search, () => data(), filteredUpdate);
    search.onkeydown = SearchHandleOnKeyboardDownEvent(tagSelector, tagSetter, search, filteredUpdate);
    return { search, tagSelector };
}

function cloudComponent(uploadEnabled?: boolean, uploadWizard?: UploadWizard) {
    return IconButton({
        clickOn: uploadEnabled && uploadWizard ? () => {
            manualUploadImage((files) => files ? uploadWizard.handleAuto(files) : undefined);
        } : undefined,
        color: uploadEnabled === false ? Color.Disabled : undefined,
        icon: uploadEnabled == null ? "cloud-drizzle-fill" : (uploadEnabled ? "cloud-arrow-up-fill" : "cloud-slash-fill")
    });
}

function pandaComponent(dialog: DialogData) {
    const panda = draw(IconButton({
        clickOn: dialog.open,
        icon: ""
    }))
    panda.replaceChildren(draw(PandaIcon()));
    return panda;
}