import { Dialog, span } from "@lucsoft/webgen";
import { hmsys } from "./views/dashboard";

export const deleteDialog = Dialog<string>(({ use }) => use(span('Deleteing this File will be gone forever. (which is a very long time)')))
    .setTitle("Are you sure?")
    .allowUserClose()
    .addButton("close", "close")
    .addButton("Delete", () => {
        hmsys.api.trigger("@HomeSYS/DataStoreDB", { type: "removeFile", id: deleteDialog.unsafeViewOptions().state })
        return "close";
    });
