import { config } from "../common/envdata";
import { DataStoreEvents, emitEvent } from "../common/eventmanager";
import { hmsys } from "../components/views/dashboard";
import { fetchIconsToStoreInDB } from "../logic/blobIconMerged";
import { findChangesFromIcon } from "../logic/iconCompare";
import { db, GetFilesResponse, Icon } from "./IconsCache";

export async function checkForChangesWhileOffline() {
    const { data } = await hmsys.api.triggerWithResponse(config.targetId, { type: "getFiles" }) as { data: GetFilesResponse };
    const oldData = await db.icons.toArray();
    const toUpdate = data.files.filter(findChangesFromIcon(oldData)).map((x: Icon) => x.id)

    const toRemove = oldData.map(x => x.id).filter(x => !data.files.map((x: Icon) => x.id).includes(x))
    const toAdd = data.files.map((x: Icon) => x.id).filter((x: string) => !oldData.map(x => x.id).includes(x))

    const toUpdateIcons = await fetchIconsToStoreInDB(data.files, toUpdate);
    const toAddIcons = await fetchIconsToStoreInDB(data.files, toAdd);

    try {
        await db.transaction('rw', db.icons, async () => {
            await db.icons.bulkDelete(toRemove)
            await db.icons.bulkPut(toUpdateIcons)
            await db.icons.bulkAdd(toAddIcons)
        })
    } catch (error) {
        console.log(error)
    }
    if (toAddIcons.length) emitEvent(DataStoreEvents.SyncIconAdd, toAddIcons)
    if (toUpdateIcons.length) emitEvent(DataStoreEvents.SyncIconUpdate, toUpdateIcons);
    if (toRemove.length) emitEvent(DataStoreEvents.SyncIconRemove, toRemove)
}