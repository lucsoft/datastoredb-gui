import { createLocalStorageProvider, NetworkConnector } from '@lucsoft/network-connector';
import { cards, WebGen } from '@lucsoft/webgen';
import { renderHomeBar } from './components/homebar';
import { renderIconlist } from './components/iconlist';
import { refreshIcons } from './data/RefreshData';
// import { genform } from './upload';

export function renderMain(web: WebGen)
{
    const list = document.createElement('div')
    list.classList.add('image-list')
    const elements = web.elements.body({ maxWidth: '75rem' })
    renderHomeBar(elements)
    elements.custom({ element: list })
    //TODO LOGIN WINDOW
    const authStore = createLocalStorageProvider(async () => new Promise(() => { }));

    // elements.custom({
    //     element: genform(authStore.getReloginDetails()!)
    // })
    renderIconlist(list)
    const hmsys = new NetworkConnector('eu01.hmsys.de:444')
    if (navigator.onLine)
    {
        hmsys.connect(authStore).then(async _ =>
        {
            const profileData: any = await hmsys.api.requestUserData("services")
            if (profileData.services.DataStoreDB == undefined)
            {
                elements.cards({}, cards.noteCard({
                    title: 'DataStoreDB is not setup for this account',
                    icon: '⛔'
                }))
                return;
            }
            if (profileData.services.DataStoreDB.upload != true)
            {
                elements.cards({}, cards.noteCard({
                    title: 'Uploading with this account is disabled',
                    icon: '🚦'
                }))
            }
            refreshIcons(hmsys)
                .then(() => renderIconlist(list))

        })
    }

}
