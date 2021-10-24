import { draw, Horizontal, Icon, span } from "@lucsoft/webgen";

export const createAction = (icon: string, text: string, isRed?: boolean, onClick?: null | ((this: GlobalEventHandlers, ev: MouseEvent) => any)) => {
    const element = draw(Horizontal({
        classes: [ 'action', isRed ? 'red' : 'black' ],
        margin: "8px 24px",
        gap: "16px"
    },
        Icon(icon),
        span(text, 'label')
    ));
    if (onClick)
        element.onclick = onClick;

    return element;
}