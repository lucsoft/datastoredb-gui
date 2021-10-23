export const enum ControlPanelEnum {
    home,
    settings,
    news,
    about,
}
export type ControlPanelType = {
    render: ControlPanelEnum
    username?: string
    canUpload?: boolean
    canRemove?: boolean
    userId?: string
    createDate?: number
    iconCount?: number
    uptime?: number
    eventsEmitted?: number
    connectedUsers?: number
    loadAverage?: [ number, number, number ]

    compactView?: boolean
    showAlwaysAllVariants?: boolean
};