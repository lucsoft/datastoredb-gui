import { custom, DialogActionAfterSubmit, img, input, mIcon, RenderingX, span } from "@lucsoft/webgen";
import { triggerUpdateResponse } from "../common/api";
import { list } from "../common/list";
import { hmsys } from "../dashboard";
import { UploadWizard, UploadWizardData } from "../types/UploadWizard";
import { resetFiles, uploadImage } from "./upload";

export const generateUploadWizard = (rendr: RenderingX): UploadWizard => {
    const onClose = () => {
        resetFiles();
        return DialogActionAfterSubmit.Close;
    };

    const uploadData = rendr.toCustom({}, {} as UploadWizardData, [
        ({ icon }) => img(icon),
        ({ name }, update) => ({
            draw: () => {
                const data = custom('div', name, 'icon-title')
                data.contentEditable = "true";
                data.onblur = () => update({ name: data.innerText })
                return name ? data : span("");
            }
        }),
        ({ tags, editTags }, update) => ({
            draw: () => {
                const add = mIcon('edit')
                add.onclick = () => update({ editTags: true })
                if (editTags) {
                    const tagsInput = input({
                        value: tags?.join(' ')
                    })
                    tagsInput.autofocus = true;
                    tagsInput.onblur = () => update({
                        editTags: false,
                        tags: tagsInput.value
                            .split(/_| |-|%20|,/)
                    })
                    tagsInput.classList.add('tags-input')
                    return tagsInput;
                }
                else if (tags)
                    return list([ ...tags.map(x => span('#' + x)), add ], [ 'tags-list' ]);
                else
                    return span("")
            }
        }),
        ({ files }) => span(((files?.length ?? 0) > 1) ? `You will upload ${files?.length ?? 0} Files.\nLet's see how fast our Pandas can handle your request.` : "You can update title & tags before you upload this File.\n")
    ]);

    uploadData.getShell().classList.add('dropwizard')

    const uploadWizard = rendr.toDialog({
        title: 'Finish your upload',
        content: uploadData,
        userRequestClose: onClose,
        buttons: [
            [ 'Cancel', onClose ],
            [ 'Upload', async () => {
                const state = uploadData.getState();
                const files = state.files;
                if (!files) return undefined;
                const response = (await uploadImage(files, hmsys))?.items

                if (response?.length == 1)
                    await triggerUpdateResponse(response[ 0 ].id, { tags: state.tags, filename: state.name })
                return DialogActionAfterSubmit.Close;
            } ]
        ]
    });

    return {
        dialog: uploadWizard,
        handleAuto: (files) => {
            if (files?.length == 1) {
                const icon = files.item(0);
                const name = icon?.name.replace(/\.([a-zA-Z])+$/, '') ?? ''
                uploadData.forceRedraw({
                    icon: URL.createObjectURL(icon),
                    name,
                    tags: name.split(/_| |-|%20/),
                    files
                })
            } else
                uploadData.forceRedraw({ files })

            uploadWizard.open()
        },
        data: uploadData
    }
}