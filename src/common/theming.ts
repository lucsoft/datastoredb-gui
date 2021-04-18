import { SupportedThemes } from "@lucsoft/webgen"
import { Style } from "@lucsoft/webgen/bin/lib/Style";

export const updateTheme = (theme: Style, selected: SupportedThemes) => {
    theme.updateTheme(selected)
    localStorage.setItem('webgen-theme', selected.toString());
}
export function updateColorBar(color: string) {

    const metaTag = document.head.querySelector('meta[name="theme-color"]')
    if (metaTag)
        metaTag.setAttribute('content', color)
    if (!metaTag) {
        const metaTag = document.createElement('meta')
        metaTag.name = "theme-color"
        metaTag.content = color
        document.head.append(metaTag)
    }
}

export function updateColorBarTheme(theme: SupportedThemes) {
    switch (theme) {
        case SupportedThemes.autoDark:
        case SupportedThemes.dark:
            updateColorBar('#0a0a0a')
            break;
        case SupportedThemes.autoWhite:
        case SupportedThemes.white:
            updateColorBar('#e6e6e6')
            break;
        case SupportedThemes.gray:
            updateColorBar('#171717')
            break;
        default:
            break;
    }
}