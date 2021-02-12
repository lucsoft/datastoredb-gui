import { db, Icon } from '../data/IconsCache';
import * as config from '../../res/config.json';
import { DataStoreEvents, emitEvent, registerEvent } from "./eventmanager";

registerEvent(DataStoreEvents.RefreshData, async (hmsys) =>
{
    const { data } = await hmsys.api.triggerResponse(config.targetId, { type: "getFiles" }) as any;

    const oldData = await db.icons.toArray();
    const toRemove = oldData.map(x => x.id).filter(x => !data.files.map((x: Icon) => x.id).includes(x))
    const toAdd: string[] = data.files.map((x: Icon) => x.id).filter((x: string) => !oldData.map(x => x.id).includes(x))
    const toAddFetch: Response[] = await Promise.all(toAdd.map((x: string) => hmsys.rest.get(config.targetId, `file/${x}`)))
    const toAddBlobs = await Promise.all(toAddFetch.map(x => x.blob()))

    await db.transaction('rw', db.icons, async () =>
    {
        await db.icons.bulkDelete(toRemove)
        await db.icons.bulkAdd(toAdd.map((entry, index) =>
        ({
            ...data.files.find((x: Icon) => x.id == entry),
            data: toAddBlobs[ index ]
        })))
    })

    emitEvent(DataStoreEvents.RefreshDataComplete, { new: toAdd, removed: toRemove })
})