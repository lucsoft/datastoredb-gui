import { EventTypes } from "@lucsoft/network-connector"
import { createElement, custom, RenderElement, SupportedThemes } from "@lucsoft/webgen"
import { DataStoreEvents, emitEvent, registerEvent } from "../common/eventmanager"
import '../../res/css/incidentbar.css'
import { hmsys } from "../dashboard"
import { Style } from "@lucsoft/webgen/bin/lib/Style"
import { updateColorBar, updateColorBarTheme } from "../common/user/theming"

export const createIncidentBar = (style: Style): RenderElement => ({
    draw: () => {
        style.onThemeUpdate((e) => {
            updateColorBarTheme(e)
        })

        hmsys.event({
            type: EventTypes.Disconnected,
            action: () => {
                if (navigator.onLine) {
                    emitEvent(DataStoreEvents.IncidentBar, {
                        message: "Oooh Snap! You caught us. We are doing some Maintenance work on the HmSYS Network\nCheck back later."
                    })
                }
                else
                    emitEvent(DataStoreEvents.IncidentBar, {
                        message: "You are offline. No connection to the HmSYS Network anymore."
                    })

                emitEvent(DataStoreEvents.ConnectionLost, undefined)
            }
        })
        const element = createElement('span')
        const shell = custom('div', element, 'incident-shell')
        element.classList.add('incident-bar');

        registerEvent(DataStoreEvents.IncidentBar, (data) => {
            if (data == undefined) {
                updateColorBarTheme(Number(localStorage.getItem('webgen-theme') ?? SupportedThemes.auto))
                shell.classList.remove('active')
            }
            else {
                updateColorBar("#e48208")
                setTimeout(() => updateColorBar("#e48208"), 300)
                shell.classList.add('active')
                element.innerText = data.message;
            }
        })

        return shell;
    }
})