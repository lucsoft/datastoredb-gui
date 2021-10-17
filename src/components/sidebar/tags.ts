import { input, mIcon, RenderingXResult, span } from "@lucsoft/webgen";
import { triggerUpdate } from "../../common/api";
import { DataStoreEvents, emitEvent } from "../../common/eventmanager";
import { Icon } from "../../data/IconsCache";
import { SideBarType } from "../../types/sidebarTypes";

export const sidebarGenerateTags = (sidebarX: () => RenderingXResult<SideBarType>, icon?: Icon, canEdit?: boolean, editTags?: boolean) => {
    const add = canEdit == true ? mIcon('edit') : ""
    if (add)
        add.onclick = () => sidebarX().forceRedraw({ editTags: true })
    if (editTags != true && icon?.tags)
        return [ ...icon.tags.map(x => {
            const tag = span('#' + x)
            tag.onclick = () => {
                sidebarX().forceRedraw({
                    showSidebar: false,
                    showVariantsView: false
                })
                emitEvent(DataStoreEvents.SearchBarAddTag, x);
            }
            return tag
        }), add ];
    else if (editTags == true) {
        const tagsInput = input({
            value: icon?.tags.join(' ')
        })
        //@ts-ignore
        tagsInput.autofocus = true;
        tagsInput.onblur = () => {
            const newData = tagsInput.value.split(/_| |-|%20|,/)
            if (JSON.stringify(newData) != JSON.stringify(icon?.tags))
                triggerUpdate(icon!.id, { tags: newData })
            sidebarX().forceRedraw({
                editTags: false
            })
        }
        return [ tagsInput ];
    }
    else
        return [ add ];
}