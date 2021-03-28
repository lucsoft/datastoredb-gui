import { WebGen } from "@lucsoft/webgen";
import { renderMain } from "./dashboard";
const web = WebGen()

renderMain(web.render, web.theme)