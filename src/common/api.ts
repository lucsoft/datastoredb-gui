import { hmsys } from "../dashboard";
const moduleId = '@HomeSYS/DataStoreDB';
import * as config from "../../config.json";
import { db } from "../data/IconsCache";

export const apiPath = () => `http${config[ "default-https" ] ? 's' : ''}://${config[ "default-ip" ]}/api/@HomeSYS/DataStoreDB/`;
export const triggerUpdateResponse = async (id: string, data: Partial<{
    filename: string,
    variantFrom: string,
    tags: string[]
}>) => {
    await hmsys.api.triggerResponse(moduleId, {
        ...data,
        type: "updateFile",
        id
    })
}
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
    return fetch(`http${config[ "default-https" ] ? 's' : ''}://${config[ "default-ip" ]}/stats`).then(x => x.json())
}
export const setStore = (type: 'always-all-variants' | 'compact-view', value: boolean) => {
    localStorage[ type ] = value.toString();
}
export const getStore = (type: 'always-all-variants' | 'compact-view') =>
    localStorage[ type ] == 'true';

export const resetAllData = () => {
    localStorage.removeItem('always-all-variants')
    localStorage.removeItem('compact-view')
    localStorage.removeItem('first-time-load')
    db.delete().then(() => location.href = location.href)
}