import type { NetworkConnector } from '@lucsoft/network-connector';

export const uploadImage = (files: FileList, hmsys: NetworkConnector) => new Promise(done =>
{
    const form = document.createElement('form');
    const fileUp = document.createElement('input');
    fileUp.type = "file";
    fileUp.name = "userfile";
    fileUp.multiple = true;
    fileUp.accept = ".png";
    fileUp.files = files;
    const submit = document.createElement('input');
    submit.value = "test";
    submit.type = "submit";
    form.append(fileUp, submit);
    const auth = hmsys.getAuth()!
    form.addEventListener('submit', (event) =>
    {
        event.preventDefault();
        const data = new FormData(form);
        form.remove()
        if (fileUp.value == "")
            return done(undefined);
        fetch('https://eu01.hmsys.de:444/api/@HomeSYS/DataStoreDB/file', {
            method: 'POST',
            headers: new Headers({
                'Authorization': 'Basic ' + btoa(`${auth.id}:${auth.token}`),
            }),
            body: data
        }).then(() => done(undefined));
    });
    form.hidden = true;
    document.body.append(form)
    submit.click()
});