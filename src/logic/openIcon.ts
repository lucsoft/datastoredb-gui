import { DataStoreEvents, emitEvent } from "../common/eventmanager";
import { getPossibleVariants, isVariantFrom } from "../common/iconData/variants";
import { db, Icon } from "../data/IconsCache";

export async function sidebarOpenIcon(icon: Icon) {
    const cachedAllData = await db.icons.toArray();
    emitEvent(DataStoreEvents.SidebarUpdate, {
        currentIcon: icon,
        imageVariants: cachedAllData.filter(x => x.variantFrom == icon.id),
        variantFrom: isVariantFrom(icon, cachedAllData),
        possiableVariants: getPossibleVariants(cachedAllData, icon)
    });
}