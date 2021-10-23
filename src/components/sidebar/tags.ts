import { draw, Input, ViewOptions, Horizontal, nullish, Button, DialogData, Checkbox } from "@lucsoft/webgen";
import { triggerUpdate } from "../../common/api";
import { DataStoreEvents, emitEvent } from "../../common/eventmanager";
import { SideBarType } from "../../types/sidebarTypes";

export const tagComponent = (view: ViewOptions<SideBarType>, dialog?: DialogData) => {
    const { currentIcon: icon, canEdit, editTags } = view.state;

    const button = Checkbox({
        icon: "pencil-fill",
        selected: true,
        toggledOn: () => view.update({ editTags: true })
    })
    if (editTags)
        return Horizontal({ classes: [ "tags-list" ] }, (() => {
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
                view.update({ editTags: false })
            }
            return tag;
        })())

    return Horizontal({ classes: [ "tags-list" ] },
        ...nullish(
            ...icon!.tags.map(tag => Button({
                text: `#${tag}`,
                pressOn: () => {
                    dialog?.close();
                    emitEvent(DataStoreEvents.SearchBarAddTag, tag);
                }
            })),
            canEdit ? button : null
        )
    );
}