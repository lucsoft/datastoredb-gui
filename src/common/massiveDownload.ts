import { BlobReader, BlobWriter, Entry, ZipReader } from "@zip.js/zip.js";
import { apiPath } from "./api";
import { createChunks } from "./arrayCompare";

function hexToBase64(str: any) {
    return btoa(String.fromCharCode.apply(null,
        str.replace(/\r|\n/g, "").replace(/([\da-fA-F]{2}) ?/g, "0x$1 ").replace(/ +$/, "").split(" "))
    );
}

export const massiveDownload = (globalIds: string[]): Promise<[ id: string, data: Blob ][][]> =>
    Promise.all(createChunks(globalIds, 450).map((x: string[]) => new Promise((done) => fetch(apiPath() + 'file/mass', {
        method: 'GET',
        headers: {
            ids: x.map(x => hexToBase64(x)).join(' ')
        }
    })
        .then((e) => e.blob())
        .then(e => (new ZipReader(new BlobReader(e))).getEntries())
        .then(async (e: Entry[]) => {
            done(await Promise.all(e.map(async (x): Promise<[ id: string, data: Blob ]> => [ x.filename, await x.getData!(new BlobWriter()) ])))
        }))));
