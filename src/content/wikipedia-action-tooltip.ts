import { showTooltip } from "../utils/tooltip";

browser.runtime.onMessage.addListener((_message, _sender, _sendResponse) => {
    if (_message.action === "wikifox://utils/tooltip")
        showTooltip(_message.msg);

    return true;
});