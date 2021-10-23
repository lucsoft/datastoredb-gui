import { hmsys } from "./views/dashboard";
import { resetFiles, uploadImage } from "./upload";
import '../../res/css/dialogDropFiles.css';
import { UploadWizard } from "../types/UploadWizard";
import { config } from "../common/envdata";
import { dropFilesHere } from "./dialogs";

export function registerMasterDropArea(wizard: UploadWizard) {
    const html = document.querySelector('html')!;

    html.ondrop = (e: DragEvent) => {
        if (html.classList.contains('disable-global-drop')
            || !e.dataTransfer?.types.includes("Files")
            || !config.supportedIcontypes.includes(e.dataTransfer.items[ 0 ].type)) return;
        e.preventDefault()
        html.classList.remove('drop-feedback')
        const files = e.dataTransfer?.files;

        dropFilesHere.close();
        if (files?.length == 0) return
        if (e.shiftKey == false)
            wizard.handleAuto(files)

        else if (files)
            uploadImage(files, hmsys)
    }
    html.ondragover = (e) => {
        if (html.classList.contains('disable-global-drop')
            || !e.dataTransfer?.types.includes("Files")
            || !config.supportedIcontypes.includes(e.dataTransfer.items[ 0 ].type)) return;
        html.classList.add('drop-feedback')
        dropFilesHere.open()
        e.preventDefault()
    }

    html.ondragenter = (e) => {
        if (html.classList.contains('disable-global-drop')
            || html.classList.contains('drop-feedback')
            || !e.dataTransfer?.types.includes("Files")
            || !config.supportedIcontypes.includes(e.dataTransfer.items[ 0 ].type)) return;
        html.classList.add('drop-feedback')
        dropFilesHere.open()
    }
    html.ondragleave = (e: DragEvent) => {
        if (e.relatedTarget != null) return;
        html.classList.remove('drop-feedback')
        resetFiles();
        dropFilesHere.close()
    }
}

export function disableGlobalDragAndDrop() {
    document.querySelector('html')?.classList.add('disable-global-drop')
}

export function enableGlobalDragAndDrop() {
    document.querySelector('html')?.classList.remove('disable-global-drop')
}