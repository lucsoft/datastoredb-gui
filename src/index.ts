import { SupportedThemes, WebGen } from "@lucsoft/webgen";
import { renderMain } from "./dashboard";
const web = WebGen({ theme: Number(localStorage.getItem('webgen-theme') ?? SupportedThemes.auto) })

renderMain(web.render, web.theme)