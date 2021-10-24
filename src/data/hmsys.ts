import { EventTypes } from "@lucsoft/network-connector";
import { Dialog, span } from "@lucsoft/webgen";
import { config } from "../common/envdata";
import { DataStoreEvents, emitEvent } from "../common/eventmanager";
import { disableGlobalDragAndDrop } from "../components/dropareas";
import { hmsys } from "../components/views/dashboard";
import { ProfileData } from "../types/profileDataTypes";
import { db, Icon } from "./IconsCache";

const reconnectDialog = Dialog(({ use }) => {
    use(span('It looks like you are back! Lets join the HmSYS Network.'))
})
    .setTitle("You are Back!")
    .onClose(() => { location.href = location.href; })
    .addButton("Reconnect", "close")

export function updateFirstTimeDatabase() {
    window.addEventListener('online', () => {
        emitEvent(DataStoreEvents.IncidentBar, undefined)
        reconnectDialog.open()
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
            Dialog(({ use }) => use(span("This Account dosn't have access to Panda. Change your Account.")))
                .setTitle("Panda is unavailable")
                .addButton("Okay", "close")
                .open()

        if (userData.services.DataStoreDB.upload != true) disableGlobalDragAndDrop()
        console.log(userData);
        emitEvent(DataStoreEvents.RecivedProfileData, {
            canUpload: userData.services.DataStoreDB.upload,
            canRemove: userData.services.DataStoreDB.remove,
            canEdit: userData.services.DataStoreDB.edit,
            featureEnabled: userData.services.DataStoreDB != undefined,
            username: userData.profile.username,
            userId: userData._id,
            createDate: userData.profile.created,
        } as ProfileData)
        emitEvent(DataStoreEvents.RefreshData, hmsys)
    });
    hmsys.rawOn(EventTypes.CredentialsRequired, async () =>
        hmsys.authorize(config.defaultUser.email, config.defaultUser.password));
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