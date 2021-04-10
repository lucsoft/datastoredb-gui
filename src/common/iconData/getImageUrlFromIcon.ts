import { Icon } from "../../data/IconsCache";

export function getImageSourceFromIcon(x: Icon): string {
    return URL.createObjectURL(new File([ x.data ], x.filename, { type: x.type }));
}

export function getImageSourceFromIconOpt(x?: Icon): string | undefined {
    if (x)
        return URL.createObjectURL(new File([ x.data ], x.filename, { type: x.type }));
    else return undefined;
}