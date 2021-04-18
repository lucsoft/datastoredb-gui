import { db, Icon } from '../data/IconsCache';
import * as config from '../../res/config.json';
import { DataStoreEvents, emitEvent, registerEvent } from "./eventmanager";
import { massiveDownload } from "./massiveDownload";
export let lastFilesCollected: Icon[] | undefined = undefined;
export const getStoredData = async () => await db.icons.orderBy('id').toArray()
registerEvent(DataStoreEvents.RefreshData, async (hmsys) => {
    const { data } = await hmsys.api.triggerResponse(config.targetId, { type: "getFiles" }) as any;
    const oldData = await db.icons.toArray();
    const toUpdate: string[] = data.files.filter((x: Icon) => {
        const thing = oldData.find(y => y.id == x.id)
        if (thing == undefined) return false;
        if (
            thing.tags.toString() == x.tags.toString()
            && thing.filename == x.filename
            && thing.variantFrom == x.variantFrom
            && thing.date == x.date
        )
            return false;
        return true;
    }).map((x: Icon) => x.id)

    const toRemove = oldData.map(x => x.id).filter(x => !data.files.map((x: Icon) => x.id).includes(x))
    const toAdd: string[] = data.files.map((x: Icon) => x.id).filter((x: string) => !oldData.map(x => x.id).includes(x))
    let toAddBlobs: Blob[] = [];
    if (toAdd.length < 20) {
        const toAddFetch: Response[] = await Promise.all(toAdd.map((x: string) => hmsys.rest.get(config.targetId, `file/${x}`)))
        toAddBlobs = await Promise.all(toAddFetch.map(x => x.blob()))
    } else {
        toAddBlobs = (await massiveDownload(toAdd)).flat().map((_, i, blobArray) => blobArray.find(x => x[ 0 ] == toAdd[ i ])![ 1 ])
    }
    const toUpdateFetch: Response[] = await Promise.all(toUpdate.map((x: string) => hmsys.rest.get(config.targetId, `file/${x}`)))
    const toUpdateBlobs = await Promise.all(toUpdateFetch.map(x => x.blob()))
    lastFilesCollected = toAdd.map((entry, index) => ({
        ...data.files.find((x: Icon) => x.id == entry),
        data: toAddBlobs[ index ]
    }))
    try {
        await db.transaction('rw', db.icons, async () => {
            await db.icons.bulkDelete(toRemove)
            await db.icons.bulkPut(toUpdate.map((entry, index) =>
            ({
                ...data.files.find((x: Icon) => x.id == entry),
                data: toUpdateBlobs[ index ]
            })))
            await db.icons.bulkAdd(toAdd.map((entry, index) =>
            ({
                ...data.files.find((x: Icon) => x.id == entry),
                data: toAddBlobs[ index ]
            })))
        })
    } catch (error) {
        console.log(error)
    }
    if (toAdd.length !== 0 || toRemove.length !== 0 || toUpdate.length !== 0)
        emitEvent(DataStoreEvents.RefreshDataComplete, { new: toAdd, removed: toRemove, updated: toUpdate })
})