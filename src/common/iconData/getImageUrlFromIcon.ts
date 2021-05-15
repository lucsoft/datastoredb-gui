import { Icon } from "../../data/IconsCache";

export const getImageSourceFromIconOpt = (x?: Icon): string | undefined =>
    x ? URL.createObjectURL(x.data) : undefined;
