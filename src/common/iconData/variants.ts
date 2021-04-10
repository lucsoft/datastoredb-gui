import { Icon } from "../../data/IconsCache";
import { compareArrayHalfMatch } from "../arrayCompare";

export function isVariantFrom(icon: Icon, cachedAllData: Icon[]): Icon | undefined {
    return icon.variantFrom ? cachedAllData.find(x => x.id == icon.variantFrom) : undefined;
}

export function getPossibleVariants(cachedAllData: Icon[], icon: Icon): Icon[] {
    return cachedAllData
        .filter(x => x.id != icon.id)
        .filter(x => x.variantFrom === undefined)
        .filter(x => !cachedAllData.find(y => y.variantFrom == x.id))
        .filter(x => compareArrayHalfMatch(x.tags, icon.tags));
}