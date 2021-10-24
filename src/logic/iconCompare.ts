import { Icon } from "../data/IconsCache";

export const findChangesFromIcon = (oldData: Icon[]): any => (x: Icon) => {
    const thing = oldData.find(y => y.id == x.id);
    if (thing == undefined) return false;
    return !(thing.tags.toString() == x.tags.toString()
        && thing.filename == x.filename
        && thing.variantFrom == x.variantFrom
        && thing.date == x.date);
};