import { custom, mIcon, span } from "@lucsoft/webgen";

export const createAction = (icon: string, text: string, isRed?: boolean, onClick?: null | ((this: GlobalEventHandlers, ev: MouseEvent) => any)) => {
    const element = custom('span', undefined, 'action', isRed ? 'red' : 'black')
    if (onClick)
        element.onclick = onClick;
    element.append(mIcon(icon), span(text, 'label'))
    return element;
}