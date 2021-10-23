import { Button, ButtonStyle, Checkbox, Component, Dialog, Horizontal, list as List, nullish, span, SupportedThemes, Vertical } from "@lucsoft/webgen";
import '../../../res/css/dialog.css';
import { ControlPanelEnum, ControlPanelType } from "../../types/controlPanel";
import { updateTheme } from "../../common/user/theming";
import { version, lastCommit, compiledDate, news } from "../../common/envdata";
import { PandaIcon } from "../pandaIcon";
import { timeAgo } from "../../common/user/date";
import { getStore, resetAllData, setStore } from "../../common/api";
import { DataStoreEvents, emitEvent } from "../../common/eventmanager";
import { Style } from "@lucsoft/webgen/bin/lib/Style";

const renderCopryrightNotice = () => {
    const shell = span([
        `DataStoreDB-GUI v${version} (${lastCommit.substr(0, 8)}, ${new Date(compiledDate).toLocaleDateString()})`,
        `© 2020–${new Date(compiledDate).getFullYear()} lucsoft\n`,
        'This programm is published under the terms of the CC0 license and may include these products: \nHmSYS, @lucsoft/network-connector and @lucsoft/webgen'
    ].join('\n'));
    shell.classList.add('copyright-notice');
    return shell;
}

export const dialogControlPanel = (theme: Style) => Dialog<ControlPanelType>(({ use, state, update }) => {
    let view: { [ type in ControlPanelEnum ]: Component } = {
        [ ControlPanelEnum.home ]: List({},
            { left: 'Account age', right: span(timeAgo(state.createDate)) },
            { left: 'Running since', right: span(timeAgo(state.uptime)) },
            { left: 'Events Emitted', right: span(state.eventsEmitted?.toString()) },
            { left: 'Icons', right: span(state.iconCount?.toString()) }
        ),
        [ ControlPanelEnum.news ]: Vertical({ align: "flex-start" }, ...news.map(x => span(x))),
        [ ControlPanelEnum.settings ]: List({}, {
            left: 'Theme',
            right: Button({
                text: "Theme",
                dropdown: [
                    [ "Dimmed", () => updateTheme(theme, SupportedThemes.gray) ],
                    [ "Dark", () => updateTheme(theme, SupportedThemes.dark) ],
                    [ "Light", () => updateTheme(theme, SupportedThemes.light) ],
                    [ "System", () => updateTheme(theme, SupportedThemes.auto) ]
                ]
            })
        }, {
            left: 'Compact View Mode',
            right: Checkbox({
                selected: state.compactView,
                toggledOn: () => {
                    setStore('compact-view', !state.compactView)
                    emitEvent(DataStoreEvents.SearchBarUpdated, 'indirect-rerender')
                    update({ compactView: !state.compactView })
                }
            })
        }, {
            left: 'Always Show Variants',
            right: Checkbox({
                selected: state.showAlwaysAllVariants,
                toggledOn: () => {
                    setStore('always-all-variants', !state.showAlwaysAllVariants)
                    emitEvent(DataStoreEvents.SearchBarUpdated, 'indirect-rerender')
                    update({ showAlwaysAllVariants: !state.showAlwaysAllVariants })
                }
            })
        }, {
            left: 'LocalStorage',
            right: Button({ text: "Reset Client", pressOn: resetAllData })
        }, {
            left: 'Username',
            right: span(state.username + '\n#' + state.userId, 'small-text')
        }),

        [ ControlPanelEnum.about ]: Vertical({ align: "flex-start" }, PandaIcon(), renderCopryrightNotice()),
    };

    use(Horizontal({
        classes: [ "split-view" ],
        gap: "1rem"
    },
        Vertical({ classes: [ "button-list" ] },
            Button(createNavButton(state, update, "Home", ControlPanelEnum.home)),
            Button(createNavButton(state, update, "News", ControlPanelEnum.news)),
            Button(createNavButton(state, update, "Settings", ControlPanelEnum.settings)),
            Button(createNavButton(state, update, "About Panda", ControlPanelEnum.about)),
        ),
        ...nullish(state.render !== undefined ? view[ state.render ] : (update({
            render: ControlPanelEnum.home,
            compactView: getStore('compact-view'),
            showAlwaysAllVariants: getStore('always-all-variants')
        })!))
    ))
})
    .setTitle("Panda")
    .allowUserClose()
    .addClass("datastore-dialog")
    .addButton("Report a bug", () => {
        open("https://github.com/lucsoft/datastoredb-gui/issues/new")
        return undefined;
    })
    .addButton("close", "close")

function createNavButton({ render }: Partial<ControlPanelType>, update: (data: Partial<ControlPanelType>) => void, title: string, id: Partial<ControlPanelType>[ "render" ]) {
    return { text: title, state: render == id ? ButtonStyle.Secondary : ButtonStyle.Inline, pressOn: () => update({ render: id }) };
}