import { WebGen } from "@lucsoft/webgen";
const web = new WebGen()

import('./dashboard').then(x => x.renderMain(web))