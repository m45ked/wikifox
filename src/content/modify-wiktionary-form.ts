function modifySummary() {
    const element = document.querySelector("#wpSummary");
    if (!element)
        return;

    const style = (element as HTMLInputElement).style;
    style.fontFamily = 'Consolas,"Lucida Console",monospace';
    style.fontSize = '10px';
}

modifySummary();