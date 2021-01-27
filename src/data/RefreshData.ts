import { NetworkConnector } from '@lucsoft/network-connector';
import { db, Icon } from './IconsCache';
import * as config from '../../res/config.json';

export async function refreshIcons(hmsys: NetworkConnector)
{
    hmsys.api.triggerResponse(config.targetId, {
        type: "getFiles"
    }).then(async ({ data }: any) =>
    {
        await db.transaction('rw', db.icons, async function ()
        {
            const oldData = await db.icons.toArray();
            const toRemove = oldData.map(x => x.id).filter(x => !data.files.map((x: Icon) => x.id).includes(x))
            const toAdd = data.files.map((x: Icon) => x.id).filter((x: string) => !oldData.map(x => x.id).includes(x))
            db.icons.bulkDelete(toRemove)

            for (const item of toAdd)
            {
                const data = await hmsys.rest.get(config.targetId, `file/${item.id}`)

                await db.icons.add({
                    ...item,
                    data: await data.blob()
                })
            }
        });
    })

}