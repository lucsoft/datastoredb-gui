import { DataStoreEvents, emitEvent } from "../common/eventmanager";
import { hmsys } from "../components/views/dashboard";
import { fetchIconsToStoreInDB } from "../logic/blobIconMerged";
import { db, Icon } from "./IconsCache";

export function registerCloudSync() {
    hmsys.api.sync('@HomeSYS/DataStoreDB/removeFile', async (data: { deleted: string }) => {
        db.transaction('rw', db.icons, async () => {
            await db.icons.bulkDelete([ data.deleted ])
        })
            .catch(() => { })
            .then(() => emitEvent(DataStoreEvents.SyncIconRemove, [ data.deleted ]))
    })

    hmsys.api.sync('@HomeSYS/DataStoreDB/newFile', async (data: { new: Icon[] }) => {
        const blobList = await fetchIconsToStoreInDB(data.new, data.new.map(x => x.id));
        db.transaction('rw', db.icons, async () => {
            await db.icons.bulkAdd(blobList)
        })
            .catch(() => { })
            .then(() => emitEvent(DataStoreEvents.SyncIconAdd, blobList))
    })

    hmsys.api.sync('@HomeSYS/DataStoreDB/updateFile', async (data: Icon) => {
        const oldIcon = await db.icons.filter(x => x.id == data.id).first();

        db.transaction('rw', db.icons, async () => {
            if (oldIcon)
                await db.icons.bulkPut([
                    {
                        ...(await db.icons.filter(x => x.id == data.id).first())!,
                        ...data
                    }
                ])
            else {
                const blobList = await fetchIconsToStoreInDB([ data ], [ data.id ]);
                await db.icons.bulkAdd(blobList)
            }

        })
            .catch(() => { })
            .then(async () =>
                emitEvent(DataStoreEvents.SyncIconUpdate, [ (await db.icons.filter(x => x.id == data.id).first())! ])
            )
    })
}