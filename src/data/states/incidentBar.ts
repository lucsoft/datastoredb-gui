import { EventTypes } from "@lucsoft/network-connector"
import { DialogActionAfterSubmit, RenderElement, RenderingX, span } from "@lucsoft/webgen"
import { DataStoreEvents, registerEvent } from "../../common/eventmanager"
import '../../../res/css/incidentbar.css'
import { hmsys } from "../../dashboard"

export const createIncidentBar = (web: RenderingX): RenderElement => ({
    draw: () => {
        hmsys.event({
            type: EventTypes.Disconnected,
            action: () =>
                web.toDialog({
                    title: 'Disconnected!',
                    content: span('You got disconnected to the HmSYS Network.'),
                    buttons: [
                        [ 'ignore', DialogActionAfterSubmit.RemoveClose ],
                        [ 'reconnect', () => { location.href = location.href; return DialogActionAfterSubmit.RemoveClose; } ]
                    ]
                }).open()
        })

        const element = document.createElement('span')
        element.classList.add('incident-bar');

        registerEvent(DataStoreEvents.IncidentBar, (data) => {
            if (data == undefined)
                element.classList.remove('active')
            else if (data.type == "good") {
                element.classList.remove('active')
                element.classList.add('good')
                element.innerText = data.message;
                setTimeout(() => element.classList.remove('good'), 5000)
            }
            else {
                element.classList.add('active', data.type ?? 'bad')
                element.innerText = data.message;
            }
        })

        return element;
    }
})