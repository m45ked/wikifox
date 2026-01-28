import { ReferenceInfo } from "./types";

function _getGroupFromString(s: string, r: RegExp) : string {
    const groups = s.match(r);
    if (!groups)
        return "";

    return decodeURI(groups[1].replace("_", " "));
}

browser.runtime.onMessage.addListener((_message, _sender, _sendResponse) => {
    if (_message.action === "getReferenceInfo") {
        
        const elem = document.getElementById("t-permalink");
        if (!elem)
            return true;
        const url = (elem.children.item(0) as HTMLAnchorElement).href;
        const ri: ReferenceInfo = {
            title: _getGroupFromString(url, /title=([a-żA-Ż0-9_%\(\)]+)/),
            oldid: _getGroupFromString(url, /oldid=(\d+)/)
        };
        _sendResponse(ri);
    }

    return true;
});