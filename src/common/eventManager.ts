import { NetworkConnector } from "@lucsoft/network-connector"
import { ProfileData } from "../types/profileDataTypes"
import { SidebarData } from "../types/sidebarTypes"

export const enum DataStoreEvents {
    IncidentBar,
    RefreshData,
    RefreshDataComplete,
    SidebarUpdate,
    RecivedProfileData,
    IconDataLoaded,
    SearchBarUpdated,
    SearchBarAddTag,
    ConnectionLost
}

let events: DataStoreEvent[] = []

type DataStoreEvent = {
    id: DataStoreEvents
    action: (metaData: any) => void
}


type DataStoreEventType<TypeT> =
    (TypeT extends DataStoreEvents.RecivedProfileData ? ProfileData : unknown)
    & (TypeT extends DataStoreEvents.IncidentBar ? (undefined | { message: string }) : unknown)
    & (TypeT extends DataStoreEvents.RefreshData ? NetworkConnector : unknown)
    & (TypeT extends DataStoreEvents.SidebarUpdate ? SidebarData : unknown)
    & (TypeT extends DataStoreEvents.RefreshDataComplete ? { new?: string[], removed?: string[], updated?: string[] } : unknown)
    & (TypeT extends DataStoreEvents.SearchBarUpdated ? { includeTags: string[], execludeTags: string[], filteredText: string } | 'indirect-rerender' : unknown)
    & (TypeT extends DataStoreEvents.SearchBarAddTag ? string : unknown)

export const registerEvent = <TypeT extends DataStoreEvents>(id: TypeT, action: (metaData: DataStoreEventType<TypeT>) => void) => {
    events.push({ id, action })
}
export const emitEvent = <TypeT extends DataStoreEvents>(id: TypeT, metaData: DataStoreEventType<TypeT>) => {
    events.filter(x => x.id === id).forEach(x => x.action(metaData))
}