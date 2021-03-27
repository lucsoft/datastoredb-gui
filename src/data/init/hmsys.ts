import { createLocalStorageProvider, EventTypes, NetworkConnector } from "@lucsoft/network-connector";
import { DialogActionAfterSubmit, RenderingX, span } from "@lucsoft/webgen";
import * as config from '../../../config.json';
import { DataStoreEvents, emitEvent } from "../../common/eventmanager";
import { disableGlobalDragAndDrop } from "../../components/dropareas";
import { ProfileData } from "../../types/profileDataTypes";
import { db } from "../IconsCache";

export function updateFirstTimeDatabase(hmsys: NetworkConnector, web: RenderingX) {
    if (navigator.onLine == false)
        return;
    hmsys.connect(createLocalStorageProvider(async () => config[ "default-user" ])).then(async (_) => {
        const profileData: any = await hmsys.api.requestUserData("services", "profile");
        if (profileData.services.DataStoreDB == undefined)
            web.toDialog({
                title: "DataStoreDB is unavailable",
                content: span("This Account dosn't have access to DataStoreDB. Change your Account."),
                buttons: [ [ 'okay', DialogActionAfterSubmit.RemoveClose ] ]
            }).open()

        if (profileData.services.DataStoreDB.upload != true) disableGlobalDragAndDrop()
        console.log(profileData)
        emitEvent(DataStoreEvents.RecivedProfileData, {
            canUpload: profileData.services.DataStoreDB.upload,
            canRemove: profileData.services.DataStoreDB.remove,
            featureEnabled: profileData.services.DataStoreDB != undefined,
            username: profileData.client.username,
            userId: profileData.client.id,
            createDate: profileData.client.createDate
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
            emitEvent(DataStoreEvents.RefreshDataComplete, { removed: data.deleted })
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