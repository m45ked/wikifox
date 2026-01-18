import { ContextType } from "../content/types";

function getTranslation(itemId: string, substitutions? :any): string {
    return browser.i18n.getMessage(itemId, substitutions);
}

function onCreated() {
    const error = browser.runtime.lastError;
    if (error) {
        console.debug(`Error: ${error}`);
    } else {
        console.debug("Item created successfully")
    }
}

function _formatSource(context: ContextType): string {
    return `<ref>{{źródło|dostęp=otwarty|autor=${context.author}|`
        + `tytuł=${context.title}|rok=${context.year}|miejsce=${context.place}|`
        + `wydawnictwo=${context.publisher}}}</ref>`;
}

interface Callable {
    call: () => void;
};

function _safeCall(callable: Callable): boolean {
    try {
        callable.call();
    } catch (error) {
        console.debug("Error: ", error);
        return false;
    }

    return true;
}

function _copyToClipboard(text: string): boolean {
    return _safeCall({
        call: () => {
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.left = '-9999px';
            document.body.appendChild(textarea);
            textarea.select();

            const success = document.execCommand('copy');
            document.body.removeChild(textarea);

            if (!success)
                throw new Error("Error while copying content");
        }
    });
}

function openNewTab(query: string, host: string) {
    _safeCall({
        call: () => {
            if (!query)
                return;

            const encodedQuery = encodeURIComponent(`"${query}"`);
            const searchUrl = `https://www.${host}.com/search?q=${encodedQuery}`;
            browser.tabs.create({
                url: searchUrl
            });
        }
    });
}

async function _searchExactlyDdg(_info: browser.menus.OnClickData, _tabId: number) {
    openNewTab(_info.selectionText || "", "duckduckgo");
}

async function _searchExactlyGoogle(_info: browser.menus.OnClickData, _tabId: number) {
    openNewTab(_info.selectionText || "", "google");
}

async function _sendMessage(_tabId: number, _actionId: string): Promise<any> {
    return await browser.tabs.sendMessage(_tabId, {
        action: _actionId,
        options: {
            includeHtml: true,
            includeImages: false
        }
    });
}

async function _composeSource(_info: browser.menus.OnClickData, _tabId: number) {
    _safeCall({
        call: async () => {
            const response: ContextType = await _sendMessage(_tabId, "getSourceData");
            const fmtResponse = _formatSource(response);
            const copyResult = _copyToClipboard(fmtResponse);

            if (copyResult) {

                browser.notifications.create({
                    type: "basic",
                    title: browser.i18n.getMessage("notificationTitle"),
                    message: browser.i18n.getMessage("notificationMessage")
                });
            } else {
                console.debug(`Error during copy`);
            }
        }
    });
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
                title: getTranslation("menuItemComposeSource"),
                callback: _composeSource,
                contexts: ["page"]
            }
        ]
    },
    {
        host: "wiktionary",
        actions: [
            {
                id: "search-exactly-Google",
                title: getTranslation("menuItemSearchExactly", "Google"),
                callback: _searchExactlyGoogle,
                contexts: ["selection"]
            },
            {
                id: "search-exactly-Ddg",
                title: getTranslation("menuItemSearchExactly", "duckduckgo"),
                callback: _searchExactlyDdg,
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
    await _clearCustomMenuItems();

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

async function _clearCustomMenuItems() {
    const oldItems = activeMenus || [];

    for (const id of oldItems) {
        try {
            console.debug(`Deleting menu with id=${id}`);
            await browser.menus.remove(id);
        } catch (e) { }
    }

    activeMenus.length = 0;
}
