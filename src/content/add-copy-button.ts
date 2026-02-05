import { showTooltip } from "../utils/tooltip";

function createButton(selector: () => HTMLElement): HTMLElement {
    const button = document.createElement('button');
    button.type = "button";
    button.disabled = false;
    button.textContent = 'Skopiuj';
    button.formMethod = 'post';
    button.classList.add('wikifox-ui-button');
    button.id = `btn-${Date.now()}`;
    button.addEventListener('click', (e: MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const n = selector();

        navigator.clipboard.writeText(n.innerText)
            .then(() => { showTooltip('Skoiowano') });
    });
    button.style.cssText = `
        padding: 5px 1px;
        background: #a0b0c0;
        border: none;
        border-radius: 6px;
        font-size: 14px;
        cursor: pointer;
        transition: all 0.3s ease;
        box-shadow: 0 4px 6px rgba(50, 50, 93, 0.11);
    `;
    return button;
}

function _addButton(node: Element): void {
    const selectItalic = (): HTMLElement => {
        const n = node.querySelector("i");
        if (!n) throw Error("dups");
        else
            return n;
    };
    const firstElement = node.childNodes.item(0);
    node.insertBefore(createButton(selectItalic), firstElement);

    const selectSup = (): HTMLElement | null => { return node.querySelector("sup"); };
    const supNode = selectSup();
    const hasReference = supNode !== null;
    const checkbox = document.createElement('input') as HTMLInputElement;
    checkbox.type = 'checkbox';
    checkbox.disabled = true;
    checkbox.classList += 'wikifox-ui-checkbox';
    checkbox.checked = hasReference;
    checkbox.title = hasReference
        ? browser.i18n.getMessage('hasReference')
        : browser.i18n.getMessage('hasNotReference');
    checkbox.style.display = "inline";
    checkbox.style.margin = "10px";

    node.insertBefore(checkbox, firstElement);
}

function addExampleAddons(): void {
    if (document.querySelector('button.wikifox-ui-button'))
        return;

    document.querySelectorAll('dd.fldt-przyklady').forEach(
        (e) => { _addButton(e); })
}

const observer = new MutationObserver((): void => { addExampleAddons(); });
observer.observe(document.body, { childList: true, subtree: true });