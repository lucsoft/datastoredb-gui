import { SupportedThemes, WebGen } from "@lucsoft/webgen";
import { updateColorBarTheme } from "./common/user/theming";
import { renderMain } from "./components/views/dashboard";
const web = WebGen({ theme: Number(localStorage.getItem('webgen-theme') ?? SupportedThemes.auto) })
updateColorBarTheme(Number(localStorage.getItem('webgen-theme') ?? SupportedThemes.auto))
renderMain(web.render, web.theme)

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(function (registrations) {
        for (let registration of registrations) {
            registration.unregister()
        }
    })
}