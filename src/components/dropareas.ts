import { RenderingX, span } from "@lucsoft/webgen";
import { hmsys } from "../dashboard";
import { PandaIcon } from "./pandaIcon";
import { resetFiles, uploadImage } from "./upload";
import '../../res/css/dialogDropFiles.css';
import { supportedIcontypes } from '../../config.json';
import { UploadWizard } from "../types/UploadWizard";
export function registerMasterDropArea(web: RenderingX, wizard: UploadWizard) {
    const html = document.querySelector('html')!;
    const data = web.toCustom({}, {}, [
        PandaIcon(),
        span("Drop your files Here!", "dropfilestitle")
    ]);
    data.getShell().classList.add('dialog-dropfiles')
    const dialog = web.toDialog({
        content: data
    })

    html.ondrop = (e: DragEvent) => {
        if (html.classList.contains('disable-global-drop') || !e.dataTransfer?.types.includes("Files")
            || !supportedIcontypes.includes(e.dataTransfer.items[ 0 ].type)) return;
        e.preventDefault()
        html.classList.remove('drop-feedback')
        const files = e.dataTransfer?.files;

        dialog.close(false);
        if (files?.length == 0) return
        if (e.shiftKey == false)
            wizard.handleAuto(files)

        else if (files)
            uploadImage(files, hmsys)
    }
    html.ondragover = (e) => {
        if (html.classList.contains('disable-global-drop') || !e.dataTransfer?.types.includes("Files")
            || !supportedIcontypes.includes(e.dataTransfer.items[ 0 ].type)) return;
        html.classList.add('drop-feedback')
        dialog.open()
        e.preventDefault()
    }

    html.ondragenter = (e) => {
        if (html.classList.contains('disable-global-drop')
            || html.classList.contains('drop-feedback')
            || !e.dataTransfer?.types.includes("Files")
            || !supportedIcontypes.includes(e.dataTransfer.items[ 0 ].type)) return;
        html.classList.add('drop-feedback')
        dialog.open()
    }
    html.ondragleave = (e: DragEvent) => {
        if (e.offsetX != 0) return;
        html.classList.remove('drop-feedback')
        resetFiles();
        dialog.close(false)
    }
}

export function disableGlobalDragAndDrop() {
    document.querySelector('html')?.classList.add('disable-global-drop')
}


export function enableGlobalDragAndDrop() {
    document.querySelector('html')?.classList.remove('disable-global-drop')
}