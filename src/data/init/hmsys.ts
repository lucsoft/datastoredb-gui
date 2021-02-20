import { createLocalStorageProvider, EventTypes, NetworkConnector } from "@lucsoft/network-connector";
import { noteCard, WebGenElements } from "@lucsoft/webgen";
import * as config from '../../../config.json';
import { DataStoreEvents, emitEvent } from "../../common/eventmanager";

export function updateFirstTimeDatabase(hmsys: NetworkConnector, elements: WebGenElements)
{
    if (navigator.onLine == false)
        return;
    hmsys.connect(createLocalStorageProvider(async () => config[ "default-user" ])).then(async (_) =>
    {
        const profileData: any = await hmsys.api.requestUserData("services");
        if (profileData.services.DataStoreDB == undefined)
            return elements.cards({}, noteCard({
                title: 'DataStoreDB is not setup for this account',
                icon: '⛔'
            }));

        if (profileData.services.DataStoreDB.upload != true)
            elements.cards({}, noteCard({
                title: 'Uploading with this account is disabled',
                icon: '🚦'
            }));

        emitEvent(DataStoreEvents.RefreshData, hmsys)
    });

    hmsys.event({
        type: EventTypes.Disconnected,
        action: () =>
        {
            if (navigator.onLine)
                setTimeout(() => updateFirstTimeDatabase(hmsys, elements), 5000)
        }
    })
}