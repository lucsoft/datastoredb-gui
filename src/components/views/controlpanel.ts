import { Button, Checkbox, Dialog, list as List, span, SupportedThemes, Vertical } from "@lucsoft/webgen";
import '../../../res/css/dialog.css';
import { ControlPanelType } from "../../types/controlPanel";
import { updateTheme } from "../../common/user/theming";
import { list } from "../list";
import { envData } from "../../common/envdata";
import { PandaIcon } from "../pandaIcon";
import { timeAgo } from "../../common/user/date";
import { getStore, resetAllData, setStore } from "../../common/api";
import { DataStoreEvents, emitEvent } from "../../common/eventmanager";
import { Style } from "@lucsoft/webgen/bin/lib/Style";

const renderCopryrightNotice = () => {
    const shell = span([
        `DataStoreDB-GUI v${envData.version} (${envData.lastCommit.substr(0, 8)}, ${new Date(envData.compiledDate).toLocaleDateString()})`,
        `© 2020–${new Date(envData.compiledDate).getFullYear()} lucsoft\n`,
        'This programm is published under the terms of the CC0 license and may include these products: \nHmSYS, @lucsoft/network-connector and @lucsoft/webgen'
    ].join('\n'));
    shell.classList.add('copyright-notice');
    return shell;
}

export const dialogControlPanel = (theme: Style) => Dialog<ControlPanelType>(({ use, state, update }) => {
    use(Vertical({},
        Button({ text: "Home", pressOn: () => update({ render: 'home' }) }),
        Button({ text: "News", pressOn: () => update({ render: 'news' }) }),
        Button({ text: "Settings", pressOn: () => update({ render: 'settings' }) }),
        Button({ text: "About Panda", pressOn: () => update({ render: 'about' }) }),
    ))
    if (state.render == "home")
        use(List({},
            { left: 'Account age', right: span(timeAgo(state.createDate)) },
            { left: 'Running since', right: span(timeAgo(state.uptime)) },
            { left: 'Events Emitted', right: span(state.eventsEmitted?.toString()) },
            { left: 'Icons', right: span(state.iconCount?.toString()) }
        ));
    else if (state.render == "news")
        use(span("Some more text coming here"))
    else if (state.render == "settings")
        use(List({}, {
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
            left: 'Clear Storage',
            right: Button({
                text: "Clear " + state.iconCount + " Files",
                pressOn: resetAllData
            })
        }, {
            left: 'Username',
            right: span(state.username + '\n#' + state.userId, 'small-text')
        }))
    else if (state.render === "about")
        use(list([
            PandaIcon().draw(),
            renderCopryrightNotice()
        ]))
    else
        update({
            render: "home",
            compactView: getStore('compact-view'),
            showAlwaysAllVariants: getStore('always-all-variants')
        })
})
    .setTitle("Panda")
    .allowUserClose()
    .addClass("datastore-dialog")
    .addButton("Report a bug", () => {
        open("https://github.com/lucsoft/datastoredb-gui/issues/new")
        return undefined;
    })
    .addButton("close", "close")