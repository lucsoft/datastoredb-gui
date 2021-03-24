import { createLocalStorageProvider, EventTypes, NetworkConnector } from "@lucsoft/network-connector";
import { noteCard, WebGen, WebGenElements } from "@lucsoft/webgen";
import * as config from '../../../config.json';
import { DataStoreEvents, emitEvent } from "../../common/eventmanager";
import { disableGlobalDragAndDrop } from "../../components/dropareas";
import { ProfileData } from "../../types/profileDataTypes";
import { db } from "../IconsCache";

export function updateFirstTimeDatabase(hmsys: NetworkConnector, elements: WebGenElements, _web: WebGen) {
    if (navigator.onLine == false)
        return;
    hmsys.connect(createLocalStorageProvider(async () => config[ "default-user" ])).then(async (_) => {
        const profileData: any = await hmsys.api.requestUserData("services", "profile");
        if (profileData.services.DataStoreDB == undefined)
            return elements.cards({}, noteCard({
                title: 'DataStoreDB is not setup for this account',
                icon: '⛔'
            }));

        if (profileData.services.DataStoreDB.upload != true) disableGlobalDragAndDrop()


        emitEvent(DataStoreEvents.RecivedProfileData, {
            canUpload: profileData.services.DataStoreDB.upload,
            canRemove: profileData.services.DataStoreDB.remove,
            featureEnabled: profileData.services.DataStoreDB != undefined,
            username: profileData.client.username
        } as ProfileData)
        emitEvent(DataStoreEvents.RefreshData, hmsys)
    });
    hmsys.api.sync('@HomeSYS/DataStoreDB/removeFile', async (data) => {
        if (/apple/i.test(navigator.vendor))
            emitEvent(DataStoreEvents.RefreshData, hmsys)
        else {
            await db.transaction('rw', db.icons, async () => {
                await db.icons.delete(data.deleted)
            })
            emitEvent(DataStoreEvents.RefreshDataComplete, hmsys)
        }
        emitEvent(DataStoreEvents.SidebarUpdate, data.deleted)
    })
    hmsys.api.sync('@HomeSYS/DataStoreDB/newFile', () => {
        emitEvent(DataStoreEvents.RefreshData, hmsys)
    })
    hmsys.event({
        type: EventTypes.Disconnected,
        action: () => {
            // if (navigator.onLine)
            //     setTimeout(() => updateFirstTimeDatabase(hmsys, elements), 5000)
        }
    })
}