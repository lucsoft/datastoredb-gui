import { triggerRawImages } from "../common/api";
import { DataStoreEvents, emitEvent } from "../common/eventmanager";
import { hmsys } from "../components/views/dashboard";
import { mergeBlobWithId } from "../logic/blobIconMerged";
import { db, Icon } from "./IconsCache";

export function registerCloudSync() {
    hmsys.api.sync('@HomeSYS/DataStoreDB/removeFile', async (data: { deleted: string }) => {
        await db.transaction('rw', db.icons, async () => {
            await db.icons.bulkDelete([ data.deleted ])
        })
        emitEvent(DataStoreEvents.SyncIconRemove, [ data.deleted ])
    })
    hmsys.api.sync('@HomeSYS/DataStoreDB/newFile', async (data: { new: Icon[] }) => {
        const blobList = (await triggerRawImages(data.new.map(x => x.id))).map((entry) => mergeBlobWithId(data.new, entry));
        await db.transaction('rw', db.icons, async () => {
            await db.icons.bulkAdd(blobList)
        })
        emitEvent(DataStoreEvents.SyncIconAdd, blobList);
    })

    hmsys.api.sync('@HomeSYS/DataStoreDB/updateFile', async (data: { filename: string, id: string, tags: string[], date: number, variantFrom: string }) => {
        const oldIcon = await db.icons.filter(x => x.id == data.id).first();
        if (oldIcon == undefined) {
            const id = setInterval(async () => {
                const oldIcon = await db.icons.filter(x => x.id == data.id).first();
                if (oldIcon != undefined) {
                    clearInterval(id);
                    await updateIcon(oldIcon, data);
                }
            }, 100)
            return;
        };

        await updateIcon(oldIcon, data);
        emitEvent(DataStoreEvents.SyncIconUpdate, [ data ])
    })
}

async function updateIcon(oldIcon: Icon, data: { filename: string; id: string; tags: string[]; date: number; variantFrom: string }) {
    await db.transaction('rw', db.icons, async () => {
        await db.icons.put({
            ...oldIcon,
            filename: data.filename ?? oldIcon.filename,
            tags: data.tags ?? oldIcon.tags,
            date: data.date,
            variantFrom: data.variantFrom
        });
    });
}