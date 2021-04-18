import { RenderElement, span } from "@lucsoft/webgen";
import pandaIcon from '../../res/pandaicon.svg';

const data = fetch(pandaIcon).then(x => x.text());

export const PandaIcon = (): RenderElement => {
    const icon = span(undefined, 'webgen-svg', 'panda-icon')
    data.then(x => {
        icon.innerHTML = x
    })
    return {
        draw: () => {
            return icon;
        }
    }
}