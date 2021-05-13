import { createElement } from "@lucsoft/webgen";

export const list = (element: HTMLElement[], classList?: string[]) => {
    const list = createElement('div');
    list.classList.add(...classList ?? []),
        list.append(...element)
    return list;
}