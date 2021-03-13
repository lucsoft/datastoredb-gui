import { SupportedThemes, WebGen } from "@lucsoft/webgen";
const web = new WebGen({ theme: SupportedThemes.white })

import('./dashboard').then(x => x.renderMain(web))