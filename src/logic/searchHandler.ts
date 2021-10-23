import { conditionalCSSClass, span } from "@lucsoft/webgen";
import { compareArray, execludeCompareArray } from "../common/iconData/arrayCompare";
import { Icon } from "../data/IconsCache";

let getWidth = (fontSize: string, value: string) => {
    let div = document.createElement('div');
    div.innerHTML = value;
    div.style.fontSize = fontSize;
    div.style.width = 'auto';
    div.style.display = 'inline-block';
    div.style.visibility = 'hidden';
    div.style.position = 'fixed';
    div.style.overflow = 'auto';
    document.body.append(div)
    let width = div.clientWidth;
    div.remove();
    return width;
};
export const SearchHandleOnKeyboardUpEvent = (tagSelector: HTMLElement, tagIndex: (value?: number) => number, search: HTMLInputElement, iconData: () => Icon[], filteredUpdate: () => void) => (e: KeyboardEvent) => {

    const possibleNewTag = search.value.match(/[#|!|-][\w|\d|.]*$/g);
    tagSelector.style.left = (getWidth(search.style.fontSize, search.value)).toString() + "px";
    const includeTags = search.value.match(/(#[\w|\d|.]*\u200b)/g)?.map(x => x.substring(1, x.length - 1)) ?? [];
    const execludeTags = search.value.match(/([-|!][\w|\d|.]*\u200b)/g)?.map(x => x.substring(1, x.length - 1)) ?? [];

    conditionalCSSClass(tagSelector, !!possibleNewTag || search.value.length == 0, 'show')
    if ((e.key == "Enter" || e.key == "Tab") && possibleNewTag) {
        search.value = search.value.substring(0, search.value.length - possibleNewTag[ 0 ].length + 1)
            + tagSelector.children[ tagIndex() ].getAttribute('value') + "\u200b "
        search.onkeyup?.(e)
        filteredUpdate();
    }
    else if (!possibleNewTag) {
        tagSelector.innerHTML = "";
        tagSelector.append(span('Pro Tip: Use ! or # to filter for tags', 'help'))
        filteredUpdate()
    }
    else if (!(e.key == "ArrowDown" || e.key == "ArrowUp") && possibleNewTag && iconData && e.key.length == 1) {
        const unsortedData: [ label: string, counter: number ][] = [];
        tagIndex(0)
        iconData()
            .map(x => x.tags)
            .flat()
            .filter(x => x.toLowerCase().startsWith(possibleNewTag[ 0 ].replace(/[#|!|-]/, '').toLowerCase()))
            .forEach(x => {
                const data = unsortedData.find(([ label ]) => label.toLowerCase() == x.toLowerCase())
                if (data) data[ 1 ]++
                else unsortedData.push([ x, 1 ])
            })
        tagSelector.innerHTML = "";
        const sortedData = unsortedData
            .filter(sorted => (iconData().filter(x => {
                if (possibleNewTag[ 0 ].startsWith('#'))
                    return compareArray(x.tags, [ ...includeTags, sorted[ 0 ] ]) && execludeCompareArray(x.tags, [ ...execludeTags ])
                else
                    return execludeTags.includes(sorted[ 0 ]) ? false : compareArray(x.tags, [ ...includeTags ]) && execludeCompareArray(x.tags, [ ...execludeTags, sorted[ 0 ] ])

            }).length > 0))
            .sort((a, b) => b[ 1 ] - a[ 1 ])
            .filter(x => !includeTags.find(y => y.toLowerCase() == x[ 0 ].toLowerCase()))
            .map(([ label, count ], index) => {

                const spanLabel = span(`${label} ${count - 1 ? `(${count})` : ''}`)
                spanLabel.setAttribute('value', label)
                spanLabel.onclick = () => {
                    search.value = search.value.substring(0, search.value.length - possibleNewTag[ 0 ].length + 1)
                        + tagSelector.children[ index ].getAttribute('value') + "\u200b "
                    search.onkeyup?.(e)
                }
                return spanLabel
            })
        if (sortedData.length > 0) {
            tagSelector.append(...sortedData, span('Press [TAB] to submit', 'help'))
            tagSelector.querySelectorAll('*')[ tagIndex() ].classList.add('selected')
        } else
            tagSelector.append(span('Sorry, we don\'t have no any more tags', 'help'))
    }
}

export const SearchHandleOnKeyboardDownEvent = (tagSelector: HTMLElement, tagSelectIndex: (val?: number) => number, search: HTMLInputElement, filteredUpdate: () => void) => (e: KeyboardEvent): void => {

    if (e.key == "Tab")
        e.preventDefault();
    else if ((e.key == "ArrowDown" || e.key == "ArrowUp") && tagSelector.children.length >= 2) {
        e.preventDefault();
        tagSelector.querySelectorAll('.selected')[ 0 ]?.classList.remove('selected');
        if (e.key == "ArrowUp") {
            if (tagSelectIndex() != 0)
                tagSelectIndex(tagSelectIndex() - 1)
            else
                tagSelectIndex(tagSelector.children.length - 2)
        } else {
            if (tagSelectIndex() == tagSelector.children.length - 2)
                tagSelectIndex(0);
            else
                tagSelectIndex(tagSelectIndex() + 1)
        }
        tagSelector.querySelectorAll('*')[ tagSelectIndex() ].classList.add('selected');
    }
    else if (e.key == "Backspace" && search.value.substr(0, search.selectionStart ?? 0).endsWith('\u200b ')) {
        e.preventDefault();
        const match = search.value.substr(0, search.selectionStart ?? 0)
            .match(/[#|!|-][\w|\d|.]*\u200b $/);
        if (match)
            search.value = search.value.replace(match[ 0 ], '');
        if (search.value.length == 0) {
            filteredUpdate()
        }
    }
    else if ((e.key == "ArrowLeft" && search.value.substr(0, search.selectionStart ?? 0).endsWith('\u200b ')) || (e.key == "ArrowRight" && search.value.substr(search.selectionStart ?? 0).match(/^[#|!|-].*\u200b /))) {
        e.preventDefault();

        if (e.key == "ArrowLeft") {
            const match = search.value.substr(0, search.selectionStart ?? 0)
                .match(/[#|!|-][\w|\d|.]*\u200b $/);

            if (match)
                search.selectionEnd = search.selectionStart = search.selectionStart ? search.selectionStart - match[ 0 ].length : 0;

        } else if (e.key == "ArrowRight") {
            const match = search.value.substr(search.selectionStart ?? 0)
                .match(/^[#|!|-][\w|\d|.]*\u200b /);

            if (match)
                search.selectionEnd = search.selectionStart = (search.selectionStart ?? 0) + match[ 0 ].length;
        }
    }

};