import { CardTypes, WebGen } from "@lucsoft/webgen"

export const createSidebar = (web: WebGen) =>
{
    const sidebar = document.createElement('article')
    const webGenSidebars = web.elements.custom(sidebar)
    const shell = document.createElement('div')
    webGenSidebars.cards({}, {
        type: CardTypes.Headless,
        html: shell
    })
}