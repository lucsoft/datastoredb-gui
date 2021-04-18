import { Button, createElement, DialogActionAfterSubmit, list as List, multiStateSwitch, RenderingX, RenderingXResult, span, SupportedThemes, switchButtons } from "@lucsoft/webgen";
import '../../res/css/dialog.css';
import { ControlPanelType } from "../types/controlPanel";
import { Style } from "@lucsoft/webgen/bin/lib/Style";
import { updateTheme } from "../common/theming";
import { list } from "../common/list";
import { envData } from "../common/envdata";
import { PandaIcon } from "./pandaIcon";
import { timeAgo } from "../common/date";
import { resetAllData, setStore } from "../common/api";

const renderCopryrightNotice = () => {
    const shell = span([
        `DataStoreDB-GUI v${envData.version} (${envData.lastCommit.substr(0, 8)}, ${new Date(envData.compiledDate).toLocaleDateString()})`,
        `© 2020–${new Date(envData.compiledDate).getFullYear()} lucsoft\n`,
        'This programm is published under the terms of the CC0 license and may include these products: \nHmSYS, @lucsoft/network-connector and @lucsoft/webgen'
    ].join('\n'));
    shell.classList.add('copyright-notice');
    return shell;
}

const selectorView = (state: ControlPanelType, update: (data: Partial<ControlPanelType>) => void, theme: Style) => {
    switch (state.render) {
        case 'home':
            return List({}, {
                left: 'Account age',
                right: span(timeAgo(state.createDate))
            }, {
                left: 'Running since',
                right: span(timeAgo(state.uptime))
            }, {
                left: 'Events Emitted',
                right: span(state.eventsEmitted?.toString())
            }, {
                left: 'Icons',
                right: span(state.iconCount?.toString())
            });
        case 'news':
            return span("Some more text coming here");
        case 'settings':
            return List({}, {
                left: 'Theme',
                right: multiStateSwitch("small",
                    { title: "Dimmed", action: () => updateTheme(theme, SupportedThemes.gray) },
                    { title: "Dark", action: () => updateTheme(theme, SupportedThemes.dark) },
                    { title: "White", action: () => updateTheme(theme, SupportedThemes.white) },
                    { title: "System", action: () => updateTheme(theme, SupportedThemes.auto) },
                )
            }, {
                left: 'Compact View Mode',
                right: switchButtons({
                    checked: state.compactView,
                    onAnimationComplete: () => {
                        setStore('compact-view', !state.compactView)
                        update({ compactView: !state.compactView })
                    }
                })
            }, {
                left: 'Always Show Variants',
                right: switchButtons({
                    checked: state.showAlwaysAllVariants,
                    onAnimationComplete: () => {
                        setStore('always-all-variants', !state.showAlwaysAllVariants)
                        update({ showAlwaysAllVariants: !state.showAlwaysAllVariants })
                    }
                })
            }, {
                left: 'Clear Storage',
                right: multiStateSwitch("small",
                    {
                        title: "Clear " + state.iconCount + " Files",
                        action: () => resetAllData()
                    }
                )
            }, {
                left: 'Username',
                right: span(state.username + '\n#' + state.userId, 'small-text')
            })
        case 'about':
            return list([
                PandaIcon().draw(),
                renderCopryrightNotice()
            ])
        default:
            return span("WIP");
    }
};
export const controlPanelContent = (web: RenderingX, theme: Style) => web.toCustom({ shell: createElement('div') }, { render: 'home' } as ControlPanelType, [
    (_, update) => Button({
        big: false,
        list: [
            { text: 'Home', onclick: () => update({ render: 'home' }) },
            { text: 'News', onclick: () => update({ render: 'news' }) },
            { text: 'Settings', onclick: () => update({ render: 'settings' }) },
            { text: 'About Panda', onclick: () => update({ render: 'about' }) }
        ]
    }),
    (state, update) => selectorView(state, update, theme)
])
export const controlPanelDialog = (web: RenderingX, control: RenderingXResult<any>) => web.toDialog({
    title: "Panda",
    content: control,
    userRequestClose: () => DialogActionAfterSubmit.Close,
    buttons: [
        [ 'Report a bug', () => {
            open("https://github.com/lucsoft/datastoredb-gui/issues/new")
            return undefined;
        } ],
        [ 'close', DialogActionAfterSubmit.Close ]
    ]
})