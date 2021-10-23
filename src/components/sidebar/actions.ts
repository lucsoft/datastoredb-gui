import { custom, draw, Icon, span } from "@lucsoft/webgen";

export const createAction = (icon: string, text: string, isRed?: boolean, onClick?: null | ((this: GlobalEventHandlers, ev: MouseEvent) => any)) => {
    const element = custom('span', undefined, 'action', isRed ? 'red' : 'black')
    if (onClick)
        element.onclick = onClick;
    element.append(draw(Icon(icon)), span(text, 'label'))
    return element;
}