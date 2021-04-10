import { Icon } from "../../data/IconsCache";

export function isVariantFrom(icon: Icon, cachedAllData: Icon[]): Icon | undefined {
    return icon.variantFrom ? cachedAllData.find(x => x.id == icon.variantFrom) : undefined;
}