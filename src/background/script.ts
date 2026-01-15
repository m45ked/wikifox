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
    console.log("Funkcja copyToClipboard wywołana z tekstem długości:", text.length);
    
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
        console.log(`Got response: ${response} and formateted as: ${fmtResponse}`);
        const copyResult = _copyToClipboard(fmtResponse);

        if (copyResult)
        {
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

browser.menus.create({
    id: "compose-source",
    title: browser.i18n.getMessage("menuItemComposeSource"),
    contexts: ["page"]
}, onCreated);

browser.menus.onClicked.addListener(async function (_info, _tab) {
    if (_info.menuItemId !== 'compose-source' || !_tab?.id)
        return;

    _composeSource(_info, _tab.id);
})