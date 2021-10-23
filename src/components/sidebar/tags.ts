import { Icon as mIcon, span, draw, Input, Component, ViewOptions } from "@lucsoft/webgen";
import { triggerUpdate } from "../../common/api";
import { DataStoreEvents, emitEvent } from "../../common/eventmanager";
import { SideBarType } from "../../types/sidebarTypes";

export const sidebarGenerateTags = (view: ViewOptions<SideBarType>): Component[] => {
    const { currentIcon: icon, canEdit, editTags } = view.state;
    const add = canEdit ? draw(mIcon('edit')) : document.createElement("p")
    if (add)
        add.onclick = () => view.update({ editTags: true })
    if (editTags != true && icon?.tags)
        return [ ...icon.tags.map(x => {
            const tag = span('#' + x)
            tag.onclick = () => {
                view.update({
                    showVariantsView: false
                })
                emitEvent(DataStoreEvents.SearchBarAddTag, x);
            }
            return tag
        }), add ];
    else if (editTags == true) {
        const tag = draw(Input({
            placeholder: "Tags",
            value: icon?.tags.join(' ')
        }))
        const tagsInput = tag.querySelector("input")!;
        //@ts-ignore
        tagsInput.autofocus = true;
        tagsInput.onblur = () => {
            const newData = tagsInput.value.split(/_| |-|%20|,/)
            if (JSON.stringify(newData) != JSON.stringify(icon?.tags))
                triggerUpdate(icon!.id, { tags: newData })
            view.update({
                editTags: false
            })
        }
        return [ tag ];
    }
    else
        return [ add ];
}