export function showTooltip(message: string, duration: number = 3000) {
    // Utwórz element dymka
    const tooltip = document.createElement('div');
    tooltip.textContent = message;
    tooltip.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #0f0;
        color: black;
        padding: 12px 20px;
        border-radius: 6px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        font-family: sans-serif;
        font-size: 14px;
        transition: opacity 0.3s ease;
        opacity: 1;
    `;

    // Dodaj dymek do strony
    document.body.appendChild(tooltip);

    // Ustaw automatyczne zniknięcie po zadanym czasie
    setTimeout(() => {
        tooltip.style.opacity = '0';
        // Usuń element z DOM po zakończeniu animacji
        setTimeout(() => {
            if (tooltip.parentNode) {
                tooltip.parentNode.removeChild(tooltip);
            }
        }, 300);
    }, duration);
}

browser.runtime.onMessage.addListener((_message, _sender, _sendResponse) => {
    if (_message.action === "showTooltip")
        showTooltip(_message.msg);

    return true;
});