import { hmsys } from "../dashboard";
import { uploadImage } from "./upload";

export function registerMasterDropArea() {
    const html = document.querySelector('html')!;

    html.ondrop = (e: DragEvent) => {
        if (html.classList.contains('disable-global-drop')) return;
        e.preventDefault()
        html.classList.remove('drop-feedback')
        if (e.dataTransfer?.files)
            uploadImage(e.dataTransfer.files, hmsys)
    }
    html.ondragover = (e) => {
        if (html.classList.contains('disable-global-drop') || e.dataTransfer?.types[ 0 ] != "Files") return;
        html.classList.add('drop-feedback')
        e.preventDefault()
    }

    html.ondragenter = (e) => {
        if (html.classList.contains('disable-global-drop')
            || html.classList.contains('drop-feedback')
            || e.dataTransfer?.types[ 0 ] != "Files") return;
        html.classList.add('drop-feedback')
    }
    html.ondragleave = (e: DragEvent) => {
        if (html.classList.contains('disable-global-drop')) return;
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