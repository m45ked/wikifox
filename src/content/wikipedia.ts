import { ReferenceInfo } from "./types";

browser.runtime.onMessage.addListener((_message, _sender, _sendResponse) => {
    if (_message.action === "getReferenceInfo") {
        const tag = document.body.getElementsByClassName("mw-page-title-main");
        let ri: ReferenceInfo = { title: "", oldid: "" };
        if (tag.length == 0)
            _sendResponse(ri);
        const param = new URL(tag[0].baseURI).searchParams.get("oldid");
        if (param != null)
        {
            ri.oldid = param;
            ri.title = tag[0].textContent;
            _sendResponse(ri);
        }
    }

    return true;
});