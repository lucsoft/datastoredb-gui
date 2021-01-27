import type { ReloginData } from '@lucsoft/network-connector';

export function genform({ id, token }: ReloginData)
{

    const form = document.createElement('form');
    const fileUp = document.createElement('input');
    fileUp.type = "file";
    fileUp.name = "userfile";
    fileUp.multiple = true;
    fileUp.accept = ".png";
    const submit = document.createElement('input');
    submit.value = "test";
    submit.type = "submit";
    form.append(fileUp, submit);
    form.addEventListener('submit', (event) =>
    {
        event.preventDefault();
        if (fileUp.value == "")
            return;
        fetch('https://eu01.hmsys.de:444/api/@HomeSYS/DataStoreDB/file', {
            method: 'POST',
            headers: new Headers({
                'Authorization': 'Basic ' + btoa(`${id}:${token}`),
            }),
            body: new FormData(form)
        }).then(async (x) =>
        {
            console.log(await x.text());
        });

    });
    return form;
}