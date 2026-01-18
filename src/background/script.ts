import { ContextType } from "../content/types";

function onCreated() {
    const error = browser.runtime.lastError;
    if (error) {
        console.log(`Error: ${error}`);
    } else {
        console.log("Item created successfully")
    }
}

function _formatSource(context: ContextType): string {
    return `<ref>{{źródło|dostęp=otwarty|autor=${context.author}|`
        + `tytuł=${context.title}|rok=${context.year}|miejsce=${context.place}|`
        + `wydawnictwo=${context.publisher}}}</ref>`;
}

function _copyToClipboard(text: string): boolean {
    try {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.select();

        const success = document.execCommand('copy');
        document.body.removeChild(textarea);

        console.log("Wynik execCommand('copy'):", success);
        return success;
    } catch (error) {
        console.error("Błąd w copyToClipboard:", error);
        return false;
    }
}

async function _searchExactly(_info: browser.menus.OnClickData, _tabId: number) {
    try {
        const queryText = _info.selectionText || "";
        if (queryText) {
            const encodedQuery = encodeURIComponent(`"${queryText}"`);
            const searchUrl = `https://www.google.com/search?q=${encodedQuery}`;
            browser.tabs.create({
                url: searchUrl
            });
        }
    } catch (error) {
        console.log(`Error: ${error}`);
        throw error;
    }
}

async function _composeSource(_info: browser.menus.OnClickData, _tabId: number) {
    try {
        const response: ContextType = await browser.tabs.sendMessage(_tabId, {
            action: "getSourceData",
            options: {
                includeHtml: true,
                includeImages: false
            }
        });

        const fmtResponse: string = _formatSource(response);
        const copyResult = _copyToClipboard(fmtResponse);

        if (copyResult) {
            browser.notifications.create({
                type: "basic",
                title: browser.i18n.getMessage("notificationTitle"),
                message: browser.i18n.getMessage("notificationMessage")
            });
        } else {
            console.log(`Error during copy`);
        }
    } catch (error) {
        console.log(`Error: ${error}`);
        throw error;
    }
}

browser.menus.onClicked.addListener(async function (_info, _tab) {
    if (_info.menuItemId !== 'compose-source' || !_tab?.id)
        return;

    _composeSource(_info, _tab.id);
})

interface Action {
    id: string;
    title: string;
    callback: (info: browser.menus.OnClickData, tabId: number) => void;
    contexts: browser.menus.ContextType[];
};

interface HostData {
    host: string;
    actions: Action[];
}

const extensionMenuItems: HostData[] = [
    {
        host: "wikisource",
        actions: [
            {
                id: "compose-source",
                title: browser.i18n.getMessage("menuItemComposeSource"),
                callback: _composeSource,
                contexts: ["page"]
            }
        ]
    },
    {
        host: "wiktionary",
        actions: [
            {
                id: "search-exactly",
                title: browser.i18n.getMessage("menuItemSearchExactly"),
                callback: _searchExactly,
                contexts: ["selection"]
            }
        ]
    }
];

const activeMenus: string[] = [];

interface ChangeInfo {
    url: string | undefined;
};

browser.tabs.onUpdated.addListener(async (_tabId, _changeInfo) => {
    if (_changeInfo.status === 'complete') {
        const tab = await browser.tabs.get(_tabId);
        if (!tab.url)
            return;
        _updateMenuForTab(_tabId, { url: tab.url });
    }
});
browser.tabs.onActivated.addListener(async (_info) => {
    const tab = await browser.tabs.get(_info.tabId);
    _updateMenuForTab(_info.tabId, { url: tab.url });
});


async function _updateMenuForTab(_tabId: number, _changeInfo: ChangeInfo): Promise<void> {
    const url = _changeInfo.url;
    const oldItems = activeMenus || [];

    for (const id of oldItems) {
        try {
            console.log(`Deleting menu with id=${id}`);
            await browser.menus.remove(id);
        } catch (e) { }
    }

    activeMenus.length = 0;

    if (!url)
        return;

    for (const item of extensionMenuItems) {
        if (url.includes(item.host)) {
            for (const action of item.actions) {
                const fullId = `tab-${_tabId}-${action.id}`;
                browser.menus.create({
                    id: fullId,
                    title: action.title,
                    contexts: action.contexts,
                    onclick: (_info, _tab) => action.callback(_info, _tabId)
                }, onCreated);
                activeMenus.push(fullId);
            }
        }
    }
}
