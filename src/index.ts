import { SupportedThemes, WebGen } from "@lucsoft/webgen";
import { renderMain } from "./dashboard";
const web = WebGen({ theme: Number(localStorage.getItem('webgen-theme') ?? SupportedThemes.auto) })

renderMain(web.render, web.theme)

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw/service.js')
    });
}