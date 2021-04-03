import { EventTypes } from "@lucsoft/network-connector"
import { DialogActionAfterSubmit, RenderElement, RenderingX, span, SupportedThemes } from "@lucsoft/webgen"
import { DataStoreEvents, registerEvent } from "../common/eventmanager"
import '../../res/css/incidentbar.css'
import { hmsys } from "../dashboard"
import { Style } from "@lucsoft/webgen/bin/lib/Style"
import { updateColorBar, updateColorBarTheme } from "../common/themeColorBar"

export const createIncidentBar = (web: RenderingX, style: Style): RenderElement => ({
    draw: () => {
        style.onThemeUpdate((e) => {
            updateColorBarTheme(e)
        })

        hmsys.event({
            type: EventTypes.Disconnected,
            action: () =>
                navigator.onLine ?
                    web.toDialog({
                        title: 'Disconnected!',
                        userRequestClose: () => {
                            location.href = location.href;
                            return DialogActionAfterSubmit.Close;
                        },
                        content: span('You got disconnected to the HmSYS Network.'),
                        buttons: [
                            [ 'reconnect', () => { location.href = location.href; return DialogActionAfterSubmit.RemoveClose; } ]
                        ]
                    }).open() : {}
        })

        const element = document.createElement('span')
        element.classList.add('incident-bar');

        registerEvent(DataStoreEvents.IncidentBar, (data) => {
            if (data == undefined) {
                updateColorBarTheme(Number(localStorage.getItem('webgen-theme') ?? SupportedThemes.auto))
                element.classList.remove('active')
            }
            else {
                updateColorBar("#e48208")
                element.classList.add('active')
                element.innerText = data.message;
            }
        })

        return element;
    }
})