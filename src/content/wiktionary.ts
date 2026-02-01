import { showTooltip } from "../utils/tooltip";

function _addButton(node: Element): void {
    const button = document.createElement(`button`);
    button.type = "button";
    button.disabled = false;
    button.textContent = 'Skopiuj';
    button.formMethod = 'post';
    button.id = `btn-${Date.now()}`;
    button.addEventListener('click', async (e: MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        
        const n = node.querySelector("i");
        if (!n)
            return;
        await navigator.clipboard.writeText(n.innerText);
        showTooltip("Skopiowano");
    });
    button.style.cssText = `
        padding: 5px 10px;
        background: #a0b0c0;
        border: none;
        border-radius: 6px;
        font-size: 14px;
        cursor: pointer;
        transition: all 0.3s ease;
        box-shadow: 0 4px 6px rgba(50, 50, 93, 0.11);
    `;
    node.insertBefore(button, node.childNodes.item(0));
}

let ran = false;
const observer = new MutationObserver((): void => {
    if (ran)
        return;

    const noweElementy = document.querySelectorAll('dd.fldt-przyklady');
    if (noweElementy.length === 0)
        return;
    noweElementy.forEach((e) => { _addButton(e); })
    ran = true;
});
observer.observe(document.body, { childList: true, subtree: true });
