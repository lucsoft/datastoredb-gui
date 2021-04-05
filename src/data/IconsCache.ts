import Dexie from 'dexie';

class IconsCache extends Dexie {
    icons: Dexie.Table<Icon, number>

    constructor() {
        super("DataStoreDB");
        this.version(1).stores({
            icon: 'id,filename,date,tags,type,data'
        })
        this.icons = this.table("icon")
    }
}

export interface Icon {
    date: number
    filename: string
    id: string
    tags: string[]
    type: string
    data: Blob
}

export var db = new IconsCache();
