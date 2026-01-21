class OptionsPage {
    private form: HTMLFormElement;

    private readonly italicTitleName = 'italicTitle';

    constructor() {
        this.form = document.getElementById('settings-form') as HTMLFormElement;

        this.init();
    }

    async init(): Promise<void> {
        const f = await browser.storage.local.get(this.italicTitleName);
        this.populateForm(f[this.italicTitleName]);

        this.form.addEventListener('change', (e) => this.handleChange(e));
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    private async populateForm(italicTitle: boolean): Promise<void> {
        const elem = this.form.querySelector(`#${this.italicTitleName}`);
        if (!elem)
            return;
        const e = elem as HTMLInputElement;
        e.checked = italicTitle;
    }

    private async handleChange(event: Event): Promise<void> {
        const target = event.target as HTMLInputElement;

        if (!target.name && !target.id) return;

        const value = target.checked;
        await browser.storage.local.set({ key: value });
    }

    private async handleSubmit(event: Event): Promise<void> {
        event.preventDefault();

        const formData = new FormData(this.form);
        const value = formData.get(this.italicTitleName);
        await browser.storage.local.set({ 'italicTitle': value === 'on' });
        this.showMessage(browser.i18n.getMessage("settingsSaved"), 'success');
    }

    private showMessage(text: string, type: 'success' | 'error' | 'info'): void {
        const message = document.createElement('div');
        message.className = `message message-${type}`;
        message.textContent = text;

        this.form.prepend(message);
        setTimeout(() => message.remove(), 3000);
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    const p = new OptionsPage();
});