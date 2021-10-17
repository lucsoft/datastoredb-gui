import type { NetworkConnector } from '@lucsoft/network-connector';
import * as config from '../../config.json';
import { apiPath } from "../common/api";
const form = document.createElement('form');
const fileUp = document.createElement('input');
fileUp.type = "file";
fileUp.name = "userfile";
fileUp.accept = config.supportedIcontypes.join(',');
fileUp.multiple = true;

const submit = document.createElement('input');
submit.value = "test";
submit.type = "submit";
form.append(fileUp, submit);
form.hidden = true;
document.body.append(form)

export const resetFiles = () => form.reset();
type responseType = { items: { "id": string, "filename": string, "type": string, "tags": string[], "date": number }[] };
const fetchUploadFiles = (fileUp: HTMLInputElement, hmsys: NetworkConnector, form: HTMLFormElement, done: (data?: responseType | undefined) => void, variantFrom?: string) => {
    if (fileUp.value == "")
        return done(undefined);

    const data = new FormData(form);
    const { id, token } = hmsys.getAuth()!

    fetch(apiPath() + 'file/upload' + (variantFrom ? "?variant-from=" + variantFrom : ""), {
        method: 'POST',
        headers: {
            'Authorization': 'Basic ' + btoa(`${id}:${token}`)
        },
        body: data
    })
        .then((e) => e.json())
        .then(x => { done(x); resetFiles() })
        .catch(() => done(undefined));
}
export const uploadImage = (files: FileList, hmsys: NetworkConnector, variantFrom?: string): Promise<responseType | undefined> => new Promise(done => {
    if (fileUp.value == "")
        fileUp.files = files;
    form.onsubmit = (event) => {
        event.preventDefault();
        fetchUploadFiles(fileUp, hmsys, form, done, variantFrom)
    };
    submit.click()
});

export const manualUploadImage = (onchange: (file: FileList | null) => void) => {
    fileUp.click()
    fileUp.onchange = () => onchange(fileUp.files)
};