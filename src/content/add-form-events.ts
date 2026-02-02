const _summarySelector = (): HTMLInputElement => {
    const summary = document.querySelector("#wpSummary");
    if (!summary)
        throw new Error("no summary node");

    return (summary as HTMLInputElement);
};

const connect = (node: HTMLParagraphElement): void => {
    const m = node.querySelector('textarea');
    if (!m)
        return;

    const tae = (m as HTMLTextAreaElement);
    tae.addEventListener('blur', () => { _onBlur(); });
    tae.addEventListener('paste',
        (e: ClipboardEvent) => { _onPaste(e.clipboardData); });
    ran = true;
}

function _onBlur(): void {
    const summary = _summarySelector();
    const r = /([\]]{2}), ([\[]+w(?:\:[\w]{2,3}|)\:[^\]]+\]\])\s*$/
    summary.value = summary.value.replace(r, "$1 i $2");
}

function getLang(text: string): string {
    const langRegex = /\|język=(\w+)\|/;
    const m = text.match(langRegex);
    if (!m)
        return '';
    return `:${m[1]}`
}

function getItem(text: string): string {
    const itemRegex = /\|hasło=(.+)\|/;
    const m = text.match(itemRegex);
    if (m)
        return `:${m[1]}`;
    return '';
}

function _onPaste(data: DataTransfer | null): void {
    if (!data)
        return;
    const text = data.getData('text');
    const item = getItem(text);
    if (item.length === 0)
        return;

    const summary = _summarySelector();
    let value = summary.value;
    const lang = getLang(text);

    if (value.match(`[\[]Szablon\:zWikiprojektu\|.+[\]]{2}`)) {
        value += `, [[w${lang}${item}]]`;
    }
    else { value += `[[Szablon:zWikiprojektu]] do [[w${lang}${item}]]`; }
    summary.value = value;
}

let ran = false;
const observer = new MutationObserver((): void => {
    if (ran)
        return;
    const selector = 'div > div > fieldset > p > div.subsection_extra.active';
    const nodes = document.body.querySelectorAll(selector);
    if (nodes.length == 3)
        connect(nodes.item(2).parentNode as HTMLParagraphElement);
});
observer.observe(document.body, { childList: true, subtree: true });
