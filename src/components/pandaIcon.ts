import { Component, span } from "@lucsoft/webgen";
import pandaIcon from '../../res/pandaicon.svg';

const data = await fetch(pandaIcon).then(x => x.text());

export const PandaIcon = (): Component => {
    const icon = span(undefined, 'webgen-svg', 'panda-icon')
    icon.innerHTML = data;
    return icon;
}