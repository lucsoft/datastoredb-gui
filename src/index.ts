import { WebGen, SupportedThemes } from "@lucsoft/webgen";
import panda from '../res/image.jpg';
const web = new WebGen({ theme: SupportedThemes.blur, image: () => panda })
import('./dashboard').then(x => x.renderMain(web))