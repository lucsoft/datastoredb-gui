import { Color, Dialog, span, Vertical } from "@lucsoft/webgen";
import { PandaIcon } from "./pandaIcon";
import { hmsys } from "./views/dashboard";


export const deleteDialog = Dialog<{ id: string }>(({ use }) => use(span('Deleteing this File will be gone forever. (which is a very long time)')))
    .setTitle("Are you sure?")
    .allowUserClose()
    .addButton("close", "close")
    .addButton("Delete", () => {
        hmsys.api.trigger("@HomeSYS/DataStoreDB", { type: "removeFile", id: deleteDialog.unsafeViewOptions<{ id: string }>().state.id })
        return "close";
    }, Color.Critical);

export const dropFilesHere = Dialog(({ use }) => use(Vertical({},
    PandaIcon(),
    span("Drop your files Here!", "dropfilestitle"))
))
    .addClass("dialog-dropfiles")
