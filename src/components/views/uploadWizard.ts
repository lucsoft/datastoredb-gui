import { Component, custom, Dialog, img, Icon, span, Vertical, draw, Input } from "@lucsoft/webgen";
import { triggerUpdateResponse } from "../../common/api";
import { hmsys } from "./dashboard";
import { UploadWizard, UploadWizardData } from "../../types/UploadWizard";
import { resetFiles, uploadImage } from "../upload";
import { tagComponent } from "../sidebar/tags";

export const generateUploadWizard = (): UploadWizard => {

    let globalStateObject: (() => {
        use: (comp: Component) => void;
        state: Partial<UploadWizardData>;
        update: (data: Partial<UploadWizardData>) => void;
    }) | undefined = undefined;
    const dialog = Dialog<UploadWizardData>((obj) => {
        globalStateObject = () => obj;
        const { name, icon, files, editTags, tags } = obj.state;
        const data = custom('div', name, 'icon-title')
        data.contentEditable = "true";
        data.onblur = () => obj.update({ name: data.innerText })
        const add = draw(Icon('edit'));
        add.onclick = () => obj.update({ editTags: true })

        obj.use(Vertical({},
            img(icon),
            data,
            (() => {
                if (editTags) {
                    const tagsInput = draw(Input({
                        placeholder: "Tags sperated by `_ -,`",
                        value: tags?.join(' ')
                    }))
                    //@ts-ignore
                    tagsInput.autofocus = true;
                    tagsInput.onblur = () => obj.update({
                        editTags: false,
                        tags: tagsInput.querySelector("input")!.value
                            .split(/_| |-|%20|,/)
                    })
                    tagsInput.classList.add('tags-input')
                    return tagsInput;
                }
                else if (tags)
                    return tagComponent({ tags, date: 0, filename: "", id: "" }, true);
                else
                    return span("")
            })(),
            span(((files?.length ?? 0) > 1) ? `You will upload ${files?.length ?? 0} Files.\nLet's see how fast our Pandas can handle your request.` : "You can update title & tags before you upload this File.\n")
        ))
    })
        .allowUserClose()
        .addClass("dropwizard")
        .onClose(() => resetFiles())
        .setTitle("Finish your upload")
        .addButton("Cancel", "close")
        .addButton("Upload", async (): Promise<"close" | undefined> => {
            const { files, tags, name: filename } = globalStateObject!().state;

            if (!files) return undefined;
            const response = (await uploadImage(files, hmsys))?.items

            if (response?.length == 1)
                await triggerUpdateResponse(response[ 0 ].id, { tags, filename })

            return "close";
        });
    return {
        dialog,
        handleAuto: (files) => {
            if (files?.length == 1) {
                const icon = files.item(0);
                const name = icon?.name.replace(/\.([a-zA-Z])+$/, '') ?? ''
                globalStateObject!().update({
                    icon: URL.createObjectURL(icon),
                    name,
                    tags: name.split(/_| |-|%20/),
                    files
                })
            } else
                globalStateObject!().update({ files })

            dialog.open()
        },
        data: globalStateObject!().state as UploadWizardData
    }
}