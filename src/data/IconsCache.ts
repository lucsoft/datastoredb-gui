import Dexie from 'dexie';

class IconsCache extends Dexie {
    icons: Dexie.Table<Icon, number>

    constructor() {
        super("db");
        this.version(1).stores({
            icon: 'id,filename,date,tags,type,data,variantFrom'
        })
        this.icons = this.table("icon")
    }
}
export type GetFilesResponse = {
    files: Icon[];
}
export interface Icon {
    date: number
    filename: string
    id: string
    tags: string[]
    variantFrom?: string
    data?: File
    type?: string
}

export var db = new IconsCache();
