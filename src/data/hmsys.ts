import { EventTypes } from "@lucsoft/network-connector";
import { Dialog, span } from "@lucsoft/webgen";
import { config } from "../common/envdata";
import { DataStoreEvents, emitEvent } from "../common/eventmanager";
import { disableGlobalDragAndDrop } from "../components/dropareas";
import { hmsys } from "../components/views/dashboard";
import { ProfileData } from "../types/profileDataTypes";
import { checkForChangesWhileOffline } from "./changedWhileOffline";
import { registerCloudSync } from "./cloudSync";

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
        emitEvent(DataStoreEvents.RecivedProfileData, {
            canUpload: userData.services.DataStoreDB.upload,
            canRemove: userData.services.DataStoreDB.remove,
            canEdit: userData.services.DataStoreDB.edit,
            featureEnabled: userData.services.DataStoreDB != undefined,
            username: userData.profile.username,
            userId: userData._id,
            createDate: userData.profile.created,
        } as ProfileData)
        checkForChangesWhileOffline()
    });
    hmsys.rawOn(EventTypes.CredentialsRequired, async () =>
        hmsys.authorize(config.defaultUser.email, config.defaultUser.password));
    hmsys.ready();
    registerCloudSync();
}