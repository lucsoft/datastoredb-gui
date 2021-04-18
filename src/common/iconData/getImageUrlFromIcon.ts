import { Icon } from "../../data/IconsCache";

export function getImageSourceFromIconOpt(x?: Icon): string | undefined {
    if (x)
        return URL.createObjectURL(x.data);
    else return undefined;
}