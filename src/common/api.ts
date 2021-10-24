import { hmsys } from "../components/views/dashboard";
const moduleId = '@HomeSYS/DataStoreDB';
import { db } from "../data/IconsCache";

import { config } from "./envdata";

const { defaultHttps, defaultIp, filterMode } = config;
let data: typeof import("@zip.js/zip.js") | null = null;
export const getZipJS = async () => {
    if (data) return data;
    data = await import('@zip.js/zip.js');
    return data;
}

export const apiPath = () => `http${defaultHttps ? 's' : ''}://${defaultIp}/api/@HomeSYS/DataStoreDB/`;
export const triggerUpdateResponse = async (id: string, data: Partial<{
    filename: string,
    variantFrom: string,
    tags: string[]
}>) => {
    await hmsys.api.triggerWithResponse(moduleId, {
        ...data,
        type: "updateFile",
        id
    })
}
export const triggerRawImages = async (images: String[]) => {
    if (images.length == 0) return [];
    const rsp = await fetch(apiPath() + "file/download", {
        method: "POST",
        headers: {
            'Authorization': 'Basic ' + btoa(([ hmsys.getAuth()?.id, hmsys.getAuth()?.token ]).join(":"))
        },
        body: JSON.stringify(images)
    })
    const { BlobReader, ZipReader, BlobWriter } = await getZipJS()
    const entries = await (new ZipReader(new BlobReader(await rsp.blob()))).getEntries();

    return Promise.all(entries.map(async (x) => [ x.filename, await x.getData!(new BlobWriter()) ] as [ id: string, data: Blob ]))
};

export const triggerUpdate = (id: string, data: Partial<{
    filename: string,
    variantFrom: string | null,
    tags: string[]
}>) => {
    hmsys.api.trigger(moduleId, {
        ...data,
        type: "updateFile",
        id
    })
}
export const getStats = async () => {
    return fetch(`http${defaultHttps ? 's' : ''}://${defaultIp}/stats`).then(x => x.json())
}
export const setStore = (type: 'always-all-variants' | 'compact-view', value: boolean) => {
    localStorage[ type ] = value.toString();
}
export const getStore = (type: 'always-all-variants' | 'compact-view') =>
    localStorage[ type ] == 'true';
export const getFilterMode = (): [ displayName: string, alpha: number, filter: string ] => filterMode[ parseInt(localStorage[ "filter-mode" ] ?? "0") ] as any;
export const resetAllData = () => {
    localStorage.removeItem('always-all-variants')
    localStorage.removeItem('compact-view')
    localStorage.removeItem('first-time-load')
    localStorage.setItem('filter-mode', "0")
    db.delete().then(() => location.href = location.href)
}