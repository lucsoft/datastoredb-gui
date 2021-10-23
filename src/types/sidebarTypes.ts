import { Icon } from "../data/IconsCache";

export type SideBarType = {
    currentIcon?: Icon
    showVariantsView?: boolean
    editTags?: boolean
    variantFrom?: Icon
    imageVariants?: Icon[]
    possiableVariants?: Icon[]
    canUpload?: boolean
    username?: string
    canRemove?: boolean
    canEdit?: boolean
};

export type SidebarNormalData = {
    currentIcon: Icon,
    imageVariants: Icon[],
    variantFrom?: Icon,
    possiableVariants: Icon[]
};
export type SidebarData = SidebarNormalData | undefined | string