import { BootstrapIcons, SupportedThemes, WebGen } from "@lucsoft/webgen";
import { DataStoreEvents, emitEvent } from "./common/eventmanager";
import { renderMain } from "./components/views/dashboard";

const web = WebGen({
    theme: Number(localStorage.getItem('webgen-theme') ?? SupportedThemes.auto),
    icon: new BootstrapIcons(),
    events: {
        themeChanged: (e) => {
            emitEvent(DataStoreEvents.ThemeChange, e)
        }
    }
})
renderMain(web.theme)