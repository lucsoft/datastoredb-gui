import { SupportedThemes } from "@lucsoft/webgen"
import { Icon } from "../data/IconsCache"
import { ProfileData } from "../types/profileDataTypes"
import { SidebarData } from "../types/sidebarTypes"

export const enum DataStoreEvents {
    ConnectionLost,
    ThemeChange,
    IncidentBar,
    /**
     * @deprecated to be removed
     */
    SidebarUpdate,
    RecivedProfileData,
    SearchBarUpdated,
    SearchBarAddTag,

    SyncIconUpdate,
    SyncIconAdd,
    SyncIconRemove
}

let events: DataStoreEvent[] = []

type DataStoreEvent = {
    id: DataStoreEvents
    action: (metaData: any) => void
}

type DataStoreEventType<TypeT> =
    (TypeT extends DataStoreEvents.RecivedProfileData ? ProfileData : unknown)
    & (TypeT extends DataStoreEvents.IncidentBar ? (undefined | { message: string }) : unknown)
    & (TypeT extends DataStoreEvents.SidebarUpdate ? SidebarData : unknown)
    & (TypeT extends DataStoreEvents.SyncIconRemove ? string[] : unknown)
    & (TypeT extends DataStoreEvents.SyncIconAdd ? Icon[] : unknown)
    & (TypeT extends DataStoreEvents.SyncIconUpdate ? Icon[] : unknown)
    & (TypeT extends DataStoreEvents.SearchBarUpdated ? { includeTags: string[], execludeTags: string[], filteredText: string } | 'indirect-rerender' : unknown)
    & (TypeT extends DataStoreEvents.SearchBarAddTag ? string : unknown)
    & (TypeT extends DataStoreEvents.ThemeChange ? SupportedThemes : unknown)

export const registerEvent = <TypeT extends DataStoreEvents>(id: TypeT, action: (metaData: DataStoreEventType<TypeT>) => void) => {
    events.push({ id, action })
}
export const emitEvent = <TypeT extends DataStoreEvents>(id: TypeT, metaData: DataStoreEventType<TypeT>) => {
    console.log(id, metaData);
    events.filter(x => x.id === id).forEach(x => x.action(metaData))
}