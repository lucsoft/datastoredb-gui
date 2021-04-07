export type SidebarNormalData = {
    offset: () => {
        bound: DOMRect;
        left: number;
        top: number;
    },
    image: string,
    id: string,
    date: number,
    alts: string[],
    isVariantFrom?: [ id: string, img: string, name: string ],
    possiableAlts: [ id: string, img: string, name: string ][]
    tags: string[],
    displayName: string,
    type: string
};
export type SidebarData = SidebarNormalData | undefined | string