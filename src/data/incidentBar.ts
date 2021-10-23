import { EventTypes } from "@lucsoft/network-connector"
import { Component, createElement, custom, SupportedThemes } from "@lucsoft/webgen"
import { DataStoreEvents, emitEvent, registerEvent } from "../common/eventmanager"
import '../../res/css/incidentbar.css'
import { hmsys } from "../components/views/dashboard"
import { updateColorBar } from "../common/user/theming"

export const createIncidentBar = (): Component => ({
    draw: () => {
        hmsys.rawOn(EventTypes.Disconnected, () => {
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
        })
        const element = createElement('span')
        const shell = custom('div', element, 'incident-shell')
        element.classList.add('incident-bar');

        registerEvent(DataStoreEvents.IncidentBar, (data) => {
            if (data == undefined) {
                emitEvent(DataStoreEvents.ThemeChange, Number(localStorage.getItem('webgen-theme') ?? SupportedThemes.auto))
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