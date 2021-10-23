import { BootstrapIcons, SupportedThemes, WebGen } from "@lucsoft/webgen";
import { renderMain } from "./components/views/dashboard";

const web = WebGen({
    theme: Number(localStorage.getItem('webgen-theme') ?? SupportedThemes.auto),
    icon: new BootstrapIcons(),
    events: {
        themeChanged: (e) => {
            new BroadcastChannel("themeChange").postMessage(e)
        }
    }
})
renderMain(web.theme)