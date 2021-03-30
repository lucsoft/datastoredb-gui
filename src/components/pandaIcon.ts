import { RenderElement, span } from "@lucsoft/webgen";
import pandaIcon from '../../res/pandaicon.svg';

export const PandaIcon = (): RenderElement => {

    const icon = span(undefined, 'webgen-svg', 'panda-icon')
    fetch(pandaIcon).then(x => x.text())
        .then(x => {
            icon.innerHTML = x
        })

    return {
        draw: () => {
            return icon;
        }
    }
}