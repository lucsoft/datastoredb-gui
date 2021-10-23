import { db, GetFilesResponse, Icon } from '../data/IconsCache';
import { DataStoreEvents, emitEvent, registerEvent } from "./eventmanager";
import { triggerRawImages } from "./api";
import { config } from "./envdata";
const mapBlobToFile = (data: Blob, icon: Icon) => new File([ data ], icon.filename, { type: icon.type });

registerEvent(DataStoreEvents.RefreshData, async (hmsys) => {
    const { data } = await hmsys.api.triggerWithResponse(config.targetId, { type: "getFiles" }) as { data: GetFilesResponse };
    const oldData = await db.icons.toArray();
    const toUpdate = data.files.filter(findChangesFromIcon(oldData)).map((x: Icon) => x.id)

    const toRemove = oldData.map(x => x.id).filter(x => !data.files.map((x: Icon) => x.id).includes(x))
    const toAdd = data.files.map((x: Icon) => x.id).filter((x: string) => !oldData.map(x => x.id).includes(x))
    // TODO FIX THIS SORTING WTF?!?
    let toAddBlobs = (await triggerRawImages(toAdd)).map((_, i, blobArray) => blobArray.find(x => x[ 0 ] == toAdd[ i ])![ 1 ]);

    const toUpdateBlobs = (await triggerRawImages(toUpdate)).map(x => x[ 1 ]);

    try {
        await db.transaction('rw', db.icons, async () => {
            await db.icons.bulkDelete(toRemove)
            await db.icons.bulkPut(toUpdate.map((entry, index) =>
            ({
                ...data.files.find((x: Icon) => x.id == entry)!,
                data: mapBlobToFile(toUpdateBlobs[ index ], data.files[ index ])
            })))
            await db.icons.bulkAdd(toAdd.map((entry, index) =>
            ({
                ...data.files.find((x: Icon) => x.id == entry)!,
                data: mapBlobToFile(toAddBlobs[ index ], data.files[ index ])
            })))
        })
    } catch (error) {
        console.log(error)
    }
    if (toAdd.length !== 0 || toRemove.length !== 0 || toUpdate.length !== 0)
        emitEvent(DataStoreEvents.RefreshDataComplete, { new: toAdd, removed: toRemove, updated: toUpdate })
})

const findChangesFromIcon = (oldData: Icon[]): any => (x: Icon) => {
    const thing = oldData.find(y => y.id == x.id);
    if (thing == undefined) return false;
    return !(thing.tags.toString() == x.tags.toString()
        && thing.filename == x.filename
        && thing.variantFrom == x.variantFrom
        && thing.date == x.date);
};