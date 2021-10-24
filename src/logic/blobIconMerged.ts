import { Icon } from "../data/IconsCache";

export const mergeBlobWithId = (pool: Icon[], [ iconId, data ]: [ iconId: string, data: Blob ]): Icon => {
    const icon = pool.find((x: Icon) => x.id == iconId)!;
    return { ...icon, data: new File([ data ], icon.filename, { type: icon.type }) }
}