import { SupportedThemes, WebGen } from "@lucsoft/webgen";
import { updateColorBarTheme } from "./common/themeColorBar";
import { renderMain } from "./dashboard";
const web = WebGen({ theme: Number(localStorage.getItem('webgen-theme') ?? SupportedThemes.auto) })
updateColorBarTheme(Number(localStorage.getItem('webgen-theme') ?? SupportedThemes.auto))
renderMain(web.render, web.theme)

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
    });
}