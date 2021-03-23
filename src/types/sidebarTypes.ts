export type SidebarData = {
    offset: () => {
        bound: DOMRect;
        left: number;
        top: number;
    },
    image: string,
    id: string,
    date: number,
    alts: string[],
    tags: string[],
    displayName: string,
    type: string
} | undefined | string