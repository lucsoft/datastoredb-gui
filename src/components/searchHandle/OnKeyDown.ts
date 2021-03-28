export const SearchHandleOnKeyboardDownEvent = (tagSelector: HTMLElement, tagSelectIndex: number, search: HTMLInputElement) => (e: KeyboardEvent): void => {
    if (e.key == "Tab")
        e.preventDefault();
    else if ((e.key == "ArrowDown" || e.key == "ArrowUp") && tagSelector.children.length >= 2) {
        e.preventDefault();
        tagSelector.querySelectorAll('.selected')[ 0 ]?.classList.remove('selected');
        if (e.key == "ArrowUp") {
            if (tagSelectIndex != 0)
                tagSelectIndex--;
            else
                tagSelectIndex = tagSelector.children.length - 2;
        } else {
            if (tagSelectIndex == tagSelector.children.length - 2)
                tagSelectIndex = 0;

            else
                tagSelectIndex++;
        }
        tagSelector.querySelectorAll('*')[ tagSelectIndex ].classList.add('selected');
    }
    else if (e.key == "Backspace" && search.value.substr(0, search.selectionStart ?? 0).endsWith('\u200b ')) {
        e.preventDefault();
        const match = search.value.substr(0, search.selectionStart ?? 0)
            .match(/[#|!|-][\w|\d|.]*\u200b $/);
        if (match)
            search.value = search.value.replace(match[ 0 ], '');
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