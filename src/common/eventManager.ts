export enum DataStoreEvents {
    IncidentBar,
    RefreshData,
    RefreshDataComplete,
    SidebarUpdate,
    RecivedProfileData
}

let events: DataStoreEvent[] = []

type DataStoreEvent = {
    id: DataStoreEvents
    action: (metaData: any) => void
}

export const registerEvent = (id: DataStoreEvents, action: (metaData: any) => void) => {
    events.push({ id, action })
}

export const emitEvent = (id: DataStoreEvents, metaData: any) => {
    events.filter(x => x.id === id).forEach(x => x.action(metaData))
}