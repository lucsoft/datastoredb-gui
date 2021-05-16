import { DialogActionAfterSubmit, img, RenderingX, RenderingXResult, span } from "@lucsoft/webgen"
import { list } from "../list";
import '../../../res/css/generator.css';
import { uploadImage } from "../upload";
import { hmsys } from "../views/dashboard";
import { Icon } from "../../data/IconsCache";
import { DataStoreEvents, emitEvent } from "../../common/eventmanager";
export type imageGen = { selected: boolean, title: string, image?: File };
type ImageGenList = {
    from?: Icon;
    target?: Icon;
    normal: imageGen[];
    disabled: imageGen[];
};
export type VariantsGeneratorDialog = {
    data: RenderingXResult<ImageGenList>;
    dialog: {
        open: () => void;
        close: (autoRemove?: boolean | undefined) => void;
    };
};
function imageSelectorComponent(update: (updateStateData?: Partial<ImageGenList>) => void, imagelist: imageGen[], isDisabled: boolean, index: number, icon: imageGen) {
    const image = img(URL.createObjectURL(icon.image));

    const shell = list([
        image,
        span(icon.title)
    ], [ 'gen-icon-shell', icon.selected ? 'selected' : 'normal' ]);
    shell.onclick = () => {
        imagelist[ index ].selected = !icon.selected;
        update(isDisabled ? { disabled: imagelist } : { normal: imagelist })
    };
    return shell;
};

export function generateVariantsWizard(render: RenderingX) {
    const data = render.toCustom({}, { normal: [], disabled: [] } as ImageGenList, [
        span("Select Variants you wannt to generate and publish"),
        (data, update) => list(data.normal.map((x, index) => imageSelectorComponent(update, data.normal, false, index, x)), [ 'variants-generator' ]),
        (data, update) => list(data.disabled.map((x, index) => imageSelectorComponent(update, data.disabled, true, index, x)), [ 'variants-generator' ])
    ])

    const dialog = render.toDialog({
        title: 'Variants Generator',
        content: data,
        userRequestClose: () => DialogActionAfterSubmit.Close,
        buttons: [
            [ 'Cancel', DialogActionAfterSubmit.Close ],
            [ 'Generate', async () => {
                const state = data.getState();
                const transfer = new DataTransfer();
                [ ...state.disabled, ...state.normal ].filter(x => x.selected).map(x => x.image!).forEach((x) => transfer.items.add(x))

                await uploadImage(transfer.files, hmsys, state.from?.id);
                emitEvent(DataStoreEvents.SidebarUpdate, undefined);
                return DialogActionAfterSubmit.Close;
            } ]
        ]
    })

    return {
        data,
        dialog
    }
}