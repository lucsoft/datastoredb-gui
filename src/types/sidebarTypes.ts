import { Icon } from "../data/IconsCache";

export type SideBarType = {
    currentIcon?: Icon
    showVariantsView?: boolean
    showSidebar?: boolean
    editTags?: boolean
    variantFrom?: Icon
    imageVariants?: Icon[]
    possiableVariants?: Icon[]
    offset?: SidebarNormalData[ "offset" ]
    canUpload?: boolean
    username?: string
    canRemove?: boolean
    canEdit?: boolean
};

export type SidebarNormalData = {
    offset: () => {
        bound: DOMRect;
        left: number;
        top: number;
    },
    currentIcon: Icon,
    imageVariants: Icon[],
    variantFrom?: Icon,
    possiableVariants: Icon[]
};
export type SidebarData = SidebarNormalData | undefined | string