import { triggerRawImages } from "../common/api";
import { Icon } from "../data/IconsCache";

export const mergeBlobWithId = (pool: Icon[], [ iconId, data ]: [ iconId: string, data: Blob ]): Icon => {
    const icon = pool.find((x: Icon) => x.id == iconId)!;
    return { ...icon, data: new File([ data ], icon.filename, { type: icon.type }) }
}

export const fetchIconsToStoreInDB = async (pool: Icon[], target: string[]) => (await triggerRawImages(target)).map((entry) => mergeBlobWithId(pool, entry))