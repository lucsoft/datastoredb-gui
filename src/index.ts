import { WebGen } from "@lucsoft/webgen";
const web = WebGen().render

import('./dashboard').then(x => x.renderMain(web))