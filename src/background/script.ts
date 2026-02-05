import { ContextType, ReferenceInfo } from "../content/types";

type bmOnClickData = browser.menus.OnClickData;

function getTranslation(itemId: string, substitutions?: any): string {
    return browser.i18n.getMessage(itemId, substitutions);
}

function onCreated(): void {
    const error = browser.runtime.lastError;
    if (error) {
        console.debug(`Error: ${error}`);
    } else {
        console.debug("Item created successfully")
    }
}

async function _formatSource(context: ContextType): Promise<string> {
    const setting = await browser.storage.local.get('italicTitle');
    const title = setting['italicTitle'] === true ? `''${context.title}''` : `${context.title}`

    return `<ref>{{źródło|dostęp=otwarty|autor=${context.author}|`
        + `tytuł=${title}|rok=${context.year}|miejsce=${context.place}|`
        + `wydawnictwo=${context.publisher}}}</ref>`;
}

function _safeCall(callable: () => void): boolean {
    try {
        callable();
        return true;
    } catch (error) {
        console.debug("Error: ", error);
        return false;
    }
}

function openNewTab(query: string, host: string): void {
    _safeCall((): void => {
        if (!query)
            return;

        const url = new URL(`https://www.${host}.com/search`);
        url.searchParams.append("q", `"${query}" -ai`);
        browser.tabs.create({ url: url.toString() });
    });
}

async function _searchExactlyDdg(_info: bmOnClickData, _tabId: number): Promise<void> {
    openNewTab(_info.selectionText || "", "duckduckgo");
}

async function _searchExactlyGoogle(_info: bmOnClickData, _tabId: number): Promise<void> {
    openNewTab(_info.selectionText || "", "google");
}


const copyToClipboard = async (text: string): Promise<boolean> => {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (error) {
        return false;
    }
};

async function _copyAsWikitext(_info: bmOnClickData, _tabId: number): Promise<void> {
    _safeCall(async (): Promise<void> => {
        const matches = _info.selectionText?.matchAll(/([a-żA-Ż\-]+)/g);
        if (!matches)
            return;

        let result = "";
        for (const match of matches) {
            result += `[[${match[1]}]] `;
        }

        result = result.substring(0, result.length - 1);
        const url = await getUrlFromTab(_tabId);
        result += await getReferenceInfo(_tabId, _getLanguageFromUrl(url));

        if (_info.selectionText?.charAt(_info.selectionText.length) == '.')
            result += ".";

        const r = await copyToClipboard(result);
        if (r)
            _sendGetSourceMessage(_tabId, "wikifox://utils/tooltip");
    });
}

const defaultLanguageCode = "pl";

function _getLanguageFromUrl(url: string): string {
    const idx = url.indexOf('.');
    if (!idx)
        return defaultLanguageCode;
    const language = url.substring(8, idx);
    if (!language)
        return defaultLanguageCode;
    return language;
}

async function getReferenceInfo(tabId: number, language: string): Promise<string> {
    const response: ReferenceInfo = await _sendGetSourceMessage(tabId, "wikifox://content/getReferenceInfo");
    const languagePart = language === defaultLanguageCode ? "" : `|język=${language}`;
    return `<ref>{{zWikiprojektu${languagePart}|hasło=${response.title}|oldid=${response.oldid}}}</ref>`;
}

async function getUrlFromTab(tabId: number): Promise<string> {
    return (await browser.tabs.get(tabId)).url || "";
}

async function _copyReferenceInfo(_info: bmOnClickData, _tabId: number): Promise<void> {
    _safeCall(async (): Promise<void> => {
        const url = await getUrlFromTab(_tabId);
        const copyResult = await copyToClipboard(
            await getReferenceInfo(_tabId, _getLanguageFromUrl(url)));
        if (copyResult)
            _sendShowTooltipMessage("Skopiowano do schowka", _tabId);
    });
}

async function _sendShowTooltipMessage(msg: string, _tabId: number): Promise<void> {
    return await browser.tabs.sendMessage(_tabId, {
        action: "wikifox://utils/tooltip",
        "msg": msg
    });
}

async function _sendGetSourceMessage(_tabId: number, _actionId: string): Promise<any> {
    return await browser.tabs.sendMessage(_tabId, {
        action: _actionId,
        options: {
            includeHtml: true,
            includeImages: false
        }
    });
}

async function _composeSource(_info: bmOnClickData, _tabId: number): Promise<void> {
    _safeCall(async (): Promise<void> => {
        const response: ContextType = await _sendGetSourceMessage(_tabId, "getSourceData");
        const fmtResponse = await _formatSource(response);
        if (await copyToClipboard(fmtResponse))
            _sendShowTooltipMessage("Skopiowano do schowka", _tabId);
    });
}

browser.menus.onClicked.addListener(async function (_info, _tab): Promise<void> {
    if (_info.menuItemId !== 'compose-source' || !_tab?.id)
        return;

    _composeSource(_info, _tab.id);
})

interface Action {
    id: string;
    title: string;
    callback: (info: bmOnClickData, tabId: number) => void;
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
    },
    {
        host: "wikipedia.org",
        actions: [
            {
                id: "copy-reference-info",
                title: getTranslation("menuItemCopyReferenceInfo"),
                callback: _copyReferenceInfo,
                contexts: ["page", "selection"]
            },
            {
                id: "copy-as-wikitext",
                title: getTranslation("menuItemCopyAsWikitext"),
                callback: _copyAsWikitext,
                contexts: ["selection"]
            }
        ]
    }
];

const activeMenus: string[] = [];

interface ChangeInfo {
    url: string | undefined;
};

browser.tabs.onUpdated.addListener(async (_tabId, _changeInfo): Promise<void> => {
    if (_changeInfo.status === 'complete') {
        const url = await getUrlFromTab(_tabId);
        _updateMenuForTab(_tabId, { url: url });
    }
});
browser.tabs.onActivated.addListener(async (_info): Promise<void> => {
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

async function _clearCustomMenuItems(): Promise<void> {
    const oldItems = activeMenus || [];

    for (const id of oldItems) {
        try {
            console.debug(`Deleting menu with id=${id}`);
            await browser.menus.remove(id);
        } catch (e) { }
    }

    activeMenus.length = 0;
}

browser.runtime.onMessage.addListener(async (_message, _sender, _sendResponse): Promise<boolean> => {
    if (_message.action === "wikifox://background/copyToClipboard") {
        const r = await copyToClipboard(_message.text);
        if (r)
            _sendResponse(0);
        else
            _sendResponse(1);
    }
    return true;
});