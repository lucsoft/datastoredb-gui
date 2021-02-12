import { EventTypes, NetworkConnector } from "@lucsoft/network-connector"
import { WebGenElements } from "@lucsoft/webgen"
import { DataStoreEvents, emitEvent, registerEvent } from "../../common/eventmanager"
import '../../../res/css/incidentbar.css'

export const createIncidentBar = (ele: WebGenElements, hmsys: NetworkConnector) =>
{
    hmsys.event({
        type: EventTypes.Disconnected,
        action: () =>
            emitEvent(DataStoreEvents.IncidentBar, {
                message: `You got disconnected to the HmSYS Network. Trying to reconnect...`
            })
    })
    addEventListener("offline", () => emitEvent(DataStoreEvents.IncidentBar, {
        message: 'You are Offline. Uploading is currently disabled.'
    }))

    addEventListener("online", () => emitEvent(DataStoreEvents.IncidentBar, { type: "good", message: 'You are back online! Trying to reconnect to HmSYS' }))
    const element = document.createElement('span')
    element.classList.add('incident-bar');

    registerEvent(DataStoreEvents.IncidentBar, (data) =>
    {
        if (data == undefined)
            element.classList.remove('active')
        else if (data.type == "good")
        {
            element.classList.remove('active')
            element.classList.add('good')
            element.innerText = data.message;
            setTimeout(() => element.classList.remove('good'), 5000)
        }
        else
        {
            element.classList.add('active', data.type ?? 'bad')
            element.innerText = data.message;
        }
    })

    ele.custom({ element })
}