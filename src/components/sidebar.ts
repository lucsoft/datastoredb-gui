import type { WebGen } from "@lucsoft/webgen"

export const createSidebar = (web: WebGen) =>
{
    const sidebar = document.createElement('article')
    const webGenSidebars = web.elements.custom(sidebar)

}