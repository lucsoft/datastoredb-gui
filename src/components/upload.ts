import type { NetworkConnector } from '@lucsoft/network-connector';

const form = document.createElement('form');
const fileUp = document.createElement('input');
fileUp.type = "file";
fileUp.name = "userfile";
fileUp.multiple = true;

const submit = document.createElement('input');
submit.value = "test";
submit.type = "submit";
form.append(fileUp, submit);
form.hidden = true;
document.body.append(form)

const fetchUploadFiles = (fileUp: HTMLInputElement, hmsys: NetworkConnector, form: HTMLFormElement, done: (data?: undefined) => void) => {
    if (fileUp.value == "")
        return done();
    const data = new FormData(form);
    const auth = hmsys.getAuth()!
    fetch('https://eu01.hmsys.de:444/api/@HomeSYS/DataStoreDB/file', {
        method: 'POST',
        headers: new Headers({
            'Authorization': 'Basic ' + btoa(`${auth.id}:${auth.token}`),
        }),
        body: data
    }).then(() => done());
}
export const uploadImage = (files: FileList, hmsys: NetworkConnector) => new Promise(done => {

    fileUp.files = files;
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        fetchUploadFiles(fileUp, hmsys, form, done)
    });
    submit.click()
});

export const manualUploadImage = (hmsys: NetworkConnector): Promise<undefined> => new Promise((done) => {
    fileUp.click()
    fileUp.onchange = () => fetchUploadFiles(fileUp, hmsys, form, done)
});