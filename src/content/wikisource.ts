import { ContextType } from './types';

console.log("🎯 CONTENT SCRIPT LOADED on:", window.location.href,
    "at:", new Date().toISOString());

function _getElementText(id: string): string {
    const node = document.getElementById(`ws-${id}`);
    if (!node)
        return "";
    return node.textContent;
};

browser.runtime.onMessage.addListener((_message, _sender, _sendResponse) => {
    if (_message.action === "getSourceData") {
        const _pageData: ContextType = {
            author: _getElementText("author"),
            title: _getElementText("title"),
            publisher: _getElementText("publisher"),
            year: _getElementText("year"),
            place: _getElementText("place")
        };
        _sendResponse(_pageData);
    }

    return true;
});
