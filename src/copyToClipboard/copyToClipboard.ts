import { isHtmlElement } from "@root/isHtmlElement";



const fallback = (text: string) => {
    const previousFocusElement = document.activeElement;
    const textArea = document.createElement('textarea');

    textArea.value = text;
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.position = 'fixed';
    textArea.style.visibility = 'hidden';

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    console.log(document);
    document.execCommand('copy');
    document.body.removeChild(textArea);

    if (isHtmlElement(previousFocusElement)) {
        previousFocusElement.focus();
    }
};

export const copyToClipboard = (text: string) => {
    if (!navigator.clipboard) return fallback(text);

    navigator.clipboard.writeText(text).catch(() => fallback(text));
};