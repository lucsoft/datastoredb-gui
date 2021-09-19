import { EventTypes } from "@lucsoft/network-connector";
import { DialogActionAfterSubmit, RenderingX, span } from "@lucsoft/webgen";
import * as config from '../../config.json';
import { DataStoreEvents, emitEvent } from "../common/eventmanager";
import { disableGlobalDragAndDrop } from "../components/dropareas";
import { hmsys } from "../components/views/dashboard";
import { ProfileData } from "../types/profileDataTypes";
import { db, Icon } from "./IconsCache";

export function updateFirstTimeDatabase(web: RenderingX) {
    const backDialog = web.toDialog({
        title: 'You are Back!',
        content: span('It looks like you are back! Lets join the HmSYS Network.'),
        buttons: [
            [ 'reconnect', () => { location.href = location.href; return DialogActionAfterSubmit.Close; } ]
        ]
    })
    window.addEventListener('online', () => {
        emitEvent(DataStoreEvents.IncidentBar, undefined)
        backDialog.open()
    })
    if (navigator.onLine == false) {
        emitEvent(DataStoreEvents.IncidentBar, {
            message: "Connect to the Internet to interact with Panda"
        })
        return;
    }
    window.addEventListener('offline', () => {
        emitEvent(DataStoreEvents.IncidentBar, {
            message: "Connect to the Internet to interact with Panda"
        })
        emitEvent(DataStoreEvents.ConnectionLost, undefined);
    })
    hmsys.rawOn(EventTypes.LoginSuccessful, async () => {
        const { userData }: any = await hmsys.api.requestUserData("services", "profile");
        if (userData.services.DataStoreDB == undefined)
            web.toDialog({
                title: "Panda is unavailable",
                content: span("This Account dosn't have access to Panda. Change your Account."),
                buttons: [ [ 'okay', DialogActionAfterSubmit.RemoveClose ] ]
            }).open()

        if (userData.services.DataStoreDB.upload != true) disableGlobalDragAndDrop()
        emitEvent(DataStoreEvents.RecivedProfileData, {
            canUpload: userData.services.DataStoreDB.upload,
            canRemove: userData.services.DataStoreDB.remove,
            canEdit: userData.services.DataStoreDB.edit,
            featureEnabled: userData.services.DataStoreDB != undefined,
            username: userData.profile.username,
            userId: userData.profile.id,
            createDate: userData.profile.createDate,
        } as ProfileData)
        emitEvent(DataStoreEvents.RefreshData, hmsys)
    });
    hmsys.rawOn(EventTypes.CredentialsRequired, async () =>
        hmsys.authorize(config[ "default-user" ].email, config[ "default-user" ].password));
    hmsys.ready();
    hmsys.api.sync('@HomeSYS/DataStoreDB/removeFile', async (data) => {
        await db.transaction('rw', db.icons, async () => {
            await db.icons.delete(data.deleted)
        })
        emitEvent(DataStoreEvents.RefreshDataComplete, { removed: [ data.deleted ] })
        emitEvent(DataStoreEvents.SidebarUpdate, data.deleted)
    })
    hmsys.api.sync('@HomeSYS/DataStoreDB/newFile', () => {
        emitEvent(DataStoreEvents.RefreshData, hmsys)
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
        emitEvent(DataStoreEvents.RefreshDataComplete, { updated: [ data.id ] })
    })

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
}