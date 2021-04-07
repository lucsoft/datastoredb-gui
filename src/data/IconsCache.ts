import Dexie from 'dexie';

class IconsCache extends Dexie {
    icons: Dexie.Table<Icon, number>

    constructor() {
        super("DataStoreDB");
        this.version(2).stores({
            icon: 'id,filename,date,tags,type,data,variantFrom'
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
    variantFrom: string
    data: Blob
}

export var db = new IconsCache();
