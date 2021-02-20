import { WebGen, SupportedThemes } from "@lucsoft/webgen";
import panda from '../res/image.jpg';
const web = new WebGen()
import('./dashboard').then(x => x.renderMain(web))
web.style.getImage = () => panda
web.style.handleTheme(SupportedThemes.blur)