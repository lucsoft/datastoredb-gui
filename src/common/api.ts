import { hmsys } from "../dashboard";
const moduleId = '@HomeSYS/DataStoreDB';

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
    variantFrom: string,
    tags: string[]
}>) => {
    hmsys.api.trigger(moduleId, {
        ...data,
        type: "updateFile",
        id
    })
}