import { createLocalStorageProvider, EventTypes } from "@lucsoft/network-connector";
import { DialogActionAfterSubmit, RenderingX, span } from "@lucsoft/webgen";
import * as config from '../../../config.json';
import { checkIfCacheIsAllowed } from "../../common/checkIfCacheAllowed";
import { DataStoreEvents, emitEvent } from "../../common/eventmanager";
import { disableGlobalDragAndDrop } from "../../components/dropareas";
import { hmsys } from "../../dashboard";
import { ProfileData } from "../../types/profileDataTypes";
import { db } from "../IconsCache";

export function updateFirstTimeDatabase(web: RenderingX) {
    if (navigator.onLine == false) {
        emitEvent(DataStoreEvents.IncidentBar, {
            type: "bad",
            message: "Panda 2.0 is currently in offline."
        })
        return;
    }
    window.addEventListener('offline', () => {
        emitEvent(DataStoreEvents.IncidentBar, {
            type: "bad",
            message: "Panda 2.0 is currently in offline."
        })
    })
    window.addEventListener('online', () => {
        emitEvent(DataStoreEvents.IncidentBar, undefined)
        web.toDialog({
            title: 'You are Back!',
            userRequestClose: () => {
                location.href = location.href;
                return DialogActionAfterSubmit.Close;
            },
            content: span('It looks like you are back! Lets join the HmSYS Network.'),
            buttons: [
                [ 'reconnect', () => { location.href = location.href; return DialogActionAfterSubmit.RemoveClose; } ]
            ]
        }).open()
    })
    hmsys.connect(createLocalStorageProvider(async () => config[ "default-user" ])).then(async (_) => {
        const profileData: any = await hmsys.api.requestUserData("services", "profile");
        if (profileData.services.DataStoreDB == undefined)
            web.toDialog({
                title: "Panda 2.0 is unavailable",
                content: span("This Account dosn't have access to Panda 2.0. Change your Account."),
                buttons: [ [ 'okay', DialogActionAfterSubmit.RemoveClose ] ]
            }).open()

        if (profileData.services.DataStoreDB.upload != true) disableGlobalDragAndDrop()
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
        if (!checkIfCacheIsAllowed())
            emitEvent(DataStoreEvents.RefreshData, hmsys)
        else {
            await db.transaction('rw', db.icons, async () => {
                await db.icons.delete(data.deleted)
            })
            emitEvent(DataStoreEvents.RefreshDataComplete, { removed: [ data.deleted ] })
        }
        emitEvent(DataStoreEvents.SidebarUpdate, data.deleted)
    })
    hmsys.api.sync('@HomeSYS/DataStoreDB/newFile', () => {
        emitEvent(DataStoreEvents.RefreshData, hmsys)
    })

    hmsys.api.sync('@HomeSYS/DataStoreDB/updateFile', async (data: { filename: string, id: string, tags: string[], date: number }) => {
        if (!checkIfCacheIsAllowed())
            emitEvent(DataStoreEvents.RefreshData, hmsys)
        else {
            const oldIcon = await db.icons.filter(x => x.id == data.id).first();
            if (oldIcon == undefined) return;

            await db.transaction('rw', db.icons, async () => {
                await db.icons.put({
                    ...oldIcon,
                    filename: data.filename ?? oldIcon.filename,
                    tags: data.tags ?? oldIcon.tags,
                    date: data.date
                })
            })
            console.log(await db.icons.filter(x => x.id == data.id).first());
        }
        emitEvent(DataStoreEvents.RefreshDataComplete, { updated: [ data.id ] })
    })
}