import { createElement, custom, DialogActionAfterSubmit, img, multiStateSwitch, RenderingX, RenderingXResult, span, SupportedThemes } from "@lucsoft/webgen";
import '../../res/css/dialog.css';
import { envData } from "../common/envdata";
import { ControlPanelType } from "../types/controlPanel";
import { timeAgo } from "../common/date";
import { Style } from "@lucsoft/webgen/bin/lib/Style";

const renderUserProfile = (state: ControlPanelType) => {
    const shell = custom('div', undefined, 'profile-badge');

    shell.append(span(state.username, 'username'), span('#' + state.userId, 'id'));
    return shell;
};
const renderCopryrightNotice = () => {
    const shell = span([
        `DataStoreDB-GUI v${envData.version} (${envData.lastCommit.substr(0, 8)}, ${new Date(envData.compiledDate).toLocaleDateString()})`,
        `© 2020–${new Date(envData.compiledDate).getFullYear()} lucsoft\n`,
        'This programm is published under the terms of the CC0 license and may include these products: \nHmSYS, @lucsoft/network-connector and @lucsoft/webgen'
    ].join('\n'));
    shell.classList.add('copyright-notice');
    return shell;
}
const list = (element: HTMLElement[], classList?: string[]) => {
    const list = createElement('div');
    list.classList.add(...classList ?? []),
        list.append(...element)
    return list;
}
export const controlPanelContent = (webgenIcon: HTMLElement, web: RenderingX, theme: Style) => web.toCustom({ shell: createElement('div') }, {} as ControlPanelType, [
    webgenIcon,
    (state) => list([
        renderUserProfile(state),
        list([
            span(`Account created ${timeAgo(state.createDate)}\n`),
            span(`Assinged ${state.iconCount} Icons\n`),
            span(state.canRemove && state.canUpload ? 'You have full control over DataStoreDB' : `You have limited functionality for full access switch to a admin account.`)
        ], [ 'account-details' ]),
        multiStateSwitch("small",
            { title: "Dimmed", action: () => theme.updateTheme(SupportedThemes.gray) },
            { title: "Dark", action: () => theme.updateTheme(SupportedThemes.dark) },
            { title: "White", action: () => theme.updateTheme(SupportedThemes.white) },
            { title: "System", action: () => theme.updateTheme(SupportedThemes.auto) },
        ),
        renderCopryrightNotice()
    ])
])

export const controlPanelDialog = (web: RenderingX, control: RenderingXResult<any>) => web.toDialog({
    title: "DataStoreDB",
    content: control,
    buttons: [
        [ 'Report a Problem', () => {
            open("https://github.com/lucsoft/datastoredb-gui/issues/new")
            return undefined;
        } ],
        [ 'close', DialogActionAfterSubmit.Close ]
    ]
})