import { RenderingXResult } from "@lucsoft/webgen";
export type UploadWizardData = {
    files: FileList,
    icon: string,
    name: string,
    tags: string[],
    editTags: boolean,
} | {
    files: FileList
    icon: undefined,
    name: undefined,
    tags: undefined,
    editTags: undefined
}
export type UploadWizard = {
    data: RenderingXResult<UploadWizardData>,
    handleAuto: (files: FileList) => void,
    dialog: {
        open: () => void;
    }
}