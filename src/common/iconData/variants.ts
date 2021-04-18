import type { Icon } from "../../data/IconsCache";
import { compareArrayHalfMatch } from "../arrayCompare";

export function isVariantFrom(icon: Icon, cachecachedAllData: Icon[]): Icon | undefined {
    return icon.variantFrom ? cachecachedAllData.find(x => x.id == icon.variantFrom) : undefined;
}

export function getPossibleVariants(cachedAllData: Array<Icon>, icon: Icon): Icon[] {
    return cachedAllData
        .filter(x => x.id != icon.id)
        .filter(x => x.variantFrom === undefined)
        .filter(x => !cachedAllData.find(y => y.variantFrom == x.id))
        .filter(x => compareArrayHalfMatch(x.tags, icon.tags));
}