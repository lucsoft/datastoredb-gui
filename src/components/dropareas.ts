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
        if (html.classList.contains('disable-global-drop')) return;
        html.classList.add('drop-feedback')
        e.preventDefault()
    }

    html.ondragenter = () => {
        if (html.classList.contains('disable-global-drop')) return;
        if (html.classList.contains('drop-feedback')) return;
        html.classList.add('drop-feedback')
    }
    html.ondragleave = (e: DragEvent) => {
        if (html.classList.contains('disable-global-drop')) return;
        if (e.offsetX != 0) return;
        html.classList.remove('drop-feedback')
    }
}

export function disableGlobalDragAndDrop() {
    document.querySelector('html')?.classList.add('disable-global-drop')
}


export function enableGlobalDragAndDrop() {
    document.querySelector('html')?.classList.remove('disable-global-drop')
}