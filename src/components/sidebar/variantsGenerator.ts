import { custom, Dialog, Horizontal, img, span, Vertical } from "@lucsoft/webgen"
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
function imageSelectorComponent(update: (updateStateData: Partial<ImageGenList>) => void, imagelist: imageGen[], isDisabled: boolean, index: number, icon: imageGen) {
    const image = img(URL.createObjectURL(icon.image));

    const shell = custom("div", undefined, "gen-icon-shell", icon.selected ? 'selected' : 'normal');
    shell.append(image, span(icon.title));
    shell.onclick = () => {
        imagelist[ index ].selected = !icon.selected;
        update(isDisabled ? { disabled: imagelist } : { normal: imagelist })
    };
    return shell;
};

export const VariantsGeneratorDialog = Dialog<ImageGenList>(({ use, update, state }) => {
    use(Vertical({},
        span("Select Variants you wannt to generate and publish"),
        Horizontal({ align: "space-around" },
            Vertical({ classes: [ 'variants-generator' ] }, ...state.normal?.map((x, index) => imageSelectorComponent(update, state.normal ?? [], false, index, x)) ?? []),
            Vertical({ classes: [ 'variants-generator' ] }, ...state.disabled?.map((x, index) => imageSelectorComponent(update, state.disabled ?? [], true, index, x)) ?? [])
        )
    ))
})
    .setTitle("Variants Generator")
    .allowUserClose()
    .addButton("cancel", "close")
    .addButton("Generate", async (): Promise<undefined | "close"> => {
        const state = VariantsGeneratorDialog.unsafeViewOptions<ImageGenList>().state;
        const transfer = new DataTransfer();
        [ ...state.disabled!, ...state.normal! ].filter(x => x.selected).map(x => x.image!).forEach((x) => transfer.items.add(x))

        await uploadImage(transfer.files, hmsys, state.from?.id);
        emitEvent(DataStoreEvents.SidebarUpdate, undefined);
        return "close";
    })