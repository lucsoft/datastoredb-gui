import { WebGen, SupportedThemes } from "@lucsoft/webgen";
import panda from '../res/image.jpg';
const web = new WebGen();
web.ready = () =>
{
    import('./dashboard').then(x =>
        x.renderMain(web))
}
web.style.getImage = () =>
{
    return panda
}
web.enable(SupportedThemes.blur);
