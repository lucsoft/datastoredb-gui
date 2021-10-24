import { draw, Input, ViewOptions, Horizontal, nullish, Button, DialogData, IconButton } from "@lucsoft/webgen";
import { triggerUpdate } from "../../common/api";
import { DataStoreEvents, emitEvent } from "../../common/eventmanager";
import { Icon } from "../../data/IconsCache";

export const tagComponent = (icon: Icon, canEdit?: boolean, view?: ViewOptions<{ editTags: boolean }>, dialog?: DialogData) => {
    const button = IconButton({
        icon: "pencil-fill",
        clickOn: () => view?.update({ editTags: true })
    })
    if (view?.state.editTags)
        return Horizontal({ classes: [ "tags-list" ] }, (() => {
            const tag = draw(Input({
                placeholder: "Tags",
                value: icon?.tags.join(' '),
                autoFocus: true,
                blurOn: (value) => {
                    const newData = value.split(/_| |-|%20|,/)
                    if (JSON.stringify(newData) != JSON.stringify(icon?.tags))
                        triggerUpdate(icon!.id, { tags: newData })
                    view.update({ editTags: false })
                }
            }))
            tag.classList.add("tag-input");
            return tag;
        })())

    return Horizontal({ classes: [ "tags-list" ] },
        ...nullish(
            ...icon!.tags.map(tag => Button({
                text: `#${tag}`,
                pressOn: dialog ? () => {
                    dialog.close();
                    emitEvent(DataStoreEvents.SearchBarAddTag, tag);
                } : undefined
            })),
            canEdit ? button : null
        )
    );
}